import React, { useState } from "react";
import { 
  Image as ImageIcon, Sparkles, X, 
  Eye, Calendar, ZoomIn 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

export const PAST_PHOTOS_DATA = [];

const PhotoGallery = () => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePhoto, setActivePhoto] = useState(null);

  // If gallery tab is disabled by admin, return null
  if (config?.tabs?.gallery && !config.tabs.gallery.enabled) {
    return null;
  }

  const galleryList = config?.gallery || [];
  if (galleryList.length === 0) {
    return null;
  }

  const categories = [
    { id: "all", labelMr: "सर्व फोटो", labelEn: "All Photos" },
    ...Array.from(new Set(galleryList.map(p => p.category).filter(Boolean))).map(cat => ({
      id: cat,
      labelMr: cat,
      labelEn: cat
    }))
  ];

  const filteredPhotos = selectedCategory === "all"
    ? galleryList
    : galleryList.filter((p) => p.category === selectedCategory);

  return (
    <section id="gallery" className="scroll-mt-20 my-8">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <ImageIcon className="w-4 h-4 text-maroon-800" />
              <span>{t("galleryTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "मागील उत्सवांची अविस्मरणीय छायाचित्रे" : "Past Festival Moments & Photo Gallery"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {t("gallerySubtitle")}
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedCategory === cat.id
                      ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-sm"
                      : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300"
                  }`}
                >
                  {language === "mr" ? cat.labelMr : cat.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Photo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo, idx) => {
            const photoId = photo.id || photo._id || idx;
            const accent = photo.accentColor || "from-amber-700 to-maroon-900";
            return (
              <div
                key={photoId}
                onClick={() => setActivePhoto(photo)}
                className="bg-white rounded-2xl border-2 border-gold-300 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Photo Visual Box */}
                {photo.imageUrl ? (
                  <div className="h-48 relative overflow-hidden bg-maroon-950">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.titleMr || photo.titleEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-gold-300 border border-gold-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {language === "mr" ? `वर्ष ${photo.year || config.festivalYear}` : `Year ${photo.year || config.festivalYear}`}
                    </div>
                    {photo.category && (
                      <div className="absolute top-3 right-3 bg-gold-400 text-maroon-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {language === "mr" ? photo.category : (photo.categoryEn || photo.category)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${accent} relative flex flex-col items-center justify-center text-white p-4 overflow-hidden`}>
                    <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 border-4 border-dashed border-gold-300 rounded-full animate-spin"></div>
                    </div>

                    <Sparkles className="w-10 h-10 text-gold-300 mb-2 transform group-hover:scale-125 transition duration-300" />
                    
                    <h4 className="text-sm sm:text-base font-extrabold text-gold-100 text-center font-heading leading-tight drop-shadow-md z-10 px-2">
                      {language === "mr" ? photo.titleMr : (photo.titleEn || photo.titleMr)}
                    </h4>

                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-xs text-gold-300 border border-gold-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {language === "mr" ? `वर्ष ${photo.year || config.festivalYear}` : `Year ${photo.year || config.festivalYear}`}
                    </div>

                    {photo.category && (
                      <div className="absolute top-3 right-3 bg-gold-400 text-maroon-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {language === "mr" ? photo.category : (photo.categoryEn || photo.category)}
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200">
                      <ZoomIn className="w-3.5 h-3.5 text-gold-300" />
                      <span>{language === "mr" ? "पहा" : "View"}</span>
                    </div>
                  </div>
                )}

                {/* Photo Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FAF5EC]">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {language === "mr" ? photo.descMr : (photo.descEn || photo.descMr)}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-gold-200 flex items-center justify-between text-xs text-maroon-800 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === "mr" ? `वर्ष ${photo.year || config.festivalYear}` : `Year ${photo.year || config.festivalYear}`}</span>
                    </span>
                    <span className="text-gold-700 font-bold group-hover:text-maroon-900 transition flex items-center gap-1">
                      <span>{language === "mr" ? "विस्तारित पहा" : "View Details"}</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Full-screen Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full border-2 border-gold-400 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between p-4 bg-maroon-950 text-white border-b border-gold-500/40">
              <div className="flex items-center gap-2">
                {activePhoto.category && (
                  <span className="text-xs bg-gold-400 text-maroon-950 font-black px-2.5 py-0.5 rounded-full">
                    {language === "mr" ? activePhoto.category : (activePhoto.categoryEn || activePhoto.category)}
                  </span>
                )}
                <span className="text-xs text-gold-300 font-bold">
                  {language === "mr" ? `वर्ष ${activePhoto.year || config.festivalYear}` : `Year ${activePhoto.year || config.festivalYear}`}
                </span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1.5 rounded-full text-gold-300 hover:text-white hover:bg-maroon-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Photo Visual Box */}
            {activePhoto.imageUrl ? (
              <div className="max-h-80 w-full overflow-hidden bg-black flex items-center justify-center">
                <img src={activePhoto.imageUrl} alt={activePhoto.titleMr} className="max-h-80 object-contain" />
              </div>
            ) : (
              <div className={`h-64 bg-gradient-to-br ${activePhoto.accentColor || "from-amber-700 to-maroon-900"} flex flex-col items-center justify-center text-white p-6 relative`}>
                <Sparkles className="w-16 h-16 text-gold-300 mb-3 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-black text-gold-100 text-center font-heading leading-tight drop-shadow-lg">
                  {language === "mr" ? activePhoto.titleMr : (activePhoto.titleEn || activePhoto.titleMr)}
                </h3>
                <p className="text-xs text-gold-200 mt-2 font-medium">
                  {language === "mr" 
                    ? (config.mandalNameMr || "म्हाडा टॉवर्स गणेशोत्सव संकुल, पिंपरी वाघेरे") 
                    : (config.mandalNameEn || "MHADA Towers Ganesh Utsav Complex, Pimpri Waghere")}
                </p>
              </div>
            )}

            {/* Modal Description & Actions */}
            <div className="p-6 bg-gradient-to-b from-white to-[#FAF5EC]">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed mb-6 font-medium">
                {language === "mr" ? activePhoto.descMr : (activePhoto.descEn || activePhoto.descMr)}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold-200">
                <button
                  onClick={() => setActivePhoto(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-maroon-850 hover:bg-maroon-800 text-gold-200 font-bold text-xs rounded-xl transition"
                >
                  {t("close")}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;
