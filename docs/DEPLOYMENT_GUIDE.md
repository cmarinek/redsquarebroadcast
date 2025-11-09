# Red Square Platform - Deployment Guide

This guide covers the complete deployment process for the Red Square platform, from local development to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Post-Deployment](#post-deployment)
7. [Rollback Procedures](#rollback-procedures)
8. [Monitoring](#monitoring)

---

## Prerequisites

### Required Accounts
- ✅ Supabase project (already configured)
- ✅ Stripe account (connected)
- ✅ GitHub account (for CI/CD)
- ⚠️ Domain registrar access (for custom domain)
- ⚠️ Email service (Resend configured)

### Required Tools
- Node.js 18+ and npm
- Git
- Supabase CLI (optional, for migrations)

### Required Secrets
All secrets are already configured in the project:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `MAPBOX_PUBLIC_TOKEN`
- And others (see secrets list)

---

## Environment Setup

### 1. Environment Variables

The project uses three environments:
- **Development**: Local development with `.env.local`
- **Staging**: Pre-production testing
- **Production**: Live environment

Key environment variables are already configured via Supabase secrets.

### 2. Database Setup

Database is fully configured with:
- ✅ All tables created
- ✅ RLS policies in place
- ✅ Database functions deployed
- ✅ Triggers configured

### 3. Storage Buckets

All storage buckets are configured:
- `content` - User uploaded content
- `avatars` - Profile pictures
- `app_artifacts` - Mobile/TV app builds

---

## Local Development

### Start Development Server

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Database Migrations

Migrations are automatically applied. To view migration status:
- Check Supabase dashboard
- Review `supabase/migrations/` directory

---

## Staging Deployment

### Automatic Deployment

Staging deploys automatically on push to `main` branch via GitHub Actions.

**Workflow:** `.github/workflows/production-deploy.yml`

### Manual Staging Deploy

```bash
# Build the application
npm run build

# Test the build locally
npm run preview

# Deploy to staging (manual)
# Use Lovable's built-in deployment or your hosting provider
```

### Staging Environment Checks

Before production:
1. ✅ All features working
2. ✅ Payment flows tested
3. ✅ Authentication working
4. ✅ Database operations verified
5. ✅ Edge functions responding

---

## Production Deployment

### Pre-Deployment Checklist

#### Security
- ✅ RLS policies reviewed
- ✅ Secrets rotated (if needed)
- ⚠️ Security audit completed
- ⚠️ SSL certificates ready

#### Performance
- ⚠️ Load testing completed
- ⚠️ CDN configured (optional)
- ✅ Database indexed
- ✅ Caching strategies in place

#### Monitoring
- ✅ Error tracking configured
- ✅ Performance monitoring active
- ⚠️ Alerting set up
- ✅ Backup strategy verified

#### Documentation
- ✅ User guides ready
- ✅ API docs complete
- ✅ Support resources prepared
- ✅ Runbooks created

### Production Deployment Steps

#### 1. Create Production Tag

```bash
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

#### 2. Automated Production Deploy

The GitHub Actions workflow will:
1. Run security scans
2. Execute tests
3. Build production assets
4. Deploy to production
5. Run smoke tests
6. Send deployment notification

#### 3. Manual Verification

After deployment:
1. Check `/admin/dashboard` - System health
2. Verify payment processing
3. Test user registration
4. Check screen registration
5. Verify booking flow
6. Test content upload

### Custom Domain Setup

#### A. DNS Configuration

1. **Add A Records** (at your domain registrar):
   ```
   Type: A
   Name: @
   Value: 185.158.133.1
   TTL: 3600
   ```

   ```
   Type: A
   Name: www
   Value: 185.158.133.1
   TTL: 3600
   ```

2. **Add TXT Record** (for verification):
   ```
   Type: TXT
   Name: _lovable
   Value: lovable_verify=<your-verification-code>
   ```

#### B. In Lovable Dashboard

1. Go to Project Settings → Domains
2. Click "Connect Domain"
3. Enter your domain (e.g., `redsquare.com`)
4. Follow verification steps
5. Add both root and www subdomain
6. Set primary domain
7. Wait for DNS propagation (up to 72 hours)
8. SSL will be automatically provisioned

---

## Post-Deployment

### Immediate Tasks (0-24 hours)

1. **Monitor System Health**
   - Check `/admin/dashboard`
   - Review error logs
   - Monitor response times
   - Check database performance

2. **Verify Critical Flows**
   - User registration: 10+ test users
   - Payment processing: Test transactions
   - Screen registration: Test devices
   - Content upload: Various file types
   - Booking flow: End-to-end

3. **Check Integrations**
   - Stripe webhooks firing
   - Email notifications sending
   - Map/location services working
   - Storage uploads functioning

### First Week Tasks

1. **User Feedback**
   - Monitor support tickets
   - Track user issues
   - Gather feature requests
   - Analyze usage patterns

2. **Performance Tuning**
   - Optimize slow queries
   - Adjust caching
   - Review error rates
   - Scale resources if needed

3. **Documentation Updates**
   - Update based on real usage
   - Add troubleshooting guides
   - Create FAQs
   - Improve onboarding

### Ongoing Maintenance

1. **Daily**
   - Check error rates
   - Monitor uptime
   - Review security alerts
   - Check payment processing

2. **Weekly**
   - Review metrics
   - Update documentation
   - Security patches
   - Performance review

3. **Monthly**
   - Backup verification
   - Security audit
   - Performance optimization
   - Feature planning

---

## Rollback Procedures

### Automatic Rollback

If deployment fails critical checks, automatic rollback triggers.

### Manual Rollback

#### Emergency Rollback (< 5 minutes)

```bash
# Trigger rollback workflow
gh workflow run production-deploy.yml \
  --ref main \
  -f environment=rollback
```

#### Selective Rollback

1. **Identify Issue**
   - Check error logs
   - Review recent changes
   - Determine affected component

2. **Rollback Database** (if needed)
   ```sql
   -- Restore from backup
   -- See backup documentation
   ```

3. **Rollback Code**
   ```bash
   # Revert to previous tag
   git checkout v0.9.9
   # Redeploy
   ```

4. **Verify**
   - Run smoke tests
   - Check critical flows
   - Monitor error rates

---

## Monitoring

### Production Monitoring Dashboard

Access at: `/admin/dashboard` or `/production`

**Key Metrics:**
- System health (DB, Auth, Storage, Functions)
- Active users
- Revenue
- Error rates
- Response times

### External Monitoring

1. **Supabase Dashboard**
   - Database performance
   - Auth metrics
   - Storage usage
   - Edge function logs

2. **Stripe Dashboard**
   - Payment success rates
   - Payout status
   - Dispute management

### Alert Configuration

Set up alerts for:
- System downtime
- Error rate > 1%
- Payment failures
- Database issues
- Storage limits

### Log Analysis

Logs are available in:
- Supabase Dashboard → Logs
- Edge Function specific logs
- Frontend error tracking
- Performance metrics

---

## Support & Troubleshooting

### Common Issues

#### 1. Domain Not Connecting
- Verify DNS records
- Check DNS propagation (dnschecker.org)
- Confirm TXT verification
- Wait up to 72 hours

#### 2. SSL Certificate Issues
- Ensure DNS is correct
- Remove conflicting records
- Check CAA records
- Contact Lovable support

#### 3. Payment Failures
- Verify Stripe webhook endpoint
- Check Stripe secret key
- Review payment logs
- Test in Stripe test mode

#### 4. Authentication Issues
- Check Supabase auth config
- Verify email settings
- Review RLS policies
- Test OAuth providers

### Getting Help

1. **Check Documentation**
   - `/admin/documentation`
   - This deployment guide
   - Feature-specific docs

2. **Review Logs**
   - System health dashboard
   - Edge function logs
   - Browser console
   - Network requests

3. **Contact Support**
   - Lovable support chat
   - Supabase support
   - Stripe support
   - Community forums

---

## Appendix

### A. Environment Variables Reference

See `src/config/env.ts` for all environment variables.

### B. Database Schema

See `docs/SSOT_MANIFEST.md` for complete schema documentation.

### C. API Endpoints

All edge functions are documented in `supabase/functions/` directories.

### D. Security Policies

See `docs/security/` for security documentation.

---

**Last Updated:** 2025-01-09  
**Version:** 1.0.0  
**Status:** Production Ready
