import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../images/HabibahLOGO.png";
import { API } from "../config/api";

const API_URL = API.USERS;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "630562961099-qulo0g9i2024pqbm6dcmkraooalt9fir.apps.googleusercontent.com";

function AccountPage() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showLoginOtp, setShowLoginOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Débogage
  useEffect(() => {
    console.log("Current origin:", window.location.origin);
    console.log("Google Client ID:", GOOGLE_CLIENT_ID);
  }, []);

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      
      if (res.data.requiresOtp) {
        setShowLoginOtp(true);
        setSuccessMessage(t("account.otp_message", { email }));
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Erreur connexion :", error);
      setErrorMessage(error.response?.data?.message || t("account.error_login"));
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY LOGIN OTP =================
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(`${API_URL}/verify-login-otp`, {
        email,
        code: otpCode,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (error) {
      console.error("❌ Erreur vérification login :", error);
      setErrorMessage(error.response?.data?.message || t("account.error_verify"));
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(`${API_URL}/send-otp`, {
        firstname,
        lastname,
        email,
        password,
      });
      setShowOtp(true);
    } catch (error) {
      console.error("❌ Erreur inscription :", error);
      setErrorMessage(error.response?.data?.message || t("account.error_otp"));
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(`${API_URL}/verify-otp`, {
        email,
        code: otpCode,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (error) {
      console.error("❌ Erreur vérification :", error);
      setErrorMessage(error.response?.data?.message || t("account.error_verify"));
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleSuccess = async (credentialResponse) => {
    
    if (!credentialResponse?.credential) {
      setErrorMessage(t("account.google_error"));
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      console.log("📤 Envoi du token au backend...");
      const res = await axios.post(`${API_URL}/google-login`, {
        token: credentialResponse.credential,
      });
      
      console.log("📥 Réponse du backend reçue:", res.data);
      
      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      } else {
        setErrorMessage("Réponse serveur invalide");
      }
    } catch (err) {
      console.error("❌ Google login error détaillé:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      // Messages d'erreur précis selon le type d'erreur
      if (err.response) {
        if (err.response.status === 401) {
          if (err.response.data?.error?.includes("NULL")) {
            setErrorMessage("Erreur base de données: le mot de passe ne peut pas être NULL. Exécutez: ALTER TABLE users ALTER COLUMN password DROP NOT NULL;");
          } else if (err.response.data?.message) {
            setErrorMessage(err.response.data.message);
          } else {
            setErrorMessage("Erreur d'authentification Google (401)");
          }
        } else if (err.response.status === 404) {
          setErrorMessage("Route /google-login non trouvée sur le backend");
        } else if (err.response.status === 500) {
          setErrorMessage("Erreur serveur interne: " + (err.response.data?.message || "Vérifiez les logs du backend"));
        } else {
          setErrorMessage(`Erreur ${err.response.status}: ${err.response.data?.message || "Erreur inconnue"}`);
        }
      } else if (err.request) {
        setErrorMessage("Le serveur ne répond pas. Vérifiez que l'API est accessible.");
      } else {
        setErrorMessage("Erreur: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Erreur Google Login");
    setErrorMessage(t("account.google_btn_error"));
  };

  // ================= FORGOT PASSWORD =================
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (forgotStep === 1) {
        await axios.post(`${API_URL}/forgot-password`, { email });
        setForgotStep(2);
        setSuccessMessage(t("account.reset_code_sent", "Un code de sécurité a été envoyé à votre email."));
      }
    } catch (error) {
      console.error("❌ Erreur mot de passe oublié :", error);
      setErrorMessage(error.response?.data?.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axios.post(`${API_URL}/reset-password`, { 
        email, 
        code: otpCode, 
        newPassword 
      });
      setSuccessMessage(res.data.message || "Mot de passe réinitialisé avec succès.");
      // Retour à la page de connexion normale après 2 secondes
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotStep(1);
        setOtpCode("");
        setNewPassword("");
        setPassword("");
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("❌ Erreur réinitialisation :", error);
      setErrorMessage(error.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* LEFT SIDE - DESIGN INCHANGÉ */}
            <div className="md:w-1/2 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] p-8 flex flex-col items-center justify-center text-white">
              <div className="max-w-md text-center">
                <img
                  src={logo}
                  alt="Vedre Zrir & Psisa"
                  className=" h-32 shadow-xl mx-auto mb-6 object-cover"
                />
                <h1 className="text-3xl text-[var(--primary-color)] font-bold mb-4">{t("HABIBAH")}</h1>
                <p className="text-lg opacity-90 mb-6">Bio & Traditionnelles</p>
              </div>
            </div>

            {/* RIGHT SIDE - DESIGN INCHANGÉ */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {isForgotPassword 
                  ? t("account.forgot_password_title", "Réinitialisation")
                  : isLogin ? t("account.login_title") : t("account.register_title")}
              </h2>

              {/* Messages d'erreur & de succès */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  <strong>⚠️ Erreur :</strong> {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  <strong>✅ Succès :</strong> {successMessage}
                </div>
              )}

              {/* Bouton de test manuel (temporaire) */}
              {errorMessage?.includes("NULL") && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
                  <strong>🔧 Correction nécessaire :</strong> Exécutez cette commande SQL dans votre base de données :
                  <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                    ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
                  </pre>
                </div>
              )}

              {showLoginOtp ? (
                <form className="space-y-4" onSubmit={handleVerifyLoginOtp}>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    {t("account.otp_message", { email })}<br/>
                    {t("account.login_otp_instruction")}
                  </p>
                  <input
                    type="text"
                    placeholder={t("account.otp_placeholder")}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 text-center text-xl tracking-widest font-bold"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--secondary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-color)] transition font-semibold text-lg disabled:opacity-50"
                  >
                    {loading ? t("account.verifying") : t("account.verify_login_btn")}
                  </button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginOtp(false);
                        setSuccessMessage("");
                      }}
                      className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      {t("account.back")}
                    </button>
                  </div>
                </form>
              ) : showOtp ? (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    {t("account.otp_message", { email })}<br/>
                    {t("account.otp_instruction")}
                  </p>
                  <input
                    type="text"
                    placeholder={t("account.otp_placeholder")}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 text-center text-xl tracking-widest font-bold"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--secondary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-color)] transition font-semibold text-lg disabled:opacity-50"
                  >
                    {loading ? t("account.verifying") : t("account.verify_btn")}
                  </button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      {t("account.back")}
                    </button>
                  </div>
                </form>
              ) : isForgotPassword ? (
                /* ================= FORGOT PASSWORD FORM ================= */
                <form className="space-y-4" onSubmit={forgotStep === 1 ? handleForgotPasswordSubmit : handleResetPasswordSubmit}>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    {forgotStep === 1 
                      ? t("account.forgot_password_instruction", "Entrez votre adresse e-mail pour recevoir un code de réinitialisation.")
                      : t("account.forgot_password_step_2", "Veuillez entrer le code reçu par e-mail ainsi que votre nouveau mot de passe.")}
                  </p>

                  <input
                    type="email"
                    placeholder={t("account.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={forgotStep === 2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 disabled:opacity-50"
                  />

                  {forgotStep === 2 && (
                    <>
                      <input
                        type="text"
                        placeholder={t("account.otp_placeholder")}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 text-center tracking-widest font-bold"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("account.new_password", "Nouveau mot de passe")}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[var(--primary-color)] transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--secondary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-color)] transition font-semibold text-lg disabled:opacity-50"
                  >
                    {loading ? t("common.loading") : (forgotStep === 1 ? t("account.send_code", "Envoyer le code") : t("account.reset_btn", "Réinitialiser"))}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setForgotStep(1);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      {t("account.back_to_login", "Retour à la connexion")}
                    </button>
                  </div>
                </form>
              ) : (
                /* ================= LOGIN / REGISTER FORM ================= */
                <>
                  <form
                    className="space-y-4"
                    onSubmit={isLogin ? handleLogin : handleRegister}
                  >
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={t("account.firstname")}
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                        />
                        <input
                          type="text"
                          placeholder={t("account.lastname")}
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                        />
                      </div>
                    )}

                    <input
                      type="email"
                      placeholder={t("account.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                    />
                    
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("account.password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={isLogin}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[var(--primary-color)] transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>

                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotStep(1);
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          {t("account.forgot_password")}
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[var(--secondary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-color)] transition font-semibold text-lg disabled:opacity-50"
                    >
                      {loading
                        ? t("common.loading")
                        : isLogin
                        ? t("account.login_btn")
                        : t("account.register_btn")}
                    </button>
                  </form>

                  {/* Separator */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t("account.or_continue_with")}</span>
                    </div>
                  </div>

                  {/* Google Login - Avec paramètres complets */}
                  <div className="flex justify-center mb-6">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="300"
                      locale="fr"
                      useOneTap={false}
                    />
                  </div>

                  {/* Switch login/register */}
                  <p className="text-center text-gray-600 text-sm">
                    {isLogin ? t("account.no_account") : t("account.have_account")}{" "}
                    <button
                      type="button"
                      className="text-[var(--primary-color)] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrorMessage("");
                      }}
                    >
                      {isLogin ? t("account.sign_up") : t("account.sign_in")}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AccountPage;