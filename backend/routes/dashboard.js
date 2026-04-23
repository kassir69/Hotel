// routes/dashboard.js
import express from "express";
import Recette from "../models/Recette.js";
import Depense from "../models/Depense.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [recettesJour, recettesMois, depensesJour, depensesMois] = await Promise.all([
      Recette.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$montantTotal" } } },
      ]),
      Recette.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$montantTotal" } } },
      ]),
      Depense.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]),
      Depense.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]),
    ]);

    res.json({
      recettes: recettesJour[0]?.total || 0,
      depenses: depensesJour[0]?.total || 0,
      recettesMois: recettesMois[0]?.total || 0,
      depensesMois: depensesMois[0]?.total || 0,
    });
  } catch (err) {
    console.error("Erreur dashboard:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
