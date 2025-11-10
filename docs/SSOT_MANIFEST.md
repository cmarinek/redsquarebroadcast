# Red Square - Single Source of Truth (SSOT) Manifest

**Last Updated**: 2025-01-08  
**Status**: ✅ SSOT Architecture Implemented

---

## ⚠️ IMPORTANT: This Document is Now a Reference Only

**The actual SSOT is now:** `ssot.config.json` (machine-readable)

This document explains the SSOT principles and provides human-readable documentation. For making actual configuration changes, always edit `ssot.config.json` and regenerate configs.

See **[SSOT_ARCHITECTURE.md](./SSOT_ARCHITECTURE.md)** for complete usage guide.

---

## Overview

Red Square uses a strict Single Source of Truth architecture where all configuration values have exactly one authoritative source. This prevents configuration drift, reduces errors, and improves maintainability.

---

## 1. ENVIRONMENT VARIABLES

### 1.1 Frontend Variables (Browser-Exposed)
**SSOT**: `.env` file (VITE_* prefix required)  
**Validation**: `vite.config.ts` (lines 9-15) enforces at build time  
**Consumer**: `src/config/env.ts` validates at runtime

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key | `eyJhbGc...` |
| `VITE_SUPABASE_PROJECT_ID` | ✅ Yes | Supabase project ref | `hqeyyutbuxhyildsasqq` |
| `VITE_MAPBOX_PUBLIC_TOKEN` | ✅ Yes | Mapbox public token | `pk.eyJ1...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `GA_MEASUREMENT_ID` | ❌ No | Google Analytics ID | `G-XXXXXXXXXX` |
| `VITE_APP_NAME` | ❌ No | Application name | `RedSquare` |

**Security Rule**: NEVER put secrets (service role keys, API secrets) in `.env` with VITE_ prefix!

---

### 1.2 Backend Variables (Edge Functions Only)
**SSOT**: Supabase Vault (Project Settings → Edge Functions → Manage Secrets)  
**Access**: `supabase/functions/_shared/env.ts` via `getEnv()` and `getOptionalEnv()`

| Variable | Required | Purpose | Rotation Schedule |
|----------|----------|---------|-------------------|
| `SUPABASE_URL` | ✅ Auto | Supabase URL (auto-injected) | When project changes |
| `SUPABASE_ANON_KEY` | ✅ Auto | Anon key (auto-injected) | When project changes |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Admin database access | Monthly minimum |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe payments | Monthly minimum |
| `MAPBOX_SECRET_TOKEN` | ✅ Yes | Mapbox server-side API | Quarterly |
| `RESEND_API_KEY` | ✅ Yes | Email notifications | Monthly or on incident |
| `HUGGING_FACE_ACCESS_TOKEN` | ✅ Yes | AI video generation | Quarterly |
| `GITHUB_ACCESS_TOKEN` | ✅ Yes | Deploy automation | Per GitHub policy |
| `GITHUB_REPO_OWNER` | ✅ Yes | Deploy repo owner | When repo changes |
| `GITHUB_REPO_NAME` | ✅ Yes | Deploy repo name | When repo changes |

**Security Rule**: All backend secrets logged in `docs/security/secret-rotation-log.md`

---

## 2. APPLICATION IDENTIFIERS

### 2.1 App ID / Bundle ID
**SSOT**: `capacitor.config.ts` → `appId` field  
**Value**: `com.redsquare.platform` (User app) | `com.redsquare.screens` (Display app)

**Consumers**:
- `package.json` → `name` field (must match)
- GitHub Actions workflows (reference via `capacitor.config.ts`)
- `android/app/build.gradle` → `applicationId`
- `ios/App/App.xcodeproj` → Bundle Identifier

**Rule**: All platform configs MUST derive from Capacitor config, not hardcode separately.

---

### 2.2 App Name
**SSOT**: `capacitor.config.ts` → `appName` field  
**Value**: `Red Square` (User app) | `Red Square Screens` (Display app)

**Consumers**:
- `index.html` → `<title>` tag
- `public/manifest.json` → `name` and `short_name`
- App store listings (derived manually)

---

### 2.3 App Version
**SSOT**: `package.json` → `version` field  
**Format**: Semantic versioning `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

**Consumers**:
- `capacitor.config.ts` (no version field, uses package.json)
- GitHub release tags
- App store version numbers

**Rule**: Increment per [Semantic Versioning 2.0.0](https://semver.org/)

---

## 3. SUPABASE CONFIGURATION

### 3.1 Project Metadata
**SSOT**: Supabase Dashboard → Project Settings  
**Project ID**: `hqeyyutbuxhyildsasqq`  
**Region**: `us-east-1` (immutable)

**Consumers**:
- `.env` → `VITE_SUPABASE_URL` and `VITE_SUPABASE_PROJECT_ID`
- `src/integrations/supabase/client.ts` (reads from env)
- Edge functions (auto-injected `SUPABASE_URL`)

---

### 3.2 Database Schema
**SSOT**: `supabase/migrations/*.sql` files  
**Generated Types**: `src/integrations/supabase/types.ts` (auto-generated, READ-ONLY)

**Rule**: NEVER manually edit `types.ts`. Always use migrations, then regenerate types.

---

### 3.3 Row-Level Security (RLS) Policies
**SSOT**: `supabase/migrations/*.sql` files (RLS policy definitions)  
**Documentation**: `docs/security/rls-policies.md` (human-readable explanations)

**Critical Tables with RLS**:
- `profiles` - Users can only read/update their own profile
- `user_roles` - Only admins can modify roles
- `screens` - Owners can CRUD their screens, public can read
- `bookings` - Users can CRUD their own bookings, screen owners can read theirs
- `payments` - Users can only see their own payments
- `payout_requests` - Screen owners can only see their own

---

## 4. USER ROLES & PERMISSIONS

### 4.1 Role Definitions
**SSOT**: Database enum `public.app_role`  
**Defined In**: `supabase/migrations/*_create_user_roles.sql`

**Available Roles**:
```sql
create type public.app_role as enum (
  'admin',
  'screen_owner', 
  'advertiser',
  'support'
);
```

**TypeScript Types**: Auto-generated in `src/integrations/supabase/types.ts`

**Rule**: Add new roles via migration, NOT by editing TypeScript types directly.

---

### 4.2 Role Checking
**SSOT**: `public.has_role(_user_id uuid, _role app_role)` database function  
**Security**: `SECURITY DEFINER` to prevent RLS recursion

**Consumers**:
- RLS policies (e.g., `create policy "Admins can view all" on profiles for select using (public.has_role(auth.uid(), 'admin'))`)
- `src/hooks/useUserRoles.ts` (frontend role checks)
- Edge functions (via database query)

**Rule**: Always use `has_role()` function, never query `user_roles` table directly in policies.

---

### 4.3 Admin Role Protection
**SSOT**: `public.prevent_last_admin_removal()` trigger  
**Purpose**: Prevent removing the last admin user

**Rule**: System MUST always have at least 1 admin. Deleting/demoting last admin throws error.

---

## 5. FEATURE FLAGS & APP SETTINGS

### 5.1 Application Settings
**SSOT**: `app_settings` table (database)  
**Schema**:
```sql
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);
```

**Common Settings**:
- `maintenance_mode` - Boolean, disables all user actions
- `signup_enabled` - Boolean, allows new user registration
- `platform_fee_percentage` - Number, % cut for Red Square
- `payout_minimum_amount` - Number, minimum $ for owner payouts

**Rule**: Use database table as SSOT, NOT environment variables or hardcoded values.

---

### 5.2 Feature Toggles
**SSOT**: `app_settings` table → `feature_flags` key (JSON object)

**Example**:
```json
{
  "ai_video_generation": true,
  "screen_groups": false,
  "ab_testing": true,
  "live_chat_support": false
}
```

**Consumer**: `src/hooks/useFeatureFlag.ts` (to be created)

---

## 6. PRICING & MONETIZATION

### 6.1 Subscription Plans
**SSOT**: `subscription_plans` table (database)  
**Admin UI**: `src/pages/AdminMonetization.tsx`

**Rule**: Plans defined in database, Stripe products synced manually. DO NOT hardcode plan IDs in code.

---

### 6.2 Platform Fees
**SSOT**: `app_settings` table → `platform_fee_percentage` key  
**Default**: 15% (configurable by admin)

**Consumer**: `supabase/functions/owner-earnings/index.ts` (calculates owner payout)

---

## 7. BUILD CONFIGURATION

### 7.1 Build Targets
**SSOT**: `src/config/buildConfig.ts`  
**Values**:
- `web` - Standard web application
- `mobile` - iOS/Android (Capacitor)
- `electron` - Desktop (Windows/macOS/Linux)
- `screen` - TV platforms (Android TV, webOS, Tizen, etc.)

**Environment Variable**: `VITE_BUILD_TARGET` or `BUILD_TARGET`

**Consumers**:
- `vite.config.ts` (build optimization)
- GitHub Actions workflows (platform-specific builds)
- `src/utils/platformDetection.ts` (runtime checks)

---

### 7.2 TV Optimization Flag
**SSOT**: `vite.config.ts` → `isTVOptimized` variable  
**Environment Variable**: `VITE_TV_OPTIMIZED` or `TV_OPTIMIZED`

**Effect**: Enables large touch targets, simplified navigation, performance optimizations

---

## 8. API CONTRACTS

### 8.1 Database Schema
**SSOT**: `src/integrations/supabase/types.ts` (auto-generated from database)  
**Generation Command**: Automatic on migration apply

**Rule**: TypeScript types ALWAYS match database schema exactly.

---

### 8.2 Edge Function Interfaces
**SSOT**: Individual edge function `index.ts` files (request/response types)  
**Documentation**: To be created in `docs/api/edge-functions.md`

**Rule**: Each edge function must export TypeScript interfaces for:
- Request body type
- Response body type
- Error response type

---

## 9. THIRD-PARTY INTEGRATIONS

### 9.1 Stripe
**SSOT**: Stripe Dashboard → Product IDs  
**Sync Process**: Manual mapping to `subscription_plans.stripe_product_id`

**Keys**:
- Publishable key → `.env` → `VITE_STRIPE_PUBLISHABLE_KEY`
- Secret key → Supabase Vault → `STRIPE_SECRET_KEY`

---

### 9.2 Mapbox
**SSOT**: Mapbox Dashboard → Access Tokens  
**Keys**:
- Public token → `.env` → `VITE_MAPBOX_PUBLIC_TOKEN`
- Secret token → Supabase Vault → `MAPBOX_SECRET_TOKEN`

---

### 9.3 Resend (Email)
**SSOT**: Resend Dashboard → API Keys  
**Key**: Supabase Vault → `RESEND_API_KEY`

---

## 10. VALIDATION & ENFORCEMENT

### 10.1 Pre-Build Validation
**Script**: `vite.config.ts` (lines 9-23)  
**Action**: Throws error if required env vars missing

### 10.2 Runtime Validation
**Script**: `src/config/env.ts`  
**Action**: Validates env vars on app initialization

### 10.3 Secret Scanning
**Script**: `scripts/check-secrets.mjs`  
**Action**: Prevents committing secrets to git (pre-commit hook)

---

## 11. CONFLICT RESOLUTION RULES

When multiple sources claim to define the same value:

1. **Environment Variables**: `.env` file wins for frontend, Supabase Vault wins for backend
2. **App Config**: `capacitor.config.ts` wins over `package.json` over hardcoded strings
3. **Database Schema**: Migrations win over manual edits (manual edits rejected)
4. **User Roles**: Database enum wins over TypeScript types (types are generated)
5. **Feature Flags**: Database wins over environment variables wins over hardcoded booleans

---

## 12. CHANGE MANAGEMENT

### 12.1 Adding New Configuration
1. Identify the logical SSOT (environment, database, config file)
2. Update THIS document with the new SSOT
3. Update all consumers to read from SSOT
4. Add validation if critical

### 12.2 Updating Existing Configuration
1. Update the SSOT (as defined in this doc)
2. Verify all consumers auto-sync or update them manually
3. Test in development before production
4. Document the change in git commit message

### 12.3 Deprecating Configuration
1. Mark as deprecated in this document
2. Add warning logs when old config is used
3. Provide migration path to new SSOT
4. Remove after 1 major version

---

## 13. COMPLIANCE & AUDITING

### 13.1 Secret Rotation
**Log**: `docs/security/secret-rotation-log.md`  
**Schedule**: Per SSOT table in section 1.2

### 13.2 Configuration Audit
**Frequency**: Before each production deployment  
**Checklist**:
- [ ] All required env vars present
- [ ] No secrets in `.env` file
- [ ] Database migrations applied
- [ ] No SSOT conflicts detected

---

## Appendix: Quick Reference

| What | Where | How to Change |
|------|-------|---------------|
| Frontend env var | `.env` file | Edit `.env`, restart dev server |
| Backend secret | Supabase Vault | Dashboard → Functions → Secrets |
| App ID | `capacitor.config.ts` | Edit `appId` field |
| User role | Database | Create migration with `alter type` |
| Feature flag | `app_settings` table | Update via admin UI or SQL |
| Database schema | Migrations | Create new migration file |
| RLS policy | Migrations | Create new migration file |
| Pricing | `subscription_plans` table | Update via admin UI or SQL |
| Build target | `src/config/buildConfig.ts` | Edit enum values |

---

**Document Maintainer**: Red Square DevOps Team  
**Review Cycle**: Before each major release  
**Feedback**: Create issue in GitHub repo with `[SSOT]` prefix
