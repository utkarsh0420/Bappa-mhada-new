import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, 
  ChevronRight, Building, Table, Plus, Edit, Trash2, Camera, Eye, X, Sparkles 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { subscribeLiveSync } from "../utils/liveSync";

export const UPCOMING_FESTIVAL_EVENTS = [];
export const YEARLY_EVENTS = [];

const UpcomingEvents = ({ onOpenUpcomingCalendar }) => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState("festival"); // "festival" or "yearly"
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // If upcoming/cultural tab is disabled by admin, return null
  const isEnabled = config?.tabs?.cultural?.enabled !== false && config?.tabs?.upcoming?.enabled !== false;
  if (!isEnabled) {
    return null;
  }

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events", {
        params: { eventType: activeTab }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEventsList(res.data.data);
      } else {
        setEventsList([]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEventsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const unsub = subscribeLiveSync(({ entity }) => {
      if (entity === "events" || entity === "all") {
        fetchEvents();
      }
    });
    return () => unsub();
  }, [activeTab]);

  const handleDeleteCardEvent = async (id, title) => {
    const confirmMsg = language === "mr" 
      ? `तुम्हाला '${title || "हा कार्यक्रम"}' नक्की हटवायचा आहे का?` 
      : `Are you sure you want to delete '${title || "this event"}'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data?.success) {
        fetchEvents();
      }
    } catch (err) {
      alert(language === "mr" ? "कार्यक्रम हटवताना त्रुटी आली" : "Failed to delete event");
    }
  };

  return (
    <section id="upcoming" className="scroll-mt-20 my-8">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <Calendar className="w-4 h-4 text-maroon-800" />
              <span>{t("upcomingTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "आगामी व वार्षिक कार्यक्रम पत्रिका" : "Upcoming & Yearly Events Calendar"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {t("upcomingSubtitle")}
            </p>
          </div>

          {/* Action and Tab Switcher Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {admin && onOpenUpcomingCalendar && (
              <button
                onClick={() => onOpenUpcomingCalendar(activeTab)}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs transition active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                title="कॅलेंडरमध्ये नवीन कार्यक्रम जोडा किंवा व्यवस्थापित करा"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "mr" ? "+ नवीन कार्यक्रम जोडा" : "+ Add Event"}</span>
              </button>
            )}

            {onOpenUpcomingCalendar && (
              <button
                onClick={() => onOpenUpcomingCalendar(activeTab)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-900 via-maroon-850 to-amber-950 text-gold-200 hover:text-white border border-gold-400/80 shadow-sm font-bold text-xs transition active:scale-95 whitespace-nowrap cursor-pointer"
                title="टेबल स्वरूपात संपूर्ण कॅलेंडर पॉप-अप उघडा"
              >
                <Table className="w-3.5 h-3.5 text-gold-400" />
                <span>{language === "mr" ? "टेबल पॉप-अप उघडा" : "Open Table Pop-up"}</span>
              </button>
            )}

            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-maroon-950 p-1.5 rounded-2xl border border-gold-500/40 w-full sm:w-auto text-center">
              <button
                onClick={() => setActiveTab("festival")}
                className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center justify-center ${
                  activeTab === "festival"
                    ? "bg-gold-400 text-maroon-950 shadow-md font-black"
                    : "text-gold-200 hover:text-white"
                }`}
              >
                {t("festivalEventsTab")}
              </button>
              <button
                onClick={() => setActiveTab("yearly")}
                className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center justify-center ${
                  activeTab === "yearly"
                    ? "bg-gold-400 text-maroon-950 shadow-md font-black"
                    : "text-gold-200 hover:text-white"
                }`}
              >
                {t("yearlyEventsTab")}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8 text-maroon-800 text-sm font-semibold">
            {language === "mr" ? "कार्यक्रम लोड होत आहेत..." : "Loading events..."}
          </div>
        )}

        {/* Empty state */}
        {!loading && eventsList.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm font-semibold">
            {language === "mr" ? "सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत." : "No events scheduled currently."}
          </div>
        )}

        {/* Events Grid */}
        {!loading && eventsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {eventsList.map((ev) => (
              <div
                key={ev._id || ev.id}
                className="bg-white rounded-2xl border-2 border-gold-300 p-5 shadow-sm hover:border-gold-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Event Flyer / Photo Banner if present */}
                  {ev.imageUrl && (
                    <div 
                      onClick={() => setLightboxImg(ev.imageUrl)}
                      className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden cursor-pointer group border border-gold-300 shadow-2xs mb-3 bg-stone-100"
                      title={language === "mr" ? "फोटो मोठा पहा" : "View photo"}
                    >
                      <img src={ev.imageUrl} alt={ev.titleMr} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                        <Eye className="w-4 h-4" />
                        <span>{language === "mr" ? "फोटो पहा" : "View Photo"}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black uppercase text-maroon-900 bg-gold-100 px-2.5 py-0.5 rounded-md border border-gold-300">
                        {language === "mr" ? (ev.categoryMr || ev.category) : (ev.categoryEn || ev.category)}
                      </span>
                      {ev.status === "live" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          {language === "mr" ? "सुरू आहे" : "LIVE"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === "mr" ? (ev.dateStr || ev.dateMr || ev.time) : (ev.dateStrEn || ev.dateEn || ev.time)}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-maroon-950 font-heading mb-2">
                    {language === "mr" ? ev.titleMr : (ev.titleEn || ev.titleMr)}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">
                    {language === "mr" ? (ev.descriptionMr || ev.descMr) : (ev.descriptionEn || ev.descEn || ev.descriptionMr)}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span>{language === "mr" ? (ev.venueMr || ev.venue) : (ev.venueEn || ev.venue || ev.venueMr)}</span>
                    </span>
                    {(ev.hostWing || ev.targetWing) && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-maroon-700 flex-shrink-0" />
                        <span>{language === "mr" ? (ev.hostWing || ev.targetWing) : (ev.hostWingEn || ev.hostWing || ev.targetWing)}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gold-100 flex items-center justify-between gap-2 flex-wrap">
                  {admin && (
                    <div className="flex items-center gap-1.5">
                      {onOpenUpcomingCalendar && (
                        <button
                          onClick={() => onOpenUpcomingCalendar(activeTab)}
                          className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition active:scale-95 cursor-pointer shadow-2xs"
                          title={language === "mr" ? "कार्यक्रम संपादन करा" : "Edit Event"}
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-800" />
                          <span>{language === "mr" ? "संपादन" : "Edit"}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCardEvent(ev._id || ev.id, ev.titleMr)}
                        className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition active:scale-95 cursor-pointer shadow-2xs"
                        title={language === "mr" ? "कार्यक्रम हटवा" : "Delete Event"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === "mr" ? "हटवा" : "Delete"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal for Photo Preview */}
        {lightboxImg && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
            onClick={() => setLightboxImg(null)}
          >
            <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 border-2 border-gold-400 shadow-2xl" onClick={e => e.stopPropagation()}>
              <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default UpcomingEvents;
