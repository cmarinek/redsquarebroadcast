# Supabase & Third-Party Key Rotation Playbook

## Trigger Conditions
- Secret exposure (detected by monitoring or incident response)
- Scheduled rotation window (monthly for Supabase service role, Stripe secret keys)
- Platform migration (new Supabase project or Stripe account)

## Stakeholders
- **Security/Ops (primary)** — owns revocation, vault updates, and incident ticket.
- **Platform Engineering** — updates deployment configs, runs `npm run validate:env`.
- **Support/Success** — communicates downtime expectations if needed.

## Rotation Steps
1. **Open incident ticket** referencing the affected environment and keys. Assign to security/ops and document timeline.
2. **Generate new credentials** in the vendor console:
   - Supabase: regenerate anon and service role keys; capture the new project ref if it changed.
   - Stripe: create restricted `sk_` key with minimal scope plus matching publishable key.
   - Mapbox: issue new token with environment-specific scopes.
3. **Update secret managers**:
   - Store keys in Supabase Vault under `app.settings.*` and in the platform secret manager (e.g., GitHub Actions secrets, AWS Secrets Manager).
   - Record the rotation in the security change log with timestamps and approvers.
4. **Propagate to infrastructure**:
   - Redeploy edge functions to pick up Deno runtime variables.
   - For database cron jobs, ensure `app.settings.supabase_service_role_key` is set via `ALTER DATABASE` or Vault secret before running migrations.
   - Run `npm run setup:hooks` locally (if not already configured) and `npm run validate:env` in CI to confirm presence.
5. **Invalidate old credentials** once new ones are live and smoke tests succeed. For Supabase keys, revoke via dashboard; for Stripe and Mapbox, delete the old tokens.
6. **Communicate completion** to on-call and update the incident ticket with:
   - Key identifiers rotated
   - Validation commands executed
   - Monitoring checks confirming healthy status

## Post-Incident Tasks
- Review secret scanning output in CI for the offending commit.
- Add regression tests or alerts if the leak vector was process-based.
- Schedule retro with security/ops to capture follow-up improvements.
