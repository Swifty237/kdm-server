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

// app.use(helmet());
// Définis les origines autorisées

const allowedOrigins = [
    "https://kdm-project-ruby.vercel.app", // ton front en prod
    "http://localhost:5173", // ton front local
];

// Middleware CORS
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));


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
