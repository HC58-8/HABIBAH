// src/config/api.js
// URL de base centralisée — utilisée par toutes les pages

let envApiUrl = process.env.REACT_APP_API_URL || "";

if (envApiUrl) {
  envApiUrl = envApiUrl.replace(/\/$/, "");
  // Si l'utilisateur n'a pas inclus /api à la fin, on s'assure de l'ajouter
  // Sauf s'il pointe vers une route erronée comme /produit ou /products
  if (envApiUrl.endsWith("/produit") || envApiUrl.endsWith("/products")) {
    envApiUrl = envApiUrl.replace(/\/(produit|products)$/, "/api");
  } else if (!envApiUrl.endsWith("/api")) {
    envApiUrl += "/api";
  }
}

// URL de base de l'API
const BASE_URL = envApiUrl
  ? envApiUrl
  : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : `${window.location.protocol}//${window.location.hostname}/api`);

// URL du serveur pour les images uploadées
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL 
  || (envApiUrl 
    ? envApiUrl.replace(/\/api\/?$/, "")
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
        ? "http://localhost:5000" 
        : `${window.location.protocol}//${window.location.hostname}`));

export const API = {
  PRODUCTS: `${BASE_URL}/products`,
  USERS:    `${BASE_URL}/users`,
  ORDERS:   `${BASE_URL}/orders`,
};

// Helper pour construire les URLs des images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath; // URL absolue (Cloudinary etc.)
  return `${BACKEND_URL}${imagePath}`;
};

export default BASE_URL;
