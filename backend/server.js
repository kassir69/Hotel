// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import recettesRoutes from "./routes/recettes.js";
import depensesRoutes from "./routes/depenses.js";
import rapportsRoutes from "./routes/rapports.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";

import rapportMensuelRoutes from "./routes/rapportMensuel.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI manquant dans .env");
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => { console.error("❌ Erreur MongoDB :", err); process.exit(1); });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recettes", recettesRoutes);
app.use("/api/depenses", depensesRoutes);
app.use("/api/rapports", rapportsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/rapport-mensuel", rapportMensuelRoutes);

app.get("/", (req, res) => res.send("✅ Backend Finance Hôtel opérationnel"));

// Gestion erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
