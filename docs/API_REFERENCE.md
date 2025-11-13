# RedSquare API Reference

Complete reference documentation for all RedSquare edge functions and APIs.

**Base URL**: `https://[project-ref].supabase.co/functions/v1/`

**Authentication**: All authenticated endpoints require a valid Supabase auth token in the `Authorization` header.

---

## Table of Contents

- [Authentication & Users](#authentication--users)
- [Payment Processing](#payment-processing)
- [Device Management](#device-management)
- [Content Management](#content-management)
- [Admin & Monitoring](#admin--monitoring)
- [Communication](#communication)
- [Build & Deploy](#build--deploy)
- [Rate Limiting](#rate-limiting)

---

## Authentication & Users

### Check Subscription

**Endpoint**: `POST /check-subscription`

**Description**: Validates a user's subscription status

**Authentication**: Required

**Request Body**:
```json
{
  "userId": "string (uuid)"
}
```

**Response** (200):
```json
{
  "active": boolean,
  "tier": "free" | "basic" | "premium" | "enterprise",
  "expiresAt": "string (ISO 8601)",
  "features": string[]
}
```

**Response** (401):
```json
{
  "error": "Unauthorized"
}
```

---

## Payment Processing

### Create Checkout Session

**Endpoint**: `POST /create-checkout`

**Description**: Creates a Stripe checkout session for booking payment

**Authentication**: Required

**Request Body**:
```json
{
  "bookingId": "string (uuid)",
  "screenId": "string (uuid)",
  "amount": number,
  "currency": "string (ISO 4217)",
  "successUrl": "string (URL)",
  "cancelUrl": "string (URL)"
}
```

**Response** (200):
```json
{
  "sessionId": "string",
  "url": "string (Stripe checkout URL)",
  "expiresAt": "string (ISO 8601)"
}
```

**Errors**:
- `400`: Invalid request parameters
- `401`: Unauthorized
- `404`: Booking not found
- `409`: Booking already paid
- `500`: Stripe API error

---

### Create Payment

**Endpoint**: `POST /create-payment`

**Description**: Creates a payment intent for direct charge

**Authentication**: Required

**Request Body**:
```json
{
  "bookingId": "string (uuid)",
  "paymentMethodId": "string",
  "amount": number,
  "currency": "string"
}
```

**Response** (200):
```json
{
  "paymentIntentId": "string",
  "clientSecret": "string",
  "status": "requires_payment_method" | "requires_confirmation" | "succeeded"
}
```

---

### Verify Payment

**Endpoint**: `POST /verify-payment`

**Description**: Verifies payment status and updates booking

**Authentication**: Required

**Request Body**:
```json
{
  "paymentIntentId": "string",
  "bookingId": "string (uuid)"
}
```

**Response** (200):
```json
{
  "verified": boolean,
  "status": "succeeded" | "failed" | "pending",
  "amount": number,
  "currency": "string"
}
```

---

### Create Payout

**Endpoint**: `POST /create-payout`

**Description**: Initiates payout to screen owner

**Authentication**: Required (Admin or Screen Owner)

**Request Body**:
```json
{
  "screenOwnerId": "string (uuid)",
  "amount": number,
  "currency": "string",
  "bookingIds": "string[] (uuid array)"
}
```

**Response** (200):
```json
{
  "payoutId": "string (uuid)",
  "status": "pending" | "processing" | "completed",
  "estimatedArrival": "string (ISO 8601)",
  "stripePayoutId": "string"
}
```

---

### Stripe Webhook

**Endpoint**: `POST /stripe-webhook`

**Description**: Handles Stripe webhook events

**Authentication**: Stripe signature verification

**Headers**:
```
stripe-signature: string
```

**Request Body**: Raw Stripe event payload

**Response** (200):
```json
{
  "received": true
}
```

**Supported Events**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`
- `payout.paid`
- `payout.failed`

---

### Customer Portal

**Endpoint**: `POST /customer-portal`

**Description**: Creates Stripe customer portal session

**Authentication**: Required

**Request Body**:
```json
{
  "returnUrl": "string (URL)"
}
```

**Response** (200):
```json
{
  "url": "string (Portal URL)"
}
```

---

### Owner Earnings

**Endpoint**: `GET /owner-earnings`

**Description**: Retrieves earnings summary for screen owner

**Authentication**: Required (Screen Owner)

**Query Parameters**:
- `startDate`: ISO 8601 date (optional)
- `endDate`: ISO 8601 date (optional)
- `screenId`: UUID (optional, filter by screen)

**Response** (200):
```json
{
  "totalEarnings": number,
  "pendingPayouts": number,
  "paidPayouts": number,
  "currency": "string",
  "breakdown": {
    "byScreen": {
      "screen_id": {
        "earnings": number,
        "bookings": number
      }
    },
    "byMonth": {
      "2025-01": number,
      "2025-02": number
    }
  }
}
```

---

## Device Management

### Device Pair

**Endpoint**: `POST /device-pair`

**Description**: Pairs a new device using QR code

**Authentication**: Public (requires pairing code)

**Request Body**:
```json
{
  "pairingCode": "string (6-digit code)",
  "deviceInfo": {
    "platform": "samsung_tizen" | "lg_webos" | "android_tv" | etc.,
    "model": "string",
    "osVersion": "string",
    "appVersion": "string"
  }
}
```

**Response** (200):
```json
{
  "deviceId": "string (uuid)",
  "authToken": "string (JWT)",
  "expiresAt": "string (ISO 8601)",
  "config": {
    "updateInterval": number,
    "heartbeatInterval": number
  }
}
```

**Errors**:
- `400`: Invalid pairing code
- `404`: Pairing code not found or expired
- `409`: Device already paired

---

### Device Bind Screen

**Endpoint**: `POST /device-bind-screen`

**Description**: Binds a device to a screen

**Authentication**: Device token required

**Request Body**:
```json
{
  "deviceId": "string (uuid)",
  "screenId": "string (uuid)"
}
```

**Response** (200):
```json
{
  "success": true,
  "screenDetails": {
    "screenId": "string",
    "name": "string",
    "location": "string",
    "resolution": "string"
  }
}
```

---

### Device Heartbeat

**Endpoint**: `POST /device-heartbeat`

**Description**: Updates device online status

**Authentication**: Device token required

**Request Body**:
```json
{
  "deviceId": "string (uuid)",
  "status": "idle" | "broadcasting" | "error",
  "currentContent": "string (uuid)" | null,
  "metrics": {
    "cpuUsage": number,
    "memoryUsage": number,
    "temperature": number
  }
}
```

**Response** (200):
```json
{
  "acknowledged": true,
  "nextHeartbeat": number (seconds),
  "commands": [
    {
      "id": "string",
      "type": "update_content" | "restart" | "screenshot",
      "params": object
    }
  ]
}
```

---

### Device Commands

**Endpoint**: `POST /device-commands`

**Description**: Sends command to device

**Authentication**: Required (Screen Owner or Admin)

**Request Body**:
```json
{
  "deviceId": "string (uuid)",
  "command": {
    "type": "update_content" | "restart" | "screenshot" | "adjust_brightness",
    "params": object,
    "priority": "low" | "normal" | "high"
  }
}
```

**Response** (200):
```json
{
  "commandId": "string (uuid)",
  "status": "queued",
  "estimatedExecution": "string (ISO 8601)"
}
```

---

### Device Metrics

**Endpoint**: `POST /device-metrics`

**Description**: Submits device performance metrics

**Authentication**: Device token required

**Request Body**:
```json
{
  "deviceId": "string (uuid)",
  "timestamp": "string (ISO 8601)",
  "metrics": {
    "cpuUsage": number,
    "memoryUsage": number,
    "diskUsage": number,
    "temperature": number,
    "networkLatency": number,
    "frameDrops": number,
    "uptime": number
  }
}
```

**Response** (200):
```json
{
  "recorded": true
}
```

---

## Content Management

### Create Signed Upload URL

**Endpoint**: `POST /create-signed-upload`

**Description**: Generates signed URL for content upload

**Authentication**: Required

**Request Body**:
```json
{
  "fileName": "string",
  "fileType": "string (MIME type)",
  "fileSize": number (bytes),
  "contentType": "image" | "video" | "gif"
}
```

**Response** (200):
```json
{
  "uploadUrl": "string (signed URL)",
  "publicUrl": "string",
  "expiresAt": "string (ISO 8601)",
  "uploadId": "string (uuid)",
  "maxSize": number
}
```

**Errors**:
- `400`: Invalid file type or size
- `403`: Upload quota exceeded
- `413`: File too large (max 50MB)

---

### Get Signed View URL

**Endpoint**: `POST /get-signed-view-url`

**Description**: Gets signed URL to view private content

**Authentication**: Required

**Request Body**:
```json
{
  "contentId": "string (uuid)",
  "expiresIn": number (seconds, default 3600)
}
```

**Response** (200):
```json
{
  "url": "string (signed URL)",
  "expiresAt": "string (ISO 8601)"
}
```

---

### Post Upload Process

**Endpoint**: `POST /post-upload-process`

**Description**: Triggers post-upload processing (thumbnail, transcode)

**Authentication**: System internal

**Request Body**:
```json
{
  "uploadId": "string (uuid)",
  "fileUrl": "string",
  "fileType": "string"
}
```

**Response** (200):
```json
{
  "jobId": "string",
  "status": "processing",
  "estimatedCompletion": "string (ISO 8601)"
}
```

---

### Content Moderation

**Endpoint**: `POST /content-moderation`

**Description**: AI-powered content moderation check

**Authentication**: System internal

**Request Body**:
```json
{
  "contentId": "string (uuid)",
  "contentUrl": "string",
  "contentType": "image" | "video"
}
```

**Response** (200):
```json
{
  "approved": boolean,
  "confidence": number (0-1),
  "flags": string[],
  "categories": {
    "adult": number,
    "violence": number,
    "hate": number,
    "sensitive": number
  },
  "requiresManualReview": boolean
}
```

---

### Content Sync

**Endpoint**: `GET /content-sync`

**Description**: Gets content schedule for device

**Authentication**: Device token required

**Query Parameters**:
- `deviceId`: UUID
- `screenId`: UUID
- `since`: ISO 8601 timestamp (optional)

**Response** (200):
```json
{
  "schedule": [
    {
      "contentId": "string (uuid)",
      "startTime": "string (ISO 8601)",
      "endTime": "string (ISO 8601)",
      "duration": number (seconds),
      "contentUrl": "string (signed URL)",
      "type": "image" | "video",
      "priority": number
    }
  ],
  "nextSync": "string (ISO 8601)"
}
```

---

## Admin & Monitoring

### Production Monitoring

**Endpoint**: `GET /production-monitoring`

**Description**: System health and performance metrics

**Authentication**: Required (Admin only)

**Query Parameters**:
- `timeRange`: "1h" | "24h" | "7d" | "30d" (default: "24h")

**Response** (200):
```json
{
  "health": "healthy" | "degraded" | "critical",
  "uptime": number (percentage),
  "metrics": {
    "apiLatency": {
      "p50": number,
      "p95": number,
      "p99": number
    },
    "errorRate": number (percentage),
    "requestsPerMinute": number,
    "activeUsers": number,
    "databaseConnections": number
  },
  "alerts": [
    {
      "severity": "warning" | "critical",
      "message": "string",
      "timestamp": "string (ISO 8601)"
    }
  ]
}
```

---

### Get Analytics Data

**Endpoint**: `GET /get-analytics-data`

**Description**: Retrieve platform analytics

**Authentication**: Required (Admin only)

**Query Parameters**:
- `metric`: "users" | "revenue" | "bookings" | "screens"
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `groupBy`: "day" | "week" | "month"

**Response** (200):
```json
{
  "metric": "string",
  "period": {
    "start": "string (ISO 8601)",
    "end": "string (ISO 8601)"
  },
  "data": [
    {
      "timestamp": "string (ISO 8601)",
      "value": number,
      "change": number (percentage)
    }
  ],
  "total": number,
  "average": number
}
```

---

### Get Security Data

**Endpoint**: `GET /get-security-data`

**Description**: Security events and audit logs

**Authentication**: Required (Admin only)

**Query Parameters**:
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `eventType`: "auth" | "payment" | "access" | "violation"
- `severity`: "low" | "medium" | "high" | "critical"

**Response** (200):
```json
{
  "events": [
    {
      "id": "string (uuid)",
      "type": "string",
      "severity": "string",
      "userId": "string (uuid)" | null,
      "ipAddress": "string",
      "userAgent": "string",
      "description": "string",
      "timestamp": "string (ISO 8601)",
      "resolved": boolean
    }
  ],
  "summary": {
    "total": number,
    "byType": object,
    "bySeverity": object
  }
}
```

---

## Communication

### Send Booking Confirmation

**Endpoint**: `POST /send-booking-confirmation`

**Description**: Sends booking confirmation email

**Authentication**: System internal

**Request Body**:
```json
{
  "bookingId": "string (uuid)",
  "userEmail": "string",
  "userName": "string",
  "bookingDetails": {
    "screenName": "string",
    "startTime": "string (ISO 8601)",
    "duration": number,
    "amount": number,
    "currency": "string"
  }
}
```

**Response** (200):
```json
{
  "sent": true,
  "messageId": "string"
}
```

---

### Send Payment Confirmation

**Endpoint**: `POST /send-payment-confirmation`

**Description**: Sends payment receipt email

**Authentication**: System internal

**Request Body**:
```json
{
  "paymentId": "string (uuid)",
  "userEmail": "string",
  "amount": number,
  "currency": "string",
  "receiptUrl": "string"
}
```

**Response** (200):
```json
{
  "sent": true,
  "messageId": "string"
}
```

---

## Build & Deploy

### Trigger App Build

**Endpoint**: `POST /trigger-app-build`

**Description**: Triggers automated app build

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "platform": "ios" | "android" | "samsung_tizen" | "lg_webos" | etc.,
  "version": "string (semver)",
  "buildType": "debug" | "release",
  "branch": "string (git branch)"
}
```

**Response** (200):
```json
{
  "buildId": "string (uuid)",
  "status": "queued",
  "estimatedCompletion": "string (ISO 8601)",
  "buildUrl": "string (dashboard URL)"
}
```

---

### Update Build Status

**Endpoint**: `POST /update-build-status`

**Description**: Updates build progress (called by CI/CD)

**Authentication**: Build system token

**Request Body**:
```json
{
  "buildId": "string (uuid)",
  "status": "building" | "testing" | "success" | "failed",
  "progress": number (0-100),
  "logs": "string",
  "artifactUrl": "string" | null
}
```

**Response** (200):
```json
{
  "updated": true
}
```

---

### Create App Release

**Endpoint**: `POST /create-app-release`

**Description**: Creates new app release

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "platform": "string",
  "version": "string (semver)",
  "buildId": "string (uuid)",
  "releaseNotes": "string (markdown)",
  "minOsVersion": "string",
  "downloadUrl": "string"
}
```

**Response** (200):
```json
{
  "releaseId": "string (uuid)",
  "status": "draft" | "published",
  "publishedAt": "string (ISO 8601)" | null
}
```

---

## Rate Limiting

### Rate Limit Check

**Endpoint**: `POST /rate-limit`

**Description**: Check and enforce rate limits

**Authentication**: Public

**Request Body**:
```json
{
  "identifier": "string (user_id or IP)",
  "endpoint": "auth_signin" | "auth_signup" | "content_upload" | etc.,
  "action": "check" | "increment" | "reset"
}
```

**Response** (200):
```json
{
  "allowed": boolean,
  "remaining": number,
  "resetAt": "string (ISO 8601)",
  "limit": number,
  "window": number (minutes)
}
```

**Rate Limits**:
- `auth_signin`: 5 requests / 15 minutes
- `auth_signup`: 3 requests / 60 minutes
- `content_upload`: 10 requests / 60 minutes
- `booking_create`: 20 requests / 60 minutes
- `payment_create`: 10 requests / 30 minutes
- `api_default`: 100 requests / 60 minutes

**Response** (429 - Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": number (seconds),
  "limit": number,
  "window": number (minutes)
}
```

---

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "string (detailed error message)",
  "fields": {
    "fieldName": "error description"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found",
  "resourceType": "string",
  "resourceId": "string"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "string (conflict description)"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": number (seconds)
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "requestId": "string (for support)"
}
```

---

## Authentication

Most endpoints require authentication using a Supabase JWT token.

**Header Format**:
```
Authorization: Bearer <token>
```

**Getting a Token**:
1. Sign in via Supabase Auth
2. Extract JWT from session
3. Include in all subsequent requests

**Token Expiry**:
- Tokens expire after 1 hour
- Refresh tokens are valid for 7 days
- Implement automatic token refresh

---

## Webhooks

RedSquare can send webhooks for important events.

**Webhook Events**:
- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `payout.created`
- `payout.paid`
- `content.moderated`
- `device.offline`

**Webhook Payload**:
```json
{
  "event": "string",
  "timestamp": "string (ISO 8601)",
  "data": object,
  "signature": "string (HMAC-SHA256)"
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create checkout session
const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    bookingId: 'uuid',
    amount: 5000,
    currency: 'USD',
    successUrl: 'https://app.com/success',
    cancelUrl: 'https://app.com/cancel'
  }
});
```

### Python

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Check rate limit
response = supabase.functions.invoke('rate-limit', {
  'body': {
    'identifier': 'user-123',
    'endpoint': 'content_upload',
    'action': 'check'
  }
})
```

---

## Support

For API support:
- Documentation: `/docs/API_REFERENCE.md`
- Issues: GitHub repository
- Email: support@redsquare.app

**API Version**: 1.0.0
**Last Updated**: November 13, 2025
