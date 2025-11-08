# Quick Start: iOS Code Signing

**Goal**: Enable App Store distribution for your iOS builds in GitHub Actions.

## TL;DR - 5 Required Secrets

Add these 5 secrets to GitHub → Settings → Secrets and variables → Actions:

| Secret | Example | How to Get |
|--------|---------|------------|
| `IOS_CERTIFICATE_BASE64` | `MIIJ...` (long string) | Convert .p12 to Base64 |
| `IOS_CERTIFICATE_PASSWORD` | `MySecurePass123!` | Password you set |
| `IOS_PROVISIONING_PROFILE_BASE64` | `MIIK...` (long string) | Convert .mobileprovision to Base64 |
| `IOS_TEAM_ID` | `A1B2C3D4E5` | Apple Developer Portal → Membership |
| `IOS_BUNDLE_ID` | `com.redsquare.screens` | Your app's Bundle ID |

## Quick Setup (5 Steps)

### 1. Export Distribution Certificate from Xcode

```bash
# In Xcode:
# Preferences → Accounts → Manage Certificates → + → Apple Distribution

# In Keychain Access:
# Right-click "Apple Distribution" → Export → Save as .p12
# Set a password and remember it!
```

### 2. Download Provisioning Profile

```bash
# Go to: developer.apple.com/account
# Certificates, Identifiers & Profiles → Profiles → + 
# Select "App Store" → Choose your App ID → Generate → Download
```

### 3. Convert to Base64

**macOS/Linux:**
```bash
base64 -i certificate.p12 -o cert.txt
base64 -i profile.mobileprovision -o profile.txt
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.p12")) | Out-File cert.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("profile.mobileprovision")) | Out-File profile.txt
```

### 4. Get Team ID

```bash
# Go to: developer.apple.com/account
# Click "Membership" → Copy your Team ID (10 characters)
```

### 5. Add to GitHub Secrets

```bash
# GitHub: Repository → Settings → Secrets → New repository secret

1. Name: IOS_CERTIFICATE_BASE64
   Value: [paste entire content from cert.txt]

2. Name: IOS_CERTIFICATE_PASSWORD
   Value: [your certificate password]

3. Name: IOS_PROVISIONING_PROFILE_BASE64
   Value: [paste entire content from profile.txt]

4. Name: IOS_TEAM_ID
   Value: [your 10-character Team ID]

5. Name: IOS_BUNDLE_ID
   Value: com.redsquare.screens
```

## Verify It Works

1. **Push to main branch**
2. **Go to Actions tab** in GitHub
3. **Check iOS build logs** for:
   - ✅ Code signing certificate imported successfully
   - ✅ Provisioning profile installed successfully
   - ✅ Building with code signing for App Store distribution

## What Happens Without These Secrets?

- iOS builds will succeed but be **unsigned** (development mode)
- You'll see: `⚠️ Code signing disabled (development build only)`
- The IPA cannot be submitted to App Store
- Great for testing, but not for production

## Common Issues

### "Certificate import failed"
- Check the Base64 conversion completed successfully
- Verify the password is correct
- Ensure the certificate is a **Distribution** certificate

### "No matching provisioning profile"
- Bundle ID must match exactly (case-sensitive)
- Profile must be for **App Store** distribution
- Profile must include your distribution certificate

### "Build succeeds but still unsigned"
- All 5 secrets must be present
- Check for typos in secret names
- Verify Base64 strings are complete (no truncation)

## Need More Details?

📖 Full guide: [`docs/IOS_CODE_SIGNING_SETUP.md`](./IOS_CODE_SIGNING_SETUP.md)

## Next Steps After Signing

1. ✅ Build completes with signed IPA
2. 📥 Download IPA from GitHub Actions artifacts
3. 📤 Upload to App Store Connect via Xcode or Transporter
4. 🧪 Test with TestFlight
5. 🚀 Submit for App Store review

---

**Security Tip**: After converting to Base64, securely delete the original .p12 and .mobileprovision files or store in encrypted password manager.
