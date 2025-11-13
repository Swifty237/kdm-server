import connectDB from "../config/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_GESTION_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        await connectDB();

        const users = await User.find({ login: { $ne: process.env.KDM_ADMIN } })
            .select("userName userFirstname email login createdAt"); // champs à retourner

        return res.status(200).json(users);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
}
