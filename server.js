import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(bodyParser.json());

// ROUTE pour recevoir les données du formulaire
app.post("/api/contact", async (req, res) => {
    const { nom, email, entreprise, telephone, service, message } = req.body;

    if (!nom || !email || !message) {
        return res.status(400).json({ error: "Nom, email et message sont obligatoires." });
    }

    try {
        const emailResponse = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Nouveau message de ${nom}`,
            html: `
        <h2> Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Entreprise :</strong> ${entreprise || "Non renseignée"}</p>
        <p><strong>Téléphone :</strong> ${telephone || "Non renseigné"}</p>
        <p><strong>Service souhaité :</strong> ${service || "Non précisé"}</p>
        <h3>Message :</h3>
        <p>${message}</p>
      `,
        });

        console.log(" Email envoyé :", emailResponse);
        res.status(200).json({ success: true, message: "Message envoyé avec succès." });
    } catch (error) {
        console.error(" Erreur lors de l'envoi :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de l'envoi du message." });
    }
});

// --- LANCEMENT LOCAL UNIQUEMENT ---
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur local sur http://localhost:${PORT}`));
}

// --- EXPORT POUR VERCEL ---
export default app;
