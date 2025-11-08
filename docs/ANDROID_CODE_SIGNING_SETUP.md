# Android Code Signing Setup for RedSquare

This guide walks you through setting up Android code signing for automated builds and Play Store distribution.

## Prerequisites

- Java JDK 8 or higher installed
- Android Studio (optional, but recommended)
- A Google Play Developer account ($25 one-time fee)

## Overview

Android apps require signing with a keystore file to be distributed via Google Play Store. This guide covers:

1. Generating a keystore file
2. Configuring GitHub secrets
3. Building signed APKs/AABs
4. Uploading to Play Store

## Step 1: Generate a Keystore File

### Using Command Line (keytool)

Open a terminal and run:

```bash
keytool -genkey -v -keystore redsquare-release.keystore -alias redsquare -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- **Keystore password**: Choose a strong password (remember this!)
- **Key password**: Can be the same as keystore password
- **Your name**: Your organization name
- **Organizational unit**: Your team/department
- **Organization**: Your company name
- **City/Locality**: Your city
- **State/Province**: Your state
- **Country code**: Two-letter country code (e.g., US)

**CRITICAL**: Save these passwords securely! You'll need them for every app update.

### Using Android Studio

1. Open Android Studio
2. Go to **Build** → **Generate Signed Bundle / APK**
3. Select **Android App Bundle** (recommended) or **APK**
4. Click **Create new...**
5. Fill in:
   - Key store path: Choose where to save it
   - Password: Choose a strong password
   - Alias: `redsquare`
   - Key password: Same as keystore password (recommended)
   - Validity: 25 years (default)
   - Certificate: Fill in your organization details
6. Click **OK**

### Keystore Best Practices

- **Backup your keystore**: Store it in a secure location (encrypted backup, password manager)
- **Never commit to Git**: Add `*.keystore` to `.gitignore`
- **Use different keystores**: Use a separate keystore for testing vs. production
- **Document your credentials**: Store passwords securely (e.g., 1Password, LastPass)

## Step 2: Convert Keystore to Base64

GitHub secrets need the keystore in Base64 format.

### On macOS/Linux:

```bash
base64 -i redsquare-release.keystore -o redsquare-keystore-base64.txt
```

### On Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("redsquare-release.keystore")) | Out-File -FilePath redsquare-keystore-base64.txt
```

The output file will contain your Base64-encoded keystore.

## Step 3: Add Secrets to GitHub

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

### Required Secrets:

1. **ANDROID_SIGNING_KEY_BASE64**
   - Value: Contents of `redsquare-keystore-base64.txt`
   - This is your Base64-encoded keystore file

2. **ANDROID_SIGNING_KEY_ALIAS**
   - Value: `redsquare` (or whatever alias you chose)
   - This is the alias you specified when creating the keystore

3. **ANDROID_SIGNING_KEY_PASSWORD**
   - Value: Your key password
   - This is the password for the key (can be same as store password)

4. **ANDROID_SIGNING_STORE_PASSWORD**
   - Value: Your keystore password
   - This is the password for the keystore file

### Security Notes:

- Never share these values in chat, email, or commit to Git
- Rotate credentials if compromised
- Use GitHub's encrypted secrets feature (they're encrypted at rest)

## Step 4: Verify Build Configuration

The GitHub Action workflow (`.github/workflows/screens-android-mobile-build.yml`) should already be configured to use these secrets.

Key sections:

```yaml
- name: Decode and setup keystore
  if: env.ANDROID_SIGNING_KEY_BASE64 != ''
  run: |
    echo "${{ secrets.ANDROID_SIGNING_KEY_BASE64 }}" | base64 -d > android/app/release.keystore

- name: Build signed Android app
  if: env.ANDROID_SIGNING_KEY_BASE64 != ''
  run: |
    cd android
    ./gradlew assembleRelease \
      -Pandroid.injected.signing.store.file=app/release.keystore \
      -Pandroid.injected.signing.store.password="${{ secrets.ANDROID_SIGNING_STORE_PASSWORD }}" \
      -Pandroid.injected.signing.key.alias="${{ secrets.ANDROID_SIGNING_KEY_ALIAS }}" \
      -Pandroid.injected.signing.key.password="${{ secrets.ANDROID_SIGNING_KEY_PASSWORD }}"
```

## Step 5: Test the Signed Build

### Trigger a Build

1. Go to **Actions** tab in GitHub
2. Select "Build RedSquare Screens (Android Mobile)"
3. Click **Run workflow**
4. Enter a version number (e.g., `1.0.0`)
5. Click **Run workflow**

### Verify the Signature

Once the build completes, download the APK and verify it's signed:

```bash
# Check APK signature
jarsigner -verify -verbose -certs app-release.apk

# Should output:
# jar verified.
```

Or use:

```bash
apksigner verify --verbose app-release.apk
```

## Step 6: Google Play Store Setup

### Create a Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the $25 one-time registration fee
3. Complete the account setup

### Create Your App

1. In Play Console, click **Create app**
2. Fill in:
   - App name: **RedSquare**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free** (or Paid if charging)
   - Declarations: Accept policies

### App Access & Content Rating

Complete all required sections:
- App access (if app requires login/access)
- Ads (declare if app contains ads)
- Content rating questionnaire
- Target audience and content
- Privacy policy URL (required!)

### Prepare Store Listing

1. **App details**:
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, recommended 8)

2. **Create a release**:
   - Go to **Production** → **Create new release**
   - Upload your signed APK or AAB
   - Add release notes
   - Set version name (e.g., 1.0.0)

### Internal Testing (Recommended)

Before production release:

1. Go to **Testing** → **Internal testing**
2. Create a release with your APK/AAB
3. Add test users (email addresses)
4. Share the testing link with your team
5. Get feedback before going live

## Step 7: Upload to Play Store

### Option A: Manual Upload

1. Go to Play Console → **Production**
2. Click **Create new release**
3. Upload your signed APK or AAB
4. Fill in release notes
5. Review and roll out

### Option B: Automated Upload (Advanced)

Use the Google Play Publisher API:

1. Enable Google Play Developer API in Google Cloud Console
2. Create a service account
3. Download JSON key
4. Add to GitHub secrets as `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
5. Use [gradle-play-publisher](https://github.com/Triple-T/gradle-play-publisher) plugin

Example workflow step:

```yaml
- name: Deploy to Play Store
  run: |
    cd android
    ./gradlew publishBundle --track internal
  env:
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
```

## Step 8: App Bundle vs APK

Google recommends using **Android App Bundle (.aab)** instead of APK:

### Benefits of AAB:
- Smaller download sizes (Google generates optimized APKs)
- Supports dynamic feature modules
- Required for new apps on Play Store

### To build AAB instead of APK:

Change the Gradle command in the workflow:

```bash
# APK (current)
./gradlew assembleRelease

# AAB (recommended)
./gradlew bundleRelease
```

Update the artifact path:

```yaml
# APK
path: android/app/build/outputs/apk/release/app-release.apk

# AAB
path: android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### Build fails with "keystore not found"

- Verify `ANDROID_SIGNING_KEY_BASE64` is correctly set
- Check Base64 encoding didn't add extra line breaks
- Ensure the secret name matches exactly in the workflow

### "Invalid keystore format"

- Keystore might be corrupted during Base64 conversion
- Re-encode: `base64 -w 0 < keystore.jks > keystore-base64.txt` (Linux)
- Verify decoding works: `base64 -d < keystore-base64.txt > test.jks`

### "Wrong password"

- Double-check `ANDROID_SIGNING_KEY_PASSWORD` and `ANDROID_SIGNING_STORE_PASSWORD`
- Verify you're using the correct passwords from keystore generation
- Check for extra spaces in the secrets

### Play Store rejects APK

- Ensure version code increments with each release
- Check target SDK version meets Play Store requirements (currently 33+)
- Verify app is properly signed (not debug signed)

### "You uploaded a debuggable APK"

- Make sure you're building with `assembleRelease` not `assembleDebug`
- Check `android/app/build.gradle` has proper release configuration

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

Or use dynamic versioning in the workflow:

```bash
VERSION_CODE=$(date +%s)
sed -i "s/versionCode .*/versionCode $VERSION_CODE/" android/app/build.gradle
```

## Security Checklist

Before going to production:

- [ ] Keystore backed up securely (encrypted, off-site)
- [ ] Passwords stored in password manager
- [ ] GitHub secrets configured correctly
- [ ] Never committed keystore or passwords to Git
- [ ] Test builds work and are properly signed
- [ ] Team members know how to trigger builds
- [ ] Play Store listing complete
- [ ] Privacy policy URL live and accessible
- [ ] App tested on multiple Android versions
- [ ] Screenshots and store assets ready

## Additional Resources

- [Android Developer: Sign your app](https://developer.android.com/studio/publish/app-signing)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [GitHub Actions: Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Google Play Automatic Publishing

Want your builds to automatically upload to Google Play Store for testing?

See our comprehensive guide:
- 🤖 [Google Play Automatic Publishing Setup](./GOOGLE_PLAY_SETUP.md) - Complete walkthrough

This allows you to:
- Automatically upload signed builds to Play Console
- Distribute to testers immediately after builds complete
- Skip manual AAB uploads and streamline your release workflow
- Deploy to internal testing, alpha, beta, or production tracks

## Next Steps

After setup:

1. ✅ Generate keystore
2. ✅ Add secrets to GitHub
3. ✅ Test automated builds
4. ✅ Set up Google Play auto-publishing (optional but recommended)
5. ✅ Create Play Store listing
6. ✅ Upload first release
7. 🚀 Launch your app!

---

**Need help?** Check the [RedSquare documentation](../README.md) or create an issue in the repository.
