import express from "express";
import Devis from "../models/Devis.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const devis = await Devis.create(req.body);
        res.status(201).json({ message: "Devis enregistré avec succès", devis });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur lors de l'enregistrement" });
    }
});

export default router;
