// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Middleware pour vérifier le token JWT
const authMiddleware = (req, res, next) => {
  try {
    // 🔍 LOGS DÉTAILLÉS POUR LE DÉBOGAGE
    console.log("🔍 [BACKEND] ===== DÉBUT AUTH MIDDLEWARE =====");
    console.log("🔍 [BACKEND] Tous les headers reçus:", JSON.stringify(req.headers, null, 2));
    
    const authHeader = req.headers.authorization;
    console.log("🔍 [BACKEND] Auth header reçu:", authHeader ? "PRÉSENT" : "ABSENT");
    
    if (authHeader) {
      console.log("🔍 [BACKEND] Auth header valeur (début):", authHeader.substring(0, 30) + "...");
    }

    // Vérification du header Authorization
    if (!authHeader) {
      console.log("❌ [BACKEND] Authorization header est UNDEFINED ou NULL");
      return res.status(401).json({ 
        message: "Accès non autorisé. Token manquant." 
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ [BACKEND] Format incorrect. Reçu:", authHeader);
      console.log("❌ [BACKEND] Doit commencer par 'Bearer '");
      return res.status(401).json({ 
        message: "Format de token invalide. Utilisez 'Bearer [token]'." 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔍 [BACKEND] Token extrait, longueur:", token?.length || 0);
    
    if (token) {
      console.log("🔍 [BACKEND] Début du token:", token.substring(0, 20) + "...");
    }

    if (!token) {
      console.log("❌ [BACKEND] Token vide après split");
      return res.status(401).json({ 
        message: "Token manquant." 
      });
    }

    // Vérification que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error("❌ [BACKEND] JWT_SECRET non défini dans .env");
      return res.status(500).json({ 
        message: "Erreur de configuration serveur - JWT_SECRET manquant" 
      });
    }

    try {
      // Vérifie et décode le token
      console.log("🔍 [BACKEND] Tentative de vérification du token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log("✅ [BACKEND] Token valide pour:", decoded.email || decoded.id);
      console.log("✅ [BACKEND] Données décodées:", {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      });
      
      // Stocke les infos de l'utilisateur dans req.user
      req.user = decoded;
      console.log("✅ [BACKEND] Authentification réussie, passage au contrôleur...");
      console.log("🔍 [BACKEND] ===== FIN AUTH MIDDLEWARE =====\n");
      
      next();
      
    } catch (jwtError) {
      console.log("❌ [BACKEND] Erreur JWT:", jwtError.message);
      console.log("❌ [BACKEND] Nom de l'erreur:", jwtError.name);
      
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          message: "Session expirée. Veuillez vous reconnecter." 
        });
      }
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          message: "Token invalide." 
        });
      }
      return res.status(401).json({ 
        message: "Erreur d'authentification." 
      });
    }
  } catch (error) {
    console.error("❌ [BACKEND] Auth middleware error:", error);
    return res.status(500).json({ 
      message: "Erreur d'authentification serveur" 
    });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const adminMiddleware = (req, res, next) => {
  console.log("🔍 [BACKEND] Vérification des droits admin...");
  
  if (!req.user) {
    console.log("❌ [BACKEND] Tentative d'accès admin sans utilisateur connecté");
    return res.status(401).json({ 
      message: "Utilisateur non authentifié" 
    });
  }
  
  console.log("🔍 [BACKEND] Rôle utilisateur:", req.user.role);
  
  if (req.user.role === "admin") {
    console.log("✅ [BACKEND] Accès admin autorisé pour:", req.user.email);
    next();
  } else {
    console.log("❌ [BACKEND] Accès admin refusé pour:", req.user.email, "rôle:", req.user.role);
    res.status(403).json({ 
      message: "Accès interdit. Réservé aux administrateurs." 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };