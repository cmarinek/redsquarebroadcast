# Production Deployment Checklist

Complete this checklist before deploying RedSquare to production.

## Environment Setup

### Required Environment Variables

- [ ] `VITE_SUPABASE_URL` - Production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Production Supabase anon key
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key (starts with `pk_live_`)
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret for production
- [ ] `VITE_SENTRY_DSN` - Sentry Data Source Name
- [ ] `VITE_MAPBOX_TOKEN` - Mapbox access token
- [ ] `VITE_APP_URL` - Production URL (e.g., https://redsquare.app)

### Optional Environment Variables

- [ ] `VITE_SENTRY_ENVIRONMENT` - Set to "production"
- [ ] `VITE_SENTRY_RELEASE` - Version number or git commit hash
- [ ] `VITE_ENABLE_ANALYTICS` - Set to "true"
- [ ] `VITE_ENABLE_SENTRY` - Set to "true"

## Security Checklist

### Database (Supabase)

- [ ] All RLS (Row Level Security) policies are enabled
- [ ] Service role key is only used server-side (not exposed to client)
- [ ] Database backups are configured (daily at minimum)
- [ ] SSL connections are enforced
- [ ] Rate limiting is configured for all edge functions

### Authentication

- [ ] Email verification is required for new users
- [ ] Password requirements are enforced (min 8 characters)
- [ ] 2FA is available for screen owners with high volume
- [ ] Session timeout is configured (default: 7 days)
- [ ] Refresh tokens are rotated

### API & Edge Functions

- [ ] CORS is configured with specific origins (not wildcard `*`)
- [ ] Rate limiting is active on all public endpoints
- [ ] API keys are not exposed in client-side code
- [ ] All edge functions have proper error handling
- [ ] Edge functions timeout is set appropriately

### Content Security

- [ ] CSP headers are configured
- [ ] XSS protection headers are enabled
- [ ] Content moderation system is active
- [ ] File upload size limits are enforced (50MB max)
- [ ] File type validation is working
- [ ] Image/video scanning for prohibited content is enabled

### Payments (Stripe)

- [ ] Stripe is in LIVE mode (not test mode)
- [ ] Webhook endpoint is configured and verified
- [ ] Webhook signature verification is enabled
- [ ] Payment failures are handled gracefully
- [ ] Refund policies are implemented
- [ ] Tax calculation is configured (if applicable)

## Monitoring & Error Tracking

### Sentry

- [ ] Sentry project is created
- [ ] DSN is configured in environment variables
- [ ] Error tracking is working (test with sample error)
- [ ] Performance monitoring is enabled
- [ ] Session replay is configured with privacy settings
- [ ] Alert rules are set up
- [ ] Team notifications are configured (email/Slack)
- [ ] Source maps are uploaded (optional but recommended)

### Application Monitoring

- [ ] Uptime monitoring is configured (e.g., UptimeRobot, Pingdom)
- [ ] Performance budgets are set
- [ ] Database query performance is monitored
- [ ] API response times are tracked

## Legal & Compliance

### Legal Documents

- [ ] Terms of Service are published at `/legal/terms`
- [ ] Privacy Policy is published at `/legal/privacy`
- [ ] Content Guidelines are published at `/legal/content-guidelines`
- [ ] Cookie Policy is displayed (if using analytics cookies)
- [ ] DMCA/Copyright policy is available
- [ ] Business address is added to legal documents
- [ ] Effective dates are set on all legal documents

### GDPR Compliance (if applicable)

- [ ] Cookie consent banner is implemented
- [ ] Users can access their data
- [ ] Users can delete their data
- [ ] Data retention policies are defined
- [ ] Privacy policy mentions data transfers

### CCPA Compliance (California)

- [ ] "Do Not Sell" mechanism is implemented (if applicable)
- [ ] Privacy policy includes CCPA disclosures
- [ ] Users can opt-out of data collection

## Performance Optimization

### Build Optimization

- [ ] Production build is minified
- [ ] Source maps are generated (for Sentry)
- [ ] Dead code elimination is enabled
- [ ] Code splitting is configured
- [ ] Bundle size is under 1MB (initial load)
- [ ] Images are optimized and lazy-loaded
- [ ] Fonts are preloaded

### Caching

- [ ] Static assets have long cache headers (1 year)
- [ ] API responses have appropriate cache headers
- [ ] CDN is configured (Cloudflare, CloudFront, etc.)
- [ ] Service worker is configured (optional)

### Database

- [ ] Database indexes are created for frequent queries
- [ ] Connection pooling is configured
- [ ] Slow queries are optimized
- [ ] Database is in the same region as application

## User Experience

### Onboarding

- [ ] FirstTimeWelcome modal appears for new users
- [ ] Role-specific onboarding is triggered
- [ ] Profile completion prompt is displayed
- [ ] All onboarding flows are tested

### UI/UX

- [ ] Loading states are implemented everywhere
- [ ] Error messages are user-friendly
- [ ] Success messages are shown for all actions
- [ ] Empty states have clear CTAs
- [ ] Mobile responsiveness is tested
- [ ] Accessibility (a11y) is validated
- [ ] Dark mode works correctly

### Notifications

- [ ] Email notifications are sent for important events
- [ ] In-app notifications work with real-time updates
- [ ] Notification preferences can be managed
- [ ] Email templates are professional and branded

## Testing

### Automated Tests

- [ ] All unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Test coverage is >70%
- [ ] CI/CD pipeline runs tests automatically

### Manual Testing

- [ ] Complete user journey: Sign up → Upload content → Book screen → Payment
- [ ] Screen owner journey: Register → Add screen → Receive booking → Get paid
- [ ] Admin dashboard is functional
- [ ] Mobile app works (if applicable)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Error scenarios are tested (network failures, invalid inputs, etc.)

## Infrastructure

### Hosting

- [ ] Production domain is configured (redsquare.app)
- [ ] SSL certificate is installed and auto-renewing
- [ ] CDN is set up for static assets
- [ ] Load balancer is configured (if multi-instance)
- [ ] Auto-scaling is enabled (if needed)

### DNS

- [ ] A/AAAA records point to production servers
- [ ] WWW redirect is configured
- [ ] MX records are set for email (if custom domain)
- [ ] SPF/DKIM records are configured for email sending

### Backups

- [ ] Database backups are automated (daily)
- [ ] File storage backups are configured
- [ ] Backup restoration procedure is documented and tested
- [ ] Disaster recovery plan is in place

## Launch Communication

### Internal

- [ ] Team is trained on handling production issues
- [ ] Escalation procedures are documented
- [ ] On-call schedule is set (if applicable)
- [ ] Runbook is created for common issues

### External

- [ ] Marketing site is updated with launch announcement
- [ ] Social media posts are scheduled
- [ ] Press release is prepared (if applicable)
- [ ] Support email is monitored
- [ ] FAQ is updated with launch-specific questions

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates in Sentry
- [ ] Watch for performance degradation
- [ ] Check payment processing is working
- [ ] Verify email delivery rates
- [ ] Monitor user sign-ups and conversions
- [ ] Check server resource usage
- [ ] Review user feedback and support tickets

## Post-Launch Tasks (First Week)

- [ ] Analyze user behavior with analytics
- [ ] Review and resolve any critical bugs
- [ ] Adjust rate limits if needed
- [ ] Optimize slow database queries
- [ ] Tune Sentry alerts to reduce noise
- [ ] Gather user feedback
- [ ] Plan first iteration improvements

---

## Sign-Off

**Checklist Completed By**: _______________
**Date**: _______________
**Production URL**: https://redsquare.app
**Deployment Date**: _______________

**Approved By**:

- [ ] Tech Lead: _______________
- [ ] QA Lead: _______________
- [ ] Legal: _______________
- [ ] Product Owner: _______________

---

**Next Steps After Launch**:

1. Week 1: Daily monitoring and critical bug fixes
2. Week 2: Performance optimization based on real usage
3. Week 3: Feature iteration based on user feedback
4. Month 1: Comprehensive review and roadmap planning

🚀 Ready for launch!
