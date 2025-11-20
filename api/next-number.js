import connectDB from "../config/db.js";
import Counter from "../models/Counter.js";

export default async function handler(req, res) {
    // CORS pour éviter les erreurs sur Vercel
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end(); // réponse CORS
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        await connectDB();

        const currentYear = new Date().getFullYear();
        const shortYear = currentYear.toString().slice(-2);

        // Trouver ou créer le compteur pour l’année en cours
        const counter = await Counter.findOneAndUpdate(
            { year: currentYear },
            { $inc: { lastNumber: 1 } },
            { new: true, upsert: true }
        );

        const devisNumber = `${shortYear}-${counter.lastNumber}`;

        return res.status(200).json({ devisNumber });

    } catch (error) {
        console.error("Erreur API next-number :", error);
        return res.status(500).json({ error: "Impossible de générer un numéro de devis" });
    }
}
