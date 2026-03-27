const express = require("express");
const Counter = require("../models/Counter.js");

const router = express.Router();


router.get("/", async (req, res) => {

    console.log("✅ Route /api/next-number atteinte");

    try {
        console.log("🔍 Recherche du compteur...");

        const currentYear = Number(new Date().getFullYear());
        const shortYear = currentYear.toString().slice(-2);

        // Recherche ou création du compteur
        const counter = await Counter.findOneAndUpdate(
            { year: currentYear },
            { $inc: { lastNumber: 1 } },
            { new: true, upsert: true }
        );

        console.log("🔢 Compteur trouvé:", counter);

        const devisNumber = `${shortYear}-${counter.lastNumber}`;

        console.log("📦 Devis number généré:", devisNumber);

        res.json({ devisNumber });

    } catch (error) {

        console.error("❌ Erreur dans /api/next-number :", error);
        console.error(error);
        res.status(500).json({ error: "Impossible de générer un numéro de devis" });
    }
});

module.exports = router;