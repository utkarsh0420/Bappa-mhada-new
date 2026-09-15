import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Sparkles, Send, X, Bot, 
  Flame, Calendar, Mail, Phone, Building, Heart, Utensils, Waves, ShieldCheck
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import API from "../services/api";

const AIBappaChatbot = () => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);
  const [liveContacts, setLiveContacts] = useState([]);

  const [messages, setMessages] = useState([
    {
      sender: "bappa",
      text: language === "mr" 
        ? "गणपती बाप्पा मोरया! 🙏 मी म्हाडा टॉवर्स गणेशोत्सवाचा AI सहाय्यक आहे. मी आपल्याला आरती वेळा, १० दिवसांचे वेळापत्रक, विंग यजमान, महाप्रसाद, विसर्जन, किंवा सोसायटी संपर्काबद्दल अचूक व थोडक्यात माहिती देऊ शकतो. विचारून पहा!"
        : "Ganpati Bappa Morya! 🙏 I am your MHADA Towers Ganesh Utsav AI Assistant. Ask me about Aarti timings, 10-day schedule, host wings, Mahaprasad, Visarjan, or society contacts!",
      time: language === "mr" ? "आत्ता" : "Now"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Update welcome message when language toggles if it's the only message
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === "bappa") {
        return [
          {
            sender: "bappa",
            text: language === "mr" 
              ? "गणपती बाप्पा मोरया! 🙏 मी म्हाडा टॉवर्स गणेशोत्सवाचा AI सहाय्यक आहे. मी आपल्याला आरती वेळा, १० दिवसांचे वेळापत्रक, विंग यजमान, महाप्रसाद, विसर्जन, किंवा सोसायटी संपर्काबद्दल अचूक व थोडक्यात माहिती देऊ शकतो. विचारून पहा!"
              : "Ganpati Bappa Morya! 🙏 I am your MHADA Towers Ganesh Utsav AI Assistant. Ask me about Aarti timings, 10-day schedule, host wings, Mahaprasad, Visarjan, or society contacts!",
            time: language === "mr" ? "आत्ता" : "Now"
          }
        ];
      }
      return prev;
    });
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Fetch latest live data for 100% valid, up-to-date responses
      API.get("/announcements").then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setLiveAnnouncements(res.data.data);
        }
      }).catch(() => {});

      API.get("/contacts").then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setLiveContacts(res.data.data);
        }
      }).catch(() => {});
    }
  }, [messages, isOpen]);

  // Lock body scroll on mobile while chat is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Helper to parse markdown bold (**text**) cleanly in messages
  const renderFormattedText = (text, isUser = false) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className={`font-extrabold ${isUser ? "text-gold-200" : "text-maroon-950"}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Dynamically resolve concise, valid AI responses based on live config and DB
  const getBappaResponse = (query) => {
    const q = query.toLowerCase().trim();
    const isMr = language === "mr";

    const schedule = config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || [];
    const currentDay = schedule.find((d) => d.isCurrentDay) || schedule[0] || {};
    const dNum = currentDay.dayNumber || 1;
    const helpline = config?.emergencyHelpline || config?.mandalInfo?.helpline || "+91 98220 11223";
    const email = config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com";
    const regNo = config?.regNo || "१२४३/२०२५ - पुणे";

    // 1. Aarti Timings & Schedule
    if (q.includes("आरती") || q.includes("aarti") || q.includes("time") || q.includes("वेळ") || q.includes("morning") || q.includes("evening") || q.includes("सकाळ") || q.includes("रात्र")) {
      const mTime = currentDay.morningTime || "सकाळी ०८:३०";
      const mRitual = currentDay.morningRitual || currentDay.ritual || "प्रातःकालीन महापूजा";
      const eTime = currentDay.eveningTime || "रात्री ०८:००";
      const eRitual = currentDay.eveningRitual || currentDay.cultural || "संध्याकाळची धूपारती";
      const host = currentDay.hostWing || "सर्व ४ विंग्ज (G, H, J, K)";

      if (language === "mr") {
        return `🪔 **दैनिक महाआरती वेळा (दिवस ${dNum}):**
• **सकाळची महाआरती:** ${mTime} (${mRitual})
• **संध्याकाळची महाआरती:** ${eTime} (${eRitual})
• **आजचे यजमान:** ${host}
• **ठिकाण:** मध्यवर्ती उत्सव मंडप, म्हाडा टॉवर्स

सर्व भाविकांनी कुटुंबासह वेळेवर उपस्थित राहावे!`;
      } else {
        return `🪔 **Daily Maha Aarti Timings (Day ${dNum}):**
• **Morning Aarti:** ${currentDay.morningTimeEn || mTime} (${currentDay.morningRitualEn || mRitual})
• **Evening Aarti:** ${currentDay.eveningTimeEn || eTime} (${currentDay.eveningRitualEn || eRitual})
• **Host Wing:** ${currentDay.hostWingEn || host}
• **Venue:** Central Festive Pandal, MHADA Towers`;
      }
    }

    // 2. Wings / Buildings / Host Wing
    if (q.includes("विंग") || q.includes("wing") || q.includes("इमारत") || q.includes("building") || q.includes("यजमान") || q.includes("host") || q.includes("lead")) {
      const host = currentDay.hostWing || "G WING - नंदादेवी";
      const lead = currentDay.hostLead ? `\n• **विंग प्रमुख:** ${currentDay.hostLead}` : "";

      if (language === "mr") {
        return `🏢 **म्हाडा टॉवर्स - ४ विंग्ज माहिती:**
• **आजचे यजमान:** **${host}**${lead}
• **सहभागी ४ इमारती:**
  - G विंग: नंदादेवी
  - H विंग: निलगिरी
  - J विंग: पूर्वांचल
  - K विंग: गोवर्धन

❤️ *'४ विंग्स, एकच परिवार - सहकार्य • शिस्त • अखंड भक्ती'*`;
      } else {
        return `🏢 **MHADA Towers - 4 Buildings:**
• **Today's Host:** **${currentDay.hostWingEn || host}**${currentDay.hostLeadEn ? ` (Lead: ${currentDay.hostLeadEn})` : lead}
• **All Buildings:** G (Nandadevi) • H (Nilgiri) • J (Purvanchal) • K (Govardhan)

❤️ *Motto: '4 Wings, One Family'*`;
      }
    }

    // 3. Prasad / Mahaprasad / Food
    if (q.includes("प्रसाद") || q.includes("prasad") || q.includes("भोजन") || q.includes("जेवण") || q.includes("food") || q.includes("feast") || q.includes("मोदक")) {
      const todayPrasad = currentDay.specialPrasad || "नैवेद्य, मोदक व पेढे प्रसाद";

      if (language === "mr") {
        return `🍬 **महाप्रसाद माहिती:**
• **आजचा दैनिक प्रसाद:** **${todayPrasad}** (आरतीनंतर मंडपात वाटप)
• **भव्य महाप्रसाद स्नेहभोजन:** ५ व्या दिवशी दुपारी १२:३० ते ०३:३०
• **भोजन मंडप:** J व K विंग समोरील प्रांगण
• **विंगनुसार वेळा:**
  - G विंग: १२:३० - ०१:१५ | H विंग: ०१:१५ - ०२:००
  - J विंग: ०२:०० - ०२:४५ | K विंग: ०२:४५ - ०३:३०`;
      } else {
        return `🍬 **Mahaprasad Information:**
• **Today's Prasad:** **${todayPrasad}** (Distributed after Aarti)
• **Grand Mahaprasad Feast:** Day 5 from 12:30 PM to 03:30 PM
• **Dining Pandal:** Ground in front of J & K Wings
• **Wing Timings:** G (12:30), H (01:15), J (02:00), K (02:45)`;
      }
    }

    // 4. Schedule / 10-Day timetable / Date
    if (q.includes("वेळापत्रक") || q.includes("schedule") || q.includes("तारीख") || q.includes("date") || q.includes("१० दिवस") || q.includes("10 day") || q.includes("कार्यक्रम") || q.includes("event")) {
      if (language === "mr") {
        return `📅 **आजचे वेळापत्रक (दिवस ${dNum} • ${currentDay.dateStr || "आज"}):**
• **विशेष सोहळा:** ${currentDay.tithi || "दैनिक महापूजा व आरती"}
• **विंग यजमान:** ${currentDay.hostWing || "सर्व ४ विंग्ज"}
• **सकाळ आरती:** ${currentDay.morningTime || "०८:३० AM"}
• **संध्याकाळ आरती:** ${currentDay.eveningTime || "०८:०० PM"}
${currentDay.specialPrasad ? `• **विशेष प्रसाद:** ${currentDay.specialPrasad}\n` : ""}${currentDay.cultural ? `• **सांस्कृतिक आकर्षण:** ${currentDay.cultural}\n` : ""}📌 संपूर्ण १० दिवसांचे वेळापत्रक मुख्य पानावर उपलब्ध आहे.`;
      } else {
        return `📅 **Today's Schedule (Day ${dNum} • ${currentDay.dateStrEn || currentDay.dateStr || "Today"}):**
• **Occasion:** ${currentDay.tithiEn || currentDay.tithi || "Daily Pooja & Aarti"}
• **Host Wing:** ${currentDay.hostWingEn || currentDay.hostWing || "All 4 Wings"}
• **Aarti Timings:** Morning ${currentDay.morningTime || "08:30 AM"} | Evening ${currentDay.eveningTime || "08:00 PM"}
${currentDay.specialPrasad ? `• **Special Prasad:** ${currentDay.specialPrasad}\n` : ""}${currentDay.cultural ? `• **Program:** ${currentDay.cultural}\n` : ""}📌 Complete 10-day timetable is available on the Home page.`;
      }
    }

    // 5. Visarjan / Immersion / Procession
    if (q.includes("विसर्जन") || q.includes("visarjan") || q.includes("मिरवणूक") || q.includes("procession") || q.includes("निरोप") || q.includes("immersion")) {
      if (language === "mr") {
        return `🌊 **विसर्जन सोहळा माहिती (अनंत चतुर्दशी):**
• **उत्तरपूजा व अखेरची आरती:** दुपारी ०२:३० वाजता (मुख्य मंडप)
• **भव्य मिरवणूक प्रस्थान:** दुपारी ०३:३० वाजता
• **मिरवणूक मार्ग:** मंडप ➔ इमारत G, H ➔ इमारत J, K ➔ मुख्य प्रवेशद्वार परिक्रमा
• **विसर्जन:** संध्याकाळी ०६:३० वाजता सोसायटी आवारातील पर्यावरणपूरक कृत्रिम हौदात`;
      } else {
        return `🌊 **Visarjan & Procession (Anant Chaturdashi):**
• **Final Aarti & Uttarpooja:** 02:30 PM at Central Pandal
• **Procession Starts:** 03:30 PM (Route: G, H ➔ J, K ➔ Main Gate)
• **Eco-Friendly Immersion:** 06:30 PM in the artificial water tank within society premises`;
      }
    }

    // 6. Email / Registration / Address / Office
    if (q.includes("ईमेल") || q.includes("email") || q.includes("mail") || q.includes("नोंदणी") || q.includes("reg") || q.includes("पत्ता") || q.includes("address") || q.includes("office") || q.includes("कार्यालय")) {
      if (language === "mr") {
        return `📧 **सोसायटी व मंडळ अधिकृत संपर्क:**
• **ईमेल:** **${email}**
• **नोंदणी क्र.:** **${regNo}**
• **पत्ता:** म्हाडा टॉवर्स, पिंपरी वाघेरे, पुणे - ४११०१७
• **कार्यालय वेळ:** सकाळी १०:०० ते रात्री ८:००`;
      } else {
        return `📧 **Official Mandal Details:**
• **Email:** **${email}**
• **Reg No.:** **${regNo}**
• **Address:** MHADA Towers, Pimpri Waghere, Pune - 411017
• **Office Hours:** 10:00 AM to 08:00 PM`;
      }
    }

    // 7. Contacts / Emergency / Helpline
    if (q.includes("फोन") || q.includes("phone") || q.includes("संपर्क") || q.includes("contact") || q.includes("मदत") || q.includes("help") || q.includes("helpline") || q.includes("security") || q.includes("सुरक्षा") || q.includes("अध्यक्ष") || q.includes("सचिव")) {
      const topContacts = liveContacts.slice(0, 2);
      const contactLines = topContacts.map(c => `• **${c.roleMr || c.type}:** ${c.nameMr} (${c.wing || ""})`).join("\n");

      if (language === "mr") {
        return `📞 **महत्वाचे संपर्क क्रमांक:**
• **२४x७ आपत्कालीन मदत कक्ष:** **${helpline}**
• **मुख्य सुरक्षा रक्षक कक्ष:** **${helpline}**
${contactLines ? `${contactLines}\n` : ""}कोणत्याही मदतीसाठी त्वरित संपर्क करा.`;
      } else {
        return `📞 **Important Contacts:**
• **24x7 Emergency Helpline:** **${helpline}**
• **Security Main Desk:** **${helpline}**
• **Email:** ${email}`;
      }
    }

    // 8. Rules / Guidelines / Parking
    if (q.includes("नियम") || q.includes("rule") || q.includes("पार्किंग") || q.includes("parking") || q.includes("शिस्त") || q.includes("सीसीटीव्ही") || q.includes("cctv")) {
      if (language === "mr") {
        return `🛡️ **मंडळ व सोसायटी ठळक नियमावली:**
• **पार्किंग:** वाहने केवळ स्वतःच्या नियुक्त पार्किंग जागेतच लावावीत.
• **सुरक्षा:** संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे.
• **ध्वनी प्रदूषण:** रात्री १०:०० नंतर लाऊडस्पीकर पूर्णपणे बंद राहतील.
• **कचरा:** ओला व सुका कचरा नियुक्त कचराकुंड्यांमध्येच टाकावा.`;
      } else {
        return `🛡️ **Society & Festival Guidelines:**
• **Parking:** Park only in designated resident parking slots.
• **Security:** Complex is monitored 24x7 via CCTV cameras.
• **Noise Level:** Loudspeakers strictly shut down by 10:00 PM.
• **Discipline:** Maintain cleanliness and queue discipline during darshan.`;
      }
    }

    // 9. Notices / Updates
    if (q.includes("सूचना") || q.includes("notice") || q.includes("अपडेट") || q.includes("update") || q.includes("घोषणा") || q.includes("announcement")) {
      const latest = liveAnnouncements[0];
      if (latest) {
        return language === "mr"
          ? `📢 **महत्त्वाचे ताजे अपडेट:**\n• **${latest.titleMr}:** ${latest.descriptionMr}\n\nसर्व रहिवाशांनी नोंद घ्यावी!`
          : `📢 **Latest Announcement:**\n• **${latest.titleEn || latest.titleMr}:** ${latest.descriptionEn || latest.descriptionMr}`;
      }
      return language === "mr"
        ? `📢 **ताजे अपडेट:**\n${config?.marqueeText || "सध्या उत्सव सुरळीत सुरू आहे. दैनंदिन आरती वेळेवर उपस्थित राहावे."}`
        : `📢 **Status:** Festival is running smoothly. Please attend daily aartis on time.`;
    }

    // 10. Blessings / Mantra
    if (q.includes("आशीर्वाद") || q.includes("blessing") || q.includes("श्लोक") || q.includes("shloka") || q.includes("मंत्र") || q.includes("मोरया") || q.includes("morya") || q.includes("bappa")) {
      return language === "mr"
        ? `🌸 **श्री गणरायांचे मंगल आशीर्वाद:**
॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।
निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥

गणपती बाप्पा आपल्या आणि आपल्या कुटुंबावर सुख, समृद्धी, उत्तम आरोग्य व अखंड आनंदाचा वर्षाव करोत!
🙏 **गणपती बाप्पा मोरया, मंगलमूर्ती मोरया!** 🌺`
        : `🌸 **Divine Blessings of Lord Ganesha:**
॥ Vakratunda Mahakaya Suryakoti Samaprabha ।
Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada ॥

May Lord Ganesha bless you and your loved ones with happiness, health, and prosperity!
🙏 **Ganpati Bappa Morya!** 🌺`;
    }

    // Fallback
    return language === "mr"
      ? `गणपती बाप्पा मोरया! 🙏 मी **${config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ"}** सहाय्यक आहे.
मी खालील विषयांवर नेमकी माहिती देऊ शकतो:
• 🪔 **आरती वेळ** (सकाळ/संध्याकाळ)
• 🏢 **विंग यजमान** (G, H, J, K)
• 📅 **वेळापत्रक** (आजचा कार्यक्रम)
• 🍬 **महाप्रसाद** (वाटप व भोजन)
• 🌊 **विसर्जन मार्ग** (अनंत चतुर्दशी)
• 📞 **तातडीचे संपर्क व मदत कक्ष**`
      : `Ganpati Bappa Morya! 🙏 I am your **MHADA Towers AI Assistant**.
Ask me about:
• 🪔 **Aarti Timings** (Morning & Evening)
• 🏢 **Host Wings** (G, H, J, K)
• 📅 **Schedule & Events**
• 🍬 **Mahaprasad Feast**
• 🌊 **Visarjan Timings**
• 📞 **Emergency Helpline**`;
  };

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBappaResponse(query);
      const bappaMsg = {
        sender: "bappa",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, bappaMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Diya Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white shadow-2xl hover:shadow-orange-500/50 border-2 border-gold-300 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
          title="AI बाप्पा सहाय्यकाशी बोला"
        >
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-300 text-[9px] font-black text-maroon-950 items-center justify-center">
              ॐ
            </span>
          </div>

          <Bot className="w-6 h-6 text-gold-200 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:inline-block ml-2 text-xs font-bold text-gold-100 pr-1">
            {language === "mr" ? "AI बाप्पा सहाय्यक" : "AI Bappa Help"}
          </span>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-20 sm:right-6 z-50 w-auto sm:w-96 max-w-lg bg-white rounded-3xl border-2 border-gold-400 shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-fadeIn">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white p-3.5 sm:p-4 border-b-2 border-gold-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-maroon-800 border border-gold-400 flex items-center justify-center text-gold-300 shadow-inner">
                <Flame className="w-5 h-5 text-orange-400 animate-diya" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gold-100 font-heading">
                  {language === "mr" ? "AI बाप्पा सहाय्यक" : "AI Bappa Assistant"}
                </h3>
                <p className="text-[11px] text-gold-300/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{language === "mr" ? "सक्रिय • २४x७ माहिती केंद्र" : "Online • 24x7 Helpdesk"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-gold-300 hover:text-white hover:bg-maroon-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions Scroller */}
          <div className="bg-gold-50/80 p-2 border-b border-gold-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(language === "mr" ? [
              { label: "🪔 आरती वेळा", text: "महाआरती वेळा काय आहेत?" },
              { label: "🏢 विंग यजमान", text: "इमारतींची नावे व यजमान विंग सांगा" },
              { label: "📅 आजचे वेळापत्रक", text: "आजचे वेळापत्रक काय आहे?" },
              { label: "🍬 महाप्रसाद", text: "महाप्रसादाची वेळ व माहिती काय आहे?" },
              { label: "🌊 विसर्जन सोहळा", text: "विसर्जन मिरवणूक कधी आहे?" },
              { label: "📞 मदत कक्ष", text: "मदत कक्ष संपर्क क्रमांक द्या" },
              { label: "📧 ईमेल व नोंदणी", text: "सोसायटीचा अधिकृत ईमेल व नोंदणी क्रमांक सांगा" },
              { label: "🌸 आशीर्वाद", text: "बाप्पांचे आशीर्वाद" }
            ] : [
              { label: "🪔 Aarti Timings", text: "What are the Maha Aarti timings?" },
              { label: "🏢 Host Wings", text: "Tell me about the 4 buildings and host wings" },
              { label: "📅 Today's Schedule", text: "What is today's schedule?" },
              { label: "🍬 Mahaprasad", text: "Tell me about Mahaprasad timings and feast" },
              { label: "🌊 Visarjan Details", text: "When is the Visarjan procession?" },
              { label: "📞 Helpdesk", text: "Give me emergency helpline and committee contacts" },
              { label: "📧 Email & Reg No", text: "What is the official society email and registration number?" },
              { label: "🌸 Divine Blessings", text: "Give me Bappa's divine blessings" }
            ]).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-gold-300 text-maroon-950 hover:bg-gold-200 transition shadow-2xs whitespace-nowrap"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FFFDF9]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-maroon-850 text-gold-100 rounded-br-none border border-gold-500/40 shadow-sm"
                      : "bg-white text-gray-800 rounded-bl-none border border-gold-300/80 shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">
                    {renderFormattedText(m.text, m.sender === "user")}
                  </p>
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 text-xs text-maroon-800 bg-gold-100/60 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-gold-300 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === "mr" ? "आरती, विंग्ज किंवा वेळापत्रक विचारा..." : "Ask about aarti, wings or schedule..."}
              className="flex-1 text-xs p-2.5 rounded-xl border border-gold-300 focus:border-maroon-800 outline-none bg-[#FFFDF9]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-maroon-850 hover:bg-maroon-700 disabled:opacity-50 text-gold-300 shadow transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default AIBappaChatbot;
