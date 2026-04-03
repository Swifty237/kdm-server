const express = require("express");
// const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
// const fs = require('fs');
const Devis = require("../models/Devis.js");
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

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
    // Ajouter les en-têtes CORS (optionnel mais recommandé)
    // res.header('Access-Control-Allow-Origin', process.env.KDM_PROJECT_FRONT_URI);
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Methods', 'DELETE,OPTIONS');

    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        // Création du client S3 (identique à celui utilisé pour l'upload)
        const s3Client = new S3Client({
            region: process.env.KDM_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.KDM_BUCKET_ACCESS_KEY_ID,
                secretAccessKey: process.env.KDM_BUCKET_SECRET_ACCESS_KEY,
            },
        });

        const token = devis.virtualTourToken;
        if (token) {
            const prefix = `virtual-tours/${token}/`;
            // Lister les objets sous ce préfixe
            const listParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Prefix: prefix,
            };
            const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

            if (listedObjects.Contents && listedObjects.Contents.length > 0) {
                const deleteParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Delete: {
                        Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key })),
                        Quiet: false,
                    },
                };
                await s3Client.send(new DeleteObjectsCommand(deleteParams));
                console.log(`🗑️ Supprimés ${listedObjects.Contents.length} fichiers S3 pour le token ${token}`);
            }
        }

        // Suppression du document en base
        await Devis.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Devis supprimé avec succès" });
    } catch (err) {
        console.error("❌ Erreur lors de la suppression du devis :", err);
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
                console.log("newPhotos : ", newPhotos);
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
                console.log("newVideos : ", newVideos);
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

// Supprimer des médias (photos/vidéos) d'un devis via son token
router.delete("/virtual-tour/:token/media", async (req, res) => {
    const s3Client = new S3Client({
        region: process.env.KDM_BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.KDM_BUCKET_ACCESS_KEY_ID,
            secretAccessKey: process.env.KDM_BUCKET_SECRET_ACCESS_KEY,
        },
    });

    try {
        const { token } = req.params;
        const { photoUrls, videoUrls } = req.body;

        const devis = await Devis.findOne({ virtualTourToken: token });
        if (!devis) {
            return res.status(404).json({ error: "Lien invalide" });
        }

        // Supprimer les fichiers S3 pour les photos
        if (photoUrls && photoUrls.length > 0) {
            for (const url of photoUrls) {
                // Extraire la clé S3 à partir de l'URL
                const key = url.split('.amazonaws.com/')[1];
                if (key) {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: decodeURIComponent(key)
                    }));
                }
            }
            // Retirer les URLs du tableau dans MongoDB
            devis.virtualTourPhotos = devis.virtualTourPhotos.filter(p => !photoUrls.includes(p));
        }

        // Supprimer les fichiers S3 pour les vidéos
        if (videoUrls && videoUrls.length > 0) {
            for (const url of videoUrls) {
                const key = url.split('.amazonaws.com/')[1];
                if (key) {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: decodeURIComponent(key)
                    }));
                }
            }
            devis.virtualTourVideos = devis.virtualTourVideos.filter(v => !videoUrls.includes(v));
        }

        await devis.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur suppression médias :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;