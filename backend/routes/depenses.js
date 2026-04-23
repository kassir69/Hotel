// routes/depenses.js
import express from "express";
import Depense from "../models/Depense.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/depenses/bulk
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { depenses } = req.body;
    if (!Array.isArray(depenses) || depenses.length === 0)
      return res.status(400).json({ message: "Aucune dépense reçue." });

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

// GET /api/depenses
router.get("/", verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {};
    if (month && year) {
      const debut = new Date(year, month - 1, 1);
      const fin   = new Date(year, month, 1);
      filter.date = { $gte: debut, $lt: fin };
    }
    // Réceptionniste voit seulement ses dépenses, admin voit tout
    if (req.user.role !== "admin") filter.createdBy = req.user.id;

    const depenses = await Depense.find(filter)
      .populate("createdBy", "name")
      .sort({ date: -1 });
    res.json(depenses);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PATCH /api/depenses/:id — modifier (admin seulement)
router.patch("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { libelle, montant, type } = req.body;
    const updates = {};
    if (libelle) updates.libelle = libelle;
    if (montant !== undefined) updates.montant = montant;
    if (type) updates.type = type;

    const depense = await Depense.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!depense) return res.status(404).json({ message: "Dépense introuvable." });
    res.json({ message: "Dépense mise à jour.", depense });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// DELETE /api/depenses/:id — supprimer (admin seulement)
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await Depense.findByIdAndDelete(req.params.id);
    res.json({ message: "Dépense supprimée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
