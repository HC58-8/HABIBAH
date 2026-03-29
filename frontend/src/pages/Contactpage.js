// src/pages/ContactPage.js
import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaWhatsapp, FaInstagram, FaFacebook,
  FaPaperPlane, FaCheckCircle, FaLeaf,
  FaChevronDown
} from "react-icons/fa";
import Navbar from "../components/Navbar";

// ── Animation helpers ─────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } } };

function AnimSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ── Composant FAQ item ────────────────────────────────────────
function FaqItem({ q, r, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-[var(--secondary-color)] transition-colors duration-300"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <FaChevronDown style={{ color: "var(--secondary-color)" }} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5">
          <div className="h-px w-full bg-gray-100 mb-4" />
          <p className="text-gray-600 text-sm leading-relaxed">{r}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page Contact ──────────────────────────────────────────────
function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm]           = useState({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);

  const infos = [
    { icon: <FaPhone size={20} />,        label: t('contact.info_l1'),  value: "+216 XX XXX XXX",       href: "tel:+21600000000",           desc: t('contact.info_d1') },
    { icon: <FaEnvelope size={20} />,     label: t('contact.info_l2'),      value: "zrirhabibah@gmail.com", href: "mailto:zrirhabibah@gmail.com", desc: t('contact.info_d2') },
    { icon: <FaWhatsapp size={20} />,     label: t('contact.info_l3'),   value: "+216 XX XXX XXX",       href: "https://wa.me/21600000000",   desc: t('contact.info_d3') },
    { icon: <FaMapMarkerAlt size={20} />, label: t('contact.info_l4'),    value: t('contact.info_v4'),        href: "#",                           desc: t('contact.info_d4') },
  ];

  const faq = [
    { q: t('contact.faq_q1'), r: t('contact.faq_r1') },
    { q: t('contact.faq_q2'), r: t('contact.faq_r2') },
    { q: t('contact.faq_q3'), r: t('contact.faq_r3') },
    { q: t('contact.faq_q4'), r: t('contact.faq_r4') },
    { q: t('contact.faq_q5'), r: t('contact.faq_r5') },
  ];

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())          e.nom      = t('contact.err_name');
    if (!form.email.trim())        e.email    = t('contact.err_email_req');
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('contact.err_email_inv');
    if (!form.message.trim())      e.message  = t('contact.err_msg');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1500)); // simulation envoi
    setSending(false);
    setSubmitted(true);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 rounded-xl border-2 text-sm outline-none transition-all duration-200 bg-white
     ${errors[field]
       ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
       : "border-gray-200 focus:border-[var(--secondary-color)] focus:ring-2 focus:ring-[var(--secondary-color)]/10"
     }`;

  return (
    <div className="min-h-screen bg-[#FCFAED] overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(circle, var(--primary-color) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--secondary-color)] opacity-10 rounded-full blur-3xl transform -translate-x-48 -translate-y-24" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--primary-color)] opacity-10 rounded-full blur-3xl transform translate-x-32 -translate-y-16" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 mb-6"
              style={{ borderColor: "var(--secondary-color)", color: "var(--secondary-color)" }}>
              <FaLeaf size={12} /> {t('contact.hero_badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-800 leading-tight mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {t('contact.hero_title_1')}
            <span style={{ color: "var(--primary-color)" }}>Zrir</span>
            <br />
            {t('contact.hero_title_2')}
            <span style={{ color: "var(--secondary-color)" }}>Bsissa</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {t('contact.hero_desc')}
          </motion.p>

          {/* Liens rapides réseaux */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4"
          >
            {[
              { icon: <FaWhatsapp size={22} />,  href: "https://wa.me/21600000000", label: "WhatsApp",  bg: "bg-green-500" },
              { icon: <FaInstagram size={22} />, href: "#",                         label: "Instagram", bg: "bg-gradient-to-br from-pink-500 to-orange-400" },
              { icon: <FaFacebook size={22} />,  href: "#",                         label: "Facebook",  bg: "bg-blue-600" },
            ].map(({ icon, href, label, bg }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -3 }}
                className={`w-12 h-12 ${bg} text-white rounded-2xl flex items-center justify-center shadow-lg transition-shadow hover:shadow-xl`}
                aria-label={label}
              >
                {icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ INFOS + FORMULAIRE ════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* ── Infos contact ─────────────────────────────── */}
            <AnimSection className="lg:col-span-2 space-y-5">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                  {t('contact.coord_title1')} <span style={{ color: "var(--primary-color)" }}>{t('contact.coord_title2')}</span>
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('contact.coord_desc')}
                </p>
              </div>

              {infos.map(({ icon, label, value, href, desc }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[var(--secondary-color)] hover:shadow-md transition-all duration-250 group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400">{label}</p>
                    <p className="text-gray-800 font-semibold text-sm truncate">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </motion.a>
              ))}

              {/* Horaires */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-4 p-5 rounded-2xl border-2"
                style={{ borderColor: "var(--secondary-color)", background: "rgba(var(--secondary-color-rgb, 212, 169, 106), 0.05)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <FaClock style={{ color: "var(--secondary-color)" }} />
                  <span className="font-bold text-gray-800 text-sm">{t('contact.hours_title')}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  {[
                    { j: t('contact.h_d1'),  h: t('contact.h_v1') },
                    { j: t('contact.h_d2'),            h: t('contact.h_v2') },
                    { j: t('contact.h_d3'),          h: t('contact.h_v3') },
                  ].map(({ j, h }) => (
                    <div key={j} className="flex justify-between text-gray-600">
                      <span>{j}</span>
                      <span className="font-medium text-gray-800">{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimSection>

            {/* ── Formulaire ────────────────────────────────── */}
            <AnimSection className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-2">
                  <div className="rounded-2xl p-2"
                    style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
                    <div className="text-white text-center py-4">
                      <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                        {t('contact.form_title')}
                      </h3>
                      <p className="text-white/75 text-sm mt-1">{t('contact.form_sub')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center text-center gap-4"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <FaCheckCircle className="text-6xl text-green-500" />
                      </motion.div>
                      <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                        {t('contact.btn_sent')}
                      </h3>
                      <p className="text-gray-600 max-w-sm">
                        {t('contact.msg_sent_desc1')}<strong>{form.nom}</strong>{t('contact.msg_sent_desc2')}
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" }); }}
                        className="mt-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                      >
                        {t('contact.btn_send_other')}
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Nom */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('contact.form_name')} <span className="text-red-400">*</span>
                          </label>
                          <input
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            placeholder={t('contact.form_name_ph')}
                            className={inputClass("nom")}
                          />
                          {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('contact.form_email')} <span className="text-red-400">*</span>
                          </label>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t('contact.form_email_ph')}
                            className={inputClass("email")}
                          />
                          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Téléphone */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form_phone')}</label>
                          <input
                            name="telephone"
                            value={form.telephone}
                            onChange={handleChange}
                            placeholder="+216 XX XXX XXX"
                            className={inputClass("telephone")}
                          />
                        </div>

                        {/* Sujet */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form_subject')}</label>
                          <select
                            name="sujet"
                            value={form.sujet}
                            onChange={handleChange}
                            className={inputClass("sujet")}
                          >
                            <option value="">{t('contact.subj_opt0')}</option>
                            <option value="commande">{t('contact.subj_opt1')}</option>
                            <option value="produit">{t('contact.subj_opt2')}</option>
                            <option value="gros">{t('contact.subj_opt3')}</option>
                            <option value="cadeau">{t('contact.subj_opt4')}</option>
                            <option value="partenariat">{t('contact.subj_opt5')}</option>
                            <option value="autre">{t('contact.subj_opt6')}</option>
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('contact.form_msg')} <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={5}
                          placeholder={t('contact.form_msg_ph')}
                          className={`${inputClass("message")} resize-none`}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={{ scale: sending ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-70"
                        style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))", boxShadow: "0 8px 24px -8px var(--primary-color)" }}
                      >
                        {sending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('contact.btn_sending')}
                          </>
                        ) : (
                          <>
                            <FaPaperPlane size={16} className="rtl:rotate-180" />
                            {t('contact.btn_send')}
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-xs text-gray-400">
                        {t('contact.wa_alt_text')}
                        <a href="https://wa.me/21600000000" target="_blank" rel="noopener noreferrer"
                          className="font-semibold text-green-600 hover:underline">{t('contact.wa_link')}</a>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </AnimSection>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #FCFAED 0%, #FFF5E6 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AnimSection>
            <div className="text-center mb-12">
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--secondary-color)" }}>{t('contact.faq_badge')}</span>
              <h2 className="text-4xl font-black mt-2 text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
                {t('contact.faq_title1')}<span style={{ color: "var(--primary-color)" }}>{t('contact.faq_title2')}</span>
              </h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "var(--secondary-color)" }} />
            </div>
          </AnimSection>

          <div className="space-y-3">
            {faq.map((item, i) => (
              <FaqItem key={i} {...item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ BANDEAU FINAL ═════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full translate-x-40 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white opacity-5 rounded-full -translate-x-30 translate-y-20" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <FaLeaf className="mx-auto mb-4 text-3xl opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            {t('contact.banner_title')}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            {t('contact.banner_desc')}
          </p>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;