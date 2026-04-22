// routes/userRoutes.js
const express = require("express");
const router  = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// ==================== ROUTES PUBLIQUES ====================
// Inscription en 2 étapes
router.post("/send-otp",    userController.sendOtp);    // Étape 1 : envoyer OTP
router.post("/verify-otp",  userController.verifyOtp);  // Étape 2 : vérifier OTP + créer compte
router.post("/resend-otp",  userController.resendOtp);  // Renvoi de code

// Connexion
router.post("/login",            userController.login);
router.post("/verify-login-otp", userController.verifyLoginOtp);
router.post("/google-login",     userController.googleLogin);

// Mot de passe oublié
router.post("/forgot-password", userController.sendResetOtp);
router.post("/reset-password",  userController.resetPassword);

// ==================== ROUTES PROTÉGÉES ====================
router.get("/profile",  authMiddleware, userController.getProfile);
router.put("/profile",  authMiddleware, userController.updateProfile);

// ==================== ROUTES ADMIN ====================
router.get("/admin/all", authMiddleware, adminMiddleware, userController.getAllUsers);

router.delete("/admin/:id", authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;