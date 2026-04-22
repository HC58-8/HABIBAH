// src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaEdit, FaSave, FaTimes,
  FaSignOutAlt, FaShieldAlt, FaCheckCircle,
  FaExclamationCircle, FaKey, FaBox
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { API } from "../config/api";

const API_URL = API.USERS;
const ADMIN_EMAIL = "zrirhabibah@gmail.com";

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate  = useNavigate();
  const userRaw   = JSON.parse(localStorage.getItem("user") || "null");
  const token     = localStorage.getItem("token");

  const [user,    setUser]    = useState(userRaw);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notif,   setNotif]   = useState({ show: false, type: "", msg: "" });

  const [form, setForm] = useState({
    firstname: userRaw?.firstname || "",
    lastname:  userRaw?.lastname  || "",
    email:     userRaw?.email     || "",
  });
  const [errors, setErrors] = useState({});

  // Redirect si non connecté
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!u || !t) navigate("/login");
  }, [navigate]);

  // Rafraîchir le profil depuis l'API
  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data);
        setForm({ firstname: res.data.firstname, lastname: res.data.lastname, email: res.data.email });
      })
      .catch(() => {});
  }, [token]);

  const showNotif = (type, msg) => {
    setNotif({ show: true, type, msg });
    setTimeout(() => setNotif({ show: false, type: "", msg: "" }), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.firstname.trim()) e.firstname = t("profile.errors.required");
    if (!form.lastname.trim())  e.lastname  = t("profile.errors.required");
    if (!form.email.trim())     e.email     = t("profile.errors.required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("profile.errors.invalid_email");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setEditing(false);
      showNotif("success", "profile.update_success");
    } catch (err) {
      const msg = err.response?.data?.message || "profile.update_error";
      showNotif("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const handleCancel = () => {
    setForm({ firstname: user.firstname, lastname: user.lastname, email: user.email });
    setErrors({});
    setEditing(false);
  };

  const isAdmin   = user?.email === ADMIN_EMAIL;
  const initiales = `${user?.firstname?.charAt(0) || ""}${user?.lastname?.charAt(0) || ""}`.toUpperCase();

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all duration-200 bg-white
     ${errors[field]
       ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
       : "border-gray-200 focus:border-[var(--secondary-color)] focus:ring-2 focus:ring-[var(--secondary-color)]/10"
     }
     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FCFAED]">
      <Navbar />

      {/* Notification toast */}
      <motion.div
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: notif.show ? 1 : 0, y: notif.show ? 0 : -20 }}
        className="fixed top-24 left-1/2 z-50 pointer-events-none"
      >
        {notif.show && (
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${
            notif.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
            {notif.type === "success"
              ? <FaCheckCircle size={16} />
              : <FaExclamationCircle size={16} />}
            {t(notif.msg)}
          </div>
        )}
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* ── En-tête page ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--secondary-color)]">{t("profile.badge")}</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
            {t("profile.title")}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne gauche : avatar + infos rapides ──────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-5"
          >
            {/* Card avatar */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="h-20 w-full"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
              />
              <div className="px-6 pb-6 -mt-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-white"
                  style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                >
                  {initiales || <FaUser />}
                </div>
                <h2 className="mt-3 text-lg font-black text-gray-800">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 break-all">{user.email}</p>

                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
                    <FaShieldAlt size={10} /> {t("profile.admin")}
                  </span>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                  <FaEdit size={13} />
                </span>
                <span className="font-semibold">{t("profile.edit")}</span>
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[var(--secondary-color)] group-hover:bg-amber-100 transition-colors">
                  <FaBox size={13} />
                </span>
                <span className="font-semibold">{t("user_orders.title")}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-3 w-full px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                    <FaShieldAlt size={13} />
                  </span>
                  <span className="font-semibold">{t("admin.dashboard")}</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm text-red-500 hover:bg-red-50 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <FaSignOutAlt size={13} />
                </span>
                <span className="font-semibold">{t("profile.logout")}</span>
              </button>
            </div>
          </motion.div>

          {/* ── Colonne droite : formulaire ───────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.18 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Card informations */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-800">{t("profile.personal_info")}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t("profile.manage_info")}</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-white transition-all duration-200"
                  >
                    <FaEdit size={13} /> {t("profile.edit")}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <FaTimes size={13} /> {t("profile.cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:scale-105"
                      style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                    >
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <FaSave size={13} />}
                      {t("profile.save")}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Prénom */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">{t("account.firstname")}</label>
                  {editing ? (
                    <>
                      <input
                        value={form.firstname}
                        onChange={e => { setForm(f => ({ ...f, firstname: e.target.value })); if (errors.firstname) setErrors(er => ({ ...er, firstname: "" })); }}
                        className={inputClass("firstname")}
                        placeholder={t("profile.firstname_ph")}
                      />
                      {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname}</p>}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FaUser size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-800 font-medium">{user.firstname}</span>
                    </div>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">{t("account.lastname")}</label>
                  {editing ? (
                    <>
                      <input
                        value={form.lastname}
                        onChange={e => { setForm(f => ({ ...f, lastname: e.target.value })); if (errors.lastname) setErrors(er => ({ ...er, lastname: "" })); }}
                        className={inputClass("lastname")}
                        placeholder={t("profile.lastname_ph")}
                      />
                      {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname}</p>}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FaUser size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-800 font-medium">{user.lastname}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">{t("account.email")}</label>
                  {editing ? (
                    <>
                      <input
                        value={form.email}
                        onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(er => ({ ...er, email: "" })); }}
                        className={inputClass("email")}
                        placeholder={t("account.email_ph") || "votre@email.com"}
                        type="email"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FaEnvelope size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-800 font-medium">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card infos compte */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-black text-gray-800 mb-5">{t("profile.account_details")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: t("profile.role"),        value: isAdmin ? t("profile.admin") : t("profile.client"),                 color: isAdmin ? "text-amber-600 bg-amber-50 border-amber-200" : "text-blue-600 bg-blue-50 border-blue-200" },
                  { label: t("profile.connection"),   value: user.provider === "google" ? "Google" : t("profile.local_auth"), color: "text-gray-700 bg-gray-50 border-gray-200" },
                  { label: t("profile.member_since"), value: user.created_at ? new Date(user.created_at).toLocaleDateString(i18n.language === "ar" ? "ar-TN" : "fr-FR", { month: "long", year: "numeric" }) : "—", color: "text-gray-700 bg-gray-50 border-gray-200" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`flex flex-col gap-1 px-4 py-3 rounded-xl border-2 ${color}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
                    <span className="text-sm font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card sécurité — uniquement pour les comptes locaux */}
            {user.provider !== "google" && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h3 className="text-lg font-black text-gray-800 mb-2">{t("profile.security")}</h3>
                <p className="text-sm text-gray-500 mb-5">{t("profile.manage_security")}</p>
                <button
                  onClick={() => navigate("/reset-password")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-[var(--secondary-color)] hover:text-[var(--secondary-color)] transition-all duration-200"
                >
                  <FaKey size={13} /> {t("profile.change_password")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;