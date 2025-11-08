# OAuth Provider Setup Guide

This guide walks you through configuring OAuth providers (Google, Apple, Facebook, LinkedIn) for Red Square authentication.

## Current Status

✅ **Code Implementation**: Complete - All OAuth flows are implemented in the codebase  
⚠️ **Provider Configuration**: Required - Each provider needs manual setup in Supabase dashboard

## Quick Setup Links

- **Supabase Auth Providers**: https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/
- **Apple Developer**: https://developer.apple.com/
- **Facebook Developers**: https://developers.facebook.com/
- **LinkedIn Developers**: https://www.linkedin.com/developers/

---

## 1. Google OAuth Setup

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Set **Application Type**: Web application
7. Add **Authorized redirect URIs**:
   ```
   https://hqeyyutbuxhyildsasqq.supabase.co/auth/v1/callback
   ```
8. Note your **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Open [Supabase Auth Providers](https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/auth/providers)
2. Enable **Google** provider
3. Enter your **Client ID** and **Client Secret**
4. Save changes

### Testing

- Navigate to `/auth` page
- Click "Continue with Google"
- Should redirect to Google login

---

## 2. Apple OAuth Setup

### Step 1: Create Apple Sign In Service

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID**
4. Enable **Sign in with Apple**
5. Configure domains:
   - **Domains**: `hqeyyutbuxhyildsasqq.supabase.co`
   - **Return URLs**: `https://hqeyyutbuxhyildsasqq.supabase.co/auth/v1/callback`
6. Create a **Private Key** for Sign in with Apple
7. Note your **Service ID**, **Team ID**, **Key ID**, and download the private key

### Step 2: Configure in Supabase

1. Open [Supabase Auth Providers](https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/auth/providers)
2. Enable **Apple** provider
3. Enter:
   - **Services ID** (Client ID)
   - **Team ID**
   - **Key ID**
   - **Private Key** (paste contents)
4. Save changes

### Testing

- Navigate to `/auth` page
- Click "Continue with Apple"
- Should redirect to Apple ID login

---

## 3. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** app type
4. Add **Facebook Login** product
5. Configure OAuth redirect URIs:
   ```
   https://hqeyyutbuxhyildsasqq.supabase.co/auth/v1/callback
   ```
6. Get **App ID** and **App Secret** from Settings → Basic

### Step 2: Configure in Supabase

1. Open [Supabase Auth Providers](https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/auth/providers)
2. Enable **Facebook** provider
3. Enter your **App ID** and **App Secret**
4. Save changes

### Testing

- Navigate to `/auth` page
- Click "Continue with Facebook"
- Should redirect to Facebook login

---

## 4. LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create App**
3. Fill in app details
4. Navigate to **Auth** tab
5. Add **Redirect URLs**:
   ```
   https://hqeyyutbuxhyildsasqq.supabase.co/auth/v1/callback
   ```
6. Request access to **Sign In with LinkedIn using OpenID Connect**
7. Note your **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Open [Supabase Auth Providers](https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/auth/providers)
2. Enable **LinkedIn (OIDC)** provider
3. Enter your **Client ID** and **Client Secret**
4. Save changes

### Testing

- Navigate to `/auth` page
- Click "Continue with LinkedIn"
- Should redirect to LinkedIn login

---

## Verification Checklist

After configuring each provider:

- [ ] Google OAuth configured and tested
- [ ] Apple OAuth configured and tested
- [ ] Facebook OAuth configured and tested
- [ ] LinkedIn OAuth configured and tested
- [ ] All providers redirect correctly to `/role-selection`
- [ ] User roles are assigned after OAuth signup
- [ ] User profiles are created in database

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure redirect URI exactly matches in both provider console and Supabase
   - Check for trailing slashes or http vs https

2. **"Invalid client"**
   - Verify Client ID and Secret are copied correctly
   - Check if provider app is in production mode (not test/sandbox)

3. **"User creation failed"**
   - Verify `user_roles` table exists
   - Check RLS policies allow user creation
   - Ensure profile creation triggers are working

### Debug Steps

1. Check Supabase Auth logs:
   ```
   https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/logs/auth-logs
   ```

2. Check browser console for errors during OAuth flow

3. Verify environment variables are correct:
   ```bash
   # Required in production
   VITE_SUPABASE_URL=https://hqeyyutbuxhyildsasqq.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

## Production Considerations

### Security

- [ ] Enable email verification for OAuth users
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up proper CORS policies
- [ ] Use separate OAuth apps for staging/production

### Monitoring

- [ ] Monitor failed login attempts
- [ ] Track OAuth provider usage
- [ ] Set up alerts for auth errors

### Compliance

- [ ] Update privacy policy to include OAuth providers
- [ ] Ensure GDPR compliance for user data
- [ ] Add proper consent flows where required

## Support

For issues with specific providers:
- **Google**: [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Apple**: [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- **Facebook**: [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- **LinkedIn**: [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- **Supabase**: [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
