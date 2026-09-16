import React, { useState } from "react";
import { 
  X, BarChart2, Users, Building2, Image as ImageIcon, 
  CheckCircle2, Sparkles, Send, MapPin, PhoneCall 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

export const ResidentPollsModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config, castVote } = useConfig();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const poll = config?.poll || {};
  const question = language === "mr" 
    ? (poll.questionMr || poll.question) 
    : (poll.questionEn || poll.questionMr || poll.question);
  const options = poll.options || [];

  const handleVote = async () => {
    if (selectedOption !== null) {
      setSubmitting(true);
      try {
        await castVote(selectedOption);
        setHasVoted(true);
      } catch (err) {
        console.error("Failed to cast vote:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <BarChart2 className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "रहिवासी मतदान (Resident Polls)" : "Resident Polls"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr"
            ? "म्हाडा टॉवर्स उत्सव मंडळाचे निर्णय सर्व विंग्जच्या रहिवाशांच्या मताने होतात."
            : "Decisions are made with resident votes across all society buildings."}
        </p>

        {hasVoted ? (
          <div className="p-5 text-center bg-emerald-50 rounded-2xl border border-emerald-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">
              {language === "mr" ? "आपले मत नोंदवले गेले आहे!" : "Your vote has been recorded!"}
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              {language === "mr" ? "उत्सवाच्या नियोजनात सहभाग घेतल्याबद्दल धन्यवाद." : "Thank you for actively participating in festival planning."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {question && (
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 uppercase">
                  {language === "mr" ? "चालू मतदान प्रश्न:" : "Active Poll Question:"}
                </span>
                <p className="text-sm font-bold text-maroon-950 mt-1">
                  {question}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                    selectedOption === opt.id
                      ? "border-amber-500 bg-amber-50 text-maroon-950"
                      : "border-gray-200 hover:border-gold-300 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="poll"
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{language === "mr" ? opt.text : (opt.textEn || opt.text)}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleVote}
              disabled={selectedOption === null || submitting}
              className="w-full py-2.5 bg-maroon-850 hover:bg-maroon-800 disabled:opacity-50 text-gold-200 font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> 
              <span>
                {submitting 
                  ? (language === "mr" ? "नोंदवत आहे..." : "Submitting...") 
                  : (language === "mr" ? "मत नोंदवा (Submit Vote)" : "Submit Vote")}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const VolunteerSevaModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  const [submitted, setSubmitted] = useState(false);
  
  const volunteer = config?.volunteerSeva || {};
  const wings = config?.wings && config.wings.length > 0 ? config.wings : [];
  const defaultWing = wings[0]?.code || (config?.participatingWings?.[0] || "G");
  const roles = volunteer.roles && volunteer.roles.length > 0 ? volunteer.roles : [];

  const [formData, setFormData] = useState({ 
    name: "", 
    wing: defaultWing, 
    phone: "", 
    seva: roles[0]?.titleMr || "मंडप व्यवस्था व आरती मदत" 
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <Users className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" 
              ? (volunteer.title || "स्वयंसेवक सेवा नोंदणी (Volunteer Registration)") 
              : (volunteer.titleEn || volunteer.title || "Volunteer Registration")}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr"
            ? (volunteer.description || "बाप्पांच्या उत्सवात सेवा करण्याची सुवर्णसंधी. सर्व इमारतींच्या उत्साही तरुणांनी नाव नोंदवावे.")
            : (volunteer.descriptionEn || volunteer.description || "Register to volunteer for the grand celebration.")}
        </p>

        {submitted ? (
          <div className="p-5 text-center bg-emerald-50 rounded-2xl border border-emerald-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">
              {language === "mr" ? "नोंदणी यशस्वी झाली!" : "Registration Successful!"}
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              {language === "mr" 
                ? "मंडळ कार्यकारिणीचे स्वयंसेवक समन्वयक लवकरच आपल्याशी संपर्क साधतील." 
                : "Committee coordinators will contact you soon."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">पूर्ण नाव (Full Name) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा. अमित पाटील"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">इमारत (Building) *</label>
                <select
                  value={formData.wing}
                  onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none"
                >
                  {wings.length > 0 ? (
                    wings.map((w) => (
                      <option key={w.code} value={w.code}>
                        {language === "mr" ? (w.nameMr || `${w.code} - ${w.sacredNameMr || ""}`) : (w.nameEn || w.code)}
                      </option>
                    ))
                  ) : (
                    (config?.participatingWings || ["G", "H", "J", "K"]).map(c => (
                      <option key={c} value={c}>विंग {c}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">मोबाईल क्र. *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98220..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {roles.length > 0 && (
              <div>
                <label className="block font-semibold mb-1 text-gray-700">इच्छित सेवा (Seva Preference)</label>
                <select
                  value={formData.seva}
                  onChange={(e) => setFormData({ ...formData, seva: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none"
                >
                  {roles.map((r, idx) => (
                    <option key={idx} value={r.titleMr || r.titleEn}>
                      {language === "mr" ? r.titleMr : (r.titleEn || r.titleMr)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow transition text-xs mt-2"
            >
              {language === "mr" ? "सहभाग नोंदवा (Register Volunteer)" : "Register Volunteer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const WingInfoModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  if (!isOpen) return null;

  const wings = config?.wings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <Building2 className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "सहभागी इमारतींची माहिती" : "Buildings Information"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr" ? "म्हाडा टॉवर्स मधील सहभागी विंग्स, समन्वयक व आरक्षित आरती दिवस." : "Participating buildings, coordinators, and reserved Aarti days."}
        </p>

        <div className="space-y-3">
          {wings.map((w, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-maroon-950 text-sm font-heading">
                    {language === "mr" ? (w.nameMr || `${w.code} - ${w.sacredNameMr || ""}`) : (w.nameEn || `${w.code} - ${w.sacredNameEn || ""}`)}
                  </span>
                  {w.flatsCount && (
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-300 font-semibold text-gray-700">
                      {w.flatsCount} फ्लॅट्स
                    </span>
                  )}
                </div>
                {w.coordinatorLead && (
                  <p className="text-gray-700 mt-1 font-medium">विंग प्रमुख: <strong>{w.coordinatorLead}</strong></p>
                )}
                {w.aartiReservedDays && (
                  <span className="text-[10px] text-amber-800 font-bold">आरती यजमान: {w.aartiReservedDays}</span>
                )}
              </div>
              {w.coordinatorPhone && (
                <a
                  href={`tel:${w.coordinatorPhone.replace(/[^0-9+]/g, "")}`}
                  className="p-2 rounded-xl bg-gold-200 hover:bg-gold-300 text-maroon-900 transition flex items-center gap-1"
                  title="कॉल करा"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FestivalGalleryModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  if (!isOpen) return null;

  const gallery = (config?.gallery || []).filter(f => f.isActive !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <ImageIcon className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "उत्सव छायाचित्रे (Festival Gallery)" : "Festival Photo Gallery"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr" ? "म्हाडा टॉवर्स गणेशोत्सवातील काही अविस्मरणीय क्षणचित्रे." : "Memorable moments from MHADA Towers Ganesh Utsav."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gallery.map((item, idx) => {
            const banner = item.bannerUrl || item.imageUrl;
            const title = language === "mr" ? (item.nameMr || item.titleMr) : (item.nameEn || item.titleEn || item.titleMr);
            const count = item.photos?.length || 0;
            return (
              <div key={item.id || idx} className="rounded-2xl border border-gold-300 p-3 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EC] shadow-xs">
                {banner ? (
                  <div className="h-36 rounded-xl overflow-hidden mb-2 relative bg-black">
                    <img src={banner} alt={title} className="w-full h-full object-cover" />
                    {item.category && (
                      <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-maroon-950 font-black px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    {count > 0 && (
                      <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 text-gold-200 font-bold px-2 py-0.5 rounded-full">
                        {count} {language === "mr" ? "फोटो" : "Photos"}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-32 rounded-xl bg-maroon-950 flex flex-col items-center justify-center text-gold-300 mb-2 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-gold-400 mb-1 animate-pulse" />
                    <span className="text-[11px] font-bold text-center px-2">{title}</span>
                    {item.category && (
                      <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-maroon-950 font-black px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs font-bold text-maroon-950 truncate">
                  {title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
