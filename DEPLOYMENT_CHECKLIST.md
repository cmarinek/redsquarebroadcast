# Deployment Checklist - Launch Readiness Features

## 🚀 Pre-Deployment Checklist

Use this checklist to verify all launch readiness features are properly deployed and configured.

---

## 1. ⚡ Edge Function Deployment

### 1.1 Deploy Invoice Generation Function

```bash
# Deploy the function
supabase functions deploy generate-invoice

# Verify deployment
supabase functions list | grep generate-invoice

# Test with curl
curl -X POST https://[project-ref].supabase.co/functions/v1/generate-invoice \
  -H "Authorization: Bearer [test-token]" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "[test-booking-id]"}' \
  --output test-invoice.pdf
```

- [ ] Function deployed successfully
- [ ] Function appears in function list
- [ ] Test curl command works
- [ ] PDF downloads correctly
- [ ] No errors in edge function logs

**Troubleshooting:**
If jsPDF compatibility issues occur:
- Check Deno version compatibility
- Consider alternative: PDFKit or client-side generation
- Monitor edge function logs: `supabase functions logs generate-invoice`

---

### 1.2 Verify Rate Limiting Function

```bash
# Check if already deployed
supabase functions list | grep rate-limit

# If not deployed:
supabase functions deploy rate-limit

# Test
curl -X POST https://[project-ref].supabase.co/functions/v1/rate-limit \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test-user", "endpoint": "auth_signin", "action": "check"}'
```

- [ ] Rate limit function deployed
- [ ] Test returns expected response
- [ ] Database has rate_limits table

---

## 2. 🗄️ Database Verification

### 2.1 Verify Rate Limits Table

```sql
-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'rate_limits'
);

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'rate_limits';

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'rate_limits';
```

- [ ] Table exists
- [ ] All indexes created
- [ ] RLS policies in place
- [ ] Cleanup function exists

---

### 2.2 Run Migrations

```bash
# Check migration status
supabase db diff

# Apply any pending migrations
supabase db push
```

- [ ] All migrations applied
- [ ] No schema drift
- [ ] Migration 20251113000001_rate_limiting_system.sql applied

---

## 3. 🔑 Environment Variables

### 3.1 Verify Required Variables

```bash
# Check current secrets
supabase secrets list

# Verify each required secret
supabase secrets get RESEND_API_KEY
supabase secrets get SUPABASE_URL
supabase secrets get SUPABASE_SERVICE_ROLE_KEY
```

Required secrets:
- [ ] `RESEND_API_KEY` - For invoice email delivery
- [ ] `SUPABASE_URL` - Auto-configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured
- [ ] `STRIPE_SECRET_KEY` - For payments

If missing:
```bash
# Set missing secrets
supabase secrets set RESEND_API_KEY=your_key_here
```

---

### 3.2 Client Environment Variables

Verify in your deployment platform (Vercel, Netlify, etc.):

```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
VITE_MAPBOX_PUBLIC_TOKEN=[mapbox-token]
VITE_STRIPE_PUBLISHABLE_KEY=[stripe-pk]
```

- [ ] All client env vars set
- [ ] Values are correct
- [ ] No typos in variable names

---

## 4. 🔒 Security Verification

### 4.1 Invoice Authorization

Test that users CANNOT access other users' invoices:

```bash
# Create booking as User A
# Get booking ID

# Try to access as User B (should fail)
curl -X POST https://[project-ref].supabase.co/functions/v1/generate-invoice \
  -H "Authorization: Bearer [user-b-token]" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "[user-a-booking-id]"}'

# Expected: 403 Forbidden
```

- [ ] Returns 403 Forbidden
- [ ] Error message: "You are not authorized to access this invoice"
- [ ] Security warning logged

---

### 4.2 Rate Limiting Security

Test that rate limits work:

```bash
# Test sign-in rate limit
# Make 6 rapid login attempts with wrong password
# Expected: 6th attempt blocked
```

- [ ] Rate limits enforced
- [ ] No false positives
- [ ] Limits reset after time window

---

## 5. 🧪 Functional Testing

### 5.1 Complete Booking Flow

End-to-end test:

1. [ ] Sign in as advertiser
2. [ ] Navigate to /discover
3. [ ] Select a screen
4. [ ] Upload content
5. [ ] Schedule booking
6. [ ] Complete payment
7. [ ] Download invoice from PaymentSuccess page
8. [ ] Download invoice from Confirmation page
9. [ ] Verify invoice contains correct data

---

### 5.2 Pagination Testing

1. [ ] Navigate to /discover
2. [ ] Verify only 50 screens load initially
3. [ ] Click "Load More"
4. [ ] Verify 50 more screens load
5. [ ] Search for screen
6. [ ] Verify pagination resets

---

### 5.3 Analytics Testing

1. [ ] Navigate to advertiser dashboard
2. [ ] Go to Analytics tab
3. [ ] Verify metrics display
4. [ ] Check for console errors
5. [ ] Verify charts render

---

## 6. 📊 Performance Verification

### 6.1 Response Time Checks

Test and record:

```bash
# Invoice generation
time curl -X POST ... > /dev/null

# Rate limit check
time curl -X POST ... > /dev/null

# Pagination query
# Check Supabase dashboard > Performance
```

Target metrics:
- [ ] Invoice generation: <5 seconds
- [ ] Rate limit check: <100ms
- [ ] Pagination query: <200ms
- [ ] Screen discovery page load: <2s

---

### 6.2 Load Testing

Optional but recommended:

```bash
# Install k6 or Artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://your-app.com/api/endpoint
```

- [ ] Rate limiting works under load
- [ ] No database deadlocks
- [ ] Error rate <1%

---

## 7. 🌐 Cross-Browser Testing

Test in each browser:

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile:**
- [ ] iOS Safari
- [ ] Android Chrome

**Test:**
1. Invoice download
2. Rate limit toasts
3. Pagination
4. Analytics charts

---

## 8. 📱 Mobile Testing

Test on real devices if possible:

**iOS:**
- [ ] Invoice downloads to Files app
- [ ] Toasts display correctly
- [ ] Pagination buttons accessible
- [ ] Analytics responsive

**Android:**
- [ ] Invoice downloads to Downloads folder
- [ ] Toasts display correctly
- [ ] Pagination works
- [ ] Analytics responsive

---

## 9. 📝 Documentation Verification

- [ ] `TESTING_GUIDE.md` exists and is up-to-date
- [ ] `docs/API_REFERENCE.md` includes invoice endpoint
- [ ] `README.md` updated (if needed)
- [ ] Inline code comments added
- [ ] CHANGELOG updated

---

## 10. 🔍 Monitoring Setup

### 10.1 Error Tracking

Setup monitoring for:

```javascript
// Frontend errors
window.onerror = (message, source, lineno, colno, error) => {
  // Send to error tracking service
};

// Supabase edge function logs
// Monitor via Supabase Dashboard > Edge Functions > Logs
```

- [ ] Frontend error tracking configured
- [ ] Edge function logs monitored
- [ ] Alerts set up for critical errors

---

### 10.2 Usage Metrics

Track:
- [ ] Invoice generation count/day
- [ ] Rate limit triggers/day
- [ ] Pagination "Load More" clicks
- [ ] Analytics page views

---

## 11. 🚦 Final Checks

### Pre-Deployment

- [ ] All tests passing (see TESTING_GUIDE.md)
- [ ] TypeScript compilation successful
- [ ] No console errors in dev mode
- [ ] Build succeeds: `npm run build`
- [ ] No linting errors: `npm run lint`

### Post-Deployment

- [ ] Production URL accessible
- [ ] Invoice generation works in production
- [ ] Rate limiting works in production
- [ ] Pagination works in production
- [ ] Analytics display in production
- [ ] No errors in browser console
- [ ] No errors in edge function logs

---

## 12. 🔄 Rollback Plan

If issues occur after deployment:

### Quick Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard [previous-commit-hash]

# Push
git push --force origin main

# Redeploy
# (depends on your deployment platform)
```

### Disable Specific Features

If only one feature is problematic:

**Disable Invoice Generation:**
```typescript
// In PaymentSuccess.tsx and Confirmation.tsx
const downloadInvoice = async () => {
  toast({
    title: "Feature temporarily unavailable",
    description: "Invoice generation is undergoing maintenance",
    variant: "destructive"
  });
  return;
};
```

**Disable Rate Limiting:**
```typescript
// In useRateLimit.ts
const checkRateLimit = async () => {
  return true; // Always allow (emergency only!)
};
```

---

## 13. 📞 Support & Escalation

If issues arise:

1. **Check logs first:**
   - Browser console
   - Supabase Edge Functions logs
   - Database logs

2. **Consult documentation:**
   - TESTING_GUIDE.md
   - docs/API_REFERENCE.md
   - This deployment checklist

3. **Escalation contacts:**
   - Technical lead: [contact]
   - DevOps team: [contact]
   - Supabase support: support@supabase.io

---

## 14. ✅ Sign-Off

Deployment completed by: ___________________

Date: ___________________

Verified by: ___________________

All checks passed: [ ] YES [ ] NO

Issues encountered: _________________________________________________

Resolution: _________________________________________________

---

## Appendix: Useful Commands

### Supabase CLI

```bash
# View logs
supabase functions logs generate-invoice --tail
supabase functions logs rate-limit --tail

# Check function status
supabase functions list

# Run migrations
supabase db push

# Reset local database (dev only!)
supabase db reset
```

### Database Queries

```sql
-- Check rate limiting data
SELECT * FROM rate_limits ORDER BY created_at DESC LIMIT 100;

-- Clean up old rate limits manually
SELECT cleanup_old_rate_limits();

-- Check for blocked identifiers
SELECT * FROM blocked_identifiers;

-- View recent bookings (for testing)
SELECT id, user_id, amount_cents, payment_status, created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;
```

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
**Branch:** `claude/redsquare-launch-readiness-011CV6Cv4Mchu4ZxPUPNZSX9`
