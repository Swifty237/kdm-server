// pages/api/devis/[id]/adjustment.js
import connectDB from "../../../config/db.js";
import Devis from "../../../models/Devis.js";

export default async function handler(req, res) {
    // Configuration CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Gérer les requêtes OPTIONS (pre-flight)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        await connectDB();
        const { id } = req.query;

        // Vérifier que l'ID est valide
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "ID de devis invalide" });
        }

        // Vérifier que le devis existe
        const existingDevis = await Devis.findById(id);
        if (!existingDevis) {
            return res.status(404).json({ error: "Devis introuvable" });
        }

        // ROUTE PATCH - Valider un devis (mettre à jour finalAmount)
        if (req.method === "PATCH") {
            const { finalAmount, adjustmentReason, adjustmentAmount } = req.body;

            // Validation des données
            if (!finalAmount) {
                return res.status(400).json({ error: "Le montant final est requis" });
            }

            const devis = await Devis.findByIdAndUpdate(
                id,
                {
                    finalAmount: finalAmount,
                    adjustmentReason: adjustmentReason || "",
                    adjustmentAmount: adjustmentAmount || "",
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Devis validé avec succès",
                devis
            });
        }

        // ROUTE DELETE - Supprimer l'ajustement d'un devis
        if (req.method === "DELETE") {
            const devis = await Devis.findByIdAndUpdate(
                id,
                {
                    $unset: {
                        adjustmentReason: "",
                        adjustmentAmount: "",
                        finalAmount: ""
                    }
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Ajustement supprimé avec succès",
                devis
            });
        }

        // Si la méthode n'est ni PATCH ni DELETE
        return res.status(405).json({
            error: "Méthode non autorisée. Utilisez PATCH ou DELETE."
        });

    } catch (err) {
        console.error("Erreur dans /api/devis/[id]/adjustment:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}