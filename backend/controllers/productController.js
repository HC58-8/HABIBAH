// controllers/productController.js

const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// ==================== UPLOAD DIRECTORY ====================

const UPLOAD_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ==================== GET ALL PRODUCTS ====================

const getProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== GET PRODUCT BY ID ====================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== ADD PRODUCT ====================

const addProduct = async (req, res) => {
  try {
    const { name, type, description, mainImageIndex } = req.body;

    const ingredients = JSON.parse(req.body.ingredients || "[]");
    const variants = JSON.parse(req.body.variants || "[]");

    if (!name || !description) {
      return res.status(400).json({
        message: "Nom et description requis",
      });
    }

    // récupérer les images uploadées
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const product = await Product.createProduct({
      name,
      type: type || "Zrir",
      description,
      ingredients,
      variants,
      images,
      mainImageIndex: Number(mainImageIndex) || 0,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== UPDATE PRODUCT ====================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, mainImageIndex } = req.body;

    const ingredients = JSON.parse(req.body.ingredients || "[]");
    const variants = JSON.parse(req.body.variants || "[]");

    // vérifier si le produit existe
    const existing = await Product.findProductById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Produit non trouvé",
      });
    }

    // garder les anciennes images si aucune nouvelle
    let images = existing.images;

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const updatedProduct = await Product.updateProduct(id, {
      name,
      type,
      description,
      ingredients,
      variants,
      images,
      mainImageIndex: Number(mainImageIndex) || 0,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== DELETE PRODUCT ====================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Produit non trouvé",
      });
    }

    res.json({
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== EXPORT ====================

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};