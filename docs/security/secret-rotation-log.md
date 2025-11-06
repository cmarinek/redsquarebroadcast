# Secret Rotation Change Log

Security/Ops owns this document. Update it whenever runtime secrets are rotated or revoked. Capture the ticket reference and a brief summary so future incidents have traceability.

| Date | Environment | Secret(s) | Change Ticket | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| 2025-02-14 | production | SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | SEC-2042 | security-ops | Purged committed artifacts, rotated keys, and updated GitHub/CI secrets per incident checklist. |
| YYYY-MM-DD | production | SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY | SEC-1234 | security-ops | Rotated after CI guardrail failure. |

> ⚠️ Do **not** store actual key material in this log. Use it only to record metadata about the rotation event and where the keys are vaulted.

Reference the [Supabase & Third-Party Key Rotation Playbook](../runbooks/supabase-key-rotation.md) for full procedures.
