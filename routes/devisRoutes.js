const express = require("express");
const Devis = require("../models/Devis.js");

const router = express.Router();

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

// GESTION D'UN DEVIS (activer/désactiver le mode gestion)
router.patch("/:id/manage", async (req, res) => {
    try {

        // Récupérer d'abord le devis pour vérifier s'il est archivé
        const existingDevis = await Devis.findById(req.params.id);

        if (!existingDevis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        // Vérifier si le devis est archivé
        if (existingDevis.archived) {
            return res.status(400).json({
                error: "Impossible de gérer un devis archivé"
            });
        }

        // Récupérer la valeur de inManagement depuis le corps de la requête
        // Si non fournie, on alterne l'état actuel
        const { inManagement } = req.body;

        // Déterminer la nouvelle valeur
        const newManagementState = inManagement !== undefined
            ? inManagement
            : !existingDevis.inManagement;


        // Mettre à jour le devis
        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { inManagement: newManagementState },
            { new: true }
        );


        res.status(200).json({
            message: `Gestion ${newManagementState ? 'activée' : 'désactivée'}`,
            devis
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// VALIDER un devis (mettre à jour finalAmount)
router.patch("/:id/adjustment", async (req, res) => {
    try {
        const { finalAmount, adjustmentReason, adjustmentAmount } = req.body;

        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            {
                finalAmount: finalAmount,
                adjustmentReason: adjustmentReason,
                adjustmentAmount: adjustmentAmount,
            },
            { new: true }
        );

        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json({
            message: "Devis validé avec succès",
            devis
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

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


// SUPPRIMER un devis
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Devis.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json({ message: "Devis supprimé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// SUPPRIMER l'ajustement d'un devis
router.delete("/:id/adjustment", async (req, res) => {
    try {
        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            {
                $unset: {
                    adjustmentReason: "",
                    adjustmentAmount: "",
                    finalAmount: ""
                }
            },
            { new: true }
        );

        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        res.status(200).json({
            message: "Ajustement supprimé avec succès",
            devis
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


module.exports = router;
