// models/Product.js
const pool = require("../config/db");

// ==================== CRÉER UN PRODUIT ====================
const createProduct = async ({ name, type, description, ingredients, variants, images, mainImageIndex }) => {
  const query = `
    INSERT INTO products (name, type, description, ingredients, variants, images, main_image_index)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    name,
    type,
    description,
    JSON.stringify(ingredients),
    JSON.stringify(variants),
    JSON.stringify(images),
    mainImageIndex,
  ];
  const result = await pool.query(query, values);
  return formatProduct(result.rows[0]);
};

// ==================== TOUS LES PRODUITS ====================
const getAllProducts = async () => {
  const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
  return result.rows.map(formatProduct);
};

// ==================== TROUVER PAR ID ====================
const findProductById = async (id) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (!result.rows[0]) return null;
  return formatProduct(result.rows[0]);
};

// ==================== METTRE À JOUR ====================
const updateProduct = async (id, { name, type, description, ingredients, variants, images, mainImageIndex }) => {
  const query = `
    UPDATE products
    SET name = $1, type = $2, description = $3, ingredients = $4,
        variants = $5, images = $6, main_image_index = $7
    WHERE id = $8
    RETURNING *;
  `;
  const values = [
    name,
    type,
    description,
    JSON.stringify(ingredients),
    JSON.stringify(variants),
    JSON.stringify(images),
    mainImageIndex,
    id,
  ];
  const result = await pool.query(query, values);
  if (!result.rows[0]) return null;
  return formatProduct(result.rows[0]);
};

// ==================== SUPPRIMER ====================
const deleteProduct = async (id) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ==================== FORMAT (snake_case → camelCase + _id) ====================
const formatProduct = (row) => ({
  _id: row.id.toString(),
  name: row.name,
  type: row.type,
  description: row.description,
  ingredients: typeof row.ingredients === "string" ? JSON.parse(row.ingredients) : row.ingredients,
  variants: typeof row.variants === "string" ? JSON.parse(row.variants) : row.variants,
  images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
  mainImageIndex: row.main_image_index ?? 0,
});

module.exports = {
  createProduct,
  getAllProducts,
  findProductById,
  updateProduct,
  deleteProduct,
};