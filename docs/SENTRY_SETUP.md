# Sentry Production Setup Guide

This guide walks you through setting up Sentry for error tracking and performance monitoring in production.

## Prerequisites

- A Sentry account (sign up at https://sentry.io/)
- Access to your production environment variables
- The RedSquare application already has Sentry integration code (in `src/config/sentry.ts`)

## Step 1: Create a Sentry Project

1. Log in to https://sentry.io/
2. Click "Projects" in the sidebar
3. Click "Create Project"
4. Select:
   - **Platform**: React
   - **Project Name**: redsquare-web
   - **Team**: Your team name
5. Click "Create Project"

## Step 2: Get Your DSN

After creating the project, you'll see your DSN (Data Source Name). It looks like:
```
https://abc123@o123456.ingest.sentry.io/789
```

Copy this DSN - you'll need it for the next step.

## Step 3: Configure Environment Variables

Add these environment variables to your production environment:

```bash
# Required
VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Optional (defaults shown)
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=1.0.0
```

### For Vercel/Netlify:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variables above

### For Docker:
Add to your `.env` or `docker-compose.yml`:
```yaml
environment:
  - VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
  - VITE_SENTRY_ENVIRONMENT=production
```

### For GitHub Actions:
Add to your repository secrets:
1. Go to Settings > Secrets and variables > Actions
2. Add `VITE_SENTRY_DSN` as a secret

## Step 4: Configure Sentry Settings

In your Sentry project settings, configure:

### Alert Rules

1. Go to **Alerts** > **Create Alert**
2. Set up alerts for:
   - New issues
   - Regression (resolved issues that recur)
   - High-volume issues (>100 events/hour)

### Performance Monitoring

1. Go to **Performance** > **Settings**
2. Configure:
   - **Transaction Sample Rate**: 0.1 (10% in production)
   - **Profiles Sample Rate**: 0.1
   - **Enable Tracing**: Yes

### Session Replay

1. Go to **Replays** > **Settings**
2. Configure:
   - **Error Sample Rate**: 1.0 (capture all error sessions)
   - **Session Sample Rate**: 0.1 (capture 10% of normal sessions)
   - **Privacy Settings**: Mask all text, block all media

### Notifications

1. Go to **Settings** > **Notifications**
2. Set up:
   - Email notifications for new issues
   - Slack integration (optional)
   - Discord webhook (optional)

### Example Slack Setup:
```bash
# In Sentry Settings > Integrations > Slack
1. Click "Add to Slack"
2. Authorize the integration
3. Choose #engineering or #alerts channel
4. Configure notification rules
```

## Step 5: Configure Source Maps (Optional but Recommended)

Source maps help Sentry show you the original code in error stack traces.

### Using Vite:

1. Install the Sentry Vite plugin:
```bash
npm install --save-dev @sentry/vite-plugin
```

2. Update `vite.config.ts`:
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'redsquare-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

3. Add `SENTRY_AUTH_TOKEN` to your environment:
   - Go to Sentry > Settings > Account > API > Auth Tokens
   - Create a token with `project:releases` scope
   - Add to your environment variables

## Step 6: Test Sentry Integration

### Test in Development:

1. Add `?sentry_test=error` to any URL
2. This will trigger a test error
3. Check if it appears in Sentry dashboard

### Test in Production:

1. Deploy your application with the new environment variables
2. Trigger a test error:
   - Navigate to any page
   - Open browser console
   - Run: `throw new Error('Sentry test error');`
3. Check your Sentry dashboard for the error

## Step 7: Verify Configuration

Check that Sentry is working correctly:

1. **Error Tracking**: Go to Sentry > Issues
   - You should see test errors appear
   - Click on an error to see full details

2. **Performance Monitoring**: Go to Sentry > Performance
   - You should see transaction data
   - Check page load times

3. **Session Replay**: Go to Sentry > Replays
   - Watch recorded sessions with errors

## Step 8: Configure Release Tracking

To track which code version caused errors:

1. Update your deployment script to include:
```bash
export VITE_SENTRY_RELEASE=$(git rev-parse --short HEAD)
npm run build
```

2. Or use semantic versioning:
```bash
export VITE_SENTRY_RELEASE="1.0.0"
npm run build
```

3. In CI/CD (GitHub Actions example):
```yaml
- name: Build with Sentry Release
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_SENTRY_RELEASE: ${{ github.sha }}
  run: npm run build
```

## Step 9: Set Up Performance Budgets

Monitor your application's performance:

1. Go to Sentry > Performance > **Performance Score**
2. Set thresholds:
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

## Step 10: Create Dashboards

Set up custom dashboards:

1. Go to **Dashboards** > **Create Dashboard**
2. Add widgets for:
   - Error rate over time
   - Most common errors
   - Performance metrics
   - User impact (affected users)

## Configuration Summary

Your final production configuration should look like:

```bash
# .env.production
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=1.0.0
```

And your `sentry.ts` config (already in place):
```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
  release: import.meta.env.VITE_SENTRY_RELEASE,

  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of error sessions

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

## Troubleshooting

### Sentry Not Receiving Events

1. **Check DSN**: Ensure `VITE_SENTRY_DSN` is correctly set
2. **Check Environment**: Verify not running on localhost (disabled by default)
3. **Check Network**: Look for blocked requests in browser Network tab
4. **Check Quota**: Ensure you haven't exceeded your Sentry plan limits

### Events Not Appearing

- Wait 1-2 minutes (Sentry has a small delay)
- Check Sentry project settings > Inbound Filters
- Verify no IP blocking rules

### Source Maps Not Working

- Ensure `build.sourcemap: true` in Vite config
- Verify Sentry Vite plugin is properly configured
- Check that auth token has correct permissions

## Best Practices

1. **Alert Fatigue**: Don't alert on every error. Focus on:
   - High-severity issues
   - Issues affecting >10 users
   - Performance regressions

2. **Privacy**: Always mask sensitive data:
   - Credit card numbers
   - Passwords
   - PII (Personal Identifiable Information)

3. **Performance**: Don't sample too aggressively:
   - Production: 10% trace sample rate
   - Staging: 50% trace sample rate
   - Development: 100% or disabled

4. **Budget**: Monitor your Sentry quota:
   - Set error rate alerts
   - Use inbound filters to drop low-value events
   - Archive old issues

## Support

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Community Forum**: https://forum.sentry.io/
- **GitHub Issues**: https://github.com/getsentry/sentry-javascript/issues

## Next Steps

After Sentry is set up:

1. ✅ Monitor errors for 1 week
2. ✅ Tune alert sensitivity
3. ✅ Set up custom dashboards
4. ✅ Add team members to Sentry
5. ✅ Document common errors and fixes

---

**Status**: Ready for production ✅

**Estimated Setup Time**: 1 hour

**Maintenance**: 30 minutes/week (reviewing issues)
