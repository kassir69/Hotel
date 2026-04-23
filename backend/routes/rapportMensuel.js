// routes/rapportMensuel.js
import express from "express";
import Recette from "../models/Recette.js";
import Depense from "../models/Depense.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

const CHAMBRES = [
  "Studio Climatisé",
  "Studio Ventilé",
  "Grande Chambre Climatisée",
  "Grande Chambre Ventilée",
  "Petite Chambre Climatisée",
  "Petite Chambre Ventilée",
];

// GET /api/rapport-mensuel?month=4&year=2026
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    const debut = new Date(year, month - 1, 1);
    const fin   = new Date(year, month, 1);

    // Recettes du mois basées sur dateDebut
    const recettes = await Recette.find({ dateDebut: { $gte: debut, $lt: fin } });

    // Dépenses du mois
    const depenses = await Depense.find({ date: { $gte: debut, $lt: fin } });

    // ─── Grouper recettes par jour ────────────────────────────
    const jours = {};
    for (let d = 1; d <= 31; d++) {
      jours[d] = { montant: 0, total: 0 };
      CHAMBRES.forEach(c => { jours[d][c] = 0; });
    }

    recettes.forEach(r => {
      const jour = new Date(r.dateDebut).getDate();
      if (!jours[jour]) return;
      jours[jour][r.chambreType] = (jours[jour][r.chambreType] || 0) + 1;
      jours[jour].total += 1;
      jours[jour].montant += r.montantTotal || 0;
    });

    // Totaux par type de chambre
    const totauxChambres = {};
    CHAMBRES.forEach(c => { totauxChambres[c] = 0; });
    let totalClients = 0, totalRecettes = 0;
    Object.values(jours).forEach(j => {
      CHAMBRES.forEach(c => { totauxChambres[c] += j[c]; });
      totalClients  += j.total;
      totalRecettes += j.montant;
    });

    // ─── Grouper dépenses par type et libellé ─────────────────
    const chargesFixes = {};
    const autresDepenses = {};
    let totalDepenses = 0;

    depenses.forEach(d => {
      totalDepenses += d.montant;
      if (d.type === "fixe") {
        chargesFixes[d.libelle] = (chargesFixes[d.libelle] || 0) + d.montant;
      } else {
        autresDepenses[d.libelle] = (autresDepenses[d.libelle] || 0) + d.montant;
      }
    });

    res.json({
      month, year,
      jours,
      totauxChambres,
      totalClients,
      totalRecettes,
      chargesFixes,
      autresDepenses,
      totalDepenses,
      resultatNet: totalRecettes - totalDepenses,
      chambres: CHAMBRES,
    });
  } catch (err) {
    console.error("Erreur rapport mensuel:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
