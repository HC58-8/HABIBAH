// src/pages/ProductsPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaPlus, FaTimes, FaImage, FaStar,
  FaLeaf, FaPlusCircle, FaInfoCircle, FaSearch,
  FaFilter, FaChevronDown, FaChevronUp,
  FaWeightHanging, FaClock, FaAward,
  FaMortarPestle, FaSeedling,
  FaRegGem, FaCrown, FaWhatsapp,
  FaInstagram, FaFacebook, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaHeart, FaRegHeart, FaShoppingCart
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { API, getImageUrl } from "../config/api";

import Notification   from "../components/Notification";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState     from "../components/EmptyState";
import Pagination     from "../components/Pagination";
import ProductCard    from "../components/ProductCard";
import Navbar         from "../components/Navbar";
import SEO            from "../components/SEO";

const API_URL      = API.PRODUCTS;
const ADMIN_EMAIL  = "zrirhabibah@gmail.com";
const allowedSizes = ["250g", "500g", "1kg"];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden:  { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const fadeInUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
};

function ProductsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ── Vérification admin ───────────────────────────────────────
  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.email === ADMIN_EMAIL;

  // ── Données ──────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);

  // ── Formulaire (admin seulement) ──────────────────────────────
  const [formVisible,    setFormVisible]    = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name,           setName]           = useState("");
  const [type,           setType]           = useState("Zrir");
  const [description,    setDescription]    = useState("");
  const [ingredients,    setIngredients]    = useState([]);
  const [newIngredient,  setNewIngredient]  = useState("");
  const [variants,       setVariants]       = useState(allowedSizes.map(size => ({ size, price: "" })));
  const [images,         setImages]         = useState([null, null, null, null]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formErrors,     setFormErrors]     = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Filtres / pagination ──────────────────────────────────────
  const [searchTerm,  setSearchTerm]  = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [sortBy,      setSortBy]      = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // ── Wishlist ─────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState([]);

  // ── Quick view ───────────────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView,    setShowQuickView]    = useState(false);

  // ── Notification ─────────────────────────────────────────────
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  // ── Fetch ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Erreur fetch produits :", err);
      showNotification("error", t("products.error_fetch"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Validation ───────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!name.trim())        errors.name        = t("products.name_required") || "Le nom est requis";
    if (!description.trim()) errors.description = t("products.desc_required") || "La description est requise";
    if (ingredients.length === 0) errors.ingredients = t("products.ingredients_required") || "Au moins un ingrédient est requis";
    if (!variants.some(v => v.price && Number(v.price) > 0))
      errors.variants = t("products.variants_required") || "Au moins une variante avec un prix valide est requise";
    if (!images.some(img => img !== null) && !editingProduct)
      errors.images = t("products.images_required") || "Au moins une image est requise";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Ingrédients ──────────────────────────────────────────────
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };
  const handleRemoveIngredient = (i) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddIngredient(); }
  };

  // ── Images ───────────────────────────────────────────────────
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotification("error", "Veuillez sélectionner une image valide"); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "L'image ne doit pas dépasser 5 Mo"); return;
    }
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    if (mainImageIndex === index) {
      const first = newImages.findIndex((img, i) => i !== index && img);
      setMainImageIndex(first >= 0 ? first : 0);
    }
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification("error", "Veuillez corriger les erreurs du formulaire");
      return;
    }

    const formData = new FormData();
    formData.append("name",           name);
    formData.append("type",           type);
    formData.append("description",    description);
    formData.append("ingredients",    JSON.stringify(ingredients));
    formData.append("mainImageIndex", mainImageIndex);
    images.forEach(img => { if (img instanceof File) formData.append("images", img); });
    formData.append("variants", JSON.stringify(
      variants.map(v => ({ size: v.size, price: Number(v.price) }))
    ));

    const config = {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders() },
      onUploadProgress: (e) =>
        setUploadProgress(Math.round((e.loaded * 100) / e.total)),
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/${editingProduct._id}`, formData, config);
        showNotification("success", t("products.edit_success"));
      } else {
        await axios.post(`${API_URL}/add`, formData, config);
        showNotification("success", t("products.add_success"));
      }
      setTimeout(() => setUploadProgress(0), 1000);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("Erreur ajouter/modifier produit :", err);
      if (err.response?.status === 401) {
        showNotification("error", "Session expirée, veuillez vous reconnecter");
        navigate("/login");
      } else if (err.response?.status === 403) {
        showNotification("error", "Accès refusé : réservé aux administrateurs");
      } else {
        showNotification("error", t("products.error_save") || "Erreur lors de l'enregistrement du produit");
      }
      setUploadProgress(0);
    }
  };

  // ── Reset ────────────────────────────────────────────────────
  const resetForm = () => {
    setFormVisible(false);
    setEditingProduct(null);
    setName(""); setType("Zrir"); setDescription("");
    setIngredients([]); setNewIngredient("");
    setVariants(allowedSizes.map(size => ({ size, price: "" })));
    setImages([null, null, null, null]);
    setMainImageIndex(0);
    setFormErrors({}); setUploadProgress(0);
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm(t("products.delete_confirm"))) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
      fetchProducts();
      showNotification("success", t("products.delete_success"));
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("error", "Session expirée, veuillez vous reconnecter");
        navigate("/login");
      } else if (err.response?.status === 403) {
        showNotification("error", "Accès refusé : réservé aux administrateurs");
      } else {
        showNotification("error", "Erreur lors de la suppression");
      }
    }
  };

  // ── Edit ─────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setEditingProduct(p);
    setName(p.name); setType(p.type);
    setDescription(p.description || "");
    setIngredients(p.ingredients || []);
    setVariants(p.variants);
    setImages(p.images || [null, null, null, null]);
    setMainImageIndex(p.mainImageIndex || 0);
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenNewForm = () => {
    resetForm();
    setFormVisible(true);
  };

  // ── Wishlist ─────────────────────────────────────────────────
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ── Quick view ───────────────────────────────────────────────
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
    document.body.style.overflow = "hidden";
  };

  const closeQuickView = () => {
    setShowQuickView(false);
    setQuickViewProduct(null);
    document.body.style.overflow = "unset";
  };

  // ── Filtrage / tri / pagination ───────────────────────────────
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ingredients?.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = typeFilter === "all" || p.type === typeFilter;
      return matchSearch && matchType;
    });

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)));
        break;
      case "price-desc":
        filtered.sort((a, b) => Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price)));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, typeFilter, sortBy]);

  const totalPages      = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfFirst    = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfFirst + productsPerPage);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFAED] via-[#FFF5E6] to-[#FCFAED]">
      <SEO 
        title={t("navbar.products") || "Nos Produits"}
        description="Découvrez notre catalogue de produits artisanaux 100% naturels : Zrir, Bsissa et autres délices traditionnels tunisiens. Fait main avec passion par Habibah."
        keywords="Zrir, Bsissa, produits artisanaux, 100% naturel, Habibah, tradition tunisienne, délices tunisiens"
      />

      {/* ── Navbar ────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Notification ──────────────────────────────────────── */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
      />

      {/* ── Quick View Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showQuickView && quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeQuickView}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative p-6 sm:p-8">
                <button
                  onClick={closeQuickView}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <FaTimes size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Images */}
                  <div>
                    <div className="relative rounded-2xl overflow-hidden mb-4 group">
                      <img
                        src={
                          quickViewProduct.images?.[quickViewProduct.mainImageIndex || 0]
                            ? getImageUrl(quickViewProduct.images[quickViewProduct.mainImageIndex || 0])
                            : "/placeholder.jpg"
                        }
                        alt={quickViewProduct.name}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute top-4 left-4 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        {quickViewProduct.type === "Zrir"
                          ? <><FaCrown size={12} /> {t('products.signature')}</>
                          : <><FaSeedling size={12} /> {t('products.natural')}</>
                        }
                      </span>
                    </div>

                    {quickViewProduct.images?.filter(Boolean).length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {quickViewProduct.images.map((img, idx) =>
                          img ? (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt=""
                              className={`w-full h-16 object-cover rounded-lg cursor-pointer transition-all ${
                                idx === (quickViewProduct.mainImageIndex || 0)
                                  ? "ring-2 ring-[var(--secondary-color)] ring-offset-2"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                              onClick={() => setQuickViewProduct({ ...quickViewProduct, mainImageIndex: idx })}
                            />
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{quickViewProduct.name}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">{quickViewProduct.description}</p>

                    {quickViewProduct.ingredients?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FaMortarPestle className="text-[var(--primary-color)]" />
                          {t('products.ingredients_natural') || t('products.ingredients')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {quickViewProduct.ingredients.map((ing, idx) => (
                            <span key={idx} className="bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] px-3 py-1 rounded-full text-sm border border-[var(--primary-color)] border-opacity-20">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaWeightHanging className="text-[var(--primary-color)]" />
                        {t('products.available_formats')}
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {quickViewProduct.variants?.filter(v => v.price > 0).map((v, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200 hover:border-[var(--secondary-color)] transition-colors cursor-pointer">
                            <div className="font-semibold text-gray-800 text-sm">{v.size}</div>
                            <div className="text-[var(--secondary-color)] font-bold">{v.price.toFixed(3)} DT</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleWishlist(quickViewProduct._id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                      >
                        {wishlist.includes(quickViewProduct._id)
                          ? <><FaHeart className="text-red-500" /> {t('products.favorite')}</>
                          : <><FaRegHeart /> {t('products.favorites')}</>
                        }
                      </button>
                      <button className="flex-1 bg-[var(--secondary-color)] text-white py-3 rounded-xl hover:bg-[var(--primary-color)] transition flex items-center justify-center gap-2 font-medium">
                        <FaShoppingCart /> {t('products.add_to_cart')}
                      </button>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
                      <span className="bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-[var(--primary-color)] border-opacity-20">
                        <FaLeaf /> {t('products.natural')}
                      </span>
                      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-amber-200">
                        <FaAward /> {t('products.artisanal')}
                      </span>
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-purple-200">
                        <FaRegGem /> {t('products.premium')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contenu principal (décalé sous la Navbar fixe h-20) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">

        {/* Hero */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-14"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] opacity-10 rounded-3xl" />
          <div className="relative py-14 px-8 text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-800 mb-4"
            >
              {t('products.title_1')}{" "}
              <span className="text-[var(--primary-color)]">{t('products.title_2')}</span>{" "}
              <span className="text-[var(--secondary-color)]">{t('products.title_3')}</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              {t('products.subtitle')}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="w-20 h-1 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] mx-auto mt-6"
            />
          </div>
        </motion.div>

        {/* ── Bouton Nouveau produit — admin uniquement ───────── */}
        {isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-10"
          >
            <button
              onClick={formVisible ? resetForm : handleOpenNewForm}
              className="bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] text-white px-10 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg font-semibold group"
              style={{ boxShadow: "0 8px 24px -8px var(--secondary-color)" }}
            >
              {formVisible
                ? <><FaTimes className="group-hover:rotate-90 transition-transform duration-300" /> {t('products.cancel')}</>
                : <><FaPlus className="group-hover:rotate-180 transition-transform duration-300" /> {t('products.new_product')}</>
              }
            </button>
          </motion.div>
        )}

        {/* ── Formulaire — admin uniquement ───────────────────── */}
        <AnimatePresence>
          {isAdmin && formVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-[var(--primary-color)] border-opacity-20">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
                  {editingProduct ? `✨ ${t('products.edit_product')}` : `✨ ${t('products.add_product')}`}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Colonne gauche */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          {t('products.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" value={name}
                          onChange={e => setName(e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition-all ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Ex: Zrir Royal"
                        />
                        {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">{t('products.filter_type')}</label>
                        <select
                          value={type} onChange={e => setType(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                        >
                          <option value="Zrir">Zrir</option>
                          <option value="Bsissa">Bsissa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          {t('products.description')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={description} onChange={e => setDescription(e.target.value)}
                          rows="4"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
                          placeholder="..."
                        />
                        {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                      </div>
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          {t('products.ingredients')} <span className="text-red-500">*</span>
                        </label>
                        <div className="mb-3 flex flex-wrap gap-2 min-h-[2rem]">
                          {ingredients.map((ing, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-[var(--primary-color)] bg-opacity-10 px-3 py-1.5 rounded-lg flex  items-center gap-2 border border-[var(--primary-color)] border-opacity-30"
                            >
                              <FaLeaf className="text-[var(--primary-color)] text-xs text-white" />
                              <span className="text-white text-sm">{ing}</span>
                              <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-red-400 hover:text-red-600 transition">
                                <FaTimes size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text" value={newIngredient}
                            onChange={e => setNewIngredient(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                            placeholder="Ex: Miel pur"
                          />
                          <button type="button" onClick={handleAddIngredient}
                            className="bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FaPlusCircle /> {t('products.add')}
                          </button>
                        </div>
                        {formErrors.ingredients && <p className="mt-2 text-sm text-red-500">{formErrors.ingredients}</p>}
                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <FaInfoCircle /> Appuyez sur Entrée pour ajouter rapidement
                        </p>
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">{t('products.variants')}</label>
                        <div className="space-y-3">
                          {variants.map((v, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-16 font-semibold text-gray-700 text-sm">{v.size}</span>
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-3 text-gray-400 text-sm">DT</span>
                                <input
                                  type="number" step="0.001" min="0" value={v.price}
                                  onChange={e => {
                                    const nv = [...variants];
                                    nv[i].price = e.target.value;
                                    setVariants(nv);
                                  }}
                                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] text-sm"
                                  placeholder="0.000"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {formErrors.variants && <p className="mt-1 text-sm text-red-500">{formErrors.variants}</p>}
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          {t('products.images')} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index}
                              className={`relative group border-2 border-dashed rounded-xl p-2 transition-all hover:border-[var(--secondary-color)] ${images[index] ? "border-green-300 bg-green-50" : "border-gray-300"}`}
                            >
                              {images[index] ? (
                                <div className="relative">
                                  <img
                                    src={images[index] instanceof File
                                      ? URL.createObjectURL(images[index])
                                      : getImageUrl(images[index])}
                                    alt=""
                                    className="w-full h-28 object-cover rounded-lg"
                                  />
                                  <button type="button" onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                  {mainImageIndex === index && (
                                    <div className="absolute top-1 left-1 bg-yellow-500 text-white p-1 rounded-full">
                                      <FaStar size={10} />
                                    </div>
                                  )}
                                  <button type="button" onClick={() => setMainImageIndex(index)}
                                    className="absolute bottom-1 left-1 bg-white text-gray-600 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                  >
                                    {t('products.main_image')}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-28">
                                  <FaImage className="text-gray-300 mb-1" size={22} />
                                  <span className="text-xs text-gray-400">Image {index + 1}</span>
                                </div>
                              )}
                              <input type="file" accept="image/*"
                                onChange={e => handleImageChange(e, index)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                        {formErrors.images && <p className="mt-1 text-sm text-red-500">{formErrors.images}</p>}
                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <FaInfoCircle /> Survolez une image pour la définir comme principale
                        </p>
                      </div>
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="pt-2">
                      <div className="flex mb-1 items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--secondary-color)]">Téléchargement en cours…</span>
                        <span className="text-xs font-semibold text-[var(--secondary-color)]">{uploadProgress}%</span>
                      </div>
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 pt-4">
                    <button type="button" onClick={resetForm}
                      className="px-8 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-semibold"
                    >
                      {t('products.cancel')}
                    </button>
                    <button type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                    >
                      {editingProduct ? t('products.submit_edit') : t('products.submit_add')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barre de filtres ──────────────────────────────────── */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder={t('products.search_placeholder')}
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[var(--secondary-color)] focus:ring-2 focus:ring-[var(--secondary-color)] focus:ring-opacity-20 transition-all text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all border-2 ${
                  showFilters
                    ? "border-[var(--secondary-color)] text-[var(--secondary-color)] bg-[var(--secondary-color)] bg-opacity-5"
                    : "border-gray-200 text-gray-600 hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)]"
                }`}
              >
                <FaFilter size={13} />
                {t('products.filters')}
                {showFilters ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
                      <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[var(--secondary-color)] text-sm"
                      >
                        <option value="all">Tous les types</option>
                        <option value="Zrir">Zrir</option>
                        <option value="Bsissa">Bsissa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Trier par</label>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[var(--secondary-color)] text-sm"
                      >
                        <option value="newest">Plus récents</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="name-asc">Nom (A–Z)</option>
                        <option value="name-desc">Nom (Z–A)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Compteur résultats */}
        <div className="mb-5 flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-[var(--secondary-color)]">{filteredProducts.length}</span>{" "}
            produit{filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
          </p>
          {(searchTerm || typeFilter !== "all") && (
            <button
              onClick={() => { setSearchTerm(""); setTypeFilter("all"); setCurrentPage(1); }}
              className="text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-1"
            >
              <FaTimes size={10} /> Réinitialiser
            </button>
          )}
        </div>

        {/* ── Grille produits ───────────────────────────────────── */}
        {loading ? (
          <LoadingSpinner />
        ) : currentProducts.length === 0 ? (
          <EmptyState onAddProduct={isAdmin ? handleOpenNewForm : undefined} />
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentProducts.map(p => (
                <motion.div key={p._id} variants={itemVariants}>
                  <ProductCard
                    product={p}
                    isAdmin={isAdmin}
                    onEdit={isAdmin ? handleEdit    : undefined}
                    onDelete={isAdmin ? handleDelete : undefined}
                    onQuickView={openQuickView}
                    onToggleWishlist={toggleWishlist}
                    isInWishlist={wishlist.includes(p._id)}
                  />
                </motion.div>
              ))}
            </motion.div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* ── Section Contact ───────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-20 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-3xl p-10 sm:p-14 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24 pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold mb-3 text-center">Contactez-nous</h3>
            <p className="text-lg mb-10 text-center opacity-90 max-w-xl mx-auto">
              Pour toute question ou commande spéciale, nous sommes disponibles pour vous
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { icon: <FaPhone className="text-2xl mb-2" />,        label: "Téléphone", value: "+216 25 257 099" },
                { icon: <FaEnvelope className="text-2xl mb-2" />,     label: "Email",     value: "zrirhabibah@gmail.com" },
                { icon: <FaMapMarkerAlt className="text-2xl mb-2" />, label: "Adresse",   value: "Tunis, Tunisie" },
                { icon: <FaClock className="text-2xl mb-2" />,        label: "Horaires",  value: "7J/7 : 24H/24" },
              ].map(({ icon, label, value }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center p-4 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm text-center"
                >
                  {icon}
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs opacity-80 mt-1">{value}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              {[
                { icon: <FaFacebook size={20} />,  href: "#" },
                { icon: <FaInstagram size={20} />, href: "#" },
                { icon: <FaWhatsapp size={20} />,  href: "#" },
              ].map(({ icon, href }, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white text-[var(--primary-color)] rounded-full flex items-center justify-center hover:shadow-xl transition-all"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Footer léger ─────────────────────────────────────── */}
        <motion.footer
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-12 text-center text-gray-400 text-sm pb-6"
        >
          <p>© {new Date().getFullYear()} Habibah — Tous droits réservés</p>
          <p className="mt-1">Zrir et Bsissa artisanaux préparés avec amour ✦ Tunisie</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default ProductsPage;