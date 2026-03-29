// models/User.js
const pool = require("../config/db");

const ADMIN_EMAIL = "zrirhabibah@gmail.com";

// ==================== CRÉER UN UTILISATEUR ====================
const createUser = async (firstname, lastname, email, password, provider = "local") => {
  // Déterminer le rôle basé sur l'email
  const role = email === ADMIN_EMAIL ? "admin" : "user";
  
  // Vérifier d'abord si l'utilisateur existe déjà
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return existingUser;
  }

  // Pour les utilisateurs Google, password peut être NULL
  // Pour les utilisateurs locaux, password est requis
  const query = `
    INSERT INTO users (firstname, lastname, email, password, role, provider, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    RETURNING id, firstname, lastname, email, role, provider, created_at;
  `;

  const values = [firstname, lastname, email, password, role, provider];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    throw error;
  }
};

// ==================== TROUVER PAR EMAIL ====================
const findUserByEmail = async (email) => {
  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, password, role, provider, created_at FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Erreur recherche par email:", error);
    throw error;
  }
};

// ==================== TROUVER PAR ID ====================
const findUserById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, role, provider, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Erreur recherche par ID:", error);
    throw error;
  }
};

// ==================== TOUS LES UTILISATEURS (admin) ====================
const getAllUsers = async () => {
  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, role, provider, created_at FROM users ORDER BY id ASC"
    );
    return result.rows;
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    throw error;
  }
};

// ==================== METTRE À JOUR UTILISATEUR ====================
const updateUser = async (id, updates) => {
  const { firstname, lastname, email } = updates;
  const query = `
    UPDATE users 
    SET firstname = COALESCE($1, firstname),
        lastname = COALESCE($2, lastname),
        email = COALESCE($3, email)
    WHERE id = $4
    RETURNING id, firstname, lastname, email, role, provider;
  `;
  
  try {
    const result = await pool.query(query, [firstname, lastname, email, id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    throw error;
  }
};

// ==================== SUPPRIMER UTILISATEUR ====================
const deleteUser = async (id) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};