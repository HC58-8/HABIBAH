// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const initDb = require("./config/initDb");

// ==================== ROUTES ====================
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// ==================== MIDDLEWARES ====================

// ✅ Fix pour Google OAuth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// CORS — autorise le frontend React (localhost + toutes URLs Netlify)
app.use(
  cors({
    origin: function (origin, callback) {
      // Autoriser : absence d'origin (ex: Postman), localhost, et *.netlify.app
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.endsWith(".netlify.app") ||
        origin === process.env.CLIENT_URL
      ) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// Parser JSON
app.use(express.json());

// ==================== STATIC FILES ====================
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "uploads")));

// ==================== ROUTES ====================
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes); // <-- Routes commandes

// Add explicit alias for google-login and login to fix deployed frontend URLs
const userController = require("./controllers/userController");
const productController = require("./controllers/productController");
const { authMiddleware, adminMiddleware } = require("./middleware/authMiddleware");
const multer = require("multer");
// const path = require("path"); // Already defined at the top
const { v4: uuidv4 } = require("uuid");

// Duplicate multer config just for aliases (or we can just skip it if we don't want to duplicate, but better to duplicate for certainty)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post("/api/google-login", userController.googleLogin);
app.post("/api/login", userController.login);
app.get("/api", productController.getProducts);

// ==================== ROUTE TEST ====================
app.get("/", (req, res) => {
  res.json({ message: "API en ligne ✅" });
});

// ✅ Route de Diagnostic pour les Emails (Placée avant les routes dynamiques)
const { sendOrderEmails } = require("./services/emailService");
app.get("/api/test-email", async (req, res) => {
  try {
    console.log("🔍 [TEST] Tentative d'envoi d'email de diagnostic...");
    await sendOrderEmails({
      id: "999-TEST",
      items: [{ name: "Produit de Test", quantity: 1, price: 0 }],
      total: 0,
      note: "Ceci est un test de diagnostic."
    }, {
      name: "Admin Test",
      email: process.env.EMAIL_USER,
      phone: "00000000",
      address: "Test Address"
    });
    res.json({ message: "✅ Email de test envoyé ! Vérifiez votre boîte de réception." });
  } catch (error) {
    console.error("❌ [TEST] Erreur email diagnostic:", error);
    res.status(500).json({ error: error.message });
  }
});

// Aliases for admin actions from broken Netlify frontend
const orderController = require("./controllers/orderController");
app.get("/api/admin/all", authMiddleware, adminMiddleware, userController.getAllUsers);
app.get("/api/orders", authMiddleware, adminMiddleware, orderController.getAllOrders);
app.post("/api/add", authMiddleware, adminMiddleware, upload.array("images", 4), productController.addProduct);

// ROUTES DYNAMIQUES (Toujours à la fin pour éviter les conflits)
app.get("/api/:id", productController.getProductById); 
app.put("/api/:id", authMiddleware, adminMiddleware, upload.array("images", 4), productController.updateProduct);
app.delete("/api/:id", authMiddleware, adminMiddleware, productController.deleteProduct);

// ==================== GESTION ERREURS ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Erreur serveur interne",
    error: err.message,
  });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 5000;

// Initialiser la DB puis démarrer le serveur
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
  });
});