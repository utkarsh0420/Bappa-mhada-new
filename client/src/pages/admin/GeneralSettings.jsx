import React, { useState, useEffect } from "react";
import { 
  Save, Settings, Sparkles, PhoneCall, QrCode, 
  Flame, Megaphone, Globe, Building2, Tag 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, 
  FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const GeneralSettings = ({ config, onSaveGeneral }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    mandalNameMr: "",
    mandalNameEn: "",
    regNo: "",
    festivalYear: "",
    marqueeText: "",
    festivalStatus: "",
    emergencyHelpline: "",
    whatsAppCommunityLink: ""
  });

  useEffect(() => {
    if (config) {
      setForm({
        mandalNameMr: config.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ",
        mandalNameEn: config.mandalNameEn || "MHADA Towers Utsav Mandal",
        regNo: config.regNo || "१२४३/२०२५ - पुणे",
        festivalYear: config.festivalYear || "२०२५ - २०२६",
        marqueeText: config.marqueeText || "",
        festivalStatus: config.festivalStatus || "उत्सव सुरू आहे",
        emergencyHelpline: config.emergencyHelpline || "+91 98220 11223",
        whatsAppCommunityLink: config.whatsAppCommunityLink || ""
      });
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveGeneral(form);
    setIsSaving(false);
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Ticker Scroller & General Settings" 
          : "स्क्रोलर टिकर व सर्वसाधारण सेटिंग्ज"
      }
      subtitle={
        isEn
          ? "Manage the top marquee ticker, Mandal registered name, registration number, festival year, status badge, and WhatsApp link."
          : "वेबसाईटवरील शीर्षस्थ धावणारी पट्टी, मंडळाचे अधिकृत नाव, नोंदणी क्रमांक, उत्सव वर्ष, स्थिती बॅज व व्हॉट्सॲप लिंक नियंत्रित करा."
      }
      icon={Settings}
      badge={isEn ? "General Settings" : "सामान्य सेटिंग्ज"}
      action={
        <FestiveButton
          onClick={handleSubmit}
          icon={Save}
          variant="primary"
          size="md"
          disabled={isSaving}
        >
          {isSaving 
            ? (isEn ? "Saving..." : "जतन करत आहे...") 
            : (isEn ? "Save Settings (बदल जतन करा)" : "बदल जतन करा (Save)")
          }
        </FestiveButton>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Mandal Brand Info Section */}
        <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-white rounded-2xl border-1.5 border-gold-300/80 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Building2 className="w-4 h-4 text-maroon-800" />
            <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
              {isEn ? "Official Mandal Brand Information" : "मंडळ अधिकृत नाव व नोंदणी माहिती (Brand Information)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Mandal Name (Marathi) *" : "मंडळाचे नाव (मराठी) *"}
              icon={Building2}
              value={form.mandalNameMr}
              onChange={(e) => setForm({ ...form, mandalNameMr: e.target.value })}
              placeholder="उदा. म्हाडा टॉवर्स उत्सव मंडळ"
              required
            />

            <FestiveInput
              label={isEn ? "Mandal Name (English)" : "Mandal Name (English)"}
              icon={Globe}
              value={form.mandalNameEn}
              onChange={(e) => setForm({ ...form, mandalNameEn: e.target.value })}
              placeholder="e.g. MHADA Towers Utsav Mandal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Registration Number" : "धर्मादाय नोंदणी क्रमांक (Registration No)"}
              icon={Tag}
              value={form.regNo}
              onChange={(e) => setForm({ ...form, regNo: e.target.value })}
              placeholder={isEn ? "e.g. 1243/2025 - Pune" : "उदा. १२४३/२०२५ - पुणे"}
            />

            <FestiveInput
              label={isEn ? "Festival Year" : "उत्सव वर्ष (Festival Year)"}
              icon={Sparkles}
              value={form.festivalYear}
              onChange={(e) => setForm({ ...form, festivalYear: e.target.value })}
              placeholder={isEn ? "2025 - 2026" : "उदा. २०२५ - २०२६"}
            />
          </div>
        </div>

        {/* Marquee Ticker Section */}
        <div className="space-y-3 p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-white rounded-2xl border-1.5 border-gold-300/80 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Megaphone className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
              {isEn ? "Top Marquee Ticker Message" : "वेबसाईटच्या वर धावणारा स्क्रोलर मजकूर (Marquee Ticker)"}
            </span>
          </div>

          <FestiveTextarea
            label={isEn ? "Marquee Ticker Text" : "स्क्रोलर मजकूर (Marquee Text)"}
            rows={3}
            value={form.marqueeText}
            onChange={(e) => setForm({ ...form, marqueeText: e.target.value })}
            placeholder="उदा. 🚩 म्हाडा टॉवर्स गणेशोत्सव २०२५ मध्ये सर्व भाविकांचे हार्दिक स्वागत!..."
            helperText={
              isEn 
                ? "This text continuously scrolls across the top golden ribbon of the website." 
                : "हा मजकूर वेबसाईटच्या सर्वात वर लाल-सुनेहरी रंगाच्या पट्टीवर सतत स्क्रोल होत राहील."
            }
          />

          {/* Live Preview Box */}
          <div>
            <span className="text-[11px] font-bold text-stone-600 block mb-1">
              {isEn ? "Live Website Preview:" : "थेट पूर्वावलोकन (Live Preview on Website):"}
            </span>
            <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-gold-200 p-2.5 rounded-xl border border-gold-400/80 overflow-hidden shadow-inner flex items-center gap-2 text-xs">
              <span className="bg-gold-400 text-maroon-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1 flex-shrink-0">
                <Flame className="w-3 h-3 text-orange-600 flex-shrink-0" />
                {isEn ? "LIVE ALERT" : "ताजी सूचना"}
              </span>
              <p className="truncate font-semibold text-gold-100 min-w-0 flex-1">
                {form.marqueeText || (isEn ? "Ticker text will appear here..." : "मजकूर येथे दिसेल...")}
              </p>
            </div>
          </div>
        </div>

        {/* Festival Status & Helpline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveInput
            label={isEn ? "Festival Status Badge" : "उत्सव सद्यस्थिती (Status Badge)"}
            icon={Sparkles}
            value={form.festivalStatus}
            onChange={(e) => setForm({ ...form, festivalStatus: e.target.value })}
            placeholder={isEn ? "e.g. Festival Live / Pre-festival preparations" : "उदा. उत्सव सुरू आहे / आगमन पूर्व तयारी"}
            helperText={isEn ? "Displayed as a live status badge on the website." : "वेबसाईटवर स्टेटस बॅज म्हणून दिसेल."}
          />

          <FestiveInput
            label={isEn ? "Main Emergency Helpline Number" : "तातडीचा मुख्य हेल्पलाइन क्रमांक"}
            icon={PhoneCall}
            value={form.emergencyHelpline}
            onChange={(e) => setForm({ ...form, emergencyHelpline: e.target.value })}
            placeholder="+91 98220 11223"
            helperText={isEn ? "Displayed directly in emergency and contact desk." : "आपत्कालीन संपर्क कक्षामध्ये थेट प्रदर्शित होईल."}
          />
        </div>

        {/* WhatsApp Group Link */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 rounded-2xl border-1.5 border-emerald-300/80">
          <FestiveInput
            label={isEn ? "Official WhatsApp Group / Community Invite Link" : "अधिकृत व्हॉट्सॲप ग्रुप / कम्युनिटी लिंक (WhatsApp Group Link)"}
            icon={QrCode}
            value={form.whatsAppCommunityLink}
            onChange={(e) => setForm({ ...form, whatsAppCommunityLink: e.target.value })}
            placeholder="https://chat.whatsapp.com/..."
            helperText={isEn ? "Updating this link will automatically regenerate the WhatsApp QR code on the website." : "ही लिंक बदलल्यास वेबसाईटवरील QR कोड आपोआप नवीन ग्रुपसाठी अपडेट होईल."}
          />
        </div>

        {/* Bottom Save Action */}
        <div className="pt-2 flex justify-end">
          <FestiveButton
            type="submit"
            icon={Save}
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save All Settings (सर्व बदल जतन करा)" : "सर्व बदल जतन करा (Save Settings)")
            }
          </FestiveButton>
        </div>

      </form>
    </FestiveCard>
  );
};

export default GeneralSettings;
