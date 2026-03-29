// src/pages/AdminUsersPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers, FaSpinner, FaTrash, FaSearch, FaUserShield, FaUser
} from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { API } from "../config/api";

const API_URL = API.USERS;
const ADMIN_EMAIL = "zrirhabibah@gmail.com";

function AdminUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = useCallback(async (token) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
      setFilteredUsers(res.data.users || []);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
      alert("Erreur lors du chargement des utilisateurs. " + (error.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérifier admin au chargement
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) { navigate("/login"); return; }
      
      try {
        const userData = JSON.parse(userStr);
        if (userData.email !== ADMIN_EMAIL) {
          alert("Accès réservé à l'administrateur");
          navigate("/");
          return;
        }
        await fetchUsers(token);
      } catch (error) {
        console.error("Erreur vérification admin:", error);
        navigate("/login");
      }
    };
    checkAdmin();
  }, [navigate, fetchUsers]);

  // Filtrage
  useEffect(() => {
    let filtered = [...users];
    
    // Filtre recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.firstname?.toLowerCase().includes(term) ||
        u.lastname?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.id?.toString().includes(term)
      );
    }

    // Filtre rôle
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId, userEmail) => {
    if (userEmail === ADMIN_EMAIL) {
      alert("Vous ne pouvez pas supprimer le compte administrateur principal.");
      return;
    }

    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprime définitivement son compte.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Utilisateur supprimé avec succès");
      await fetchUsers(token);
    } catch (error) {
      console.error("❌ Erreur suppression utilisateur:", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAED] pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[var(--secondary-color)] mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAED] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <PageHeader
          title="Gestion des utilisateurs"
          subtitle="Administration - Liste de tous les inscrits"
        />

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
          <div className="bg-white rounded-xl shadow p-5 border-2 border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
              <FaUsers size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Inscrits</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[var(--primary-color)] mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] transition outline-none"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--secondary-color)] transition outline-none bg-white"
              >
                <option value="all">Tous les rôles</option>
                <option value="user">Clients (User)</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[var(--primary-color)] overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[var(--primary-color)] flex items-center gap-2">
              <FaUsers /> Utilisateurs ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <FaUsers className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[var(--secondary-color)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      
                      {/* Avatar et Infos principales */}
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full font-bold text-lg text-white flex items-center justify-center flex-shrink-0"
                          style={{ background: u.role === "admin" ? "linear-gradient(135deg, #1e3a8a, #3b82f6)" : "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                          {u.firstname ? u.firstname.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{u.firstname} {u.lastname}</p>
                          <p className="text-xs text-gray-500">Inscrit le {formatDate(u.created_at)}</p>
                        </div>
                      </div>

                      {/* Rôle Badge */}
                      <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 border ${
                        u.role === "admin" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {u.role === "admin" ? <FaUserShield size={10} /> : <FaUser size={10} />}
                        {u.role === "admin" ? "Admin" : "Client"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="text-sm border bg-gray-50 border-gray-200 p-2 rounded-lg">
                        <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Contact</p>
                        <p className="font-medium text-gray-800 break-all">{u.email}</p>
                      </div>
                      <div className="text-sm border bg-gray-50 border-gray-200 p-2 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Méthode d'inscription</p>
                          <p className="font-medium text-gray-800 flex items-center gap-2">
                            {u.provider === "google" ? "Via Google" : "Formulaire classique"}
                          </p>
                        </div>
                        {u.provider === "google" && (
                          <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full border shadow-sm text-xs font-bold text-blue-600">G</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        disabled={u.email === ADMIN_EMAIL}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          u.email === ADMIN_EMAIL
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-transparent hover:border-red-700"
                        }`}
                      >
                        <FaTrash />
                        {u.email === ADMIN_EMAIL ? "Impossible" : "Supprimer"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;
