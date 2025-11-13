import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_GESTION_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    await connectDB();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        const { userName, userFirstname, email, password } = req.body;

        // Vérification des champs
        if (!userName || !userFirstname || !email || !password) {
            return res.status(400).json({ error: "Champs manquants." });
        }

        // Vérifie si l'utilisateur existe déjà avec le même login ou email
        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: "Cet identifiant ou email existe déjà." });
        }

        // Création de l'utilisateur
        const newUser = await User.create({
            userName,
            userFirstname,
            email,
            password,       // hash automatique via le schema
        });

        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            login: newUser.login,
            userId: newUser._id
        });

    } catch (err) {
        console.error("Erreur lors de la création de l'utilisateur :", err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
}
