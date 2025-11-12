// api/passwordModif.js
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
    // Vérifie que la méthode est POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { login, password, newPassword } = req.body;

    if (!login || !password || !newPassword) {
        return res.status(400).json({ error: "Champs manquants." });
    }

    try {
        // Connexion à la base MongoDB
        await connectDB();

        const user = await User.findOne({ login });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Vérifie le mot de passe actuel
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe actuel incorrect." });
        }

        // 🧩 Le hook 'pre("save")' s’occupera du hachage ici :
        user.password = newPassword;
        await user.save(); // => le mot de passe est automatiquement hashé !

        return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
    } catch (err) {
        console.error("Erreur lors de la modification du mot de passe :", err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
}
