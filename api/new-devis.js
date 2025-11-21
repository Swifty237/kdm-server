import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // CORS pour Vercel serverless
    res.setHeader("Access-Control-Allow-Origin", process.env.KDM_PROJECT_FRONT_URI);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end(); // préflight

    if (req.method === "POST") {
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
            console.error(error);
            res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
        }
    } else {
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}
