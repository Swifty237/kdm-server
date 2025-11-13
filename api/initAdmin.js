import connectDB from "../config/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_GESTION_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        await connectDB();

        const existingAdmin = await User.findOne({ login: process.env.KDM_ADMIN });
        if (existingAdmin) {
            return res.status(200).json({ message: "Compte admin déjà existant." });
        }

        await User.create({
            login: process.env.USER,
            password: process.env.PASSWORD,
        });

        return res.status(201).json({ message: "Compte admin créé avec succès !" });
    } catch (err) {
        console.error("Erreur lors de la création du compte admin :", err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
}
