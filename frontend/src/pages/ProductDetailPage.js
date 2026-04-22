// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaLeaf, FaShoppingCart, FaImage,
  FaStar, FaTag, FaBoxOpen, FaSpinner, FaCheck
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { API, getImageUrl } from "../config/api";
import { useCart } from "../context/CartContext";
import SEO from "../components/SEO";

const API_URL = API.PRODUCTS;

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setProduct(res.data);
        setActiveImage(res.data.mainImageIndex || 0);
        // Pré-sélectionner la première variante avec un prix
        const firstValid = res.data.variants?.find(v => v.price > 0);
        if (firstValid) setSelectedSize(firstValid.size);
      } catch (err) {
        console.error("Erreur fetch produit :", err);
        setError(t("product_detail.not_found") || "Produit introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAED] flex items-center justify-center">
        <FaSpinner className="animate-spin text-[var(--secondary-color)]" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FCFAED] flex flex-col items-center justify-center gap-4">
        <FaBoxOpen className="text-gray-400" size={64} />
        <p className="text-xl text-gray-500">{error || t("product_detail.not_found")}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition"
        >
          <FaArrowLeft /> {t("product_detail.back")}
        </button>
      </div>
    );
  }

  const validImages = product.images?.filter(img => img) || [];
  const selectedVariant = product.variants?.find(v => v.size === selectedSize);

  // Génération du Structured Data JSON-LD pour le SEO (Rich Snippets Google)
  const ingredientString = product.ingredients && product.ingredients.length > 0 
    ? ` Ingrédients 100% naturels : ${product.ingredients.join(', ')}.` 
    : '';
  const sizesString = product.variants && product.variants.length > 0
    ? ` Formats disponibles : ${product.variants.map(v => v.size).join(', ')}.`
    : '';
    
  const seoDescription = `${product.description || `Produit authentique ${product.name} par Habibah.`}${ingredientString}${sizesString} Produit artisanal tunisien fait maison.`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": validImages.map(img => getImageUrl(img)),
    "description": seoDescription,
    "sku": `PROD-${product._id || product.id || id}`,
    "brand": {
      "@type": "Brand",
      "name": "Habibah"
    },
    "offers": product.variants?.filter(v => v.price > 0).map(v => ({
      "@type": "Offer",
      "url": `${window.location.protocol}//${window.location.host}/produit/${id}?size=${v.size}`,
      "priceCurrency": "TND",
      "price": v.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "name": `${product.name} - ${v.size}`
    })) || []
  };

  const keywords = `${product.name}, ${product.type}, Zrir, Bsissa, artisanat tunisien, produits naturels, fait main, ${product.ingredients?.join(', ') || ''}`;

  return (
    <div className="min-h-[calc(100vh)] pt-24 bg-[#FCFAED] py-8 flex flex-col items-center justify-center relative">
      <SEO 
        title={`${product.name} | 100% Naturel & Artisanal`} 
        description={seoDescription.substring(0, 300)} 
        image={validImages[0] ? getImageUrl(validImages[0]) : null}
        type="product"
        jsonLd={jsonLd}
        keywords={keywords}
      />
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">

        {/* Bouton retour */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-bold transition lg:bg-white lg:px-5 lg:py-2 lg:rounded-full lg:shadow-sm hover:shadow-md hover:scale-105 text-sm"
          >
            <FaArrowLeft size={12} /> {t("product_detail.back_to_products")}
          </button>
        </div>

        {/* Product Card Container */}
        <div className="bg-white rounded-[1.5rem] shadow-xl border border-orange-100/50 flex flex-col lg:flex-row mb-8">

          {/* ── Colonne images ──────────────────────────── */}
          <div className="lg:w-1/2 bg-[#FDFBF4] p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">

            {/* Image principale */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 w-full max-w-sm aspect-square mb-4 group">
              {validImages.length > 0 ? (
                <img
                  src={getImageUrl(validImages[activeImage])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FaImage className="text-gray-400" size={64} />
                </div>
              )}
              {/* Badge type */}
              <span className={`absolute top-4 left-4 px-4 py-1.5 text-xs font-black rounded-full shadow-md uppercase tracking-wider backdrop-blur-md ${product.type === "Zrir"
                ? "bg-amber-100/80 text-amber-900 border border-amber-200"
                : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
                }`}>
                <FaTag className="inline mr-1.5" size={10} />
                {product.type}
              </span>
            </div>

            {/* Miniatures */}
            {validImages.length > 1 && (
              <div className="flex gap-4 justify-center flex-wrap">
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-[3px] transition-all duration-300 ${activeImage === i
                      ? "border-[var(--secondary-color)] scale-110 shadow-lg hover:shadow-xl"
                      : "border-transparent hover:border-gray-300 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`vue ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {product.mainImageIndex === i && (
                      <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1 shadow-sm">
                        <FaStar size={8} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne infos ───────────────────────────── */}
          <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col bg-white">

            <div className="space-y-6">
              {/* Nom & Badge */}
              <div>
                <h1 className="text-3xl font-black text-[var(--primary-color)] tracking-tight mb-1">
                  {product.name}
                </h1>
                <div className="h-1 w-16 rounded-full bg-[var(--secondary-color)]" />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
                  {t("products.description")}
                </h2>
                <p className="text-gray-600 leading-snug text-sm">
                  {product.description}
                </p>
              </div>

              {/* Ingrédients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 flex items-center">
                    <FaLeaf className="inline text-[var(--primary-color)] mr-1.5" />
                    {t("products.ingredients")}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 font-semibold"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Choix de taille */}
              <div>
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  {t("product_detail.choose_size")}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {product.variants?.map((v, i) => {
                    const isActive = selectedSize === v.size;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(v.size)}
                        className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-200 font-bold ${isActive
                          ? "border-[var(--secondary-color)] bg-yellow-50 text-[var(--primary-color)] shadow-md shadow-yellow-500/10 scale-105"
                          : "bg-white border-gray-100 text-gray-500 hover:border-yellow-200 hover:bg-yellow-50/30"
                          }`}
                      >
                        <span className="text-base mb-0.5">{v.size}</span>
                        <span className={`text-xs ${isActive ? "text-[var(--secondary-color)]" : "text-gray-400"}`}>
                          {v.price} DT
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4 mt-2">
                {/* Prix sélectionné */}
                {selectedVariant && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5">{t("product_detail.price")}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[var(--primary-color)]">
                        {selectedVariant.price} DT
                      </span>
                      <span className="text-gray-400 text-xs font-medium">/ {selectedVariant.size}</span>
                    </div>
                  </div>
                )}

                {/* Bouton commander */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || added}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white text-lg font-black rounded-xl transition-all duration-300 transform ${added
                    ? "bg-green-500 scale-95 shadow-[0_4px_15px_-5px_rgba(34,197,94,0.4)]"
                    : "bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] hover:-translate-y-0.5 shadow-[0_4px_15px_-5px_rgba(234,179,8,0.4)] hover:shadow-[0_8px_20px_-5px_rgba(234,179,8,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                  {added ? (
                    <span className="flex items-center gap-2">
                      <FaCheck size={20} />
                      {t("product_detail.added")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaShoppingCart size={20} className={selectedSize ? "animate-bounce" : ""} />
                      {t("product_detail.add_to_cart")}
                    </span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;