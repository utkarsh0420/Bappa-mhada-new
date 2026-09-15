import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedInitialData } from "./seed/seedData.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Serve uploaded media statically
app.use("/uploads", express.static(uploadsDir));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploads", uploadRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MHADA Towers Utsav Mandal API",
    time: new Date().toISOString()
  });
});

// Serve production client build if exists with SPA fallback
const clientDistDir = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    res.sendFile(path.join(clientDistDir, "index.html"));
  });
}

// Start Server and Database Connection
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedInitialData();
  }

  app.listen(PORT, () => {
    console.log(`[MHADA Utsav Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
