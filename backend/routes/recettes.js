// routes/recettes.js
import express from "express";
import Recette, { CHAMBRES } from "../models/Recette.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/recettes
router.post("/", verifyToken, async (req, res) => {
  try {
    const { numChambre, nom, telephone, dateDebut, dateDepart, modePaiement } = req.body;
    if (!numChambre || !nom || !telephone || !dateDebut || !dateDepart)
      return res.status(400).json({ message: "Tous les champs sont requis." });

    const chambre = CHAMBRES.find(c => c.num === Number(numChambre));
    if (!chambre) return res.status(400).json({ message: "Chambre introuvable." });

    const debut   = new Date(dateDebut);
    const depart  = new Date(dateDepart);
    const nuits   = Math.max(1, Math.round((depart - debut) / (1000 * 60 * 60 * 24)));
    const montantTotal = chambre.prix * nuits;

    // Vérifier que la chambre n'est pas déjà occupée sur cette période
    const conflit = await Recette.findOne({
      numChambre: Number(numChambre),
      dateDebut:  { $lt: depart },
      dateDepart: { $gt: debut },
    });
    if (conflit) return res.status(409).json({ message: `Chambre ${numChambre} déjà occupée sur cette période.` });

    const recette = await Recette.create({
      numChambre: Number(numChambre),
      chambreType: chambre.type,
      prixParNuit: chambre.prix,
      nom, telephone, dateDebut: debut, dateDepart: depart,
      nuits, montantTotal,
      modePaiement: modePaiement || "Comptant",
      createdBy: req.user.id,
    });

    res.status(201).json(recette);
  } catch (err) {
    console.error("Erreur recette:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET /api/recettes
router.get("/", verifyToken, async (req, res) => {
  try {
    const recettes = await Recette.find().sort({ date: -1 });
    res.json(recettes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// DELETE /api/recettes/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Recette.findByIdAndDelete(req.params.id);
    res.json({ message: "Réservation supprimée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
