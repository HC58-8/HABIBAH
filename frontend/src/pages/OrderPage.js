// src/pages/OrderPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft, FaCheck, FaUser, FaPhone,
  FaMapMarkerAlt, FaShoppingBag, FaSpinner
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import PageHeader from "../components/PageHeader";
import { API } from "../config/api";

const ORDER_API = API.ORDERS;
const USER_API  = API.USERS;

function OrderPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems, totalPrice, clearCart } = useCart();
  
  // États
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    note: "",
    email: "",
    firstname: "",
    lastname: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ================= CHARGER LES INFOS UTILISATEUR =================
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      console.log("🔍 Vérification du localStorage:");
      console.log("- Token présent:", !!token);
      console.log("- User string présent:", !!userStr);
      
      if (token && userStr) {
        try {
          // 1. Charger les données depuis localStorage
          const userData = JSON.parse(userStr);
          console.log("📦 Données utilisateur du localStorage:", userData);
          
          // Extraire l'ID utilisateur (peut être sous différentes clés)
          let extractedUserId = null;
          if (userData._id) {
            extractedUserId = userData._id;
            console.log("✅ ID trouvé dans _id:", extractedUserId);
          } else if (userData.id) {
            extractedUserId = userData.id;
            console.log("✅ ID trouvé dans id:", extractedUserId);
          } else if (userData.userId) {
            extractedUserId = userData.userId;
            console.log("✅ ID trouvé dans userId:", extractedUserId);
          } else {
            console.log("⚠️ Aucun ID trouvé dans les données utilisateur");
          }
          
          // Mettre à jour les états immédiatement avec les données localStorage
          setUserId(extractedUserId);
          setUser(userData);
          
          // 2. Pré-remplir avec les données localStorage
          const fullName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim();
          
          setForm(prev => ({
            ...prev,
            name: fullName || prev.name,
            email: userData.email || '',
            firstname: userData.firstname || '',
            lastname: userData.lastname || '',
            phone: userData.phone || prev.phone,
            address: userData.address || prev.address,
          }));

          console.log("📝 Formulaire pré-rempli avec localStorage");
          console.log("🆔 ID après localStorage:", extractedUserId);

          // 3. Récupérer les données complètes depuis le backend
          try {
            console.log("🔄 Récupération des données depuis le backend...");
            const res = await axios.get(`${USER_API}/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data) {
              console.log("✅ Données utilisateur complètes du backend:", res.data);
              
              // Vérifier l'ID du backend
              const backendUserId = res.data._id || res.data.id || res.data.userId;
              console.log("🆔 ID utilisateur du backend:", backendUserId);
              
              // Mettre à jour avec les données du backend
              setUser(res.data);
              if (backendUserId) {
                setUserId(backendUserId);
                console.log("🆔 ID mis à jour avec backend:", backendUserId);
              }
              
              // Construire le nom complet
              const backendFullName = `${res.data.firstname || ''} ${res.data.lastname || ''}`.trim();
              
              setForm(prev => ({
                ...prev,
                name: backendFullName || prev.name,
                email: res.data.email || prev.email,
                firstname: res.data.firstname || prev.firstname,
                lastname: res.data.lastname || prev.lastname,
                phone: res.data.phone || prev.phone,
                address: res.data.address || prev.address,
              }));
              
              console.log("📝 Formulaire mis à jour avec backend");
            }
          } catch (profileErr) {
            console.log("ℹ️ Infos supplémentaires non disponibles:", profileErr.message);
          }
          
        } catch (e) {
          console.error("❌ Erreur parsing user:", e);
        }
      } else {
        console.log("👤 Utilisateur non connecté (pas de token ou user dans localStorage)");
      }
      
      console.log("🏁 Chargement terminé");
      setLoadingUser(false);
    };

    loadUserData();
  }, []);

  // Effet séparé pour logger les changements d'état
  useEffect(() => {
    console.log("📊 État userId mis à jour:", userId);
    console.log("📊 État user mis à jour:", user);
  }, [userId, user]);

  // Rediriger si panier vide
  if (cartItems.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-xl text-gray-500 mb-4">{t('cart.empty')}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-semibold"
          >
            {t('home.explore_btn')}
          </button>
        </div>
      </div>
    );
  }

  // ── Succès commande ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border-2 border-green-200">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-green-500" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('order.success_title')}</h2>
          <p className="text-gray-600 mb-2">{t('order.success_msg')}</p>
          <p className="text-gray-500 text-sm mb-4">
            {t('order.contact_msg', { phone: form.phone })}
          </p>
          {user && (
            <div className="text-xs text-gray-400 mb-8">
              <p>Connecté en tant que : {user.email}</p>
              <p className="font-mono mt-1">ID Utilisateur: {userId}</p>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-bold"
          >
            {t('navbar.home')}
          </button>
        </div>
      </div>
    );
  }

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('order.errors.name');
    if (!form.phone.trim()) e.phone = t('order.errors.phone');
    else if (!/^[0-9+\s]{8,15}$/.test(form.phone)) e.phone = t('order.errors.phone_invalid');
    if (!form.address.trim()) e.address = t('order.errors.address');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Utiliser l'ID du state ou essayer de l'extraire à nouveau du localStorage
      let finalUserId = userId;
      
      // Si userId est null, essayer de l'extraire à nouveau du localStorage
      if (!finalUserId) {
        console.log("⚠️ userId est null, tentative de récupération depuis localStorage");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            finalUserId = userData._id || userData.id || userData.userId;
            console.log("🆔 ID récupéré du localStorage:", finalUserId);
          } catch (e) {
            console.error("❌ Erreur parsing localStorage:", e);
          }
        }
      }
      
      console.log("🆔 ID utilisateur final avant envoi:", finalUserId);
      console.log("👤 Données utilisateur complètes:", user);
      
      // IMPORTANT: Utiliser 'user_id' (avec underscore) pour correspondre à la base de données
      const orderData = {
        customer: { 
          name: form.name, 
          phone: form.phone, 
          address: form.address,
          email: form.email || user?.email,
          firstname: form.firstname || user?.firstname,
          lastname: form.lastname || user?.lastname
        },
        note: form.note,
        user_id: finalUserId, // ← CORRECTION ICI: 'user_id' au lieu de 'userId'
        items: cartItems.map(i => ({
          productId: i._id,
          name: i.name,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
        })),
        total: totalPrice,
      };

      console.log("📦 Envoi commande avec user_id:", JSON.stringify(orderData, null, 2));
      
      // Vérification avant envoi
      if (!orderData.user_id) {
        console.warn("⚠️ Attention: user_id est null ou undefined");
      } else {
        console.log("✅ user_id est bien présent et sera envoyé à la BD:", orderData.user_id);
      }
      
      const res = await axios.post(ORDER_API, orderData, { headers });
      
      console.log("✅ Réponse du serveur:", res.data);
      console.log("✅ Commande créée avec succès pour l'utilisateur ID:", finalUserId);
      
      clearCart();
      setSuccess(true);
      
    } catch (err) {
      console.error("❌ Erreur commande:", err);
      
      if (err.response) {
        console.error("📡 Réponse d'erreur du serveur:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Message d'erreur plus précis
        if (err.response.data?.message) {
          alert(`${t('contact.err_msg')}: ${err.response.data.message}`);
        } else {
          alert(t('products.error_save'));
        }
      } else if (err.request) {
        console.error("🌐 Pas de réponse du serveur:", err.request);
        alert("Erreur réseau: Le serveur backend est-il démarré?");
      } else {
        console.error("⚙️ Erreur de configuration:", err.message);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <PageHeader title={t('order.title')} subtitle={t('order.subtitle')} />

        {/* Bouton retour */}
        <button
          onClick={() => navigate("/panier")}
          className="flex items-center gap-2 mb-6 text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-semibold transition"
        >
          <FaArrowLeft /> {t('order.back_to_cart')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Formulaire ──────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)]">
              
              {/* Bannière utilisateur connecté */}
              {user && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      {t('cart.logged_as')} : {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                        {user.provider === 'google' ? 'Google' : 'Local'}
                      </span>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                        {user.role || 'user'}
                      </span>
                      {userId && (
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-mono">
                          ID: {userId}
                        </span>
                      )}
                    </div>
                  </div>
                  {loadingUser && <FaSpinner className="animate-spin text-gray-400" />}
                </div>
              )}

              <h2 className="text-xl font-bold text-[var(--primary-color)] mb-5 flex items-center gap-2">
                <FaUser /> {t('order.your_info')}
                {loadingUser && <FaSpinner className="animate-spin text-sm" />}
              </h2>

              {/* Champs cachés pour les données utilisateur */}
              {form.email && <input type="hidden" name="email" value={form.email} />}
              {form.firstname && <input type="hidden" name="firstname" value={form.firstname} />}
              {form.lastname && <input type="hidden" name="lastname" value={form.lastname} />}
              {userId && <input type="hidden" name="user_id" value={userId} />} {/* ← CORRECTION ICI aussi */}

              {/* Nom */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2 text-[var(--secondary-color)]" />
                  {t('order.full_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange}
                  placeholder="Ex: Ahmed Ben Ali"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  disabled={loadingUser}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                {form.name && user && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Pré-rempli depuis votre profil
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2 text-[var(--secondary-color)]" />
                  {t('order.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange}
                  placeholder="Ex: +216 XX XXX XXX"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                {!form.phone && user && (
                  <p className="mt-1 text-xs text-gray-400">Veuillez saisir votre numéro</p>
                )}
              </div>

              {/* Adresse */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-2 text-[var(--secondary-color)]" />
                  {t('order.address')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address" 
                  value={form.address} 
                  onChange={handleChange}
                  rows="3"
                  placeholder="Rue, ville, code postal..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none resize-none ${errors.address ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                {!form.address && user && (
                  <p className="mt-1 text-xs text-gray-400">Veuillez saisir votre adresse</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('order.note')}
                </label>
                <textarea
                  name="note" 
                  value={form.note} 
                  onChange={handleChange}
                  rows="2"
                  placeholder="Instructions spéciales pour la livraison..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none resize-none"
                />
              </div>
            </div>

            {/* Bouton soumettre */}
            <button
              type="submit"
              disabled={loading || loadingUser}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg font-bold text-lg"
            >
              {loading ? (
                <><FaSpinner className="animate-spin" /> {t('order.processing')}</>
              ) : (
                <><FaCheck /> {t('order.confirm')}</>
              )}
            </button>
          </form>

          {/* ── Récapitulatif panier ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] sticky top-24">
              <h2 className="text-lg font-bold text-[var(--primary-color)] mb-4 flex items-center gap-2">
                <FaShoppingBag /> {t('cart.summary')}
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.itemId} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size} · ×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--secondary-color)] shrink-0">
                      {(item.price * item.quantity).toFixed(3)} DT
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-[var(--secondary-color)]">
                    {totalPrice.toFixed(3)} DT
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{t('order.cod')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;