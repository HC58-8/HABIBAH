// src/pages/AdminDashboardPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaUsers, FaShoppingBag, FaChartLine } from "react-icons/fa";
import PageHeader from "../components/PageHeader";

const ADMIN_EMAIL = "zrirhabibah@gmail.com";

function AdminDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(userStr);
    if (userData.email !== ADMIN_EMAIL) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Tableau de Bord Administrateur"
          subtitle="Gérez l'ensemble de votre boutique en un seul endroit"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Carte Gestion des Produits */}
          <div 
            onClick={() => navigate("/produit")}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-[var(--primary-color)] transition-all cursor-pointer group flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
              <FaBoxOpen className="text-4xl text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Gestion des Produits</h3>
            <p className="text-gray-500 mb-6">Ajoutez, modifiez ou supprimez vos produits de la boutique.</p>
            <button className="mt-auto px-6 py-2 bg-green-50 text-green-700 font-semibold rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors w-full">
              Gérer les produits
            </button>
          </div>

          {/* Carte Gestion des Commandes */}
          <div 
            onClick={() => navigate("/admin/orders")}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-[var(--secondary-color)] transition-all cursor-pointer group flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <FaShoppingBag className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Gestion des Commandes</h3>
            <p className="text-gray-500 mb-6">Suivez, mettez à jour et imprimez les commandes clients.</p>
            <button className="mt-auto px-6 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg group-hover:bg-[var(--secondary-color)] group-hover:text-white transition-colors w-full">
              Gérer les commandes
            </button>
          </div>

          {/* Carte Gestion des Utilisateurs */}
          <div 
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer group flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
              <FaUsers className="text-4xl text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Gestion des Utilisateurs</h3>
            <p className="text-gray-500 mb-6">Consultez la liste des inscrits et supprimez des comptes si nécessaire.</p>
            <button className="mt-auto px-6 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors w-full">
              Gérer les utilisateurs
            </button>
          </div>

        </div>

        {/* Section optionnelle Statistiques visuelles */}
        <div className="mt-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-3xl p-8 shadow-lg text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaChartLine /> Vue d'ensemble rapide
            </h2>
            <p className="opacity-90 mt-2">Accédez aux détails complets dans chaque section respective.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboardPage;
