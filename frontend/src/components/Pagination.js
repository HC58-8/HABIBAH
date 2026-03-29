import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-[var(--secondary-color)] hover:text-white"
        } transition border-2 border-gray-300`}
      >
        <FaChevronLeft />
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-lg border-2 ${
            currentPage === i + 1
              ? "bg-[var(--secondary-color)] text-white border-[var(--secondary-color)]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-[var(--secondary-color)] hover:text-white hover:border-[var(--secondary-color)]"
          } transition`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-[var(--secondary-color)] hover:text-white"
        } transition border-2 border-gray-300`}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;