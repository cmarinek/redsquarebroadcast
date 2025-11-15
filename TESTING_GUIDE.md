# Testing Guide - Launch Readiness Features

## Overview

This guide covers testing procedures for all newly implemented launch readiness features:
- Rate Limiting
- PDF Invoice Generation
- Cursor-Based Pagination
- Advanced Analytics

---

## 1. Rate Limiting Tests

### 1.1 Authentication Rate Limiting

**Test:** Sign In Rate Limit (5 attempts per 15 minutes)

```
Steps:
1. Navigate to /auth
2. Attempt to sign in with incorrect credentials 5 times
3. On the 6th attempt, verify:
   - Error message: "Too many sign-in attempts"
   - Rate limit toast notification appears
   - Login form is disabled/blocked
4. Wait 15 minutes
5. Attempt login again - should succeed
```

**Expected Result:**
- ✅ First 5 attempts return "Invalid credentials"
- ✅ 6th attempt returns "Rate limit exceeded"
- ✅ After 15 minutes, attempts reset

---

**Test:** Sign Up Rate Limit (3 attempts per 60 minutes)

```
Steps:
1. Navigate to /auth (Sign Up tab)
2. Attempt to sign up with same email 3 times
3. On the 4th attempt, verify rate limit error
4. Check Supabase rate_limits table:
   SELECT * FROM rate_limits
   WHERE identifier = '[test-email]'
   AND endpoint = 'auth/signup'
```

**Expected Result:**
- ✅ Rate limit triggers after 3 attempts
- ✅ Database has 3+ records
- ✅ User-friendly error message

---

**Test:** Password Reset Rate Limit (3 attempts per 60 minutes)

```
Steps:
1. Navigate to /auth
2. Click "Forgot Password"
3. Submit password reset 3 times
4. 4th attempt should be blocked
```

**Expected Result:**
- ✅ First 3 attempts send reset emails
- ✅ 4th attempt shows rate limit error

---

### 1.2 Content Upload Rate Limiting

**Test:** Content Upload Rate Limit (10 uploads per 60 minutes)

```
Steps:
1. Navigate to /book/[screenId]/upload
2. Upload 10 test files (can be same file)
3. Attempt 11th upload
4. Verify rate limit error appears
```

**Expected Result:**
- ✅ First 10 uploads succeed
- ✅ 11th upload blocked with toast notification
- ✅ Error: "Too many upload requests. Please try again later."

---

### 1.3 Booking Creation Rate Limiting

**Test:** Booking Creation Rate Limit (20 bookings per 60 minutes)

```
Steps:
1. Create automated script or manually create 20 bookings
2. Attempt 21st booking
3. Verify rate limit triggers
```

**Expected Result:**
- ✅ First 20 bookings created
- ✅ 21st booking blocked
- ✅ Rate limit toast appears

---

### 1.4 Payment Rate Limiting

**Test:** Payment Creation Rate Limit (10 payments per 30 minutes)

```
Steps:
1. Navigate to /book/[screenId]/payment
2. Attempt to create 10 payment sessions
3. Attempt 11th payment
4. Verify rate limit error
```

**Expected Result:**
- ✅ First 10 payment intents created
- ✅ 11th attempt blocked
- ✅ Appropriate error message

---

### 1.5 Rate Limit Edge Cases

**Test:** Multiple Users Don't Interfere

```
Steps:
1. User A: Make 5 login attempts
2. User B: Make 5 login attempts
3. Verify both are rate limited independently
```

**Expected Result:**
- ✅ Each user has separate rate limit counter
- ✅ User A's attempts don't affect User B

---

**Test:** Rate Limit Cleanup

```
Steps:
1. Create rate limit records
2. Wait 24 hours (or manually run cleanup function)
3. Verify old records are deleted:
   SELECT cleanup_old_rate_limits();
```

**Expected Result:**
- ✅ Records older than 24 hours are deleted
- ✅ Recent records remain

---

## 2. Invoice Generation Tests

### 2.1 Basic Invoice Generation

**Test:** Download Invoice After Payment

```
Steps:
1. Complete a booking through payment
2. Navigate to PaymentSuccess page
3. Click "Download Invoice" button
4. Verify PDF downloads
```

**Expected Result:**
- ✅ PDF file downloads with name: invoice-XXXXXXXX.pdf
- ✅ Toast: "Invoice downloaded!"
- ✅ File opens successfully in PDF viewer

---

**Test:** Invoice Content Verification

```
Steps:
1. Download invoice
2. Open PDF and verify:
   - Invoice number (INV-XXXXXXXX)
   - Invoice date
   - Company info (RedSquare)
   - Customer name and email
   - Screen name and location
   - Booking start time and duration
   - Pricing breakdown:
     * Screen Booking Fee
     * Platform Fee (10%)
     * Total
   - Payment method
   - Transaction ID
   - Footer with support email
```

**Expected Result:**
- ✅ All fields populated correctly
- ✅ Professional formatting
- ✅ Calculations accurate (base + 10% platform fee = total)

---

### 2.2 Invoice Security Tests

**Test:** Authorization - Own Invoices Only

```
Steps:
1. User A creates booking (booking_id_1)
2. User B tries to download User A's invoice via API:
   POST /functions/v1/generate-invoice
   { "bookingId": "booking_id_1" }
   Authorization: Bearer [user_b_token]
3. Verify 403 Forbidden error
```

**Expected Result:**
- ✅ Returns 403 Forbidden
- ✅ Error: "You are not authorized to access this invoice"
- ✅ Security warning logged in edge function logs

---

**Test:** Unauthenticated Access Blocked

```
Steps:
1. Attempt invoice download without auth token:
   POST /functions/v1/generate-invoice
   { "bookingId": "test-id" }
   (No Authorization header)
```

**Expected Result:**
- ✅ Returns 401 Unauthorized
- ✅ Error: "Authentication required"

---

**Test:** Invalid Booking ID

```
Steps:
1. Request invoice with non-existent booking ID:
   POST /functions/v1/generate-invoice
   { "bookingId": "fake-id-12345" }
```

**Expected Result:**
- ✅ Returns 404 Not Found
- ✅ Error: "Booking not found"

---

### 2.3 Invoice Generation Edge Cases

**Test:** Special Characters in Screen Name

```
Steps:
1. Create booking with screen name: "Times Square™ - 42nd & 7th"
2. Download invoice
3. Verify special characters render correctly in PDF
```

**Expected Result:**
- ✅ Special characters (™, &) render correctly
- ✅ No encoding issues

---

**Test:** Large Invoice Amounts

```
Steps:
1. Create booking with amount: $99,999.99
2. Download invoice
3. Verify formatting
```

**Expected Result:**
- ✅ Amount displays correctly: $99,999.99
- ✅ Platform fee calculated correctly: $9,999.99
- ✅ Total: $109,999.99

---

**Test:** Multiple Currency Support

```
Steps:
1. Create booking with currency: EUR
2. Download invoice
3. Verify currency displays correctly
```

**Expected Result:**
- ✅ Currency symbol/code appears correctly
- ✅ If USD: shows $
- ✅ If EUR: shows EUR or €

---

## 3. Pagination Tests

### 3.1 Basic Pagination

**Test:** Initial Load

```
Steps:
1. Navigate to /discover
2. Verify only 50 screens load initially
3. Check network tab - only 1 query fetches 51 records
4. Verify "Load More" button appears if >50 screens exist
```

**Expected Result:**
- ✅ Exactly 50 screens displayed
- ✅ Query limit: 51 (checks for hasMore)
- ✅ Load More button visible if applicable

---

**Test:** Load More Functionality

```
Steps:
1. Navigate to /discover with 100+ screens
2. Click "Load More"
3. Verify:
   - 50 more screens appear
   - Total now shows 100 screens
   - Network request fetches next batch
4. Click "Load More" again
5. Repeat until all screens loaded
```

**Expected Result:**
- ✅ Each click loads 50 more screens
- ✅ No duplicate screens
- ✅ Button disappears when all screens loaded

---

### 3.2 Pagination Edge Cases

**Test:** Search Resets Pagination

```
Steps:
1. Load 100 screens (2 pages)
2. Search for specific screen
3. Verify pagination resets to page 1
4. Verify only matching results show
```

**Expected Result:**
- ✅ Previous pages cleared
- ✅ Search results start from page 1
- ✅ Correct filtering applied

---

**Test:** Exactly 50 Screens

```
Steps:
1. Database has exactly 50 screens
2. Navigate to /discover
3. Verify "Load More" button does NOT appear
```

**Expected Result:**
- ✅ All 50 screens displayed
- ✅ No "Load More" button
- ✅ Clean UI without unnecessary controls

---

**Test:** Performance with Large Dataset

```
Steps:
1. Seed database with 10,000 screens
2. Navigate to /discover
3. Measure:
   - Initial load time (should be <2s)
   - Click "Load More" response time (should be <500ms)
4. Check database query performance in Supabase logs
```

**Expected Result:**
- ✅ Initial load: <2 seconds
- ✅ Load more: <500ms
- ✅ Query uses index (efficient)
- ✅ No full table scans

---

## 4. Analytics Tests

### 4.1 Analytics Calculations

**Test:** Growth Calculation Accuracy

```
Steps:
1. Create test data:
   - Previous period: 1000 impressions
   - Current period: 1500 impressions
2. Navigate to analytics dashboard
3. Verify growth calculation:
   - Change: +500
   - Change%: +50%
   - Trend: up (green badge)
```

**Expected Result:**
- ✅ Math is correct: (1500-1000)/1000 * 100 = 50%
- ✅ Green upward trend indicator
- ✅ "+50%" displayed

---

**Test:** Trend Analysis

```
Steps:
1. Create trending data (increasing pattern)
2. View TrendChart component
3. Verify:
   - Trend direction: "increasing"
   - Trend strength: based on slope
   - Confidence percentage displayed
```

**Expected Result:**
- ✅ Trend detected correctly
- ✅ Confidence score reasonable (>70% for strong trends)
- ✅ Visual trend line displayed

---

**Test:** Forecasting Accuracy

```
Steps:
1. Create historical data (7 days)
2. Enable showForecast on TrendChart
3. Verify:
   - 7 forecast points generated
   - Confidence intervals displayed
   - Forecast extends into future
```

**Expected Result:**
- ✅ Forecast points visible
- ✅ Shaded confidence interval
- ✅ Separated from historical data visually

---

### 4.2 Analytics UI Tests

**Test:** Empty Data State

```
Steps:
1. New user with no data
2. Navigate to analytics
3. Verify graceful empty state
```

**Expected Result:**
- ✅ "No data available" message
- ✅ No errors in console
- ✅ Clean, professional UI

---

**Test:** Insights Generation

```
Steps:
1. Create data with >10% growth
2. View InsightsPanel
3. Verify insight appears:
   - Type: "positive"
   - Title: "Strong Growth"
   - Recommendation provided
```

**Expected Result:**
- ✅ Insight card displayed
- ✅ Green/positive styling
- ✅ Actionable recommendation

---

## 5. Integration Tests

### 5.1 Complete Booking Flow with Invoice

**End-to-End Test:**

```
Steps:
1. Sign in as advertiser
2. Navigate to /discover
3. Select a screen
4. Upload content (verify rate limit not hit)
5. Schedule booking
6. Complete payment
7. Download invoice
8. Verify all data matches

Verify at each step:
- Rate limits don't block legitimate use
- Data persists correctly
- All features work together
```

**Expected Result:**
- ✅ Smooth flow with no errors
- ✅ Invoice contains correct booking details
- ✅ No rate limit false positives

---

## 6. Performance Tests

### 6.1 Load Testing

**Test:** Rate Limit Under Load

```
Steps:
1. Use load testing tool (k6, Artillery, etc.)
2. Simulate 100 concurrent users
3. Verify rate limits still work correctly
4. Check for any database deadlocks
```

**Expected Result:**
- ✅ Rate limits enforced accurately
- ✅ No race conditions
- ✅ Database handles concurrent inserts

---

**Test:** Invoice Generation Under Load

```
Steps:
1. Generate 100 invoices concurrently
2. Measure:
   - Average response time
   - Success rate
   - Memory usage
```

**Expected Result:**
- ✅ All invoices generate successfully
- ✅ Average time <5 seconds per invoice
- ✅ No memory leaks

---

## 7. Browser Compatibility

### 7.1 Cross-Browser Testing

**Test in:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Features to test:**
1. PDF download works
2. Rate limit toasts appear
3. Analytics charts render
4. Pagination functions

---

## 8. Mobile Testing

**Test on:**
- ✅ iOS Safari
- ✅ Android Chrome

**Verify:**
- Invoice download works on mobile
- Rate limit messages readable
- Pagination buttons accessible
- Analytics responsive

---

## Known Limitations

1. **Invoice Generation:**
   - PDF generation requires jsPDF Deno compatibility
   - Large PDFs (>1MB) may timeout in serverless

2. **Rate Limiting:**
   - Relies on accurate system time
   - Clearing cookies/sessions can reset some limits

3. **Pagination:**
   - Cursor-based, so no "jump to page X"
   - New screens inserted during browsing may cause duplicates

4. **Analytics:**
   - Forecasting assumes linear trends
   - Requires minimum 2 data points

---

## Reporting Issues

If you find bugs or unexpected behavior:

1. Check browser console for errors
2. Check Supabase edge function logs
3. Note steps to reproduce
4. Include screenshots
5. Report at: https://github.com/anthropics/redsquarebroadcast/issues

---

## Success Criteria

Before production deployment, verify:

- [x] All critical security tests pass
- [x] Rate limiting works correctly
- [x] Invoice generation authorized properly
- [ ] No console errors in production build
- [ ] Performance metrics within targets
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile testing complete

---

*Last Updated: 2025-11-15*
*Version: 1.0.0*
