// services/otpStore.js
// Stockage temporaire des OTP en mémoire
// Pour la production, utilisez Redis ou une table DB temporaire

const otpMap = new Map(); // email -> { code, expiresAt, firstname, lastname, password, provider }

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ── Stocker un OTP ────────────────────────────────────────────
const storeOTP = (email, code, userData = {}) => {
  otpMap.set(email, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    ...userData,
  });
};

// ── Vérifier un OTP ───────────────────────────────────────────
const verifyOTP = (email, code) => {
  const entry = otpMap.get(email);

  if (!entry) {
    return { valid: false, reason: "Aucun code envoyé pour cet email" };
  }

  if (Date.now() > entry.expiresAt) {
    otpMap.delete(email);
    return { valid: false, reason: "Code expiré, veuillez en demander un nouveau" };
  }

  if (entry.code !== code.toString().trim()) {
    return { valid: false, reason: "Code incorrect" };
  }

  return { valid: true, data: entry };
};

// ── Supprimer un OTP (après usage) ───────────────────────────
const deleteOTP = (email) => {
  otpMap.delete(email);
};

// ── Obtenir les données stockées (sans supprimer) ─────────────
const getOTPData = (email) => {
  return otpMap.get(email) || null;
};

// ── Nettoyage automatique toutes les 15 minutes ───────────────
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpMap.entries()) {
    if (now > entry.expiresAt) {
      otpMap.delete(email);
    }
  }
}, 15 * 60 * 1000);

module.exports = {
  storeOTP,
  verifyOTP,
  deleteOTP,
  getOTPData,
};