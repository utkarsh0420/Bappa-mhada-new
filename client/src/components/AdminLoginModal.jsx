import React, { useState } from "react";
import { X, Lock, Mail, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("mhadatowersutsavmandal@gmail.com");
  const [password, setPassword] = useState("MhadaGanpati@2025");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "google"

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || "लॉगिन अयशस्वी झाले. कृपया ईमेल व पासवर्ड तपासा.");
    }
  };

  const handleGoogleSimulate = async () => {
    setError("");
    setIsLoading(true);

    const res = await googleLogin({
      email: "mhadatowersutsavmandal@gmail.com",
      name: "म्हाडा उत्सव मंडळ कमिटी (Google Society Account)",
      googleId: "google-oauth-society"
    });
    setIsLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || "Google द्वारे लॉगिन अयशस्वी झाले.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-gold-500 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-850 text-white p-5 flex items-center justify-between border-b-2 border-gold-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-maroon-800 rounded-xl border border-gold-500/40">
              <Lock className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-gold-200">
                व्यवस्थापक प्रवेशद्वार (Admin Login)
              </h3>
              <p className="text-xs text-gold-100/80">
                म्हाडा टॉवर्स उत्सव मंडळ अधिकृत व्यवस्थापन
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gold-200 hover:text-white hover:bg-maroon-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Google Sign In button */}
          <div className="mb-5">
            <button
              onClick={handleGoogleSimulate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2.5 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-xs transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Sign in with Google (Society Email)</span>
            </button>
            <div className="flex items-center gap-3 my-4">
              <span className="h-px bg-gray-200 flex-1"></span>
              <span className="text-[11px] text-gray-500 uppercase font-semibold">किंवा ईमेलने लॉगिन करा</span>
              <span className="h-px bg-gray-200 flex-1"></span>
            </div>
          </div>

          {/* Form for Society Email / Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                सोसायटी अधिकृत ईमेल (Society Email / Username)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mhadatowersutsavmandal@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-maroon-850 to-maroon-700 hover:from-maroon-800 hover:to-maroon-600 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/50 shadow-md transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>पडताळणी सुरू आहे...</span>
              ) : (
                <>
                  <span>व्यवस्थापक लॉगिन करा</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Helper Credentials Hint */}
          <div className="mt-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-maroon-900">
            <span className="font-bold">प्रात्यक्षिक प्रवेश माहिती:</span>
            <div className="text-gray-600">ईमेल: <code className="text-maroon-850 font-semibold">mhadatowersutsavmandal@gmail.com</code></div>
            <div className="text-gray-600">पासवर्ड: <code className="text-maroon-850 font-semibold">MhadaGanpati@2025</code></div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLoginModal;
