// src/pages/CartPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaArrowRight,
  FaHistory, FaSignInAlt
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import PageHeader from "../components/PageHeader";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  
  // État pour savoir si l'utilisateur est connecté
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Vérifier si l'utilisateur est connecté à chaque rendu
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      console.log("🔍 Vérification login - Token:", token ? "Présent" : "Absent");
      console.log("🔍 Vérification login - User:", userStr ? "Présent" : "Absent");
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUserEmail(userData.email);
          setIsLoggedIn(true);
          console.log("✅ Utilisateur connecté:", userData.email);
        } catch (e) {
          console.error("❌ Erreur parsing user:", e);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
      }
    };
    
    checkLoginStatus();
    
    // Écouter les changements dans localStorage
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('focus', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, []);

  // Fonction de test pour vérifier localStorage
  const testLocalStorage = () => {
    console.log("=== CONTENU LOCALSTORAGE ===");
    console.log("Token:", localStorage.getItem("token"));
    console.log("User:", localStorage.getItem("user"));
    console.log("Toutes les clés:", Object.keys(localStorage));
    console.log("=============================");
    
    // Rafraîchir l'état
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  console.log("🛒 Rendu CartPage - isLoggedIn:", isLoggedIn, "Email:", userEmail);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          
          {/* Bouton de test localStorage (à retirer après débogage) */}
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={testLocalStorage}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
             
            </button>
          </div>
          
          <PageHeader title="Panier" subtitle="Vos produits sélectionnés" />
          
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-xl text-gray-500 mb-6">Votre panier est vide</p>
            
            {/* Message si connecté */}
            {isLoggedIn && (
              <div className="mb-4 text-green-600">
                ✅ Connecté en tant que {userEmail}
              </div>
            )}
            
            {/* Bouton Mes commandes (si connecté) */}
            {isLoggedIn && (
              <div className="mt-6">
                <button
                  onClick={() => navigate("/my-orders")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--secondary-color)] transition font-semibold shadow-md"
                >
                  <FaHistory /> Mes commandes
                </button>
              </div>
            )}
            
            {/* Bouton Se connecter (si non connecté) */}
            {!isLoggedIn && (
              <div className="mt-6">
                <button
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
                >
                  <FaSignInAlt /> Se connecter
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-semibold"
              >
                <FaArrowLeft /> Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

       

        <PageHeader title="Panier" subtitle={`${totalItems} article${totalItems > 1 ? "s" : ""} dans votre panier`} />

        {/* Message utilisateur */}
        {isLoggedIn && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 flex justify-between items-center">
            <span>✅ Connecté en tant que {userEmail}</span>
            <button
              onClick={() => navigate("/my-orders")}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Mes commandes
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-700 flex justify-between items-center">
            <span>🔐 Non connecté</span>
            <button
              onClick={() => navigate("/account")}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Se connecter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div
                key={item.itemId}
                className="bg-white rounded-2xl shadow-md p-4 flex gap-4 items-center border-2 border-transparent hover:border-[var(--secondary-color)] transition"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {item.image ? (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Photo
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--primary-color)] truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{item.type} · {item.size}</p>
                  <p className="text-sm font-bold text-[var(--secondary-color)]">
                    {(item.price * item.quantity).toFixed(3)} DT
                  </p>
                </div>

                {/* Quantité */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[var(--secondary-color)] hover:text-white flex items-center justify-center transition"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[var(--secondary-color)] hover:text-white flex items-center justify-center transition"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className="text-red-400 hover:text-red-600 transition ml-2 shrink-0"
                  aria-label="Supprimer"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}

            {/* Vider le panier */}
            <button
              onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-600 transition flex items-center gap-2"
            >
              <FaTrash size={12} /> Vider le panier
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] sticky top-24">
              <h2 className="text-xl font-bold text-[var(--primary-color)] mb-4">Récapitulatif</h2>

              <div className="space-y-2 mb-4">
                {cartItems.map(item => (
                  <div key={item.itemId} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.name} ×{item.quantity}</span>
                    <span className="shrink-0 font-medium">{(item.price * item.quantity).toFixed(3)} DT</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-[var(--secondary-color)]">
                    {totalPrice.toFixed(3)} DT
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/commander")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transform hover:scale-105 transition-all duration-200 shadow-lg font-bold text-lg"
              >
                Passer la commande <FaArrowRight />
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                <FaArrowLeft size={14} /> Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;