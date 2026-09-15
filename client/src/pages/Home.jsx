import React, { useState, useEffect } from "react";
import { 
  Sparkles, Flame, Clock, Calendar, MapPin, Building, QrCode, 
  Share2, ShieldCheck, Heart, AlertCircle, PhoneCall
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";
import API from "../services/api";
import { subscribeLiveSync } from "../utils/liveSync";

import MarqueeTicker from "../components/MarqueeTicker";
import DailyNewsletter from "../components/DailyNewsletter";
import EventScroller from "../components/EventScroller";
import AartiCard from "../components/AartiCard";
import TenDaysSchedule from "../components/TenDaysSchedule";
import MahaprasadCard from "../components/MahaprasadCard";
import VisarjanCard from "../components/VisarjanCard";
import UpcomingEvents from "../components/UpcomingEvents";
import PhotoGallery from "../components/PhotoGallery";
import MandalRules from "../components/MandalRules";
import EmergencyContacts from "../components/EmergencyContacts";
import AboutMandal from "../components/AboutMandal";

const Home = ({ onOpenSidebar, onOpenUpcomingCalendar }) => {
  const { config, refreshConfig } = useConfig();
  const { language, t } = useLanguage();

  const [selectedWing, setSelectedWing] = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
    fetchContacts();

    // Live Cross-Component / Cross-Tab Sync Subscription
    const unsubscribe = subscribeLiveSync(({ entity }) => {
      if (entity === "events" || entity === "all") fetchEvents();
      if (entity === "announcements" || entity === "all") fetchAnnouncements();
      if (entity === "contacts" || entity === "all") fetchContacts();
      if (entity === "config" || entity === "all") {
        if (typeof refreshConfig === "function") refreshConfig();
      }
    });

    // Background periodic poll every 15s so changes made by other admins reflect immediately
    const pollInterval = setInterval(() => {
      fetchEvents();
      fetchAnnouncements();
      fetchContacts();
    }, 15000);

    // Refresh instantly when user tabs back to this window
    const handleFocus = () => {
      fetchEvents();
      fetchAnnouncements();
      fetchContacts();
      if (typeof refreshConfig === "function") refreshConfig();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedWing, activeCategory]);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (activeCategory !== "all") params.category = activeCategory;
      const res = await API.get("/events", { params });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error("Events fetch error:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcements", {
        params: { wing: selectedWing }
      });
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error("Announcements fetch error:", err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await API.get("/contacts");
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error("Contacts fetch error:", err);
    }
  };

  const latestPinned = announcements.find((a) => a.isPinned) || announcements[0];

  return (
    <div id="top-section" className="w-full">
      
      {/* 1. Breaking Marquee Scroller */}
      {config?.tabs?.announcements?.enabled !== false && (
        <div id="marquee-section" className="scroll-mt-16">
          <MarqueeTicker
            latestAnnouncement={latestPinned}
            onSelectAnnouncement={(ann) => setSelectedAnnouncement(ann)}
            onOpenSidebar={onOpenSidebar}
          />
        </div>
      )}



      {/* 2. DAILY DIGITAL NEWSLETTER BANNER */}
      {config?.tabs?.newsletter?.enabled !== false && (
        <DailyNewsletter />
      )}

      {/* 4. Event Scroller */}
      {config?.tabs?.cultural?.enabled !== false && (
        <div id="events-section" className="scroll-mt-16">
          <EventScroller
            events={events}
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
          />
        </div>
      )}

      {/* 5. Main Content Sections */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* RANK #1 FEATURED: 10-DAY FESTIVAL SCHEDULE & EVENT BLUEPRINT */}
        {config?.tabs?.schedule?.enabled !== false && (
          <TenDaysSchedule />
        )}

        {/* DAILY MAHA AARTI & LIVE COUNTDOWN */}
        {config?.tabs?.aarti?.enabled !== false && (
          <AartiCard />
        )}

        {/* MAHAPRASAD CARD (If prasad tab is enabled) */}
        {config?.tabs?.prasad?.enabled && (
          <div id="prasad-section" className="scroll-mt-16">
            <MahaprasadCard />
          </div>
        )}

        {/* VISARJAN TIMINGS & PROCESSION CARD (If visarjan tab is enabled) */}
        {config?.tabs?.visarjan?.enabled && (
          <div id="visarjan-section" className="scroll-mt-16">
            <VisarjanCard />
          </div>
        )}

        {/* UPCOMING & YEARLY EVENTS */}
        {(config?.tabs?.cultural?.enabled !== false || config?.tabs?.upcoming?.enabled !== false) && (
          <UpcomingEvents 
            onOpenUpcomingCalendar={onOpenUpcomingCalendar} 
          />
        )}

        {/* PAST EVENT PHOTOS GALLERY */}
        {config?.tabs?.gallery?.enabled !== false && (
          <PhotoGallery />
        )}

        {/* SOCIETY RULES */}
        {config?.tabs?.rules?.enabled !== false && (
          <div id="rules-section">
            <MandalRules />
          </div>
        )}

        {/* EMERGENCY CONTACTS & SOCIETY EMAIL */}
        {config?.tabs?.contacts?.enabled !== false && (
          <EmergencyContacts contacts={contacts} />
        )}

        {/* MANDAL INFO, COMMITTEE & PILLARS */}
        {config?.tabs?.mandalInfo?.enabled !== false && (
          <AboutMandal />
        )}

      </div>

      {/* Announcement Detail Modal if clicked */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <span className="text-xs font-black text-maroon-800 bg-gold-100 px-2.5 py-0.5 rounded-full">
                {selectedAnnouncement.category}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading mb-2">
              {selectedAnnouncement.titleMr}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-5">
              {selectedAnnouncement.descriptionMr}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-maroon-850 hover:bg-maroon-800 text-gold-200 rounded-xl text-xs font-bold transition"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
