import React from "react";
import { FaBox, FaTag, FaList } from "react-icons/fa";

const ProductStats = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border-2 border-[var(--primary-color)]">
        <div className="p-3 bg-[var(--primary-color)] bg-opacity-10 rounded-lg">
          <FaBox className="text-[var(--primary-color)]" size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Total produits</p>
          <p className="text-3xl font-bold text-[var(--primary-color)]">{products.length}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border-2 border-[var(--secondary-color)]">
        <div className="p-3 bg-[var(--secondary-color)] bg-opacity-10 rounded-lg">
          <FaTag className="text-[var(--secondary-color)]" size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Zrir</p>
          <p className="text-3xl font-bold text-[var(--secondary-color)]">
            {products.filter(p => p.type === "Zrir").length}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border-2 border-[var(--secondary-color)]">
        <div className="p-3 bg-[var(--secondary-color)] bg-opacity-10 rounded-lg">
          <FaList className="text-[var(--secondary-color)]" size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Bsissa</p>
          <p className="text-3xl font-bold text-[var(--secondary-color)]">
            {products.filter(p => p.type === "Bsissa").length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;