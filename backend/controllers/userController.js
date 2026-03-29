// controllers/userController.js
const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { generateOTP, sendOTPEmail } = require("../services/emailService");
const { storeOTP, verifyOTP, deleteOTP } = require("../services/otpStore");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "630562961099-qulo0g9i2024pqbm6dcmkraooalt9fir.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1 : DEMANDE D'OTP AVANT INSCRIPTION
// POST /api/users/send-otp
// → Valide les données, vérifie que l'email n'existe pas, envoie l'OTP
// ═══════════════════════════════════════════════════════════════
const sendOtp = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Validation des champs
    if (!firstname?.trim() || !lastname?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Vérifier si l'email est déjà utilisé
    const existing = await User.findUserByEmail(email.trim());
    if (existing) {
      return res.status(400).json({ message: "Cet email est déjà associé à un compte" });
    }

    // Hasher le mot de passe avant de le stocker temporairement
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer et stocker l'OTP avec les données d'inscription
    const code = generateOTP();
    storeOTP(email.trim().toLowerCase(), code, {
      firstname: firstname.trim(),
      lastname:  lastname.trim(),
      email:     email.trim().toLowerCase(),
      password:  hashedPassword,
      provider:  "local",
    });

    // Envoyer l'email
    await sendOTPEmail(email.trim(), code, firstname.trim());

    console.log(`📧 OTP envoyé à ${email} (dev: ${process.env.NODE_ENV !== "production" ? code : "***"})`);

    res.status(200).json({
      message: "Code de vérification envoyé à votre adresse email",
      email:   email.trim().toLowerCase(),
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du code", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2 : VÉRIFICATION OTP + CRÉATION DU COMPTE
// POST /api/users/verify-otp
// → Vérifie le code, crée le compte, retourne le JWT
// ═══════════════════════════════════════════════════════════════
const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email et code sont requis" });
    }

    // Vérifier l'OTP
    const result = verifyOTP(email.trim().toLowerCase(), code);
    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    const { firstname, lastname, password, provider } = result.data;

    // Créer le compte utilisateur
    const user = await User.createUser(firstname, lastname, email.trim().toLowerCase(), password, provider);

    // Supprimer l'OTP après usage
    deleteOTP(email.trim().toLowerCase());

    // Générer le JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Compte créé avec succès ! Bienvenue sur Habibah 🎉",
      user: {
        id:        user.id,
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
        role:      user.role,
      },
      token,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Erreur lors de la vérification", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// RENVOI D'OTP
// POST /api/users/resend-otp
// ═══════════════════════════════════════════════════════════════
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const { getOTPData } = require("../services/otpStore");
    const stored = getOTPData(email.trim().toLowerCase());

    if (!stored) {
      return res.status(400).json({
        message: "Aucune inscription en attente pour cet email. Recommencez le formulaire.",
      });
    }

    // Générer un nouveau code et le stocker (remplace l'ancien)
    const code = generateOTP();
    storeOTP(email.trim().toLowerCase(), code, {
      firstname: stored.firstname,
      lastname:  stored.lastname,
      email:     stored.email,
      password:  stored.password,
      provider:  stored.provider,
    });

    await sendOTPEmail(email.trim(), code, stored.firstname);

    res.status(200).json({ message: "Nouveau code envoyé à votre adresse email" });
  } catch (error) {
    console.error("resendOtp error:", error);
    res.status(500).json({ message: "Erreur lors du renvoi du code", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// CONNEXION
// POST /api/users/login
// ═══════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await User.findUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        message: "Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      user: {
        id:        user.id,
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
        role:      user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GOOGLE LOGIN
// POST /api/users/google-login
// ═══════════════════════════════════════════════════════════════
const googleLogin = async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) return res.status(400).json({ message: "Token Google manquant" });

    const ticket = await client.verifyIdToken({
      idToken:  googleToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload   = ticket.getPayload();
    const email     = payload.email;
    const firstname = payload.given_name  || payload.name?.split(" ")[0]               || "Utilisateur";
    const lastname  = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Google";

    let user = await User.findUserByEmail(email);

    if (!user) {
      user = await User.createUser(firstname, lastname, email, null, "google");
    } else if (user.provider === "local") {
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà. Connectez-vous avec votre mot de passe.",
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion Google réussie",
      user: {
        id:        user.id,
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
        role:      user.role,
        provider:  user.provider,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    if (error.message.includes("invalid_token")) {
      return res.status(401).json({ message: "Token Google invalide" });
    }
    res.status(401).json({ message: "Erreur d'authentification Google", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET PROFILE
// GET /api/users/profile
// ═══════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json({
      id:         user.id,
      firstname:  user.firstname,
      lastname:   user.lastname,
      email:      user.email,
      role:       user.role,
      provider:   user.provider,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du profil", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// UPDATE PROFILE
// PUT /api/users/profile
// ═══════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, email } = req.body;
    const userId = req.user.id;

    if (!firstname?.trim() || !lastname?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Prénom, nom et email sont requis" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    if (email.trim() !== req.user.email) {
      const existing = await User.findUserByEmail(email.trim());
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte" });
      }
    }

    const updated = await User.updateUser(userId, {
      firstname: firstname.trim(),
      lastname:  lastname.trim(),
      email:     email.trim(),
    });

    if (!updated) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json({
      message:   "Profil mis à jour avec succès",
      id:        updated.id,
      firstname: updated.firstname,
      lastname:  updated.lastname,
      email:     updated.email,
      role:      updated.role,
      provider:  updated.provider,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// DELETE USER (Admin)
// DELETE /api/users/admin/:id
// ═══════════════════════════════════════════════════════════════
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    const userToDelete = await User.findUserById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    if (userToDelete.role === "admin") {
      return res.status(403).json({ message: "Impossible de supprimer un compte administrateur principal." });
    }

    const deleted = await User.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "Utilisateur non trouvé ou déjà supprimé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès", id });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  deleteUser,
};