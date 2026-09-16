import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, Clock, Building, Sparkles, Timer
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";

// Helper to parse any 12h/24h/Marathi time string into 24-hour HH:mm
const parseTimeTo24h = (str) => {
  if (!str) return "08:30";
  const trimmed = str.trim();
  const m24 = trimmed.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (m24) return `${m24[1].padStart(2, "0")}:${m24[2]}`;

  const isPM = /pm|रात्री|संध्या|सायं/i.test(trimmed);
  const isAM = /am|सकाळी|प्रभात/i.test(trimmed);

  const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  let cleanStr = trimmed;
  marathiDigits.forEach((d, i) => {
    cleanStr = cleanStr.replaceAll(d, String(i));
  });

  const timeMatch = cleanStr.match(/(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  return "08:30";
};

// Normalize day item to always have a clean events array
const normalizeDayEvents = (day, dayIndex) => {
  if (Array.isArray(day.events) && day.events.length > 0) {
    return day.events.filter((e) => e && e.active !== false);
  }

  // Backwards-compatible synthesis for legacy records
  const syntheticEvents = [];
  const morningTimeEn = day.morningTimeEn || "08:30 AM";
  const morningTimeMr = day.morningTime || "सकाळी ०८:३० वाजता";
  syntheticEvents.push({
    id: `legacy_m_${day.dayNumber || dayIndex + 1}`,
    type: "morning",
    categoryMr: "सकाळची महाआरती",
    categoryEn: "Morning Maha Aarti",
    titleMr: day.morningRitual || "मूर्ती प्राणप्रतिष्ठा पूजा व महाआरती",
    titleEn: day.morningRitualEn || day.morningRitual || "Morning Maha Aarti",
    time: morningTimeMr,
    timeEn: morningTimeEn,
    startTime: parseTimeTo24h(morningTimeEn || morningTimeMr),
    endTime: "09:30",
    hostWing: day.hostWing || "सर्व इमारती संयुक्त",
    hostWingEn: day.hostWingEn || day.hostWing || "All Buildings Joint",
    hostCoordinator: day.hostLead || "",
    hostCoordinatorEn: day.hostLeadEn || day.hostLead || "",
    prasad: day.specialPrasad || "",
    prasadEn: day.specialPrasadEn || day.specialPrasad || "",
    active: true
  });

  const eveningTimeEn = day.eveningTimeEn || "08:00 PM";
  const eveningTimeMr = day.eveningTime || "रात्री ०८:०० वाजता";
  syntheticEvents.push({
    id: `legacy_e_${day.dayNumber || dayIndex + 1}`,
    type: "evening",
    categoryMr: "संध्याकाळची महाआरती",
    categoryEn: "Evening Maha Aarti",
    titleMr: day.eveningRitual || "धूपारती, अथर्वशीर्ष व महाआरती",
    titleEn: day.eveningRitualEn || day.eveningRitual || "Evening Maha Aarti",
    time: eveningTimeMr,
    timeEn: eveningTimeEn,
    startTime: parseTimeTo24h(eveningTimeEn || eveningTimeMr),
    endTime: "21:00",
    hostWing: day.hostWing || "सर्व इमारती संयुक्त",
    hostWingEn: day.hostWingEn || day.hostWing || "All Buildings Joint",
    hostCoordinator: day.hostLead || "",
    hostCoordinatorEn: day.hostLeadEn || day.hostLead || "",
    prasad: day.specialPrasad || "",
    prasadEn: day.specialPrasadEn || day.specialPrasad || "",
    active: true
  });

  return syntheticEvents;
};

const AartiCard = () => {
  const { config } = useConfig();
  const { language, t } = useLanguage();

  // 1. MASTER ON/OFF SWITCH CHECK
  // If either tabs.aarti or dailyAartiSection is disabled by admin, return null
  const isEnabled = 
    config?.tabs?.aarti?.enabled !== false && 
    config?.dailyAartiSection?.enabled !== false;

  const rawSchedule = config?.dailyAartiSchedule || [];

  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const initIdx = (config?.dailyAartiSchedule || []).findIndex((item) => item.isCurrentDay);
    return initIdx !== -1 ? initIdx : 0;
  });

  // Sync active day whenever isCurrentDay or schedule changes in admin config
  useEffect(() => {
    if (rawSchedule && rawSchedule.length > 0) {
      const currentIdx = rawSchedule.findIndex((item) => item.isCurrentDay);
      if (currentIdx !== -1) {
        setActiveDayIndex(currentIdx);
      } else if (activeDayIndex >= rawSchedule.length) {
        setActiveDayIndex(0);
      }
    }
  }, [rawSchedule]);

  // Dynamic Countdown State
  const [countdown, setCountdown] = useState({
    targetName: language === "mr" ? "संध्याकाळची महाआरती" : "Evening Maha Aarti",
    targetTime: language === "mr" ? "रात्री ०८:०० वाजता" : "08:00 PM",
    hours: "00",
    minutes: "00",
    seconds: "00",
    isOngoing: false,
    allCompleted: false
  });

  // Calculate dynamic countdown in Indian Standard Time (IST)
  useEffect(() => {
    if (!isEnabled || rawSchedule.length === 0) {
      return;
    }

    const calculateCountdown = () => {
      const now = new Date();
      const currentDayIdx = rawSchedule.findIndex((d) => d.isCurrentDay);
      const baseTodayIdx = currentDayIdx !== -1 ? currentDayIdx : 0;

      // Build flat list of all events with concrete Date timestamps
      const eventOccurrences = [];

      rawSchedule.forEach((dayItem, dayIdx) => {
        const events = normalizeDayEvents(dayItem, dayIdx);
        
        // Resolve calendar date for this day
        let dayDateObj;
        if (dayItem.date && /^\d{4}-\d{2}-\d{2}$/.test(dayItem.date)) {
          const [y, m, d] = dayItem.date.split("-").map(Number);
          dayDateObj = new Date(y, m - 1, d);
        } else {
          // Relative to today based on index difference
          const dayDiff = dayIdx - baseTodayIdx;
          dayDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayDiff);
        }

        const year = dayDateObj.getFullYear();
        const month = dayDateObj.getMonth();
        const dateNum = dayDateObj.getDate();

        events.forEach((evt) => {
          const start24 = parseTimeTo24h(evt.startTime || evt.timeEn || evt.time || "08:30");
          const end24 = parseTimeTo24h(evt.endTime || "09:30");

          const [sH, sM] = start24.split(":").map(Number);
          const [eH, eM] = end24.split(":").map(Number);

          const startDate = new Date(year, month, dateNum, sH, sM, 0, 0);
          let endDate = new Date(year, month, dateNum, eH, eM, 0, 0);
          if (endDate <= startDate) {
            // If end time is earlier or same as start time, assume next day or 1 hour duration
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          }

          eventOccurrences.push({
            event: evt,
            day: dayItem,
            startDate,
            endDate
          });
        });
      });

      // Filter upcoming vs ongoing
      const upcoming = eventOccurrences
        .filter((occ) => occ.startDate.getTime() > now.getTime())
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      const ongoing = eventOccurrences.find(
        (occ) => occ.startDate.getTime() <= now.getTime() && occ.endDate.getTime() >= now.getTime()
      );

      if (upcoming.length > 0) {
        const nextOcc = upcoming[0];
        const diffMs = nextOcc.startDate.getTime() - now.getTime();

        const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const nextName = language === "mr" 
          ? (nextOcc.event.categoryMr || nextOcc.event.titleMr || "महाआरती")
          : (nextOcc.event.categoryEn || nextOcc.event.titleEn || "Maha Aarti");

        const nextTime = language === "mr" 
          ? (nextOcc.event.time || nextOcc.event.timeEn || "०८:०० PM")
          : (nextOcc.event.timeEn || nextOcc.event.time || "08:00 PM");

        setCountdown({
          targetName: nextName,
          targetTime: nextTime,
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
          isOngoing: false,
          allCompleted: false
        });
      } else if (ongoing) {
        const ongoingName = language === "mr" 
          ? `${ongoing.event.categoryMr || ongoing.event.titleMr || "महाआरती"} (सुरू आहे)`
          : `${ongoing.event.categoryEn || ongoing.event.titleEn || "Maha Aarti"} (Live Now)`;

        const ongoingTime = language === "mr" 
          ? (ongoing.event.time || ongoing.event.timeEn || "")
          : (ongoing.event.timeEn || ongoing.event.time || "");

        setCountdown({
          targetName: ongoingName,
          targetTime: ongoingTime,
          hours: "00",
          minutes: "00",
          seconds: "00",
          isOngoing: true,
          allCompleted: false
        });
      } else {
        // All scheduled events completed gracefully
        setCountdown({
          targetName: language === "mr" ? "सर्व आरत्या संपन्न" : "All Aartis Completed",
          targetTime: language === "mr" ? "दर्शन सुरू आहे" : "Darshan Live",
          hours: "00",
          minutes: "00",
          seconds: "00",
          isOngoing: false,
          allCompleted: true
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isEnabled, rawSchedule, language]);

  // If section is disabled or schedule is empty, render nothing
  if (!isEnabled || rawSchedule.length === 0) {
    return null;
  }

  const activeDay = rawSchedule[activeDayIndex] || rawSchedule[0];
  const activeDayEvents = normalizeDayEvents(activeDay, activeDayIndex);

  // Editable Section Header Texts (with default fallbacks)
  const sectionConfig = config?.dailyAartiSection || {};
  const sectionBadge = language === "mr" 
    ? (sectionConfig.badgeMr || t("aartiTitle")) 
    : (sectionConfig.badgeEn || t("aartiTitle"));

  const sectionTitle = language === "mr"
    ? (sectionConfig.titleMr || "दैनिक महाआरती व विंग यजमान")
    : (sectionConfig.titleEn || "Daily Maha Aarti & Host Wings");

  const sectionSubtitle = language === "mr"
    ? (sectionConfig.subtitleMr || "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती")
    : (sectionConfig.subtitleEn || "Every day at 08:30 AM and 08:00 PM at Central Festive Pandal");

  const countdownLabel = language === "mr"
    ? (sectionConfig.countdownLabelMr || t("nextAartiCountdown"))
    : (sectionConfig.countdownLabelEn || t("nextAartiCountdown"));

  // Dynamic Day selector label
  const dayCount = rawSchedule.length;
  const daySelectorLabel = language === "mr"
    ? `दिवस निवडा (${dayCount} दिवस वेळापत्रक):`
    : `SELECT DAY (${dayCount} ${dayCount === 1 ? "DAY" : "DAYS"}):`;

  const activeDayDisplayDate = language === "mr" 
    ? (activeDay.dateStr || activeDay.dateStrEn || "") 
    : (activeDay.dateStrEn || activeDay.dateStr || "");

  return (
    <section id="aarti" className="scroll-mt-20 my-6">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400/80 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <Flame className="w-4 h-4 text-orange-600 animate-diya" />
              <span>{sectionBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {sectionSubtitle}
            </p>
          </div>
        </div>

        {/* 1. DAILY COUNTDOWN TICKER FOR NEXT AARTI */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white border-2 border-gold-400/90 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-maroon-800/90 border border-gold-400 flex items-center justify-center shadow-inner flex-shrink-0">
                <Flame className="w-6 h-6 text-gold-300 animate-diya" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gold-300 bg-maroon-800 px-2 py-0.5 rounded-full border border-gold-500/30">
                  <Timer className="w-3 h-3" />
                  <span>{countdownLabel}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gold-100 mt-0.5">
                  {countdown.targetName} • <span className="text-gold-300">{countdown.targetTime}</span>
                </h3>
              </div>
            </div>

            {/* Countdown Digits Clock */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center bg-maroon-800/90 border border-gold-400/70 rounded-xl px-3 py-1.5 min-w-[58px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-gold-300 tracking-wider">
                  {countdown.hours}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gold-200/80 font-bold">
                  {t("hours")}
                </span>
              </div>

              <span className="text-gold-400 font-bold text-xl animate-pulse">:</span>

              <div className="flex flex-col items-center bg-maroon-800/90 border border-gold-400/70 rounded-xl px-3 py-1.5 min-w-[58px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-gold-300 tracking-wider">
                  {countdown.minutes}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gold-200/80 font-bold">
                  {t("minutes")}
                </span>
              </div>

              <span className="text-gold-400 font-bold text-xl animate-pulse">:</span>

              <div className="flex flex-col items-center bg-maroon-800/90 border border-gold-400/70 rounded-xl px-3 py-1.5 min-w-[58px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-gold-300 tracking-wider">
                  {countdown.seconds}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gold-200/80 font-bold">
                  {t("seconds")}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. DAY-WISE SELECTOR PILLS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-maroon-900 uppercase tracking-wide">
              {daySelectorLabel}
            </span>
            <span className="text-xs font-bold text-maroon-700">
              {activeDayDisplayDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {rawSchedule.map((item, idx) => {
              const isSelected = idx === activeDayIndex;
              return (
                <button
                  key={item.id || item.dayNumber || idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-sm transform scale-105"
                      : "bg-white text-maroon-950 hover:bg-gold-100 border-gold-300"
                  }`}
                >
                  <span className="whitespace-nowrap">{t("day")} {item.dayNumber || idx + 1}</span>
                  {item.isCurrentDay && (
                    <span className="ml-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {language === "mr" ? "आज" : "Today"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DYNAMIC EVENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {activeDayEvents.map((event, eIdx) => {
            const isEvening = event.type === "evening" || /evening|सायं|संध्या/i.test(event.categoryEn || event.categoryMr || "");
            const badgeCategory = language === "mr" 
              ? (event.categoryMr || event.category || t("morningAarti")) 
              : (event.categoryEn || event.category || t("morningAarti"));
            
            const eventTime = language === "mr" 
              ? (event.time || event.timeEn || "") 
              : (event.timeEn || event.time || "");

            const eventTitle = language === "mr" 
              ? (event.titleMr || event.titleEn || "") 
              : (event.titleEn || event.titleMr || "");

            const hostBuilding = language === "mr" 
              ? (event.hostWing || event.hostWingEn || "") 
              : (event.hostWingEn || event.hostWing || "");

            const hostLead = language === "mr" 
              ? (event.hostCoordinator || event.hostCoordinatorEn || "") 
              : (event.hostCoordinatorEn || event.hostCoordinator || "");

            const prasadText = language === "mr" 
              ? (event.prasad || event.prasadEn || "") 
              : (event.prasadEn || event.prasad || "");

            const descriptionText = language === "mr"
              ? (event.descriptionMr || event.descriptionEn || "")
              : (event.descriptionEn || event.descriptionMr || "");

            return (
              <div 
                key={event.id || eIdx}
                className="bg-white rounded-2xl border-2 border-gold-300 p-4 sm:p-5 shadow-sm hover:border-gold-500 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isEvening ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-maroon-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                        <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                        <span>{badgeCategory}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        <span>{badgeCategory}</span>
                      </span>
                    )}

                    {eventTime && (
                      <div className="flex items-center gap-1 text-xs font-black text-maroon-900 bg-gold-100 px-2.5 py-1 rounded-lg border border-gold-300">
                        <Clock className="w-3.5 h-3.5 text-maroon-800" />
                        <span>{eventTime}</span>
                      </div>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-maroon-950 font-heading mb-1.5">
                    {eventTitle}
                  </h4>

                  {descriptionText && (
                    <p className="text-xs text-stone-600 mb-2">
                      {descriptionText}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                    {hostBuilding && (
                      <p className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                        <span>
                          <strong>{t("hostWing")}:</strong> {hostBuilding}
                        </span>
                      </p>
                    )}
                    {hostLead && (
                      <p className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>{t("hostRepresentative")}:</strong> {hostLead}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {prasadText && (
                  <div className="mt-4 pt-3 border-t border-gold-200/60 flex items-center justify-between text-xs text-maroon-900 font-semibold bg-gold-50/60 p-2.5 rounded-xl">
                    <span>{language === "mr" ? "नैवेद्य / प्रसाद:" : "Offering / Prasad:"}</span>
                    <span className="font-bold text-maroon-950">
                      {prasadText}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AartiCard;
