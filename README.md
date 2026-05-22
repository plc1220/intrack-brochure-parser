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
NODE_ENV=production npm start
```

## Deployment (recommended: AWS App Runner)

This app calls **Amazon Bedrock** on the server, so hosting on AWS with an **instance IAM role** (no long-lived access keys in `.env`) is the simplest and safest option.

| Option | Best for |
|--------|----------|
| **AWS App Runner** (recommended) | Managed container, auto HTTPS, IAM role → Bedrock in the same region |
| **ECS Fargate** | Teams already on ECS / need VPC networking |
| **Railway / Render / Fly.io** | Quick external hosting; set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as platform secrets |

### App Runner one-time setup

1. **ECR**: Create a repository (e.g. `intrack-brochure-parser`).
2. **IAM role for App Runner** (instance role): Allow `bedrock:InvokeModel` on your model in the same region as the service.
3. **App Runner service**: Create from the ECR image, port **3000**, attach the instance role above. Set env vars `NODE_ENV=production`, `AWS_REGION`, `BEDROCK_MODEL_ID`.
4. **GitHub OIDC for deploy**: Create an IAM role trusted by your repo (`token.actions.githubusercontent.com`) with permissions to push to ECR and update/start the App Runner service.

### GitHub Actions

Workflow: [`.github/workflows/ci-deploy.yml`](.github/workflows/ci-deploy.yml)

- **Every PR / push**: `npm ci` → `lint` → `build`
- **Push to `main`**: build Docker image, push to ECR, update App Runner, start deployment

Configure the **`production`** environment:

| Type | Name | Example |
|------|------|---------|
| Secret | `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-deploy-intrack` |
| Secret | `APP_RUNNER_SERVICE_ARN` | `arn:aws:apprunner:us-east-1:...:service/...` |
| Variable | `AWS_REGION` | `us-east-1` |
| Variable | `ECR_REPOSITORY` | `intrack-brochure-parser` |
| Variable | `BEDROCK_MODEL_ID` | `amazon.nova-lite-v1:0` (optional) |

Until those secrets exist, CI still runs; the deploy job will fail at the AWS step—add secrets when you are ready to ship.

### Local Docker smoke test

```bash
docker build -t intrack-brochure-parser .
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  intrack-brochure-parser
```

## Architecture

- **Frontend**: React + Vite — upload images, review/edit extracted Intrack rows
- **Backend**: Express (`server.ts`) — calls Bedrock `Converse` with image bytes + `outputConfig.textFormat` JSON schema
- **Schema**: `intrack-extraction-schema.ts` — same Intrack column structure as before, in standard JSON Schema for Bedrock structured outputs
