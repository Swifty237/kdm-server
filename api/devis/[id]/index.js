import connectDB from "../../../config/db.js";
import Devis from "../../../models/Devis.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        await connectDB();
        const { id } = req.query;

        // 🔹 Récupérer un devis
        if (req.method === "GET") {
            const devis = await Devis.findById(id);

            if (!devis) {
                return res.status(404).json({ error: "Devis introuvable" });
            }

            return res.status(200).json(devis);
        }

        // 🔹 Supprimer un devis
        if (req.method === "DELETE") {
            const deletedDevis = await Devis.findByIdAndDelete(id);

            if (!deletedDevis) {
                return res.status(404).json({ error: "Devis introuvable" });
            }

            return res.status(200).json({ message: "Devis supprimé avec succès" });
        }

        // 🔹 Méthode non autorisée
        return res.status(405).json({ error: "Méthode non autorisée" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
