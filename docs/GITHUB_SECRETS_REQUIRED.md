# GitHub Secrets Configuration for CI/CD

This document lists all GitHub secrets that must be configured for the RedSquare platform builds to pass.

## Required Secrets for ALL Workflows

These secrets must be configured in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Frontend Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL (e.g., `https://hqeyyutbuxhyildsasqq.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID (e.g., `hqeyyutbuxhyildsasqq`)
- `VITE_MAPBOX_PUBLIC_TOKEN` - Mapbox public token
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_... or pk_test_...)

### Backend Secrets (for Edge Functions)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret, never expose to frontend)
- `MAPBOX_PUBLIC_TOKEN` - Mapbox token (can be same as VITE_MAPBOX_PUBLIC_TOKEN)
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_... or sk_test_...)
- `RESEND_API_KEY` - Resend API key for email notifications
- `HUGGING_FACE_ACCESS_TOKEN` - Hugging Face API token for AI features
- `GITHUB_ACCESS_TOKEN` - GitHub personal access token for build triggers
- `GITHUB_REPO_OWNER` - GitHub repository owner
- `GITHUB_REPO_NAME` - GitHub repository name

### Build System Secrets
- `GH_ACTION_SECRET` - Secret token for updating build status (Supabase function auth)

### Android/iOS Signing (Optional, for signed builds)
- `ANDROID_SIGNING_KEY_BASE64` - Base64-encoded Android keystore file
- `ANDROID_SIGNING_KEY_ALIAS` - Android keystore alias
- `ANDROID_SIGNING_KEY_PASSWORD` - Android keystore key password
- `ANDROID_SIGNING_STORE_PASSWORD` - Android keystore store password

## How to Configure Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Save

## Testing Workflow Configuration

After configuring secrets, you can manually trigger any workflow:

1. Go to **Actions** tab in GitHub
2. Select a workflow (e.g., "Build RedSquare Screens (Android TV)")
3. Click **Run workflow**
4. Enter build_id and version
5. Click **Run workflow**

The workflow should now execute without missing secret errors.

## Current Values (Reference Only - DO NOT COMMIT ACTUAL SECRETS)

Based on your `.env` file, you should set these values in GitHub Secrets:

```
VITE_SUPABASE_URL=https://hqeyyutbuxhyildsasqq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=hqeyyutbuxhyildsasqq
VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ1Ijoid29ya2xpZmUiLCJhIjoiY21lN3RtZml1MDA4dTJrcG5qeGY0djViMiJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51PFzhNB52MmS2sJY9VxnmPlmfOxvfwKpC8lEPTFU3nVNVKLDk38OxanmCqT7TYqkHIgxHXfUUsBjjwlvLENj96Di00Xqr30ULS
```

**IMPORTANT:** Never commit actual secret values to your repository!
