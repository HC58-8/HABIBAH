import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-[var(--secondary-color)]" size={40} />
    </div>
  );
};

export default LoadingSpinner;