import { IntrackRecord } from "./types";

/**
 * Recalculate automatic system fields of an Intrack record.
 */
export function calculateRecordFields(record: Partial<IntrackRecord>): IntrackRecord {
  const updated = { ...record } as IntrackRecord;

  // Ensure logical IDs
  if (!updated.id) {
    updated.id = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 1. Calculate Discount %
  const origPrice = updated["Original Price"] !== "" ? Number(updated["Original Price"]) : 0;
  const promoPrice = Number(updated["Promo Price"]) || 0;
  if (origPrice && promoPrice && origPrice > promoPrice) {
    updated["Discount %"] = parseFloat((((origPrice - promoPrice) / origPrice) * 100).toFixed(1));
  } else {
    updated["Discount %"] = "";
  }

  // 2. Calculate Price Per Pack (Single product value if multi-purchase or pack size matches)
  const noOfPacks = Number(updated["No of Pack"]) || 1;
  if (promoPrice && noOfPacks > 0) {
    updated["Price Per Pack"] = parseFloat((promoPrice / noOfPacks).toFixed(2));
  } else if (promoPrice) {
    updated["Price Per Pack"] = promoPrice;
  } else {
    updated["Price Per Pack"] = "";
  }

  // 3. Extract Year, Month, Week, Quarter based on "Promotion Start Date"
  const startDateStr = updated["Promotion Start Date"] || "";
  if (startDateStr) {
    const dateObj = new Date(startDateStr);
    if (!isNaN(dateObj.getTime())) {
      updated.Year = dateObj.getFullYear();
      updated.Month = dateObj.getMonth() + 1;
      
      // Calculate week of the year
      const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
      const pastDaysOfYr = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
      updated.Week = Math.ceil((pastDaysOfYr + firstDayOfYear.getDay() + 1) / 7);
      
      // Calculate Quarter
      const m = dateObj.getMonth() + 1;
      if (m <= 3) updated.Quarter = "Q1";
      else if (m <= 6) updated.Quarter = "Q2";
      else if (m <= 9) updated.Quarter = "Q3";
      else updated.Quarter = "Q4";
    } else {
      updated.Year = "";
      updated.Month = "";
      updated.Week = "";
      updated.Quarter = "";
    }
  } else {
    updated.Year = "";
    updated.Month = "";
    updated.Week = "";
    updated.Quarter = "";
  }

  // Default standard settings
  if (!updated.Country) updated.Country = "MY";
  if (!updated.Currency) updated.Currency = updated.Country === "SG" ? "SGD" : "MYR";
  if (!updated["Source Type"]) updated["Source Type"] = "Mailer";
  if (!updated["Channel Type"]) {
    updated["Channel Type"] = ["Watsons", "Guardian"].includes(updated["Retailer Banner"] || "") 
      ? "Pharmacy" 
      : "Hypermarket";
  }
  if (!updated.YTD) updated.YTD = "YTD TY";
  if (!updated.MAT) updated.MAT = "MAT TY";

  // Logical checks
  if (updated["Premium Description"] && !updated["Special Premium"]) {
    updated["Special Premium"] = "Yes";
  } else if (!updated["Premium Description"]) {
    updated["Special Premium"] = "No";
  }

  return updated;
}

/**
 * Generate CSV text from a list of Intrack records.
 */
export function exportToCSV(records: IntrackRecord[]): string {
  if (records.length === 0) return "";

  // The 57 core Intrack Columns in order
  const excelColumns: (keyof IntrackRecord)[] = [
    "Country", "Currency", "Mailer ID", "Source Type", "Publication Date", "Retailer ID", 
    "Retailer Banner", "Retailer Chain Group", "Channel Type", "Region ID", "Region Name", 
    "Theme", "Theme Category", "Significant Thematic", "Significant Thematic Special", 
    "Promotion Start Date", "Promotion End Date", "Town", "Outlet Opening", "Feature ID", 
    "Feature Type", "Product Name", "Brand ID", "Department", "Brand Name", "Brand Type", 
    "Category", "Subcategory", "Subcategory ID", "Supplier Name", "Supplier ID", 
    "Original Price", "Promo Price", "Promo Price (Upper Range)", "Discount %", 
    "No of Pack", "Size", "Limited Buy", "No of Limited Buy", "Activity Name", 
    "Promo Mechanic", "Premium Description", "Special Premium", "Signficant Promotion", 
    "PWP Value", "Member Price Value", "New SKU? New Packaging? New Pack Size", "Exclusivity", 
    "Discount From", "Discount To", "Price Per Pack", "Year", "Month", "Week", "Quarter", 
    "YTD", "MAT"
  ];

  const header = excelColumns.join(",");
  const rows = records.map(rec => {
    return excelColumns.map(col => {
      const val = rec[col];
      if (val === undefined || val === null) {
        return '""';
      }
      const stringVal = String(val);
      // Escape dual-quotes and comma safety
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return `"${stringVal}"`;
    }).join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * List of Column Groups for UI categorizing
 */
export const COLUMN_GROUPS = {
  essential: {
    label: "Essential",
    cols: ["Product Name", "Brand Name", "Promo Price", "Original Price", "Size", "Retailer Banner", "Department"] as (keyof IntrackRecord)[]
  },
  thematics: {
    label: "Campaign & Timing",
    cols: ["Country", "Retailer Banner", "Theme", "Theme Category", "Promotion Start Date", "Promotion End Date", "Year", "Month", "Week", "Quarter"] as (keyof IntrackRecord)[]
  },
  pricing: {
    label: "Pricing & Discounts",
    cols: ["Original Price", "Promo Price", "Promo Price (Upper Range)", "Discount %", "Price Per Pack", "Promo Mechanic", "Premium Description", "Special Premium"] as (keyof IntrackRecord)[]
  },
  productDetails: {
    label: "Product Hierarchy",
    cols: ["Product Name", "Brand Name", "Brand Type", "Department", "Category", "Subcategory", "No of Pack", "Size"] as (keyof IntrackRecord)[]
  },
  all: {
    label: "All Columns (57)",
    cols: [] // Represents all columns dynamically
  }
};
