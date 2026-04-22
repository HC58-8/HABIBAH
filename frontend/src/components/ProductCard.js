// src/components/ProductCard.js
import React, { useState } from "react";
import { FaImage, FaShoppingCart, FaInfoCircle, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../config/api";

const ProductCard = ({ product, isAdmin = false, onEdit, onDelete }) => {
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded]           = useState(false);   // feedback visuel
  const [showSizes, setShowSizes]   = useState(false);   // mini popup tailles

  const handleDetail = () => navigate(`/product/${product._id}`);

  // Ajouter avec animation ✓
  const handleAddToCart = (size = null) => {
    addToCart(product, size);
    setShowSizes(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500); // reset après 1.5s
  };

  // Si plusieurs variantes → afficher choix, sinon ajouter direct
  const handleCartClick = () => {
    const validVariants = product.variants?.filter(v => v.price > 0) || [];
    if (validVariants.length > 1) {
      setShowSizes(prev => !prev);
    } else {
      handleAddToCart(validVariants[0]?.size || null);
    }
  };

  const hasIngredients = product.ingredients && product.ingredients.length > 0;
  const hasDescription = product.description && product.description.trim() !== "";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-[var(--secondary-color)] relative">

      {/* Image cliquable */}
      <div className="relative min-h-[12rem] bg-gray-100 cursor-pointer group" onClick={handleDetail}>
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={getImageUrl(product.images[product.mainImageIndex || 0])}
              alt={product.name}
              className="w-full h-auto min-h-[12rem] object-cover"
            />
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700 shadow">
              {product.images.length} {product.images.length > 1 ? "images" : "image"}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-15 transition-all duration-200 flex items-end justify-center pb-3">
              <span className="opacity-0 group-hover:opacity-100 text-white font-semibold text-xs bg-black bg-opacity-60 px-3 py-1 rounded-full transition-all duration-200">
                Voir le détail →
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[12rem]">
            <FaImage className="text-gray-400" size={40} />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="text-xl font-bold text-[var(--primary-color)] cursor-pointer hover:underline"
            onClick={handleDetail}
          >
            {product.name}
          </h3>
          <span className={`shrink-0 ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
            product.type === "Zrir"
              ? "bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] border border-[var(--primary-color)]"
              : "bg-[var(--secondary-color)] bg-opacity-10 text-[var(--secondary-color)] border border-[var(--secondary-color)]"
          }`}>
            {product.type}
          </span>
        </div>

        {hasDescription && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}

        {product.variants && product.variants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Variantes disponibles :</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v, i) => (
                <div key={i} className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-gray-700">{v.size}</span>
                  <span className="text-xs font-bold text-[var(--secondary-color)] ml-1">{v.price} DT</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasIngredients && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Ingrédients :</p>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ing, i) => (
                <span key={i} className="text-xs text-white bg-[var(--primary-color)] bg-opacity-10 px-2 py-1 rounded-full border border-[var(--primary-color)]">
                  {ing}
                </span>
              ))}
              {product.ingredients.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  +{product.ingredients.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Popup choix de taille ───────────────────────── */}
        {showSizes && !isAdmin && (
          <div className="mb-3 p-3 bg-[var(--primary-color)] bg-opacity-5 rounded-xl border border-[var(--primary-color)] border-opacity-20">
            <p className="text-xs font-semibold text-gray-600 mb-2">Choisir une taille :</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.filter(v => v.price > 0).map((v, i) => (
                <button
                  key={i}
                  onClick={() => handleAddToCart(v.size)}
                  className="flex flex-col items-center px-3 py-2 rounded-lg border-2 border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-white text-[var(--secondary-color)] transition-all duration-150 group"
                >
                  <span className="text-xs font-bold">{v.size}</span>
                  <span className="text-xs group-hover:text-white">{v.price} DT</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Boutons ─────────────────────────────────────── */}
        {isAdmin ? (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition"
            >
              <FaEdit /> Modifier
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaTrash /> Supprimer
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDetail}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-lg hover:bg-[var(--secondary-color)] hover:text-white transition"
            >
              <FaInfoCircle /> Détail
            </button>

            {/* Bouton panier avec feedback ✓ */}
            <button
              onClick={handleCartClick}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-medium ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : "bg-[var(--secondary-color)] text-white hover:bg-[var(--primary-color)]"
              }`}
            >
              {added ? (
                <><FaCheck /> Ajouté !</>
              ) : (
                <><FaShoppingCart /> Ajouter</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;