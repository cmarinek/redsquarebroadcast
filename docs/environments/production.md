# Production Environment Manifest

Production secrets are managed by the security/ops team. Every rotation must be tracked in the security change log and notified to on-call engineers.

| Variable | Owner | Rotation Trigger | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Platform Engineering | Project migrations | Immutable after provisioning. |
| `VITE_SUPABASE_ANON_KEY` | Security | Customer data incident, quarterly | Rotate alongside service role key. |
| `VITE_SUPABASE_PROJECT_ID` | Platform Engineering | Project migrations | Shared across all runtime manifests. |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Geo Team | Incident, semi-annual | Provision separate token per environment. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Finance Engineering | Stripe configuration changes | Keep in lockstep with Stripe dashboard. |
| `SUPABASE_SERVICE_ROLE_KEY` | Security/DBA | Monthly or on incident | Stored in Supabase Vault and mirrored in cloud secret manager. Record rotation in `docs/security/secret-rotation-log.md`. |
| `MAPBOX_PUBLIC_TOKEN` | Geo Team | Semi-annual | Use server token with restricted scopes. |
| `STRIPE_SECRET_KEY` | Finance Engineering | Monthly or on incident | Prefer restricted keys with webhook permissions only. |
| `RESEND_API_KEY` | Security/Ops | Monthly or on incident | Required for alert fan-out; store in Supabase Vault and your primary secret manager. |
| `HUGGING_FACE_ACCESS_TOKEN` | AI/ML Team | Quarterly | Token should be read-only and scoped to inference endpoints. |
| `GITHUB_ACCESS_TOKEN` | Platform Engineering | Per GitHub policy or on incident | Use a dedicated machine user with workflow dispatch scope only. |
| `GITHUB_REPO_OWNER` | Platform Engineering | Repository ownership change | Update alongside repository migrations and validate in the deployment pipeline check. |
| `GITHUB_REPO_NAME` | Platform Engineering | Repository rename/move | Update deployment pipeline secrets immediately when repos move. |

Before deployments, run `npm run validate:env` inside CI to ensure all secrets are present. The security/ops rotation runbook documents revocation requirements and all rotations must be logged in the security change log.
