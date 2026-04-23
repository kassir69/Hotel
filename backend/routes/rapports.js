// routes/rapports.js
import express from "express";
import Rapport from "../models/Rapport.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/rapports — créer un rapport journalier (employé)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { recettes, depenses, resultatNet, date } = req.body;
    const rapport = await Rapport.create({
      recettes, depenses, resultatNet,
      date: date || new Date(),
      createdBy: req.user.id,
    });
    res.status(201).json({ message: "Rapport enregistré avec succès.", rapport });
  } catch (err) {
    console.error("Erreur rapport:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET /api/rapports — liste de tous les rapports (admin seulement)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const rapports = await Rapport.find()
      .populate("createdBy", "name email")
      .sort({ date: -1 });
    res.json(rapports);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
