import dotenv from "dotenv";
import express from "express";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware de log pour TOUTES les requêtes sur /api/contact
router.use((req, res, next) => {
    console.log('🔵 [BACKEND] Requête reçue sur /api/contact');
    console.log('🔵 [BACKEND] Méthode:', req.method);
    console.log('🔵 [BACKEND] Headers:', req.headers);
    console.log('🔵 [BACKEND] Origin:', req.headers.origin);
    console.log('🔵 [BACKEND] URL complète:', req.url);
    console.log('🔵 [BACKEND] Base URL:', req.baseUrl);
    console.log('🔵 [BACKEND] Timestamp:', new Date().toISOString());
    next();
});

// Gestion explicite des OPTIONS
router.options('/', (req, res) => {
    console.log('🟢 [BACKEND] Requête OPTIONS reçue');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
});

router.post("/", async (req, res) => {
    const { nom, email, entreprise, telephone, service, message } = req.body;

    if (!nom || !email || !message) {
        return res.status(400).json({ error: "Nom, email et message sont obligatoires." });
    }

    try {
        console.log('📧 [BACKEND] Tentative d\'envoi email avec Resend');
        await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Nouveau message de ${nom}`,
            html: `
        <h2>Nouveau message</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Service :</strong> ${service || "Non précisé"}</p>
        <p><strong>Message :</strong> ${message}</p>
      `,
        });

        console.log('✅ [BACKEND] Email envoyé avec succès');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ [BACKEND] Erreur Resend:', error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
    }
});

// Route GET pour test
router.get('/', (req, res) => {
    console.log('🟢 [BACKEND] Requête GET reçue');
    res.json({ message: 'API contact fonctionne' });
});

export default router;
