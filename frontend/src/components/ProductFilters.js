import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

const ProductFilters = ({ searchTerm, onSearchChange, typeFilter, onTypeChange }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
        />
      </div>
      <div className="relative">
        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="pl-10 pr-8 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] appearance-none bg-white"
        >
          <option value="all">Tous les types</option>
          <option value="Zrir">Zrir</option>
          <option value="Bsissa">Bsissa</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;