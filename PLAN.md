## Implementation plan (MVP – KISS)

Desktop-only, asset-centric image workflow with a chat-style timeline per asset. Providers: Google Gemini 2.5 “Nano Banana” (multimodal + txt2img), Google Imagen 4 (txt2img), Replicate (background removal, 4× upscaling). AWS Amplify in eu-central-1 with Cognito, S3 (presigned URLs), Lambda REST API, DynamoDB. All AWS resources are provisioned and invoked via Amplify. Keep it simple: synchronous API calls + client polling; a single webhook for Replicate.

### Phase 0 — Foundations
- [x] Set up Amplify app (eu-central-1) and Hosting pipeline (prod + preview envs)
- [ ] Configure Cognito user pool and basic hosted UI; JWT validation in API (Amplify Auth)
- [ ] Provision S3 buckets (raw/derivatives/thumbnails) with CORS, KMS, lifecycle rules (Amplify Storage)
- [ ] Store provider secrets in Amplify (Google, Replicate)

### Phase 1 — Backend API and data (KISS, REST)
- [ ] Define DynamoDB tables and GSIs (provisioned via Amplify): `Users`, `Assets`, `Messages`, `Versions`, `Operations`, `CostEvents`
- [ ] Scaffold REST API (Amplify API REST → API Gateway + Lambda TypeScript) with auth middleware
- [ ] Implement media upload/download via presigned S3 URLs
- [ ] Implement asset endpoints: `POST /assets`, `GET /assets`, `GET /assets/{id}`
- [ ] Implement message endpoints: `GET /assets/{id}/messages`, `POST /assets/{id}/messages`
- [ ] Implement costs endpoint and CSV export: `GET /costs?from&to&model`, `GET /costs.csv`
- [ ] Add Replicate webhook endpoint (Amplify API route): `POST /replicate/webhook` (update Operations/Versions and costs)

### Phase 2 — Provider integrations
- [ ] Integrate Gemini 2.5 Nano Banana (multimodal + txt2img) with cost capture
- [ ] Integrate Google Imagen 4 txt2img with cost capture
- [ ] Integrate Replicate background removal and 4× upscaling; persist outputs

### Phase 3 — Desktop-first modern UI
- [x] Scaffold Next.js + TypeScript + Tailwind + shadcn/ui + Radix (dark theme, desktop-only)
- [x] Build layout: AssetList (left), ChatTimeline (center), Inspector (right)
- [ ] Implement Asset creation: upload (drag-drop/paste) or prompt (Imagen/Gemini)
- [ ] Implement Message composer: provider/tool selector, minimal params
- [ ] Implement timeline: result cards, progress polling, error states
- [ ] Implement linear versioning and one-click rollback (thumbnails and active badge)

### Phase 4 — Cost tracking UI
- [ ] Implement dashboard UI with filters (date range, model)
- [ ] Show totals, sparkline chart, and CSV export button

### Phase 5 — Polish and ops
- [ ] Add keyboard shortcuts and command palette (send/tools/rollback)
- [ ] Add validations (file type/size) and basic rate limiting
- [ ] Add structured logs and basic alarms

### Data model (concise)
- `User(userId, email, createdAt)`
- `Asset(assetId, userId, title, coverS3Key, latestVersionId, createdAt)`
- `Message(messageId, assetId, type, provider, model, params, inputRefs[], outputRefs[], status, createdAt)`
- `Operation(operationId, messageId, kind, providerPayload, status, progress, error, createdAt)`
- `Version(versionId, assetId, parentVersionId, createdByMessageId, s3Key, width, height, createdAt)`
- `CostEvent(id, ts, userId, model, provider, units, costUSD)`

### API surface (initial)
- `POST /assets` — create asset via upload or prompt
- `GET /assets` — list assets
- `GET /assets/{id}` — get asset
- `GET /assets/{id}/messages` — list messages
- `POST /assets/{id}/messages` — run provider/tool operation
- `POST /upload-url` — presign S3 upload
- `GET /download-url` — presign S3 download
- `POST /replicate/webhook` — async update from Replicate
- `GET /costs?from&to&model` — costs rollup
- `GET /costs.csv?from&to&model` — CSV export

### Acceptance criteria (MVP)
- Upload or generate an image (Gemini 2.5 / Imagen 4)
- Run background removal/upscale (Replicate); see progress and results
- Chat-style linear history; one-click rollback to earlier version
- Private storage with presigned URLs; authenticated access only
- Cost dashboard by model/day; CSV export

### Guiding principles
- KISS: minimal abstractions, small functions, clear modules
- No queues/Step Functions/WebSockets in MVP; polling + single webhook only
- Desktop-only, modern visuals; fast interactions and smooth transitions


