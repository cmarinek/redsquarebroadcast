# Email Notification System

## Overview

Red Square uses **Resend** for transactional email delivery with **React Email** templates for beautiful, responsive emails.

## Email Types

### 1. Booking Confirmation
**Trigger:** When a booking is successfully created and paid  
**Edge Function:** `send-booking-confirmation`  
**Template:** `booking-confirmation.tsx`  
**To:** Broadcaster (user who made the booking)  
**From:** bookings@redsquare.app

**Content:**
- Booking ID and confirmation details
- Screen name and location
- Start/end time and duration
- Total amount paid
- Link to view booking details

### 2. Payment Confirmation
**Trigger:** When a payment is successfully processed  
**Edge Function:** `send-payment-confirmation`  
**Template:** `payment-confirmation.tsx`  
**To:** Broadcaster (user who made the payment)  
**From:** payments@redsquare.app

**Content:**
- Payment amount and currency
- Payment method used
- Transaction ID
- Booking reference
- Download receipt link

### 3. Screen Owner Notification
**Trigger:** When a booking is made on their screen  
**Edge Function:** `send-screen-owner-notification`  
**Template:** `screen-owner-notification.tsx`  
**To:** Screen owner  
**From:** notifications@redsquare.app

**Content:**
- New booking notification
- Earnings from the booking
- Booking details (time, duration)
- Link to dashboard
- Content approval status

### 4. System Alert
**Trigger:** Critical system events (errors, security, performance)  
**Edge Function:** `send-system-alert`  
**Template:** `system-alert.tsx`  
**To:** All admin users  
**From:** alerts@redsquare.app

**Content:**
- Alert type and severity
- Detailed message
- Metadata (error details, metrics)
- Timestamp
- Link to admin dashboard
- Recommended actions

## Email Configuration

### Resend Setup

1. **Domain Verification**
   - Domain: redsquare.app
   - DNS records configured in Cloudflare
   - SPF, DKIM, DMARC records added

2. **API Key**
   - Stored in Supabase secrets as `RESEND_API_KEY`
   - Used by all email edge functions

3. **Sending Addresses**
   - bookings@redsquare.app - Booking confirmations
   - payments@redsquare.app - Payment receipts
   - notifications@redsquare.app - General notifications
   - alerts@redsquare.app - System alerts
   - support@redsquare.app - Customer support

## How to Trigger Emails

### From Edge Functions

```typescript
import { supabase } from "@/integrations/supabase/client";

// Trigger booking confirmation email
await supabase.functions.invoke("send-booking-confirmation", {
  body: { bookingId: "booking-uuid" }
});

// Trigger payment confirmation email
await supabase.functions.invoke("send-payment-confirmation", {
  body: { paymentId: "payment-uuid" }
});

// Trigger screen owner notification
await supabase.functions.invoke("send-screen-owner-notification", {
  body: { bookingId: "booking-uuid" }
});

// Trigger system alert
await supabase.functions.invoke("send-system-alert", {
  body: {
    alertType: "payment_failure",
    severity: "high",
    title: "Payment Processing Issue",
    message: "Multiple payment failures detected",
    metadata: { count: 10, timeWindow: "5 minutes" }
  }
});
```

### Integration Points

**Booking Flow:**
1. User completes booking → Create booking record
2. Payment succeeds → Create payment record
3. **Trigger:** `send-booking-confirmation` + `send-screen-owner-notification`

**Payment Flow:**
1. Stripe webhook receives payment success
2. Update payment status to "succeeded"
3. **Trigger:** `send-payment-confirmation`

**System Monitoring:**
1. Production monitoring detects critical issue
2. Alert recorded in database
3. **Trigger:** `send-system-alert`

## Email Template Customization

### Template Structure

All templates use React Email components:

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "npm:@react-email/components@0.0.22";

export const MyEmail = ({ prop1, prop2 }) => (
  <Html>
    <Head />
    <Preview>Email preview text</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Email content */}
      </Container>
    </Body>
  </Html>
);
```

### Styling Guidelines

- Use inline styles (required for email clients)
- Define style objects as constants
- Keep layouts simple and table-based
- Test across email clients
- Use semantic colors from brand palette

### Brand Colors

- Primary Red: `#dc2626`
- Success Green: `#16a34a`
- Warning Yellow: `#f59e0b`
- Info Blue: `#3b82f6`
- Dark Text: `#111827`
- Light Text: `#6b7280`

## Testing Emails

### Development Testing

```bash
# Send test email via Supabase CLI
supabase functions invoke send-booking-confirmation \
  --body '{"bookingId":"test-booking-id"}'
```

### Preview Templates

Use React Email's preview feature:

```bash
npm install -g @react-email/cli
react-email preview
```

## Monitoring Email Delivery

### Resend Dashboard

Monitor at: https://resend.com/emails

Metrics:
- Delivery rate
- Open rate (if tracking enabled)
- Bounce rate
- Spam complaints

### Error Handling

All email edge functions include error handling:
- Failed emails are logged to console
- Errors returned to caller
- No retry mechanism (caller should retry if needed)

## Future Enhancements

- [ ] Email preferences per user
- [ ] Unsubscribe functionality
- [ ] Email templates for more events
- [ ] Scheduled email digests
- [ ] A/B testing for email content
- [ ] Multi-language email support
- [ ] Email analytics dashboard

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set in Supabase secrets
2. Verify domain is verified in Resend dashboard
3. Check edge function logs for errors
4. Ensure user email exists in auth.users

### Emails Going to Spam

1. Verify SPF, DKIM, DMARC records
2. Warm up domain by starting with low volume
3. Avoid spam trigger words
4. Include unsubscribe link
5. Monitor bounce and complaint rates

### Template Rendering Issues

1. Test locally with React Email preview
2. Check inline styles are correct
3. Verify all props are passed correctly
4. Test across email clients (Gmail, Outlook, etc.)

---

**Status:** ✅ Fully Implemented  
**Last Updated:** 2025-01-09
