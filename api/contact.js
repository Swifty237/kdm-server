import { Resend } from "resend";
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const corsMiddleware = cors({
    origin: process.env.KDM_PROJECT_FRONT_URI || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
});

// Helper pour exécuter le middleware CORS
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function handler(req, res) {
    // Exécuter le middleware CORS
    await runMiddleware(req, res, corsMiddleware);

    // Gestion explicite de OPTIONS (même si cors le fait déjà)
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", process.env.KDM_PROJECT_FRONT_URI);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Max-Age", "86400"); // Cache préflight 24h
        return res.status(200).end();
    }

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
            console.error("Erreur Resend:", error);
            res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
        }
    } else {
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}
