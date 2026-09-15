import React, { useState, useEffect } from "react";
import { 
  Save, Newspaper, Sparkles, Building, Flame, ShieldCheck, Share2 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatNewsletterBroadcast, openWhatsApp } from "../../utils/whatsappFormatter";

const NewsletterManager = ({ config, onSaveNewsletter, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    edition: "",
    editionEn: "",
    dateStr: "",
    dateStrEn: "",
    headline: "",
    headlineEn: "",
    subheadline: "",
    subheadlineEn: "",
    todaysHostWing: "",
    todaysHostWingEn: "",
    eveningAartiTime: "०८:०० PM",
    safetyTip: "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत. संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे.",
    safetyTipEn: "Please park vehicles only in designated spots. Complex is monitored 24x7 by CCTV.",
    specialNote: ""
  });

  useEffect(() => {
    if (config?.newsletter) {
      setForm({
        edition: config.newsletter.edition || "",
        editionEn: config.newsletter.editionEn || "",
        dateStr: config.newsletter.dateStr || "",
        dateStrEn: config.newsletter.dateStrEn || "",
        headline: config.newsletter.headline || "",
        headlineEn: config.newsletter.headlineEn || "",
        subheadline: config.newsletter.subheadline || "",
        subheadlineEn: config.newsletter.subheadlineEn || "",
        todaysHostWing: config.newsletter.todaysHostWing || "",
        todaysHostWingEn: config.newsletter.todaysHostWingEn || "",
        eveningAartiTime: config.newsletter.eveningAartiTime || "०८:०० PM",
        safetyTip: config.newsletter.safetyTip || "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत.",
        safetyTipEn: config.newsletter.safetyTipEn || "Please park vehicles only in designated spots.",
        specialNote: config.newsletter.specialNote || ""
      });
    }
  }, [config]);

  const handleAutoFillFromSchedule = (dayIdx) => {
    const schedule = config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || [];
    const item = schedule[dayIdx];
    if (!item) return;

    setForm(prev => ({
      ...prev,
      edition: `दैनिक डिजिटल उत्सव बुलेटिन (दिवस ${item.dayNumber || (dayIdx + 1)})`,
      editionEn: `Daily Festival Bulletin (Day ${item.dayNumber || (dayIdx + 1)})`,
      dateStr: item.dateStr || "",
      dateStrEn: item.dateStrEn || item.dateStr || "",
      headline: item.tithi || "दैनिक महापूजा व महाआरती",
      headlineEn: item.tithiEn || item.tithi || "Daily Mahapooja & Aarti",
      subheadline: `${item.morningRitual || item.ritual || ""} | ${item.eveningRitual || item.cultural || ""}`.trim(),
      subheadlineEn: `${item.morningRitualEn || item.morningRitual || ""} | ${item.eveningRitualEn || item.eveningRitual || ""}`.trim(),
      todaysHostWing: item.hostWing || "",
      todaysHostWingEn: item.hostWingEn || item.hostWing || "",
      eveningAartiTime: item.eveningTime || "०८:०० PM",
      specialNote: item.specialPrasad ? `विशेष महाप्रसाद: ${item.specialPrasad}` : (item.cultural ? `सांस्कृतिक: ${item.cultural}` : "")
    }));
    if (onNotify) {
      onNotify(isEn ? `Loaded details for Day ${item.dayNumber || (dayIdx + 1)}` : `दिवस ${item.dayNumber || (dayIdx + 1)} ची माहिती लोड केली!`, "info");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const res = await onSaveNewsletter(form);
    setIsSaving(false);
    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Daily bulletin updated successfully!" : "दैनिक वृत्तपत्र अद्ययावत केले!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save newsletter" : "वृत्तपत्र जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Daily Digital Bulletin Manager" 
          : "दैनिक डिजिटल वृत्तपत्र व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Manage today's headline, host building, Aarti timings, and safety tips for the daily bulletin banner on the homepage."
          : "मुख्य पृष्ठावरील 'दैनिक डिजिटल वृत्तपत्र' बॅनरमधील आजची मुख्य बातमी, यजमान इमारत, आरती वेळ व सुरक्षा टीप नियंत्रित करा."
      }
      icon={Newspaper}
      badge={isEn ? "Daily Bulletin" : "दैनिक पत्रिका"}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const txt = formatNewsletterBroadcast(form, config);
              openWhatsApp(txt);
              if (onNotify) onNotify(isEn ? "Opening WhatsApp with newsletter..." : "व्हॉट्सॲपवर वृत्तपत्र पाठवण्यासाठी तयार!", "success");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            title="थेट व्हॉट्सॲपवर पाठवा"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? "Share on WhatsApp" : "व्हॉट्सॲपवर पाठवा"}</span>
          </button>

          <FestiveButton
            onClick={handleSubmit}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Bulletin (वृत्तपत्र जतन करा)" : "वृत्तपत्र जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Live Preview Box */}
        <div className="p-4 bg-gradient-to-r from-maroon-900 via-maroon-850 to-maroon-900 text-white rounded-2xl border-2 border-gold-400 shadow-md">
          <span className="text-[10px] uppercase font-bold text-gold-300 block mb-2">
            {isEn ? "Live Website Preview:" : "वेबसाईटवर असे दिसेल (Live Preview):"}
          </span>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-black text-maroon-950 bg-gold-400 px-2.5 py-0.5 rounded-full uppercase">
              {isEn ? "Daily Digital Bulletin" : "दैनिक डिजिटल वृत्तपत्र"}
            </span>
            <span className="text-xs text-gold-200 font-semibold">
              {isEn ? (form.editionEn || form.edition || "Edition 1") : (form.edition || "अंक १")} • {isEn ? (form.dateStrEn || form.dateStr || "Today") : (form.dateStr || "आजची तारीख")}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-gold-100 font-heading mt-1">
            {isEn ? (form.headlineEn || form.headline || "Headline appears here...") : (form.headline || "मुख्य मथळा येथे दिसेल...")}
          </h4>
          <p className="text-xs text-gold-100/80 mt-1 line-clamp-2">
            {isEn ? (form.subheadlineEn || form.subheadline || "Summary appears here...") : (form.subheadline || "बातम्यांचा सारांश येथे दिसेल...")}
          </p>
          <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
            <span className="bg-maroon-950 px-2 py-0.5 rounded border border-gold-500/30 text-gold-300">
              {isEn ? "Aarti:" : "आरती:"} <strong>{form.eveningAartiTime}</strong>
            </span>
            <span className="bg-maroon-950 px-2 py-0.5 rounded border border-gold-500/30 text-gold-300">
              {isEn ? "Host:" : "यजमान:"} <strong>{isEn ? (form.todaysHostWingEn || form.todaysHostWing || "Select Wing") : (form.todaysHostWing || "विंग निवडा")}</strong>
            </span>
          </div>
        </div>

        {/* Quick Auto-Fill from 10-Day Festival Schedule */}
        <div className="bg-amber-50/80 border border-gold-300/80 rounded-xl p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <span className="font-black text-maroon-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-festive-saffron" />
              <span>{isEn ? "⚡ Quick-fill from 10-Day Festival Schedule:" : "⚡ १० दिवसांच्या वेळापत्रकातून त्वरित माहिती भरा:"}</span>
            </span>
            <span className="text-[11px] text-gray-600">
              {isEn ? "Click any day to auto-populate fields" : "दिवसावर क्लिक केल्यास सर्व रकाने आपोआप भरले जातील"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || []).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAutoFillFromSchedule(idx)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  item.isCurrentDay 
                    ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-xs" 
                    : "bg-white text-maroon-950 hover:bg-gold-100 border-gold-300"
                }`}
                title={item.tithi || `दिवस ${item.dayNumber || (idx + 1)}`}
              >
                <span>दिवस {item.dayNumber || (idx + 1)}</span>
                {item.isCurrentDay && <span className="ml-1 text-[9px] bg-red-600 text-white px-1 py-0.2 rounded-full font-black">आज</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields: Edition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveInput
            label={isEn ? "Edition / Issue (Marathi) *" : "अंक / आवृत्ती (मराठी) *"}
            value={form.edition}
            onChange={(e) => setForm({ ...form, edition: e.target.value })}
            placeholder="उदा. अंक १ (दिवस १ - श्री गणेश चतुर्थी)"
            required
          />
          <FestiveInput
            label={isEn ? "Edition / Issue (English)" : "Edition (English)"}
            value={form.editionEn}
            onChange={(e) => setForm({ ...form, editionEn: e.target.value })}
            placeholder="e.g. Edition 1 (Day 1 - Ganesh Chaturthi)"
          />
        </div>

        {/* Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveInput
            label={isEn ? "Date (Marathi) *" : "दिनांक (मराठी) *"}
            value={form.dateStr}
            onChange={(e) => setForm({ ...form, dateStr: e.target.value })}
            placeholder="उदा. ७ सप्टेंबर २०२६"
            required
          />
          <FestiveInput
            label={isEn ? "Date (English)" : "Date (English)"}
            value={form.dateStrEn}
            onChange={(e) => setForm({ ...form, dateStrEn: e.target.value })}
            placeholder="e.g. 7 September 2026"
          />
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveInput
            label={isEn ? "Headline (Marathi) *" : "मुख्य मथळा बातमी (मराठी) *"}
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="उदा. श्री गणरायाचे भव्य आगमन व प्राणप्रतिष्ठा सोहळा संपन्न!"
            required
          />
          <FestiveInput
            label={isEn ? "Headline (English)" : "English Headline"}
            value={form.headlineEn}
            onChange={(e) => setForm({ ...form, headlineEn: e.target.value })}
            placeholder="e.g. Grand Arrival & Murti Sthapana Completed!"
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveTextarea
            label={isEn ? "Summary Story (Marathi)" : "बातमीचा सविस्तर सारांश (मराठी)"}
            rows={3}
            value={form.subheadline}
            onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
            placeholder="सर्व ४ इमारतींमधील भाविकांच्या उत्स्फूर्त उपस्थितीत..."
          />
          <FestiveTextarea
            label={isEn ? "Summary Story (English)" : "English Summary"}
            rows={3}
            value={form.subheadlineEn}
            onChange={(e) => setForm({ ...form, subheadlineEn: e.target.value })}
            placeholder="With enthusiastic participation from residents across all 4 buildings..."
          />
        </div>

        {/* Host Wing & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FestiveInput
            label={isEn ? "Today's Host Wing (Marathi)" : "आजची यजमान इमारत (मराठी)"}
            icon={Building}
            value={form.todaysHostWing}
            onChange={(e) => setForm({ ...form, todaysHostWing: e.target.value })}
            placeholder="उदा. G WING - नंदादेवी"
          />
          <FestiveInput
            label={isEn ? "Today's Host Wing (English)" : "Host Wing (English)"}
            icon={Building}
            value={form.todaysHostWingEn}
            onChange={(e) => setForm({ ...form, todaysHostWingEn: e.target.value })}
            placeholder="e.g. G Wing - Nandadevi"
          />
          <FestiveInput
            label={isEn ? "Evening Aarti Timing" : "संध्याकाळची आरती वेळ"}
            icon={Flame}
            value={form.eveningAartiTime}
            onChange={(e) => setForm({ ...form, eveningAartiTime: e.target.value })}
            placeholder="उदा. रात्री ०८:०० वाजता / 08:00 PM"
          />
          <FestiveInput
            label={isEn ? "Safety / Parking Notice" : "सुरक्षा / पार्किंग टीप"}
            icon={ShieldCheck}
            value={form.safetyTip}
            onChange={(e) => setForm({ ...form, safetyTip: e.target.value })}
            placeholder="उदा. संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे."
          />
        </div>

      </form>
    </FestiveCard>
  );
};

export default NewsletterManager;
