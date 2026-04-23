// middlewares/auth.js
import jwt from "jsonwebtoken";

// Vérifie le token JWT et attache user à req
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Accès refusé. Token manquant." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Vérifie le rôle (ex: requireRole("admin"))
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ message: "Accès interdit. Droits insuffisants." });
  next();
};
