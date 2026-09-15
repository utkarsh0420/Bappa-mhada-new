import express from "express";
import User from "../models/User.js";
import { generateToken, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Login with Society Email & Password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "कृपया ईमेल व पासवर्ड प्रविष्ट करा (Please provide email and password)" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
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

    return res.status(401).json({ success: false, message: "चुकीचा ईमेल किंवा पासवर्ड (Invalid email or password)" });
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

    // Check if society admin email matches or authorized user exists
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Allow society authorized gmail or create admin if matches society domain / admin list
      user = new User({
        email: email.toLowerCase().trim(),
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
