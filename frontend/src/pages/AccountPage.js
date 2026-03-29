// src/pages/AccountPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import logo from "../images/HabibahLOGO.png";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/users";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "630562961099-qulo0g9i2024pqbm6dcmkraooalt9fir.apps.googleusercontent.com";

function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

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

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (error) {
      console.error("❌ Erreur connexion :", error);
      setErrorMessage(error.response?.data?.message || "Erreur lors de la connexion");
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
      setErrorMessage(error.response?.data?.message || "Erreur lors de l'envoi du code");
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
      setErrorMessage(error.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("✅ Google credential response reçu:", credentialResponse);
    
    if (!credentialResponse?.credential) {
      setErrorMessage("Erreur Google : token manquant");
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
        setErrorMessage("Le serveur ne répond pas. Vérifiez que le backend est lancé sur http://localhost:5000");
      } else {
        setErrorMessage("Erreur: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Erreur Google Login");
    setErrorMessage("Erreur d'affichage du bouton Google");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Fonctionnalité à venir");
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
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto mb-6 object-cover"
                />
                <h1 className="text-3xl font-bold mb-4">Douceurs Tunisiennes</h1>
                <p className="text-lg opacity-90 mb-6">Bio & Traditionnelles</p>
              </div>
            </div>

            {/* RIGHT SIDE - DESIGN INCHANGÉ */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {isLogin ? "Bon retour parmi nous !" : "Rejoignez-nous"}
              </h2>

              {/* Message d'erreur détaillé */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  <strong>⚠️ Erreur :</strong> {errorMessage}
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

              {showOtp ? (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <p className="text-gray-600 text-sm text-center mb-4">
                    Un code de vérification a été envoyé à <strong>{email}</strong>.<br/>
                    Veuillez le saisir ci-dessous pour finaliser la création de votre compte.
                  </p>
                  <input
                    type="text"
                    placeholder="Code à 6 chiffres"
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
                    {loading ? "Vérification..." : "Vérifier et créer mon compte"}
                  </button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Retour
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <form
                    className="space-y-4"
                    onSubmit={isLogin ? handleLogin : handleRegister}
                  >
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                        />
                      </div>
                    )}

                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                    />
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isLogin}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] bg-gray-50"
                    />

                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[var(--secondary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-color)] transition font-semibold text-lg disabled:opacity-50"
                    >
                      {loading
                        ? "Chargement..."
                        : isLogin
                        ? "Se connecter"
                        : "Créer mon compte"}
                    </button>
                  </form>

                  {/* Separator */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
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
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                    <button
                      type="button"
                      className="text-[var(--primary-color)] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrorMessage("");
                      }}
                    >
                      {isLogin ? "S'inscrire" : "Se connecter"}
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