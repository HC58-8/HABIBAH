// src/pages/HomePage.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FaArrowRight, FaLeaf, FaHeart, FaAward,
  FaMortarPestle, FaChevronLeft, FaChevronRight,
  FaStar, FaSeedling, 
} from "react-icons/fa";

import pubImage      from "../images/lastlogo.jpg";
import zrirImg       from "../images/IMG_4373.jpg";
import bsisadecoImg  from "../images/bsisadeco.jpg";
import ProductCard   from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar        from "../components/Navbar";
import Footer        from "../components/Footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/products";

// ── Animation helpers ─────────────────────────────────────────
const fadeUp   = { hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -56 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight= { hidden: { opacity: 0, x:  56 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const stagger  = { visible: { transition: { staggerChildren: 0.14 } } };

function Reveal({ children, className = "", variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ── Badge pill ────────────────────────────────────────────────
const Pill = ({ icon, label }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--primary-color)]/5">
    {icon} {label}
  </span>
);

// ── Section label ─────────────────────────────────────────────
const SectionLabel = ({ label, title, accent, center = false }) => (
  <Reveal className={center ? "text-center" : ""}>
    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--secondary-color)]">{label}</span>
    <h2 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-black leading-none text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
      {title}{" "}
      {accent && <span className="text-[var(--primary-color)]">{accent}</span>}
    </h2>
    <div className={`mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] ${center ? "mx-auto" : ""}`} />
  </Reveal>
);

// ── Carousel de produits ──────────────────────────────────────
function ProductCarousel({ products, loading, title }) {
  const [page, setPage] = useState(0);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640)       setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else                               setCols(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const total     = products.length > 0 ? Math.ceil(products.length / cols) : 0;
  const displayed = products.slice(page * cols, page * cols + cols);
  const prev = () => setPage(p => Math.max(p - 1, 0));
  const next = () => setPage(p => Math.min(p + 1, total - 1));

  if (loading) return <LoadingSpinner />;
  if (products.length === 0)
    return <p className="text-center text-gray-400 py-10 text-sm">Aucun produit disponible pour le moment.</p>;

  return (
    <div className="relative mt-10">
      <button
        onClick={prev} disabled={page === 0}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 sm:-translate-x-6 z-10
          w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200
          disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
          bg-white text-[var(--primary-color)] border border-gray-200
          hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)]"
        aria-label="Précédent"
      >
        <FaChevronLeft size={13} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid gap-5 sm:gap-6"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {displayed.map(p => (
            <ProductCard key={p._id} product={p} isAdmin={false} />
          ))}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={next} disabled={page >= total - 1}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 sm:translate-x-6 z-10
          w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200
          disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
          bg-white text-[var(--primary-color)] border border-gray-200
          hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)]"
        aria-label="Suivant"
      >
        <FaChevronRight size={13} />
      </button>

      {total > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i} onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-8 bg-[var(--primary-color)]" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════
function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [zrirProducts,   setZrirProducts]   = useState([]);
  const [bsissaProducts, setBsissaProducts] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setZrirProducts(res.data.filter(p => p.type === "Zrir"));
        setBsissaProducts(res.data.filter(p => p.type === "Bsissa"));
      })
      .catch(err => console.error("Erreur fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#FCFAED] overflow-x-hidden" style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen pt-20 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Fond texturé */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "radial-gradient(circle, var(--primary-color) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[var(--secondary-color)] opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16">

          {/* Texte */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col gap-7 order-2 lg:order-1"
          >
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              <Pill icon={<FaLeaf size={10} />}        label="100% Naturel" />
              <Pill icon={<FaMortarPestle size={10} />} label="Artisanal" />
              <Pill icon="🇹🇳"                          label="Tunisie" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                {t('home.hero_title_1')}<br />
                <span className="text-[var(--primary-color)]">{t('home.hero_title_2')}</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-black text-lg leading-relaxed max-w-md">
              {t('home.hero_subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-xl text-base transition-all"
                style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)", boxShadow: "0 12px 32px -8px var(--primary-color)" }}
              >
                {t('navbar.order')} <FaArrowRight size={13} className="rtl:rotate-180" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById("section-zrir")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white text-base transition-all"
              >
                {t('home.explore_btn')}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute inset-0 rounded-3xl translate-x-4 translate-y-4 opacity-15"
              style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
            />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={pubImage}
                alt="Produits Habibah"
                className="w-full h-72 sm:h-96 lg:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Badge bas-gauche */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇹🇳</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Tradition Tunisienne</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => <FaStar key={i} size={9} className="text-yellow-400" />)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Badge haut-droite */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-5 right-5 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
              >
                <FaAward size={14} />
                <span className="text-xs font-bold">Artisanal</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center p-1">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1 h-2 bg-[var(--secondary-color)] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION ZRIR
      ══════════════════════════════════════════════════════ */}
      <section id="section-zrir" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionLabel label={t("home.zrir_label")} title={t("home.zrir_title")} accent={t("home.zrir_accent")} />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          <Reveal variants={fadeLeft}>
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl -translate-x-3 -translate-y-3 opacity-20 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
              />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={zrirImg}
                  alt="Zrir artisanal Habibah"
                  className="w-full h-80 sm:h-[480px] lg:h-[560px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2">
                    {["Royal", "Classique", "Noisette", "Pistache", "Noix", "Pignon"].map(v => (
                      <span key={v} className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal variants={fadeRight}>
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                  {t('home.zrir_desc_title_1')}<br />
                  <span className="text-[var(--primary-color)]">{t('home.zrir_desc_title_2')}</span>
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  {t('home.zrir_desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <FaLeaf size={14} />,         label: t('home.zrir_tag_1') },
                  { icon: <FaMortarPestle size={14} />, label: t('home.zrir_tag_2') },
                  { icon: <FaAward size={14} />,        label: t('home.zrir_tag_3') },
                  { icon: <FaHeart size={14} />,        label: t('home.zrir_tag_4') },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[var(--secondary-color)] transition-colors shadow-sm">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="self-start inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-xl text-base"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 8px 24px -8px var(--primary-color)" }}
              >
                {t('home.zrir_order_btn')} <FaArrowRight size={13} className="rtl:rotate-180" />
              </motion.button>
            </div>
          </Reveal>
        </div>

        {/* Carousel Zrir */}
        <div className="mt-20">
          <Reveal>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('home.zrir_varieties_title_1')} <span className="text-[var(--primary-color)]">{t('home.zrir_varieties_title_2')}</span>
              </h3>
              <button
                onClick={() => navigate("/produit")}
                className="text-sm font-semibold text-[var(--secondary-color)] hover:text-[var(--primary-color)] flex items-center gap-1 transition-colors"
              >
                {t('home.see_all')} <FaArrowRight size={11} className="rtl:rotate-180" />
              </button>
            </div>
          </Reveal>
          <ProductCarousel products={zrirProducts} loading={loading} title="Zrir" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SÉPARATEUR CITATION
      ══════════════════════════════════════════════════════ */}
      <div className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-48 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-32 translate-y-16" />
        </div>
        <Reveal>
          <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
            <p className="text-2xl sm:text-3xl font-black leading-snug" style={{ fontFamily: "'Georgia', serif" }}>
              "{t('home.quote_text_1')}<br />
              {t('home.quote_text_2')}<span className="italic">{t('home.quote_text_3')}</span>{t('home.quote_text_4')}"
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-white/40" />
              <span className="text-white/70 text-sm font-medium tracking-widest uppercase">Habibah</span>
              <div className="h-px w-12 bg-white/40" />
            </div>
          </div>
        </Reveal>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION BSISSA
      ══════════════════════════════════════════════════════ */}
      <section id="section-bsissa" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionLabel label={t("home.bsissa_label")} title={t("home.bsissa_title")} accent={t("home.bsissa_accent")} />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          <Reveal variants={fadeLeft} className="order-2 lg:order-1">
            <div className="flex flex-col gap-8">
              

              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: t('home.bsissa_stat_1_val'), label: t('home.bsissa_stat_1_lbl'), bg: "bg-amber-50", border: "border-amber-200", txt: "text-amber-700" },
                  { val: t('home.bsissa_stat_2_val'), label: t('home.bsissa_stat_2_lbl'), bg: "bg-green-50", border: "border-green-200", txt: "text-green-700" },
                  { val: t('home.bsissa_stat_3_val'), label: t('home.bsissa_stat_3_lbl'), bg: "bg-stone-50", border: "border-stone-200", txt: "text-stone-700" },
                ].map(({ val, label, bg, border, txt }) => (
                  <div key={label} className={`${bg} border-2 ${border} rounded-2xl p-4 text-center`}>
                    <p className={`text-lg font-black ${txt}`} style={{ fontFamily: "'Georgia', serif" }}>{val}</p>
                    <p className={`text-xs ${txt} opacity-80 mt-1 font-medium`}>{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <FaLeaf size={14} />,         label: t('home.bsissa_tag_1') },
                  { icon: <FaMortarPestle size={14} />, label: t('home.bsissa_tag_2') },
                  { icon: <FaSeedling size={14} />,     label: t('home.bsissa_tag_3') },
                  { icon: <FaHeart size={14} />,        label: t('home.bsissa_tag_4') },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[var(--secondary-color)] transition-colors shadow-sm">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--secondary-color), var(--primary-color))" }}>
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="self-start inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-xl text-base"
                style={{ background: "linear-gradient(135deg, var(--secondary-color), var(--primary-color))", boxShadow: "0 8px 24px -8px var(--secondary-color)" }}
              >
                {t('home.bsissa_order_btn')} <FaArrowRight size={13} className="rtl:rotate-180" />
              </motion.button>
            </div>
          </Reveal>

          <Reveal variants={fadeRight} className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl translate-x-3 translate-y-3 opacity-20 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
                style={{ background: "linear-gradient(135deg, var(--secondary-color), var(--primary-color))" }}
              />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={bsisadecoImg}
                  alt="Bsissa Habibah"
                  className="w-full h-80 sm:h-[480px] lg:h-[560px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {[t('about.var_traditional') || "Traditionnelle", t('about.var_light') || "Légère", t('about.var_spicy') || "Épicée", t('about.var_special') || "Spéciale"].map(v => (
                      <span key={v} className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Carousel Bsissa */}
        <div className="mt-20">
          <Reveal>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('home.bsissa_varieties_title_1')} <span className="text-[var(--secondary-color)]">{t('home.bsissa_varieties_title_2')}</span>
              </h3>
              <button
                onClick={() => navigate("/produit")}
                className="text-sm font-semibold text-[var(--secondary-color)] hover:text-[var(--primary-color)] flex items-center gap-1 transition-colors"
              >
                {t('home.see_all')} <FaArrowRight size={11} className="rtl:rotate-180" />
              </button>
            </div>
          </Reveal>
          <ProductCarousel products={bsissaProducts} loading={loading} title="Bsissa" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--secondary-color)]">{t('home.cta_label')}</span>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              {t('home.cta_title_1')}<br />
              <span className="text-[var(--primary-color)]">{t('home.cta_title_2')}</span>
            </h2>
            <p className="mt-6 text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              {t('home.cta_desc')}
            </p>
            <div className="mt-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="inline-flex items-center justify-center gap-2 px-12 py-5 rounded-2xl font-bold text-white text-lg shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 12px 32px -8px var(--primary-color)" }}
              >
                {t('home.cta_btn')} <FaArrowRight className="rtl:rotate-180" />
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;