# Production Deployment Guide - redsquare.app

## Domain Configuration

**Primary Domain:** redsquare.app  
**Hosting:** Lovable Platform  
**DNS Provider:** Cloudflare  
**CDN:** Cloudflare (enabled)

## DNS Setup (Cloudflare)

### Required DNS Records

1. **Root Domain (A Record)**
   - Type: `A`
   - Name: `@`
   - Value: `185.158.133.1`
   - Proxy: ✅ Enabled (orange cloud)

2. **WWW Subdomain (A Record)**
   - Type: `A`
   - Name: `www`
   - Value: `185.158.133.1`
   - Proxy: ✅ Enabled (orange cloud)

3. **Verification (TXT Record)**
   - Type: `TXT`
   - Name: `_lovable`
   - Value: `lovable_verify=ABC` (provided by Lovable)

### Cloudflare Settings

1. **SSL/TLS Mode:** Full (Strict)
2. **Always Use HTTPS:** ✅ Enabled
3. **Automatic HTTPS Rewrites:** ✅ Enabled
4. **Minimum TLS Version:** 1.2

## Connecting Domain in Lovable

1. Go to Project Settings → Domains
2. Click "Connect Domain"
3. Enter `redsquare.app`
4. Follow the verification steps
5. Wait for DNS propagation (up to 72 hours)
6. SSL certificate will be auto-provisioned

## Email Configuration

### Resend Setup (Already Configured)

- **API Key:** Configured in Supabase secrets as `RESEND_API_KEY`
- **Sending Domain:** redsquare.app
- **From Addresses:**
  - bookings@redsquare.app
  - payments@redsquare.app
  - notifications@redsquare.app
  - alerts@redsquare.app
  - support@redsquare.app

### DNS Records for Email (Cloudflare)

Add these records in Cloudflare DNS to verify your domain with Resend:

1. **SPF Record**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   ```

2. **DKIM Record**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend dashboard]
   ```

3. **DMARC Record**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:support@redsquare.app
   ```

## Performance Optimizations

### Cloudflare Cache Rules

1. **Static Assets (JS, CSS, Fonts)**
   - Cache Level: Standard
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year

2. **Images**
   - Cache Level: Standard
   - Edge Cache TTL: 30 days
   - Polish: Lossless
   - Image Resizing: ✅ Enabled

3. **Videos**
   - Cache Level: Standard
   - Edge Cache TTL: 7 days
   - Video Optimization: ✅ Enabled (if using Cloudflare Stream)

4. **API Responses**
   - Cache Level: Bypass (or very short TTL)
   - Edge Cache TTL: 1 minute with stale-while-revalidate

### Cloudflare Page Rules

Create these page rules in order:

1. **Static Assets**
   ```
   URL: redsquare.app/assets/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year
   ```

2. **Images**
   ```
   URL: redsquare.app/images/*
   Settings:
   - Cache Level: Cache Everything
   - Polish: Lossless
   - Image Resizing: On
   ```

3. **API Endpoints**
   ```
   URL: redsquare.app/api/*
   Settings:
   - Cache Level: Bypass
   ```

### Cloudflare Image Resizing

Enable in: Cloudflare Dashboard → Speed → Optimization → Image Resizing

Benefits:
- Automatic WebP/AVIF conversion
- Responsive image sizing
- On-the-fly transformations
- Reduced bandwidth usage

### Service Worker

- ✅ Implemented in `public/sw.js`
- Caching strategies for offline support
- Background sync for failed requests
- Push notification support

## Monitoring & Alerts

### Cloudflare Analytics

Monitor:
- Traffic patterns
- Cache hit ratio (target: >80%)
- Bandwidth usage
- Geographic distribution
- Security threats

### Production Monitoring Dashboard

Access at: `https://redsquare.app/admin/production`

Monitors:
- System health (database, auth, storage, edge functions)
- Business metrics (users, bookings, revenue)
- Security alerts
- Performance metrics
- Error rates

### Email Alerts

Configured to send to all admin users for:
- Critical system failures
- High error rates
- Payment processing issues
- Security incidents
- Mass device offline events

## Deployment Checklist

- ✅ Domain purchased and configured (redsquare.app via Cloudflare)
- ✅ DNS records added and verified
- ✅ SSL certificate provisioned
- ✅ Email domain verified with Resend
- ✅ Email templates implemented
- ✅ Cloudflare CDN enabled
- ✅ Cache rules configured
- ✅ Image optimization enabled
- ✅ Service worker implemented
- ✅ Production monitoring dashboard active
- ✅ Email notifications configured
- [ ] Video transcoding pipeline (manual setup required)
- [ ] Cloudflare Stream configuration (optional)
- [ ] Rate limiting rules (can use Cloudflare Rate Limiting)
- [ ] WAF rules (Web Application Firewall)
- [ ] DDoS protection verified

## Video Transcoding Setup (Optional)

### Option 1: Cloudflare Stream

1. Enable Cloudflare Stream in your account
2. Configure webhook for upload notifications
3. Update video URLs to use Stream delivery
4. Cost: Pay-per-minute for storage and delivery

### Option 2: Third-Party Service (e.g., Mux, Coconut)

1. Sign up for transcoding service
2. Add API credentials to Supabase secrets
3. Configure webhook endpoints
4. Update upload flow to trigger transcoding

## Security Measures

### Cloudflare Security Settings

1. **WAF (Web Application Firewall):** ✅ Enabled
2. **DDoS Protection:** ✅ Enabled (automatic)
3. **Bot Fight Mode:** ✅ Enabled
4. **Rate Limiting:** Configure for API endpoints
5. **IP Access Rules:** Set up if needed

### Supabase RLS Policies

- ✅ All tables have Row Level Security enabled
- ✅ Admin-only access for sensitive operations
- ✅ User-scoped access for personal data

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor error logs and system health
- **Weekly:** Review analytics and performance metrics
- **Monthly:** Security audit and update dependencies
- **Quarterly:** Load testing and capacity planning

### Contact Information

- **Platform Issues:** support@redsquare.app
- **Technical Support:** Lovable support
- **DNS/CDN Issues:** Cloudflare support
- **Email Delivery:** Resend support

## Rollback Procedure

If critical issues arise:

1. Access Lovable project history
2. Identify last stable version
3. Restore to previous version
4. Verify functionality
5. Investigate and fix issues
6. Redeploy with fixes

## Performance Targets

- **Uptime:** 99.9%
- **Response Time (p95):** <200ms
- **Time to First Byte:** <100ms
- **Largest Contentful Paint:** <2.5s
- **First Input Delay:** <100ms
- **Cumulative Layout Shift:** <0.1
- **Cache Hit Ratio:** >80%

## Success Metrics

Monitor these in the production dashboard:

- **Active Users:** Daily/Monthly Active Users
- **Bookings:** Total and successful bookings
- **Revenue:** Daily/Monthly revenue
- **Screen Utilization:** Average occupancy rate
- **Error Rate:** <0.1%
- **Payment Success Rate:** >98%

---

**Status:** ✅ Production Ready (with noted optional items)  
**Last Updated:** 2025-01-09  
**Deployment URL:** https://redsquare.app
