import connectDB from "../config/db.js";
import Devis from "../models/Devis.js";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    await connectDB();

    const { method } = req;
    const url = req.url; // ex: /api/devis/678abc/archive

    // Gestion ROUTES PATCH dynamiques
    const matchArchive = url.match(/\/api\/devis\/(.+)\/archive/);
    const matchUnarchive = url.match(/\/api\/devis\/(.+)\/unarchive/);

    try {
        // ****************************************************
        // ARCHIVE
        // ****************************************************
        if (method === "PATCH" && matchArchive) {
            const id = matchArchive[1];

            const devis = await Devis.findByIdAndUpdate(
                id,
                { archived: true },
                { new: true }
            );

            if (!devis) return res.status(404).json({ error: "Devis introuvable" });

            return res.status(200).json({ message: "Devis archivé", devis });
        }

        // ****************************************************
        // UNARCHIVE
        // ****************************************************
        if (method === "PATCH" && matchUnarchive) {
            const id = matchUnarchive[1];

            const devis = await Devis.findByIdAndUpdate(
                id,
                { archived: false },
                { new: true }
            );

            if (!devis) return res.status(404).json({ error: "Devis introuvable" });

            return res.status(200).json({ message: "Devis désarchivé", devis });
        }

        // ****************************************************
        // CRÉATION devis
        // ****************************************************
        if (method === "POST") {
            const devis = await Devis.create(req.body);
            return res.status(201).json({ message: "Devis enregistré", devis });
        }

        // ****************************************************
        // LISTE devis
        // ****************************************************
        if (method === "GET") {
            const devisList = await Devis.find().sort({ createdAt: -1 });
            return res.status(200).json(devisList);
        }

        return res.status(405).json({ error: "Méthode non autorisée" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
