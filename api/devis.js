import connectDB from "../config/db.js";
import Devis from "../models/Devis.js";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
    // CORS pour Vercel serverless
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end(); // préflight

    try {
        await connectDB(); // connexion à MongoDB

        if (req.method === "POST") {
            // Création d'un nouveau devis
            const devis = await Devis.create(req.body);
            return res.status(201).json({ message: "Devis enregistré avec succès", devis });
        }

        if (req.method === "GET") {
            // Récupération de tous les devis
            const devisList = await Devis.find().sort({ createdAt: -1 }); // du plus récent au plus ancien
            return res.status(200).json(devisList);
        }

        res.status(405).json({ error: "Méthode non autorisée" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
