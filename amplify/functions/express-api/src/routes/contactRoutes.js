import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
    console.log('📧 [CONTACT] Données reçues:', req.body);

    const { nom, email, entreprise, telephone, service, message } = req.body;

    if (!nom || !email || !message) {
        return res.status(400).json({ error: "Nom, email et message sont obligatoires." });
    }

    try {
        console.log('📧 Tentative d\'envoi avec:', {
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            apiKeyPresent: !!process.env.RESEND_API_KEY
        });

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Nouveau message de ${nom}`,
            html: `
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom :</strong> ${nom}</p>
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

        console.log('✅ Email envoyé avec succès:', data);
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('❌ Exception:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;