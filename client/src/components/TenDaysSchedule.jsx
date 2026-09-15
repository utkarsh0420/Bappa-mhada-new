import React, { useState } from "react";
import { 
  Calendar, Clock, Building, Sparkles 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

export const TEN_DAYS_DATA = [];

const TenDaysSchedule = () => {
  const { language, t } = useLanguage();
  const { config } = useConfig();

  // If schedule tab is disabled by admin, return null
  if (config?.tabs?.schedule && !config.tabs.schedule.enabled) {
    return null;
  }

  const schedule = config?.dailyAartiSchedule || [];
  const [selectedDayNum, setSelectedDayNum] = useState(() => {
    const cur = (config?.dailyAartiSchedule || []).find((d) => d.isCurrentDay);
    return cur ? (cur.dayNumber || cur.day || 1) : 1;
  });

  // Sync with current day when admin changes schedule in live sync
  React.useEffect(() => {
    if (schedule && schedule.length > 0) {
      const cur = schedule.find((d) => d.isCurrentDay);
      if (cur) {
        setSelectedDayNum(cur.dayNumber || cur.day || 1);
      }
    }
  }, [config?.dailyAartiSchedule]);

  if (schedule.length === 0) {
    return null;
  }

  const activeItem = schedule.find((d) => (d.dayNumber || d.day) === selectedDayNum) || schedule[0];
  const day = activeItem.dayNumber || activeItem.day || 1;
  const dateText = language === "mr" ? (activeItem.dateStr || activeItem.date) : (activeItem.dateStrEn || activeItem.dateStr || activeItem.date);
  const tithiText = language === "mr" ? activeItem.tithi : (activeItem.tithiEn || activeItem.tithi || "दैनिक महापूजा व आरती");
  const hostWingText = language === "mr" ? activeItem.hostWing : (activeItem.hostWingEn || activeItem.hostWing);
  const hostLeadText = language === "mr" ? activeItem.hostLead : (activeItem.hostLeadEn || activeItem.hostLead);
  const morningTime = language === "mr" ? activeItem.morningTime : (activeItem.morningTimeEn || activeItem.morningTime);
  const eveningTime = language === "mr" ? activeItem.eveningTime : (activeItem.eveningTimeEn || activeItem.eveningTime);
  const ritualText = language === "mr" ? (activeItem.ritual || activeItem.morningRitual) : (activeItem.ritualEn || activeItem.morningRitualEn || activeItem.ritual || activeItem.morningRitual);
  const culturalText = language === "mr" ? (activeItem.cultural || activeItem.eveningRitual) : (activeItem.culturalEn || activeItem.eveningRitualEn || activeItem.cultural || activeItem.eveningRitual);

  return (
    <section id="schedule" className="scroll-mt-20 my-8">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <Calendar className="w-4 h-4 text-maroon-800" />
              <span>{t("scheduleTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "१० दिवसांचे तारीखनिहाय वेळापत्रक" : "10-Day Date-Wise Festival Schedule"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {t("scheduleSubtitle")}
            </p>
          </div>
        </div>

        {/* Horizontal 10 Days Tab Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          {schedule.map((item, idx) => {
            const currentDayNum = item.dayNumber || item.day || (idx + 1);
            const isSelected = currentDayNum === selectedDayNum;
            const dateStr = item.dateStr || item.date || "";
            return (
              <button
                key={currentDayNum}
                onClick={() => setSelectedDayNum(currentDayNum)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border text-center ${
                  isSelected
                    ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-md transform scale-105"
                    : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300 shadow-2xs"
                }`}
              >
                <span className="block text-[11px] opacity-80 uppercase tracking-wider">
                  {t("day")} {currentDayNum}
                </span>
                <span className="block font-extrabold whitespace-nowrap">
                  {dateStr.split(" ")[0] || (language === "mr" ? `दिवस ${currentDayNum}` : `Day ${currentDayNum}`)} {dateStr.split(" ")[1] || ""}
                </span>
                {item.isCurrentDay && (
                  <span className="inline-block mt-0.5 text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                    {language === "mr" ? "आज" : "Today"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Spotlight Card */}
        <div className="bg-white rounded-2xl border-2 border-gold-400 p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gold-200">
            <div>
              <span className="text-xs font-black text-amber-900 bg-gold-100 px-3 py-1 rounded-full border border-gold-300">
                {t("day")} {day} • {dateText}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-maroon-950 font-heading mt-2">
                {tithiText}
              </h3>
            </div>

            {/* Host Wing Badge */}
            {hostWingText && (
              <div className="flex items-center gap-2 bg-maroon-900 text-gold-200 px-3.5 py-2 rounded-xl border border-gold-400 shadow-sm flex-shrink-0">
                <Building className="w-4 h-4 text-gold-300" />
                <div className="text-xs">
                  <span className="text-[10px] text-gold-300/80 block uppercase">{t("hostWing")}</span>
                  <span className="font-bold">{hostWingText}</span>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Aarti Times Box */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-gold-300 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-maroon-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>{language === "mr" ? "महाआरती वेळा" : "Maha Aarti Timings"}</span>
              </h4>
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800 pt-1">
                <span>{t("morningAarti")}:</span>
                <span className="text-maroon-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                  {morningTime}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800">
                <span>{t("eveningAarti")}:</span>
                <span className="text-maroon-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                  {eveningTime}
                </span>
              </div>
            </div>

            {/* Wing Coordinator Box */}
            <div className="p-4 rounded-xl bg-gold-50/60 border border-gold-300 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-maroon-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("hostRepresentative")}</span>
              </h4>
              <p className="text-xs sm:text-sm font-bold text-maroon-950 pt-1">
                {hostLeadText || (language === "mr" ? "सोसायटी समिती" : "Society Committee")}
              </p>
              <p className="text-[11px] text-gray-600">
                {language === "mr" 
                  ? "आरती व्यवस्था व मोदक नैवेद्य व्यवस्थापन विंग प्रमुख सांभाळतील." 
                  : "Aarti arrangement and prasad coordination by Wing Lead."}
              </p>
            </div>

            {/* Rituals */}
            {ritualText && (
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {t("specialRitual")}
                </span>
                <p className="text-xs sm:text-sm font-medium text-gray-800 mt-2">
                  {ritualText}
                </p>
              </div>
            )}

            {/* Cultural Program */}
            {culturalText && (
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                  {t("culturalHighlights")}
                </span>
                <p className="text-xs sm:text-sm font-medium text-gray-800 mt-2">
                  {culturalText}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default TenDaysSchedule;
