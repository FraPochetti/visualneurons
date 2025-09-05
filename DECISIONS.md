## Decisions log

### Confirmed decisions (MVP)
- **UX model**: Asset-centric, chat-style linear history with rollback (no visible threads).
- **Providers**: Google Gemini 2.5 “Nano Banana” (multimodal + txt2img), Google Imagen 4 (txt2img), Replicate (bg-removal, 4× upscaling).
- **Region**: `eu-central-1` for all AWS resources.
- **Infra**: All AWS resources will be provisioned and invoked via AWS Amplify: Hosting, Cognito (Auth), S3 (Storage), Lambda REST API (API), DynamoDB (Data).
- **Secrets**: Stored in Amplify; app uses centralized keys (no BYO keys in MVP).
- **Orchestration**: KISS — synchronous calls and client polling; single webhook (Replicate).
- **Costs**: Track per-operation costs; dashboard aggregates by model/day; CSV export.
- **Scope**: Single-user MVP; desktop-only; no moderation; no video.
- **Style**: KISS-first. Avoid unnecessary abstractions and complex patterns.

### Out of scope (for MVP)
- Mobile UI
- Team/org sharing
- Anthropic or other providers beyond the ones above
- Video generation/editing
- Moderation/NSFW filtering

### Future considerations
- Add more providers/models (Stability/SDXL/Flux) in iteration 2+
- Budgets/alerts and usage caps if multi-user
- WebSockets/AppSync for realtime when needed
- Stripe billing if offered to customers

### Change history
- 2025-08-31: Initial decisions captured.


