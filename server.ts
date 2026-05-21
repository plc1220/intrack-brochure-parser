import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";
import { INSTRACK_EXTRACTION_SCHEMA } from "./intrack-extraction-schema";

dotenv.config();

const app = express();
const PORT = 3000;

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0";

const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

// Increase payload limit to handle large uploaded images in base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const EXTRACTION_PROMPT = `Analyze this shopping flyer/brochure page and extract every promotional product item and matching campaign details into the Intrack column format specified in the JSON schema.

Instructions:
1. Locate the retailer banner (e.g. "AEON BiG"), promotion validity dates, theme, and region.
2. Go through each product shown on the page carefully. Read the product name, brand, volume/weight, promotional prices, original prices, and special mechanics from the flyer.
3. Map them precisely to the provided data schema.
4. For brand types, if own brand (like Topvalu, BIG Value, Living Choice for AEON BiG), assign "Housebrand".
5. For department, look at what type of product it is and map to 'Chilled & Frozen', 'Electrical', 'Fresh', 'Grocery', 'Health & Beauty', 'Household'.
6. Keep dates in YYYY-MM-DD format. The promotion shown is typically around April - May 2026.
7. Be thorough and capture ALL distinct promo items displayed.`;

function mimeToImageFormat(
  mimeType: string
): "jpeg" | "png" | "gif" | "webp" {
  const normalized = (mimeType || "image/jpeg").toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("gif")) return "gif";
  return "jpeg";
}

// API Endpoint for OCR analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { base64Image, mimeType, fileName } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image data in request body." });
    }

    const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Buffer.from(cleanedBase64, "base64");

    const response = await bedrockClient.send(
      new ConverseCommand({
        modelId: BEDROCK_MODEL_ID,
        messages: [
          {
            role: "user",
            content: [
              {
                image: {
                  format: mimeToImageFormat(mimeType),
                  source: { bytes: imageBytes },
                },
              },
              { text: EXTRACTION_PROMPT },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 8192,
          temperature: 0.1,
        },
        outputConfig: {
          textFormat: {
            type: "json_schema",
            structure: {
              jsonSchema: {
                schema: JSON.stringify(INSTRACK_EXTRACTION_SCHEMA),
                name: "intrack_brochure_extraction",
                description:
                  "Structured extraction of promotional brochure data for Intrack",
              },
            },
          },
        },
      })
    );

    const text = response.output?.message?.content?.[0]?.text;
    if (!text) {
      throw new Error("No response received from Amazon Bedrock.");
    }

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: parsedData,
      sourceImageName: fileName || "uploaded_brochure.jpg",
    });
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    console.error("Bedrock OCR Analysis Error:", error);

    const message = err.message || "An error occurred during OCR analysis.";
    const isAuthError =
      err.name === "CredentialsProviderError" ||
      err.name === "UnrecognizedClientException" ||
      message.includes("credentials");

    return res.status(500).json({
      error: isAuthError
        ? "AWS credentials are not configured. Set AWS_PROFILE or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, enable the Bedrock model in your account, and retry."
        : message,
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
    console.log(`[Bedrock] region=${AWS_REGION} model=${BEDROCK_MODEL_ID}`);
  });
}

configureServer();
