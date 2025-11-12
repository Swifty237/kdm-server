import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

export default async function handler(req, res) {
    // CORS pour ton front (comme tu fais déjà)
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_GESTION_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    await connectDB();

    if (req.method === "POST") {
        const { login, password } = req.body;

        try {
            if (!login || !password) {
                return res.status(400).json({ error: "Identifiants manquants." });
            }

            const user = await User.findOne({ login });
            if (!user) {
                return res.status(401).json({ error: "Utilisateur introuvable." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Mot de passe incorrect." });
            }

            const token = jwt.sign(
                { id: user._id, login: user.login },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                message: "Connexion réussie",
                token,
                user: { id: user._id, login: user.login }
            });
        } catch (err) {
            console.error("Erreur d'auth :", err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
    } else {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }
}
