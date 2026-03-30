import React, { useState } from "react";
import { 
  FaImage, FaShoppingCart, FaInfoCircle, 
  FaChevronLeft, FaChevronRight, FaStar 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../config/api";

const ProductCard = ({ product, isAdmin = false, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleDetail = () => {
    navigate(`/product/${product._id}`);
  };

  const handleOrder = () => {
    // Logique pour commander
    console.log("Commander:", product._id);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };


  // Filtrer les images null/undefined
  const validImages = product.images?.filter(img => img != null) || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-[var(--secondary-color)]">
      
      {/* Zone des images avec navigation */}
      <div className="relative h-48 bg-gray-100 group">
        {validImages.length > 0 ? (
          <>
            {/* Image principale */}
            <img
              src={getImageUrl(validImages[currentImageIndex])}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
              }}
            />

            {/* Indicateur d'image principale (étoile) si c'est l'image principale du produit */}
            {currentImageIndex === (product.mainImageIndex || 0) && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1 rounded-full shadow-lg">
                <FaStar size={12} />
              </div>
            )}

            {/* Compteur d'images */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {currentImageIndex + 1}/{validImages.length}
            </div>

            {/* Boutons de navigation (apparaissent au survol) */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                >
                  <FaChevronRight size={16} />
                </button>
              </>
            )}

            {/* Miniatures des 4 images en bas */}
            {validImages.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white bg-opacity-50 hover:bg-opacity-75"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <FaImage className="text-gray-400" size={40} />
          </div>
        )}
      </div>

      {/* Grille des 4 miniatures (optionnel - peut être ajouté sous l'image principale) */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50">
          {validImages.slice(0, 4).map((img, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                index === currentImageIndex 
                  ? 'border-[var(--secondary-color)]' 
                  : 'border-transparent'
              }`}
            >
              <img
                src={getImageUrl(img)}
                alt={`Miniature ${index + 1}`}
                className="w-full h-12 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50x50?text=';
                }}
              />
              {index === (product.mainImageIndex || 0) && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-white p-0.5 rounded-br">
                  <FaStar size={8} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-[var(--primary-color)]">{product.name}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            product.type === "Zrir"
              ? "bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] border border-[var(--primary-color)]"
              : "bg-[var(--secondary-color)] bg-opacity-10 text-[var(--secondary-color)] border border-[var(--secondary-color)]"
          }`}>
            {product.type}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

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

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Ingrédients :</p>
          <div className="flex flex-wrap gap-1">
            {product.ingredients?.slice(0, 3).map((ing, i) => (
              <span key={i} className="text-xs bg-[var(--primary-color)] bg-opacity-10 px-2 py-1 rounded-full border border-[var(--primary-color)]">
                {ing}
              </span>
            ))}
            {product.ingredients?.length > 3 && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                +{product.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>

        {isAdmin ? (
          // Version Admin : boutons Modifier/Supprimer
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Supprimer
            </button>
          </div>
        ) : (
          // Version Client : boutons Détail/Commander
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDetail}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-lg hover:bg-[var(--secondary-color)] hover:text-white transition"
            >
              <FaInfoCircle /> Détail
            </button>
            <button
              onClick={handleOrder}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition"
            >
              <FaShoppingCart /> Commander
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;