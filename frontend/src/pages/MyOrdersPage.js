// src/pages/MyOrdersPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaShoppingBag, FaSpinner, FaEye, FaCheck, FaTimes,
  FaTruck, FaBoxOpen, FaCalendarAlt, FaUser, FaPhone,
  FaMapMarkerAlt, FaEnvelope, FaArrowLeft, FaImage,
  FaInfoCircle, FaHistory, FaSearch
} from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";

import { API, getImageUrl } from "../config/api";

const ORDER_API = API.ORDERS;
const PRODUCT_API = API.PRODUCTS;

function MyOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // États
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);

  // Statuts possibles avec couleurs et icônes
  const statusConfig = {
    pending: { 
      labelKey: "admin.status.pending", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <MdPending className="text-yellow-600" />
    },
    confirmed: { 
      labelKey: "admin.status.confirmed", 
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <GiConfirmed className="text-blue-600" />
    },
    preparing: { 
      labelKey: "admin.status.preparing", 
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: <FaBoxOpen className="text-purple-600" />
    },
    shipped: { 
      labelKey: "admin.status.shipped", 
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      icon: <FaTruck className="text-indigo-600" />
    },
    delivered: { 
      labelKey: "admin.status.delivered", 
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <FaCheck className="text-green-600" />
    },
    cancelled: { 
      labelKey: "admin.status.cancelled", 
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <FaTimes className="text-red-600" />
    }
  };

  // ================= CHARGER LES COMMANDES DE L'UTILISATEUR =================
  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("🔍 1. Token depuis localStorage:", token ? "✅ Présent" : "❌ ABSENT");
      console.log("🔍 2. User depuis localStorage:", userStr ? "✅ Présent" : "❌ ABSENT");

      if (!token) {
        console.log("❌ 3. Token manquant - Redirection vers login");
        navigate("/account");
        return;
      }

      if (!userStr) {
        console.log("❌ 4. User manquant - Redirection vers login");
        navigate("/account");
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);

        console.log("🔍 5. Envoi requête vers /my-orders avec token");
        console.log("🔍 6. Token (début):", token.substring(0, 20) + "...");
        
        // Configuration axios avec le token
        const config = {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        console.log("🔍 7. Headers envoyés:", config.headers);

        const res = await axios.get(`${ORDER_API}/my-orders`, config);

        console.log("✅ 8. Réponse reçue - Status:", res.status);
        console.log("✅ 9. Nombre de commandes:", res.data.length);
        
        setOrders(res.data);
        setFilteredOrders(res.data);
        
        // Charger les images des produits si des commandes existent
        if (res.data.length > 0) {
          await loadProductImages(res.data);
        }
        
      } catch (error) {
        console.error("❌ 10. Erreur détaillée:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.config?.headers
        });
        
        if (error.response?.status === 401) {
          console.log("❌ 11. Token invalide ou expiré - Nettoyage localStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert(t("user_orders.session_expired"));
          navigate("/account");
        } else if (error.response?.status === 403) {
          alert(t("user_orders.unauthorized"));
        } else if (error.code === 'ERR_NETWORK') {
          alert(t("user_orders.network_error"));
        } else {
          alert(t("user_orders.load_error"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate]);

  // ================= CHARGER LES DÉTAILS D'UN PRODUIT =================
  const loadProductDetails = async (productId) => {
    if (productDetails[productId]) {
      setSelectedProduct(productDetails[productId]);
      setShowProductDetails(true);
      return;
    }

    setLoadingProductDetails(true);
    try {
      const res = await axios.get(`${PRODUCT_API}/${productId}`);
      console.log("📦 Détails produit:", res.data);
      
      setProductDetails(prev => ({ ...prev, [productId]: res.data }));
      setSelectedProduct(res.data);
      setShowProductDetails(true);
      
    } catch (error) {
      console.error("❌ Erreur chargement détails produit:", error);
      alert(t("user_orders.load_error"));
    } finally {
      setLoadingProductDetails(false);
    }
  };

  // ================= CHARGER LES IMAGES DES PRODUITS =================
  const loadProductImages = async (ordersData) => {
    const productIds = new Set();
    
    ordersData.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId) {
          productIds.add(item.productId);
        }
      });
    });

    if (productIds.size === 0) return;

    console.log("🖼️ Chargement des images pour", productIds.size, "produits");
    const images = {};

    try {
      await Promise.all([...productIds].map(async (productId) => {
        try {
          const res = await axios.get(`${PRODUCT_API}/${productId}`);
          if (res.data && res.data.images && res.data.images.length > 0) {
            const mainImageIndex = res.data.main_image_index || 0;
            images[productId] = res.data.images[mainImageIndex] || res.data.images[0];
          }
          setProductDetails(prev => ({ ...prev, [productId]: res.data }));
        } catch (err) {
          console.log(`Image non trouvée pour produit ${productId}`);
        }
      }));

      setProductImages(prev => ({ ...prev, ...images }));
    } catch (error) {
      console.error("❌ Erreur chargement images:", error);
    }
  };

  // ================= FILTRER LES COMMANDES =================
  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toString().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.items?.some(item => 
          item.productName?.toLowerCase().includes(term)
        )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  // ================= FORMATER DATE =================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // ================= CONSTRUIRE URL IMAGE =================
  const getProductMainImage = (productId) => {
    const imagePath = productImages[productId];
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return getImageUrl(imagePath);
  };

  // ================= FORMATER INGRÉDIENTS =================
  const formatIngredients = (ingredients) => {
    if (!ingredients) return t("common.not_specified");
    if (Array.isArray(ingredients)) return ingredients.join(", ");
    if (typeof ingredients === 'string') return ingredients;
    return JSON.stringify(ingredients);
  };

  // ================= STATISTIQUES DES COMMANDES =================
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[var(--secondary-color)] mx-auto mb-4" size={48} />
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bouton retour */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-semibold transition"
        >
          <FaArrowLeft /> {t("navbar.back")}
        </button>

        <PageHeader 
          title={t("user_orders.title")} 
          subtitle={`${user?.firstname || ''} ${user?.lastname || ''} - ${t("user_orders.history")}`} 
        />

        {/* Informations utilisateur et statistiques */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.firstname?.[0]}{user.lastname?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaEnvelope className="text-[var(--secondary-color)]" />
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <FaUser className="text-[var(--secondary-color)]" />
                    {user.provider === 'google' ? 'Google' : t("profile.local_auth")}
                  </p>
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">{t("user_orders.stats.total")}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">{t("user_orders.stats.pending")}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    <p className="text-xs text-gray-500">{t("user_orders.stats.delivered")}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-xs text-gray-500">{t("user_orders.stats.cancelled")}</p>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("user_orders.search_ph")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none bg-white"
            >
              <option value="all">{t("user_orders.all_status")}</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{t(config.labelKey)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)]">
          <h2 className="text-xl font-bold text-[var(--primary-color)] mb-6 flex items-center gap-2">
            <FaHistory /> {t("user_orders.history")} ({filteredOrders.length})
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500 mb-2">{t("user_orders.no_orders")}</p>
              <p className="text-gray-400 mb-6">{t("user_orders.no_orders_desc")}</p>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t("user_orders.explore_btn")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-[var(--secondary-color)] transition-all shadow-sm hover:shadow-md">
                  
                  {/* En-tête commande */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                        #{order.id}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <FaCalendarAlt className="text-[var(--secondary-color)]" />
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <FaMapMarkerAlt className="text-[var(--secondary-color)]" />
                          {order.customer?.address?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.icon}
                        {t(statusConfig[order.status]?.labelKey)}
                      </span>
                      <span className="text-2xl font-bold text-[var(--secondary-color)]">
                        {parseFloat(order.total).toFixed(3)} DT
                      </span>
                    </div>
                  </div>

                  {/* Produits commandés */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaShoppingBag /> {t("user_orders.items_title")} :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items?.map((item, idx) => {
                        const productId = item.productId;
                        const imageUrl = getProductMainImage(productId);
                        
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg cursor-pointer hover:shadow-md transition border border-gray-200 hover:border-[var(--secondary-color)] group"
                            onClick={() => loadProductDetails(productId)}
                          >
                            {/* Image du produit */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 group-hover:border-[var(--secondary-color)]">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><FaImage className="text-gray-400" /></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <FaImage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Détails du produit */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800 truncate">
                                  {item.productName}
                                </p>
                                <FaInfoCircle className="text-[var(--secondary-color)] text-xs opacity-0 group-hover:opacity-100 transition" title={t("user_orders.details_tooltip")} />
                              </div>
                              <div className="flex flex-wrap gap-x-4 text-sm">
                                {item.size && (
                                  <span className="text-gray-500">{t("user_orders.table.size")}: {item.size}</span>
                                )}
                                <span className="text-gray-500">{t("user_orders.table.qty")}: {item.quantity}</span>
                                <span className="font-semibold text-[var(--secondary-color)]">
                                  {parseFloat(item.price).toFixed(3)} DT
                                </span>
                              </div>
                            </div>
                            
                            {/* Sous-total */}
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{t("user_orders.table.subtotal")}</p>
                              <p className="font-bold text-[var(--primary-color)]">
                                {parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note si présente */}
                  {order.note && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">📝 {t("order.note")} :</span> {order.note}
                      </p>
                    </div>
                  )}

                  {/* Bouton détails */}
                  <div className="flex justify-end border-t pt-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium shadow hover:shadow-md"
                    >
                      <FaEye /> {t("user_orders.details_btn")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Détails commande */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                <h3 className="text-2xl font-bold text-[var(--primary-color)]">
                  {t("user_orders.modal_title", { id: selectedOrder.id })}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Statut actuel */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">{t("user_orders.current_status")}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 text-base ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.icon}
                    {t(statusConfig[selectedOrder.status]?.labelKey)}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt className="text-[var(--secondary-color)]" />
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>

              {/* Informations client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#FCFAED] p-4 rounded-xl">
                  <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2 text-lg">
                    <FaUser /> {t("order.your_info")}
                  </h4>
                  <p className="mb-2"><span className="font-medium">{t("order.name")}:</span> {selectedOrder.customer?.name}</p>
                  <p className="mb-2"><span className="font-medium">{t("order.phone")}:</span> {selectedOrder.customer?.phone}</p>
                  {selectedOrder.customer?.email && (
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                  )}
                </div>

                <div className="bg-[#FCFAED] p-4 rounded-xl">
                  <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2 text-lg">
                    <FaMapMarkerAlt /> {t("order.address")}
                  </h4>
                  <p className="mb-2"><span className="font-medium">{t("order.address")}:</span> {selectedOrder.customer?.address}</p>
                  {selectedOrder.note && (
                    <p className="mb-2"><span className="font-medium">{t("order.note")}:</span> {selectedOrder.note}</p>
                  )}
                </div>
              </div>

              {/* Produits commandés */}
              <div className="mb-6">
                <h4 className="font-semibold text-[var(--primary-color)] mb-3 text-lg">{t("user_orders.items_title")}</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">{t("user_orders.table.product")}</th>
                        <th className="px-4 py-3 text-left">{t("user_orders.table.size")}</th>
                        <th className="px-4 py-3 text-right">{t("user_orders.table.price")}</th>
                        <th className="px-4 py-3 text-right">{t("user_orders.table.qty")}</th>
                        <th className="px-4 py-3 text-right">{t("user_orders.table.total")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          <td className="px-4 py-3 font-medium">{item.product_name || item.productname || item.productName || item.name}</td>
                          <td className="px-4 py-3">{item.product_size || item.size || '-'}</td>
                          <td className="px-4 py-3 text-right">{parseFloat(item.price || 0).toFixed(3)} DT</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--secondary-color)]">
                            {parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right">{t("user_orders.table.total")}</td>
                        <td className="px-4 py-3 text-right text-[var(--secondary-color)] text-xl">
                          {parseFloat(selectedOrder.total).toFixed(3)} DT
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Bouton fermer */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-medium"
                >
                  {t("user_orders.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Produit (UI Pro) */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header Pro */}
            <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <FaShoppingBag className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full">{selectedProduct.type || t("common.not_specified")}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProductDetails(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {loadingProductDetails ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-[var(--secondary-color)] mb-4" size={50} />
                  <p className="text-gray-500 font-medium animate-pulse">{t("common.loading_details")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Colonne Gauche: Images Galleria */}
                  <div className="space-y-4">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <>
                        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 relative group">
                          <img
                            src={getImageUrl(selectedProduct.images[selectedProduct.main_image_index || 0])}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[var(--primary-color)] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            Principale
                          </div>
                        </div>
                        {selectedProduct.images.length > 1 && (
                          <div className="grid grid-cols-3 gap-3">
                            {selectedProduct.images.map((img, idx) => {
                              if (idx === (selectedProduct.main_image_index || 0)) return null;
                              return (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:border-[var(--secondary-color)] transition-all cursor-pointer">
                                  <img
                                    src={getImageUrl(img)}
                                    alt={`${selectedProduct.name} ${idx}`}
                                    className="w-full h-full object-cover hover:opacity-80"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <FaImage size={64} className="mb-4 opacity-50" />
                        <p className="font-medium">Aucune image disponible</p>
                      </div>
                    )}
                  </div>

                  {/* Colonne Droite: Infos & Variantes */}
                  <div className="flex flex-col gap-6">
                    {/* Description */}
                    <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                      <h4 className="flex items-center gap-2 text-lg font-bold text-orange-900 mb-3">
                        <FaInfoCircle className="text-orange-500" /> Description
                      </h4>
                      <p className="text-orange-900/80 leading-relaxed text-sm">
                        {selectedProduct.description || t("user_orders.no_description")}
                      </p>
                    </div>

                    {/* Ingrédients */}
                    {selectedProduct.ingredients && (
                      <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-900 mb-3">
                          <FaBoxOpen className="text-emerald-500" /> {t("products.ingredients")}
                        </h4>
                        <p className="text-emerald-900/80 leading-relaxed text-sm">
                          {formatIngredients(selectedProduct.ingredients)}
                        </p>
                      </div>
                    )}

                    {/* Variantes */}
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex-1">
                      <h4 className="flex items-center gap-2 text-lg font-bold text-blue-900 mb-4">
                        <FaShoppingBag className="text-blue-500" /> {t("user_orders.variants")}
                      </h4>
                      {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                        <div className="space-y-3">
                          {selectedProduct.variants.map((variant, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-blue-50 hover:border-blue-200 transition-all group">
                              <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-800 transition">
                                {variant.size}
                              </span>
                              <div className="text-right">
                                <span className="block text-lg font-black text-[var(--secondary-color)]">
                                  {parseFloat(variant.price).toFixed(3)} DT
                                </span>
                                {variant.weight && (
                                  <span className="block text-xs text-gray-400 font-medium">Poids: {variant.weight}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-900/60 font-medium text-center py-4">{t("user_orders.no_variants")}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pied Pro */}
            <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-end flex-shrink-0 rounded-b-[2rem]">
              <button
                onClick={() => setShowProductDetails(false)}
                className="px-8 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black hover:shadow-lg transition-all font-bold text-sm"
              >
                Fermer les détails
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;