// src/App.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/Cartpage";
import OrderPage from "./pages/OrderPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProfilePage from "./pages/Profilepage";

import AboutPage   from "./pages/AboutPage";
import ContactPage from "./pages/Contactpage";
// Récupérer le client ID Google depuis les variables d'environnement
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const location = useLocation();

  const hideNavbarPaths = ["/login"];
  const showNavbar = !hideNavbarPaths.some(path =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CartProvider>
        <div className="bg-[#FCFAED]">
          {showNavbar && <Navbar />}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produit" element={<ProductsPage />} />
            <Route path="/login" element={<AccountPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/commander" element={<OrderPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}

export default App;