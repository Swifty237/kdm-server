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

// Récupérer un devis par ID  ← **AJOUT ICI**
router.get("/:id", async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);

        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json(devis);
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

// ARCHIVER un devis
router.patch("/:id/archive", async (req, res) => {
    try {
        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { archived: true },
            { new: true }
        );

        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json({ message: "Devis archivé", devis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// DÉSARCHIVER un devis
router.patch("/:id/unarchive", async (req, res) => {
    try {
        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { archived: false },
            { new: true }
        );

        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json({ message: "Devis désarchivé", devis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


export default router;
