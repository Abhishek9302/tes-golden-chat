# tes-golden-chat

A minimal persona chat coach built on the Railway golden path.

- **Frontend:** Next.js 14 (App Router, standalone output), login + single chat page
- **Backend:** Express + TypeScript, JWT auth, health check, chat completion route
- **Database:** PostgreSQL `users` table
- **Inference:** Hugging Face inference API via `router.huggingface.co`, with Groq fallback on `400/402/403`
- **Model:** `amkb222/tes-golden-chat-lora`

## Project layout

```
apps/frontend/        Next.js UI
apps/backend/         Express API
database/schema.sql   Postgres schema
.zero-human/
  DEPLOY_MANIFEST.json   Railway deployment manifest
```

## Required environment variables

### Backend (`apps/backend`)

| Variable              | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `PORT`                | Server port (Railway injects)                    |
| `DATABASE_URL`        | Postgres connection string (Railway injects)     |
| `JWT_SECRET`          | Secret for signing auth tokens                   |
| `FINE_TUNED_MODEL_ID` | Hugging Face model id, e.g. `amkb222/tes-golden-chat-lora` |
| `LLM_PROVIDER`        | `huggingface` (default) or `groq`                |
| `HUGGINGFACE_TOKEN`   | Hugging Face access token                        |
| `GROQ_API_KEY`        | Groq API key (fallback)                          |
| `ALLOWED_ORIGINS`     | CORS allowlist (Railway injects frontend domain) |

### Frontend (`apps/frontend`)

| Variable               | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | Backend base URL (Railway injects backend domain) |

## Local development

1. Install dependencies in each app directory:
   ```bash
   cd apps/backend && npm install
   cd apps/frontend && npm install
   ```

2. Create a Postgres database and run `database/schema.sql`.

3. Copy the environment variables above into `.env` files in each app directory.

4. Start the backend:
   ```bash
   cd apps/backend && npm run dev
   ```

5. Start the frontend:
   ```bash
   cd apps/frontend && npm run dev
   ```

## API routes

- `GET /health` — health check with database status
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate and receive JWT
- `POST /api/chat` — send a message to the persona coach (requires JWT)

## Deployment

This repo is configured for [Railway](https://railway.app/) using the manifest in `.zero-human/DEPLOY_MANIFEST.json`.

- Frontend and backend deploy as separate Railway services.
- Railway service variables wire `NEXT_PUBLIC_API_URL` and `DATABASE_URL` automatically.
- PostgreSQL is provisioned as a Railway database service.

## Authored by

Implemented via the Zero-Human platform.
