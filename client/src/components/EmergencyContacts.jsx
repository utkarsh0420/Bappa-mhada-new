import React, { useState } from "react";
import { 
  Phone, Shield, User, Building, Mail, 
  Copy, Check, ExternalLink 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

export const DEFAULT_CONTACTS = [
  {
    _id: "mem-1",
    nameMr: "सौ. प्रियांका मयूर देशपांडे",
    nameEn: "Mrs. Priyanka Mayur Deshpande",
    roleMr: "अध्यक्षा",
    roleEn: "President",
    wing: "जे – १५०३ (J-1503)",
    phone: "",
    type: "committee",
    order: 1
  },
  {
    _id: "mem-2",
    nameMr: "सौ. हर्षानी निकुंभ",
    nameEn: "Mrs. Harshani Nikumbh",
    roleMr: "उपाध्यक्षा",
    roleEn: "Vice President",
    wing: "के – १००१ (K-1001)",
    phone: "",
    type: "committee",
    order: 2
  },
  {
    _id: "mem-3",
    nameMr: "सौ. अर्चना सुधींद्र मठड",
    nameEn: "Mrs. Archana Sudhindra Mathad",
    roleMr: "सचिव",
    roleEn: "Secretary",
    wing: "जी – २२०४, जे – ५०३ (G-2204, J-503)",
    phone: "",
    type: "committee",
    order: 3
  },
  {
    _id: "mem-4",
    nameMr: "श्री. अनुराग माळी",
    nameEn: "Mr. Anurag Mali",
    roleMr: "खजिनदार",
    roleEn: "Treasurer",
    wing: "के – १५०३ (K-1503)",
    phone: "",
    type: "committee",
    order: 4
  },
  {
    _id: "mem-5",
    nameMr: "श्रीमती कल्पना अविनाश गाजरे",
    nameEn: "Mrs. Kalpana Avinash Gajare",
    roleMr: "सदस्या",
    roleEn: "Committee Member",
    wing: "के – १००२-१८०२ (K-1002-1802)",
    phone: "",
    type: "committee",
    order: 5
  },
  {
    _id: "mem-6",
    nameMr: "सौ. शीतल प्रफुल साठे",
    nameEn: "Mrs. Sheetal Praful Sathe",
    roleMr: "सदस्या",
    roleEn: "Committee Member",
    wing: "जी – ११०४ (G-1104)",
    phone: "",
    type: "committee",
    order: 6
  },
  {
    _id: "mem-7",
    nameMr: "सौ. कुंदा राजेंद्र सौंदणकर",
    nameEn: "Mrs. Kunda Rajendra Saundankar",
    roleMr: "सदस्या",
    roleEn: "Committee Member",
    wing: "एच – १०३ (H-103)",
    phone: "",
    type: "committee",
    order: 7
  },
  {
    _id: "mem-8",
    nameMr: "श्री. सतीश बालकु फडके",
    nameEn: "Mr. Satish Balku Phadke",
    roleMr: "सदस्य",
    roleEn: "Committee Member",
    wing: "के – १५०१ (K-1501)",
    phone: "",
    type: "committee",
    order: 8
  },
  {
    _id: "mem-9",
    nameMr: "सौ. आदिती साबू",
    nameEn: "Mrs. Aditi Sabu",
    roleMr: "सदस्या",
    roleEn: "Committee Member",
    wing: "जे – ११०२ (J-1102)",
    phone: "",
    type: "committee",
    order: 9
  },
  {
    _id: "mem-10",
    nameMr: "श्री. तेजस माळी",
    nameEn: "Mr. Tejas Mali",
    roleMr: "सदस्य",
    roleEn: "Committee Member",
    wing: "जी – १००१ (G-1001)",
    phone: "",
    type: "committee",
    order: 10
  },
  {
    _id: "mem-11",
    nameMr: "सौ. प्रतिमा प्रशांत कुलकर्णी",
    nameEn: "Mrs. Pratima Prashant Kulkarni",
    roleMr: "सदस्या",
    roleEn: "Committee Member",
    wing: "एच – १६०४ (H-1604)",
    phone: "",
    type: "committee",
    order: 11
  },
  {
    _id: "mem-12",
    nameMr: "श्री. चेतनकुमार उत्तमराव सौंदाणे",
    nameEn: "Mr. Chetankumar Uttamrao Soundane",
    roleMr: "सदस्य",
    roleEn: "Committee Member",
    wing: "के – १०३ (K-103)",
    phone: "",
    type: "committee",
    order: 12
  }
];

const EmergencyContacts = ({ contacts = [] }) => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // If contacts tab is disabled by admin, return null
  if (config?.tabs?.contacts && !config.tabs.contacts.enabled) {
    return null;
  }

  const societyEmail = config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com";
  const displayContacts = (Array.isArray(contacts) && contacts.length > 0)
    ? contacts
    : (config?.mandalInfo?.committeeMembers && config.mandalInfo.committeeMembers.length > 0)
      ? config.mandalInfo.committeeMembers.map((m, idx) => ({
          _id: `mem-${idx + 1}`,
          nameMr: m.nameMr,
          nameEn: m.nameEn || m.nameMr,
          roleMr: m.roleMr,
          roleEn: m.roleEn || m.roleMr,
          wing: m.wing || "सर्व विंग्ज",
          phone: m.phone || "",
          type: "committee",
          order: idx + 1
        }))
      : DEFAULT_CONTACTS;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(societyEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <section id="contacts" className="scroll-mt-20 my-8">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
              <Shield className="w-4 h-4 text-rose-700" />
              <span>{language === "mr" ? "कार्यकारिणी समिती" : "Executive Committee"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "कार्यकारिणी व अधिकृत संपर्क" : "Executive Committee & Official Contacts"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {language === "mr" ? "सोसायटी अधिकृत ईमेल व म्हाडा टॉवर्स गणेशोत्सव कार्यकारिणी सदस्य" : "Official Society Email & MHADA Towers Ganesh Utsav Committee Members"}
            </p>
          </div>
        </div>

        {/* 1. SOCIETY OFFICIAL EMAIL HIGHLIGHT CARD */}
        {societyEmail && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white border-2 border-gold-400 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gold-400 text-maroon-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gold-300 font-bold block">
                  {t("officialEmail")}
                </span>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-white font-mono mt-0.5 break-all sm:break-normal">
                  {societyEmail}
                </h3>
                <p className="text-xs text-gold-200/80">
                  {language === "mr" 
                    ? (config?.regNo ? `नोंदणी क्र: ${config.regNo} • कोणत्याही सूचना किंवा मदतीसाठी संपर्क साधा` : "कोणत्याही सूचना किंवा मदतीसाठी संपर्क साधा")
                    : (config?.regNo ? `Reg No: ${config.regNo} • Contact us for any queries, suggestions or support` : "Contact us for any queries, suggestions or support")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <a
                href={`mailto:${societyEmail}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t("emailUs")}</span>
              </a>

              <button
                onClick={handleCopyEmail}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-700 text-gold-200 font-bold text-xs sm:text-sm border border-gold-500/40 transition"
                title={language === "mr" ? "ईमेल पत्ता कॉपी करा" : "Copy email address"}
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmail ? t("copied") : t("copyEmail")}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. CONTACTS CARDS GRID */}
        {displayContacts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayContacts.map((c, idx) => {
              const isEmergency = c.type === "emergency" || c.type === "security";

              return (
                <div
                  key={c._id || idx}
                  className="p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-xs bg-white border-gold-300 hover:border-gold-500 hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-maroon-800 bg-gold-100 px-2.5 py-0.5 rounded-full border border-gold-200 truncate">
                        {c.wing || (language === "mr" ? "सर्व विंग्ज" : "All Wings")}
                      </span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 truncate">
                        {language === "mr" ? c.roleMr : (c.roleEn || c.roleMr)}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading truncate">
                      {language === "mr" ? c.nameMr : (c.nameEn || c.nameMr)}
                    </h4>

                    <p className="text-xs text-stone-600 font-medium truncate mt-0.5">
                      {language === "mr" 
                        ? (c.roleMr === "अध्यक्षा" ? "मंडळ अध्यक्षा" : c.roleMr === "उपाध्यक्षा" ? "मंडळ उपाध्यक्षा" : c.roleMr === "सचिव" ? "मंडळ सचिव" : c.roleMr === "खजिनदार" ? "मंडळ खजिनदार" : (c.roleMr || "कार्यकारिणी सदस्य"))
                        : (c.roleEn || c.roleMr || "Executive Member")}
                    </p>

                    {c.phone && (
                      <p className="text-xs font-mono font-bold text-maroon-800 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-700" />
                        <span>{c.phone}</span>
                      </p>
                    )}
                  </div>

                  {c.phone ? (
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex-shrink-0 p-3 rounded-2xl bg-maroon-850 hover:bg-maroon-700 text-gold-300 shadow-md transition flex items-center justify-center transform active:scale-90"
                      title={language === "mr" ? `${c.nameMr || c.nameEn} यांना कॉल करा` : `Call ${c.nameEn || c.nameMr}`}
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  ) : (
                    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-100 to-amber-100 text-maroon-900 border border-gold-300 flex items-center justify-center shadow-2xs">
                      <User className="w-5 h-5 text-maroon-800" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default EmergencyContacts;
