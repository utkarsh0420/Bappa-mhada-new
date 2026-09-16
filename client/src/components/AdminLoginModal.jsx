import React, { useState } from "react";
import { X, Lock, Mail, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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



        </div>

      </div>
    </div>
  );
};

export default AdminLoginModal;
