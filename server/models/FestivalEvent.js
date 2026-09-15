import mongoose from "mongoose";

const festivalEventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    default: "cultural"
  },
  categoryEn: {
    type: String,
    default: ""
  },
  eventType: {
    type: String,
    enum: ["festival", "yearly"],
    default: "festival"
  },
  titleMr: { type: String, required: true },
  titleEn: { type: String, default: "" },
  time: { type: String, required: true },
  dateStr: { type: String, required: true },
  dateStrEn: { type: String, default: "" },
  dayNumber: { type: Number, default: 1 },
  venue: { type: String, default: "मुख्य मंडप, म्हाडा टॉवर्स प्रांगण" },
  venueEn: { type: String, default: "" },
  hostWing: { type: String, default: "सर्व विंग्ज (G, H, J, K)" },
  hostWingEn: { type: String, default: "" },
  descriptionMr: { type: String, default: "" },
  descriptionEn: { type: String, default: "" },
  isHighlight: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming"
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

const FestivalEvent = mongoose.model("FestivalEvent", festivalEventSchema);
export default FestivalEvent;
