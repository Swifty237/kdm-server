import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { login, password } = req.body;

    try {
        if (!login || !password) {
            return res.status(400).json({ error: "Champs manquants." });
        }

        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(409).json({ error: "Cet identifiant existe déjà." });
        }

        const newUser = await User.create({
            login,
            password
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", userId: newUser._id });
    } catch (err) {
        console.error("Erreur lors de l'inscription :", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

export default router;
