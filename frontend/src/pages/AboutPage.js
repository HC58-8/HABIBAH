// src/pages/AboutPage.js
import React, {  useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FaLeaf, FaHeart, FaAward, FaSeedling,
  FaMortarPestle, FaHandHoldingHeart, FaStar,
  FaArrowRight, FaWhatsapp
} from "react-icons/fa";
import Navbar from "../components/Navbar";

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

// ── Données valeurs ───────────────────────────────────────────
const values = [
  { icon: <FaLeaf size={28} />,            title: "100% Naturel",      desc: "Aucun additif, aucun conservateur. Que des ingrédients purs choisis avec soin dans les terroirs tunisiens." },
  { icon: <FaMortarPestle size={28} />,    title: "Fait à la Main",    desc: "Chaque pot est préparé artisanalement, en petites quantités, selon des recettes transmises de génération en génération." },
  { icon: <FaHandHoldingHeart size={28} />,title: "Avec Amour",        desc: "Habibah, c'est un nom qui veut dire « bien-aimée ». Chaque préparation porte cette intention de soin et de générosité." },
  { icon: <FaAward size={28} />,           title: "Qualité Premium",   desc: "Nous sélectionnons rigoureusement chaque ingrédient pour vous offrir le meilleur de la gastronomie tunisienne." },
];

const produits = [
  {
    nom: "Le Zrir",
    couleur: "from-amber-800 to-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tag: "bg-amber-100 text-amber-800",
    desc: "Mélange ancestral tunisien à base de sésame grillé, de miel pur et des fruits secs. Le Zrir est une douceur énergisante traditionnellement offerte aux femmes après l'accouchement et lors des grandes célébrations.",
    varietes: ["Royal", "Classique", "Noisette", "Pistache", "Noix", "Pignon"],
    icone: <FaStar size={20} />,
  },
  {
    nom: "La Bsissa", 
    couleur: "from-stone-700 to-stone-500",
    bg: "bg-stone-50",
    border: "border-stone-200",
    tag: "bg-stone-100 text-stone-700",
    desc: "Subtil mélange de céréales grillées, de légumineuses, d'épices aromatiques et de plantes médicinales. Riche en fibres et en protéines, la Bsissa est un trésor nutritionnel de la cuisine tunisienne.",
    varietes: ["Traditionnelle", "Légère", "Épicée", "Spéciale"],
    icone: <FaSeedling size={20} />,
  },
];

// ── Page À propos ─────────────────────────────────────────────
function AboutPage() {
  const navigate = useNavigate();

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
                <FaLeaf size={12} /> Artisanat tunisien depuis toujours
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}>
              <span style={{ color: "var(--primary-color)" }}>L'âme</span>
              <br />
              <span className="text-gray-800">de la</span>
              <br />
              <span style={{ color: "var(--secondary-color)" }}>Tunisie</span>
              <br />
              <span className="text-gray-800">dans chaque</span>
              <br />
              <span style={{ color: "var(--primary-color)" }}>pot.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Habibah est née d'une passion profonde pour la gastronomie tunisienne authentique.
              Chaque produit que nous préparons est un hommage aux recettes ancestrales de nos
              grands-mères, fabriqué avec des ingrédients 100% naturels et sélectionnés avec soin.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/produit")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
              >
                Découvrir nos produits <FaArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
              >
                Nous contacter
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
                { text: "100%\nNaturel", pos: "top-4 left-4",  bg: "var(--primary-color)" },
                { text: "Fait\nMain",    pos: "top-4 right-4", bg: "var(--secondary-color)" },
                { text: "Tunisie\n🇹🇳",  pos: "bottom-4 left-4",  bg: "var(--secondary-color)" },
                { text: "Premium\n⭐",   pos: "bottom-4 right-4", bg: "var(--primary-color)" },
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
          <span className="text-xs tracking-widest uppercase">Découvrir</span>
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
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>Notre Histoire</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                Une passion <span style={{ color: "var(--primary-color)" }}>ancestrale</span>
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "var(--secondary-color)" }} />
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimSection variants={fadeLeft}>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-xl font-medium" style={{ color: "var(--primary-color)" }}>
                  Habibah, c'est avant tout une histoire de famille, de transmission et d'amour.
                </p>
                <p>
                  Dans les cuisines tunisiennes, le Zrir et la Bsissa occupent une place sacrée.
                  Ces préparations, transmises de mère en fille depuis des siècles, sont bien plus que
                  de simples aliments — ce sont des rituels, des gestes d'amour, des remèdes naturels.
                </p>
                <p>
                  Notre fondatrice a grandi en regardant sa grand-mère préparer le Zrir pour les grandes occasions.
                  L'odeur du sésame grillé, le parfum du miel, la chaleur des épices... Ces souvenirs
                  ont forgé une conviction profonde : ces trésors méritent d'être partagés avec le monde.
                </p>
                <p>
                  Aujourd'hui, Habibah perpétue cette tradition avec une exigence absolue sur la qualité
                  des ingrédients et le respect des méthodes artisanales authentiques.
                  <strong style={{ color: "var(--primary-color)" }}> Chaque pot est une promesse.</strong>
                </p>
              </div>
            </AnimSection>

            <AnimSection variants={fadeRight}>
              {/* Timeline */}
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: "var(--secondary-color)", opacity: 0.3 }} />
                {[
                  { annee: "Origines", titre: "Les recettes ancestrales", desc: "Des générations de femmes tunisiennes préparent Zrir et Bsissa selon des traditions millénaires." },
                  { annee: "La passion", titre: "Un héritage familial", desc: "Notre fondatrice grandit en transmettant ces saveurs de génération en génération, gardienne d'un patrimoine culinaire unique." },
                  { annee: "Aujourd'hui", titre: "Habibah naît", desc: "La marque est créée pour partager ces trésors avec authenticité et amour, sans compromis sur la qualité." },
                  { annee: "Toujours", titre: "100% Naturel", desc: "Un engagement indéfectible : aucun additif, aucun conservateur, seulement les ingrédients que la nature offre." },
                ].map(({ annee, titre, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative mb-10 last:mb-0"
                  >
                    <div className="absolute -left-8 top-1 w-5 h-5 rounded-full border-4 border-white shadow"
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
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>Ce que nous faisons</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                Deux trésors <span style={{ color: "var(--secondary-color)" }}>tunisiens</span>
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
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.couleur} flex items-center justify-center text-white shadow-lg`}>
                    {p.icone}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>{p.nom}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.tag}`}>Artisanal · Tunisie</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed">{p.desc}</p>

                {/* Variétés */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Nos variétés</p>
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
                  Commander <FaArrowRight size={13} />
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
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>Ce qui nous guide</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                Nos <span style={{ color: "var(--primary-color)" }}>engagements</span>
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
              { nb: "100%", label: "Ingrédients naturels" },
              { nb: "6+",   label: "Variétés de Zrir" },
              { nb: "4+",   label: "Variétés de Bsissa" },
              { nb: "♾",   label: "Recette ancestrale" },
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
              Prêt à goûter <span style={{ color: "var(--primary-color)" }}>l'authentique</span> ?
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Commandez dès maintenant et laissez-vous transporter au cœur de la Tunisie à travers chaque cuillère.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/produit")}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-white shadow-xl text-lg transition-all"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 10px 30px -8px var(--primary-color)" }}
              >
                Voir nos produits <FaArrowRight />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="https://wa.me/21625257099"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold border-2 text-lg transition-all"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
              >
                <FaWhatsapp /> Commander via WhatsApp
              </motion.a>
            </div>
          </AnimSection>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;