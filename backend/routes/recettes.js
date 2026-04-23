// routes/recettes.js
import express from "express";
import Recette, { PRIX_CHAMBRES } from "../models/Recette.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/recettes — enregistrer une réservation
router.post("/", verifyToken, async (req, res) => {
  try {
    const { chambreType, nom, telephone, nuits, dateDebut, modePaiement } = req.body;
    if (!chambreType || !nom || !telephone || !nuits || !dateDebut || !modePaiement)
      return res.status(400).json({ message: "Tous les champs sont requis, y compris le mode de paiement." });

    const prixParNuit = PRIX_CHAMBRES[chambreType];
    if (!prixParNuit)
      return res.status(400).json({ message: "Type de chambre invalide." });

    const montantTotal = prixParNuit * Number(nuits);
    const recette = await Recette.create({
      chambreType, nom, telephone,
      nuits: Number(nuits),
      prixParNuit,
      montantTotal,
      dateDebut: new Date(dateDebut),
      modePaiement,
      createdBy: req.user.id,
    });

    res.status(201).json(recette);
  } catch (err) {
    console.error("Erreur recette:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET /api/recettes — liste des réservations filtrées par mois
router.get("/", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    const debut = new Date(year, month - 1, 1);
    const fin   = new Date(year, month, 1);

    const recettes = await Recette.find({ dateDebut: { $gte: debut, $lt: fin } })
      .sort({ dateDebut: -1 });
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