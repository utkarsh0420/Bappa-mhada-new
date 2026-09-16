import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken, protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const router = express.Router();

const OFFICIAL_ADMIN_EMAIL = "mhadatowersutsavmandal@gmail.com";
const OFFICIAL_ADMIN_PASS = "mhada@hig";

// Admin Login with Society Email & Password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "कृपया ईमेल व पासवर्ड प्रविष्ट करा (Please provide email and password)" 
      });
    }

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPassword = (password || "").trim();

    const isOfficialEmail = cleanEmail === OFFICIAL_ADMIN_EMAIL;
    const isOfficialPassword = cleanPassword === OFFICIAL_ADMIN_PASS;

    // 1. Direct official committee admin credential check (Always instant & foolproof)
    if (isOfficialEmail && isOfficialPassword) {
      const token = generateToken("admin_society_mhada", { email: OFFICIAL_ADMIN_EMAIL, role: "admin" });
      return res.json({
        success: true,
        token,
        user: {
          id: "admin_society_mhada",
          name: "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
          email: OFFICIAL_ADMIN_EMAIL,
          role: "admin"
        }
      });
    }

    // 2. Check MongoDB if connected
    if (isDatabaseConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user && (await user.matchPassword(password))) {
          return res.json({
            success: true,
            token: generateToken(user._id),
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      } catch (dbError) {
        console.warn("[Auth] Mongo lookup failed, checking local store:", dbError.message);
      }
    }

    // 3. Check local JSON store
    const localUser = localStore.getUserByEmail(cleanEmail);
    if (localUser) {
      const matches = localUser.passwordHash 
        ? bcrypt.compareSync(password, localUser.passwordHash)
        : (localUser.password === password);
      
      if (matches) {
        return res.json({
          success: true,
          token: generateToken(localUser._id),
          user: {
            id: localUser._id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role
          }
        });
      }
    }

    return res.status(401).json({ 
      success: false, 
      message: "चुकीचा ईमेल किंवा पासवर्ड (Invalid email or password)" 
    });
  } catch (error) {
    console.error("[Auth] Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Google Sign-In verification
router.post("/google", async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required from Google sign in" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, save or find
    if (isDatabaseConnected()) {
      try {
        let user = await User.findOne({ email: cleanEmail });
        if (!user) {
          user = new User({
            email: cleanEmail,
            name: name || "Society Google Admin",
            password: Math.random().toString(36).slice(-10),
            role: "admin",
            googleId: googleId || "google-auth"
          });
          await user.save();
        }
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } catch (dbErr) {
        console.warn("[Auth] Google sign in Mongo error, falling back to local:", dbErr.message);
      }
    }

    // 2. Local fallback for Google login
    let localUser = localStore.getUserByEmail(cleanEmail);
    if (!localUser) {
      localUser = localStore.createUser({
        email: cleanEmail,
        name: name || "Society Google Admin",
        passwordHash: bcrypt.hashSync(Math.random().toString(36).slice(-10), 10),
        role: "admin",
        googleId: googleId || "google-auth"
      });
    }

    return res.json({
      success: true,
      token: generateToken(localUser._id),
      user: {
        id: localUser._id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role
      }
    });
  } catch (error) {
    console.error("[Auth] Google login error:", error.message);
    res.status(500).json({ success: false, message: "Google authentication failed" });
  }
});

// Get Current Logged In Admin Profile
router.get("/me", protectAdmin, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
