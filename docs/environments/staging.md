# Staging Environment Manifest

Staging uses the same variable set as development but values must come from your staging secrets manager (e.g., Supabase Vault, AWS Parameter Store). Coordinate updates with security/ops so rotation events are logged.

| Variable | Purpose | Rotation Frequency |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase REST endpoint | When project ref changes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for staging clients | Quarterly or on incident |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref | When project ref changes |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Mapbox public token | Quarterly |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | With secret key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for scheduled jobs | Monthly minimum |
| `MAPBOX_PUBLIC_TOKEN` | Mapbox token for edge functions | Quarterly |
| `STRIPE_SECRET_KEY` | Stripe secret key | Monthly minimum |

Configure CI/CD pipelines to pass these values as environment variables at deploy time. Use `npm run validate:env` within pipeline preflight checks.
