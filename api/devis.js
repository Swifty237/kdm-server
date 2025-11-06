import connectDB from "../config/db.js";
import Devis from "../models/Devis.js";

export default async function handler(req, res) {
    // CORS pour Vercel serverless
    res.setHeader("Access-Control-Allow-Origin", "https://kdm-project-ruby.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end(); // préflight

    // Connexion MongoDB
    try {
        await connectDB();
    } catch (err) {
        console.error("Erreur MongoDB :", err);
        return res.status(500).json({ error: "Impossible de se connecter à la base de données" });
    }

    if (req.method === "POST") {
        try {
            const devis = await Devis.create(req.body);
            res.status(201).json({ message: "Devis enregistré avec succès", devis });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur lors de l'enregistrement" });
        }
    } else {
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}
