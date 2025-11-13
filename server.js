import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
// import helmet from "helmet";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import User from "./models/User.js";
import passwordModifRoutes from "./routes/passwordModifRoutes.js";



// Initialisation en local
dotenv.config();
connectDB();

async function ensureAdminAccount() {
    try {
        const existingAdmin = await User.findOne({ login: process.env.KDM_ADMIN });
        if (!existingAdmin) {

            await User.create({
                login: process.env.KDM_ADMIN,
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

// Middleware CORS
app.use(cors(options));

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/devis", devisRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/passwordModif", passwordModifRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("API serveur Express opérationnelle !");
});

// Lancement local uniquement
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Serveur local sur http://localhost:${PORT}`));
}

// Export pour Vercel
export default app;
