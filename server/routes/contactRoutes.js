import express from "express";
import Contact from "../models/Contact.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all contacts (public)
router.get("/", async (req, res) => {
  try {
    const { type, wing } = req.query;
    let filter = {};
    if (type && type !== "all") {
      filter.type = type;
    }
    if (wing && wing !== "all") {
      filter.wing = { $regex: wing, $options: "i" };
    }

    const contacts = await Contact.find(filter).sort({ order: 1, type: 1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    console.error("[Contacts] Error fetching:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
});

// Admin: Create contact
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { nameMr, nameEn, roleMr, roleEn, wing, phone, type, order } = req.body;
    if (!nameMr || !roleMr) {
      return res.status(400).json({ success: false, message: "नाव आणि पद आवश्यक आहे" });
    }

    const contact = new Contact({
      nameMr,
      nameEn: nameEn || "",
      roleMr,
      roleEn: roleEn || "",
      wing: wing || "सर्व विंग्ज",
      phone: phone || "",
      type: type || "committee",
      order: order || 0
    });

    await contact.save();
    res.status(201).json({ success: true, message: "Contact created", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create contact" });
  }
});

// Admin: Update contact
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    Object.assign(contact, req.body);
    await contact.save();
    res.json({ success: true, message: "Contact updated", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update contact" });
  }
});

// Admin: Delete contact
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
});

export default router;
