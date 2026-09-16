import React, { useState, useEffect, useRef } from "react";
import { 
  Receipt, PlusCircle, History, Settings, Sparkles, Download, 
  Printer, Eye, RefreshCw, Upload, Trash2, CheckCircle2, 
  AlertCircle, Search, Calendar, User, Home, Building2, 
  CreditCard, FileText, IndianRupee, ShieldCheck, X,
  Lock, Unlock, Archive, RotateCcw, ShieldAlert
} from "lucide-react";
import API from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Number to Words in Indian English
const numberToWordsIndian = (num) => {
  const n = Math.floor(Number(num));
  if (isNaN(n) || n <= 0) return "";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (number) => {
    if (number === 0) return "";
    let str = "";
    if (Math.floor(number / 10000000) > 0) {
      str += inWords(Math.floor(number / 10000000)) + " Crore ";
      number %= 10000000;
    }
    if (Math.floor(number / 100000) > 0) {
      str += inWords(Math.floor(number / 100000)) + " Lakh ";
      number %= 100000;
    }
    if (Math.floor(number / 1000) > 0) {
      str += inWords(Math.floor(number / 1000)) + " Thousand ";
      number %= 1000;
    }
    if (Math.floor(number / 100) > 0) {
      str += inWords(Math.floor(number / 100)) + " Hundred ";
      number %= 100;
    }
    if (number > 0) {
      if (number < 20) {
        str += a[number] + " ";
      } else {
        str += b[Math.floor(number / 10)] + " " + a[number % 10] + " ";
      }
    }
    return str.trim();
  };

  return `${inWords(n)} Rupees Only`;
};

// Official Building / Wing Options
const BUILDING_OPTIONS = [
  "G विंग - नंदादेवी / G Wing - Nandadevi",
  "H विंग - निलगिरी / H Wing - Nilgiri",
  "I विंग - ब्रह्मगिरी / I Wing - Brahmagiri",
  "J विंग - पूर्वांचल / J Wing - Purvanchal",
  "K विंग - गोवर्धन / K Wing - Govardhan",
  "Other"
];

const ReceiptManager = ({ config, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState("generate"); // 'generate' | 'history' | 'archive' | 'settings'

  // Settings State
  const [receiptSettings, setReceiptSettings] = useState({
    sachivSignatureUrl: "",
    receiptPrefix: "MT"
  });
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const signatureInputRef = useRef(null);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    residentName: "",
    flatNo: "",
    building: "G विंग - नंदादेवी / G Wing - Nandadevi",
    customBuilding: "",
    purpose: "श्री गणेशोत्सव वर्गणी (Ganesh Utsav Contribution)",
    customPurpose: "",
    amount: "",
    amountInWords: "",
    paymentDate: todayStr,
    paymentMode: "UPI",
    transactionRef: "",
    receiptNo: "",
    description: "Received with thanks towards Ganesh Utsav contribution from the resident for the auspicious festive celebration.",
    notes: ""
  });

  const [isNextNumberLoading, setIsNextNumberLoading] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // History State
  const [receiptsList, setReceiptsList] = useState([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Receipt Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);

  // Secure Complete Archive State
  const [isArchiveUnlocked, setIsArchiveUnlocked] = useState(false);
  const [archivePassword, setArchivePassword] = useState("");
  const [isUnlockingArchive, setIsUnlockingArchive] = useState(false);
  const [archiveUnlockError, setArchiveUnlockError] = useState("");
  const [archiveReceipts, setArchiveReceipts] = useState([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");
  const [archiveStatusFilter, setArchiveStatusFilter] = useState("all"); // 'all' | 'active' | 'archived'
  const [isRestoringReceipt, setIsRestoringReceipt] = useState(false);
  const [receiptToRestore, setReceiptToRestore] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Preview & Print State
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const receiptVoucherRef = useRef(null);

  // Autocomplete resident suggestions from previous receipts
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await API.get("/receipts/settings");
      if (res.data?.success && res.data.data) {
        setReceiptSettings(res.data.data);
      }
    } catch (err) {
      console.error("[ReceiptManager] Error fetching settings:", err);
    }
  };

  // Fetch Next Receipt Number
  const fetchNextReceiptNumber = async () => {
    setIsNextNumberLoading(true);
    try {
      const res = await API.get("/receipts/next-number");
      if (res.data?.success && res.data.nextReceiptNo) {
        setFormData((prev) => ({ ...prev, receiptNo: res.data.nextReceiptNo }));
      }
    } catch (err) {
      console.error("[ReceiptManager] Error fetching next receipt number:", err);
    } finally {
      setIsNextNumberLoading(false);
    }
  };

  // Fetch Receipt History
  const fetchReceiptsHistory = async (query = "") => {
    setIsLoadingReceipts(true);
    try {
      const res = await API.get(`/receipts?q=${encodeURIComponent(query)}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setReceiptsList(res.data.data);
        // Extract unique resident names for autocomplete
        const names = Array.from(new Set(res.data.data.map((r) => r.residentName).filter(Boolean)));
        setNameSuggestions(names);
      }
    } catch (err) {
      console.error("[ReceiptManager] Error fetching receipts history:", err);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchNextReceiptNumber();
    fetchReceiptsHistory();
  }, []);

  // Update Amount in Words automatically when Amount changes
  const handleAmountChange = (e) => {
    const val = e.target.value;
    const words = numberToWordsIndian(val);
    setFormData((prev) => ({
      ...prev,
      amount: val,
      amountInWords: words
    }));
  };

  // Handle AI Rewrite
  const handleAiRewrite = async () => {
    if (!formData.description || !formData.description.trim()) {
      if (onNotify) onNotify(isEn ? "Please enter description text first" : "कृपया आधी पावतीचा प्राथमिक मजकूर लिहा", "error");
      return;
    }

    setIsAiRewriting(true);
    try {
      const res = await API.post("/receipts/rewrite-description", {
        text: formData.description,
        residentName: formData.residentName,
        purpose: formData.purpose === "Other" ? formData.customPurpose : formData.purpose,
        amount: formData.amount,
        paymentDate: formData.paymentDate
      });

      if (res.data?.success && res.data.rewrittenText) {
        setFormData((prev) => ({ ...prev, description: res.data.rewrittenText }));
        if (onNotify) {
          onNotify(
            isEn ? "Text wording polished professionally by AI!" : "मजकूर AI द्वारे औपचारिक व व्यावसायिक भाषेत सुधारित केला!",
            "success"
          );
        }
      }
    } catch (err) {
      console.error("[ReceiptManager] AI rewrite error:", err);
      if (onNotify) {
        onNotify(
          isEn ? "AI polishing unavailable, preserved your wording." : "AI सेवा अनुपलब्ध, आपला मूळ मजकूर सुरक्षित ठेवण्यात आला.",
          "error"
        );
      }
    } finally {
      setIsAiRewriting(false);
    }
  };

  // Upload SACHIV Signature
  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSignature(true);
    const uploadData = new FormData();
    uploadData.append("image", file);
    uploadData.append("category", "signatures");

    try {
      const res = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success && res.data.url) {
        const newSigUrl = res.data.url;
        // Save to receipt settings
        const saveRes = await API.put("/receipts/settings", { sachivSignatureUrl: newSigUrl });
        if (saveRes.data?.success) {
          setReceiptSettings((prev) => ({ ...prev, sachivSignatureUrl: newSigUrl }));
          if (onNotify) onNotify(isEn ? "SACHIV digital signature uploaded and saved!" : "सचिव डिजिटल स्वाक्षरी यशस्वीरित्या जतन केली!", "success");
        }
      }
    } catch (err) {
      console.error("[ReceiptManager] Signature upload error:", err);
      if (onNotify) onNotify(isEn ? "Failed to upload signature." : "स्वाक्षरी अपलोड करताना त्रुटी आली.", "error");
    } finally {
      setIsUploadingSignature(false);
      if (signatureInputRef.current) signatureInputRef.current.value = "";
    }
  };

  // Remove Signature
  const handleRemoveSignature = async () => {
    try {
      const res = await API.put("/receipts/settings", { sachivSignatureUrl: "" });
      if (res.data?.success) {
        setReceiptSettings((prev) => ({ ...prev, sachivSignatureUrl: "" }));
        if (onNotify) onNotify(isEn ? "Signature removed." : "स्वाक्षरी काढून टाकण्यात आली.", "success");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Error removing signature", "error");
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.residentName.trim()) errors.residentName = "Resident name is required";
    if (!formData.flatNo.trim()) errors.flatNo = "Flat number is required";
    const bldg = formData.building === "Other" ? formData.customBuilding : formData.building;
    if (!bldg || !bldg.trim()) errors.building = "Building is required";
    const purp = formData.purpose === "Other" ? formData.customPurpose : formData.purpose;
    if (!purp || !purp.trim()) errors.purpose = "Receipt purpose is required";
    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) errors.amount = "Valid positive amount is required";
    if (!formData.paymentDate) errors.paymentDate = "Payment date is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Construct effective receipt object
  const getReceiptObject = () => {
    const effectiveBuilding = formData.building === "Other" ? formData.customBuilding : formData.building;
    const effectivePurpose = formData.purpose === "Other" ? formData.customPurpose : formData.purpose;
    return {
      receiptNo: formData.receiptNo,
      residentName: formData.residentName.trim(),
      flatNo: formData.flatNo.trim(),
      building: effectiveBuilding.trim(),
      purpose: effectivePurpose.trim(),
      amount: Number(formData.amount),
      amountInWords: formData.amountInWords || numberToWordsIndian(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMode: formData.paymentMode,
      transactionRef: formData.transactionRef.trim(),
      description: formData.description.trim(),
      notes: formData.notes.trim(),
      sachivSignatureUrl: receiptSettings.sachivSignatureUrl || "",
      societyNameMr: config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ",
      societyNameEn: config?.mandalNameEn || "MHADA Towers Utsav Mandal",
      regNo: config?.regNo || "१२४३/२०२५ - पुणे",
      addressMr: config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७"
    };
  };

  // Handle Preview
  const handleOpenPreview = () => {
    if (!validateForm()) {
      if (onNotify) onNotify(isEn ? "Please fill all required fields correctly" : "कृपया सर्व आवश्यक माहिती अचूक भरा", "error");
      return;
    }
    const receiptObj = getReceiptObject();
    setPreviewReceipt(receiptObj);
    setIsPreviewModalOpen(true);
  };

  // Save Receipt to Backend
  const handleSaveReceipt = async () => {
    if (!validateForm()) {
      if (onNotify) onNotify(isEn ? "Please fill all required fields correctly" : "कृपया सर्व आवश्यक माहिती अचूक भरा", "error");
      return null;
    }

    setIsSavingReceipt(true);
    try {
      const receiptObj = getReceiptObject();
      const res = await API.post("/receipts", receiptObj);
      if (res.data?.success && res.data.data) {
        if (onNotify) onNotify(isEn ? "Receipt saved successfully!" : "पावती यशस्वीरीत्या नोंदवली गेली!", "success");
        fetchReceiptsHistory();
        fetchNextReceiptNumber();
        return res.data.data;
      }
    } catch (err) {
      console.error("[ReceiptManager] Error saving receipt:", err);
      const msg = err.response?.data?.message || "Failed to save receipt";
      if (onNotify) onNotify(msg, "error");
    } finally {
      setIsSavingReceipt(false);
    }
    return null;
  };

  // Generate & Download PDF with proportional A4 fit (Never crops bottom/signature)
  const handleDownloadPdf = async (receiptData) => {
    const targetReceipt = receiptData || previewReceipt;
    if (!targetReceipt) return;

    setIsGeneratingPdf(true);
    try {
      if (!isPreviewModalOpen) {
        setPreviewReceipt(targetReceipt);
        setIsPreviewModalOpen(true);
        await new Promise((r) => setTimeout(r, 200));
      }

      const element = receiptVoucherRef.current;
      if (!element) throw new Error("Receipt element not found");

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10; // 10mm margins on all sides
      const maxW = pageWidth - (margin * 2); // 190mm
      const maxH = pageHeight - (margin * 2); // 277mm

      let renderW = maxW;
      let renderH = (canvas.height * renderW) / canvas.width;

      // Scale down proportionally if height exceeds A4 printable area
      if (renderH > maxH) {
        renderH = maxH;
        renderW = (canvas.width * renderH) / canvas.height;
      }

      const xOffset = margin + (maxW - renderW) / 2;
      const yOffset = margin + (maxH - renderH) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, renderW, renderH, undefined, "FAST");
      const safeFilename = `Receipt_${(targetReceipt.receiptNo || "MT").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      pdf.save(safeFilename);

      if (onNotify) onNotify(isEn ? `Downloaded ${safeFilename}` : `पावती PDF डाऊनलोड झाली: ${safeFilename}`, "success");
    } catch (err) {
      console.error("[ReceiptManager] PDF generation error:", err);
      if (onNotify) onNotify(isEn ? "Error generating PDF" : "PDF तयार करताना त्रुटी आली", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate, Save and Download in one flow
  const handleGenerateAndDownload = async () => {
    const saved = await handleSaveReceipt();
    if (saved) {
      setPreviewReceipt(saved);
      setIsPreviewModalOpen(true);
      setTimeout(() => {
        handleDownloadPdf(saved);
      }, 300);
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Reset Form
  const handleResetForm = () => {
    setFormData({
      residentName: "",
      flatNo: "",
      building: "G विंग - नंदादेवी / G Wing - Nandadevi",
      customBuilding: "",
      purpose: "श्री गणेशोत्सव वर्गणी (Ganesh Utsav Contribution)",
      customPurpose: "",
      amount: "",
      amountInWords: "",
      paymentDate: todayStr,
      paymentMode: "UPI",
      transactionRef: "",
      receiptNo: "",
      description: "Received with thanks towards Ganesh Utsav contribution from the resident for the auspicious festive celebration.",
      notes: ""
    });
    setValidationErrors({});
    fetchNextReceiptNumber();
  };

  // Fetch Complete Archive Receipts
  const fetchArchiveReceipts = async (query = archiveSearchQuery, status = archiveStatusFilter) => {
    setIsLoadingArchive(true);
    try {
      const res = await API.get(`/receipts/archive?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setArchiveReceipts(res.data.data);
      }
    } catch (err) {
      console.error("[ReceiptManager] Archive fetch error:", err);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  // Confirm Delete Receipt (Moves to Secure Archive)
  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;
    setIsDeletingReceipt(true);
    try {
      const res = await API.put(`/receipts/${receiptToDelete._id || receiptToDelete.receiptNo}/archive`);
      if (res.data?.success) {
        if (onNotify) {
          onNotify(
            isEn 
              ? `Receipt ${receiptToDelete.receiptNo} moved to Secure Archive.` 
              : `पावती ${receiptToDelete.receiptNo} सक्रिय यादीतून काढून सुरक्षित आर्काइव्हमध्ये हलवली.`,
            "success"
          );
        }
        setIsDeleteModalOpen(false);
        setReceiptToDelete(null);
        fetchReceiptsHistory();
        if (isArchiveUnlocked) {
          fetchArchiveReceipts();
        }
      }
    } catch (err) {
      console.error("[ReceiptManager] Delete error:", err);
      const msg = err.response?.data?.message || (isEn ? "Failed to delete receipt." : "पावती हटवताना त्रुटी आली.");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setIsDeletingReceipt(false);
    }
  };

  // Unlock Archive with Backend Verification
  const handleUnlockArchive = async (e) => {
    if (e) e.preventDefault();
    if (!archivePassword) {
      setArchiveUnlockError(isEn ? "Please enter admin password" : "कृपया ॲडमिन पासवर्ड प्रविष्ट करा");
      return;
    }
    setIsUnlockingArchive(true);
    setArchiveUnlockError("");
    try {
      const res = await API.post("/receipts/archive/unlock", { password: archivePassword });
      if (res.data?.success) {
        setIsArchiveUnlocked(true);
        setArchivePassword("");
        fetchArchiveReceipts("", "all");
        if (onNotify) {
          onNotify(
            isEn ? "Complete Receipt Archive unlocked!" : "संपूर्ण पावती संग्रह अनलॉक झाला!",
            "success"
          );
        }
      }
    } catch (err) {
      console.error("[ReceiptManager] Archive unlock error:", err);
      const msg = err.response?.data?.message || (isEn ? "Invalid password" : "चुकीचा पासवर्ड");
      setArchiveUnlockError(msg);
    } finally {
      setIsUnlockingArchive(false);
    }
  };

  // Confirm Restore Receipt from Archive
  const handleConfirmRestore = async () => {
    if (!receiptToRestore) return;
    setIsRestoringReceipt(true);
    try {
      const res = await API.put(`/receipts/archive/${receiptToRestore._id || receiptToRestore.receiptNo}/restore`);
      if (res.data?.success) {
        if (onNotify) {
          onNotify(
            isEn 
              ? `Receipt ${receiptToRestore.receiptNo} restored to active history.` 
              : `पावती ${receiptToRestore.receiptNo} पुन्हा सक्रिय यादीत पुनर्संचयित केली.`,
            "success"
          );
        }
        setIsRestoreModalOpen(false);
        setReceiptToRestore(null);
        fetchReceiptsHistory();
        fetchArchiveReceipts();
      }
    } catch (err) {
      console.error("[ReceiptManager] Restore error:", err);
      const msg = err.response?.data?.message || (isEn ? "Failed to restore receipt." : "पावती पुनर्संचयित करताना त्रुटी आली.");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setIsRestoringReceipt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EC] rounded-2xl border-1.5 border-gold-300 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-800 text-gold-300 flex items-center justify-center shadow-md">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-maroon-950">
                {isEn ? "Resident Receipt Generator" : "रहिवासी पावती जनरेटर"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                {isEn 
                  ? "Generate, preview, store, and download official payment and donation receipts." 
                  : "देणगी व वर्गणीसाठी अधिकृत पावती तयार करा, स्वाक्षरी जोडा व PDF डाऊनलोड करा."}
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 bg-gold-100/60 p-1.5 rounded-xl border border-gold-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "generate"
                  ? "bg-maroon-900 text-gold-200 shadow-xs"
                  : "text-maroon-900 hover:bg-white/80"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isEn ? "Generate Receipt" : "नवीन पावती"}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                fetchReceiptsHistory();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-maroon-900 text-gold-200 shadow-xs"
                  : "text-maroon-900 hover:bg-white/80"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isEn ? "Receipt History" : "पावती इतिहास"}</span>
              <span className="bg-gold-300/60 text-maroon-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {receiptsList.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("archive");
                if (isArchiveUnlocked) fetchArchiveReceipts();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "archive"
                  ? "bg-maroon-900 text-gold-200 shadow-xs"
                  : "text-maroon-900 hover:bg-white/80"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isEn ? "Complete Archive" : "सर्व पावती संग्रह"}</span>
              {isArchiveUnlocked ? (
                <Unlock className="w-3 h-3 text-emerald-600" />
              ) : (
                <Lock className="w-3 h-3 text-amber-700" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-maroon-900 text-gold-200 shadow-xs"
                  : "text-maroon-900 hover:bg-white/80"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isEn ? "Signature Settings" : "स्वाक्षरी व्यवस्थापन"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GENERATE RECEIPT */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols on large) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border-1.5 border-gold-300 shadow-sm p-5 sm:p-6 space-y-5">
              
              {/* Receipt Number & Date Header Bar */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-gold-50/50 rounded-xl border border-gold-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                    {isEn ? "Receipt No:" : "पावती क्रमांक:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.receiptNo}
                      onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value.toUpperCase() })}
                      className="px-3 py-1 bg-white border border-gold-400 rounded-lg text-sm font-mono font-bold text-maroon-950 focus:outline-hidden focus:ring-2 focus:ring-gold-500 w-36"
                      placeholder="MT/2026/00001"
                    />
                    <button
                      type="button"
                      onClick={fetchNextReceiptNumber}
                      disabled={isNextNumberLoading}
                      title="Refresh next receipt number"
                      className="p-1.5 text-maroon-800 hover:bg-gold-200/60 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isNextNumberLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-maroon-800" />
                  <span className="text-xs font-bold text-maroon-900">
                    {isEn ? "Payment Date:" : "दिनांक:"}
                  </span>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="px-3 py-1 bg-white border border-gold-400 rounded-lg text-xs font-bold text-maroon-950 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 1. RESIDENT INFORMATION */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-maroon-950 uppercase tracking-wider flex items-center gap-2 border-b border-gold-200 pb-2">
                  <User className="w-4 h-4 text-maroon-800" />
                  {isEn ? "1. Resident Information" : "१. रहिवाशांची माहिती"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Resident Name with Autocomplete */}
                  <div className="sm:col-span-2 relative">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isEn ? "Resident Name *" : "रहिवाशाचे नाव *"}
                    </label>
                    <input
                      type="text"
                      value={formData.residentName}
                      onChange={(e) => {
                        setFormData({ ...formData, residentName: e.target.value });
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder={isEn ? "e.g. Rahul Sharma" : "उदा. राहुल शर्मा / सचिन पाटील"}
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden ${
                        validationErrors.residentName ? "border-red-500 bg-red-50/20" : "border-stone-300"
                      }`}
                    />
                    {validationErrors.residentName && (
                      <p className="text-[11px] text-red-600 mt-1">{validationErrors.residentName}</p>
                    )}

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && nameSuggestions.length > 0 && formData.residentName && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gold-300 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                        {nameSuggestions
                          .filter((name) => name.toLowerCase().includes(formData.residentName.toLowerCase()))
                          .slice(0, 5)
                          .map((suggestedName, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, residentName: suggestedName })}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gold-50 text-stone-800 flex items-center justify-between border-b border-stone-100 last:border-b-0"
                            >
                              <span>{suggestedName}</span>
                              <span className="text-[10px] text-stone-400">Previously entered</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Flat No */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isEn ? "Flat Number *" : "फ्लॅट क्रमांक *"}
                    </label>
                    <input
                      type="text"
                      value={formData.flatNo}
                      onChange={(e) => setFormData({ ...formData, flatNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. G-1102 / 402"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden ${
                        validationErrors.flatNo ? "border-red-500 bg-red-50/20" : "border-stone-300"
                      }`}
                    />
                    {validationErrors.flatNo && (
                      <p className="text-[11px] text-red-600 mt-1">{validationErrors.flatNo}</p>
                    )}
                  </div>
                </div>

                {/* Building / Wing Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isEn ? "Building / Wing Name *" : "इमारत / विंगचे नाव *"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                    >
                      {BUILDING_OPTIONS.map((bldg, idx) => (
                        <option key={idx} value={bldg}>
                          {bldg === "Other" ? (isEn ? "Other / Custom Building" : "इतर इमारत / Custom Building") : bldg}
                        </option>
                      ))}
                    </select>

                    {formData.building === "Other" && (
                      <input
                        type="text"
                        value={formData.customBuilding}
                        onChange={(e) => setFormData({ ...formData, customBuilding: e.target.value })}
                        placeholder="Enter custom building/wing name"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-gold-400 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                      />
                    )}
                  </div>
                  {validationErrors.building && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.building}</p>
                  )}
                </div>
              </div>

              {/* 2. PAYMENT DETAILS */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-maroon-950 uppercase tracking-wider flex items-center gap-2 border-b border-gold-200 pb-2">
                  <CreditCard className="w-4 h-4 text-maroon-800" />
                  {isEn ? "2. Receipt Payment Information" : "२. पावती देय तपशील"}
                </h3>

                {/* Purpose Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isEn ? "Receipt For / Purpose *" : "पावती कशासाठी (Receipt For) *"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                    >
                      <option value="श्री गणेशोत्सव वर्गणी (Ganesh Utsav Contribution)">
                        श्री गणेशोत्सव वर्गणी (Ganesh Utsav Contribution)
                      </option>
                      <option value="ऐच्छिक देणगी (Voluntary Donation)">
                        ऐच्छिक देणगी (Voluntary Donation)
                      </option>
                      <option value="मासिक मेंटेनन्स (Monthly Maintenance)">
                        मासिक मेंटेनन्स (Monthly Maintenance)
                      </option>
                      <option value="सोसायटी चार्जेस (Society Charges)">
                        सोसायटी चार्जेस (Society Charges)
                      </option>
                      <option value="उत्सव कार्यक्रम सहभाग (Festival Event Contribution)">
                        उत्सव कार्यक्रम सहभाग (Festival Event Contribution)
                      </option>
                      <option value="महाप्रसाद सेवा (Maha Prasad Seva)">
                        महाप्रसाद सेवा (Maha Prasad Seva)
                      </option>
                      <option value="आरती यजमान देणगी (Maha Aarti Sponsorship)">
                        आरती यजमान देणगी (Maha Aarti Sponsorship)
                      </option>
                      <option value="Other">Other (इतर कारण - लिहा)</option>
                    </select>

                    {formData.purpose === "Other" && (
                      <input
                        type="text"
                        value={formData.customPurpose}
                        onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                        placeholder="Enter specific receipt purpose"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-gold-400 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                      />
                    )}
                  </div>
                  {validationErrors.purpose && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.purpose}</p>
                  )}
                </div>

                {/* Amount, Mode & Transaction Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isEn ? "Amount (₹) *" : "रक्कम (₹) *"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        placeholder="5000"
                        className={`w-full pl-8 pr-3 py-2 text-sm font-bold bg-white border rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden ${
                          validationErrors.amount ? "border-red-500 bg-red-50/20" : "border-stone-300"
                        }`}
                      />
                    </div>
                    {validationErrors.amount && (
                      <p className="text-[11px] text-red-600 mt-1">{validationErrors.amount}</p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isEn ? "Payment Mode" : "पेमेंट पद्धत"}
                    </label>
                    <select
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash (रोख रक्कम)</option>
                      <option value="Cheque">Cheque (धनादेश)</option>
                      <option value="NEFT/RTGS">NEFT / RTGS (बँक ट्रान्सफर)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Transaction / Reference No */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isEn ? "Transaction / Ref No (Optional)" : "व्यवहार / संदर्भ क्र. (ऐच्छिक)"}
                    </label>
                    <input
                      type="text"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      placeholder="e.g. UPI/62718291..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Amount in words live badge */}
                {formData.amountInWords && (
                  <div className="p-2.5 bg-gold-50 border border-gold-200 rounded-xl text-xs text-maroon-900 flex items-center gap-2">
                    <span className="font-bold text-[10px] uppercase bg-gold-300/80 px-1.5 py-0.5 rounded text-maroon-950">In Words:</span>
                    <span className="font-medium italic">{formData.amountInWords}</span>
                  </div>
                )}
              </div>

              {/* 3. DESCRIPTION TEXT BOX & AI REDESIGN */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-200 pb-2">
                  <h3 className="text-sm font-bold text-maroon-950 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-maroon-800" />
                    {isEn ? "3. Receipt Description Wording" : "३. पावती तपशील मजकूर"}
                  </h3>

                  {/* Redesign Text with AI button */}
                  <button
                    type="button"
                    onClick={handleAiRewrite}
                    disabled={isAiRewriting}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-600 via-amber-500 to-gold-500 hover:from-amber-700 hover:to-gold-600 text-white rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-60"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiRewriting ? "animate-spin" : ""}`} />
                    <span>{isAiRewriting ? (isEn ? "Refining..." : "सुधारित करत आहे...") : (isEn ? "Redesign Text with AI" : "Redesign Text with AI (मजकूर सुधारा)")}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Received with thanks towards Ganesh Utsav contribution from the resident..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-stone-500 leading-tight">
                  {isEn 
                    ? "Write description in your own words, or click 'Redesign Text with AI' to refine into polite official wording." 
                    : "आपल्या शब्दांत मजकूर लिहा किंवा औपचारिक व्यावसायिक भाषेसाठी 'Redesign Text with AI' वर क्लिक करा."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gold-200 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition-colors"
                >
                  {isEn ? "Reset Form" : "फॉर्म रीसेट करा"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-stone-800 hover:bg-stone-900 text-gold-200 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isEn ? "Preview Receipt" : "पावती पूर्वावलोकन (Preview)"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAndDownload}
                  disabled={isSavingReceipt || isGeneratingPdf}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-maroon-900 to-maroon-800 hover:from-maroon-950 hover:to-maroon-850 text-gold-300 border border-gold-400/80 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-60"
                >
                  <Download className={`w-4 h-4 ${isGeneratingPdf ? "animate-bounce" : ""}`} />
                  <span>
                    {isGeneratingPdf 
                      ? (isEn ? "Generating PDF..." : "PDF तयार करत आहे...") 
                      : (isEn ? "Generate & Download PDF" : "पावती तयार करा व PDF डाऊनलोड करा")}
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Sidebar: Quick Status & Signature Preview (1 col) */}
          <div className="space-y-6">
            {/* Signature Status Card */}
            <div className="bg-white rounded-2xl border-1.5 border-gold-300 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gold-200 pb-2">
                <h4 className="text-xs font-bold text-maroon-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {isEn ? "SACHIV Signature Status" : "सचिव स्वाक्षरी स्थिती"}
                </h4>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="text-[11px] text-amber-700 hover:underline font-bold"
                >
                  {isEn ? "Manage" : "बदला"}
                </button>
              </div>

              {receiptSettings.sachivSignatureUrl ? (
                <div className="p-3 bg-gold-50/50 rounded-xl border border-gold-200 text-center space-y-2">
                  <div className="h-20 bg-white rounded-lg border border-stone-200 p-2 flex items-center justify-center">
                    <img
                      src={receiptSettings.sachivSignatureUrl}
                      alt="SACHIV Digital Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isEn ? "Active & Linked to all receipts" : "सक्रिय - सर्व पावत्यांवर आपोआप येईल"}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-amber-900">
                    {isEn ? "No SACHIV signature uploaded" : "सचिव स्वाक्षरी अपलोड केलेली नाही"}
                  </p>
                  <p className="text-[11px] text-amber-700 leading-tight">
                    {isEn ? "Upload once in settings to automatically appear on every receipt." : "सेटिंग्जमध्ये एकदाच अपलोड करा."}
                  </p>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {isEn ? "Upload Signature Now" : "आता स्वाक्षरी अपलोड करा"}
                  </button>
                </div>
              )}
            </div>

            {/* Society Branding Verification */}
            <div className="bg-white rounded-2xl border-1.5 border-gold-300 p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-maroon-950 uppercase tracking-wider border-b border-gold-200 pb-2">
                {isEn ? "Society Branding" : "मंडळ अधिकृत माहिती"}
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Mandal Logo"
                  className="w-12 h-12 rounded-lg object-cover border border-gold-300 shadow-xs"
                />
                <div>
                  <h5 className="text-xs font-bold text-maroon-900">
                    {config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ"}
                  </h5>
                  <p className="text-[10px] text-stone-500">
                    Reg: {config?.regNo || "१२४३/२०२५ - पुणे"}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {config?.addressMr || "पिंपरी वाघेरे, पुणे - ४११०१७"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIPT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border-1.5 border-gold-300 shadow-sm p-5 sm:p-6 space-y-5">
          {/* History Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-heading text-maroon-950">
                {isEn ? "Previously Generated Receipts" : "यापूर्वी तयार केलेल्या पावत्या"}
              </h3>
              <p className="text-xs text-stone-500">
                {isEn ? "Search by resident name, flat number, or receipt number" : "रहिवाशाचे नाव, फ्लॅट किंवा पावती क्रमांकाने शोधा"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchReceiptsHistory(e.target.value);
                  }}
                  placeholder={isEn ? "Search receipts..." : "पावती शोधा..."}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => fetchReceiptsHistory(searchQuery)}
                className="p-2 border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-600"
                title="Refresh list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReceipts ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gold-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-maroon-900 to-maroon-800 text-gold-200 uppercase font-heading text-[11px]">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Resident</th>
                  <th className="px-4 py-3">Flat & Wing</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {isLoadingReceipts ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gold-600" />
                      Loading receipts...
                    </td>
                  </tr>
                ) : receiptsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                      {isEn ? "No receipts generated yet." : "अद्याप कोणतीही पावती तयार केलेली नाही."}
                    </td>
                  </tr>
                ) : (
                  receiptsList.map((rcpt) => (
                    <tr key={rcpt._id || rcpt.receiptNo} className="hover:bg-gold-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-maroon-950">
                        {rcpt.receiptNo}
                      </td>
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                        {rcpt.paymentDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-900">
                        {rcpt.residentName}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {rcpt.flatNo} ({rcpt.building})
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        <span className="bg-gold-100/70 text-maroon-950 px-2 py-0.5 rounded text-[11px] font-medium">
                          {rcpt.purpose}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">
                        ₹{Number(rcpt.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {rcpt.paymentMode}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPreviewReceipt(rcpt);
                            setIsPreviewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-gold-100 text-maroon-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewReceipt(rcpt);
                            handleDownloadPdf(rcpt);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-maroon-900 hover:bg-maroon-950 text-gold-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            setReceiptToDelete(rcpt);
                            setIsDeleteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          title={isEn ? "Move to Secure Archive" : "सुरक्षित आर्काइव्हमध्ये हलवा"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isEn ? "Delete" : "हटवा"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECURE COMPLETE RECEIPT ARCHIVE (Password Protected) */}
      {activeTab === "archive" && (
        <div className="bg-white rounded-2xl border-1.5 border-gold-300 p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-maroon-800" />
                <h3 className="text-lg font-bold font-heading text-maroon-950">
                  {isEn ? "Complete Receipt Archive (Audit Safe)" : "सुरक्षित संपूर्ण पावती संग्रह (Audit Archive)"}
                </h3>
                {isArchiveUnlocked ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Unlock className="w-2.5 h-2.5" /> Unlocked
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Password Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isEn 
                  ? "Permanent audit vault for all generated receipts, including soft-deleted ones with restore capability."
                  : "सर्व तयार केलेल्या व हटवलेल्या पावत्यांचा सुरक्षित संग्रह. येथून कोणतीही पावती पूर्ववत (Restore) करता येते."}
              </p>
            </div>

            {/* Lock / Relock Button if unlocked */}
            {isArchiveUnlocked && (
              <button
                type="button"
                onClick={() => {
                  setIsArchiveUnlocked(false);
                  setArchivePassword("");
                  if (onNotify) onNotify(isEn ? "Archive locked." : "संग्रह सुरक्षितपणे लॉक केला.", "info");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-maroon-900 border border-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                <Lock className="w-3.5 h-3.5 text-maroon-800" />
                <span>{isEn ? "Lock Archive" : "आर्काइव्ह लॉक करा"}</span>
              </button>
            )}
          </div>

          {/* IF LOCKED: PASSWORD ENTRY SCREEN */}
          {!isArchiveUnlocked ? (
            <div className="max-w-md mx-auto my-8 p-6 bg-gradient-to-br from-amber-50/50 via-white to-gold-50/40 rounded-2xl border-2 border-gold-300 shadow-md text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-maroon-900 to-maroon-800 text-gold-300 flex items-center justify-center mx-auto shadow-md">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold font-heading text-maroon-950">
                  {isEn ? "Enter Admin Password to Unlock" : "सुरक्षित संग्रह उघडण्यासाठी ॲडमिन पासवर्ड टाका"}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {isEn 
                    ? "Access to deleted receipts and the complete society audit log requires administrative verification." 
                    : "हटवलेल्या पावत्या व संपूर्ण सोसायटी ऑडिट संग्रह पाहण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे."}
                </p>
              </div>

              <form onSubmit={handleUnlockArchive} className="space-y-3 pt-2">
                <div>
                  <input
                    type="password"
                    value={archivePassword}
                    onChange={(e) => {
                      setArchivePassword(e.target.value);
                      setArchiveUnlockError("");
                    }}
                    placeholder={isEn ? "Enter society admin password..." : "ॲडमिन पासवर्ड प्रविष्ट करा..."}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gold-400 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden text-center font-mono"
                    autoFocus
                  />
                  {archiveUnlockError && (
                    <p className="text-xs text-red-600 mt-1 font-bold">{archiveUnlockError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUnlockingArchive || !archivePassword}
                  className="w-full py-2.5 bg-gradient-to-r from-maroon-900 to-maroon-800 hover:from-maroon-950 hover:to-maroon-900 text-gold-200 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isUnlockingArchive ? "Verifying..." : (isEn ? "Unlock Complete Archive" : "संग्रह अनलॉक करा")}</span>
                </button>
              </form>
            </div>
          ) : (
            /* IF UNLOCKED: ARCHIVE SEARCH, FILTER & TABLE */
            <div className="space-y-4">
              
              {/* Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gold-50/60 p-3 rounded-xl border border-gold-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-maroon-900 whitespace-nowrap">
                    {isEn ? "Filter Status:" : "स्थिती निवडा:"}
                  </span>
                  <select
                    value={archiveStatusFilter}
                    onChange={(e) => {
                      setArchiveStatusFilter(e.target.value);
                      fetchArchiveReceipts(archiveSearchQuery, e.target.value);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-gold-300 rounded-lg focus:outline-hidden text-maroon-950"
                  >
                    <option value="all">{isEn ? "All Records (Active & Archived)" : "सर्व नोंदी (सक्रिय व हटवलेल्या)"}</option>
                    <option value="archived">{isEn ? "Archived / Deleted Only" : "केवळ हटवलेल्या / संग्रहित"}</option>
                    <option value="active">{isEn ? "Active Only" : "केवळ सक्रिय"}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-grow sm:max-w-md">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={archiveSearchQuery}
                      onChange={(e) => {
                        setArchiveSearchQuery(e.target.value);
                        fetchArchiveReceipts(e.target.value, archiveStatusFilter);
                      }}
                      placeholder={isEn ? "Search by resident, flat, receipt no, purpose..." : "नाव, फ्लॅट, पावती क्र, कारण शोधा..."}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchArchiveReceipts(archiveSearchQuery, archiveStatusFilter)}
                    className="p-2 border border-gold-300 bg-white hover:bg-gold-100 rounded-xl text-maroon-900 transition-colors cursor-pointer"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingArchive ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Archive Table */}
              <div className="overflow-x-auto rounded-xl border border-gold-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-850 text-gold-200 uppercase font-heading text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Receipt No</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Resident</th>
                      <th className="px-4 py-3">Flat & Wing</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Archive Details</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {isLoadingArchive ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-stone-500">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gold-600" />
                          Loading complete archive...
                        </td>
                      </tr>
                    ) : archiveReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-stone-500">
                          {isEn ? "No records found matching filter." : "कोणतीही नोंद आढळली नाही."}
                        </td>
                      </tr>
                    ) : (
                      archiveReceipts.map((rcpt) => (
                        <tr 
                          key={rcpt._id || rcpt.receiptNo} 
                          className={`transition-colors ${rcpt.isArchived ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-gold-50/50"}`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-maroon-950">
                            {rcpt.receiptNo}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {rcpt.isArchived ? (
                              <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {isEn ? "Archived / Deleted" : "हटवलेली / संग्रहित"}
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {isEn ? "Active" : "सक्रिय"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {rcpt.paymentDate}
                          </td>
                          <td className="px-4 py-3 font-bold text-stone-900">
                            {rcpt.residentName}
                          </td>
                          <td className="px-4 py-3 text-stone-700">
                            {rcpt.flatNo} ({rcpt.building})
                          </td>
                          <td className="px-4 py-3 text-stone-700">
                            <span className="bg-gold-100/70 text-maroon-950 px-2 py-0.5 rounded text-[11px] font-medium">
                              {rcpt.purpose}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">
                            ₹{Number(rcpt.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-stone-500 text-[11px] whitespace-nowrap">
                            {rcpt.isArchived ? (
                              <span>
                                {rcpt.archivedAt ? new Date(rcpt.archivedAt).toLocaleDateString() : "Yes"}
                                {rcpt.archivedBy ? ` (${rcpt.archivedBy})` : ""}
                              </span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setPreviewReceipt(rcpt);
                                setIsPreviewModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-gold-100 text-maroon-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => {
                                setPreviewReceipt(rcpt);
                                handleDownloadPdf(rcpt);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-maroon-900 hover:bg-maroon-950 text-gold-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            {rcpt.isArchived && (
                              <button
                                onClick={() => {
                                  setReceiptToRestore(rcpt);
                                  setIsRestoreModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                title={isEn ? "Restore to active history" : "सक्रिय यादीत पूर्ववत करा"}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{isEn ? "Restore" : "पुनर्संचयित"}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: DIGITAL SIGNATURE SETTINGS */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border-1.5 border-gold-300 p-6 space-y-6 shadow-sm">
          <div className="border-b border-gold-200 pb-3">
            <h3 className="text-lg font-bold font-heading text-maroon-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-maroon-800" />
              {isEn ? "Digital Signature Management" : "अधिकृत डिजिटल स्वाक्षरी व्यवस्थापन"}
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {isEn 
                ? "Upload the official digital signature for authorized receipt vouchers. Once saved, it will automatically appear on all generated receipt vouchers." 
                : "मंडळाच्या अधिकृत स्वाक्षरीचा फोटो येथे अपलोड करा. ही स्वाक्षरी सर्व पावत्यांवर आपोआप येईल."}
            </p>
          </div>

          {/* Current Signature Display */}
          <div className="p-6 bg-gradient-to-br from-amber-50/40 via-white to-gold-50/30 rounded-2xl border-2 border-dashed border-gold-300 text-center space-y-4">
            {receiptSettings.sachivSignatureUrl ? (
              <div className="space-y-4">
                <div className="inline-block p-4 bg-white rounded-xl border border-gold-300 shadow-sm">
                  <img
                    src={receiptSettings.sachivSignatureUrl}
                    alt="Current Digital Signature"
                    className="max-h-28 max-w-xs object-contain mx-auto"
                  />
                  <div className="mt-2 pt-2 border-t border-stone-200 text-center">
                    <span className="text-xs font-bold text-maroon-900">
                      सचिव / अधिकृत स्वाक्षरी
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    disabled={isUploadingSignature}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingSignature ? "Uploading..." : (isEn ? "Replace Signature" : "स्वाक्षरी बदला")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isEn ? "Remove Signature" : "काढून टाका"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-16 h-16 rounded-full bg-gold-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-maroon-950">
                    {isEn ? "Upload Digital Signature Image" : "डिजिटल स्वाक्षरी फोटो निवडा"}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Supports PNG, JPG, SVG, WEBP (Transparent background recommended)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={isUploadingSignature}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-900 hover:bg-maroon-950 text-gold-300 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingSignature ? "Uploading..." : (isEn ? "Upload Signature Image" : "स्वाक्षरी फोटो अपलोड करा")}</span>
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSignatureUpload}
            />
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-800">
              💡 {isEn ? "Signature Storage & Security Note:" : "स्वाक्षरी जतन व सुरक्षा टीप:"}
            </p>
            <p>
              {isEn 
                ? "The signature is stored securely in the society's internal storage and will NEVER be shown on the public website. It appears strictly on authorized admin-generated PDF receipts." 
                : "स्वाक्षरी केवळ अधिकृत ॲडमिनद्वारे तयार केल्या जाणाऱ्या पावतीवरच दिसते; ती सार्वजनिक वेबसाईटवर कधीही प्रदर्शित केली जात नाही."}
            </p>
          </div>
        </div>
      )}

      {/* MODAL 1: RECEIPT PREVIEW & PDF CONTAINER (Fully Enclosed Inside Borders & A4 Proportionate) */}
      {isPreviewModalOpen && previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border-2 border-gold-400 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-150">
            
            {/* Modal Actions Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-850 text-gold-200 flex items-center justify-between flex-shrink-0 shadow-xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-heading">
                <Receipt className="w-4 h-4 text-gold-400" />
                <span>{isEn ? "Official Receipt Voucher Preview" : "अधिकृत पावती पूर्वावलोकन"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? "Print" : "प्रिंट"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewReceipt)}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-400 hover:bg-gold-500 text-maroon-950 rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? "Generating..." : (isEn ? "Download PDF" : "PDF डाऊनलोड")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg text-gold-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100/80 flex justify-center items-start">
              
              {/* THE OFFICIAL RECEIPT VOUCHER (This DOM node is captured for PDF) */}
              <div
                ref={receiptVoucherRef}
                id="society-official-receipt-voucher"
                className="w-full max-w-[640px] bg-white border-2 border-maroon-900 p-5 sm:p-7 rounded-xl shadow-md text-maroon-950 font-body relative box-border"
                style={{ backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              >
                {/* Inner Decorative Gold Border */}
                <div 
                  className="border-1.5 border-gold-500 p-4 sm:p-6 rounded-lg relative box-border bg-white flex flex-col space-y-3.5"
                  style={{ boxSizing: "border-box" }}
                >
                  
                  {/* Top Society Header */}
                  <div className="flex items-center justify-between gap-4 border-b-2 border-maroon-900 pb-3">
                    <img
                      src="/logo.jpg"
                      alt="Society Logo"
                      className="w-20 h-20 sm:w-22 sm:h-22 object-cover rounded-lg border border-gold-400 flex-shrink-0 shadow-xs"
                    />
                    <div className="text-center flex-grow">
                      <div className="text-xs font-bold text-amber-700 tracking-widest uppercase">
                        ॥ श्री गणेशाय नमः ॥
                      </div>
                      <h1 className="text-lg sm:text-xl font-black font-heading text-maroon-950 leading-tight">
                        {previewReceipt.societyNameMr || config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ"}
                      </h1>
                      <h2 className="text-xs sm:text-sm font-bold text-maroon-800 tracking-wide font-heading">
                        {previewReceipt.societyNameEn || config?.mandalNameEn || "MHADA Towers Utsav Mandal"}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-stone-600 mt-0.5">
                        {previewReceipt.addressMr || config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७"}
                      </p>
                      <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                        धर्मादाय नोंदणी क्र. {previewReceipt.regNo || config?.regNo || "१२४३/२०२५ - पुणे"}
                      </p>
                    </div>
                  </div>

                  {/* Receipt Badge Header */}
                  <div className="text-center my-0.5">
                    <span className="inline-block bg-gradient-to-r from-maroon-900 to-maroon-850 text-gold-300 font-heading text-xs sm:text-sm font-black px-6 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      पावती / OFFICIAL RECEIPT
                    </span>
                  </div>

                  {/* Metadata Row: Receipt Book No & Date */}
                  <div className="flex justify-between items-center text-xs py-2 px-3 bg-gold-50/80 border border-gold-300 rounded font-mono font-bold text-maroon-950">
                    <div>
                      <span>पावती पुस्तक क्रमांक / Receipt No: </span>
                      <span className="text-maroon-900 font-black">{previewReceipt.receiptNo}</span>
                    </div>
                    <div>
                      <span>दिनांक / Date: </span>
                      <span className="text-maroon-900 font-black">{previewReceipt.paymentDate}</span>
                    </div>
                  </div>

                  {/* Resident Info Box */}
                  <div className="space-y-2.5 text-xs sm:text-sm border-b border-stone-200 pb-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                      <span className="font-bold text-stone-600 sm:w-48 flex-shrink-0">
                        श्री / श्रीमती / M/s (Received From):
                      </span>
                      <span className="font-black text-maroon-950 font-heading text-sm sm:text-base border-b border-dotted border-stone-400 flex-grow break-words">
                        {previewReceipt.residentName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-stone-600 flex-shrink-0">फ्लॅट क्र. / Flat No:</span>
                        <span className="font-black text-maroon-900 font-mono border-b border-dotted border-stone-400 flex-grow">
                          {previewReceipt.flatNo}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-stone-600 flex-shrink-0">इमारत / Building:</span>
                        <span className="font-bold text-maroon-900 border-b border-dotted border-stone-400 flex-grow break-words">
                          {previewReceipt.building}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                      <span className="font-bold text-stone-600 sm:w-48 flex-shrink-0">
                        कारणास्तव / On Account Of (Purpose):
                      </span>
                      <span className="font-bold text-maroon-950 border-b border-dotted border-stone-400 flex-grow break-words">
                        {previewReceipt.purpose}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-stone-600 flex-shrink-0">पेमेंट पद्धत / Mode:</span>
                        <span className="font-bold text-stone-900">
                          {previewReceipt.paymentMode}
                        </span>
                      </div>
                      {previewReceipt.transactionRef && (
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-stone-600 flex-shrink-0">धनादेश / संदर्भ क्र. / Txn Ref:</span>
                          <span className="font-mono text-stone-900 break-all">
                            {previewReceipt.transactionRef}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount Box */}
                  <div className="p-3 bg-gradient-to-r from-amber-50/90 via-gold-50/50 to-amber-50/80 border-2 border-gold-400 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 box-border">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        प्राप्त रक्कम / Amount Received:
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-maroon-950 tracking-tight">
                        ₹ {Number(previewReceipt.amount).toLocaleString("en-IN")}/-
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">रक्कम अक्षरी / In Words:</span>
                      <span className="text-xs font-bold text-maroon-900 italic font-heading break-words">
                        {previewReceipt.amountInWords || numberToWordsIndian(previewReceipt.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Description Acknowledgement Note */}
                  {previewReceipt.description && (
                    <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 leading-relaxed italic break-words">
                      "{previewReceipt.description}"
                    </div>
                  )}

                  {/* Signature and Footer Section */}
                  <div className="border-t-2 border-maroon-900 pt-3 flex justify-between items-end gap-3">
                    <div className="text-[10px] text-stone-500 max-w-[280px] leading-tight space-y-0.5">
                      <p className="font-bold text-stone-700">नोंद / Notes & Conditions:</p>
                      <p>• ही अधिकृत संगणकीय पावती आहे.</p>
                      <p>• धनादेश/ऑनलाइन ट्रान्सफर रकमेच्या वटण्यावर आधारित.</p>
                      <p>• मंडळाच्या सर्व उपक्रमात सहकार्य केल्याबद्दल सस्नेह धन्यवाद.</p>
                    </div>

                    {/* Digital Signature Box */}
                    <div className="text-center min-w-[140px] space-y-1 flex-shrink-0">
                      {previewReceipt.sachivSignatureUrl || receiptSettings.sachivSignatureUrl ? (
                        <img
                          src={previewReceipt.sachivSignatureUrl || receiptSettings.sachivSignatureUrl}
                          alt="Digital Signature"
                          className="h-12 max-w-[140px] object-contain mx-auto"
                        />
                      ) : (
                        <div className="h-10 flex items-center justify-center text-[10px] text-stone-400 italic">
                          (स्वाक्षरी / Signature)
                        </div>
                      )}
                      <div className="border-t border-maroon-900 pt-1">
                        {/* NO "SACHIV" TEXT LABEL! ONLY OFFICIAL TITLE */}
                        <span className="text-[11px] text-maroon-900 font-bold block leading-tight">
                          सचिव / अधिकृत स्वाक्षरी
                        </span>
                        <span className="text-[9px] text-stone-500 font-semibold block">
                          Authorized Signatory
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3.5 bg-stone-50 border-t border-gold-300 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-stone-500">
                Ready for download or printing on standard A4 paper.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-1.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewReceipt)}
                  disabled={isGeneratingPdf}
                  className="px-5 py-1.5 bg-maroon-900 hover:bg-maroon-950 text-gold-300 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? "Generating..." : "Download Official PDF"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: DELETE RECEIPT CONFIRMATION (Soft-Delete to Secure Archive) */}
      {isDeleteModalOpen && receiptToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-300 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  {isEn ? "Confirm Receipt Deletion" : "पावती हटवण्याची खात्री करा"}
                </h4>
                <p className="text-xs text-red-700">
                  {receiptToDelete.receiptNo}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-stone-700">
              <p>
                {isEn ? "Are you sure you want to delete receipt" : "आपण खरोखर खालील पावती हटवू इच्छिता का?"}:
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 font-mono text-xs">
                <div><strong>No:</strong> {receiptToDelete.receiptNo}</div>
                <div><strong>Resident:</strong> {receiptToDelete.residentName}</div>
                <div><strong>Flat:</strong> {receiptToDelete.flatNo} ({receiptToDelete.building})</div>
                <div><strong>Amount:</strong> ₹{Number(receiptToDelete.amount).toLocaleString("en-IN")}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>{isEn ? "Safe Preservation Guarantee:" : "सुरक्षित संग्रह हमी:"}</strong>
                  <p className="mt-0.5">
                    {isEn
                      ? "This receipt will be hidden from the active list, but preserved permanently in the Complete Receipt Archive where it can be viewed or restored at any time."
                      : "ही पावती सक्रिय यादीतून अदृश्य होईल, परंतु ती 'सुरक्षित पावती संग्रह' (Archive) मध्ये कायम राहील. तेथून ती पुन्हा पूर्ववत (Restore) करता येईल."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setReceiptToDelete(null);
                }}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                {isEn ? "Cancel" : "रद्द करा"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingReceipt}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingReceipt ? "Deleting..." : (isEn ? "Confirm Delete" : "हटवणे निश्चित करा")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESTORE RECEIPT CONFIRMATION */}
      {isRestoreModalOpen && receiptToRestore && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-emerald-300 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {isEn ? "Restore Receipt to Active List" : "पावती सक्रिय यादीत पूर्ववत करा"}
                </h4>
                <p className="text-xs text-emerald-700">
                  {receiptToRestore.receiptNo}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-stone-700">
              <p>
                {isEn 
                  ? "Are you sure you want to restore this receipt? It will re-appear in the main Receipt History."
                  : "आपण ही पावती पुन्हा सक्रिय इतिहासात आणू इच्छिता का? ती मुख्य पावती यादीत दिसेल."}
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 font-mono text-xs">
                <div><strong>No:</strong> {receiptToRestore.receiptNo}</div>
                <div><strong>Resident:</strong> {receiptToRestore.residentName}</div>
                <div><strong>Amount:</strong> ₹{Number(receiptToRestore.amount).toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setReceiptToRestore(null);
                }}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                {isEn ? "Cancel" : "रद्द करा"}
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoringReceipt}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRestoringReceipt ? "Restoring..." : (isEn ? "Restore Receipt" : "पुनर्संचयित करा")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiptManager;
