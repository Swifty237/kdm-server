import connectDB from "../../../config/db.js";
import Devis from "../../../models/Devis.js";

export default async function handler(req, res) {

    console.log("=== DÉBUT GESTION DEVIS (serverless) ===");
    console.log("Méthode:", req.method);
    console.log("Query:", req.query);  // ← Utilisez req.query, pas req.params
    console.log("Body:", req.body);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {

        await connectDB();
        const { id } = req.query;

        if (req.method === "PATCH") {
            // Récupérer d'abord le devis pour vérifier s'il est archivé
            const existingDevis = await Devis.findById(id);

            if (!existingDevis) {
                console.log("Devis non trouvé");
                return res.status(404).json({ error: "Devis introuvable" });
            }

            // Vérifier si le devis est archivé
            if (existingDevis.archived) {
                console.log("Tentative de gestion d'un devis archivé");
                return res.status(400).json({
                    error: "Impossible de gérer un devis archivé"
                });
            }

            // Récupérer la valeur de inManagement depuis le corps de la requête
            // Si non fournie, on alterne l'état actuel
            const { inManagement } = req.body;
            console.log("Valeur inManagement reçue:", inManagement);

            // Déterminer la nouvelle valeur
            const newManagementState = inManagement !== undefined
                ? inManagement
                : !existingDevis.inManagement;

            console.log("Nouvel état de gestion:", newManagementState);

            // Mettre à jour le devis
            const devis = await Devis.findByIdAndUpdate(
                id,
                { inManagement: newManagementState },
                { new: true }
            );

            console.log("Devis mis à jour:", devis);
            console.log("=== FIN GESTION DEVIS ===\n");

            return res.status(200).json(devis);
        }

        res.status(405).json({ error: "Méthode non autorisée" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}