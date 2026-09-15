import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  mr: {
    // Navigation & Header
    home: "मुख्य पृष्ठ",
    aarti: "दैनिक महाआरती",
    schedule: "१० दिवसांचे वेळापत्रक",
    upcomingEvents: "आगामी कार्यक्रम",
    gallery: "छायाचित्रे",
    contacts: "संपर्क कक्ष",
    newsletter: "दैनिक वृत्तपत्र",
    adminLogin: "व्यवस्थापक लॉगिन",
    adminDashboard: "व्यवस्थापक डॅशबोर्ड",
    logout: "लॉगआउट",
    whatsappGroup: "व्हॉट्सॲप ग्रुप",
    liveStatus: "उत्सव सुरू आहे (Live)",
    regNo: "नोंदणी क्र",
    societyEmail: "सोसायटी ईमेल",

    // Wing Names
    allWings: "सर्व इमारती",
    wingG: "G - नंदादेवी (Nandadevi)",
    wingH: "H - निलगिरी (Nilgiri)",
    wingJ: "J - पूर्वांचल (Purvanchal)",
    wingK: "K - गोवर्धन (Govardhan)",
    wingsBanner: "सहभागी ४ इमारती: G (नंदादेवी) • H (निलगिरी) • J (पूर्वांचल) • K (गोवर्धन)",

    // Aarti & Countdown
    aartiTitle: "दैनिक महाआरती व यजमान",
    aartiSubtitle: "सकाळ व संध्याकाळ महाआरती वेळा आणि विंग यजमान",
    morningAarti: "सकाळची महाआरती",
    eveningAarti: "संध्याकाळची महाआरती",
    nextAartiCountdown: "पुढील महाआरतीसाठी शिल्लक वेळ",
    morningTime: "सकाळी ०८:३० वाजता",
    eveningTime: "रात्री ०८:०० वाजता",
    hours: "तास",
    minutes: "मिनिटे",
    seconds: "सेकंद",
    hostWing: "यजमान इमारत",
    hostRepresentative: "यजमान प्रमुख",
    shareTimings: "आरती वेळ व्हॉट्सॲपवर पाठवा",

    // 10-Day Schedule
    scheduleTitle: "१० दिवसांचे सविस्तर वेळापत्रक",
    scheduleSubtitle: "गणेश चतुर्थी ते अनंत चतुर्दशी दैनिक तारीखनिहाय कार्यक्रम व पूजा",
    day: "दिवस",
    date: "तारीख",
    specialRitual: "विशेष विधी व पूजा",
    culturalHighlights: "सांस्कृतिक कार्यक्रम",

    // Upcoming Events
    upcomingTitle: "आगामी व वार्षिक कार्यक्रम",
    upcomingSubtitle: "गणेशोत्सवातील विविध स्पर्धा आणि मंडळाचे वर्षभरातील उपक्रम",
    festivalEventsTab: "उत्सव स्पर्धा व कार्यक्रम",
    yearlyEventsTab: "मंडळाचे वार्षिक उपक्रम",

    // Photo Gallery
    galleryTitle: "मागील उत्सवांची छायाचित्रे",
    gallerySubtitle: "म्हाडा टॉवर्स गणेशोत्सवातील भक्तीमय व अविस्मरणीय क्षणचित्रे",
    allPhotos: "सर्व फोटो",
    close: "बंद करा",

    // Helplines & Society Email
    helplineTitle: "कार्यकारिणी, आपत्कालीन संपर्क व ईमेल",
    helplineSubtitle: "४ विंग्स समन्वयक, पदाधिकारी व २४x७ मदत कक्ष",
    officialEmail: "सोसायटी अधिकृत ईमेल",
    emailUs: "ईमेल पाठवा",
    copied: "कॉपी केले!",
    copyEmail: "ईमेल कॉपी करा",
    callNow: "कॉल करा",

    // AI Bappa Chatbot
    bappaAssistant: "AI बाप्पा सहाय्यक",
    bappaOnline: "सदा सेवेत तत्पर • आशीर्वाद",
    askBappa: "बाप्पांना कोणताही प्रश्न विचारा...",
    send: "पाठवा",
    bappaWelcome: "नमस्कार! मी म्हाडा टॉवर्स गणेशोत्सवाचा डिजिटल सहाय्यक आहे. मी आपल्याला आरतीच्या वेळा, १० दिवसांचे वेळापत्रक, विंग यजमान, संपर्क किंवा बाप्पांचे आशीर्वाद याबद्दल माहिती देऊ शकतो!",
    quickPrompts: [
      "🪔 आजची महाआरती वेळ काय?",
      "🏢 आजचा विंग यजमान कोण?",
      "📅 १० दिवसांचे वेळापत्रक दाखवा",
      "📧 सोसायटी अधिकृत ईमेल काय?",
      "📞 तातडीचा मदत संपर्क?",
      "🌸 बाप्पांचे आशीर्वाद व श्लोक"
    ]
  },
  en: {
    // Navigation & Header
    home: "Home",
    aarti: "Daily Maha Aarti",
    schedule: "10-Day Schedule",
    upcomingEvents: "Upcoming Events",
    gallery: "Photo Gallery",
    contacts: "Contact Desk",
    newsletter: "Daily Bulletin",
    adminLogin: "Admin Login",
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    whatsappGroup: "WhatsApp Community",
    liveStatus: "Festival Live",
    regNo: "Regd No",
    societyEmail: "Society Email",

    // Wing Names
    allWings: "All Buildings",
    wingG: "G - Nandadevi",
    wingH: "H - Nilgiri",
    wingJ: "J - Purvanchal",
    wingK: "K - Govardhan",
    wingsBanner: "4 Participating Buildings: G (Nandadevi) • H (Nilgiri) • J (Purvanchal) • K (Govardhan)",

    // Aarti & Countdown
    aartiTitle: "Daily Maha Aarti & Host Wings",
    aartiSubtitle: "Morning & Evening Aarti Timings with Building Hosts",
    morningAarti: "Morning Maha Aarti",
    eveningAarti: "Evening Maha Aarti",
    nextAartiCountdown: "Time Remaining Until Next Aarti",
    morningTime: "08:30 AM",
    eveningTime: "08:00 PM",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs",
    hostWing: "Host Building",
    hostRepresentative: "Host Coordinator",
    shareTimings: "Share Timings on WhatsApp",

    // 10-Day Schedule
    scheduleTitle: "10-Day Date-Wise Schedule",
    scheduleSubtitle: "Daily events and rituals from Ganesh Chaturthi to Anant Chaturdashi",
    day: "Day",
    date: "Date",
    specialRitual: "Rituals & Pooja",
    culturalHighlights: "Cultural Programs",

    // Upcoming Events
    upcomingTitle: "Upcoming & Yearly Events",
    upcomingSubtitle: "Festival cultural competitions and year-round Mandal initiatives",
    festivalEventsTab: "Festival Competitions",
    yearlyEventsTab: "Yearly Mandal Calendar",

    // Photo Gallery
    galleryTitle: "Past Event Photos",
    gallerySubtitle: "Memorable & divine moments from MHADA Towers Ganesh Utsav celebrations",
    allPhotos: "All Photos",
    close: "Close",

    // Helplines & Society Email
    helplineTitle: "Committee, Emergency Contacts & Email",
    helplineSubtitle: "4 Wings coordinators, office bearers and 24x7 helpdesk",
    officialEmail: "Official Society Email",
    emailUs: "Send Email",
    copied: "Copied!",
    copyEmail: "Copy Email",
    callNow: "Call Now",

    // AI Bappa Chatbot
    bappaAssistant: "AI Bappa Assistant",
    bappaOnline: "Always at your service • Divine Blessings",
    askBappa: "Ask Bappa anything about the festival...",
    send: "Send",
    bappaWelcome: "Namaskar! I am your MHADA Towers Ganesh Festival AI Assistant. I can help you with Aarti timings, 10-day schedule, host wings, contacts, or divine blessings!",
    quickPrompts: [
      "🪔 What is today's Aarti time?",
      "🏢 Which wing is today's host?",
      "📅 Show 10-Day Schedule",
      "📧 What is the Society Email?",
      "📞 Emergency Helpline numbers?",
      "🌸 Bappa's Blessings & Shlokas"
    ]
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("mhada_language") || "mr";
  });

  useEffect(() => {
    localStorage.setItem("mhada_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "mr" ? "en" : "mr"));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.mr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
