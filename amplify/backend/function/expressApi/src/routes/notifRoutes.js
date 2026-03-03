const dotenv = require("dotenv");
const express = require("express");
const { Resend } = require("resend");

dotenv.config();
const router = express.Router();

// Variable pour stocker l'instance Resend (initialisée paresseusement)
let resendInstance = null;

// Fonction pour obtenir l'instance Resend
function getResend() {
    if (!resendInstance) {
        console.log('🔧 Initialisation de Resend (notifRoutes)');
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error('❌ RESEND_API_KEY manquante dans notifRoutes');
            throw new Error('Configuration Resend manquante');
        }

        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

router.post("/", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message manquant." });
    }

    try {
        // Initialisation de Resend au moment de l'appel
        const resend = getResend();

        console.log('📤 Envoi email de notification');

        await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Demande de devis`,
            html: `
                <p>Vous avez reçu une nouvelle demande de devis.</p>
                <p>Vous pouvez vous connecter à l' <a href="${process.env.KDM_GESTION_FRONT_URI}">interface de gestion</a> pour la voir</p>
            `,
        });

        console.log('✅ Email de notification envoyé');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Erreur notification:', error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
    }
});

module.exports = router;