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
import cors from "cors";

const allowedOrigins = [
    "https://kdm-project-ruby.vercel.app", // ton frontend Vercel
    "http://localhost:5173", // pour le dev local
];

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser sans origin (ex: Postman, tests locaux)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
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
