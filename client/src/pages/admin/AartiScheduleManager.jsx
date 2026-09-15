import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, Save, Calendar, Clock, Building2, 
  Sparkles, Check, CheckCircle2, Star, Globe, Info, Share2,
  Upload, Image as ImageIcon, Trash2, Eye, X, ChevronDown, ChevronUp,
  Link as LinkIcon, Users
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton, 
  FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatAartiScheduleBroadcast, formatSingleAartiDay, openWhatsApp } from "../../utils/whatsappFormatter";
import API from "../../services/api";

import { 
  getWings, 
  getWingCodesText, 
  getAllWingsLabel, 
  getAllWingsShortLabel 
} from "../../utils/wingUtils";

const AartiScheduleManager = ({ 
  config, 
  onSaveAartiSchedule, 
  onSaveFestivalScheduleCard, 
  onNotify 
}) => {
  const { language, setLanguage } = useLanguage();
  const isEn = language === "en";

  const [schedule, setSchedule] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDailyAartiSection, setShowDailyAartiSection] = useState(false);

  // Festival Schedule Card Form State
  const [cardForm, setCardForm] = useState({
    eventNameMr: "",
    eventNameEn: "",
    eventDescriptionMr: "",
    eventDescriptionEn: "",
    plannerMr: "",
    plannerEn: "",
    plannerDetailsMr: "",
    plannerDetailsEn: "",
    imageUrl: "",
    imageCaptionMr: "",
    imageCaptionEn: ""
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (config?.dailyAartiSchedule?.length) {
      setSchedule(JSON.parse(JSON.stringify(config.dailyAartiSchedule)));
    }
    if (config?.festivalScheduleCard) {
      const clean = (val, fb) => (typeof val === "string" && val.trim() && !val.includes("??") && !val.includes("\ufffd") ? val : fb);
      setCardForm({
        eventNameMr: clean(config.festivalScheduleCard.eventNameMr, "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य सोहळा)"),
        eventNameEn: clean(config.festivalScheduleCard.eventNameEn, "Shree Ganeshotsav 2026 (10-Day Grand Celebration)"),
        eventDescriptionMr: clean(config.festivalScheduleCard.eventDescriptionMr, "म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G, H, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा."),
        eventDescriptionEn: clean(config.festivalScheduleCard.eventDescriptionEn, "10-day grand festival celebration organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers."),
        plannerMr: clean(config.festivalScheduleCard.plannerMr, "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती"),
        plannerEn: clean(config.festivalScheduleCard.plannerEn, "MHADA Towers Utsav Mandal & Central Society Committee"),
        plannerDetailsMr: clean(config.festivalScheduleCard.plannerDetailsMr, "सर्व ४ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, J, K)"),
        plannerDetailsEn: clean(config.festivalScheduleCard.plannerDetailsEn, "All 4 Building Wing Leads & Volunteer Squad (Wings G, H, J, K)"),
        imageUrl: config.festivalScheduleCard.imageUrl || "",
        imageCaptionMr: clean(config.festivalScheduleCard.imageCaptionMr, "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा"),
        imageCaptionEn: clean(config.festivalScheduleCard.imageCaptionEn, "Festival Schedule & Complete Event Blueprint")
      });
    }
  }, [config]);

  // Handle Photo Upload (Accepts any image extension: JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, etc.)
  const handleImageUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Accept any image extension or MIME type
    const isImage = Boolean(
      (file.type && file.type.startsWith("image/")) || 
      /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff|tif|ico|heic|heif|jfif|raw|eps)$/i.test(file.name || "")
    );
    if (!isImage) {
      onNotify(isEn ? "Please select a valid image file" : "कृपया वैध फोटो फाइल निवडा", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "schedule");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && (res.data.imageUrl || res.data.url)) {
        const uploadedUrl = res.data.imageUrl || res.data.url;
        setCardForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
        onNotify(
          isEn 
            ? "Festival schedule photo uploaded successfully!" 
            : "उत्सव वेळापत्रक फोटो यशस्वीरीत्या अपलोड झाला!", 
          "success"
        );
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      // Fallback: Read locally via FileReader as DataURL
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setCardForm(prev => ({ ...prev, imageUrl: loadEvent.target.result }));
        onNotify(
          isEn ? "Photo attached locally" : "स्थानिक फोटो जोडला गेला", 
          "info"
        );
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save Festival Schedule Card
  const handleSaveCard = async (e) => {
    if (e) e.preventDefault();
    setIsSavingCard(true);
    let res;
    if (onSaveFestivalScheduleCard) {
      res = await onSaveFestivalScheduleCard(cardForm);
    } else if (onSaveAartiSchedule) {
      res = await onSaveAartiSchedule(schedule);
    }
    setIsSavingCard(false);
    if (res?.success) {
      onNotify(
        isEn 
          ? "Festival event, planner and photo saved successfully!" 
          : "उत्सव कार्यक्रम, नियोजन व वेळापत्रक फोटो यशस्वीरीत्या जतन केले!", 
        "success"
      );
    } else {
      onNotify(
        res?.message || (isEn ? "Failed to save festival card" : "जतन करताना त्रुटी आली"), 
        "error"
      );
    }
  };

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

  const handleSaveAarti = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const res = await onSaveAartiSchedule(schedule);
    setIsSaving(false);
    if (res?.success) {
      onNotify(
        isEn 
          ? "Daily Aarti and Host Wings schedule saved successfully!" 
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

  const activeWingsList = getWings(config);
  const currentQuickWings = [
    ...activeWingsList.map(w => isEn ? `${w.code} Wing - ${w.nameEn || w.sacredNameEn || w.code}` : `${w.code} WING - ${w.nameMr || w.sacredNameMr || w.code}`),
    getAllWingsLabel(config, language)
  ];

  // Delete / Clear Photo Handler
  const handleDeletePhoto = async () => {
    const isConfirmed = window.confirm(
      isEn 
        ? "Are you sure you want to remove the festival schedule photo from the home page?" 
        : "तुम्हाला खात्री आहे की मुख्य पानावरील उत्सव वेळापत्रक फोटो काढायचा आहे?"
    );
    if (!isConfirmed) return;

    const updated = { ...cardForm, imageUrl: "" };
    setCardForm(updated);
    if (onSaveFestivalScheduleCard) {
      const res = await onSaveFestivalScheduleCard(updated);
      if (res?.success) {
        onNotify(
          isEn 
            ? "Festival schedule photo removed and updated on home screen!" 
            : "उत्सव वेळापत्रक फोटो यशस्वीरीत्या काढला व मुख्य पानावर अपडेट झाला!", 
          "success"
        );
      }
    }
  };

  const detectedFormat = cardForm.imageUrl 
    ? (cardForm.imageUrl.startsWith("data:image/") 
        ? cardForm.imageUrl.split(";")[0].replace("data:image/", "").toUpperCase()
        : cardForm.imageUrl.split(".").pop().split(/[?#]/)[0].toUpperCase())
    : "";

  return (
    <div className="space-y-8">
      
      {/* 1. PRIMARY SECTION: FESTIVAL EVENT, PLANNER & SCHEDULE PHOTO */}
      <FestiveCard
        title={
          isEn 
            ? "Festival Event, Planner & Schedule Photo" 
            : "उत्सव रूपरेषा, नियोजन व वेळापत्रक फोटो"
        }
        subtitle={
          isEn
            ? "Upload the official schedule photo (accepts any image format), enter what the event actually is, and specify its organizing planners for the Home page."
            : "मुख्य पानावर दर्शवण्यासाठी अधिकृत वेळापत्रक फोटो (कोणत्याही इमेज फॉरमॅटमध्ये) अपलोड करा, काय कार्यक्रम आहे आणि नियोजन व आयोजक तपशील येथे प्रविष्ट करा."
        }
        icon={Calendar}
        badge={isEn ? "Rank #1 Home Page Schedule Card" : "क्रमांक १ मुख्य पान वेळापत्रक कार्ड"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FestiveButton
              onClick={handleSaveCard}
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSavingCard}
            >
              {isSavingCard 
                ? (isEn ? "Saving..." : "जतन करत आहे...") 
                : (isEn ? "Save Festival Details & Photo" : "उत्सव तपशील व फोटो जतन करा")
              }
            </FestiveButton>
          </div>
        }
      >
        {/* Language Switcher Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/70 border-2 border-gold-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-maroon-950 font-heading block">
                {isEn ? "Editing Language Mode:" : "संपादन भाषा मोड:"}
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                {isEn
                  ? "Editing English fields. Visitors see this when switching website to English."
                  : "सध्या मराठी भाषेतील माहिती संपादित करत आहात. इंग्रजीसाठी 'English' निवडा."}
              </span>
            </div>
          </div>

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

        {/* ACTIVE LIVE RECORD & CRUD OPERATIONS SUMMARY BANNER */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-amber-50/50 border-2 border-gold-400 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gold-200 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gold-200 text-maroon-900 border border-gold-300">
                <Star className="w-4 h-4 text-amber-700 fill-amber-500" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-maroon-950 font-heading">
                  {isEn ? "Current Live Home Page Record & Photo" : "सध्याचा मुख्य पान रेकॉर्ड व वेळापत्रक फोटो"}
                </h4>
                <p className="text-[11px] text-stone-600">
                  {isEn 
                    ? "Displays Rank #1 on top of website. All changes reflect live across visitors instantly." 
                    : "वेबसाइटवर क्रमांक १ (Rank #1) वर दिसते. केलेले बदल थेट मुख्य स्क्रीनवर त्वरित दिसतात."}
                </p>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2">
              {cardForm.imageUrl ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{isEn ? "Live on Home Screen" : "थेट मुख्य पानावर सक्रिय"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-stone-100 border border-stone-300 px-3 py-1 rounded-full">
                  <span>{isEn ? "No Photo Attached (Text Only)" : "फोटो जोडलेला नाही (केवळ मजकूर)"}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Live Thumbnail Preview */}
            <div className="md:col-span-3 flex flex-col items-center">
              {cardForm.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gold-300 shadow-sm bg-stone-900 w-full max-w-[200px] h-32 flex items-center justify-center group cursor-pointer"
                  onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                  title={isEn ? "Click to view full image pop-up" : "पूर्ण फोटो पॉपअप पाहण्यासाठी क्लिक करा"}
                >
                  <img 
                    src={cardForm.imageUrl} 
                    alt="Schedule Photo" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold flex items-center gap-1 bg-maroon-900/90 px-2 py-1 rounded-lg border border-gold-300">
                      <Eye className="w-3.5 h-3.5" />
                      {isEn ? "View Pop-up" : "पॉपअप पहा"}
                    </span>
                  </div>
                  {detectedFormat && (
                    <span className="absolute top-1 right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/80 text-gold-300 border border-gold-400">
                      {detectedFormat}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-gold-300 bg-amber-50/60 p-4 text-center cursor-pointer hover:bg-amber-100/60 transition w-full max-w-[200px] h-32 flex flex-col items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-amber-700 mb-1" />
                  <span className="text-[11px] font-bold text-maroon-950">
                    {isEn ? "Click to Add Photo" : "फोटो जोडण्यासाठी क्लिक करा"}
                  </span>
                  <span className="text-[9px] text-stone-500">
                    {isEn ? "Any extension" : "सर्व इमेज फॉरमॅट्स"}
                  </span>
                </div>
              )}
            </div>

            {/* Live Record Text Summary */}
            <div className="md:col-span-6 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-500">{isEn ? "Event Title:" : "कार्यक्रम शीर्षक:"}</span>
                <span className="font-extrabold text-maroon-950 truncate">
                  {isEn ? (cardForm.eventNameEn || cardForm.eventNameMr) : (cardForm.eventNameMr || cardForm.eventNameEn)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-stone-500 flex-shrink-0">{isEn ? "Planner:" : "नियोजक मंडळ:"}</span>
                <span className="font-semibold text-stone-800 line-clamp-1">
                  {isEn ? (cardForm.plannerEn || cardForm.plannerMr) : (cardForm.plannerMr || cardForm.plannerEn)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-stone-500 flex-shrink-0">{isEn ? "Wings Squad:" : "सहभागी विंग्स:"}</span>
                <span className="text-stone-700 line-clamp-1">
                  {isEn ? (cardForm.plannerDetailsEn || cardForm.plannerDetailsMr) : (cardForm.plannerDetailsMr || cardForm.plannerDetailsEn)}
                </span>
              </div>
              {cardForm.imageUrl && (
                <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5 truncate">
                  <span className="font-bold">{isEn ? "Source:" : "फोटो स्त्रोत:"}</span>
                  <span className="font-mono text-emerald-800 truncate">{cardForm.imageUrl}</span>
                </div>
              )}
            </div>

            {/* CRUD Action Buttons */}
            <div className="md:col-span-3 flex flex-col gap-2 justify-center">
              {/* [C - Create / Upload] */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-maroon-900 to-maroon-850 hover:from-maroon-850 hover:to-maroon-800 text-gold-200 text-xs font-bold border border-gold-400 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-gold-300" />
                <span>{cardForm.imageUrl ? (isEn ? "Change/Upload Photo" : "फोटो बदला / अपलोड करा") : (isEn ? "Upload Photo" : "फोटो अपलोड करा")}</span>
              </button>

              {/* [R - Read / View Pop-Up] */}
              {cardForm.imageUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                  className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  title={isEn ? "Open popup modal with single close button" : "सिंगल क्लोज बटणासह पॉपअप उघडा"}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isEn ? "View Pop-up Modal" : "पॉपअप फोटो पहा"}</span>
                </button>
              )}

              {/* [D - Delete / Remove Photo] */}
              {cardForm.imageUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title={isEn ? "Delete photo from home page" : "मुख्य पानावरील फोटो काढा"}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                  <span>{isEn ? "Delete Photo" : "फोटो हटवा"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Form Grid: Image Upload (Left) + Event & Planner Inputs (Right) */}
        <form onSubmit={handleSaveCard} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Photo View & Upload Option (Accepts Any Image Extension) */}
            <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-gold-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
                    {isEn ? "Festival Schedule Photo" : "उत्सव वेळापत्रक फोटो"}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {isEn ? "Any Image Extension" : "सर्व फॉरमॅट"}
                </span>
              </div>

              {/* Upload Input Area */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.bmp,.tiff,.tif,.ico,.jfif,.heic,.heif,.raw,.eps"
                onChange={handleImageUpload} 
                className="hidden" 
              />

              {cardForm.imageUrl ? (
                <div className="space-y-3">
                  {/* Photo Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden border-2 border-gold-300 bg-stone-900 group">
                    <img 
                      src={cardForm.imageUrl} 
                      alt="Festival Schedule Preview" 
                      className="w-full h-48 sm:h-56 object-contain bg-stone-900"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                        className="px-3 py-1.5 bg-maroon-900/90 text-gold-200 rounded-lg text-xs font-bold border border-gold-400 flex items-center gap-1.5 shadow"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isEn ? "Test Pop-up" : "पॉपअप पहा"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="flex-1 py-2 px-3 bg-gold-100 hover:bg-gold-200 text-maroon-950 border border-gold-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-maroon-800" />
                      <span>{isUploadingPhoto ? (isEn ? "Uploading..." : "अपलोड होत आहे...") : (isEn ? "Change Photo" : "फोटो बदला")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      title={isEn ? "Preview popup modal with single close button" : "सिंगल क्लोज बटणासह पॉपअप तपासा"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isEn ? "Preview" : "पहा"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardForm(prev => ({ ...prev, imageUrl: "" }))}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title={isEn ? "Remove photo" : "फोटो काढा"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isEn ? "Remove" : "काढा"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gold-400/80 hover:border-gold-500 bg-amber-50/50 hover:bg-amber-50/80 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-100 text-maroon-900 border border-gold-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-amber-700" />
                  </div>
                  <span className="text-xs font-black text-maroon-950 font-heading block">
                    {isUploadingPhoto 
                      ? (isEn ? "Uploading Photo..." : "फोटो अपलोड होत आहे...") 
                      : (isEn ? "Click to Insert/Upload Photo" : "फोटो अपलोड करण्यासाठी येथे क्लिक करा")
                    }
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                    {isEn 
                      ? "Accepts JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, and all other image extensions" 
                      : "JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF व सर्व फॉरमॅट्स स्वीकारले जातात"}
                  </p>
                </div>
              )}

              {/* Direct Image URL fallback input */}
              <div className="pt-2">
                <FestiveInput
                  label={isEn ? "Or Paste Image URL directly:" : "किंवा थेट इमेज URL पेस्ट करा:"}
                  icon={LinkIcon}
                  value={cardForm.imageUrl || ""}
                  onChange={(e) => setCardForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... or /uploads/..."
                />
              </div>

              {/* Image Caption */}
              <div>
                <FestiveInput
                  label={isEn ? "Image Caption / Blueprint Note:" : "फोटो मथळा / रूपरेषा टीप:"}
                  icon={Sparkles}
                  value={isEn ? (cardForm.imageCaptionEn || "") : (cardForm.imageCaptionMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "imageCaptionEn" : "imageCaptionMr"]: e.target.value
                  }))}
                  placeholder={isEn ? "e.g. Festival Schedule & Complete Event Blueprint" : "उदा. उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा"}
                />
              </div>
            </div>

            {/* Right Box: Event Details ("what the event actually is") & Planner ("its planner") */}
            <div className="lg:col-span-7 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 p-5 space-y-4 shadow-xs">
              
              <div className="border-b border-gold-200 pb-2.5">
                <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>{isEn ? "Event Details & Organizing Planners" : "कार्यक्रम तपशील व उत्सव नियोजन"}</span>
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isEn 
                    ? "These details will be displayed on the Home page card instead of the previous date-wise subcards."
                    : "ही माहिती मुख्य पानावरील कार्डवर पूर्वीच्या सबकार्ड्सच्या ऐवजी स्पष्टपणे दिसेल."}
                </p>
              </div>

              {/* 1. What the actual event is (Name) */}
              <div>
                <FestiveInput
                  label={isEn ? "What the Event actually is (Event Title) *" : "काय कार्यक्रम आहे (उत्सव / कार्यक्रम शीर्षक) *"}
                  icon={Calendar}
                  value={isEn ? (cardForm.eventNameEn || "") : (cardForm.eventNameMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "eventNameEn" : "eventNameMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. Shree Ganeshotsav 2026 (10-Day Grand Celebration)" 
                      : "उदा. श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य सोहळा)"
                  }
                  required
                />
                <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                  <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="truncate">
                    {isEn ? `Marathi: ${cardForm.eventNameMr || "(not set)"}` : `English: ${cardForm.eventNameEn || "(सेट नाही)"}`}
                  </span>
                </div>
              </div>

              {/* 2. Detailed Event Description */}
              <div>
                <FestiveTextarea
                  label={isEn ? "Detailed Event Description (What actually happens during this event):" : "कार्यक्रमाचे सविस्तर वर्णन (कार्यक्रमाचे स्वरूप व माहिती):"}
                  rows={3}
                  value={isEn ? (cardForm.eventDescriptionEn || "") : (cardForm.eventDescriptionMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "eventDescriptionEn" : "eventDescriptionMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. 10-day grand festival celebration and cultural programs organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers." 
                      : "उदा. म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G-नंदादेवी, H-निलगिरी, J-पूर्वांचल, K-गोवर्धन) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव व सांस्कृतिक सोहळा."
                  }
                />
              </div>

              {/* 3. Its Planner / Organizing Committee */}
              <div className="pt-2 border-t border-gold-200">
                <FestiveInput
                  label={isEn ? "Its Planner / Organizing Committee *" : "उत्सव नियोजन / मुख्य आयोजक मंडळ *"}
                  icon={Users}
                  value={isEn ? (cardForm.plannerEn || "") : (cardForm.plannerMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "plannerEn" : "plannerMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. MHADA Towers Utsav Mandal & Central Society Committee" 
                      : "उदा. म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती"
                  }
                  required
                />
                <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                  <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="truncate">
                    {isEn ? `Marathi: ${cardForm.plannerMr || "(not set)"}` : `English: ${cardForm.plannerEn || "(सेट नाही)"}`}
                  </span>
                </div>
              </div>

              {/* 4. Planner Coordinating Wings / Details */}
              <div>
                <FestiveInput
                  label={isEn ? "Planner Details / Coordinating Wings:" : "नियोजन तपशील / सहभागी विंग्स व समन्वय पथक:"}
                  icon={Building2}
                  value={isEn ? (cardForm.plannerDetailsEn || "") : (cardForm.plannerDetailsMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "plannerDetailsEn" : "plannerDetailsMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. All 4 Building Wing Leads, Women's Wing & Volunteer Squad (Wings G, H, J, K)" 
                      : "उदा. सर्व ४ इमारतींचे विंग प्रमुख, महिला मंडळ व स्वयंसेवक दल (विंग G, H, J, K)"
                  }
                />
              </div>

            </div>

          </div>

          {/* Bottom Save Button for Festival Card */}
          <div className="pt-3 border-t border-gold-200 flex justify-end">
            <FestiveButton
              type="submit"
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSavingCard}
            >
              {isSavingCard 
                ? (isEn ? "Saving Festival Details..." : "जतन करत आहे...") 
                : (isEn ? "Save Festival Details & Photo (जतन करा)" : "उत्सव तपशील व फोटो जतन करा (Save)")
              }
            </FestiveButton>
          </div>
        </form>
      </FestiveCard>

      {/* 2. SECONDARY / COLLAPSIBLE SECTION: 10-DAY DAILY AARTI TIMINGS */}
      <div className="bg-white rounded-3xl border-2 border-gold-300 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400">
              <Flame className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading">
                {isEn ? "Daily Maha Aarti Timings & Host Wings" : "दैनिक महाआरती वेळा व यजमान इमारत वेळापत्रक"}
              </h3>
              <p className="text-xs text-stone-600">
                {isEn 
                  ? "Configures morning and evening Maha Aarti times used for the Aarti card countdown and WhatsApp broadcast." 
                  : "आरती कार्ड काउंटडाऊन व व्हॉट्सॲप ब्रॉडकास्टसाठी वापरल्या जाणाऱ्या सकाळ-संध्याकाळच्या आरती वेळा येथे बदला."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const txt = formatAartiScheduleBroadcast(schedule, config);
                openWhatsApp(txt);
                if (onNotify) onNotify(isEn ? "Opening WhatsApp with 10-day schedule..." : "१० दिवसांचे आरती वेळापत्रक व्हॉट्सॲपवर पाठवण्यासाठी तयार!", "success");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Share Aarti" : "आरती वेळ पाठवा"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDailyAartiSection(!showDailyAartiSection)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 font-black text-xs border border-gold-300 shadow-2xs transition cursor-pointer"
            >
              <span>{showDailyAartiSection ? (isEn ? "Hide Timings" : "वेळा लपवा") : (isEn ? "Edit Timings" : "आरती वेळा संपादित करा")}</span>
              {showDailyAartiSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Daily Aarti Table */}
        {showDailyAartiSection && (
          <form onSubmit={handleSaveAarti} className="mt-5 space-y-4 animate-fadeIn">
            {schedule.map((item, idx) => {
              const isToday = Boolean(item.isCurrentDay);
              const dayDisplayTitle = isEn 
                ? (item.dateStrEn || item.dateStr || `Day ${item.dayNumber || idx + 1}`) 
                : (item.dateStr || `दिवस ${item.dayNumber || idx + 1}`);

              return (
                <div
                  key={item.dayNumber || idx}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isToday
                      ? "bg-amber-50/70 border-gold-500 shadow-xs ring-1 ring-gold-400"
                      : "bg-[#FFFDF9] border-gold-200 hover:border-gold-300"
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-gold-200">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-maroon-900 text-gold-300 font-black flex items-center justify-center text-xs">
                        {item.dayNumber || idx + 1}
                      </span>
                      <span className="font-heading font-black text-sm text-maroon-950">
                        {dayDisplayTitle}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                          {isEn ? "Today" : "आज"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetCurrentDay(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                          isToday
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300"
                        }`}
                      >
                        {isToday ? (isEn ? "Active Day" : "आजचा सक्रिय दिवस") : (isEn ? "Set as Today" : "आजचा दिवस बनवा")}
                      </button>
                    </div>
                  </div>

                  {/* Day Aarti Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <FestiveInput
                        label={isEn ? "Day & Date" : "दिवस व दिनांक"}
                        value={isEn ? (item.dateStrEn || "") : (item.dateStr || "")}
                        onChange={(e) => handleFieldChange(idx, isEn ? "dateStrEn" : "dateStr", e.target.value)}
                      />
                    </div>
                    <div>
                      <FestiveInput
                        label={isEn ? "Host Building" : "यजमान इमारत"}
                        value={isEn ? (item.hostWingEn || "") : (item.hostWing || "")}
                        onChange={(e) => handleFieldChange(idx, isEn ? "hostWingEn" : "hostWing", e.target.value)}
                      />
                    </div>
                    <div>
                      <FestiveInput
                        label={isEn ? "Morning Time" : "प्रभात आरती वेळ"}
                        value={isEn ? (item.morningTimeEn || "") : (item.morningTime || "")}
                        onChange={(e) => handleFieldChange(idx, isEn ? "morningTimeEn" : "morningTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <FestiveInput
                        label={isEn ? "Evening Time" : "सायं आरती वेळ"}
                        value={isEn ? (item.eveningTimeEn || "") : (item.eveningTime || "")}
                        onChange={(e) => handleFieldChange(idx, isEn ? "eveningTimeEn" : "eveningTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-gold-200 flex justify-end">
              <FestiveButton
                type="submit"
                icon={Save}
                variant="primary"
                size="md"
                disabled={isSaving}
              >
                {isSaving ? (isEn ? "Saving..." : "जतन करत आहे...") : (isEn ? "Save Aarti Timings" : "आरती वेळा जतन करा")}
              </FestiveButton>
            </div>
          </form>
        )}
      </div>

      {/* 3. Pop-Up Image Modal with Single Close Button (Admin Preview) */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Single Close Button */}
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              aria-label="Close"
              className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 w-11 h-11 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform transform hover:scale-110 cursor-pointer"
              title="Close / बंद करा"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>

            {/* High-Resolution Display Image */}
            <div className="w-full flex justify-center overflow-hidden rounded-2xl border-2 border-gold-400/90 shadow-2xl bg-black/60">
              <img 
                src={previewModalImg} 
                alt="Schedule Preview" 
                className="max-w-full max-h-[82vh] object-contain rounded-2xl"
              />
            </div>

            {/* Single Close Action Bar */}
            <div className="mt-3 w-full flex items-center justify-between px-2 text-white">
              <span className="text-xs sm:text-sm font-bold text-gold-300 truncate">
                {isEn ? (cardForm.eventNameEn || cardForm.eventNameMr) : (cardForm.eventNameMr || "Schedule Preview")}
              </span>

              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md border border-white/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isEn ? "Close" : "बंद करा (Close)"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AartiScheduleManager;
