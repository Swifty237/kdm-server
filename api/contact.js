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
          <p><strong>Entreprise :</strong> ${entreprise || "Non renseignée"}</p>
          <p><strong>Téléphone :</strong> ${telephone || "Non renseigné"}</p>
          <p><strong>Service :</strong> ${service || "Non précisé"}</p>
          <p><strong>Message :</strong> ${message}</p>
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
