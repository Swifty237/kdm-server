import dotenv from "dotenv";
import express from "express";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message manquant." });
    }

    try {
        await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Demande de devis`,
            html: `
        <p>Vous avez reçu une nouvelle demande de devis.</p>
        <p>Vous pouvez vous connecter à l' <a href="${process.env.KDM_GESTION_FRONT_URI}">interface de gestion</a> pour la voir</p>
      `,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
    }
});

export default router;
