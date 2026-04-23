// models/Rapport.js
import mongoose from "mongoose";

const rapportSchema = new mongoose.Schema({
  recettes: { type: Number, required: true },
  depenses: { type: Number, required: true },
  resultatNet: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Rapport", rapportSchema);
