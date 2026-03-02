import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // modèle utilisateur (MongoDB)

const router = express.Router();

// POST /api/auth
router.post("/", async (req, res) => {
    const { login, password } = req.body;

    try {
        // Vérifie que les champs sont présents
        if (!login || !password) {
            return res.status(400).json({ error: "Identifiants manquants." });
        }

        // Recherche de l'utilisateur
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(401).json({ error: "Utilisateur introuvable." });
        }

        // Vérifie le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Génère un token JWT
        const token = jwt.sign(
            { id: user._id, login: user.login },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Retourne le token au front
        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: { id: user._id, login: user.login }
        });
    } catch (err) {
        console.error("Erreur d'auth :", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

export default router;
