# Development Environment Manifest

Development builds rely on local environment variables that should be provided via `.env.local` (ignored) or your shell. Never commit secret-bearing files.

| Variable | Purpose | Required | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project REST endpoint | ✅ | Use the project URL from the Supabase dashboard. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for client SDK access | ✅ | Treat as sensitive; rotate via the incident playbook if leaked. |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference | ✅ | Used for dashboard deep links and function helpers. |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Mapbox public token for browser maps | ✅ | Scoped to minimum privileges necessary. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for browser checkout | ✅ | Still rotate if exposed unexpectedly. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for scheduled jobs | ✅ | Inject through Supabase Vault or your secrets manager. |
| `MAPBOX_PUBLIC_TOKEN` | Server-side Mapbox token for edge functions | ✅ | Matches the browser token or a server-scoped token. |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing functions | ✅ | Use restricted keys in development. |

Run `npm run validate:env` to ensure your shell is configured before launching `npm run dev`.
