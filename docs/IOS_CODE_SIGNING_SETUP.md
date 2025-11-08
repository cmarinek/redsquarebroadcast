# iOS Code Signing Setup for App Store Distribution

This guide walks you through setting up iOS code signing for automated App Store builds.

## Overview

iOS code signing requires:
1. **Apple Developer Account** (paid membership)
2. **Distribution Certificate** (.p12 file)
3. **App Store Provisioning Profile** (.mobileprovision file)
4. **Team ID** and **Bundle ID**

## Prerequisites

- Active Apple Developer Program membership ($99/year)
- Mac with Xcode installed (for generating certificates)
- Access to your GitHub repository settings

## Step 1: Generate Distribution Certificate

### Using Xcode (Recommended)

1. Open **Xcode** on your Mac
2. Go to **Xcode** → **Preferences** (or **Settings** in newer versions)
3. Select **Accounts** tab
4. Click **+** to add your Apple ID if not already added
5. Select your Apple ID → Click **Manage Certificates**
6. Click **+** → Select **Apple Distribution**
7. Click **Done**

### Export Certificate as .p12

1. Open **Keychain Access** app on your Mac
2. Select **My Certificates** from the left sidebar
3. Find your **Apple Distribution** certificate
4. Right-click → **Export "Apple Distribution..."**
5. Save as `.p12` file
6. **IMPORTANT**: Set a strong password (you'll need this for GitHub secrets)
7. Save the file securely

## Step 2: Create App Store Provisioning Profile

### Via Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Profiles** → **+** button

### Create App ID (if not exists)

1. Click **Identifiers** → **+** button
2. Select **App IDs** → **Continue**
3. Select **App** → **Continue**
4. Fill in:
   - **Description**: RedSquare Screens
   - **Bundle ID**: `com.redsquare.screens` (or your custom Bundle ID)
   - **Explicit**: Choose explicit Bundle ID
5. Select required **Capabilities** (e.g., Push Notifications, In-App Purchase)
6. Click **Continue** → **Register**

### Create Provisioning Profile

1. Click **Profiles** → **+** button
2. Select **App Store** under **Distribution**
3. Click **Continue**
4. Select your **App ID** → **Continue**
5. Select your **Distribution Certificate** → **Continue**
6. Enter **Provisioning Profile Name**: RedSquare Screens App Store
7. Click **Generate**
8. Click **Download** to save the `.mobileprovision` file

## Step 3: Get Your Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Click **Membership** in the sidebar
3. Find your **Team ID** (10-character alphanumeric code)
4. Copy this value

## Step 4: Convert Files to Base64

You need to convert the certificate and provisioning profile to Base64 for GitHub secrets.

### On macOS/Linux:

```bash
# Convert certificate to Base64
base64 -i YourCertificate.p12 -o certificate_base64.txt

# Convert provisioning profile to Base64
base64 -i YourProfile.mobileprovision -o profile_base64.txt
```

### On Windows (PowerShell):

```powershell
# Convert certificate to Base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("YourCertificate.p12")) | Out-File certificate_base64.txt

# Convert provisioning profile to Base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("YourProfile.mobileprovision")) | Out-File profile_base64.txt
```

## Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `IOS_CERTIFICATE_BASE64` | Base64-encoded distribution certificate | Output from `certificate_base64.txt` |
| `IOS_CERTIFICATE_PASSWORD` | Password for the .p12 certificate | Password you set when exporting |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded provisioning profile | Output from `profile_base64.txt` |
| `IOS_TEAM_ID` | Apple Developer Team ID | From Apple Developer Portal → Membership |
| `IOS_BUNDLE_ID` | App Bundle Identifier | e.g., `com.redsquare.screens` |

### How to Add Each Secret

For each secret above:
1. Click **New repository secret**
2. Enter the **Name** (e.g., `IOS_CERTIFICATE_BASE64`)
3. Paste the **Value**
4. Click **Add secret**

**IMPORTANT**: For Base64 secrets, copy the ENTIRE content from the `.txt` files (including any line breaks).

## Step 6: Verify Configuration

Once all secrets are added:

1. Push a change to your `main` branch
2. Go to **Actions** tab in GitHub
3. Wait for the iOS build to start
4. Check the build logs for:
   - ✅ Code signing certificate imported successfully
   - ✅ Provisioning profile installed successfully
   - ✅ Building with code signing for App Store distribution

## Troubleshooting

### Certificate Import Failed

**Error**: "Unable to import certificate"

**Solutions**:
- Verify the Base64 encoding is correct
- Check the certificate password is correct
- Ensure the certificate is a Distribution certificate, not Development
- Make sure the certificate hasn't expired

### Provisioning Profile Not Found

**Error**: "No matching provisioning profile found"

**Solutions**:
- Verify the Bundle ID in the provisioning profile matches `IOS_BUNDLE_ID`
- Check that the provisioning profile includes your distribution certificate
- Ensure the provisioning profile is for App Store distribution
- Make sure the provisioning profile hasn't expired

### Code Signing Failed

**Error**: "Code signing is required for product type 'Application'"

**Solutions**:
- Verify all 5 required secrets are added correctly
- Check Team ID is correct (10 characters)
- Ensure Bundle ID matches exactly (case-sensitive)
- Verify the certificate is installed in the keychain

### Build Succeeds but IPA is Unsigned

If the build completes but shows "⚠️ Code signing disabled":
- Check that both `IOS_CERTIFICATE_BASE64` and `IOS_PROVISIONING_PROFILE_BASE64` secrets exist
- Verify the Base64 values are complete (no truncation)
- Review the "Import Code Signing Certificate" and "Import Provisioning Profile" logs

## Updating Expired Certificates

Certificates and provisioning profiles expire regularly. To update:

1. Generate new certificate/profile following steps above
2. Convert to Base64
3. Update GitHub secrets with new values
4. Push a change to trigger a new build

## Security Best Practices

1. **Protect Certificate Password**: Use a strong, unique password
2. **Limit Secret Access**: Only add collaborators who need access to secrets
3. **Regular Rotation**: Update certificates before expiration
4. **Delete Old Files**: Securely delete `.p12` and `.mobileprovision` files after Base64 conversion
5. **Backup Safely**: Store certificates in a secure password manager or encrypted storage

## Alternative: Manual Export Method

If you prefer not to use GitHub Actions for code signing:

1. Build locally with Xcode
2. Archive the app (**Product** → **Archive**)
3. Distribute to App Store Connect manually
4. Use GitHub Actions only for development builds (unsigned)

## Next Steps

After successful build:

1. **Test IPA**: Download from GitHub Actions artifacts
2. **Set up TestFlight Auto-Deploy**: See [TestFlight Setup Guide](./TESTFLIGHT_SETUP.md) to automatically push builds to beta testers
3. **Manual TestFlight Upload** (if not using auto-deploy): Use Xcode or Transporter app
4. **Submit for Review**: Complete App Store submission in App Store Connect

## TestFlight Automatic Deployment

Want your builds to automatically upload to TestFlight for beta testing?

See our comprehensive guide:
- 🧪 [TestFlight Automatic Deployment Setup](./TESTFLIGHT_SETUP.md) - Complete walkthrough

This allows you to:
- Automatically upload signed builds to TestFlight
- Distribute to beta testers immediately after builds complete
- Skip manual IPA uploads and streamline your testing workflow

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Common App Store Submission Checklist

Before submitting to App Store:

- [ ] Bundle ID matches the one registered in App Developer Portal
- [ ] Version number incremented from previous submission
- [ ] App icons for all required sizes
- [ ] Screenshots for all device sizes
- [ ] Privacy policy URL (if collecting user data)
- [ ] App description and keywords
- [ ] Age rating completed
- [ ] Export compliance information completed
- [ ] IPA signed with Distribution certificate
- [ ] Tested on real iOS devices via TestFlight
