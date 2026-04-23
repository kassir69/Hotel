// models/Recette.js
import mongoose from "mongoose";

const PRIX_CHAMBRES = {
  "Studio Climatisé": 12000,
  "Studio Ventilé": 7000,
  "Grande Chambre Climatisée": 10000,
  "Grande Chambre Ventilée": 7000,
  "Petite Chambre Climatisée": 10000,
  "Petite Chambre Ventilée": 5000,
};

const recetteSchema = new mongoose.Schema({
  chambreType: { type: String, required: true },
  prixParNuit: { type: Number, required: true },
  nom: { type: String, required: true },
  telephone: { type: String, required: true },
  nuits: { type: Number, required: true, min: 1 },
  montantTotal: { type: Number, required: true },
  dateDebut: { type: Date, required: true }, // ← date de début du séjour choisie
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now }, // date d'enregistrement
}, { timestamps: true });

export { PRIX_CHAMBRES };
export default mongoose.model("Recette", recetteSchema);
