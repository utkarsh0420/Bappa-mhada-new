import React, { useState, useEffect } from "react";
import { 
  Flame, Save, Calendar, Clock, Building2, 
  Sparkles, Check, CheckCircle2, Star, Globe, Info, Share2
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveButton, 
  FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatAartiScheduleBroadcast, formatSingleAartiDay, openWhatsApp } from "../../utils/whatsappFormatter";

const QUICK_WINGS_MR = [
  "G WING - नंदादेवी (Nandadevi)",
  "H WING - निलगिरी (Nilgiri)",
  "J WING - पूर्वांचल (Purvanchal)",
  "K WING - गोवर्धन (Govardhan)",
  "सर्व ४ इमारती संयुक्त (G • H • J • K)"
];

const QUICK_WINGS_EN = [
  "G Wing - Nandadevi",
  "H Wing - Nilgiri",
  "J Wing - Purvanchal",
  "K Wing - Govardhan",
  "All 4 Buildings Joint (G • H • J • K)"
];

const AartiScheduleManager = ({ config, onSaveAartiSchedule, onNotify }) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const isEn = language === "en";

  const [schedule, setSchedule] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config?.dailyAartiSchedule?.length) {
      setSchedule(JSON.parse(JSON.stringify(config.dailyAartiSchedule)));
    }
  }, [config]);

  const handleFieldChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSetCurrentDay = (index) => {
    const updated = schedule.map((item, idx) => ({
      ...item,
      isCurrentDay: idx === index
    }));
    setSchedule(updated);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const res = await onSaveAartiSchedule(schedule);
    setIsSaving(false);
    if (res?.success) {
      onNotify(
        isEn 
          ? "10-Day Aarti and Host Wings schedule saved successfully!" 
          : "दैनिक आरती व यजमान इमारत वेळापत्रक यशस्वीरीत्या जतन केले!",
        "success"
      );
    } else {
      onNotify(
        res?.message || (isEn ? "Failed to save schedule" : "जतन करताना त्रुटी आली"),
        "error"
      );
    }
  };

  const currentQuickWings = isEn ? QUICK_WINGS_EN : QUICK_WINGS_MR;

  return (
    <FestiveCard
      title={
        isEn 
          ? "10-Day Daily Maha Aarti & Host Wings Manager" 
          : "दैनिक महाआरती व यजमान इमारत व्यवस्थापन (10-Day Aarti & Host Wings)"
      }
      subtitle={
        isEn
          ? "Manage daily host buildings (wings), morning & evening Aarti timings, sacred rituals, special prasad, and cultural highlights."
          : "प्रत्येक दिवशी कोणती इमारत (विंग) आरतीचे यजमानपद भूषवणार आहे आणि सकाळ-संध्याकाळच्या वेळा येथे संपादित करा."
      }
      icon={Flame}
      badge={isEn ? "10-Day Schedule" : "१० दिवस वेळापत्रक"}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const txt = formatAartiScheduleBroadcast(schedule, config);
              openWhatsApp(txt);
              if (onNotify) onNotify(isEn ? "Opening WhatsApp with 10-day schedule..." : "१० दिवसांचे आरती वेळापत्रक व्हॉट्सॲपवर पाठवण्यासाठी तयार!", "success");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            title="संपूर्ण १० दिवसांचे वेळापत्रक व्हॉट्सॲपवर पाठवा"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? "Share 10-Day Aarti" : "१० दिवस वेळापत्रक पाठवा"}</span>
          </button>

          <FestiveButton
            onClick={handleSave}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Schedule" : "वेळापत्रक जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      {/* Language Switcher & Edit Mode Indicator */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/70 border-2 border-gold-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-maroon-950 font-heading block">
              {isEn ? "Schedule Editing Language:" : "वेळापत्रक संपादन भाषा:"}
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              {isEn
                ? "Currently editing English schedule. Website displays this when visitors switch to English."
                : "सध्या मराठी वेळापत्रक संपादित करत आहात. इंग्रजीत संपादनासाठी 'English' निवडा."}
            </span>
          </div>
        </div>

        {/* Segmented language selector */}
        <div className="inline-flex items-center p-1 rounded-xl bg-gold-100/90 border border-gold-300 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setLanguage("mr")}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              !isEn 
                ? "bg-maroon-900 text-gold-200 shadow-xs" 
                : "text-maroon-950 hover:bg-gold-200/60"
            }`}
          >
            🚩 मराठी (Marathi)
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              isEn 
                ? "bg-maroon-900 text-gold-200 shadow-xs" 
                : "text-maroon-950 hover:bg-gold-200/60"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {schedule.map((item, idx) => {
          const isToday = Boolean(item.isCurrentDay);
          const dayDisplayTitle = isEn 
            ? (item.dateStrEn || item.dateStr || `Day ${item.dayNumber || idx + 1}`) 
            : (item.dateStr || `दिवस ${item.dayNumber || idx + 1}`);

          return (
            <div
              key={item.dayNumber || idx}
              className={`p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
                isToday
                  ? "bg-gradient-to-br from-amber-50/90 via-[#FFFDF9] to-amber-50/50 border-gold-500 shadow-md ring-2 ring-gold-400/30"
                  : "bg-white border-gold-300/70 hover:border-gold-400 shadow-xs"
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-850 text-gold-300 font-black flex items-center justify-center text-xs border border-gold-400 shadow-xs flex-shrink-0">
                    {item.dayNumber || idx + 1}
                  </span>
                  <span className="font-heading font-black text-sm sm:text-base text-maroon-950">
                    {dayDisplayTitle}
                  </span>

                  {isToday && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white border border-red-700 animate-pulse shadow-xs whitespace-nowrap flex-shrink-0">
                      <Star className="w-3 h-3 fill-white" />
                      <span>{isEn ? "Today's Active Day" : "आजचा सक्रिय दिवस"}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                  {/* Share this day on WhatsApp */}
                  <button
                    type="button"
                    onClick={() => {
                      const txt = formatSingleAartiDay(item, config);
                      openWhatsApp(txt);
                      if (onNotify) onNotify(isEn ? `Opening WhatsApp with Day ${item.dayNumber || idx + 1} Aarti...` : `दिवस ${item.dayNumber || idx + 1} आरती वेळ व्हॉट्सॲपवर पाठवण्यासाठी तयार!`, "success");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                    title={isEn ? "Share this day's aarti timings on WhatsApp" : "या दिवसाची आरती वेळ व्हॉट्सॲपवर पाठवा"}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isEn ? "Share Day" : "आरती वेळ पाठवा"}</span>
                  </button>

                  {/* Set as Today button */}
                  <button
                    type="button"
                    onClick={() => handleSetCurrentDay(idx)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                      isToday
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white border-amber-600 shadow-sm"
                        : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300 shadow-xs"
                    }`}
                  >
                    {isToday ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isEn ? "Today Selected" : "आजचा दिवस निवडला आहे"}</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isEn ? "Set as Today" : "आजचा दिवस बनवा (Set Today)"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                
                {/* 1. Date String */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Day & Date (English) *" : "दिवस व दिनांक (मराठी) *"}
                    icon={Calendar}
                    value={isEn ? (item.dateStrEn || "") : (item.dateStr || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "dateStrEn" : "dateStr", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Day 1 (Ganesh Chaturthi - 7 Sep)" 
                        : "उदा. दिवस १ (७ सप्टेंबर - श्री गणेश चतुर्थी)"
                    }
                    required
                  />
                  {/* Translation reference helper */}
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.dateStr || "(not set)"}` 
                        : `English: ${item.dateStrEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 2. Tithi */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Tithi & Festival Significance (English)" : "तिथी व उत्सव महत्व (मराठी)"}
                    icon={Sparkles}
                    value={isEn ? (item.tithiEn || "") : (item.tithi || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "tithiEn" : "tithi", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Bhadrapad Shukla Chaturthi (Murti Sthapana)" 
                        : "उदा. भाद्रपद शुक्ल चतुर्थी - श्रींची प्रतिष्ठापना"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.tithi || "(not set)"}` 
                        : `English: ${item.tithiEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 3. Host Wing */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                  <FestiveInput
                    label={isEn ? "Host Building / Wing (English) *" : "यजमान इमारत (मराठी) *"}
                    icon={Building2}
                    value={isEn ? (item.hostWingEn || "") : (item.hostWing || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "hostWingEn" : "hostWing", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. G Wing - Nandadevi" 
                        : "उदा. G WING - नंदादेवी"
                    }
                    required
                  />
                  {/* Quick Select Wings Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap flex-shrink-0">
                      {isEn ? "Quick Select:" : "त्वरित निवडा:"}
                    </span>
                    {currentQuickWings.slice(0, 4).map((w, wIdx) => {
                      const letter = ["G", "H", "J", "K"][wIdx];
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleFieldChange(idx, isEn ? "hostWingEn" : "hostWing", w)}
                          className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-gold-100 hover:bg-gold-200 active:bg-gold-300 text-maroon-900 border border-gold-300 shadow-2xs transition cursor-pointer min-w-[28px]"
                          title={w}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.hostWing || "(not set)"}` 
                        : `English: ${item.hostWingEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 4. Host Lead */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <FestiveInput
                    label={isEn ? "Wing Coordinator / Lead (English)" : "विंग समन्वयक / संपर्क (मराठी)"}
                    icon={Sparkles}
                    value={isEn ? (item.hostLeadEn || "") : (item.hostLead || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "hostLeadEn" : "hostLead", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Mr. Sachin Patil (Flat G-402)" 
                        : "उदा. श्री. सचिन पाटील (फ्लॅट G-402)"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.hostLead || "(not set)"}` 
                        : `English: ${item.hostLeadEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 5. Morning Time */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <FestiveInput
                    label={isEn ? "Morning Aarti Time (English)" : "प्रभात आरती वेळ (मराठी)"}
                    icon={Clock}
                    value={isEn ? (item.morningTimeEn || "") : (item.morningTime || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "morningTimeEn" : "morningTime", e.target.value)}
                    placeholder={isEn ? "e.g. 08:30 AM" : "उदा. सकाळी ०८:३० वाजता"}
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.morningTime || "(not set)"}` 
                        : `English: ${item.morningTimeEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 6. Evening Time */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <FestiveInput
                    label={isEn ? "Evening Maha Aarti Time (English)" : "सायं महाआरती वेळ (मराठी)"}
                    icon={Clock}
                    value={isEn ? (item.eveningTimeEn || "") : (item.eveningTime || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "eveningTimeEn" : "eveningTime", e.target.value)}
                    placeholder={isEn ? "e.g. 08:00 PM" : "उदा. रात्री ०८:०० वाजता"}
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.eveningTime || "(not set)"}` 
                        : `English: ${item.eveningTimeEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 7. Morning Ritual */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Morning Ritual / Pooja (English)" : "सकाळची पूजा / विधी (मराठी)"}
                    icon={Flame}
                    value={isEn ? (item.morningRitualEn || "") : (item.morningRitual || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "morningRitualEn" : "morningRitual", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Kakad aarti, sacred mantras & modak offering" 
                        : "उदा. काकड आरती, मंत्रपुष्पांजली व मोदक नैवेद्य"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.morningRitual || "(not set)"}` 
                        : `English: ${item.morningRitualEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 8. Evening Ritual */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Evening Maha Aarti Rituals (English)" : "संध्याकाळची महाआरती विधी (मराठी)"}
                    icon={Flame}
                    value={isEn ? (item.eveningRitualEn || "") : (item.eveningRitual || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "eveningRitualEn" : "eveningRitual", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Grand evening maha aarti, 101 lamps & devotional bhajans" 
                        : "उदा. भव्य धूपारती, मंत्रपुष्पांजली व सुकामेवा प्रसाद"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.eveningRitual || "(not set)"}` 
                        : `English: ${item.eveningRitualEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 9. Special Prasad */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Special Mahaprasad (English)" : "विशेष महाप्रसाद (मराठी)"}
                    icon={Sparkles}
                    value={isEn ? (item.specialPrasadEn || "") : (item.specialPrasad || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "specialPrasadEn" : "specialPrasad", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. Fresh steamed modak & pedhe" 
                        : "उदा. उकडीचे मोदक, बुंदी लाडू व पंचामृत"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.specialPrasad || "(not set)"}` 
                        : `English: ${item.specialPrasadEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>

                {/* 10. Cultural / Extra Program */}
                <div className="sm:col-span-2">
                  <FestiveInput
                    label={isEn ? "Cultural Highlights / Programs (English)" : "विशेष सांस्कृतिक कार्यक्रम (मराठी)"}
                    icon={Sparkles}
                    value={isEn ? (item.culturalEn || "") : (item.cultural || "")}
                    onChange={(e) => handleFieldChange(idx, isEn ? "culturalEn" : "cultural", e.target.value)}
                    placeholder={
                      isEn 
                        ? "e.g. 8:30 PM Grand arrival procession & traditional lezim" 
                        : "उदा. रात्री ८:३० भजन संध्या / मुलांचे नृत्य"
                    }
                  />
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                    <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">
                      {isEn 
                        ? `Marathi: ${item.cultural || "(not set)"}` 
                        : `English: ${item.culturalEn || "(सेट नाही)"}`}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-gold-200/80 flex justify-end">
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
              : (isEn ? "Save Schedule (वेळापत्रक जतन करा)" : "वेळापत्रक जतन करा (Save Schedule)")
            }
          </FestiveButton>
        </div>
      </form>
    </FestiveCard>
  );
};

export default AartiScheduleManager;
