import React, { useState, useEffect } from "react";
import { 
  Flame, Clock, Building, Sparkles, 
  MapPin, CheckCircle2, Timer
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";

const AartiCard = () => {
  const { config } = useConfig();
  const { language, t } = useLanguage();

  // If aarti tab is disabled by admin, return null
  if (config?.tabs?.aarti && !config.tabs.aarti.enabled) {
    return null;
  }

  const schedule = config?.dailyAartiSchedule || [];
  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const initIdx = (config?.dailyAartiSchedule || []).findIndex((item) => item.isCurrentDay);
    return initIdx !== -1 ? initIdx : 0;
  });

  // Sync active day whenever schedule or isCurrentDay changes in admin config
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      const currentIdx = schedule.findIndex((item) => item.isCurrentDay);
      if (currentIdx !== -1) {
        setActiveDayIndex(currentIdx);
      }
    }
  }, [config?.dailyAartiSchedule]);

  // Daily Countdown Logic for Morning & Evening Aarti
  const [countdown, setCountdown] = useState({
    targetName: "संध्याकाळची महाआरती (Evening Aarti)",
    hours: "00",
    minutes: "00",
    seconds: "00",
    targetTime: "रात्री ०८:०० वाजता (08:00 PM)"
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      
      // Target times: Morning 08:30 AM, Evening 08:00 PM (20:00)
      const morningTarget = new Date();
      morningTarget.setHours(8, 30, 0, 0);

      const eveningTarget = new Date();
      eveningTarget.setHours(20, 0, 0, 0);

      let targetDate;
      let nextAartiName;
      let nextAartiTime;

      if (now < morningTarget) {
        targetDate = morningTarget;
        nextAartiName = language === "mr" ? "सकाळची महाआरती" : "Morning Maha Aarti";
        nextAartiTime = language === "mr" ? "सकाळी ०८:३० वाजता" : "08:30 AM";
      } else if (now < eveningTarget) {
        targetDate = eveningTarget;
        nextAartiName = language === "mr" ? "संध्याकाळची महाआरती" : "Evening Maha Aarti";
        nextAartiTime = language === "mr" ? "रात्री ०८:०० वाजता" : "08:00 PM";
      } else {
        // Next day morning aarti
        const tomorrowMorning = new Date();
        tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
        tomorrowMorning.setHours(8, 30, 0, 0);
        targetDate = tomorrowMorning;
        nextAartiName = language === "mr" ? "उद्याची सकाळची आरती" : "Tomorrow's Morning Aarti";
        nextAartiTime = language === "mr" ? "सकाळी ०८:३० वाजता" : "08:30 AM";
      }

      const diffMs = targetDate - now;
      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setCountdown({
          targetName: nextAartiName,
          targetTime: nextAartiTime,
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0")
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [language]);

  if (schedule.length === 0) {
    return null;
  }

  const activeDay = schedule[activeDayIndex] || schedule[0];

  return (
    <section id="aarti" className="scroll-mt-20 my-6">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400/80 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <Flame className="w-4 h-4 text-orange-600 animate-diya" />
              <span>{t("aartiTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "दैनिक महाआरती व विंग यजमान" : "Daily Maha Aarti & Host Wings"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {language === "mr" 
                ? "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती" 
                : "Every day at 08:30 AM and 08:00 PM at Central Festive Pandal"}
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
                  <span>{t("nextAartiCountdown")}</span>
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
              {language === "mr" ? "दिवस निवडा (१० दिवस वेळापत्रक):" : "Select Day (10 Days):"}
            </span>
            <span className="text-xs font-bold text-maroon-700">
              {activeDay.dateStr}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {schedule.map((item, idx) => {
              const isSelected = idx === activeDayIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                    isSelected
                      ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-sm transform scale-105"
                      : "bg-white text-maroon-950 hover:bg-gold-100 border-gold-300"
                  }`}
                >
                  <span className="whitespace-nowrap">{t("day")} {item.dayNumber}</span>
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

        {/* 3. SIMPLIFIED TWO-COLUMN AARTI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Morning Aarti Card */}
          <div className="bg-white rounded-2xl border-2 border-gold-300 p-4 sm:p-5 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{t("morningAarti")}</span>
                </span>
                <div className="flex items-center gap-1 text-xs font-black text-maroon-900 bg-gold-100 px-2.5 py-1 rounded-lg border border-gold-300">
                  <Clock className="w-3.5 h-3.5 text-maroon-800" />
                  <span>{language === "mr" ? activeDay.morningTime : (activeDay.morningTimeEn || activeDay.morningTime)}</span>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-maroon-950 font-heading mb-1.5">
                {language === "mr" ? activeDay.morningRitual : (activeDay.morningRitualEn || activeDay.morningRitual)}
              </h4>

              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                  <span>
                    <strong>{t("hostWing")}:</strong> {language === "mr" ? activeDay.hostWing : (activeDay.hostWingEn || activeDay.hostWing)}
                  </span>
                </p>
                {activeDay.hostLead && (
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>{t("hostRepresentative")}:</strong> {language === "mr" ? activeDay.hostLead : (activeDay.hostLeadEn || activeDay.hostLead)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {activeDay.specialPrasad && (
              <div className="mt-4 pt-3 border-t border-gold-200/60 flex items-center justify-between text-xs text-maroon-900 font-semibold bg-gold-50/60 p-2.5 rounded-xl">
                <span>{language === "mr" ? "नैवेद्य / प्रसाद:" : "Offering / Prasad:"}</span>
                <span className="font-bold text-maroon-950">
                  {language === "mr" ? activeDay.specialPrasad : (activeDay.specialPrasadEn || activeDay.specialPrasad)}
                </span>
              </div>
            )}
          </div>

          {/* Evening Aarti Card */}
          <div className="bg-white rounded-2xl border-2 border-gold-300 p-4 sm:p-5 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-maroon-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                  <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                  <span>{t("eveningAarti")}</span>
                </span>
                <div className="flex items-center gap-1 text-xs font-black text-maroon-900 bg-gold-100 px-2.5 py-1 rounded-lg border border-gold-300">
                  <Clock className="w-3.5 h-3.5 text-maroon-800" />
                  <span>{language === "mr" ? activeDay.eveningTime : (activeDay.eveningTimeEn || activeDay.eveningTime)}</span>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-maroon-950 font-heading mb-1.5">
                {language === "mr" ? activeDay.eveningRitual : (activeDay.eveningRitualEn || activeDay.eveningRitual)}
              </h4>

              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                  <span>
                    <strong>{t("hostWing")}:</strong> {language === "mr" ? activeDay.hostWing : (activeDay.hostWingEn || activeDay.hostWing)}
                  </span>
                </p>
                {activeDay.hostLead && (
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>{t("hostRepresentative")}:</strong> {language === "mr" ? activeDay.hostLead : (activeDay.hostLeadEn || activeDay.hostLead)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {activeDay.specialPrasad && (
              <div className="mt-4 pt-3 border-t border-gold-200/60 flex items-center justify-between text-xs text-maroon-900 font-semibold bg-gold-50/60 p-2.5 rounded-xl">
                <span>{language === "mr" ? "नैवेद्य / प्रसाद:" : "Offering / Prasad:"}</span>
                <span className="font-bold text-maroon-950">
                  {language === "mr" ? activeDay.specialPrasad : (activeDay.specialPrasadEn || activeDay.specialPrasad)}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default AartiCard;
