const express = require('express');
const { Resend } = require('resend');

const router = express.Router();

// Variable pour stocker l'instance Resend (initialisée paresseusement)
let resendInstance = null;

// Fonction pour obtenir l'instance Resend
function getResend() {
    if (!resendInstance) {
        console.log('🔧 Initialisation de Resend (première utilisation)');
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error('❌ RESEND_API_KEY manquante dans les variables d\'environnement');
            throw new Error('Configuration Resend manquante');
        }

        console.log('🔧 Clé API trouvée, longueur:', apiKey.length);
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

router.post('/', async (req, res) => {
    console.log('📨 POST /api/contact reçu');
    console.log('📨 Body:', req.body);

    const { civility, nom, email, entreprise, telephone, service, message } = req.body;

    if (!nom || !email || !message) {
        return res.status(400).json({ error: "Nom, email et message sont obligatoires." });
    }

    try {
        // Initialisation de Resend au moment de l'appel
        const resend = getResend();

        console.log('📤 De:', process.env.FROM_EMAIL);
        console.log('📤 À:', process.env.TO_EMAIL);

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Nouveau message de ${nom}`,
            html: `
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom :</strong> ${civility} ${nom}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Entreprise :</strong> ${entreprise || "Non renseignée"}</p>
                <p><strong>Téléphone :</strong> ${telephone || "Non renseigné"}</p>
                <p><strong>Service :</strong> ${service || "Non précisé"}</p>
                <p><strong>Message :</strong> ${message}</p>
            `,
        });

        if (error) {
            console.error('❌ Erreur Resend:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('✅ Email envoyé avec succès:', data.id);
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ Exception:', error);
        res.status(500).json({
            error: "Erreur lors de l'envoi de l'email.",
            details: error.message
        });
    }
});

module.exports = router;