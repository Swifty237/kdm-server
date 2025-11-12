import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_GESTION_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    await connectDB();

    if (req.method === "POST") {
        const { login, password } = req.body;

        try {
            if (!login || !password) {
                return res.status(400).json({ error: "Champs manquants." });
            }

            const existingUser = await User.findOne({ login });
            if (existingUser) {
                return res.status(409).json({ error: "Cet identifiant existe déjà." });
            }

            const newUser = await User.create({
                login,
                password
            });

            return res.status(201).json({ message: "Utilisateur créé avec succès", userId: newUser._id });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur serveur." });
        }
    } else {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }
}
