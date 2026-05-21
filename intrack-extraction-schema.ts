/** JSON Schema for Bedrock structured output (Converse API outputConfig.textFormat). */
export const INSTRACK_EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    Country: {
      type: "string",
      description: "Breakdown of country: either 'MY' or 'SG'.",
    },
    Currency: {
      type: "string",
      description: "Currency of prices: 'MYR' or 'SGD'.",
    },
    "Source Type": {
      type: "string",
      description: "Type of mailer source, e.g. 'Mailer', 'Newspaper', 'Instore (CVSPM)'.",
    },
    "Publication Date": {
      type: "string",
      description:
        "Date when Retailer published, in YYYY-MM-DD pattern. If not clear, default or leave empty.",
    },
    "Retailer Banner": {
      type: "string",
      description:
        "The retailer banner name, e.g. 'AEON BiG', 'Lotus\\'s', 'Giant', 'Watsons', 'Guardian', 'BHP'.",
    },
    "Retailer Chain Group": {
      type: "string",
      description:
        "The group owning the retailer, e.g. 'AEON Group' for AEON BiG, 'Lotus\\'s Group', 'Watsons Group', etc.",
    },
    "Channel Type": {
      type: "string",
      description: "Channel type, e.g. 'Hypermarket', 'Supermarket', 'CVS', 'Pharmacy'.",
    },
    "Region Name": {
      type: "string",
      description: "Breakdown of Markets: e.g. 'West Malaysia' or 'East Malaysia'.",
    },
    Theme: {
      type: "string",
      description: "Theme of promotion event, e.g. 'House Brand Fair', 'Your Life Your Brand'.",
    },
    "Theme Category": {
      type: "string",
      description:
        "Standardized classification e.g. 'Festive/Religious', 'Double Date', 'Multi-Buy Deals', 'Weekend Promotion', 'House Brand Promotion'.",
    },
    "Significant Thematic": {
      type: "string",
      description: "Specific theme text e.g. 'AEON BiG - House Brand Fair'.",
    },
    "Significant Thematic Special": {
      type: "string",
      description: "Is it a significant thematic? 'Yes' or 'No'.",
    },
    "Promotion Start Date": {
      type: "string",
      description: "Date of when promotion starts in YYYY-MM-DD format (e.g. '2026-04-09').",
    },
    "Promotion End Date": {
      type: "string",
      description: "Date of when promotion ends in YYYY-MM-DD format (e.g. '2026-05-06').",
    },
    Town: {
      type: "string",
      description:
        "Applicable town for regional promotions, e.g. 'Raub, Bentong' or empty if nationwide.",
    },
    "Outlet Opening": {
      type: "string",
      description: "Does the flyer highlight a new outlet opening? 'Yes' or 'No'.",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          "Product Name": {
            type: "string",
            description:
              "Product full name with packing/size, e.g. 'Caramelized Biscuit Spread 350G', 'Peanut Butter Creamy 500G'.",
          },
          "Brand Name": {
            type: "string",
            description: "The brand name from the brochure, e.g. 'Topvalu', 'BIG Value', 'Living Choice'.",
          },
          Department: {
            type: "string",
            description:
              "Six main departments in MailerTrack: 'Chilled & Frozen', 'Electrical', 'Fresh', 'Grocery', 'Health & Beauty', 'Household'.",
          },
          "Brand Type": {
            type: "string",
            description:
              "Type of Brand: 'Branded', 'Generic', 'Housebrand'. Note: Topvalu, BIG Value and Living Choice are AEON BiG 'Housebrand'.",
          },
          Category: {
            type: "string",
            description:
              "General category, e.g. 'Jam & Spread', 'Frozen Meat', 'Detergent', 'Beverage', 'Snacks'.",
          },
          Subcategory: {
            type: "string",
            description:
              "Subcategory of the item, e.g. 'Peanut Butter', 'Chocolate Malt', 'Liquid Detergent', 'Chicken Nuggets'.",
          },
          "Original Price": {
            type: "number",
            description:
              "Non-promo advertised price (numeric). If none is advertised, do not output or leave 0.",
          },
          "Promo Price": {
            type: "number",
            description: "The primary advertised promo unit price (numeric, e.g. 14.90).",
          },
          "Promo Price (Upper Range)": {
            type: "number",
            description:
              "The high value if a retail price range is advertised (e.g. if 'RM7.50-16.90', set upper to 16.90). Otherwise 0.",
          },
          Size: {
            type: "string",
            description: "Product pack size description, e.g. '500G', '1.8kg', '350G', '1KG'.",
          },
          "No of Pack": {
            type: "integer",
            description: "Number of packs or individual units included, e.g. 1. If multi-buy like 2x1lit, set 2.",
          },
          "Limited Buy": {
            type: "string",
            description: "Is purchase limited? 'Yes' or 'No'.",
          },
          "No of Limited Buy": {
            type: "integer",
            description: "Max units allowed for limited buy (e.g. 3). If no limit, set to 0.",
          },
          "Promo Mechanic": {
            type: "string",
            description:
              "Mechanic code: PO (Price Offer), GWPC (Gift With Purchase), BPO, SPD (Second Pack Discount), MPG (Multi Purchase Gift), PWP.",
          },
          "Premium Description": {
            type: "string",
            description:
              "Any special note or bundle mechanic text, e.g. 'Buy 3 @ RM12.90' or flavor details.",
          },
          "Special Premium": {
            type: "string",
            description: "Is there a premium description or gift? 'Yes' or 'No'.",
          },
          "Signficant Promotion": {
            type: "string",
            description:
              "Promotion descriptor trigger e.g. 'Price Offer (PO)', 'Second Pack Discount (SPD)', 'Gift With Purchase (GWPN)', 'Multi Purchase Gift (MPG)', or 'No'.",
          },
          "PWP Value": {
            type: "number",
            description: "PWP Value price if Purchase with Purchase, otherwise 0.",
          },
          "Member Price Value": {
            type: "number",
            description: "Member price value if advertised, otherwise 0.",
          },
          "New SKU? New Packaging? New Pack Size": {
            type: "string",
            description: "Whether labeled as new: 'Yes' or 'No'.",
          },
          Exclusivity: {
            type: "string",
            description: "Is it exclusive to this store? 'Yes' or 'No'.",
          },
        },
        required: ["Product Name", "Promo Price"],
      },
    },
  },
  required: ["Country", "Currency", "Retailer Banner", "items"],
} as const;
