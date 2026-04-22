// src/components/Navbar.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../images/HabibahLOGO.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  FaShoppingCart, FaUser, FaSignOutAlt, FaCog,
  FaChevronDown, FaUserCircle, FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import { useCart } from "../context/CartContext";

const ADMIN_EMAIL = "zrirhabibah@gmail.com";

function Navbar() {
  const [langOpen,    setLangOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenuOpen,setUserMenuOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin   = user?.email === ADMIN_EMAIL;
  const { totalItems } = useCart();

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer menu mobile au changement de route
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { label: t('navbar.home'),  path: "/" },
    { label: t('navbar.products'), path: "/produit" },
    { label: t('navbar.about'), path: "/a-propos" },
    { label: t('navbar.contact'),  path: "/contact" },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ── Logo ─────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative flex items-center h-16">
              <img
                src={logo}
                alt="Habibah"
                className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span
              className="font-black text-xl text-[var(--primary-color)] hidden sm:block tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Habibah
            </span>
          </div>

          {/* ── Menu Desktop ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(path)
                    ? "text-[var(--primary-color)] bg-[var(--primary-color)]/8"
                    : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-50"
                }`}
              >
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "var(--secondary-color)" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Right Section ────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Langue */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)]/5 transition-all duration-200">
                <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-gray-500" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1"
                  >
                    <button onClick={() => { i18n.changeLanguage('fr'); setLangOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 font-medium">
                      🇫🇷 Français
                    </button>
                    <button onClick={() => { i18n.changeLanguage('ar'); setLangOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 font-medium">
                      🇹🇳 عربي
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panier */}
            <button
              onClick={() => navigate("/panier")}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)]/5 transition-all duration-200"
              aria-label="Panier"
            >
              <FaShoppingCart size={16} className="text-gray-600" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-black w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm px-0.5"
                    style={{ background: "var(--primary-color)", fontSize: "9px", lineHeight: 1 }}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* ── Icône User : connecté vs non connecté ──────── */}
            {user ? (
              /* Connecté → dropdown avatar */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                    userMenuOpen
                      ? "border-[var(--secondary-color)] bg-[var(--secondary-color)]/5"
                      : "border-gray-200 hover:border-[var(--secondary-color)] hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar initiales */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                  >
                    {user.firstname?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user.firstname}
                  </span>
                  <FaChevronDown
                    size={10}
                    className={`text-gray-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                      style={{ boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
                    >
                      {/* Header profil */}
                      <div className="px-4 py-4 border-b border-gray-50"
                        style={{ background: "linear-gradient(135deg, var(--primary-color)/5, var(--secondary-color)/5)" }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                          >
                            {user.firstname?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <FaShieldAlt size={8} /> Administrateur
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items menu */}
                      <div className="py-2">
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/profile"); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                            <FaUserCircle size={15} />
                          </span>
                          <div className="text-left">
                            <p className="font-semibold">{t('navbar.profile')}</p>
                            <p className="text-xs text-gray-400">Modifier mes informations</p>
                          </div>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => { setUserMenuOpen(false); navigate("/admin"); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                          >
                            <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                              <FaCog size={14} />
                            </span>
                            <div className="text-left">
                              <p className="font-semibold">{t('navbar.admin')}</p>
                              <p className="text-xs text-gray-400">Tableau de bord admin</p>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Déconnexion */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <FaSignOutAlt size={14} />
                          </span>
                          <span className="font-semibold">{t('navbar.logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Non connecté → bouton login */
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)]/5 transition-all duration-200"
              >
                <FaUser size={14} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-600 hidden sm:block">{t('navbar.login')}</span>
              </button>
            )}

            {/* Bouton Commander */}
            <button
              onClick={() => navigate("/panier")}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 4px 14px -4px var(--primary-color)" }}
            >
              {t('navbar.order')}
            </button>

            {/* Burger mobile */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} className="text-gray-600 text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu Mobile ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(path)
                      ? "bg-[var(--primary-color)]/8 text-[var(--primary-color)]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-color)]"
                  }`}
                >
                  {label}
                </button>
              ))}

              {/* Séparateur */}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                {/* Langue mobile */}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl mb-2">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FontAwesomeIcon icon={faGlobe} className="text-sm" />
                    <span className="text-sm font-semibold">Langue / اللغة</span>
                  </div>
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button 
                      onClick={() => { i18n.changeLanguage('fr'); setMobileOpen(false); }} 
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${i18n.language === 'fr' || !i18n.language?.startsWith('ar') ? 'bg-[var(--primary-color)] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      FR
                    </button>
                    <button 
                      onClick={() => { i18n.changeLanguage('ar'); setMobileOpen(false); }} 
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${i18n.language?.startsWith('ar') ? 'bg-[var(--primary-color)] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      AR
                    </button>
                  </div>
                </div>

                {user ? (
                  <>
                    {/* Info user mobile */}
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black"
                        style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                      >
                        {user.firstname?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{user.firstname} {user.lastname}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-color)] transition-colors"
                    >
                      <FaUserCircle size={15} /> {t('navbar.profile')}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
                      >
                        <FaCog size={15} /> {t('navbar.admin')}
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt size={15} /> {t('navbar.logout')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-color)] transition-colors"
                  >
                    <FaUser size={15} /> {t('navbar.login')}
                  </button>
                )}
                <button
                  onClick={() => navigate("/panier")}
                  className="w-full text-center py-3 rounded-xl font-bold text-sm text-white mt-2"
                  style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                >
                  {t('navbar.order')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;