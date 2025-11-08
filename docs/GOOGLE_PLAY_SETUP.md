# Google Play Automatic Publishing Setup

This guide explains how to set up automatic Google Play Store publishing for RedSquare Android builds. Once configured, successful Android builds will automatically upload to Google Play Console for testing or production release.

## Overview

When you push code or trigger a build, the workflow will:
1. Build and sign your Android app (AAB format)
2. Upload to Google Play Console automatically
3. Assign to specified track (internal/alpha/beta/production)
4. Make it available for testing or release
5. Process the build in Play Console

## Prerequisites

- ✅ Google Play Developer account ($25 one-time fee)
- ✅ App created in Google Play Console
- ✅ Android code signing configured (see [Android Code Signing Setup](./ANDROID_CODE_SIGNING_SETUP.md))
- ✅ First manual release completed (required by Google)

## Step 1: Create App in Play Console

If you haven't already:

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name**: RedSquare
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
   - Accept declarations
4. Click **Create app**
5. Complete:
   - App access
   - Ads declaration
   - Content rating
   - Target audience
   - Privacy policy
   - Store listing (description, screenshots, etc.)

## Step 2: Complete First Manual Release

**IMPORTANT**: Google requires a manual first release before API access works.

### Create Internal Testing Release

1. Go to **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload your signed AAB manually
4. Add release notes
5. Review and **Roll out**

This establishes your app in the Play Console and enables API access.

## Step 3: Create Service Account

Service accounts allow automated, secure access to Play Console.

### Enable Google Play Developer API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Go to **APIs & Services** → **Library**
4. Search for **Google Play Android Developer API**
5. Click **Enable**

### Create Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name**: `GitHub Actions Play Publisher`
   - **Description**: `Service account for automated Play Store uploads`
4. Click **Create and Continue**
5. **Skip** granting access (we'll do this in Play Console)
6. Click **Done**

### Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create**
6. **Save the JSON file securely** - you can't download it again!

## Step 4: Link Service Account to Play Console

Now connect the service account to your Play Console account.

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Users and permissions** (sidebar)
3. Click **Invite new users**
4. Enter the service account email (format: `name@project-id.iam.gserviceaccount.com`)
5. Set permissions:
   - **Account permissions**: None
   - **App permissions**: Click **Add app**
   - Select your app (RedSquare)
   - Grant these permissions:
     - ✅ **View app information** (and download bulk reports)
     - ✅ **Manage production releases**
     - ✅ **Manage testing track releases**
     - ✅ **Release to production, exclude devices, and use Play App Signing**
6. Click **Invite user**
7. The service account will be added immediately (no email confirmation needed)

## Step 5: Add Secrets to GitHub

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

### Required Secrets:

1. **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - Value: Full contents of the JSON key file you downloaded
   - This should be the entire JSON object (starts with `{` and ends with `}`)
   - Example format:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-123",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "github-actions@your-project-123.iam.gserviceaccount.com",
     ...
   }
   ```

2. **GOOGLE_PLAY_PACKAGE_NAME**
   - Value: Your app's package name (e.g., `com.redsquare.screens`)
   - Find this in Play Console → App → Dashboard or in `android/app/build.gradle`

3. **GOOGLE_PLAY_TRACK** (Optional)
   - Value: Target release track
   - Options: `internal`, `alpha`, `beta`, `production`
   - Default: `internal` (if not set)
   - Recommended: Start with `internal` for automatic uploads

### Security Notes:

- Never commit the JSON key file to Git
- Backup the JSON file securely (encrypted storage, password manager)
- Service accounts should have minimum required permissions
- Rotate keys if compromised (create new key, revoke old)

## Step 6: Verify Workflow Configuration

The workflow at `.github/workflows/screens-android-mobile-build.yml` should already be configured for Google Play publishing.

Key sections:

```yaml
- name: Setup Google Play Service Account
  if: env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON != ''
  run: |
    echo "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" > service-account.json

- name: Upload to Google Play Internal Testing
  if: env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON != ''
  run: |
    # Upload AAB to Google Play Console
    # Automatically assigns to specified track
```

## Step 7: Test Google Play Publishing

### Trigger a Build

1. Make sure Android code signing is configured (required)
2. Go to **Actions** tab in GitHub
3. Select "Build RedSquare Screens (Android Mobile)"
4. Click **Run workflow**
5. Enter version (e.g., `1.0.1`)
6. Click **Run workflow**

### Monitor the Build

1. Watch the workflow progress
2. Build steps:
   - ✅ Build Android AAB (5-10 min)
   - ✅ Sign with keystore
   - ✅ Upload to Google Play (2-5 min)

### Check Play Console

1. Go to [Play Console](https://play.google.com/console)
2. Select your app → **Testing** → **Internal testing** (or your configured track)
3. Your build will appear within a few minutes
4. Status will show **Available for testing**

## Step 8: Distribute to Testers

Once the build appears in Play Console:

### Add Internal Testers

1. In Play Console → **Testing** → **Internal testing**
2. Under **Testers**, click **Create email list**
3. Name: `Beta Testers`
4. Add email addresses (up to 100 for internal testing)
5. Save the list
6. Testers will receive email invitations
7. They can join via the provided link

### Create Closed Testing (Alpha/Beta)

For broader testing:

1. Go to **Testing** → **Closed testing**
2. Create a new track (Alpha or Beta)
3. Add email lists or create test groups
4. Promote a release from internal testing
5. Set up automatic distribution (optional)

### Open Testing (Public Beta)

For public beta testing:

1. Go to **Testing** → **Open testing**
2. Create a release
3. Anyone can opt-in via Play Store
4. No email required
5. Useful for pre-launch testing

## Release Tracks Explained

### Internal Testing
- **Purpose**: Team testing
- **Max testers**: 100
- **Review time**: None
- **Best for**: Quick iteration, CI/CD automation
- **Recommended**: Use this for automatic uploads

### Closed Testing (Alpha/Beta)
- **Purpose**: Broader testing groups
- **Max testers**: Unlimited
- **Review time**: None (after first approval)
- **Best for**: External testers, stakeholders

### Open Testing
- **Purpose**: Public beta
- **Max testers**: Unlimited
- **Review time**: App Review required
- **Best for**: Pre-launch public testing

### Production
- **Purpose**: Public release
- **Max testers**: Unlimited (all users)
- **Review time**: Full App Review (~24-48 hours)
- **Best for**: Final release
- **Note**: Don't use for automatic uploads unless fully tested!

## Automatic vs Manual Upload

### When Play Store Upload Happens

Upload is **automatic** when:
- ✅ Android code signing secrets are configured
- ✅ Google Play service account JSON is configured
- ✅ Build completes successfully

Upload is **skipped** when:
- ❌ No service account JSON configured
- ❌ No code signing configured (unsigned build)
- ❌ Build fails

### Change Target Track

Update the `GOOGLE_PLAY_TRACK` secret to change where builds are uploaded:

- `internal` - Internal testing (100 testers, fastest)
- `alpha` - Closed alpha testing (unlimited testers)
- `beta` - Closed beta testing (unlimited testers)
- `production` - Public release (⚠️ not recommended for automation)

### Manual Upload Alternative

If you prefer manual control:

1. Download the AAB from GitHub Actions artifacts
2. Upload manually via Play Console:
   - Go to **Testing** → desired track
   - Click **Create new release**
   - Upload AAB
   - Add release notes
   - Review and **Roll out**

## Version Management

### Update Version for Each Release

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2      // Increment by 1 each release
        versionName "1.0.1" // Your public version string
    }
}
```

**IMPORTANT**: 
- `versionCode` must be unique and incrementing (required by Play Store)
- `versionName` is the user-facing version string
- Play Store rejects uploads with duplicate `versionCode`

### Automated Version Bumping

Add to your workflow (before build step):

```bash
# Auto-increment version code
VERSION_CODE=$(date +%s)
sed -i "s/versionCode .*/versionCode $VERSION_CODE/" android/app/build.gradle
```

Or use a more controlled approach:

```bash
# Read current version code and increment
CURRENT_VERSION=$(grep versionCode android/app/build.gradle | awk '{print $2}')
NEW_VERSION=$((CURRENT_VERSION + 1))
sed -i "s/versionCode .*/versionCode $NEW_VERSION/" android/app/build.gradle
```

## Troubleshooting

### Upload fails with "Authentication failed"

- Verify service account JSON is complete and valid
- Check service account has correct permissions in Play Console
- Ensure Google Play Android Developer API is enabled
- Verify package name matches exactly

### Upload fails with "Package not found"

- Complete at least one manual release first
- Verify package name in secrets matches your app
- Check that app is published (even to internal testing)

### Upload fails with "Version code already exists"

- Increment `versionCode` in `android/app/build.gradle`
- Each upload requires a unique, incrementing version code
- Implement automated version bumping

### Build doesn't appear in Play Console

- Wait a few minutes for processing
- Check **Testing** → Your configured track
- Verify upload step completed successfully in GitHub Actions
- Look for errors in Play Console email notifications

### "APK/AAB signature verification failed"

- Ensure keystore is correctly configured
- Verify keystore passwords are correct
- Check that AAB is signed with your release keystore
- First upload establishes your signing certificate (can't change later!)

### Service account permission errors

- Verify service account has all required permissions:
  - View app information
  - Manage testing track releases
  - Release to production
- Check invitation was accepted in Play Console
- Wait a few minutes after granting permissions

## Security Best Practices

- [ ] Service account JSON stored in GitHub secrets only
- [ ] JSON key file backed up securely
- [ ] Service account has minimum required permissions
- [ ] Monitor Play Console activity for unauthorized uploads
- [ ] Rotate keys annually or if compromised
- [ ] Use internal testing track for automation (not production)
- [ ] Manual review before promoting to production

## Play Store Submission Checklist

Before going to production:

- [ ] Complete all store listing requirements
- [ ] Add screenshots for all device sizes
- [ ] Write app description and feature graphic
- [ ] Set content rating (questionnaire)
- [ ] Add privacy policy URL
- [ ] Configure pricing and distribution
- [ ] Test thoroughly via internal testing
- [ ] Get beta tester feedback
- [ ] Review all Play Console warnings
- [ ] Ensure version code is higher than previous release

## Limitations

### Upload Limits
- Maximum AAB size: 150 MB (200 MB with APK expansion files)
- Maximum 100 active releases per track
- Version code must be 0-2100000000

### Tester Limits
- Internal testing: 100 testers
- Closed testing: Unlimited
- Open testing: Unlimited

### Processing Time
- Internal testing: Usually instant
- Closed/Open testing: Few minutes
- Production: 24-48 hours for review

## Next Steps After Setup

1. ✅ Configure service account
2. ✅ Add GitHub secrets
3. ✅ Trigger a test build
4. ✅ Verify upload to Play Console
5. ✅ Add internal testers
6. ✅ Distribute first automated build
7. ✅ Set up release notes automation
8. 🚀 Enable for your release workflow

## Automated Distribution Flow

With everything configured:

```mermaid
graph LR
    A[Push to main] --> B[Build Android AAB]
    B --> C[Sign with Keystore]
    C --> D[Upload to Play Console]
    D --> E[Assign to Track]
    E --> F[Process in Play Console]
    F --> G[Notify Testers]
    G --> H[Testers Install via Play Store]
```

## Additional Resources

- [Google Play Developer API Documentation](https://developers.google.com/android-publisher)
- [Play Console Help Center](https://support.google.com/googleplay/android-developer)
- [Service Account Setup Guide](https://developers.google.com/android-publisher/getting_started)
- [Android Code Signing Guide](./ANDROID_CODE_SIGNING_SETUP.md)
- [Automated Builds Setup](./AUTO_BUILD_SETUP.md)
- [Gradle Play Publisher Plugin](https://github.com/Triple-T/gradle-play-publisher) (alternative approach)

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or review build logs in GitHub Actions.
