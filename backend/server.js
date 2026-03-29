// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

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

// CORS — autorise le frontend React
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://stately-cuchufli-eb7aa3.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parser JSON
app.use(express.json());

// ==================== STATIC FILES ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== ROUTES ====================
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes); // <-- Routes commandes

// ==================== ROUTE TEST ====================
app.get("/", (req, res) => {
  res.json({ message: "API en ligne ✅" });
});

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

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});