import React from "react";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

const Notification = ({ show, type, message }) => {
  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`}>
      {type === "success" ? <FaCheck /> : <FaExclamationTriangle />}
      <span>{message}</span>
    </div>
  );
};

export default Notification;