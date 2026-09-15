import express from "express";
import FestivalEvent from "../models/FestivalEvent.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all events (public)
router.get("/", async (req, res) => {
  try {
    const { category, day, eventType } = req.query;
    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (day && day !== "all") {
      filter.dayNumber = Number(day);
    }
    if (eventType && eventType !== "all") {
      filter.eventType = eventType;
    }

    const events = await FestivalEvent.find(filter).sort({ dayNumber: 1, order: 1, createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error("[Events] Error fetching events:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

// Admin: Create Event
router.post("/", protectAdmin, async (req, res) => {
  try {
    const {
      category,
      categoryEn,
      eventType,
      titleMr,
      titleEn,
      time,
      dateStr,
      dateStrEn,
      dayNumber,
      venue,
      venueEn,
      hostWing,
      hostWingEn,
      descriptionMr,
      descriptionEn,
      isHighlight,
      imageUrl,
      status
    } = req.body;

    if (!titleMr || !time || !dateStr) {
      return res.status(400).json({ success: false, message: "आवश्यक माहिती अपूर्ण आहे (Missing required fields)" });
    }

    const event = new FestivalEvent({
      category: category || "cultural",
      categoryEn: categoryEn || "",
      eventType: eventType || "festival",
      titleMr,
      titleEn: titleEn || "",
      time,
      dateStr,
      dateStrEn: dateStrEn || "",
      dayNumber: dayNumber || 1,
      venue: venue || "मुख्य मंडप, म्हाडा टॉवर्स",
      venueEn: venueEn || "",
      hostWing: hostWing || "सर्व विंग्ज (G, H, J, K)",
      hostWingEn: hostWingEn || "",
      descriptionMr: descriptionMr || "",
      descriptionEn: descriptionEn || "",
      isHighlight: isHighlight || false,
      imageUrl: imageUrl || "",
      status: status || "upcoming"
    });

    await event.save();
    res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (error) {
    console.error("[Events] Create error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
});

// Admin: Bulk Import Events (from local JSON / CSV file)
router.post("/bulk", protectAdmin, async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "No events provided for import" });
    }

    const validEvents = events
      .filter((ev) => ev.titleMr && ev.time && ev.dateStr)
      .map((ev) => ({
        category: ev.category || "cultural",
        categoryEn: ev.categoryEn || "",
        eventType: ev.eventType === "yearly" ? "yearly" : "festival",
        titleMr: ev.titleMr,
        titleEn: ev.titleEn || ev.titleMr,
        time: ev.time,
        dateStr: ev.dateStr,
        dateStrEn: ev.dateStrEn || ev.dateStr,
        dayNumber: Number(ev.dayNumber) || 1,
        venue: ev.venue || "मुख्य मंडप, म्हाडा टॉवर्स",
        venueEn: ev.venueEn || "",
        hostWing: ev.hostWing || "सर्व विंग्ज (G, H, J, K)",
        hostWingEn: ev.hostWingEn || "",
        descriptionMr: ev.descriptionMr || "",
        descriptionEn: ev.descriptionEn || "",
        isHighlight: Boolean(ev.isHighlight),
        imageUrl: ev.imageUrl || "",
        status: ev.status || "upcoming"
      }));

    if (validEvents.length === 0) {
      return res.status(400).json({ success: false, message: "No valid events with title, time, and date found" });
    }

    const inserted = await FestivalEvent.insertMany(validEvents);
    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} events from device`,
      count: inserted.length,
      data: inserted
    });
  } catch (error) {
    console.error("[Events] Bulk import error:", error.message);
    res.status(500).json({ success: false, message: "Failed to bulk import events" });
  }
});

// Admin: Update Event
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const event = await FestivalEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ success: true, message: "Event updated", data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event" });
  }
});

// Admin: Delete Event
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const event = await FestivalEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

export default router;
