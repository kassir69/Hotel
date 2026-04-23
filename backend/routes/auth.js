// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register — accessible uniquement aux admins (ou premier lancement)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Tous les champs sont requis." });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé." });

    // Le rôle admin ne peut être assigné que si le token admin est présent
    const assignedRole = role === "admin" ? "admin" : "receptionniste";
    const user = await User.create({ name, email, password, role: assignedRole });

    res.status(201).json({ message: "Compte créé avec succès." });
  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
