const express = require("express");
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const Devis = require("../models/Devis.js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 Mo
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

    res.header('Access-Control-Allow-Origin', process.env.KDM_PROJECT_FRONT_URI);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

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


// Générer un token de visite virtuelle (ou récupérer existant)
router.post("/:id/virtual-tour", async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        // Si le lien existe déjà, on le retourne
        if (devis.virtualTourToken) {
            const link = `${process.env.KDM_PROJECT_FRONT_URI}/virtual-tour/${devis.virtualTourToken}`;
            return res.json({ link, token: devis.virtualTourToken });
        }

        // Génération d'un token unique
        const token = crypto.randomBytes(32).toString('hex');
        devis.virtualTourToken = token;
        devis.virtualTourCreatedAt = new Date();
        await devis.save();

        const link = `${process.env.KDM_PROJECT_FRONT_URI}/virtual-tour/${token}`;
        res.json({ link, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// Récupérer les informations du devis pour le client (visite virtuelle)
router.get("/virtual-tour/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const devis = await Devis.findOne({ virtualTourToken: token });
        if (!devis) {
            return res.status(404).json({ error: "Lien invalide ou expiré" });
        }

        // Retourner uniquement ce qui est nécessaire
        res.json({
            _id: devis._id,
            devisNumber: devis.devisNumber,
            virtualTourPhotos: devis.virtualTourPhotos || [],
            virtualTourVideos: devis.virtualTourVideos || [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


router.post("/virtual-tour/:token/upload", upload.fields([
    { name: 'photos', maxCount: 20 },
    { name: 'videos', maxCount: 10 }
]), async (req, res) => {

    // Création du client S3 avec les variables d'environnement actuelles
    const s3Client = new S3Client({
        region: process.env.KDM_BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.KDM_BUCKET_ACCESS_KEY_ID,
            secretAccessKey: process.env.KDM_BUCKET_SECRET_ACCESS_KEY,
        },
    });

    try {
        const { token } = req.params;
        const devis = await Devis.findOne({ virtualTourToken: token });
        if (!devis) {
            return res.status(404).json({ error: "Lien invalide" });
        }

        const currentPhotos = devis.virtualTourPhotos || [];
        const currentVideos = devis.virtualTourVideos || [];

        const newPhotos = [];
        const newVideos = [];

        // Upload des photos
        if (req.files?.photos) {
            for (const file of req.files.photos) {
                const key = `virtual-tours/${token}/photos/${Date.now()}_${file.originalname}`;
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };
                await s3Client.send(new PutObjectCommand(params));
                const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.KDM_BUCKET_REGION}.amazonaws.com/${key}`;
                newPhotos.push(url);
            }
        }

        // Upload des vidéos
        if (req.files?.videos) {
            for (const file of req.files.videos) {
                const key = `virtual-tours/${token}/videos/${Date.now()}_${file.originalname}`;
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };
                await s3Client.send(new PutObjectCommand(params));
                const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.KDM_BUCKET_REGION}.amazonaws.com/${key}`;
                newVideos.push(url);
            }
        }

        // Vérifier le nombre de photos
        if (currentPhotos.length + newPhotos.length > 20) {
            return res.status(400).json({ error: "Vous ne pouvez pas dépasser 20 photos au total." });
        }

        // Mise à jour du devis
        devis.virtualTourPhotos = [...currentPhotos, ...newPhotos];
        devis.virtualTourVideos = [...currentVideos, ...newVideos];
        await devis.save();

        res.json({ success: true });
    } catch (err) {
        console.error("Erreur lors de l'upload vers S3 :", err);
        res.status(500).json({ error: "Erreur serveur lors de l'upload" });
    }
});

module.exports = router;
