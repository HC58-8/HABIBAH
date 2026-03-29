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
import PageHeader from "../components/PageHeader";

const ORDER_API = process.env.REACT_APP_ORDER_API || "http://localhost:5000/api/orders";
const PRODUCT_API = "http://localhost:5000/api/products";

function MyOrdersPage() {
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
          alert("Session expirée. Veuillez vous reconnecter.");
          navigate("/account");
        } else if (error.response?.status === 403) {
          alert("Accès non autorisé");
        } else if (error.code === 'ERR_NETWORK') {
          alert("Erreur de connexion au serveur. Vérifiez que le backend est lancé.");
        } else {
          alert("Erreur lors du chargement de vos commandes");
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
      alert("Erreur lors du chargement des détails du produit");
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
        order.customer_name?.toLowerCase().includes(term) ||
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
  const getImageUrl = (productId) => {
    const imagePath = productImages[productId];
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  // ================= FORMATER INGRÉDIENTS =================
  const formatIngredients = (ingredients) => {
    if (!ingredients) return "Non spécifié";
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
          <p className="text-gray-600">Chargement de vos commandes...</p>
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
          <FaArrowLeft /> Retour à l'accueil
        </button>

        <PageHeader 
          title="Mes commandes" 
          subtitle={`${user?.firstname || ''} ${user?.lastname || ''} - Historique de vos commandes`} 
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
                    {user.provider === 'google' ? 'Compte Google' : 'Compte local'}
                  </p>
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--primary-color)]">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500">En attente</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                  <p className="text-xs text-gray-500">Confirmées</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                  <p className="text-xs text-gray-500">Livrées</p>
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
                placeholder="Rechercher par numéro de commande ou produit..."
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
              <option value="all">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)]">
          <h2 className="text-xl font-bold text-[var(--primary-color)] mb-6 flex items-center gap-2">
            <FaHistory /> Historique des commandes ({filteredOrders.length})
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500 mb-2">Aucune commande trouvée</p>
              <p className="text-gray-400 mb-6">Vous n'avez pas encore passé de commande</p>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Découvrir nos produits
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
                          {order.customer_address?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.icon}
                        {statusConfig[order.status]?.label}
                      </span>
                      <span className="text-2xl font-bold text-[var(--secondary-color)]">
                        {parseFloat(order.total_amount).toFixed(3)} DT
                      </span>
                    </div>
                  </div>

                  {/* Produits commandés */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaShoppingBag /> Produits commandés :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items?.map((item, idx) => {
                        const productId = item.productId;
                        const imageUrl = getImageUrl(productId);
                        
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
                                <FaInfoCircle className="text-[var(--secondary-color)] text-xs opacity-0 group-hover:opacity-100 transition" title="Cliquez pour voir les détails" />
                              </div>
                              <div className="flex flex-wrap gap-x-4 text-sm">
                                {item.size && (
                                  <span className="text-gray-500">Taille: {item.size}</span>
                                )}
                                <span className="text-gray-500">Qté: {item.quantity}</span>
                                <span className="font-semibold text-[var(--secondary-color)]">
                                  {parseFloat(item.price).toFixed(3)} DT
                                </span>
                              </div>
                            </div>
                            
                            {/* Sous-total */}
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Sous-total</p>
                              <p className="font-bold text-[var(--primary-color)]">
                                {parseFloat(item.subtotal).toFixed(3)} DT
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
                        <span className="font-semibold">📝 Note :</span> {order.note}
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
                      <FaEye /> Voir détails complets
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
                  Détails commande #{selectedOrder.id}
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
                <p className="text-sm text-gray-500 mb-2">Statut actuel</p>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 text-base ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.icon}
                    {statusConfig[selectedOrder.status]?.label}
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
                    <FaUser /> Client
                  </h4>
                  <p className="mb-2"><span className="font-medium">Nom:</span> {selectedOrder.customer_name}</p>
                  <p className="mb-2"><span className="font-medium">Téléphone:</span> {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                  )}
                </div>

                <div className="bg-[#FCFAED] p-4 rounded-xl">
                  <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2 text-lg">
                    <FaMapMarkerAlt /> Livraison
                  </h4>
                  <p className="mb-2"><span className="font-medium">Adresse:</span> {selectedOrder.customer_address}</p>
                  {selectedOrder.note && (
                    <p className="mb-2"><span className="font-medium">Note:</span> {selectedOrder.note}</p>
                  )}
                </div>
              </div>

              {/* Produits commandés */}
              <div className="mb-6">
                <h4 className="font-semibold text-[var(--primary-color)] mb-3 text-lg">Produits commandés</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Produit</th>
                        <th className="px-4 py-3 text-left">Taille</th>
                        <th className="px-4 py-3 text-right">Prix unit.</th>
                        <th className="px-4 py-3 text-right">Qté</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          <td className="px-4 py-3 font-medium">{item.productName}</td>
                          <td className="px-4 py-3">{item.size || '-'}</td>
                          <td className="px-4 py-3 text-right">{parseFloat(item.price).toFixed(3)} DT</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--secondary-color)]">
                            {parseFloat(item.subtotal).toFixed(3)} DT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right text-[var(--secondary-color)] text-xl">
                          {parseFloat(selectedOrder.total_amount).toFixed(3)} DT
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
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Produit */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                <h3 className="text-2xl font-bold text-[var(--primary-color)]">
                  {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                >
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
                  
                  {/* Images du produit */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaImage /> Images
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={`http://localhost:5000${img}`}
                              alt={`${selectedProduct.name} - ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[var(--secondary-color)] transition"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-200"><FaImage className="text-gray-400" /></div>';
                              }}
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

                  {/* Informations générales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#FCFAED] p-4 rounded-xl">
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaInfoCircle /> Informations générales
                      </h4>
                      <p className="mb-2"><span className="font-medium">Nom:</span> {selectedProduct.name}</p>
                      <p className="mb-2"><span className="font-medium">Type:</span> {selectedProduct.type || 'Non spécifié'}</p>
                      <p className="mb-2"><span className="font-medium">Description:</span> {selectedProduct.description || 'Aucune description'}</p>
                    </div>

                    <div className="bg-[#FCFAED] p-4 rounded-xl">
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        <FaBoxOpen /> Variantes
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
                  {selectedProduct.ingredients && (
                    <div className="bg-[#FCFAED] p-4 rounded-xl">
                      <h4 className="font-semibold text-[var(--primary-color)] mb-3 flex items-center gap-2">
                        Ingrédients
                      </h4>
                      <p className="text-gray-700">{formatIngredients(selectedProduct.ingredients)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bouton fermer */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition font-medium"
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

export default MyOrdersPage;