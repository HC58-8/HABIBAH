// src/pages/AdminOrdersPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaShoppingBag, FaSpinner, FaEye, FaCheck, FaTimes,
  FaTruck, FaBoxOpen, FaCalendarAlt, FaUser, FaPhone,
  FaMapMarkerAlt, FaEnvelope, FaSearch, FaDownload, FaPrint, FaTrash,
  FaImage, FaInfoCircle, FaWeightHanging, FaTag, FaList, FaArrowLeft
} from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import PageHeader from "../components/PageHeader";

import { API, BACKEND_URL } from "../config/api";

const ORDER_API = API.ORDERS;
const PRODUCT_API = API.PRODUCTS;

// ✅ FIX: statusConfig déplacé HORS du composant → plus de dépendance manquante dans useCallback
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: <MdPending className="text-yellow-600" />
  },
  confirmed: {
    label: "Confirmée",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: <GiConfirmed className="text-blue-600" />
  },
  preparing: {
    label: "En préparation",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: <FaBoxOpen className="text-purple-600" />
  },
  shipped: {
    label: "Expédiée",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: <FaTruck className="text-indigo-600" />
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: <FaCheck className="text-green-600" />
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: <FaTimes className="text-red-600" />
  }
};

function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  // ✅ NEW: conserver la commande parente quand on navigue vers le détail produit
  const [productSourceOrder, setProductSourceOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [productImages, setProductImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, preparing: 0,
    shipped: 0, delivered: 0, cancelled: 0, revenue: 0
  });

  // ================= CHARGER LES DÉTAILS D'UN PRODUIT =================
  const loadProductDetails = async (productId, sourceOrder = null) => {
    // Mémoriser la commande d'où on vient pour le lien retour
    setProductSourceOrder(sourceOrder);

    if (productDetails[productId]) {
      setSelectedProduct(productDetails[productId]);
      setShowProductDetails(true);
      return;
    }

    setLoadingProductDetails(true);
    try {
      const res = await axios.get(`${PRODUCT_API}/${productId}`);
      setProductDetails(prev => ({ ...prev, [productId]: res.data }));
      setSelectedProduct(res.data);
      setShowProductDetails(true);
    } catch (error) {
      console.error("❌ Erreur chargement détails produit:", error);
      alert("Erreur lors du chargement des détails du produit");
    } finally {
      setLoadingProductDetails(false);
    }
  };

  // ================= RETOUR VERS LA COMMANDE PARENTE =================
  const handleBackToOrder = () => {
    setShowProductDetails(false);
    if (productSourceOrder) {
      setSelectedOrder(productSourceOrder);
      setShowDetails(true);
    }
    setProductSourceOrder(null);
  };

  // ================= CHARGER LES IMAGES DES PRODUITS =================
  const loadProductImages = useCallback(async (ordersData) => {
    const productIds = new Set();
    ordersData.forEach(order => {
      order.items?.forEach(item => {
        if (item.product_id || item.productId) {
          productIds.add(item.product_id || item.productId);
        }
      });
    });

    if (productIds.size === 0) return;

    setLoadingImages(true);
    const images = {};

    try {
      await Promise.all([...productIds].map(async (productId) => {
        try {
          const res = await axios.get(`${PRODUCT_API}/${productId}`);
          if (res.data?.images?.length > 0) {
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
    } finally {
      setLoadingImages(false);
    }
  }, []); // ✅ FIX: statusConfig est maintenant hors du composant, pas besoin de le lister

  // ================= CALCULER STATISTIQUES =================
  // ✅ FIX: statusConfig est hors du composant → pas de dépendance manquante
  const calculateStats = useCallback((ordersData) => {
    const newStats = {
      total: ordersData.length,
      pending: 0, confirmed: 0, preparing: 0,
      shipped: 0, delivered: 0, cancelled: 0, revenue: 0
    };
    ordersData.forEach(order => {
      if (statusConfig[order.status]) newStats[order.status]++;
      if (order.status === 'delivered' || order.status === 'confirmed') {
        newStats.revenue += parseFloat(order.total_amount) || 0;
      }
    });
    setStats(newStats);
  }, []); // ✅ FIX: plus de dépendance manquante

  // ================= CHARGER LES COMMANDES =================
  const fetchOrders = useCallback(async (token) => {
    setLoading(true);
    try {
      const res = await axios.get(ORDER_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      setFilteredOrders(res.data);
      calculateStats(res.data);
      await loadProductImages(res.data);
    } catch (error) {
      console.error("❌ Erreur chargement commandes:", error);
      alert("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }, [calculateStats, loadProductImages]);

  // ================= VÉRIFIER ADMIN =================
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) { navigate("/account"); return; }
      try {
        const userData = JSON.parse(userStr);
        if (userData.email !== "zrirhabibah@gmail.com") {
          alert("Accès réservé à l'administrateur");
          navigate("/");
          return;
        }
        await fetchOrders(token);
      } catch (error) {
        console.error("Erreur vérification admin:", error);
        navigate("/account");
      }
    };
    checkAdmin();
  }, [navigate, fetchOrders]);

  // ================= FILTRER LES COMMANDES =================
  useEffect(() => {
    let filtered = [...orders];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_phone?.includes(term) ||
        order.customer_email?.toLowerCase().includes(term) ||
        order.id?.toString().includes(term)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        switch (dateFilter) {
          case "today": return orderDate >= today;
          case "week": {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          }
          default: return true;
        }
      });
    }
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, dateFilter, orders]);

  // ================= METTRE À JOUR STATUT =================
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Changer le statut en "${statusConfig[newStatus].label}" ?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${ORDER_API}/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders(token);
      alert("✅ Statut mis à jour avec succès");
    } catch (error) {
      console.error("❌ Erreur mise à jour statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // ================= SUPPRIMER COMMANDE =================
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${ORDER_API}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchOrders(token);
      alert("✅ Commande supprimée avec succès");
    } catch (error) {
      console.error("❌ Erreur suppression commande:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // ================= FORMATER DATE =================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  // ================= CONSTRUIRE URL IMAGE =================
  const getImageUrl = (productId, imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // ================= FORMATER INGRÉDIENTS =================
  const formatIngredients = (ingredients) => {
    if (!ingredients) return "Non spécifié";
    if (Array.isArray(ingredients)) return ingredients.join(", ");
    if (typeof ingredients === 'string') return ingredients;
    return JSON.stringify(ingredients);
  };

  // ================= EXPORTER EN CSV =================
  const exportToCSV = () => {
    const headers = ['ID', 'Client', 'Téléphone', 'Email', 'Adresse', 'Total', 'Statut', 'Date', 'Note'];
    const csvData = filteredOrders.map(order => [
      order.id, order.customer_name, order.customer_phone,
      order.customer_email || '', order.customer_address, order.total_amount,
      order.status, formatDate(order.created_at), order.note || ''
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[var(--secondary-color)] mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <PageHeader
          title="Gestion des commandes"
          subtitle="Administration - Toutes les commandes"
        />

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-[var(--primary-color)]">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow p-4 border-2 border-yellow-200">
            <p className="text-sm text-yellow-700">En attente</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-4 border-2 border-blue-200">
            <p className="text-sm text-blue-700">Confirmées</p>
            <p className="text-2xl font-bold text-blue-800">{stats.confirmed}</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow p-4 border-2 border-purple-200">
            <p className="text-sm text-purple-700">Préparation</p>
            <p className="text-2xl font-bold text-purple-800">{stats.preparing}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow p-4 border-2 border-indigo-200">
            <p className="text-sm text-indigo-700">Expédiées</p>
            <p className="text-2xl font-bold text-indigo-800">{stats.shipped}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-4 border-2 border-green-200">
            <p className="text-sm text-green-700">Livrées</p>
            <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl shadow p-4 border-2 border-emerald-200">
            <p className="text-sm text-emerald-700">CA</p>
            <p className="text-lg font-bold text-emerald-800">{stats.revenue.toFixed(3)} DT</p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none bg-white"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <button
                onClick={exportToCSV}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                title="Exporter en CSV"
              >
                <FaDownload />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)]">
          <h2 className="text-xl font-bold text-[var(--primary-color)] mb-6 flex items-center gap-2">
            <FaShoppingBag /> Commandes ({filteredOrders.length})
            {loadingImages && <FaSpinner className="animate-spin ml-2" />}
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-[var(--secondary-color)] transition">

                  {/* En-tête commande */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[var(--primary-color)] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <FaUser className="text-[var(--secondary-color)]" />
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <FaCalendarAlt className="text-[var(--secondary-color)]" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1 ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.icon}
                        {statusConfig[order.status]?.label}
                      </span>
                      <span className="text-xl font-bold text-[var(--secondary-color)]">
                        {parseFloat(order.total_amount).toFixed(3)} DT
                      </span>
                    </div>
                  </div>

                  {/* Détails client */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-[var(--secondary-color)]" />
                      {order.customer_phone}
                    </div>
                    {order.customer_email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaEnvelope className="text-[var(--secondary-color)]" />
                        {order.customer_email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-[var(--secondary-color)]" />
                      {order.customer_address}
                    </div>
                  </div>

                  {/* Produits commandés avec images cliquables */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaShoppingBag /> Produits :
                    </p>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => {
                        const productId = item.product_id || item.productId;
                        const imageUrl = getImageUrl(productId, productImages[productId]);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-white p-2 rounded-lg cursor-pointer hover:shadow-md transition border border-gray-200 hover:border-[var(--secondary-color)]"
                            // ✅ NEW: on passe la commande parente en contexte
                            onClick={() => loadProductDetails(productId, order)}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.productname || item.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <FaImage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800 truncate">
                                  {item.productname || item.productName}
                                </p>
                                <FaInfoCircle className="text-[var(--secondary-color)] text-xs" title="Cliquez pour voir les détails" />
                              </div>
                              <div className="flex flex-wrap gap-x-4 text-sm">
                                {item.size && <span className="text-gray-500">Taille: {item.size}</span>}
                                <span className="text-gray-500">Qté: {item.quantity}</span>
                                <span className="font-semibold text-[var(--secondary-color)]">
                                  {parseFloat(item.unit_price || item.price).toFixed(3)} DT
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Sous-total</p>
                              <p className="font-bold text-[var(--primary-color)]">
                                {parseFloat(item.subtotal).toFixed(3)} DT
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 justify-end border-t pt-4">
                    <select
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      value=""
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none bg-white"
                    >
                      <option value="" disabled>Changer statut</option>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                      <FaEye /> Détails commande
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
                    >
                      <FaTrash /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Modal Détails commande ===== */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--primary-color)]">
                  Détails commande #{selectedOrder.id}
                </h3>
                <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Statut actuel */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Statut actuel</p>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.icon}
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</span>
                </div>
              </div>

              {/* Informations client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#FCFAED] p-4 rounded-xl">
                  <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                    <FaUser /> Client
                  </h4>
                  <p className="mb-2"><span className="font-medium">Nom:</span> {selectedOrder.customer_name}</p>
                  <p className="mb-2"><span className="font-medium">Téléphone:</span> {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                  )}
                </div>
                <div className="bg-[#FCFAED] p-4 rounded-xl">
                  <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt /> Livraison
                  </h4>
                  <p className="mb-2"><span className="font-medium">Adresse:</span> {selectedOrder.customer_address}</p>
                  {selectedOrder.note && (
                    <p className="mb-2"><span className="font-medium">Note:</span> {selectedOrder.note}</p>
                  )}
                </div>
              </div>

              {/* Produits commandés — cliquables avec lien retour */}
              <div className="mb-6">
                <h4 className="font-semibold text-[var(--primary-color)] mb-3">Produits commandés</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--primary-color)] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Image</th>
                        <th className="px-4 py-3 text-left">Produit</th>
                        <th className="px-4 py-3 text-left">Taille</th>
                        <th className="px-4 py-3 text-right">Prix unit.</th>
                        <th className="px-4 py-3 text-right">Qté</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => {
                        const productId = item.product_id || item.productId;
                        const imageUrl = getImageUrl(productId, productImages[productId]);
                        return (
                          <tr key={idx} className="hover:bg-gray-100">
                            <td className="px-4 py-2">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.productname || item.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <FaImage className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{item.productname || item.productName}</td>
                            <td className="px-4 py-3">{item.product_size || item.size || '-'}</td>
                            <td className="px-4 py-3 text-right">{parseFloat(item.unit_price || item.price).toFixed(3)} DT</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[var(--secondary-color)]">
                              {parseFloat(item.subtotal).toFixed(3)} DT
                            </td>
                            <td className="px-4 py-3 text-center">
                              {/* ✅ NEW: on ferme showDetails et on ouvre le produit avec lien retour */}
                              <button
                                onClick={() => {
                                  setShowDetails(false);
                                  loadProductDetails(productId, selectedOrder);
                                }}
                                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium border border-blue-200"
                                title="Voir détails produit"
                              >
                                <FaEye size={13} /> Voir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td colSpan="6" className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right text-[var(--secondary-color)]">
                          {parseFloat(selectedOrder.total_amount).toFixed(3)} DT
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaPrint /> Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal Détails Produit (enrichi) ===== */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">

              {/* En-tête avec bouton retour vers la commande */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  {productSourceOrder && (
                    <button
                      onClick={handleBackToOrder}
                      className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                      title="Retour à la commande"
                    >
                      <FaArrowLeft size={13} />
                      Commande #{productSourceOrder.id}
                    </button>
                  )}
                  <h3 className="text-2xl font-bold text-[var(--primary-color)]">
                    Détails du produit
                  </h3>
                </div>
                <button onClick={() => setShowProductDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>

              {loadingProductDetails ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-[var(--secondary-color)] mx-auto mb-4" size={48} />
                  <p className="text-gray-600">Chargement des détails...</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* ✅ NEW: Récapitulatif de la commande parente */}
                  {productSourceOrder && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <FaShoppingBag /> Commande associée #{productSourceOrder.id}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaUser className="text-blue-500" />
                            <span className="font-medium">Client :</span> {productSourceOrder.customer_name}
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaPhone className="text-blue-500" />
                            <span className="font-medium">Tél :</span> {productSourceOrder.customer_phone}
                          </p>
                          {productSourceOrder.customer_email && (
                            <p className="flex items-center gap-2 text-gray-700">
                              <FaEnvelope className="text-blue-500" />
                              <span className="font-medium">Email :</span> {productSourceOrder.customer_email}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaMapMarkerAlt className="text-blue-500" />
                            <span className="font-medium">Adresse :</span> {productSourceOrder.customer_address}
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <FaCalendarAlt className="text-blue-500" />
                            <span className="font-medium">Date :</span> {formatDate(productSourceOrder.created_at)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusConfig[productSourceOrder.status]?.color}`}>
                              {statusConfig[productSourceOrder.status]?.icon}
                              {statusConfig[productSourceOrder.status]?.label}
                            </span>
                            <span className="font-bold text-[var(--secondary-color)]">
                              {parseFloat(productSourceOrder.total_amount).toFixed(3)} DT
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ✅ NEW: Liste de tous les produits de la commande */}
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                          Tous les produits de cette commande
                        </p>
                        <div className="space-y-2">
                          {productSourceOrder.items?.map((item, idx) => {
                            const pId = item.product_id || item.productId;
                            const isCurrent = pId === selectedProduct.id;
                            const imgUrl = getImageUrl(pId, productImages[pId]);
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                                  isCurrent
                                    ? 'bg-blue-100 border-blue-400 ring-1 ring-blue-400'
                                    : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer hover:shadow-sm'
                                }`}
                                onClick={() => !isCurrent && loadProductDetails(pId, productSourceOrder)}
                              >
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={item.productname || item.productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <FaImage className="text-gray-300" size={12} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">
                                    {item.productname || item.productName}
                                    {isCurrent && (
                                      <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                                        Actuel
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qté: {item.quantity}
                                    {item.size ? ` · Taille: ${item.size}` : ''}
                                    {' · '}{parseFloat(item.subtotal).toFixed(3)} DT
                                  </p>
                                </div>
                                {!isCurrent && (
                                  <FaEye size={13} className="text-blue-400 flex-shrink-0" title="Voir ce produit" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Images du produit */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaImage /> Images
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={`http://localhost:5000${img}`}
                              alt={`${selectedProduct.name} - ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {idx === selectedProduct.main_image_index && (
                              <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Principale
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations générales + Variantes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#FCFAED] p-4 rounded-xl">
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaTag /> Informations générales
                      </h4>
                      <p className="mb-2"><span className="font-medium">Nom:</span> {selectedProduct.name}</p>
                      <p className="mb-2"><span className="font-medium">Type:</span> {selectedProduct.type || 'Non spécifié'}</p>
                      <p className="mb-2"><span className="font-medium">Description:</span> {selectedProduct.description || 'Aucune description'}</p>
                    </div>
                    <div className="bg-[#FCFAED] p-4 rounded-xl">
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaList /> Variantes
                      </h4>
                      {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProduct.variants.map((variant, idx) => (
                            <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                              <p className="font-medium">{variant.size}</p>
                              <p className="text-sm text-gray-600">Prix: {variant.price} DT</p>
                              {variant.weight && <p className="text-sm text-gray-600">Poids: {variant.weight}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Aucune variante</p>
                      )}
                    </div>
                  </div>

                  {/* Ingrédients */}
                  <div className="bg-[#FCFAED] p-4 rounded-xl">
                    <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                      <FaWeightHanging /> Ingrédients
                    </h4>
                    <p>{formatIngredients(selectedProduct.ingredients)}</p>
                  </div>

                  {/* Métadonnées */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <p>ID: {selectedProduct.id}</p>
                    {selectedProduct.created_at && (
                      <p>Créé le: {formatDate(selectedProduct.created_at)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-between mt-6">
                {productSourceOrder ? (
                  <button
                    onClick={handleBackToOrder}
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 font-medium"
                  >
                    <FaArrowLeft /> Retour commande #{productSourceOrder.id}
                  </button>
                ) : <div />}
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;