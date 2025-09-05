## Cursor Rule — Image Editing MVP (KISS)

- **UX**: Desktop-only, modern UI; asset-centric linear history with rollback; no threads/branching.
- **Providers**: Google Gemini 2.5 “Nano Banana” (multimodal + txt2img), Google Imagen 4 (txt2img), Replicate (bg-removal, 4× upscaling).
- **AWS**: All AWS resources are provisioned and invoked via Amplify (eu-central-1): Cognito (Auth), S3 (Storage, presigned URLs), Lambda REST API (API), DynamoDB (Data).
- **Orchestration**: Keep it simple. Synchronous calls + client polling; a single webhook for Replicate.
- **Costs**: Track per-operation usage and USD; dashboard aggregates by model/day; CSV export.
- **Security**: Auth required; private S3 storage; keys stored as Amplify secrets.
- **Scope**: Single-user MVP; no mobile, no moderation.
- **Quality bar**: Favor clarity over cleverness; small modules; explicit data models; minimal state.