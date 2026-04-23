// routes/admin.js
import express from "express";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/admin/users — liste tous les utilisateurs (admin)
router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PATCH /api/admin/users/:id — modifier le rôle d'un utilisateur
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

// DELETE /api/admin/users/:id — supprimer un utilisateur
router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
