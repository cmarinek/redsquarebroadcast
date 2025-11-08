# Quick Start: Android Code Signing (5 Minutes)

Fast-track guide to get Android code signing working for automated builds.

## Prerequisites

- Java JDK installed
- Terminal/Command Prompt access
- GitHub repository admin access

## Step 1: Generate Keystore (2 minutes)

Open terminal and run:

```bash
keytool -genkey -v -keystore redsquare-release.keystore -alias redsquare -keyalg RSA -keysize 2048 -validity 10000
```

Fill in when prompted:
- **Keystore password**: Choose a strong password
- **Key password**: Press Enter (same as keystore password)
- **Name**: Your organization name
- **Other fields**: Fill as needed or press Enter

**SAVE THESE PASSWORDS!** You'll need them for every update.

## Step 2: Convert to Base64 (30 seconds)

### macOS/Linux:
```bash
base64 -i redsquare-release.keystore -o keystore-base64.txt
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("redsquare-release.keystore")) | Out-File keystore-base64.txt
```

## Step 3: Add GitHub Secrets (2 minutes)

Go to: **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions**

Add these 4 secrets:

| Secret Name | Value |
|-------------|-------|
| `ANDROID_SIGNING_KEY_BASE64` | Contents of `keystore-base64.txt` |
| `ANDROID_SIGNING_KEY_ALIAS` | `redsquare` |
| `ANDROID_SIGNING_KEY_PASSWORD` | Your key password |
| `ANDROID_SIGNING_STORE_PASSWORD` | Your keystore password |

## Step 4: Test Build (1 minute)

1. Go to **Actions** tab
2. Select "Build RedSquare Screens (Android Mobile)"
3. Click **Run workflow**
4. Enter version `1.0.0`
5. Click **Run workflow**

Wait ~5-10 minutes for the build to complete.

## Step 5: Download & Verify

Once complete:
1. Download the artifact from the workflow run
2. Verify it's signed:

```bash
jarsigner -verify -verbose app-release.apk
# Should show "jar verified"
```

## Done! ✅

Your Android builds are now automatically signed and ready for Play Store.

## Next Steps

- 📱 [Set up Play Store account & upload](./ANDROID_CODE_SIGNING_SETUP.md#step-6-google-play-store-setup)
- 🤖 [Full Android signing guide](./ANDROID_CODE_SIGNING_SETUP.md)
- 🔄 [Automated build documentation](./AUTO_BUILD_SETUP.md)

## Troubleshooting

**Build fails?**
- Check all 4 secrets are set correctly (no typos)
- Verify Base64 encoding is clean (no line breaks)
- Ensure passwords match what you entered during keytool

**Need help?**
- See [full guide](./ANDROID_CODE_SIGNING_SETUP.md#troubleshooting)
- Check workflow logs in Actions tab
- Verify Java/Android SDK versions

## Security Reminder

- ⚠️ **Backup your keystore** - You can't update your app without it!
- ⚠️ **Never commit keystore to Git**
- ⚠️ **Store passwords securely** (password manager)
- ⚠️ **Different keystores** for testing vs. production

---

**Quick reference:**
- Keystore file: `redsquare-release.keystore`
- Alias: `redsquare`
- Validity: 27 years (10000 days)
- Algorithm: RSA 2048-bit
