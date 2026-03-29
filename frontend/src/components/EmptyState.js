import React from "react";
import { FaArchive, FaPlus } from "react-icons/fa";

const EmptyState = ({ onAddProduct }) => {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
      <FaArchive className="mx-auto text-gray-400" size={48} />
      <p className="mt-4 text-gray-500">Aucun produit trouvé</p>
      <button
        onClick={onAddProduct}
        className="mt-4 inline-flex items-center px-4 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition"
      >
        <FaPlus className="mr-2" /> Ajouter votre premier produit
      </button>
    </div>
  );
};

export default EmptyState;