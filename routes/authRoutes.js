const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js"); // modèle utilisateur (MongoDB)

const router = express.Router();

// POST /api/auth
router.post("/", async (req, res) => {
    const { login, password } = req.body;

    try {
        if (!login || !password) {
            return res.status(400).json({ error: "Identifiants manquants." });
        }

        const user = await User.findOne({ login });
        if (!user) {
            return res.status(401).json({ error: "Utilisateur introuvable." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user._id, login: user.login },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Renvoie maintenant aussi le nom et prénom
        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                login: user.login,
                userName: user.userName,
                userFirstname: user.userFirstname
            }
        });
    } catch (err) {
        console.error("Erreur d'auth :", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

// Route d'initialisation de l'admin
router.post('/initAdmin', async (req, res) => {
    try {
        const adminLogin = process.env.KDM_ADMIN;
        const adminPassword = process.env.PASSWORD;

        if (!adminLogin || !adminPassword) {
            return res.status(500).json({ error: 'Configuration admin manquante' });
        }

        // Vérifier si l'admin existe déjà
        const existingAdmin = await User.findOne({ login: adminLogin });
        if (existingAdmin) {
            console.log('✅ Admin déjà présent');
            return res.status(200).json({ message: 'Admin déjà existant' });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            login: adminLogin,
            password: hashedPassword,
            userName: 'Admin',                 // champ requis
            userFirstname: 'Admin',            // champ requis
            email: `admin@${adminLogin}.example.com`, // email unique
        });

        console.log('✅ Admin créé avec succès');
        res.status(201).json({ message: 'Admin créé avec succès' });
    } catch (err) {
        console.error('❌ Erreur initAdmin:', err);
        res.status(500).json({ error: 'Erreur lors de l\'initialisation' });
    }
});

module.exports = router;
