import express from "express";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/users - liste tous les utilisateurs sauf admin
router.get("/", async (req, res) => {
    try {
        await connectDB(); // si tu veux reconnecter à chaque appel

        const users = await User.find({ login: { $ne: process.env.KDM_ADMIN } })
            .select("userName userFirstname email login createdAt");

        return res.status(200).json(users);
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
});

export default router;
