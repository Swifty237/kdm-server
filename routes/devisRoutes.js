import express from "express";
import Devis from "../models/Devis.js";

const router = express.Router();

// Récupérer tous les devis
router.get("/", async (req, res) => {
    try {
        const devisList = await Devis.find().sort({ createdAt: -1 });
        res.status(200).json(devisList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Créer un nouveau devis
router.post("/", async (req, res) => {
    try {
        const devis = await Devis.create(req.body);
        res.status(201).json({ message: "Devis enregistré avec succès", devis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
