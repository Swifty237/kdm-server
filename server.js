const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
// cot =ort helmet require() "helmet";
const connectDB = require("./config/db.js");
const contactRoutes = require("./routes/contactRoutes.js");
const devisRoutes = require("./routes/devisRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const registerRoutes = require("./routes/registerRoutes.js");
const User = require("./models/User.js");
const passwordModifRoutes = require("./routes/passwordModifRoutes.js");
const usersRoutes = require("./routes/usersRoutes.js");
const counterRoutes = require("./routes/counterRoutes.js");
const notifRoutes = require("./routes/notifRoutes.js");
const axios = require('axios');
// const path = require('path');


// Initialisation en local
dotenv.config();
connectDB();

async function ensureAdminAccount() {
    try {
        const existingAdmin = await User.findOne({ login: process.env.KDM_ADMIN });
        if (!existingAdmin) {

            await User.create({
                userName: process.env.KDM_ADMIN,
                userFirstname: '',
                email: '',
                password: process.env.PASSWORD,
            });

            console.log("Compte admin créé automatiquement !");
        } else {
            console.log("Compte admin déjà existant");
        }
    } catch (err) {
        console.error("Erreur lors de la création du compte admin :", err);
    }
}

ensureAdminAccount();

const app = express();
app.use(bodyParser.json());

// app.use(helmet());
// Définis les origines autorisées

const allowedOrigins = [
    process.env.KDM_PROJECT_FRONT_URI, // front site pour les clients
    process.env.KDM_GESTION_FRONT_URI, // front pour la gestion
];

const options = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    preflightContinue: false
};

console.log("CORS allowedOrigins:", allowedOrigins);

// Middleware CORS
app.use(cors(options));

// Route proxy Google Maps - accepte avec ou sans slash final
app.get(['/api/google-maps/distance', '/api/google-maps/distance/'], async (req, res) => {
    console.log('📍 [Google Maps Proxy] Requête reçue:', req.query);

    try {
        const { origin, destination } = req.query;

        // Vérification des paramètres
        if (!origin || !destination) {
            console.error('❌ Paramètres manquants:', { origin, destination });
            return res.status(400).json({
                error: 'Les paramètres origin et destination sont requis'
            });
        }

        // Récupération de la clé API depuis les variables d'environnement
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error('❌ Clé API Google Maps manquante');
            return res.status(500).json({
                error: 'Configuration Google Maps manquante sur le serveur'
            });
        }

        console.log('📡 Appel à Google Maps API...');

        // Appel à l'API Google Maps
        // const axios = require('axios');
        const googleUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
        const response = await axios.get(googleUrl, {
            params: {
                origins: origin,
                destinations: destination,
                key: apiKey,
                units: 'metric'
            },
            timeout: 5000
        });

        console.log('✅ Réponse reçue de Google Maps');
        res.json(response.data);

    } catch (error) {
        console.error('❌ Erreur proxy Google Maps:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        res.status(500).json({
            error: 'Erreur lors du calcul de distance',
            details: error.message
        });
    }
});

// Routes
app.use("/api/next-number", counterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/devis", devisRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/passwordModif", passwordModifRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/new-devis", notifRoutes);

// Servir les fichiers uploadés
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get("/", (req, res) => {
    res.send("API serveur Express opérationnelle !");
});

// Lancement local uniquement
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Serveur local sur http://localhost:${PORT}`));
}

// Log pour Lambda
console.log("🚀 Lambda handler prêt à l'emploi");

// Export pour Vercel
module.exports = app;
