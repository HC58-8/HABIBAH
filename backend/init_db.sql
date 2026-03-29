-- Script d'initialisation de la base de données HABIBAH
-- À exécuter sur Neon.tech dans le SQL Editor

-- ==================== TABLE USERS ====================
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

-- ==================== TABLE PRODUCTS ====================
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

-- ==================== TABLE ORDERS ====================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 3),
  note TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== VERIFICATION ====================
SELECT 'Tables créées avec succès ✅' AS message;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
