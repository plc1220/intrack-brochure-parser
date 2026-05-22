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
   | `AWS_REGION` | Bedrock region (default `ap-southeast-1`) |
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

## Deployment (recommended: Amazon ECS Express Mode)

This app calls **Amazon Bedrock** on the server, so hosting on AWS with an **ECS task role** (no long-lived access keys in `.env`) is the simplest and safest option.

| Option | Best for |
|--------|----------|
| **Amazon ECS Express Mode** (recommended) | Managed ECS/Fargate service, load balancer, auto scaling, IAM task role → Bedrock |
| **Standard ECS Fargate** | Teams that want full networking/service control |
| **Railway / Render / Fly.io** | Quick external hosting; set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as platform secrets |

### ECS Express Mode one-time setup

Use region **`ap-southeast-1`**.

1. **ECR**: Create a private repository named `intrack-brochure-parser`.
2. **ECS execution role**: Create or use `ecsTaskExecutionRole` with the AWS-managed `AmazonECSTaskExecutionRolePolicy`.
3. **ECS infrastructure role**: Create an ECS Express Mode infrastructure role with the AWS-managed `AmazonECSInfrastructureRoleforExpressGatewayServices` policy.
4. **App task role**: Create a task role for this app, for example `ecsIntrackBrochureParserTaskRole`, and allow `bedrock:InvokeModel` for the Bedrock model you use.
5. **GitHub OIDC deploy role**: Create an IAM role trusted by your repo (`token.actions.githubusercontent.com`) with permissions to push to ECR, pass the ECS roles above, and create/update ECS Express Mode services.

### GitHub Actions

Workflow: [`.github/workflows/ci-deploy.yml`](.github/workflows/ci-deploy.yml)

- **Every PR / push**: `npm ci` → `lint` → `build`
- **Push to `main`**: build Docker image, push to ECR, create/update the ECS Express Mode service

Configure the **`production`** environment:

| Type | Name | Example |
|------|------|---------|
| Secret | `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-deploy-intrack` |
| Variable | `AWS_REGION` | `ap-southeast-1` |
| Variable | `AWS_ACCOUNT_ID` | `123456789012` |
| Variable | `ECR_REPOSITORY` | `intrack-brochure-parser` |
| Variable | `ECS_CLUSTER` | `default` |
| Variable | `ECS_SERVICE` | `intrack-brochure-parser` |
| Variable | `ECS_EXECUTION_ROLE_ARN` | `arn:aws:iam::123456789012:role/ecsTaskExecutionRole` |
| Variable | `ECS_INFRASTRUCTURE_ROLE_ARN` | `arn:aws:iam::123456789012:role/ecsInfrastructureRoleForExpressServices` |
| Variable | `ECS_TASK_ROLE_ARN` | `arn:aws:iam::123456789012:role/ecsIntrackBrochureParserTaskRole` |
| Variable | `BEDROCK_MODEL_ID` | `amazon.nova-lite-v1:0` (optional) |

Until those secrets exist, CI still runs; the deploy job will fail at the AWS step—add secrets when you are ready to ship.

### Local Docker smoke test

```bash
docker build -t intrack-brochure-parser .
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=ap-southeast-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  intrack-brochure-parser
```

## Architecture

- **Frontend**: React + Vite — upload images, review/edit extracted Intrack rows
- **Backend**: Express (`server.ts`) — calls Bedrock `Converse` with image bytes + `outputConfig.textFormat` JSON schema
- **Schema**: `intrack-extraction-schema.ts` — same Intrack column structure as before, in standard JSON Schema for Bedrock structured outputs
