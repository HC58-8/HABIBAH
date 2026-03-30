// src/config/api.js
// URL de base centralisée — utilisée par toutes les pages

// URL de base de l'API (ex: https://habibah-api.onrender.com/api)
const BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
  : (window.location.hostname.includes("netlify.app") 
      ? "https://habibah-api.onrender.com/api" 
      : "http://localhost:5000/api");

// URL du serveur pour les images uploadées (ex: https://habibah-api.onrender.com)
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL 
  || (process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000");

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
