// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import helmet from "helmet";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";

// Initialisation
dotenv.config();
connectDB();
const app = express();

// Middlewares
// app.use(helmet());
// Définis les origines autorisées

const allowedOrigins = [
    "https://kdm-project-ruby.vercel.app", // ton front en prod
    "http://localhost:5173", // ton front local
];

// Middleware CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // ✅ Répondre directement aux requêtes OPTIONS
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(bodyParser.json());

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
