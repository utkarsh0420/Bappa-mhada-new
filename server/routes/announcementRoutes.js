import express from "express";
import Announcement from "../models/Announcement.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all active announcements (public)
router.get("/", async (req, res) => {
  try {
    const { category, wing } = req.query;
    let filter = { isActive: true };
    if (category && category !== "all") {
      filter.category = category;
    }
    if (wing && wing !== "All") {
      filter.targetWings = { $in: [wing, "All"] };
    }

    const announcements = await Announcement.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    console.error("[Announcements] Error fetching:", error.message);
    res.status(500).json({ success: false, message: "Error loading announcements" });
  }
});

// Admin: GET all announcements including inactive
router.get("/admin/all", protectAdmin, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading admin announcements" });
  }
});

// Admin: Create announcement
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { titleMr, titleEn, descriptionMr, descriptionEn, category, priority, isPinned, targetWings, badgeText } = req.body;

    if (!titleMr || !descriptionMr) {
      return res.status(400).json({ success: false, message: "मराठी शीर्षक व माहिती आवश्यक आहे (Marathi title and description required)" });
    }

    const announcement = new Announcement({
      titleMr,
      titleEn: titleEn || "",
      descriptionMr,
      descriptionEn: descriptionEn || "",
      category: category || "general",
      priority: priority || "normal",
      isPinned: isPinned || false,
      targetWings: targetWings || ["All"],
      badgeText: badgeText || "नवीन सूचना"
    });

    await announcement.save();
    res.status(201).json({ success: true, message: "Announcement created", data: announcement });
  } catch (error) {
    console.error("[Announcements] Create error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
});

// Admin: Update announcement
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    Object.assign(announcement, req.body);
    await announcement.save();
    res.json({ success: true, message: "Announcement updated", data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update announcement" });
  }
});

// Admin: Delete announcement
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
});

export default router;
