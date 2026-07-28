# Changelog

## [1.0.0] - TES-7

### Added
- Initial persona chat coach app following the Railway golden path.
- `apps/frontend`: Next.js 14 standalone app with login and single chat page.
- `apps/backend`: Express + TypeScript API with JWT auth, health check, and chat route.
- `database/schema.sql`: PostgreSQL `users` table.
- Chat completion via Hugging Face `router.huggingface.co/v1/chat/completions` using model `amkb222/tes-golden-chat-lora`.
- Groq fallback (`llama3-8b-8192`) when Hugging Face returns `400`, `402`, or `403`.
- `.zero-human/DEPLOY_MANIFEST.json` configured for Railway hosting, Hugging Face inference, and kaggle-unsloth training profile.
