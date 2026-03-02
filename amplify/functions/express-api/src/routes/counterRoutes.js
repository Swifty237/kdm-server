import express from "express";
import Counter from "../models/Counter.js";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const currentYear = Number(new Date().getFullYear());
        const shortYear = currentYear.toString().slice(-2);

        // Recherche ou création du compteur
        const counter = await Counter.findOneAndUpdate(
            { year: currentYear },
            { $inc: { lastNumber: 1 } },
            { new: true, upsert: true }
        );

        const devisNumber = `${shortYear}-${counter.lastNumber}`;
        res.json({ devisNumber });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Impossible de générer un numéro de devis" });
    }
});

export default router;