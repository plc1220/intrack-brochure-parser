/**
 * Types representing the Intrack Column Schema and UI states.
 */

export interface IntrackRecord {
  id: string; // Unique string for UI rendering
  Country: string; // MY or SG
  Currency: string; // MYR, SGD, IDR
  "Mailer ID": string; // Intrack mailer tracking ID
  "Source Type": string; // Mailer, Newspaper, Instore (CVSPM), Regional Mailer & Newspaper Regional
  "Publication Date": string; // YYYY-MM-DD
  "Retailer ID": string; // Retailer ID
  "Retailer Banner": string; // Lotus's, Giant, Watsons, BHP, AEON BiG, etc.
  "Retailer Chain Group": string; // Group, e.g. AEON, Watsons Group
  "Channel Type": string; // Hypermarket, Supermarket, CVS, Pharmacy
  "Region ID": string; // Region ID
  "Region Name": string; // West Malaysia, East Malaysia, etc.
  Theme: string; // Promotion Theme, e.g. "Gong Xi Fa Cai", "House Brand Fair"
  "Theme Category": string; // Festive/Religious, Double Date, Multi-Buy Deals, Weekend Promotion, House Brand Promotion
  "Significant Thematic": string; // specific retailer themes (e.g. Watsons - Kaw Kaw Deals)
  "Significant Thematic Special": string; // Yes or No
  "Promotion Start Date": string; // YYYY-MM-DD
  "Promotion End Date": string; // YYYY-MM-DD
  Town: string; // Applicable town for regional promos
  "Outlet Opening": string; // Yes or No
  "Feature ID": string;
  "Feature Type": string; // Price_Off, Discount_Percentage, Discount_Price, Buy_X_Free_Y, Range Premium
  "Product Name": string; // Name with packsize (e.g. Peanut Butter 500G)
  "Brand ID": string;
  Department: string; // Chilled & Frozen, Electrical, Fresh, Grocery, Health & Beauty, Household
  "Brand Name": string; // Ah Huat, Ali Cafe, Topvalu, etc.
  "Brand Type": string; // Branded, Generic, Housebrand
  Category: string; // classification
  Subcategory: string; // segment
  "Subcategory ID": string;
  "Supplier Name": string; // vendor
  "Supplier ID": string;
  "Original Price": number | ""; // Non promo price
  "Promo Price": number; // advertised promo price
  "Promo Price (Upper Range)": number | ""; // range upper
  "Discount %": number | ""; // calculation ((Original - Promo)/Original)*100
  "No of Pack": number; // pack items count
  Size: string; // pack size (e.g. 500G)
  "Limited Buy": string; // Yes or No
  "No of Limited Buy": number | ""; // buying limit
  "Activity Name": string; // contests
  "Promo Mechanic": string; // PO, GWPC, BPO, SPD, etc.
  "Premium Description": string; // details of mechanic
  "Special Premium": string; // Yes or No
  "Signficant Promotion": string; // high value descriptor
  "PWP Value": number | "";
  "Member Price Value": number | "";
  "New SKU? New Packaging? New Pack Size": string; // Yes or No
  Exclusivity: string; // Yes or No
  "Discount From": number | "";
  "Discount To": number | "";
  "Price Per Pack": number | ""; // Single unit price
  Year: number | "";
  Month: number | "";
  Week: number | "";
  Quarter: string; // Q1, Q2, Q3, Q4
  YTD: string; // YTD LY, YTD TY
  MAT: string; // MAT LY, MAT TY
  
  // Custom tracker properties
  imageThumbnail?: string;
  sourceImageName?: string;
  extractedAt?: string;
}

export interface SampleBrochure {
  id: string;
  title: string;
  dateRange: string;
  imageUrl: string;
  retailer: string;
  theme: string;
  category: string;
  records: Omit<IntrackRecord, "id">[];
}
