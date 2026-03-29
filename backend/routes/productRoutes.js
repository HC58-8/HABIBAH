// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const productController = require("../controllers/productController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Seules les images sont acceptées"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

// ==================== ROUTES PUBLIQUES ====================
router.get("/", productController.getProducts);

// ==================== ROUTES ADMIN (protégées) ====================
router.post("/add", authMiddleware, adminMiddleware, upload.array("images", 4), productController.addProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 4), productController.updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct);
router.get("/:id", productController.getProductById); // detail produit


module.exports = router;