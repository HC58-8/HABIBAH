// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ importer BrowserRouter
import "./i18n"; // Configuration multilingue
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />  {/* ✅ App est maintenant dans un Router */}
    </BrowserRouter>
  </React.StrictMode>
);