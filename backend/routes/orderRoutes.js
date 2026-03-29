// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// ✅ Middleware optionnel — attache req.user si token présent, sinon continue sans bloquer
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const jwt = require("jsonwebtoken");
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [optionalAuth] Token valide, req.user:", req.user);
    next();
  } catch (err) {
    console.log("⚠️ [optionalAuth] Token invalide, on continue sans user");
    next();
  }
};

console.log("✅ [ROUTES] authMiddleware chargé:", authMiddleware ? "OK" : "ERREUR");
console.log("✅ [ROUTES] adminMiddleware chargé:", adminMiddleware ? "OK" : "ERREUR");

// ==================== ROUTES ====================
// ORDRE IMPORTANT: Les routes spécifiques AVANT les routes génériques

// 1. Route publique avec auth OPTIONNELLE (req.user sera dispo si connecté)
router.post("/", optionalAuth, orderController.createOrder);

// 2. Routes protégées - SPÉCIFIQUES (DOIVENT ÊTRE AVANT /:id)
router.get("/my-orders", authMiddleware, orderController.getMyOrders);

// 3. Routes protégées - GÉNÉRIQUES (avec paramètre id)
router.get("/:id", authMiddleware, orderController.getOrderById);

// 4. Routes admin uniquement
router.get("/", authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.delete("/:id", authMiddleware, adminMiddleware, orderController.deleteOrder);

module.exports = router;