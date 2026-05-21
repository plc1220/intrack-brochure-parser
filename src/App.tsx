import React, { useState, useRef } from "react";
import { SAMPLE_BROCHURES } from "./data";
import { IntrackRecord, SampleBrochure } from "./types";
import { calculateRecordFields, exportToCSV, COLUMN_GROUPS } from "./utils";
import RecordEditModal from "./components/RecordEditModal";
import {
  Upload,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Layers,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Columns,
  Eye,
  Info,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Prepopulate with first sample data to show high fidelity populated state instantly
  const initialRecords = SAMPLE_BROCHURES[0].records.map(rec => 
    calculateRecordFields({ ...rec })
  );

  const [records, setRecords] = useState<IntrackRecord[]>(initialRecords);
  
  // Tab Switcher between simple single page and multi page bulk queue
  const [uploadTab, setUploadTab] = useState<"simple" | "bulk">("simple");

  // Simple Upload States
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string | null>(null);

  // Bulk Upload States
  const [bulkFiles, setBulkFiles] = useState<{
    id: string;
    name: string;
    size: number;
    base64: string;
    status: "pending" | "analyzing" | "success" | "error";
    itemsCount?: number;
    errorMsg?: string;
  }[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  
  // OCR statuses
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrLogLines, setOcrLogLines] = useState<string[]>([
    "[System] Prepopulated high-fidelity sample records from AEON BiG Mailer.",
    "[System] Ready to accept your single page or bulk queues."
  ]);

  // Tables & Grid filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("All");
  const [activeColGroup, setActiveColGroup] = useState<keyof typeof COLUMN_GROUPS>("essential");
  
  // Modals management
  const [editingRecord, setEditingRecord] = useState<IntrackRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Analyze single manual upload
  const handleRunOcrOnImage = async (imgBase64: string, name: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setOcrLogLines(prev => [...prev, `[System] Dispatching single page document parsing for: "${name}"`]);
    setAnalysisProgress("Initializing Document OCR loader...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: imgBase64,
          mimeType: "image/jpeg",
          fileName: name
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "OCR extraction failed. Check API Key configuration.");
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const campaign = resData.data;
        const newItemsList = campaign.items || [];
        
        if (newItemsList.length === 0) {
          throw new Error("OCR worked but no matching promo items were identified on this page.");
        }

        const processedRecords = newItemsList.map((item: any, idx: number) => {
          const rawRecord: Partial<IntrackRecord> = {
            id: `ocr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            Country: campaign.Country || "MY",
            Currency: campaign.Currency || "MYR",
            "Mailer ID": campaign["Mailer ID"] || "M-OCR-GEN",
            "Source Type": campaign["Source Type"] || "Mailer",
            "Publication Date": campaign["Publication Date"] || "2026-04-09",
            "Retailer ID": campaign["Retailer ID"] || "",
            "Retailer Banner": campaign["Retailer Banner"] || "AEON BiG",
            "Retailer Chain Group": campaign["Retailer Chain Group"] || "AEON Group",
            "Channel Type": campaign["Channel Type"] || "Hypermarket",
            "Region ID": campaign["Region ID"] || "",
            "Region Name": campaign["Region Name"] || "West Malaysia",
            Theme: campaign.Theme || "House Brand Fair",
            "Theme Category": campaign["Theme Category"] || "House Brand Promotion",
            "Significant Thematic": campaign["Significant Thematic"] || "",
            "Significant Thematic Special": campaign["Significant Thematic Special"] || "Yes",
            "Promotion Start Date": campaign["Promotion Start Date"] || "2026-04-09",
            "Promotion End Date": campaign["Promotion End Date"] || "2026-05-06",
            Town: campaign.Town || "",
            "Outlet Opening": campaign["Outlet Opening"] || "No",
            "Feature ID": `FEAT-OCR-${idx}`,
            "Feature Type": item["Feature Type"] || "Price_Off",
            "Product Name": item["Product Name"] || "Unspecified Item",
            "Brand ID": item["Brand ID"] || "",
            "Department": item["Department"] || "Grocery",
            "Brand Name": item["Brand Name"] || "",
            "Brand Type": item["Brand Type"] || "Housebrand",
            Category: item["Category"] || "",
            Subcategory: item["Subcategory"] || "",
            "Subcategory ID": item["Subcategory ID"] || "",
            "Supplier Name": item["Supplier Name"] || "",
            "Supplier ID": item["Supplier ID"] || "",
            "Original Price": item["Original Price"] || "",
            "Promo Price": item["Promo Price"] || 0,
            "Promo Price (Upper Range)": item["Promo Price (Upper Range)"] || "",
            Size: item["Size"] || "",
            "No of Pack": item["No of Pack"] || 1,
            "Limited Buy": item["Limited Buy"] || "No",
            "No of Limited Buy": item["No of Limited Buy"] || "",
            "Activity Name": item["Activity Name"] || "",
            "Promo Mechanic": item["Promo Mechanic"] || "PO",
            "Premium Description": item["Premium Description"] || "",
            "Special Premium": item["Special Premium"] || "No",
            "Signficant Promotion": item["Signficant Promotion"] || "No",
            "PWP Value": item["PWP Value"] || "",
            "Member Price Value": item["Member Price Value"] || "",
            "New SKU? New Packaging? New Pack Size": item["New SKU? New Packaging? New Pack Size"] || "No",
            Exclusivity: item["Exclusivity"] || "No",
            sourceImageName: name,
            extractedAt: new Date().toISOString()
          };

          return calculateRecordFields(rawRecord);
        });

        // Insert new records to start of current grid rows
        setRecords(prev => [...processedRecords, ...prev]);
        setOcrLogLines(prev => [
          ...prev, 
          `[Success] Single Scan of "${name}" extracted ${processedRecords.length} unified row items!`
        ]);
      } else {
        throw new Error("Invalid response schema from API server.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred. Verify AWS credentials and Bedrock model access.");
      setOcrLogLines(prev => [...prev, `[Critical Error] Single scanner page failed: ${err.message}`]);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress("");
    }
  };

  // Run sequential file parsing
  const handleRunBulkOcr = async () => {
    const pendingFiles = bulkFiles.filter(f => f.status === "pending" || f.status === "error");
    if (pendingFiles.length === 0) return;

    setIsBulkProcessing(true);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setOcrLogLines(prev => [...prev, `[Bulk Engine] Initializing sequential batch queue: ${pendingFiles.length} file(s)`]);

    for (let i = 0; i < bulkFiles.length; i++) {
      const fileItem = bulkFiles[i];
      if (fileItem.status === "success") continue; // Keep previously completed files

      // Mark actual state item as analyzing
      setBulkFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "analyzing" } : f));
      setAnalysisProgress(`Scanning flyer ${i + 1}/${bulkFiles.length}: "${fileItem.name}"...`);
      setOcrLogLines(prev => [...prev, `[Bulk Engine] Analyzing [${i + 1}/${bulkFiles.length}] file: "${fileItem.name}" ...`]);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image: fileItem.base64,
            mimeType: "image/jpeg",
            fileName: fileItem.name
          }),
        });

        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || "API extraction failure");
        }

        const resData = await response.json();
        if (resData.success && resData.data) {
          const campaign = resData.data;
          const newItemsList = campaign.items || [];
          
          if (newItemsList.length === 0) {
            throw new Error("Extracted successfully but no promo items found on page.");
          }

          const processedRecords = newItemsList.map((item: any, idx: number) => {
            const rawRecord: Partial<IntrackRecord> = {
              id: `ocr-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              Country: campaign.Country || "MY",
              Currency: campaign.Currency || "MYR",
              "Mailer ID": campaign["Mailer ID"] || "M-OCR-GEN",
              "Source Type": campaign["Source Type"] || "Mailer",
              "Publication Date": campaign["Publication Date"] || "2026-04-09",
              "Retailer ID": campaign["Retailer ID"] || "",
              "Retailer Banner": campaign["Retailer Banner"] || "AEON BiG",
              "Retailer Chain Group": campaign["Retailer Chain Group"] || "AEON Group",
              "Channel Type": campaign["Channel Type"] || "Hypermarket",
              "Region ID": campaign["Region ID"] || "",
              "Region Name": campaign["Region Name"] || "West Malaysia",
              Theme: campaign.Theme || "House Brand Fair",
              "Theme Category": campaign["Theme Category"] || "House Brand Promotion",
              "Significant Thematic": campaign["Significant Thematic"] || "",
              "Significant Thematic Special": campaign["Significant Thematic Special"] || "Yes",
              "Promotion Start Date": campaign["Promotion Start Date"] || "2026-04-09",
              "Promotion End Date": campaign["Promotion End Date"] || "2026-05-06",
              Town: campaign.Town || "",
              "Outlet Opening": campaign["Outlet Opening"] || "No",
              "Feature ID": `FEAT-OCR-${idx}`,
              "Feature Type": item["Feature Type"] || "Price_Off",
              "Product Name": item["Product Name"] || "Unspecified Item",
              "Brand ID": item["Brand ID"] || "",
              "Department": item["Department"] || "Grocery",
              "Brand Name": item["Brand Name"] || "",
              "Brand Type": item["Brand Type"] || "Housebrand",
              Category: item["Category"] || "",
              Subcategory: item["Subcategory"] || "",
              "Subcategory ID": item["Subcategory ID"] || "",
              "Supplier Name": item["Supplier Name"] || "",
              "Supplier ID": item["Supplier ID"] || "",
              "Original Price": item["Original Price"] || "",
              "Promo Price": item["Promo Price"] || 0,
              "Promo Price (Upper Range)": item["Promo Price (Upper Range)"] || "",
              Size: item["Size"] || "",
              "No of Pack": item["No of Pack"] || 1,
              "Limited Buy": item["Limited Buy"] || "No",
              "No of Limited Buy": item["No of Limited Buy"] || "",
              "Activity Name": item["Activity Name"] || "",
              "Promo Mechanic": item["Promo Mechanic"] || "PO",
              "Premium Description": item["Premium Description"] || "",
              "Special Premium": item["Special Premium"] || "No",
              "Signficant Promotion": item["Signficant Promotion"] || "No",
              "PWP Value": item["PWP Value"] || "",
              "Member Price Value": item["Member Price Value"] || "",
              "New SKU? New Packaging? New Pack Size": item["New SKU? New Packaging? New Pack Size"] || "No",
              Exclusivity: item["Exclusivity"] || "No",
              sourceImageName: fileItem.name,
              extractedAt: new Date().toISOString()
            };

            return calculateRecordFields(rawRecord);
          });

          // Inject into main records state instantly
          setRecords(prev => [...processedRecords, ...prev]);

          // Mark bulk entry success status
          setBulkFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "success", itemsCount: processedRecords.length } : f));
          setOcrLogLines(prev => [...prev, `[Success] "${fileItem.name}" extracted +${processedRecords.length} items.`]);

        } else {
          throw new Error("Invalid schema from output.");
        }
      } catch (err: any) {
        console.error(err);
        const errMsgMsg = err.message || "Failed parsing page";
        setBulkFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", errorMsg: errMsgMsg } : f));
        setOcrLogLines(prev => [...prev, `[Fail] "${fileItem.name}" failed: ${errMsgMsg}`]);
      }
    }

    setIsBulkProcessing(false);
    setIsAnalyzing(false);
    setAnalysisProgress("");
    setOcrLogLines(prev => [...prev, `[Bulk Engine] Finished batch operation.`]);
  };

  // Simple Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndSetFile(file);
  };

  const readAndSetFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImage(reader.result as string);
      setCustomFilename(file.name);
      setErrorMessage(null);
      setOcrLogLines(prev => [...prev, `[System] Simple manual upload loaded: "${file.name}" ready to analyze.`]);
    };
    reader.readAsDataURL(file);
  };

  // Bulk Upload Handler
  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBulkFileSelection(e.target.files);
    }
  };

  const handleBulkFileSelection = (filesList: FileList) => {
    setErrorMessage(null);
    const validFiles = Array.from(filesList).filter(f => f.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      setOcrLogLines(prev => [...prev, "[System] Tried loading bulk files, but no valid image types (.jpg/.png) were detected."]);
      return;
    }

    setOcrLogLines(prev => [...prev, `[System] Reading ${validFiles.length} file(s) for bulk processing queues...`]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      const fileId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      reader.onloadend = () => {
        setBulkFiles(prev => [
          ...prev, 
          {
            id: fileId,
            name: file.name,
            size: file.size,
            base64: reader.result as string,
            status: "pending"
          }
        ]);
        setOcrLogLines(prev => [...prev, `[System] Queued bulk image file: "${file.name}"`]);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      readAndSetFile(file);
    }
  };

  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBulkFileSelection(e.dataTransfer.files);
    }
  };

  // Clear or add single blank row
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire data grid?")) {
      setRecords([]);
      setOcrLogLines(prev => [...prev, "[System] Data grid cleared."]);
    }
  };

  const handleCreateEmptyRow = () => {
    const emptyRow = calculateRecordFields({
      "Product Name": "New Item Specifier",
      "Brand Name": "Placeholder",
      "Promo Price": 9.90,
      "Original Price": "",
      "Retailer Banner": "AEON BiG",
      "Promotion Start Date": "2026-04-09",
      "Promotion End Date": "2026-05-06",
      Country: "MY",
      Currency: "MYR",
      "Source Type": "Mailer",
      Department: "Grocery"
    });
    setRecords(prev => [emptyRow, ...prev]);
    setEditingRecord(emptyRow);
    setIsEditModalOpen(true);
    setOcrLogLines(prev => [...prev, "[System] Created a new empty record row in the matrix."]);
  };

  // Modal actions
  const handleOpenEdit = (rec: IntrackRecord) => {
    setEditingRecord(rec);
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (updated: IntrackRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setOcrLogLines(prev => [...prev, `[System] Updated manual cells for "${updated["Product Name"]}"`]);
  };

  const handleDeleteRow = (id: string, name: string) => {
    if (window.confirm(`Delete row for "${name}"?`)) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setOcrLogLines(prev => [...prev, `[System] Removed row: "${name}"`]);
    }
  };

  // Exporters
  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert("No records to export.");
      return;
    }
    const csvContent = exportToCSV(records);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `intrack_extracted_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOcrLogLines(prev => [...prev, "[Success] Exported Intrack CSV database file."]);
  };

  // Filtered lists
  const filteredRecords = records.filter(rec => {
    const matchText = 
      (rec["Product Name"] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec["Brand Name"] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec["Retailer Banner"] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.Category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.Subcategory || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedDeptFilter === "All") {
      return matchText;
    }
    return matchText && rec.Department === selectedDeptFilter;
  });

  const columnsToRender = COLUMN_GROUPS[activeColGroup].cols.length > 0 
    ? COLUMN_GROUPS[activeColGroup].cols 
    : Object.keys(records[0] || {}).filter(k => k !== "id" && k !== "imageThumbnail" && k !== "sourceImageName" && k !== "extractedAt" && typeof records[0]?.[k as keyof IntrackRecord] !== "function") as (keyof IntrackRecord)[];

  return (
    <div className="min-h-screen mesh-bg flex flex-col font-sans antialiased text-neutral-200">
      
      {/* 1. Header Bar */}
      <header className="glass-header sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg accent-glow">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-lg tracking-tight text-glow">Intrack Brochure Parser</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest leading-none bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20">OCR Hub</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Automated flyer data extraction paired with Intrack Excel columns layout.</p>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-6 self-start md:self-auto">
            <div className="text-right border-r border-white/10 pr-5 last:border-0">
              <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Loaded Rows</span>
              <span className="text-sm font-bold text-sky-400">{records.length} items</span>
            </div>
            <div className="text-right border-r border-white/10 pr-5 last:border-0 hidden sm:block">
              <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Brands Tracked</span>
              <span className="text-sm font-bold text-indigo-400">
                {Array.from(new Set(records.map(r => r["Brand Name"]).filter(Boolean))).length}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Engine Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
                Bedrock Multi-Modal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls, Uploaders & Logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* MULTI-UPLOADER CARD WITH TABS */}
          <div className="glass rounded-xl overflow-hidden shadow-2xl">
            {/* Elegant Tab Headers */}
            <div className="flex border-b border-white/5 bg-white/[0.015]">
              <button
                type="button"
                onClick={() => setUploadTab("simple")}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-r border-white/5 cursor-pointer ${
                  uploadTab === "simple"
                    ? "bg-white/[0.03] text-sky-400 border-b-2 border-b-sky-500 font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Simple Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadTab("bulk")}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadTab === "bulk"
                    ? "bg-white/[0.03] text-indigo-400 border-b-2 border-b-indigo-500 font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Bulk Upload
              </button>
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="p-5 space-y-4">
              
              {/* PANEL 1: SIMPLE SINGLE BROCHURE UPLOAD */}
              {uploadTab === "simple" && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Drop a single flyer page directly or click to pick. Perfect for targeting focused regional newsletters.
                  </p>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      customImage 
                        ? "border-sky-500/50 bg-sky-550/5" 
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                    
                    {customImage ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto border border-sky-500/20">
                          <Check className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-white truncate">{customFilename}</p>
                        <p className="text-[10px] text-neutral-400">Click or drag another image to replace.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-neutral-400">
                        <div className="w-12 h-12 bg-white/5 text-neutral-400 rounded-lg flex items-center justify-center mx-auto border border-white/5">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-neutral-200">Drag & drop your brochure page here</p>
                        <p className="text-[10px] text-neutral-500">Supports PNG, JPEG files</p>
                      </div>
                    )}
                  </div>

                  {customImage && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRunOcrOnImage(customImage, customFilename || "custom_brochure.jpg")}
                        disabled={isAnalyzing}
                        className="flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-white bg-sky-500 hover:bg-sky-600 disabled:bg-white/5 disabled:text-neutral-500 rounded-lg shadow-md hover:shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isAnalyzing ? "Analyzing Page..." : "Run Extractor Scan"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomImage(null);
                          setCustomFilename(null);
                        }}
                        disabled={isAnalyzing}
                        className="p-2.5 text-xs text-rose-450 hover:bg-rose-500/10 rounded-lg transition"
                        title="Clear chosen file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: BULK PORTFOLIO QUEUE */}
              {uploadTab === "bulk" && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Load multiple pages concurrently. Our system scans them sequentially via Amazon Bedrock to map them seamlessly into one unified Intrack sheet.
                  </p>

                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleBulkDrop}
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-xl p-6 text-center cursor-pointer transition-all"
                  >
                    <input 
                      type="file" 
                      ref={bulkFileInputRef}
                      onChange={handleBulkFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden" 
                    />
                    <div className="space-y-2 text-neutral-400">
                      <div className="w-12 h-12 bg-white/5 text-neutral-400 rounded-lg flex items-center justify-center mx-auto border border-white/5">
                        <Layers className="w-5 h-5 text-indigo-400" />
                      </div>
                      <p className="text-xs font-medium text-neutral-200">Drag & drop multiple flyer pages here</p>
                      <p className="text-[10px] text-neutral-500 font-semibold text-rose-350">Supports batch multi-selecting</p>
                    </div>
                  </div>

                  {/* Queued Bulk Lists */}
                  {bulkFiles.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
                        <span className="font-mono">Queue List: {bulkFiles.length} page(s)</span>
                        <button 
                          type="button" 
                          onClick={() => setBulkFiles([])} 
                          disabled={isBulkProcessing}
                          className="text-rose-400 hover:underline disabled:opacity-50 text-[10px] uppercase font-bold"
                        >
                          Clear Queue
                        </button>
                      </div>
                      
                      <div className="max-h-[170px] overflow-y-auto space-y-1.5 border border-white/5 bg-black/20 rounded-lg p-2 divide-y divide-white/5">
                        {bulkFiles.map((f, i) => (
                          <div key={f.id} className="text-[11px] flex items-center justify-between py-1.5 first:pt-0 last:pb-0 gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate font-mono">{f.name}</p>
                              <p className="text-[9px] text-neutral-500">{(f.size/1024).toFixed(0)} KB</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              {f.status === "pending" && (
                                <span className="bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">Pending</span>
                              )}
                              {f.status === "analyzing" && (
                                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase animate-pulse flex items-center gap-1">
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Scanning
                                </span>
                              )}
                              {f.status === "success" && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                  Done (+{f.itemsCount || 0})
                                </span>
                              )}
                              {f.status === "error" && (
                                <span className="bg-rose-500/10 text-rose-450 border border-rose-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" title={f.errorMsg}>
                                  Err
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleRunBulkOcr}
                        disabled={isBulkProcessing || bulkFiles.every(f => f.status === "success")}
                        className="w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/5 disabled:text-neutral-500 rounded-lg shadow-md hover:shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isBulkProcessing ? "Batch Uploading Pages..." : `Execute Batch Scan (${bulkFiles.filter(f=>f.status!=="success").length} left)`}
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

          {/* EXTRACTION STATUS LOGGER */}
          <div className="glass rounded-xl p-4 font-mono text-[11px] text-neutral-300 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]"></span>
                OCR Engine Terminal
              </span>
              <span className="text-[9px] text-neutral-500">v1.3.0</span>
            </div>

            {isAnalyzing ? (
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span className="text-white font-bold">Scanning Document...</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full animate-pulse w-3/4 shadow-[0_0_8px_#38bdf8]"></div>
                </div>
                <p className="text-[10px] text-sky-300 font-mono italic">
                  {analysisProgress || "Invoking AI node..."}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {ocrLogLines.length === 0 ? (
                  <p className="text-neutral-500 italic py-2">No active logs. Drop image sheets above.</p>
                ) : (
                  ocrLogLines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-1 p-0.2 timeline-anim">
                      <span className="text-neutral-500 font-medium select-none">❯</span>
                      <span className="break-all">{line}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-350">OCR Analysis Faulted</p>
                <p className="mt-1 text-rose-200/80 leading-relaxed">{errorMessage}</p>
                <div className="mt-3 text-[10px] text-rose-300 bg-rose-500/10 inline-block px-2 py-0.5 rounded border border-rose-500/20 font-semibold font-mono">
                  Configure AWS credentials and Bedrock model access (see README)
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Intrack Grid (Full Width on tablets/desktop) */}
        <div className="lg:col-span-8 glass rounded-xl overflow-hidden flex flex-col shadow-2xl">
          
          {/* Grid control bar */}
          <div className="p-4 sm:p-5 border-b border-white/5 bg-white/[0.015] flex flex-col gap-4">
            
            {/* Filter segments */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Searchbox */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, or departments..." 
                  className="w-full text-sm pl-9 pr-4 py-2 glass-input rounded-lg text-white"
                />
              </div>

              {/* Table Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto uppercase tracking-wider text-[10px] font-bold">
                <button
                  type="button"
                  onClick={handleCreateEmptyRow}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 text-sky-400 border border-white/5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Insert Row
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="py-2 px-3 bg-white/5 hover:bg-rose-500/15 text-rose-350 border border-white/5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Grid
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="py-2 px-3.5 bg-sky-500 text-white rounded-lg flex items-center gap-1.5 transition hover:bg-sky-600 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Column Grouping Tabs Drawer to manage dense Intrack Columns */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 pt-3">
              
              {/* Column Groups */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                <span className="text-xs font-semibold text-neutral-400 mr-2 flex items-center gap-1">
                  <Columns className="w-3.5 h-3.5 text-neutral-400" />
                  Columns:
                </span>
                {(Object.keys(COLUMN_GROUPS) as (keyof typeof COLUMN_GROUPS)[]).map(groupKey => {
                  const isActive = activeColGroup === groupKey;
                  return (
                    <button
                      key={groupKey}
                      onClick={() => setActiveColGroup(groupKey)}
                      className={`text-xs px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                        isActive 
                          ? "bg-sky-500 text-white font-semibold shadow-md border-b border-sky-400" 
                          : "text-neutral-400 hover:bg-white/5"
                      }`}
                    >
                      {COLUMN_GROUPS[groupKey].label}
                    </button>
                  );
                })}
              </div>

              {/* Department Option tags drop */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="text-xs py-1 px-2 border border-white/10 rounded bg-neutral-900/40 text-neutral-200 cursor-pointer outline-none hover:border-white/20 select-none custom-select"
                >
                  <option value="All" className="bg-neutral-950">Dept: All</option>
                  <option value="Grocery" className="bg-neutral-950">Grocery</option>
                  <option value="Chilled & Frozen" className="bg-neutral-950">Chilled & Frozen</option>
                  <option value="Fresh" className="bg-neutral-950">Fresh</option>
                  <option value="Household" className="bg-neutral-950">Household</option>
                  <option value="Health & Beauty" className="bg-neutral-950">Health & Beauty</option>
                  <option value="Electrical" className="bg-neutral-950">Electrical</option>
                </select>
              </div>
            </div>
          </div>

          {/* ENTERPRISE GRID TABLE */}
          <div className="flex-1 overflow-x-auto min-h-[460px]">
            {filteredRecords.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-neutral-500">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">No Matching Intrack Records</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Data grid empty. Drag design layouts/brochures to extract promotions instantly, or click Insert Row above.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse table-auto">
                
                {/* Headers */}
                <thead>
                  <tr className="bg-white/[0.015] border-b border-white/5 text-neutral-300 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3 pl-5 text-center min-w-[70px]">Actions</th>
                    {columnsToRender.map(col => (
                      <th key={col} className="p-3 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Rows data */}
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300 bg-transparent">
                  {filteredRecords.map((row, idx) => {
                    return (
                      <tr key={row.id || idx} className="hover:bg-white/[0.015] transition truncate">
                        
                        {/* Editor action column */}
                        <td className="p-3 pl-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(row)}
                              title="Edit values manually"
                              className="p-1 text-sky-400 hover:bg-sky-500/10 rounded transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id, row["Product Name"])}
                              title="Delete row"
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Dense dynamically rendered properties */}
                        {columnsToRender.map(col => {
                           const value = row[col];
                           const hasValue = value !== undefined && value !== null && value !== "";
                           
                           // Style calculated badges for visual depth
                           const isCalculatedCol = ["Discount %", "Price Per Pack", "Year", "Month", "Week", "Quarter"].includes(col);

                           return (
                             <td 
                               key={col} 
                               className={`p-3 whitespace-nowrap ${
                                 isCalculatedCol ? "bg-white/[0.005] font-medium" : ""
                               }`}
                             >
                               {!hasValue ? (
                                 <span className="text-neutral-600 italic text-[10px]">empty</span>
                               ) : col === "Discount %" ? (
                                 <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold text-[11px] border border-amber-500/20">
                                   {value}% Off
                                 </span>
                               ) : col === "Promo Price" || col === "Original Price" || col === "Price Per Pack" ? (
                                 <span className="font-bold text-white font-mono">
                                   {row.Currency || "RM"} {Number(value).toFixed(2)}
                                 </span>
                               ) : col === "Retailer Banner" ? (
                                 <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-200 border border-white/5 font-semibold">
                                   {value}
                                 </span>
                               ) : col === "Department" ? (
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                   value === "Grocery" ? "bg-orange-500/10 text-orange-300 border-orange-500/20" :
                                   value === "Chilled & Frozen" ? "bg-sky-500/10 text-sky-300 border-sky-500/20" :
                                   value === "Fresh" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                                   "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                 }`}>
                                   {value}
                                 </span>
                               ) : (
                                 <span className="max-w-[200px] truncate block text-neutral-300 font-sans">
                                   {String(value)}
                                 </span>
                               )}
                             </td>
                           );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer info drawer */}
          <div className="p-4 bg-white/[0.015] border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 leading-none">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Extracted promotional matrices dynamically matched to Intrack columns format.</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span>Selected Column Mapping:</span>
              <span className="font-semibold bg-white/10 text-white px-1.5 py-0.5 rounded uppercase text-[10px] border border-white/5">
                {activeColGroup === "all" ? "Fully Unified XLS Template" : COLUMN_GROUPS[activeColGroup].label}
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* 3. INLINE EDIT MODAL ENTRY FORM */}
      <AnimatePresence>
        {isEditModalOpen && (
          <RecordEditModal
            record={editingRecord}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingRecord(null);
            }}
            onSave={handleSaveModal}
          />
        )}
      </AnimatePresence>

      {/* 4. FOOTER APP CREDITS */}
      <footer className="border-t border-white/5 mt-16 py-6 text-center text-xs text-neutral-500 bg-[#07090d]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <p>© 2026 Intrack Brochure Track Data Entry Platform. All rights reserved.</p>
          <p className="flex items-center justify-center gap-2 text-neutral-600">
            <span>Server Proxy: Port 3000</span>
            <span className="text-white/5">|</span>
            <span>Amazon Bedrock structured outputs OCR</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
