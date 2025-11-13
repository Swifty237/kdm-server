import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { userName, userFirstname, email, password } = req.body;

    try {
        if (!userName || !userFirstname || !email || !password) {
            return res.status(400).json({ error: "Champs manquants." });
        }

        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: "Cet identifiant existe déjà." });
        }

        // Création de l'utilisateur
        const newUser = await User.create({
            userName,
            userFirstname,
            email,
            password,       // hash automatique via le schema
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", userId: newUser._id });
    } catch (err) {
        console.error("Erreur lors de l'inscription :", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

export default router;
