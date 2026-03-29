// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaLeaf, FaShoppingCart, FaImage,
  FaStar, FaTag, FaBoxOpen, FaSpinner
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/products";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeImage, setActiveImage]   = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError]               = useState(null);

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
        setError("Produit introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
        <p className="text-xl text-gray-500">{error || "Produit introuvable"}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--secondary-color)] text-white rounded-xl hover:bg-[var(--primary-color)] transition"
        >
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  const validImages = product.images?.filter(img => img) || [];
  const selectedVariant = product.variants?.find(v => v.size === selectedSize);

  return (
    <div className="min-h-screen bg-[#FCFAED] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-semibold transition"
        >
          <FaArrowLeft /> Retour aux produits
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[var(--primary-color)] border-opacity-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── Colonne images ──────────────────────────── */}
            <div className="bg-gray-50 p-6 flex flex-col gap-4">
              {/* Image principale */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-72 sm:h-96">
                {validImages.length > 0 ? (
                  <img
                    src={`http://localhost:5000${validImages[activeImage]}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaImage className="text-gray-400" size={64} />
                  </div>
                )}
                {/* Badge type */}
                <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full shadow ${
                  product.type === "Zrir"
                    ? "bg-[var(--primary-color)] text-white"
                    : "bg-[var(--secondary-color)] text-white"
                }`}>
                  <FaTag className="inline mr-1" size={10} />
                  {product.type}
                </span>
              </div>

              {/* Miniatures */}
              {validImages.length > 1 && (
                <div className="flex gap-3 justify-center flex-wrap">
                  {validImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === i
                          ? "border-[var(--secondary-color)] scale-105 shadow-md"
                          : "border-gray-200 hover:border-[var(--secondary-color)]"
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${img}`}
                        alt={`vue ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {product.mainImageIndex === i && (
                        <div className="absolute top-0.5 right-0.5 bg-yellow-400 rounded-full p-0.5">
                          <FaStar size={8} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Colonne infos ───────────────────────────── */}
            <div className="p-8 flex flex-col gap-6">

              {/* Nom */}
              <div>
                <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-1">
                  {product.name}
                </h1>
                <div className="h-1 w-16 rounded-full bg-[var(--secondary-color)]" />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>

              {/* Ingrédients */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  <FaLeaf className="inline text-[var(--primary-color)] mr-1" />
                  Ingrédients
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients?.map((ing, i) => (
                    <span
                      key={i}
                      className="text-sm text-gray-800 bg-[var(--primary-color)] bg-opacity-10 px-3 py-1.5 rounded-full border border-[var(--primary-color)] border-opacity-40 font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Choix de taille */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Choisir une taille
                </h2>
                <div className="flex flex-wrap gap-3">
                  {product.variants?.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(v.size)}
                      className={`flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                        selectedSize === v.size
                          ? "border-[var(--secondary-color)] bg-[var(--secondary-color)] text-white shadow-md scale-105"
                          : "border-gray-200 text-gray-700 hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)]"
                      }`}
                    >
                      <span className="text-base">{v.size}</span>
                      <span className={`text-xs mt-0.5 font-bold ${
                        selectedSize === v.size ? "text-white" : "text-[var(--secondary-color)]"
                      }`}>
                        {v.price} DT
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix sélectionné */}
              {selectedVariant && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Prix :</span>
                  <span className="text-3xl font-bold text-[var(--secondary-color)]">
                    {selectedVariant.price} DT
                  </span>
                  <span className="text-gray-400 text-sm">/ {selectedVariant.size}</span>
                </div>
              )}

              {/* Bouton commander */}
              <button
                disabled={!selectedSize}
                className="mt-auto flex items-center justify-center gap-3 px-8 py-4 bg-[var(--secondary-color)] text-white text-lg font-bold rounded-xl hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <FaShoppingCart size={20} />
                Commander maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;