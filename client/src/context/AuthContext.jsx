import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

const OFFICIAL_ADMIN_EMAILS = [
  "mhadatowersutsavmandal@gmail.com"
];
const OFFICIAL_ADMIN_PASS = "mhada@hig";

const DEFAULT_ADMIN_USER = {
  id: "admin_society_mhada",
  _id: "admin_society_mhada",
  name: "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
  email: "mhadatowersutsavmandal@gmail.com",
  role: "admin"
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("mhada_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("mhada_admin_token") || null);
  const [loading, setLoading] = useState(true);

  // Check current session
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          if (res.data?.success && res.data.user) {
            setAdmin(res.data.user);
            localStorage.setItem("mhada_admin_user", JSON.stringify(res.data.user));
          } else {
            if (res.data && !res.data.success) {
              logout();
            }
          }
        } catch (err) {
          // If server is active and returned 401/403, token is actually invalid
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.warn("Auth session expired, logging out:", err.message);
            logout();
          } else {
            // Server offline or network error - retain existing local admin session!
            console.warn("Server offline or unreachable, retaining local admin credentials:", err.message);
            const saved = localStorage.getItem("mhada_admin_user");
            if (saved) {
              try {
                setAdmin(JSON.parse(saved));
              } catch {
                setAdmin(DEFAULT_ADMIN_USER);
              }
            } else if (token) {
              setAdmin(DEFAULT_ADMIN_USER);
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPassword = (password || "").trim();

    const isMatchOfficial = 
      OFFICIAL_ADMIN_EMAILS.includes(cleanEmail) &&
      cleanPassword === OFFICIAL_ADMIN_PASS;

    try {
      const res = await API.post("/auth/login", { email: cleanEmail, password: cleanPassword });
      if (res.data?.success) {
        localStorage.setItem("mhada_admin_token", res.data.token);
        localStorage.setItem("mhada_admin_user", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setAdmin(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "लॉगिन अयशस्वी झाले" };
    } catch (err) {
      // 1. If server explicitly rejected password with 400 or 401
      if (err.response?.status === 400 || err.response?.status === 401) {
        return {
          success: false,
          message: err.response?.data?.message || "चुकीचा ईमेल किंवा पासवर्ड (Invalid email or password)"
        };
      }

      // 2. If server is offline / unreachable (Network error / Vite 504 / 500)
      if (isMatchOfficial) {
        const localToken = "offline_admin_token_" + Date.now();
        localStorage.setItem("mhada_admin_token", localToken);
        localStorage.setItem("mhada_admin_user", JSON.stringify(DEFAULT_ADMIN_USER));
        setToken(localToken);
        setAdmin(DEFAULT_ADMIN_USER);
        return { success: true, offline: true };
      }

      return {
        success: false,
        message: err.response?.data?.message || "सर्व्हरशी संपर्क होऊ शकला नाही. कृपया बॅकएंड सुरू करा किंवा अधिकृत पासवर्ड वापरा."
      };
    }
  };

  const googleLogin = async (googleProfile) => {
    try {
      const res = await API.post("/auth/google", googleProfile);
      if (res.data?.success) {
        localStorage.setItem("mhada_admin_token", res.data.token);
        localStorage.setItem("mhada_admin_user", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setAdmin(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      // Fallback Google Login if backend server is unreachable
      if (!err.response || err.response?.status >= 500 || err.code === "ERR_NETWORK") {
        const localGoogleUser = {
          id: "admin_society_mhada_google",
          _id: "admin_society_mhada_google",
          name: googleProfile?.name || "म्हाडा उत्सव मंडळ कमिटी (Google Society Account)",
          email: googleProfile?.email || "mhadatowersutsavmandal@gmail.com",
          role: "admin"
        };
        const localToken = "offline_google_token_" + Date.now();
        localStorage.setItem("mhada_admin_token", localToken);
        localStorage.setItem("mhada_admin_user", JSON.stringify(localGoogleUser));
        setToken(localToken);
        setAdmin(localGoogleUser);
        return { success: true, offline: true };
      }
      return {
        success: false,
        message: err.response?.data?.message || "Google लॉगिन अयशस्वी (Google login failed)"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("mhada_admin_token");
    localStorage.removeItem("mhada_admin_user");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
