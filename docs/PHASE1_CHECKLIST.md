# Phase 1: Critical Fixes - Completion Checklist

**Status**: 🔄 IN PROGRESS  
**Started**: 2025-01-08  
**Target Completion**: 2025-01-10  
**Priority**: CRITICAL - Must complete before proceeding to Phase 2

---

## 1.1 Environment Variable SSOT Violation ✅ COMPLETE

### Issues Fixed:
- [x] `.env` file updated with correct VITE_ prefixes
- [x] Removed backend secrets from `.env` (service role key, stripe secret)
- [x] Added missing `VITE_STRIPE_PUBLISHABLE_KEY` variable
- [x] Created `docs/SSOT_MANIFEST.md` as single source of truth
- [x] Documented which variables go where (frontend vs backend)

### Verification:
```bash
# App should start without errors
npm run dev

# Expected: Dev server starts on port 8080
# Expected: No "Missing required runtime environment variables" errors
```

### SSOT Established:
- **Frontend**: `.env` file (VITE_* variables only)
- **Backend**: Supabase Vault (secrets without VITE_ prefix)
- **Validation**: `vite.config.ts` (build time) + `src/config/env.ts` (runtime)

**Status**: ✅ **FIXED** - App now starts successfully

---

## 1.2 Build System Failures ✅ FIXED

### Issues Fixed:
- [x] GitHub Actions failing for Screens application builds
- [x] Missing SUPABASE_URL environment variable in workflow files
- [x] Inconsistent secret references across workflows
- [x] All workflows now have standardized env configuration

### Actions Completed:

#### 1.2.1 Fixed All GitHub Actions Workflows
**Added `SUPABASE_URL` derived from `VITE_SUPABASE_URL`** to all workflows:

**Workflows Fixed**:
- [x] `.github/workflows/screens-android-tv-build.yml`
- [x] `.github/workflows/screens-samsung-tizen-build.yml`
- [x] `.github/workflows/screens-lg-webos-build.yml`
- [x] `.github/workflows/screens-roku-build.yml`
- [x] `.github/workflows/screens-amazon-fire-build.yml`
- [x] `.github/workflows/screens-ios-build.yml`
- [x] `.github/workflows/screens-linux-build.yml`
- [x] `.github/workflows/screens-windows-build.yml`
- [x] `.github/workflows/screens-macos-build.yml`
- [x] `.github/workflows/screens-android-mobile-build.yml`
- [x] `.github/workflows/redsquare-android-build.yml`

#### 1.2.2 Documentation Created
- [x] Created `docs/GITHUB_SECRETS_REQUIRED.md` with complete setup guide
- [x] Documented all required secrets for CI/CD

### Remaining Action Required (USER):
⚠️ **BLOCKER**: Configure GitHub secrets in repository settings

**Required Secrets** (see `docs/GITHUB_SECRETS_REQUIRED.md`):
- Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_PROJECT_ID, VITE_MAPBOX_PUBLIC_TOKEN, VITE_STRIPE_PUBLISHABLE_KEY
- Backend: SUPABASE_SERVICE_ROLE_KEY, MAPBOX_PUBLIC_TOKEN, STRIPE_SECRET_KEY, RESEND_API_KEY, HUGGING_FACE_ACCESS_TOKEN
- Build System: GH_ACTION_SECRET, GITHUB_ACCESS_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME
- Optional: Android signing keys (ANDROID_SIGNING_KEY_BASE64, etc.)

#### How to Configure Secrets:
```bash
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from docs/GITHUB_SECRETS_REQUIRED.md
4. Test a workflow by manually triggering it
```

### Success Criteria:
- ✅ All GitHub Actions workflows have correct env configuration
- ✅ SUPABASE_URL properly derived from VITE_SUPABASE_URL
- ✅ Consistent secret references across all workflows
- ⏳ GitHub secrets need to be configured by repository owner

**Status**: ✅ **WORKFLOWS FIXED** - ⚠️ **Awaiting GitHub secrets configuration**

---

## 1.3 Database Security Audit 🔄 IN PROGRESS

### Critical Tables to Review:

#### 1.3.1 `profiles` Table
**RLS Status**: Enabled ✅  
**Policies Added**: Yes ✅

**Policies to Test**:
- [ ] Users can view their own profile
- [ ] Users can update their own profile
- [ ] Users cannot view other users' profiles (unless public)
- [ ] Admins can view all profiles

**Test Script**:
```sql
-- Test as regular user (should only see own profile)
select * from profiles where user_id = auth.uid();

-- Test as admin (should see all profiles)
select * from profiles;
```

#### 1.3.2 `payments` Table
**RLS Status**: Enabled ✅  
**Policies Added**: Yes ✅

**Policies to Test**:
- [ ] Users can only view their own payments
- [ ] Screen owners can view payments for their bookings
- [ ] Admins can view all payments
- [ ] Users cannot modify payments (only edge functions can)

**Test Script**:
```sql
-- Test as regular user (should only see own payments)
select * from payments where user_id = auth.uid();

-- Test inserting payment as user (should fail)
insert into payments (user_id, amount, status) values (auth.uid(), 100, 'pending');
```

#### 1.3.3 `user_roles` Table
**RLS Status**: Enabled ✅  
**Admin Protection**: `prevent_last_admin_removal()` trigger exists ✅

**Policies to Test**:
- [ ] Only admins can view user_roles table
- [ ] Only admins can grant/revoke roles
- [ ] Cannot remove last admin role (trigger test)
- [ ] Role changes logged to `admin_audit_logs`

**Test Script**:
```sql
-- Test removing last admin (should fail)
delete from user_roles where role = 'admin';

-- Test granting admin role (should create security alert)
insert into user_roles (user_id, role) values ('some-user-id', 'admin');

-- Verify alert created
select * from admin_security_alerts where alert_type = 'role_change' order by created_at desc limit 1;
```

#### 1.3.4 Public Tables Review
**Tables That Should Be Public** (verify RLS is appropriate):
- [ ] `screens` - Public can view, owners can CRUD
- [ ] `content_uploads` - Users can CRUD their own
- [ ] `bookings` - Users can CRUD their own, screen owners can view theirs
- [ ] `subscription_plans` - Public can view, admins can modify
- [ ] `app_settings` - Public can view certain keys, admins can modify

#### 1.3.5 `has_role()` Function Verification
**Status**: Function exists ✅  
**Security**: `SECURITY DEFINER` ✅  
**Set search_path**: `public` ✅

**Test Script**:
```sql
-- Test has_role function
select public.has_role(auth.uid(), 'admin');
select public.has_role(auth.uid(), 'screen_owner');

-- Test in RLS policy (should not cause recursion)
select * from screens; -- Uses has_role in policy
```

### Security Scan Results:
**Run Command**: 
```bash
# From Supabase dashboard
Run SQL: select public.validate_schema_integrity();
```

**Expected Result**: `true` (all critical tables exist and have RLS)

### Success Criteria:
- [ ] Zero RLS policy violations found
- [ ] All sensitive tables have policies tested
- [ ] No recursive RLS issues detected
- [ ] Admin protection triggers working
- [ ] Security alerts generated for role changes

**Status**: 🔄 **IN PROGRESS** - Requires manual testing in Supabase dashboard

---

## Post-Phase 1 Validation

### Final Checklist:
- [ ] App starts without environment variable errors ✅
- [ ] All GitHub Actions workflows passing ⚠️
- [ ] Database security audit complete (zero critical issues) 🔄
- [ ] SSOT document created and reviewed ✅
- [ ] No secrets exposed in `.env` file ✅

### Ready for Phase 2?
**Criteria**:
1. All checkboxes above marked ✅
2. App running in development mode
3. At least 1 successful build per platform (web, mobile, screens)
4. No critical security vulnerabilities

**Current Status**: 
- ✅ Environment SSOT fixed
- ⚠️ Build system needs GitHub secrets
- 🔄 Security audit in progress

**Blocker**: Need Stripe publishable key value to proceed with builds

---

## Notes & Issues

### Remaining Critical Issues:
1. **Stripe Publishable Key Missing**: User must add actual key value to `.env`
2. **GitHub Secrets**: Need to configure secrets in GitHub repo settings for CI/CD
3. **Database Testing**: Manual RLS policy testing required (cannot automate without test users)

### Next Steps:
1. User provides Stripe publishable key
2. Configure GitHub repository secrets
3. Test RLS policies with multiple user accounts
4. Run security scan in Supabase dashboard
5. Proceed to Phase 2 (User Role Completion)

---

**Last Updated**: 2025-01-08 by Lovable AI  
**Next Review**: After Phase 1 completion
