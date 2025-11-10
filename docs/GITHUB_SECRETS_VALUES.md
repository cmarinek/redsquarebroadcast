# GitHub Secrets - Exact Values to Configure

## 🔐 Copy These Values to GitHub Repository Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

---

## ✅ Frontend Environment Variables (From .env)

```
Name: VITE_SUPABASE_URL
Value: https://hqeyyutbuxhyildsasqq.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE
```

```
Name: VITE_SUPABASE_PROJECT_ID
Value: hqeyyutbuxhyildsasqq
```

```
Name: VITE_MAPBOX_PUBLIC_TOKEN
Value: pk.eyJ1Ijoid29ya2xpZmUiLCJhIjoiY21lN3RtZml1MDA4dTJrcG5qeGY0djViMiJ9.GhuooJQjkOEru7SPUIoKdQ
```

```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51PFzhNB52MmS2sJY9VxnmPlmfOxvfwKpC8lEPTFU3nVNVKLDk38OxanmCqT7TYqkHIgxHXfUUsBjjwlvLENj96Di00Xqr30ULS
```

---

## ⚠️ Backend Secrets (Already in Supabase - Copy to GitHub)

These are already configured in Supabase. You need to copy the SAME values to GitHub:

### 1. SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase Dashboard → Project Settings → API → service_role key]
```
**How to find:** https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/settings/api

---

### 2. MAPBOX_PUBLIC_TOKEN
```
Name: MAPBOX_PUBLIC_TOKEN
Value: pk.eyJ1Ijoid29ya2xpZmUiLCJhIjoiY21lN3RtZml1MDA4dTJrcG5qeGY0djViMiJ9.GhuooJQjkOEru7SPUIoKdQ
```
(Same as VITE_MAPBOX_PUBLIC_TOKEN)

---

### 3. STRIPE_SECRET_KEY
```
Name: STRIPE_SECRET_KEY
Value: [Your Stripe secret key - starts with sk_live_ or sk_test_]
```
**How to find:** Stripe Dashboard → Developers → API keys → Secret key

---

### 4. RESEND_API_KEY
```
Name: RESEND_API_KEY
Value: [Your Resend API key - starts with re_]
```
**How to find:** Resend Dashboard → API Keys

---

### 5. HUGGING_FACE_ACCESS_TOKEN
```
Name: HUGGING_FACE_ACCESS_TOKEN
Value: [Your Hugging Face token - starts with hf_]
```
**How to find:** HuggingFace → Settings → Access Tokens

---

### 6. GH_ACCESS_TOKEN
```
Name: GH_ACCESS_TOKEN
Value: [Your GitHub Personal Access Token]
```
**How to create:**
1. Go to: https://github.com/settings/tokens/new
2. Select scopes: `repo` (full control)
3. Generate token
4. Copy the token value

**Note:** GitHub restricts the `GITHUB_` prefix for secrets, so we use `GH_` instead.

---

## 🔑 GitHub Configuration

```
Name: GH_REPO_OWNER
Value: [Your GitHub username or organization name]
Example: john-doe
```

```
Name: GH_REPO_NAME
Value: [Your repository name]
Example: red-square-platform
```

**Note:** GitHub restricts the `GITHUB_` prefix for secrets, so we use `GH_` instead.

---

## 🚨 CRITICAL - GH_ACTION_SECRET

This is the MOST IMPORTANT secret - without it, builds will stay "pending" forever!

**Generate it:**
```bash
# Run this command in your terminal:
openssl rand -base64 32
```

Then add to GitHub:
```
Name: GH_ACTION_SECRET
Value: [Output from the command above]
Example: xK8mP2vQ9nR4tY6wZ1bA3cD5eF7gH8jL0mN2pQ4rS6t=
```

**ALSO add this same secret to Supabase:**
1. Go to: https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/settings/functions
2. Add new secret: `GH_ACTION_SECRET` with the same value

---

## ✅ Android Signing (Already Configured)

You mentioned you already configured these:
- ✅ ANDROID_SIGNING_KEY_BASE64
- ✅ ANDROID_SIGNING_KEY_ALIAS  
- ✅ ANDROID_SIGNING_KEY_PASSWORD
- ✅ ANDROID_SIGNING_STORE_PASSWORD

---

## 📋 Quick Checklist

Copy this checklist and mark each as you add them to GitHub:

### Frontend (5 secrets)
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_SUPABASE_PROJECT_ID
- [ ] VITE_MAPBOX_PUBLIC_TOKEN
- [ ] VITE_STRIPE_PUBLISHABLE_KEY

### Backend (5 secrets)
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] MAPBOX_PUBLIC_TOKEN
- [ ] STRIPE_SECRET_KEY
- [ ] RESEND_API_KEY
- [ ] HUGGING_FACE_ACCESS_TOKEN

### GitHub Config (3 secrets)
- [ ] GH_ACCESS_TOKEN
- [ ] GH_REPO_OWNER
- [ ] GH_REPO_NAME

### Critical (1 secret)
- [ ] GH_ACTION_SECRET (GitHub)
- [ ] GH_ACTION_SECRET (Supabase)

### Android (4 secrets - already done)
- [x] ANDROID_SIGNING_KEY_BASE64
- [x] ANDROID_SIGNING_KEY_ALIAS
- [x] ANDROID_SIGNING_KEY_PASSWORD
- [x] ANDROID_SIGNING_STORE_PASSWORD

---

## 🧪 After Adding All Secrets

1. Go to your Admin Dashboard: `/admin-project-overview`
2. Navigate to Build Manager
3. Trigger a test build for `screens_android_mobile`
4. Watch GitHub Actions tab: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/actions`
5. Verify build status updates from "pending" → "in_progress" → "success"

---

## 📖 Need Help Finding Values?

- **Supabase API Keys**: https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/settings/api
- **Supabase Secrets**: https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/settings/functions
- **Stripe Keys**: https://dashboard.stripe.com/apikeys
- **Resend Keys**: https://resend.com/api-keys
- **Hugging Face**: https://huggingface.co/settings/tokens
- **GitHub PAT**: https://github.com/settings/tokens/new
