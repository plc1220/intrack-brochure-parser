import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit to handle large uploaded images in base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for structured extraction of brochure details
const instrackExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    Country: { 
      type: Type.STRING, 
      description: "Breakdown of country: either 'MY' or 'SG'." 
    },
    Currency: { 
      type: Type.STRING, 
      description: "Currency of prices: 'MYR' or 'SGD'." 
    },
    "Source Type": { 
      type: Type.STRING, 
      description: "Type of mailer source, e.g. 'Mailer', 'Newspaper', 'Instore (CVSPM)'." 
    },
    "Publication Date": { 
      type: Type.STRING, 
      description: "Date when Retailer published, in YYYY-MM-DD pattern. If not clear, default or leave empty." 
    },
    "Retailer Banner": { 
      type: Type.STRING, 
      description: "The retailer banner name, e.g. 'AEON BiG', 'Lotus\\'s', 'Giant', 'Watsons', 'Guardian', 'BHP'." 
    },
    "Retailer Chain Group": { 
      type: Type.STRING, 
      description: "The group owning the retailer, e.g. 'AEON Group' for AEON BiG, 'Lotus\\'s Group', 'Watsons Group', etc." 
    },
    "Channel Type": { 
      type: Type.STRING, 
      description: "Channel type, e.g. 'Hypermarket', 'Supermarket', 'CVS', 'Pharmacy'." 
    },
    "Region Name": { 
      type: Type.STRING, 
      description: "Breakdown of Markets: e.g. 'West Malaysia' or 'East Malaysia'." 
    },
    Theme: { 
      type: Type.STRING, 
      description: "Theme of promotion event, e.g. 'House Brand Fair', 'Your Life Your Brand'." 
    },
    "Theme Category": { 
      type: Type.STRING, 
      description: "Standardized classification e.g. 'Festive/Religious', 'Double Date', 'Multi-Buy Deals', 'Weekend Promotion', 'House Brand Promotion'." 
    },
    "Significant Thematic": { 
      type: Type.STRING, 
      description: "Specific theme text e.g. 'AEON BiG - House Brand Fair'." 
    },
    "Significant Thematic Special": { 
      type: Type.STRING, 
      description: "Is it a significant thematic? 'Yes' or 'No'." 
    },
    "Promotion Start Date": { 
      type: Type.STRING, 
      description: "Date of when promotion starts in YYYY-MM-DD format (e.g. '2026-04-09')." 
    },
    "Promotion End Date": { 
      type: Type.STRING, 
      description: "Date of when promotion ends in YYYY-MM-DD format (e.g. '2026-05-06')." 
    },
    Town: { 
      type: Type.STRING, 
      description: "Applicable town for regional promotions, e.g. 'Raub, Bentong' or empty if nationwide." 
    },
    "Outlet Opening": { 
      type: Type.STRING, 
      description: "Does the flyer highlight a new outlet opening? 'Yes' or 'No'." 
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          "Product Name": { 
            type: Type.STRING, 
            description: "Product full name with packing/size, e.g. 'Caramelized Biscuit Spread 350G', 'Peanut Butter Creamy 500G'." 
          },
          "Brand Name": { 
            type: Type.STRING, 
            description: "The brand name from the brochure, e.g. 'Topvalu', 'BIG Value', 'Living Choice'." 
          },
          Department: { 
            type: Type.STRING, 
            description: "Six main departments in MailerTrack: 'Chilled & Frozen', 'Electrical', 'Fresh', 'Grocery', 'Health & Beauty', 'Household'." 
          },
          "Brand Type": { 
            type: Type.STRING, 
            description: "Type of Brand: 'Branded', 'Generic', 'Housebrand'. Note: Topvalu, BIG Value and Living Choice are AEON BiG 'Housebrand'." 
          },
          Category: { 
            type: Type.STRING, 
            description: "General category, e.g. 'Jam & Spread', 'Frozen Meat', 'Detergent', 'Beverage', 'Snacks'." 
          },
          Subcategory: { 
            type: Type.STRING, 
            description: "Subcategory of the item, e.g. 'Peanut Butter', 'Chocolate Malt', 'Liquid Detergent', 'Chicken Nuggets'." 
          },
          "Original Price": { 
            type: Type.NUMBER, 
            description: "Non-promo advertised price (numeric). If none is advertised, do not output or leave 0." 
          },
          "Promo Price": { 
            type: Type.NUMBER, 
            description: "The primary advertised promo unit price (numeric, e.g. 14.90)." 
          },
          "Promo Price (Upper Range)": { 
            type: Type.NUMBER, 
            description: "The high value if a retail price range is advertised (e.g. if 'RM7.50-16.90', set upper to 16.90). Otherwise 0." 
          },
          Size: { 
            type: Type.STRING, 
            description: "Product pack size description, e.g. '500G', '1.8kg', '350G', '1KG'." 
          },
          "No of Pack": { 
            type: Type.INTEGER, 
            description: "Number of packs or individual units included, e.g. 1. If multi-buy like 2x1lit, set 2." 
          },
          "Limited Buy": { 
            type: Type.STRING, 
            description: "Is purchase limited? 'Yes' or 'No'." 
          },
          "No of Limited Buy": { 
            type: Type.INTEGER, 
            description: "Max units allowed for limited buy (e.g. 3). If no limit, set to 0." 
          },
          "Promo Mechanic": { 
            type: Type.STRING, 
            description: "Mechanic code: PO (Price Offer), GWPC (Gift With Purchase), BPO, SPD (Second Pack Discount), MPG (Multi Purchase Gift), PWP." 
          },
          "Premium Description": { 
            type: Type.STRING, 
            description: "Any special note or bundle mechanic text, e.g. 'Buy 3 @ RM12.90' or flavor details." 
          },
          "Special Premium": { 
            type: Type.STRING, 
            description: "Is there a premium description or gift? 'Yes' or 'No'." 
          },
          "Signficant Promotion": { 
            type: Type.STRING, 
            description: "Promotion descriptor trigger e.g. 'Price Offer (PO)', 'Second Pack Discount (SPD)', 'Gift With Purchase (GWPN)', 'Multi Purchase Gift (MPG)', or 'No'." 
          },
          "PWP Value": { 
            type: Type.NUMBER, 
            description: "PWP Value price if Purchase with Purchase, otherwise 0." 
          },
          "Member Price Value": { 
            type: Type.NUMBER, 
            description: "Member price value if advertised, otherwise 0." 
          },
          "New SKU? New Packaging? New Pack Size": { 
            type: Type.STRING, 
            description: "Whether labeled as new: 'Yes' or 'No'." 
          },
          Exclusivity: { 
            type: Type.STRING, 
            description: "Is it exclusive to this store? 'Yes' or 'No'." 
          }
        },
        required: ["Product Name", "Promo Price"]
      }
    }
  },
  required: ["Country", "Currency", "Retailer Banner", "items"]
};

// API Endpoint for OCR analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { base64Image, mimeType, fileName } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image data in request body." });
    }

    // Check if API key is loaded
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured. Please add your credentials in Settings > Secrets to enable live AI extraction." 
      });
    }

    const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanedBase64,
      },
    };

    const textPart = {
      text: `Analyze this shopping flyer/brochure page and extract every promotional product item and matching campaign details into the Intrack column format specified in the JSON schema.

Instructions:
1. Locate the retailer banner (e.g. "AEON BiG"), promotion validity dates, theme, and region.
2. Go through each product shown on the page carefully. Read the product name, brand, volume/weight, promotional prices, original prices, and special mechanics from the flyer.
3. Map them precisely to the provided data schema.
4. For brand types, if own brand (like Topvalu, BIG Value, Living Choice for AEON BiG), assign "Housebrand".
5. For department, look at what type of product it is and map to 'Chilled & Frozen', 'Electrical', 'Fresh', 'Grocery', 'Health & Beauty', 'Household'.
6. Keep dates in YYYY-MM-DD format. The promotion shown is typically around April - May 2026.
7. Be thorough and capture ALL distinct promo items displayed.`,
    };

    // Run structured generation
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: instrackExtractionSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini engine.");
    }

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: parsedData,
      sourceImageName: fileName || "uploaded_brochure.jpg"
    });

  } catch (error: any) {
    console.error("Gemini OCR Analysis Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during OCR analysis."
    });
  }
});

// Setup Vite Dev server or production static server
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Intrack Server] running on http://0.0.0.0:${PORT}`);
  });
}

configureServer();
