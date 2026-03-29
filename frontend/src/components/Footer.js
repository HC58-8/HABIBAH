// src/components/Footer.js

import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/HabibahLOGO.png";

// ── Icônes SVG inline (pas de dépendance supplémentaire) ──────────
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
  </svg>
);

const IconLocation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const IconFacebook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const IconInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IconTikTok = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Accueil",   path: "/" },
    { label: "Produits",  path: "/produit" },
    { label: "À propos",  path: "/a-propos" },
    { label: "Contact",   path: "/contact" },
  ];

  const socialLinks = [
    {
      label: "Facebook",
      icon: <IconFacebook />,
      href: "https://facebook.com/habibah",
      color: "hover:bg-blue-600",
    },
    {
      label: "Instagram",
      icon: <IconInstagram />,
      href: "https://instagram.com/habibah",
      color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400",
    },
    {
      label: "TikTok",
      icon: <IconTikTok />,
      href: "https://tiktok.com/@habibah",
      color: "hover:bg-black",
    },
    {
      label: "WhatsApp",
      icon: <IconWhatsApp />,
      href: "https://wa.me/21600000000",
      color: "hover:bg-green-500",
    },
  ];

  return (
    <footer
      style={{ backgroundColor: "var(--primary-color, #3b2a1a)" }}
      className="text-white"
    >
      {/* ── Wave décoratif ─────────────────────────────────── */}
      <div className="overflow-hidden leading-none" style={{ color: "#FCFAED" }}>
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16"
        >
          <path
            fill="currentColor"
            d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      {/* ── Contenu principal ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 pb-12">

        {/* Grille 3 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* ── Col 1 : Marque ─────────────────────────────── */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img
                src={logo}
                alt="Habibah"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30"
              />
              <span
                className="text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Habibah
              </span>
            </div>

            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Produits tunisiens artisanaux préparés avec amour&nbsp;— Zrir &amp; Bsissa
              selon les traditions de nos aïeux.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-2">
              {socialLinks.map(({ label, icon, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    bg-white/10 text-white transition-all duration-200
                    ${color} hover:scale-110 hover:shadow-lg
                  `}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 : Navigation ─────────────────────────── */}
          <div>
            <h3
              className="text-base font-bold uppercase tracking-widest mb-5"
              style={{ color: "var(--secondary-color, #d4a96a)" }}
            >
              Navigation
            </h3>
            <ul className="space-y-3">
              {navLinks.map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-white/75 hover:text-white text-sm transition flex items-center gap-2 group"
                  >
                    <span
                      className="w-0 group-hover:w-3 h-px transition-all duration-300"
                      style={{ backgroundColor: "var(--secondary-color, #d4a96a)" }}
                    />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 : Contact ────────────────────────────── */}
          <div>
            <h3
              className="text-base font-bold uppercase tracking-widest mb-5"
              style={{ color: "var(--secondary-color, #d4a96a)" }}
            >
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:zrirhabibah@gmail.com"
                  className="flex items-center gap-3 text-white/75 hover:text-white text-sm transition group"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <IconMail />
                  </span>
                  <span className="break-all">zrirhabibah@gmail.com</span>
                </a>
              </li>

              <li>
                <a
                  href="tel:+21600000000"
                  className="flex items-center gap-3 text-white/75 hover:text-white text-sm transition"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <IconPhone />
                  </span>
                  +216 00 000 000
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3 text-white/75 text-sm">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <IconLocation />
                  </span>
                  <span>Tunis, Tunisie</span>
                </div>
              </li>
            </ul>

            {/* CTA Commander */}
            <button
              onClick={() => navigate("/panier")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: "var(--secondary-color, #d4a96a)",
                color: "var(--primary-color, #3b2a1a)",
              }}
            >
              Commander maintenant →
            </button>
          </div>

        </div>

        {/* ── Séparateur ─────────────────────────────────────── */}
        <div className="mt-12 border-t border-white/15" />

        {/* ── Bas de page ────────────────────────────────────── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/50 text-xs">
          <p>© {currentYear} Habibah. Tous droits réservés.</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/mentions-legales")}
              className="hover:text-white transition"
            >
              Mentions légales
            </button>
            <button
              onClick={() => navigate("/confidentialite")}
              className="hover:text-white transition"
            >
              Confidentialité
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;