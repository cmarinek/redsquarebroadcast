# Red Square Automated Build System Setup

## Required GitHub Secrets

To enable the automated build system, the following secrets must be configured in your GitHub repository settings:

### Core Secrets
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for database access
- `GH_ACTION_SECRET` - Secret token for authenticating GitHub Actions with Supabase

### Repository Configuration
- `GITHUB_REPO_OWNER` - GitHub username/organization (set in Supabase Edge Function environment)
- `GITHUB_REPO_NAME` - Repository name (set in Supabase Edge Function environment)  
- `GITHUB_ACCESS_TOKEN` - GitHub personal access token with repo permissions

### Android Build Secrets (Optional)
- `ANDROID_SIGNING_KEY_BASE64` - Base64 encoded Android keystore file
- `ANDROID_SIGNING_KEY_ALIAS` - Keystore alias
- `ANDROID_SIGNING_KEY_PASSWORD` - Key password
- `ANDROID_SIGNING_STORE_PASSWORD` - Keystore password

## Supported Platforms

### ✅ Android TV
- **Build Type**: APK for Android TV devices
- **Storage Bucket**: `app_artifacts`
- **Workflow**: `.github/workflows/android-build.yml`
- **Trigger Event**: `trigger-android_tv-build`

### ✅ Desktop Windows  
- **Build Type**: EXE for Windows desktop
- **Storage Bucket**: `app_artifacts`
- **Workflow**: `.github/workflows/desktop-build.yml`
- **Trigger Event**: `trigger-desktop_windows-build`

### ✅ iOS
- **Build Type**: IPA for iPhone/iPad
- **Storage Bucket**: `ios-files`
- **Workflow**: `.github/workflows/ios-build.yml`
- **Trigger Event**: `trigger-ios-build`
- **Note**: Requires macOS runner and proper code signing setup

### ✅ Android Mobile
- **Build Type**: APK for Android phones/tablets
- **Storage Bucket**: `apk-files`
- **Workflow**: `.github/workflows/android-mobile-build.yml`
- **Trigger Event**: `trigger-android_mobile-build`

## How It Works

1. **Admin Triggers Build**: Admin clicks build button in dashboard
2. **Edge Function Called**: `trigger-app-build` creates database record
3. **GitHub Workflow Dispatched**: Repository webhook triggers appropriate workflow
4. **Build Process**: GitHub Actions builds the application
5. **Artifact Upload**: Built file uploaded to Supabase storage
6. **Status Updates**: Build status tracked in real-time via database updates

## Database Schema

### `app_builds` Table
```sql
- id: UUID (Primary Key)
- app_type: TEXT (android_tv, desktop_windows, ios, android_mobile)
- version: TEXT (Auto-generated timestamp version)
- status: TEXT (pending, in_progress, success, failed, cancelled)
- triggered_by: UUID (Admin user ID)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP  
- logs_url: TEXT (GitHub Actions run URL)
- artifact_url: TEXT (Download URL for built app)
- commit_hash: TEXT (Git commit used for build)
```

## Security

- All builds require admin authentication
- RLS policies protect build data
- Storage buckets have appropriate access controls
- GitHub secrets are encrypted and secure

## Monitoring

- Real-time build status updates in Admin Dashboard
- Build history with download links
- Direct links to GitHub Actions logs
- Automatic failure notifications