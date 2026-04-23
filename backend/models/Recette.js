// models/Recette.js
import mongoose from "mongoose";

export const CHAMBRES = [
  { num: 3,  type: "Studio Climatisé",          prix: 12000 },
  { num: 4,  type: "Studio Climatisé",          prix: 12000 },
  { num: 5,  type: "Studio Climatisé",          prix: 12000 },
  { num: 1,  type: "Studio Ventilé",            prix: 7000  },
  { num: 2,  type: "Studio Ventilé",            prix: 7000  },
  { num: 6,  type: "Studio Ventilé",            prix: 7000  },
  { num: 7,  type: "Grande Chambre Climatisée", prix: 10000 },
  { num: 10, type: "Grande Chambre Climatisée", prix: 10000 },
  { num: 11, type: "Grande Chambre Ventilée",   prix: 7000  },
  { num: 14, type: "Grande Chambre Ventilée",   prix: 7000  },
  { num: 8,  type: "Petite Chambre Climatisée", prix: 8000  },
  { num: 9,  type: "Petite Chambre Climatisée", prix: 8000  },
  { num: 12, type: "Petite Chambre Ventilée",   prix: 5000  },
  { num: 13, type: "Petite Chambre Ventilée",   prix: 5000  },
];

const recetteSchema = new mongoose.Schema({
  numChambre:   { type: Number, required: true },
  chambreType:  { type: String, required: true },
  prixParNuit:  { type: Number, required: true },
  nom:          { type: String, required: true },
  telephone:    { type: String, required: true },
  dateDebut:    { type: Date,   required: true },
  dateDepart:   { type: Date,   required: true },
  nuits:        { type: Number, required: true },
  montantTotal: { type: Number, required: true },
  modePaiement: { type: String, default: "Comptant" },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date:         { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Recette", recetteSchema);
