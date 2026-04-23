// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Recette from "../models/Recette.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/admin/users
router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PATCH /api/admin/users/:id
router.patch("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { role, name } = req.body;
    const updates = {};
    if (role && ["admin", "receptionniste"].includes(role)) updates.role = role;
    if (name) updates.name = name;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.json({ message: "Utilisateur mis à jour.", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// GET /api/admin/clients — liste tous les clients avec mode de paiement
router.get("/clients", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {};
    if (month && year) {
      const debut = new Date(year, month - 1, 1);
      const fin   = new Date(year, month, 1);
      filter.dateDebut = { $gte: debut, $lt: fin };
    }
    const clients = await Recette.find(filter)
      .populate("createdBy", "name")
      .sort({ dateDebut: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
