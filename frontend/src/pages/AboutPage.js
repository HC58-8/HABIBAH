// src/pages/AboutPage.js
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import {
  FaLeaf, FaHeart, FaAward, FaSeedling,
  FaMortarPestle, FaHandHoldingHeart, FaStar,
  FaArrowRight, FaWhatsapp
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import bsisadecoImg from "../images/bsisadeco.jpg";

// ── Animation variants ────────────────────────────────────────
const fadeUp   = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } };
const fadeLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } } };
const fadeRight= { hidden: { opacity: 0, x: 60  }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } } };
const stagger  = { visible: { transition: { staggerChildren: 0.12 } } };

// ── Composant section animée ──────────────────────────────────
function AnimSection({ children, className = "", variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ── Page À propos ─────────────────────────────────────────────
function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const values = [
    { icon: <FaLeaf size={28} />,            title: t('about.val_1_title'),      desc: t('about.val_1_desc') },
    { icon: <FaMortarPestle size={28} />,    title: t('about.val_2_title'),      desc: t('about.val_2_desc') },
    { icon: <FaHandHoldingHeart size={28} />,title: t('about.val_3_title'),      desc: t('about.val_3_desc') },
    { icon: <FaAward size={28} />,           title: t('about.val_4_title'),      desc: t('about.val_4_desc') },
  ];

  const produits = [
    {
      nom: t('about.prod_1_name'),
      couleur: "from-amber-800 to-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      tag: "bg-amber-100 text-amber-800",
      tagText: t('about.prod_1_tag'),
      desc: t('about.prod_1_desc'),
      varietes: [t('about.var_royal'), t('about.var_classic'), t('about.var_hazelnut'), t('about.var_pistachio'), t('about.var_walnut'), t('about.var_pine')],
      icone: <FaStar size={20} />,
    },
    {
      nom: t('about.prod_2_name'),
      image: bsisadecoImg,
      couleur: "from-stone-700 to-stone-500",
      bg: "bg-stone-50",
      border: "border-stone-200",
      tag: "bg-stone-100 text-stone-700",
      tagText: t('about.prod_1_tag'),
      desc: t('about.prod_2_desc'),
      varietes: [t('about.var_traditional'), t('about.var_light'), t('about.var_spicy'), t('about.var_special')],
      icone: <FaSeedling size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFAED] overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative pt-20 min-h-screen flex items-center overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                var(--primary-color) 0,
                var(--primary-color) 1px,
                transparent 0,
                transparent 50%
              )`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--secondary-color)] opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary-color)] opacity-10 rounded-full blur-3xl transform -translate-x-32 translate-y-32" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Texte */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2"
                style={{ borderColor: "var(--secondary-color)", color: "var(--secondary-color)" }}>
                <FaLeaf size={12} /> {t('about.hero_badge')}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}>
              <span style={{ color: "var(--primary-color)" }}>{t('about.hero_title_1')}</span>
              <br />
              <span className="text-gray-800">{t('about.hero_title_2')}</span>
              <br />
              <span style={{ color: "var(--secondary-color)" }}>{t('about.hero_title_3')}</span>
              <br />
              <span className="text-gray-800">{t('about.hero_title_4')}</span>
              <br />
              <span style={{ color: "var(--primary-color)" }}>{t('about.hero_title_5')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-gray-600 leading-relaxed max-w-lg">
              {t('about.hero_desc')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/produit")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
              >
                {t('about.discover_btn')} <FaArrowRight size={14} className="rtl:rotate-180" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
              >
                {t('about.contact_btn')}
              </button>
            </motion.div>
          </motion.div>

          {/* Visuel décoratif */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Cercle principal */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{ background: "var(--secondary-color)" }}
              />
              <div
                className="absolute inset-6 rounded-full opacity-30"
                style={{ background: "var(--primary-color)" }}
              />
              {/* Contenu central */}
              <div className="absolute inset-12 rounded-full flex flex-col items-center justify-center text-center p-8"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                <span className="text-white text-6xl font-black" style={{ fontFamily: "'Georgia', serif" }}>ح</span>
                <span className="text-white/80 text-sm font-medium mt-2 tracking-widest uppercase">Habibah</span>
                <div className="mt-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-300" size={12} />
                  ))}
                </div>
              </div>
              {/* Badges flottants */}
              {[
                { text: t('about.badge_1'), pos: "top-4 rtl:right-4 ltr:left-4",  bg: "var(--primary-color)" },
                { text: t('about.badge_2'), pos: "top-4 rtl:left-4 ltr:right-4", bg: "var(--secondary-color)" },
                { text: t('about.badge_3'), pos: "bottom-4 rtl:right-4 ltr:left-4",  bg: "var(--secondary-color)" },
                { text: t('about.badge_4'), pos: "bottom-4 rtl:left-4 ltr:right-4", bg: "var(--primary-color)" },
              ].map(({ text, pos, bg }) => (
                <motion.div
                  key={text}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: Math.random() * 2 }}
                  className={`absolute ${pos} w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl`}
                  style={{ background: bg }}
                >
                  <span className="text-white text-xs font-bold text-center leading-tight whitespace-pre-line">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs tracking-widest uppercase">{t('about.scroll_text')}</span>
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ══ HISTOIRE ══════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimSection>
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>{t('about.story_label')}</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('about.story_title_1')}<span style={{ color: "var(--primary-color)" }}>{t('about.story_title_2')}</span>
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "var(--secondary-color)" }} />
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimSection variants={fadeLeft}>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-xl font-medium" style={{ color: "var(--primary-color)" }}>
                  {t('about.story_p1')}
                </p>
                <p>
                  {t('about.story_p2')}
                </p>
                <p>
                  {t('about.story_p3')}
                </p>
                <p>
                  {t('about.story_p4')}
                  <strong style={{ color: "var(--primary-color)" }}>{t('about.story_p5')}</strong>
                </p>
              </div>
            </AnimSection>

            <AnimSection variants={fadeRight}>
              {/* Timeline */}
              <div className="relative pl-8 rtl:pr-8 rtl:pl-0">
                <div className="absolute left-3 rtl:left-auto rtl:right-3 top-0 bottom-0 w-0.5" style={{ background: "var(--secondary-color)", opacity: 0.3 }} />
                {[
                  { annee: t('about.timeline_1_year'), titre: t('about.timeline_1_title'), desc: t('about.timeline_1_desc') },
                  { annee: t('about.timeline_2_year'), titre: t('about.timeline_2_title'), desc: t('about.timeline_2_desc') },
                  { annee: t('about.timeline_3_year'), titre: t('about.timeline_3_title'), desc: t('about.timeline_3_desc') },
                  { annee: t('about.timeline_4_year'), titre: t('about.timeline_4_title'), desc: t('about.timeline_4_desc') },
                ].map(({ annee, titre, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative mb-10 last:mb-0"
                  >
                    <div className="absolute -left-8 rtl:left-auto rtl:-right-8 top-1 w-5 h-5 rounded-full border-4 border-white shadow"
                      style={{ background: "var(--secondary-color)" }} />
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>{annee}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2">{titre}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </AnimSection>
          </div>
        </div>
      </section>

      {/* ══ NOS PRODUITS ══════════════════════════════════════ */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, #FCFAED 0%, #FFF5E6 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimSection>
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>{t('about.products_label')}</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('about.products_title_1')}<span style={{ color: "var(--secondary-color)" }}>{t('about.products_title_2')}</span>
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "var(--primary-color)" }} />
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {produits.map((p, i) => (
              <motion.div
                key={p.nom}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8 }}
                className={`${p.bg} border-2 ${p.border} rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300`}
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  {p.image ? (
                    <img src={p.image} alt={p.nom} className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-gray-100" />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.couleur} flex items-center justify-center text-white shadow-lg`}>
                      {p.icone}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>{p.nom}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${p.tag}`}>{p.tagText}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed">{p.desc}</p>

                {/* Variétés */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">{t('about.prod_var_title')}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.varietes.map(v => (
                      <span key={v} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${p.border} ${p.tag}`}>{v}</span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate("/produit")}
                  className={`self-start inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${p.couleur} hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  {t('about.order_btn')} <FaArrowRight size={13} className="rtl:rotate-180" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VALEURS ═══════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimSection>
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>{t('about.values_label')}</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('about.values_title_1')}<span style={{ color: "var(--primary-color)" }}>{t('about.values_title_2')}</span>
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "var(--secondary-color)" }} />
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
                className="bg-[#FCFAED] rounded-2xl p-8 flex flex-col items-center text-center gap-4 border-2 border-transparent hover:border-[var(--secondary-color)] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CHIFFRES ══════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-48 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-32 translate-y-16" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center">
            {[
              { nb: "100%", label: t('about.stat_1_lbl') },
              { nb: "6+",   label: t('about.stat_2_lbl') },
              { nb: "4+",   label: t('about.stat_3_lbl') },
              { nb: "♾",   label: t('about.stat_4_lbl') },
            ].map(({ nb, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-5xl sm:text-6xl font-black" style={{ fontFamily: "'Georgia', serif" }}>{nb}</span>
                <span className="text-white/75 text-sm font-medium tracking-wide">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═════════════════════════════════════════ */}
      <section className="py-24 bg-[#FCFAED]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AnimSection>
            <FaHeart className="mx-auto mb-6 text-4xl" style={{ color: "var(--secondary-color)" }} />
            <h2 className="text-4xl sm:text-5xl font-black text-gray-800 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
              {t('about.cta_title_1')}<span style={{ color: "var(--primary-color)" }}>{t('about.cta_title_2')}</span>{t('about.cta_title_3')}
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {t('about.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-white shadow-xl text-lg transition-all"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 10px 30px -8px var(--primary-color)" }}
              >
                {t('about.cta_btn_1')} <FaArrowRight className="rtl:rotate-180" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="https://wa.me/21600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold border-2 text-lg transition-all"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
              >
                <FaWhatsapp /> {t('about.cta_btn_2')}
              </motion.a>
            </div>
          </AnimSection>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;