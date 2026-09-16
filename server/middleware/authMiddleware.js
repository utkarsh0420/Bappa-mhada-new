import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "mhada_utsav_mandal_secret_key_2025_pune";

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // 1. If MongoDB is connected, try loading from Mongo
      if (isDatabaseConnected()) {
        try {
          const user = await User.findById(decoded.id).select("-password");
          if (user) {
            req.user = user;
            return next();
          }
        } catch (dbErr) {
          console.warn("[Auth] Mongo lookup failed, checking local store:", dbErr.message);
        }
      }

      // 2. Check local store
      const localUser = localStore.getUserById(decoded.id);
      if (localUser) {
        req.user = {
          _id: localUser._id,
          id: localUser._id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role
        };
        return next();
      }

      // 3. Fallback for society admin token
      if (decoded.id === "admin_society_mhada" || decoded.email === "mhadatowersutsavmandal@gmail.com") {
        req.user = {
          _id: "admin_society_mhada",
          id: "admin_society_mhada",
          name: "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
          email: "mhadatowersutsavmandal@gmail.com",
          role: "admin"
        };
        return next();
      }

      return res.status(401).json({ success: false, message: "User not found" });
    } catch (error) {
      console.error("[Auth] Token verification failed:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

export const generateToken = (id, extra = {}) => {
  return jwt.sign({ id, ...extra }, JWT_SECRET, {
    expiresIn: "30d"
  });
};
