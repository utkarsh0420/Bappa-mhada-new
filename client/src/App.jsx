import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfigProvider, useConfig } from "./context/ConfigContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginModal from "./components/AdminLoginModal";
import Sidebar from "./components/Sidebar";
import AIBappaChatbot from "./components/AIBappaChatbot";
import UpcomingEventsCalendarModal from "./components/UpcomingEventsCalendarModal";
import { 
  ResidentPollsModal, 
  VolunteerSevaModal, 
  WingInfoModal, 
  FestivalGalleryModal 
} from "./components/InteractiveModals";

const MainApp = () => {
  const { admin } = useAuth();
  const { config, loading } = useConfig();
  const { language } = useLanguage();

  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Upcoming & Yearly Events Calendar Modal State
  const [isUpcomingCalendarOpen, setIsUpcomingCalendarOpen] = useState(false);
  const [upcomingCalendarTab, setUpcomingCalendarTab] = useState("festival");

  // Sidebar & Interactive Feature Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [isWingsOpen, setIsWingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleOpenUpcomingCalendar = (tab = "festival") => {
    setUpcomingCalendarTab(tab);
    setIsUpcomingCalendarOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center text-maroon-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gold-300 border-t-maroon-800 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-maroon-850">
            ॐ
          </div>
        </div>
        <p className="mt-4 font-heading font-bold text-sm tracking-wide">
          {language === "mr" 
            ? "म्हाडा टॉवर्स उत्सव मंडळ माहिती केंद्र लोड होत आहे..." 
            : "Loading MHADA Towers Festival Portal..."}
        </p>
      </div>
    );
  }

  // If Admin opened dashboard view
  if (isAdminDashboardOpen && admin) {
    return (
      <AdminDashboard
        onClose={() => setIsAdminDashboardOpen(false)}
      />
    );
  }

  const handleSidebarAction = (itemId, targetSection) => {
    if (itemId === "schedule") {
      handleOpenUpcomingCalendar("10days");
      return;
    }
    if (itemId === "upcoming") {
      handleOpenUpcomingCalendar("festival");
      return;
    }
    if (itemId === "polls") {
      setIsPollsOpen(true);
      return;
    }
    if (itemId === "volunteer") {
      setIsVolunteerOpen(true);
      return;
    }
    if (itemId === "wings") {
      setIsWingsOpen(true);
      return;
    }
    if (itemId === "gallery") {
      setIsGalleryOpen(true);
      return;
    }
    if (itemId === "adminLogin") {
      if (admin) setIsAdminDashboardOpen(true);
      else setIsAdminLoginModalOpen(true);
      return;
    }

    // Smooth scroll to target section
    let elementId = null;
    if (targetSection === "top") elementId = "top-section";
    else if (targetSection === "marquee") elementId = "marquee-section";
    else if (targetSection === "announcements") elementId = "marquee-section";
    else if (targetSection === "events") elementId = "events-section";
    else if (targetSection === "aarti") elementId = "aarti-section";
    else if (targetSection === "schedule") elementId = "schedule-section";
    else if (targetSection === "upcoming") elementId = "upcoming-section";
    else if (targetSection === "gallery") elementId = "gallery-section";
    else if (targetSection === "contacts") elementId = "contacts-section";
    else if (targetSection === "mandal-info") elementId = "mandal-info-section";

    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (targetSection === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] relative">
      
      {/* Off-canvas Festive Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectAction={handleSidebarAction}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Top Header with Logo, Navigation Links, Society Email, Language Switcher, and Admin Access */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenUpcomingCalendar={handleOpenUpcomingCalendar}
      />

      {/* Main Public Festival Portal */}
      <main className="flex-1">
        <Home
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenUpcomingCalendar={handleOpenUpcomingCalendar}
        />
      </main>

      {/* Official Footer with 4 Building Names & Society Email */}
      <Footer
        onOpenAdminLogin={() => {
          if (admin) setIsAdminDashboardOpen(true);
          else setIsAdminLoginModalOpen(true);
        }}
      />

      {/* + ADDED: AI BAPPA CHATBOT FLOATING WIDGET (Image 2 Requirement) */}
      <AIBappaChatbot />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoginModalOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Upcoming & Yearly Events Calendar Structured Pop-Up Modal */}
      <UpcomingEventsCalendarModal
        isOpen={isUpcomingCalendarOpen}
        onClose={() => setIsUpcomingCalendarOpen(false)}
        defaultTab={upcomingCalendarTab}
      />

      {/* Interactive Feature Modals */}
      <ResidentPollsModal
        isOpen={isPollsOpen}
        onClose={() => setIsPollsOpen(false)}
      />

      <VolunteerSevaModal
        isOpen={isVolunteerOpen}
        onClose={() => setIsVolunteerOpen(false)}
      />

      <WingInfoModal
        isOpen={isWingsOpen}
        onClose={() => setIsWingsOpen(false)}
      />

      <FestivalGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;
