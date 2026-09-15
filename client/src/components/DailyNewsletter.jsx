import React, { useState, useEffect } from "react";
import { 
  Newspaper, Building, Flame, ShieldCheck, 
  Sparkles, Clock, Share2, Calendar, Check, Copy, 
  Utensils, Music, ChevronRight, UserCheck
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { openWhatsApp, formatNewsletterBroadcast, copyToClipboard } from "../utils/whatsappFormatter";

const DailyNewsletter = ({ onOpenUpcomingCalendar }) => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [copied, setCopied] = useState(false);

  // If newsletter tab is disabled by admin, return null
  if (config?.tabs?.newsletter && !config.tabs.newsletter.enabled) {
    return null;
  }

  const schedule = config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || [];
  
  // Find current active day marked by admin
  const currentDayIndex = schedule.findIndex((d) => d.isCurrentDay);
  const defaultIdx = currentDayIndex !== -1 ? currentDayIndex : 0;
  
  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultIdx);

  // Automatically update selected day whenever admin changes isCurrentDay in live sync
  useEffect(() => {
    if (currentDayIndex !== -1) {
      setSelectedDayIdx(currentDayIndex);
    }
  }, [currentDayIndex, config?.dailyAartiSchedule]);

  // Fallback active day item
  const activeDay = schedule[selectedDayIdx] || schedule[defaultIdx] || schedule[0] || {};
  const dayNum = activeDay.dayNumber || (selectedDayIdx + 1);

  const nl = config?.newsletter || {};

  const edition = language === "mr" 
    ? (nl.edition || `दैनिक डिजिटल उत्सव बुलेटिन • दिवस ${dayNum}`)
    : (nl.editionEn || nl.edition || `Daily Festival Bulletin • Day ${dayNum}`);

  const dateStr = language === "mr" 
    ? (activeDay.dateStr || nl.dateStr || "आज") 
    : (activeDay.dateStrEn || activeDay.dateStr || nl.dateStr || "Today");

  const headline = language === "mr" 
    ? (nl.headline || activeDay.tithi || "दैनिक महापूजा व महाआरती")
    : (nl.headlineEn || nl.headline || activeDay.tithiEn || activeDay.tithi || "Daily Mahapooja & Maha Aarti");

  const summary = language === "mr" 
    ? (nl.subheadline || activeDay.morningRitual || nl.specialNote || "सर्व ४ विंग्समधील रहिवाशांचे श्री गणेशोत्सवात हार्दिक स्वागत!")
    : (nl.subheadlineEn || nl.subheadline || activeDay.morningRitualEn || activeDay.morningRitual || "Warm welcome to all residents across all 4 society buildings!");

  const hostWing = language === "mr" 
    ? (activeDay.hostWing || nl.todaysHostWing || "सर्व ४ विंग्ज (G, H, J, K)")
    : (activeDay.hostWingEn || activeDay.hostWing || nl.todaysHostWing || "All 4 Wings (G, H, J, K)");

  const hostLead = language === "mr"
    ? (activeDay.hostLead || nl.hostLead || "")
    : (activeDay.hostLeadEn || activeDay.hostLead || nl.hostLead || "");

  const morningTime = language === "mr" 
    ? (activeDay.morningTime || "सकाळी ०८:३०") 
    : (activeDay.morningTimeEn || activeDay.morningTime || "08:30 AM");

  const morningRitual = language === "mr" 
    ? (activeDay.morningRitual || activeDay.ritual || "प्रातःकालीन महापूजा") 
    : (activeDay.morningRitualEn || activeDay.morningRitual || activeDay.ritual || "Morning Pooja");

  const eveningTime = language === "mr" 
    ? (activeDay.eveningTime || nl.eveningAartiTime || "रात्री ०८:००") 
    : (activeDay.eveningTimeEn || activeDay.eveningTime || nl.eveningAartiTime || "08:00 PM");

  const eveningRitual = language === "mr" 
    ? (activeDay.eveningRitual || activeDay.cultural || "संध्याकाळची धूपारती") 
    : (activeDay.eveningRitualEn || activeDay.eveningRitual || activeDay.cultural || "Evening Dhupaarti");

  const specialPrasad = language === "mr" 
    ? (activeDay.specialPrasad || nl.prasadSpecial || "") 
    : (activeDay.specialPrasadEn || activeDay.specialPrasad || nl.prasadSpecial || "");

  const cultural = language === "mr" 
    ? (activeDay.cultural || "") 
    : (activeDay.culturalEn || activeDay.cultural || "");

  const safetyTip = language === "mr" 
    ? (nl.safetyTip || "संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे. दर्शन रांगेत शिस्त बाळगावी.") 
    : (nl.safetyTipEn || nl.safetyTip || "24x7 CCTV Monitored. Please maintain discipline in darshan queue.");

  const handleShareWhatsApp = () => {
    const formatted = formatNewsletterBroadcast(nl, config, activeDay);
    openWhatsApp(formatted);
  };

  const handleCopyBulletin = async () => {
    const formatted = formatNewsletterBroadcast(nl, config, activeDay);
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="newsletter" className="w-full bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white py-4 sm:py-5 px-3 sm:px-6 border-y-2 border-gold-400 shadow-xl relative overflow-hidden">
      {/* Subtle festive background illumination */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-festive-saffron/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-4">
        
        {/* Row 1: Header Badge, Edition, Date & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-500/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-950 bg-gradient-to-r from-gold-400 to-amber-400 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-maroon-950" />
              <span>{language === "mr" ? "दैनिक डिजिटल वृत्तपत्र" : "Daily Digital Bulletin"}</span>
            </span>

            <span className="text-xs sm:text-sm font-extrabold text-gold-200">
              {edition}
            </span>

            <span className="text-xs text-gold-300/80 font-medium">
              • {dateStr}
            </span>

            {activeDay.isCurrentDay && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {language === "mr" ? "आजचा दिवस (Today)" : "Today's Day"}
              </span>
            )}
          </div>

          {/* WhatsApp Share & Copy Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleCopyBulletin}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-maroon-850 hover:bg-maroon-800 border border-gold-500/40 text-gold-200 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
              title="वृत्तपत्र मजकूर कॉपी करा"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{language === "mr" ? "कॉपी झाले!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gold-300" />
                  <span>{language === "mr" ? "कॉपी" : "Copy"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              title="व्हॉट्सॲपवर शेअर करा"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === "mr" ? "व्हॉट्सॲप शेअर" : "Share on WhatsApp"}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Main Headline & Subheadline */}
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-gold-200 font-heading leading-snug flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-festive-saffron flex-shrink-0" />
            <span>{headline}</span>
          </h2>
          {summary && (
            <p className="text-xs sm:text-sm text-gold-100/90 mt-1 font-medium leading-relaxed pl-6">
              {summary}
            </p>
          )}
        </div>

        {/* Row 3: 4 Highlights Cards (Aarti, Host Wing, Prasad, Program) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          
          {/* Card 1: Today's Aarti Times */}
          <div className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between shadow-sm hover:border-gold-400 transition">
            <div className="flex items-center gap-1.5 text-gold-300 font-bold mb-1.5">
              <Flame className="w-4 h-4 text-orange-400 animate-diya" />
              <span className="uppercase tracking-wide text-[11px] font-extrabold">{t("aartiTitle")}</span>
            </div>
            <div className="space-y-1 text-gold-100/90">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-gold-300 font-semibold">{t("morningAarti")}:</span>
                <span className="font-bold text-white whitespace-nowrap">{morningTime}</span>
              </div>
              <div className="text-[11px] text-gold-200/70 truncate" title={morningRitual}>
                {morningRitual}
              </div>
              <div className="flex items-baseline justify-between gap-1 pt-1 border-t border-gold-500/20">
                <span className="text-gold-300 font-semibold">{t("eveningAarti")}:</span>
                <span className="font-bold text-white whitespace-nowrap">{eveningTime}</span>
              </div>
              <div className="text-[11px] text-gold-200/70 truncate" title={eveningRitual}>
                {eveningRitual}
              </div>
            </div>
          </div>

          {/* Card 2: Today's Host Wing */}
          <div className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between shadow-sm hover:border-gold-400 transition">
            <div className="flex items-center gap-1.5 text-gold-300 font-bold mb-1.5">
              <Building className="w-4 h-4 text-gold-400" />
              <span className="uppercase tracking-wide text-[11px] font-extrabold">{t("hostWing")}</span>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-white text-xs sm:text-sm text-gold-100">
                {hostWing}
              </div>
              {hostLead ? (
                <div className="flex items-center gap-1 text-[11px] text-amber-200/90 pt-1 border-t border-gold-500/20">
                  <UserCheck className="w-3 h-3 text-gold-400 flex-shrink-0" />
                  <span className="truncate" title={hostLead}>{hostLead}</span>
                </div>
              ) : (
                <div className="text-[11px] text-gold-300/60 pt-1 border-t border-gold-500/20">
                  {language === "mr" ? "सहकार्य • शिस्त • अखंड भक्ती" : "Cooperation • Discipline • Devotion"}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Special Prasad */}
          <div className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between shadow-sm hover:border-gold-400 transition">
            <div className="flex items-center gap-1.5 text-gold-300 font-bold mb-1.5">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span className="uppercase tracking-wide text-[11px] font-extrabold">
                {language === "mr" ? "विशेष महाप्रसाद" : "Special Mahaprasad"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-white text-xs text-gold-100 line-clamp-2">
                {specialPrasad || (language === "mr" ? "नैवेद्य, मोदक व पेढे प्रसाद वितरण" : "Naivedya, Modak & Pedhe Prasad")}
              </div>
              <div className="text-[11px] text-emerald-300/90 pt-1 border-t border-gold-500/20">
                {language === "mr" ? "आरतीनंतर मुख्य मंडपात वाटप" : "Distributed in main pandal after Aarti"}
              </div>
            </div>
          </div>

          {/* Card 4: Cultural / Daily Event */}
          <div className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between shadow-sm hover:border-gold-400 transition">
            <div className="flex items-center gap-1.5 text-gold-300 font-bold mb-1.5">
              <Music className="w-4 h-4 text-festive-saffron" />
              <span className="uppercase tracking-wide text-[11px] font-extrabold">
                {language === "mr" ? "आजचे विशेष आकर्षण" : "Today's Attraction"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-white text-xs text-gold-100 line-clamp-2">
                {cultural || (language === "mr" ? (activeDay.tithi || "भजन संध्या व भाविक दर्शन") : (activeDay.tithiEn || activeDay.tithi || "Bhajan Sandhya & Devotee Darshan"))}
              </div>
              <div className="text-[11px] text-gold-300/70 pt-1 border-t border-gold-500/20">
                {language === "mr" ? "मध्यवर्ती उत्सव मंडप, म्हाडा टॉवर्स" : "Central Festive Pandal, MHADA Towers"}
              </div>
            </div>
          </div>

        </div>

        {/* Row 4: 10-Day Quick Day Pill Selector & Safety Notice */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs border-t border-gold-500/20">
          
          {/* Day Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-gold-300 whitespace-nowrap mr-1">
              {language === "mr" ? "दिवस निवडा:" : "Select Day:"}
            </span>
            {schedule.map((item, idx) => {
              const isSelected = idx === selectedDayIdx;
              const isCurrent = item.isCurrentDay;
              const dNum = item.dayNumber || (idx + 1);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-gold-400 text-maroon-950 border-gold-300 shadow-md font-black"
                      : "bg-maroon-950/70 text-gold-200 hover:bg-maroon-850 border-gold-500/30"
                  }`}
                  title={`${item.dateStr || `दिवस ${dNum}`} - ${item.tithi || ""}`}
                >
                  <span>{t("day")} {dNum}</span>
                  {isCurrent && (
                    <span className={`ml-1 text-[9px] px-1 py-0.2 rounded-full font-black ${
                      isSelected ? "bg-red-600 text-white" : "bg-red-600 text-white"
                    }`}>
                      {language === "mr" ? "आज" : "Today"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Safety Tip Pill */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{safetyTip}</span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DailyNewsletter;
