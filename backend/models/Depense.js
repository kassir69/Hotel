// models/Depense.js
import mongoose from "mongoose";

const depenseSchema = new mongoose.Schema({
  libelle: { type: String, required: true },
  montant: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ["fixe", "autre", "personnalisee"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Depense", depenseSchema);
