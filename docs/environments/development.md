# Development Environment Manifest

Development builds rely on local environment variables that should be provided via `.env.local` (ignored) or your shell. Never commit secret-bearing files.

| Variable | Purpose | Required | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project REST endpoint | ✅ | Use the project URL from the Supabase dashboard. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for client SDK access | ✅ | Treat as sensitive; rotate via the incident playbook if leaked. |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference | ✅ | Used for dashboard deep links and function helpers. |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Mapbox public token for browser maps | ✅ | Scoped to minimum privileges necessary. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for browser checkout | ✅ | Still rotate if exposed unexpectedly. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for scheduled jobs | ✅ | Inject through Supabase Vault or your secrets manager and log formal rotations with security/ops. |
| `MAPBOX_PUBLIC_TOKEN` | Server-side Mapbox token for edge functions | ✅ | Matches the browser token or a server-scoped token. |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing functions | ✅ | Use restricted keys in development. |
| `RESEND_API_KEY` | Resend transactional email API key | ✅ | Required for notification functions; request sandbox key from security/ops. |
| `HUGGING_FACE_ACCESS_TOKEN` | HuggingFace inference token | ✅ | Needed for demo video generator; scope to limited models. |
| `GITHUB_ACCESS_TOKEN` | GitHub PAT for deployment automations | ✅ | Use a fine-grained token with `repo` and workflow dispatch permissions only. |
| `GITHUB_REPO_OWNER` | GitHub org or user that owns deployment repo | ✅ | Usually `redsquarehq`; keep in sync with deployment-pipeline function. |
| `GITHUB_REPO_NAME` | Repository slug used for app builds | ✅ | Matches the repo receiving workflow dispatch events. |

Run `npm run validate:env` to ensure your shell is configured before launching `npm run dev`. Report any rotation back to the shared security change log so the production record stays in sync.
