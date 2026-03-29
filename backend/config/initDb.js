// backend/config/initDb.js
// Initialise les tables si elles n'existent pas (auto-migration)

const pool = require("./db");

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        provider VARCHAR(20) DEFAULT 'local',
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        description TEXT,
        ingredients JSONB DEFAULT '[]',
        variants JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        main_image_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        customer JSONB NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC(10, 3),
        note TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Base de données initialisée avec succès");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de la base de données:", err.message);
    // Ne pas bloquer le démarrage pour autant
  }
};

module.exports = initDb;
