// server.js
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
// import helmet from "helmet";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";

// Initialisation
dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

// app.use(helmet());
// Définis les origines autorisées

const allowedOrigins = [
    "https://kdm-project-ruby.vercel.app", // ton front en prod
    "http://localhost:5173", // ton front local
];

// ✅ Middleware CORS manuel (avant toute autre route)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // ✅ Répond immédiatement aux pré-requêtes OPTIONS (très important sur Vercel)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
});

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/devis", devisRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("API serveur Express opérationnelle !");
});

// Lancement local uniquement
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Serveur local sur http://localhost:${PORT}`));
}

// Export pour Vercel
export default app;
