// Au début du fichier, après les imports
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import User from "./models/User.js";
import passwordModifRoutes from "./routes/passwordModifRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import counterRoutes from "./routes/counterRoutes.js";
import notifRoutes from "./routes/notifRoutes.js";

console.log('🔥🔥🔥 APP.JS EST CHARGÉ 🔥🔥🔥');
console.log('🔥 Routes disponibles:');
console.log('🔥 - /api/contact');
console.log('🔥 - /api/devis');
console.log('🔥 - /api/auth');
console.log('🔥 - /api/register');
console.log('🔥 - /api/passwordModif');
console.log('🔥 - /api/users');
console.log('🔥 - /api/new-devis');

// Configuration dotenv
dotenv.config();

// Connexion à MongoDB
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

// CE MIDDLEWARE DOIT ÊTRE LE TOUT PREMIER
app.use((req, res, next) => {
    console.log('🔥🔥🔥 MIDDLEWARE RACINE APPELLÉ 🔥🔥🔥');
    console.log('🔥 Méthode:', req.method);
    console.log('🔥 URL brute:', req.url);
    console.log('🔥 Path:', req.path);
    console.log('🔥 OriginalUrl:', req.originalUrl);
    console.log('🔥 Headers:', req.headers);
    next();
});

app.use(bodyParser.json());

// Configuration CORS
const allowedOrigins = [
    process.env.KDM_PROJECT_FRONT_URI,
    process.env.KDM_GESTION_FRONT_URI,
    process.env.AMPLIFY_URL,
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Middleware de log
app.use((req, res, next) => {
    console.log('🔵 [EXPRESS] Requête reçue:', req.method, req.url);
    next();
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

// Route de test
app.get("/", (req, res) => {
    res.send("API serveur Express opérationnelle !");
});

export default app;