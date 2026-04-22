// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ importer BrowserRouter
import { HelmetProvider } from "react-helmet-async"; // ✅ importer HelmetProvider pour le SEO
import "./i18n"; // Configuration multilingue
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />  {/* ✅ App est maintenant dans un Router */}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);