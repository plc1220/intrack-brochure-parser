import React, { useState, useEffect } from "react";
import { IntrackRecord } from "../types";
import { calculateRecordFields } from "../utils";
import { X, Check, ArrowUpRight, DollarSign, Tag, Calendar, Layers } from "lucide-react";
import { motion } from "motion/react";

interface RecordEditModalProps {
  record: IntrackRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: IntrackRecord) => void;
}

export default function RecordEditModal({ record, isOpen, onClose, onSave }: RecordEditModalProps) {
  const [form, setForm] = useState<Partial<IntrackRecord>>({});

  useEffect(() => {
    if (record) {
      setForm({ ...record });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleChange = (key: keyof IntrackRecord, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      // Dynamically run calculation on certain field changes to update values in the modal input visually!
      if (
        key === "Promo Price" ||
        key === "Original Price" ||
        key === "No of Pack" ||
        key === "Promotion Start Date"
      ) {
        return calculateRecordFields(updated);
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Run full clean calculations before sending back
    const finalRecord = calculateRecordFields(form);
    onSave(finalRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="glass rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="flex border-b border-white/5 items-center justify-between p-4 bg-white/[0.015]">
          <div>
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Edit Intrack Column Values
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tweak OCR-extracted or manually created data rows. Calculated fields auto-update.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Main Info Box */}
          <div className="bg-sky-500/5 border border-sky-500/15 rounded-lg p-3.5 text-xs text-sky-300 flex items-start gap-2.5">
            <span className="font-bold uppercase tracking-wider bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded text-[9px] mt-0.5">Note</span>
            <div className="leading-relaxed">
              Fields with calculated values (e.g., <span className="font-semibold text-white">Discount %, Price Per Pack, Year, Month, Week, Quarter</span>) are marked with <span className="font-semibold text-sky-400">⚡ auto</span> and will update automatically as you edit original prices & promotion dates.
            </div>
          </div>

          {/* SECTION 1: Product Definition */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-450" />
              Product Specification & Hierarchy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">Product Name *</label>
                <input 
                  type="text" 
                  required
                  value={form["Product Name"] || ""} 
                  onChange={e => handleChange("Product Name", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Caramelized Biscuit Spread 350G"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Brand Name</label>
                <input 
                  type="text" 
                  value={form["Brand Name"] || ""} 
                  onChange={e => handleChange("Brand Name", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Topvalu"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Brand Type</label>
                <select 
                  value={form["Brand Type"] || "Housebrand"} 
                  onChange={e => handleChange("Brand Type", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="Housebrand" className="bg-neutral-950">Housebrand</option>
                  <option value="Branded" className="bg-neutral-950">Branded</option>
                  <option value="Generic" className="bg-neutral-950">Generic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Size / Weight</label>
                <input 
                  type="text" 
                  value={form["Size"] || ""} 
                  onChange={e => handleChange("Size", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. 350G, 1KG"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">No of Pack (Units)</label>
                <input 
                  type="number" 
                  min={1}
                  value={form["No of Pack"] || 1} 
                  onChange={e => handleChange("No of Pack", parseInt(e.target.value) || 1)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Department</label>
                <select 
                  value={form["Department"] || "Grocery"} 
                  onChange={e => handleChange("Department", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="Grocery" className="bg-neutral-950">Grocery</option>
                  <option value="Chilled & Frozen" className="bg-neutral-950">Chilled & Frozen</option>
                  <option value="Fresh" className="bg-neutral-950">Fresh</option>
                  <option value="Household" className="bg-neutral-950">Household</option>
                  <option value="Health & Beauty" className="bg-neutral-950">Health & Beauty</option>
                  <option value="Electrical" className="bg-neutral-950">Electrical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                <input 
                  type="text" 
                  value={form["Category"] || ""} 
                  onChange={e => handleChange("Category", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Jam & Spread"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Subcategory</label>
                <input 
                  type="text" 
                  value={form["Subcategory"] || ""} 
                  onChange={e => handleChange("Subcategory", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Peanut Butter"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Pricing, Promos & Auto values */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-sky-400" />
              Pricing & Promotion Mechanics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/[0.012] p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Promo Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-sky-400 font-semibold font-mono">{form.Currency || "RM"}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={form["Promo Price"] || ""} 
                    onChange={e => handleChange("Promo Price", parseFloat(e.target.value) || 0)} 
                    className="w-full text-sm pl-9 pr-3 py-2 glass-input rounded-lg outline-none text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Original Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-neutral-400 font-semibold font-mono">{form.Currency || "RM"}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form["Original Price"] || ""} 
                    onChange={e => handleChange("Original Price", e.target.value === "" ? "" : parseFloat(e.target.value))} 
                    className="w-full text-sm pl-9 pr-3 py-2 glass-input rounded-lg outline-none text-white"
                    placeholder="None"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1">
                  Discount % <span className="text-[9px] bg-sky-500/15 text-sky-300 px-1 py-0.2 rounded font-semibold">⚡ auto</span>
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={form["Discount %"] !== "" ? `${form["Discount %"]}%` : "0% (No Original)"} 
                  className="w-full text-sm px-3 py-2 border border-white/5 bg-white/5 rounded-lg text-neutral-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1">
                  Price Per Pack <span className="text-[9px] bg-sky-500/15 text-sky-300 px-1 py-0.2 rounded font-semibold">⚡ auto</span>
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={form["Price Per Pack"] !== "" ? `${form.Currency || "RM"} ${form["Price Per Pack"]}` : ""} 
                  className="w-full text-sm px-3 py-2 border border-white/5 bg-white/5 rounded-lg text-neutral-400 font-bold font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Promo Mechanic</label>
                <select 
                  value={form["Promo Mechanic"] || "PO"} 
                  onChange={e => handleChange("Promo Mechanic", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="PO" className="bg-neutral-950">PO (Price Offer)</option>
                  <option value="SPD" className="bg-neutral-950">SPD (2nd Pack Discount)</option>
                  <option value="GWPC" className="bg-neutral-950">GWPC (Gift With Purchase client)</option>
                  <option value="GWPN" className="bg-neutral-950">GWPN (Gift With Purchase standard)</option>
                  <option value="MPG" className="bg-neutral-950">MPG (Multi Purchase Gift)</option>
                  <option value="PWP" className="bg-neutral-950">PWP (Purchase With Purchase)</option>
                  <option value="Range Premium" className="bg-neutral-950">Range Premium</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">Premium / Bundle Description</label>
                <input 
                  type="text" 
                  value={form["Premium Description"] || ""} 
                  onChange={e => handleChange("Premium Description", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Buy 3 @ RM12.90, or Gift with purchase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Special Premium?</label>
                <select
                  value={form["Special Premium"] || "No"}
                  onChange={e => handleChange("Special Premium", e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="No" className="bg-neutral-950">No</option>
                  <option value="Yes" className="bg-neutral-950">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Brand Metadata & Campaign Times */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Campaign, Timing & Store Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Retailer Banner</label>
                <input 
                  type="text" 
                  value={form["Retailer Banner"] || ""} 
                  onChange={e => handleChange("Retailer Banner", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. AEON BiG"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Retailer Chain Group</label>
                <input 
                  type="text" 
                  value={form["Retailer Chain Group"] || ""} 
                  onChange={e => handleChange("Retailer Chain Group", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. AEON Group"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Promotion Start Date</label>
                <input 
                  type="date" 
                  value={form["Promotion Start Date"] || ""} 
                  onChange={e => handleChange("Promotion Start Date", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-900 text-white outline-none focus:ring-1 focus:ring-sky-500/30 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Promotion End Date</label>
                <input 
                  type="date" 
                  value={form["Promotion End Date"] || ""} 
                  onChange={e => handleChange("Promotion End Date", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-900 text-white outline-none focus:ring-1 focus:ring-sky-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Theme</label>
                <input 
                  type="text" 
                  value={form["Theme"] || ""} 
                  onChange={e => handleChange("Theme", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. House Brand Fair"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Theme Category</label>
                <input 
                  type="text" 
                  value={form["Theme Category"] || ""} 
                  onChange={e => handleChange("Theme Category", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. House Brand Promotion"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Country</label>
                <select 
                  value={form["Country"] || "MY"} 
                  onChange={e => handleChange("Country", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="MY" className="bg-neutral-950">MY (Malaysia)</option>
                  <option value="SG" className="bg-neutral-950">SG (Singapore)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Currency</label>
                <select 
                  value={form["Currency"] || "MYR"} 
                  onChange={e => handleChange("Currency", e.target.value)} 
                  className="w-full text-sm px-3 py-2 border border-white/10 rounded-lg bg-neutral-905 text-white outline-none focus:border-sky-500/40"
                >
                  <option value="MYR" className="bg-neutral-950">MYR (Ringgit)</option>
                  <option value="SGD" className="bg-neutral-950">SGD (Dollar)</option>
                </select>
              </div>
            </div>

            {/* Calendars auto values read-only view */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-white/[0.02] p-3.5 rounded-lg border border-white/5 font-mono">
              <div className="text-center md:border-r border-white/5 last:border-0 py-1">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">Calculated Year</span>
                <span className="text-xs font-bold text-sky-400">{form.Year || "-"}</span>
              </div>
              <div className="text-center md:border-r border-white/5 last:border-0 py-1">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">Calculated Month</span>
                <span className="text-xs font-bold text-sky-400">{form.Month || "-"}</span>
              </div>
              <div className="text-center md:border-r border-white/5 last:border-0 py-1">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">Calculated Week</span>
                <span className="text-xs font-bold text-sky-400">Wk {form.Week || "-"}</span>
              </div>
              <div className="text-center last:border-0 py-1">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">Calculated Quarter</span>
                <span className="text-xs font-bold text-indigo-400">{form.Quarter || "-"}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Subcategory & Supplier IDs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3.5 flex items-center gap-1.5 border-t border-white/5 pt-3.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-450" />
              Data Entry IDs & Back-Office Fields
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Mailer ID</label>
                <input 
                  type="text" 
                  value={form["Mailer ID"] || ""} 
                  onChange={e => handleChange("Mailer ID", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. M-101"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Retailer ID</label>
                <input 
                  type="text" 
                  value={form["Retailer ID"] || ""} 
                  onChange={e => handleChange("Retailer ID", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. RET-AB01"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Brand ID</label>
                <input 
                  type="text" 
                  value={form["Brand ID"] || ""} 
                  onChange={e => handleChange("Brand ID", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. BR-TV-01"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  value={form["Supplier Name"] || ""} 
                  onChange={e => handleChange("Supplier Name", e.target.value)} 
                  className="w-full text-sm px-3 py-2 glass-input rounded-lg outline-none text-white"
                  placeholder="e.g. Nestle, AEON"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="border-t border-white/5 p-4 bg-white/[0.015] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition shadow-md accent-glow flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-white" />
            Apply Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
