import React, { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, Save, Plus, Trash2, Sparkles, Calendar, Eye,
  Upload, FolderUp, Camera, Loader2, X, CheckCircle2, ExternalLink
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import API from "../../services/api";

const GalleryManager = ({ config, onSaveGallery, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const batchInputRef = useRef(null);

  useEffect(() => {
    if (config?.gallery) {
      setGallery(JSON.parse(JSON.stringify(config.gallery)));
    }
  }, [config]);

  const handleAddPhoto = () => {
    setGallery([
      {
        id: Date.now().toString(),
        titleMr: "नवीन उत्सव छायाचित्र",
        titleEn: "New Festival Photo",
        category: "महाआरती",
        categoryEn: "Maha Aarti",
        year: config?.festivalYear || "२०२६",
        yearEn: "2026",
        descMr: "",
        descEn: "",
        imageUrl: "",
        accentColor: "from-amber-700 to-maroon-900"
      },
      ...gallery
    ]);
  };

  const handleRemovePhoto = (idx) => {
    if (window.confirm(isEn ? "Remove this photograph from the gallery?" : "हे छायाचित्र काढून टाकायचे आहे का?")) {
      setGallery(gallery.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (idx, field, val) => {
    const updated = [...gallery];
    updated[idx][field] = val;
    setGallery(updated);
  };

  // Upload single photo for a card
  const handleFileUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (onNotify) onNotify(isEn ? "Please select a valid image file (JPG, PNG, WEBP)" : "कृपया वैध फोटो फाइल निवडा (JPG, PNG, WEBP)", "error");
      return;
    }

    setUploadingIdx(idx);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "gallery");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.imageUrl) {
        handleChange(idx, "imageUrl", res.data.imageUrl);
        // If title is default, suggest filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        if (!gallery[idx].titleMr || gallery[idx].titleMr === "नवीन उत्सव छायाचित्र") {
          handleChange(idx, "titleMr", cleanName);
        }
        if (!gallery[idx].titleEn || gallery[idx].titleEn === "New Festival Photo") {
          handleChange(idx, "titleEn", cleanName);
        }
        if (onNotify) onNotify(isEn ? "Image uploaded to server uploads folder!" : "फोटो सर्व्हरच्या uploads मध्ये सुरक्षित सेव्ह झाला!", "success");
      } else {
        throw new Error(res.data?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.message || (isEn ? "Upload failed" : "फोटो अपलोड करताना त्रुटी आली");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  // Batch upload multiple photos at once
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsBatchUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("category", "gallery");

      const res = await API.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && Array.isArray(res.data.files)) {
        const newCards = res.data.files.map((f, i) => {
          const rawName = (f.originalName || "photo").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          return {
            id: (Date.now() + i).toString(),
            titleMr: rawName,
            titleEn: rawName,
            category: "महाआरती",
            categoryEn: "Maha Aarti",
            year: config?.festivalYear || "२०२६",
            yearEn: "2026",
            descMr: "",
            descEn: "",
            imageUrl: f.imageUrl || f.url,
            accentColor: "from-amber-700 to-maroon-900"
          };
        });

        setGallery(prev => [...newCards, ...prev]);
        if (onNotify) {
          onNotify(
            isEn 
              ? `${newCards.length} images uploaded to server/uploads/ successfully!` 
              : `${newCards.length} फोटो यशस्वीरित्या सर्व्हरवर अपलोड केले!`,
            "success"
          );
        }
      } else {
        throw new Error(res.data?.message || "Batch upload failed");
      }
    } catch (err) {
      console.error("Batch upload error:", err);
      const msg = err.response?.data?.message || (isEn ? "Batch upload failed" : "सर्व फोटो अपलोड करताना त्रुटी आली");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setIsBatchUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const res = await onSaveGallery(gallery);
    setIsSaving(false);
    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Photo gallery updated and replicated to Home Page!" : "छायाचित्र गॅलरी अद्ययावत केली व होमपेजवर प्रकाशित झाली!", "success");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save gallery" : "गॅलरी जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Festival Photo Gallery Manager" 
          : "उत्सव छायाचित्र गॅलरी व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Upload memorable photos directly to server storage. Photos replicate instantly to the Home Page gallery."
          : "डिव्हाइसवरून फोटो थेट सर्व्हरवर अपलोड करा. अपलोड केलेले फोटो थेट मुख्य पानावर (Home Page) भाविकांना दिसतील."
      }
      icon={ImageIcon}
      badge={isEn ? `Photos: ${gallery.length}` : `एकूण फोटो: ${gallery.length}`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden batch file input */}
          <input
            type="file"
            ref={batchInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleBatchUpload}
          />

          <FestiveButton
            onClick={() => batchInputRef.current?.click()}
            icon={isBatchUploading ? Loader2 : FolderUp}
            variant="secondary"
            size="md"
            disabled={isBatchUploading}
          >
            {isBatchUploading 
              ? (isEn ? "Uploading Files..." : "अपलोड करत आहे...") 
              : (isEn ? "Batch Upload Photos" : "एकाचवेळी अनेक फोटो निवडा")
            }
          </FestiveButton>

          <FestiveButton
            onClick={handleAddPhoto}
            icon={Plus}
            variant="secondary"
            size="md"
          >
            {isEn ? "Add Photo Card" : "नवीन फोटो जोडा"}
          </FestiveButton>

          <FestiveButton
            onClick={handleSubmit}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving || isBatchUploading}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Gallery (गॅलरी जतन करा)" : "गॅलरी जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      {/* Upload info banner */}
      <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-maroon-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {isEn 
              ? "Photos are saved into server/uploads/ directory and rendered automatically in the Past Moments gallery on the Home page."
              : "सर्व फोटो server/uploads/ फोल्डरमध्ये सुरक्षित साठवले जातात आणि मुख्य पानावर (Home Page) भाविकांसाठी प्रदर्शित होतात."}
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-[11px] text-gray-600">
          server/uploads/
        </span>
      </div>

      <div className="space-y-4">
        {gallery.map((photo, idx) => {
          const isThisUploading = uploadingIdx === idx;
          const photoKey = photo.id || idx;

          return (
            <div
              key={photoKey}
              className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-gold-300 shadow-xs space-y-4 hover:border-gold-500 transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-gold-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gold-400 text-maroon-950 font-black px-2.5 py-0.5 rounded-full">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-black text-maroon-950 font-heading truncate max-w-xs sm:max-w-md">
                    {isEn ? (photo.titleEn || photo.titleMr || `Photo #${idx + 1}`) : (photo.titleMr || `नवीन फोटो #${idx + 1}`)}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  {photo.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(photo.imageUrl)}
                      className="p-1.5 text-maroon-800 hover:bg-gold-100 rounded-lg transition cursor-pointer"
                      title={isEn ? "Preview image" : "फोटो मोठा पहा"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title={isEn ? "Remove photo" : "फोटो काढा"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Upload & Preview Section */}
              <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-gold-300/80">
                <label className="block text-xs font-bold text-maroon-950 mb-2">
                  {isEn ? "Festival Image / Photo File *" : "उत्सव छायाचित्र / फोटो फाइल *"}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail / Placeholder */}
                  <div className="relative w-full sm:w-44 h-32 rounded-xl border-2 border-dashed border-gold-400 bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                    {isThisUploading ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-amber-700">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[11px] font-bold">
                          {isEn ? "Uploading..." : "अपलोड होत आहे..."}
                        </span>
                      </div>
                    ) : photo.imageUrl ? (
                      <>
                        <img
                          src={photo.imageUrl}
                          alt={photo.titleMr || "Gallery photo"}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => setPreviewModalImg(photo.imageUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => handleChange(idx, "imageUrl", "")}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white hover:bg-rose-600 rounded-full transition"
                          title={isEn ? "Remove image" : "फोटो हटवा"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-gray-400 p-2 text-center">
                        <ImageIcon className="w-8 h-8 text-gold-400" />
                        <span className="text-[10px] text-gray-500 font-medium">
                          {isEn ? "No image attached" : "कोणताही फोटो जोडलेला नाही"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL fallback */}
                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition">
                        <Upload className="w-4 h-4" />
                        <span>
                          {photo.imageUrl 
                            ? (isEn ? "Replace with Local Photo" : "डिव्हाइसवरून दुसरा फोटो निवडा") 
                            : (isEn ? "Upload Photo from Device" : "डिव्हाइसवरून फोटो निवडा व अपलोड करा")
                          }
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, idx)}
                          disabled={isThisUploading}
                        />
                      </label>

                      {photo.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalImg(photo.imageUrl)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-gold-200 hover:bg-gold-300 text-maroon-950 font-bold text-xs rounded-xl transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isEn ? "View Preview" : "पूर्वावलोकन"}</span>
                        </button>
                      )}
                    </div>

                    {/* Image path display / manual URL */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                        <span>{isEn ? "Saved Image Path / URL:" : "सेव्ह केलेला फोटो मार्ग (Path) किंवा URL:"}</span>
                        {photo.imageUrl?.startsWith("/uploads") && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isEn ? "Stored in server/uploads/" : "server/uploads/ मध्ये सुरक्षित"}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={photo.imageUrl || ""}
                        onChange={(e) => handleChange(idx, "imageUrl", e.target.value)}
                        placeholder="उदा. /uploads/image-123.jpg किंवा https://..."
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-gold-300 bg-white text-gray-800 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveInput
                  label={isEn ? "Title (Marathi) *" : "मथळा / शीर्षक (मराठी) *"}
                  value={photo.titleMr}
                  onChange={(e) => handleChange(idx, "titleMr", e.target.value)}
                  placeholder="उदा. श्री गणरायाची भव्य मूर्ती प्रतिष्ठापना"
                />
                <FestiveInput
                  label={isEn ? "Title (English)" : "English Title"}
                  value={photo.titleEn}
                  onChange={(e) => handleChange(idx, "titleEn", e.target.value)}
                  placeholder="e.g. Grand Eco-Friendly Bappa Murti Sthapana"
                />
              </div>

              {/* Category and Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveInput
                  label={isEn ? "Category" : "वर्गवारी (Category)"}
                  value={photo.category}
                  onChange={(e) => handleChange(idx, "category", e.target.value)}
                  placeholder="उदा. महाआरती / मूर्ती / सांस्कृतिक / मिरवणूक"
                />
                <FestiveInput
                  label={isEn ? "Year" : "वर्ष (Year)"}
                  value={photo.year}
                  onChange={(e) => handleChange(idx, "year", e.target.value)}
                  placeholder="२०२६ / 2026"
                />
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveTextarea
                  label={isEn ? "Description (Marathi)" : "तपशील / वर्णन (मराठी)"}
                  rows={2}
                  value={photo.descMr}
                  onChange={(e) => handleChange(idx, "descMr", e.target.value)}
                  placeholder="सर्व ४ इमारतींमधील शेकडो भाविकांनी एकत्र येऊन..."
                />
                <FestiveTextarea
                  label={isEn ? "Description (English)" : "English Description"}
                  rows={2}
                  value={photo.descEn}
                  onChange={(e) => handleChange(idx, "descEn", e.target.value)}
                  placeholder="Hundreds of residents gathered for the grand aarti..."
                />
              </div>
            </div>
          );
        })}

        {gallery.length === 0 && (
          <div className="p-8 text-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-gold-300 space-y-3">
            <ImageIcon className="w-12 h-12 text-gold-500 mx-auto opacity-70" />
            <h4 className="text-base font-bold text-maroon-950 font-heading">
              {isEn ? "No Photos in Gallery" : "गॅलरीमध्ये कोणतेही फोटो नाहीत"}
            </h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              {isEn 
                ? "Click 'Upload Photos' to upload pictures from your device into server/uploads/ or click 'Add Photo Card' to enter details manually."
                : "आपल्या डिव्हाइसवरून server/uploads/ मध्ये फोटो सेव्ह करण्यासाठी 'एकाचवेळी अनेक फोटो निवडा' किंवा 'नवीन फोटो जोडा' बटणावर क्लिक करा."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <FestiveButton onClick={() => batchInputRef.current?.click()} icon={FolderUp} variant="primary" size="md">
                {isEn ? "Upload Photos from Device" : "डिव्हाइसवरून फोटो अपलोड करा"}
              </FestiveButton>
              <FestiveButton onClick={handleAddPhoto} icon={Plus} variant="secondary" size="md">
                {isEn ? "Add Photo Card" : "नवीन कार्ड जोडा"}
              </FestiveButton>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative bg-black rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-2 border-gold-400 shadow-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-rose-600 transition z-10"
              title={isEn ? "Close" : "बंद करा"}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewModalImg} 
              alt="Photo preview" 
              className="max-h-[80vh] w-auto object-contain rounded-2xl p-2" 
            />
            <div className="p-2 text-center text-xs text-gold-300 font-mono truncate max-w-full px-4">
              {previewModalImg}
            </div>
          </div>
        </div>
      )}
    </FestiveCard>
  );
};

export default GalleryManager;
