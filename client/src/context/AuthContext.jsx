import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("mhada_admin_token") || null);
  const [loading, setLoading] = useState(true);

  // Check current session
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setAdmin(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth session expired:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("mhada_admin_token", res.data.token);
        setToken(res.data.token);
        setAdmin(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "लॉगिन अयशस्वी झाले (Login failed)"
      };
    }
  };

  const googleLogin = async (googleProfile) => {
    try {
      const res = await API.post("/auth/google", googleProfile);
      if (res.data.success) {
        localStorage.setItem("mhada_admin_token", res.data.token);
        setToken(res.data.token);
        setAdmin(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Google लॉगिन अयशस्वी (Google login failed)"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("mhada_admin_token");
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
