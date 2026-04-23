// routes/depenses.js
import express from "express";
import Depense from "../models/Depense.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/depenses/bulk — enregistrer toutes les dépenses en UN seul appel
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { depenses } = req.body; // tableau de { libelle, montant, type }
    if (!Array.isArray(depenses) || depenses.length === 0)
      return res.status(400).json({ message: "Aucune dépense reçue." });

    // Filtre les dépenses avec montant > 0 seulement
    const depensesAEnregistrer = depenses
      .filter(d => d.montant > 0)
      .map(d => ({ ...d, createdBy: req.user.id }));

    if (depensesAEnregistrer.length === 0)
      return res.status(400).json({ message: "Aucune dépense avec un montant > 0." });

    const created = await Depense.insertMany(depensesAEnregistrer);
    res.status(201).json({ message: `${created.length} dépense(s) enregistrée(s).`, depenses: created });
  } catch (err) {
    console.error("Erreur bulk depenses:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET /api/depenses — liste des dépenses
router.get("/", verifyToken, async (req, res) => {
  try {
    const depenses = await Depense.find().sort({ date: -1 });
    res.json(depenses);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
