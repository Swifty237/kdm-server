import dotenv from "dotenv";
import express from "express";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
    const { nom, email, entreprise, telephone, service, message } = req.body;

    if (!nom || !email || !message) {
        return res.status(400).json({ error: "Nom, email et message sont obligatoires." });
    }

    try {
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

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
    }
});

export default router;
