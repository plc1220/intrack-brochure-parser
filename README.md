# Intrack Brochure Parser

OCR and structured data extraction for retail flyers, using **Amazon Bedrock** (Converse API with multimodal vision and JSON schema structured output).

## Prerequisites

- Node.js 18+
- AWS account with [Bedrock model access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) enabled for your chosen model (default: `amazon.nova-lite-v1:0`)
- AWS credentials configured locally (`aws configure`, `AWS_PROFILE`, or environment variables)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and adjust if needed:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `AWS_REGION` | Bedrock region (default `us-east-1`) |
   | `BEDROCK_MODEL_ID` | Model ID, e.g. `amazon.nova-lite-v1:0`, `amazon.nova-pro-v1:0`, or a Claude vision model |

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 and upload brochure images.

## Production build

```bash
npm run build
npm start
```

## Architecture

- **Frontend**: React + Vite — upload images, review/edit extracted Intrack rows
- **Backend**: Express (`server.ts`) — calls Bedrock `Converse` with image bytes + `outputConfig.textFormat` JSON schema
- **Schema**: `intrack-extraction-schema.ts` — same Intrack column structure as before, in standard JSON Schema for Bedrock structured outputs
