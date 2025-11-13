# RedSquare Database Schema

Complete database schema documentation for the RedSquare platform.

**Database**: PostgreSQL 15+ (Supabase)
**Total Tables**: 46+
**RLS Policies**: 125
**Edge Functions**: 50+

---

## Table of Contents

- [User Management](#user-management)
- [Screen Management](#screen-management)
- [Booking & Scheduling](#booking--scheduling)
- [Payments & Finance](#payments--finance)
- [Content Management](#content-management)
- [Device & Provisioning](#device--provisioning)
- [Notifications & Communication](#notifications--communication)
- [System & Configuration](#system--configuration)
- [Security & Audit](#security--audit)
- [Analytics & Monitoring](#analytics--monitoring)

---

## Entity Relationship Overview

```
users (auth.users)
  ├── profiles (1:1)
  ├── user_roles (1:N)
  ├── screens (1:N) [as owner]
  ├── bookings (1:N)
  ├── payments (1:N)
  ├── notifications (1:N)
  └── audit_logs (1:N)

screens
  ├── bookings (1:N)
  ├── screen_ratings (1:N)
  ├── device_tokens (1:N)
  └── device_status (1:1)

bookings
  ├── payments (1:1)
  ├── content_items (N:1)
  └── schedules (1:N)
```

---

## User Management

### profiles

**Description**: User profile information and preferences

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Profile ID |
| user_id | UUID | UNIQUE, NOT NULL, FK → auth.users(id) | User reference |
| full_name | TEXT | NULL | User's full name |
| avatar_url | TEXT | NULL | Profile picture URL |
| bio | TEXT | NULL | User biography |
| phone | TEXT | NULL | Phone number |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| has_completed_advertiser_onboarding | BOOLEAN | DEFAULT FALSE | Advertiser onboarding status |
| has_completed_broadcaster_onboarding | BOOLEAN | DEFAULT FALSE | Legacy broadcaster onboarding |
| has_completed_screen_owner_onboarding | BOOLEAN | DEFAULT FALSE | Screen owner onboarding status |

**RLS Policies**:
- `profiles_select_own`: Users can view their own profile
- `profiles_insert_own`: Users can create their own profile
- `profiles_update_own`: Users can update their own profile

**Indexes**:
- `idx_profiles_user_id` on `user_id`

---

### user_roles

**Description**: Multi-role support for users

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Role assignment ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | User reference |
| role | TEXT | NOT NULL, CHECK IN ('admin', 'advertiser', 'screen_owner', 'broadcaster') | Role name |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Assignment timestamp |

**RLS Policies**:
- `user_roles_select_own`: Users can view their own roles
- `user_roles_insert_admin`: Only admins can assign roles
- `user_roles_delete_admin`: Only admins can remove roles

**Indexes**:
- `idx_user_roles_user_id` on `user_id`
- `UNIQUE(user_id, role)`

---

## Screen Management

### screens

**Description**: Digital display screens available for advertising

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Screen ID |
| screen_name | TEXT | NOT NULL | Display name |
| owner_user_id | UUID | NOT NULL, FK → auth.users(id) | Screen owner |
| location | TEXT | NOT NULL | Physical location |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| resolution | TEXT | NULL | Screen resolution (e.g., "1920x1080") |
| screen_size | TEXT | NULL | Physical size |
| pricing_per_hour | INTEGER | NULL | Price in cents |
| currency | TEXT | DEFAULT 'USD' | Currency code |
| availability_schedule | JSONB | DEFAULT '{}' | Availability times |
| average_rating | DECIMAL(3,2) | DEFAULT 0 | Average user rating |
| total_ratings | INTEGER | DEFAULT 0 | Total number of ratings |
| status | TEXT | DEFAULT 'active' | active, inactive, maintenance |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `screens_select_all`: Public can view active screens
- `screens_select_own`: Owners can view their screens
- `screens_insert_owner`: Screen owners can register screens
- `screens_update_own`: Owners can update their screens
- `screens_delete_own`: Owners can delete their screens

**Indexes**:
- `idx_screens_owner` on `owner_user_id`
- `idx_screens_location` on `latitude, longitude` (GiST for geo queries)
- `idx_screens_status` on `status`

---

### screen_ratings

**Description**: User ratings and reviews for screens

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Rating ID |
| screen_id | UUID | NOT NULL, FK → screens(id) ON DELETE CASCADE | Screen being rated |
| user_id | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | User who rated |
| booking_id | UUID | NULL, FK → bookings(id) ON DELETE SET NULL | Related booking |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating 1-5 |
| review_text | TEXT | NULL | Written review |
| review_images | JSONB | DEFAULT '[]' | Image URLs array |
| is_verified_booking | BOOLEAN | DEFAULT FALSE | Verified purchase |
| helpful_count | INTEGER | DEFAULT 0 | Helpful votes |
| not_helpful_count | INTEGER | DEFAULT 0 | Not helpful votes |
| owner_response | TEXT | NULL | Owner's response |
| owner_response_at | TIMESTAMPTZ | NULL | Response timestamp |
| status | TEXT | DEFAULT 'published' | published, pending, flagged, removed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `screen_ratings_select_all`: Public can view published ratings
- `screen_ratings_insert_verified`: Users can rate after booking
- `screen_ratings_update_own`: Users can edit their ratings
- `screen_ratings_respond_owner`: Owners can respond to ratings

**Indexes**:
- `idx_screen_ratings_screen` on `screen_id`
- `idx_screen_ratings_user` on `user_id`
- `UNIQUE(screen_id, user_id)`

**Triggers**:
- `update_screen_rating_stats`: Auto-updates screen average_rating

---

## Booking & Scheduling

### bookings

**Description**: Content booking reservations

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Booking ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Advertiser |
| screen_id | UUID | NOT NULL, FK → screens(id) | Screen reference |
| content_upload_id | UUID | NOT NULL, FK → content_uploads(id) | Content to display |
| start_time | TIMESTAMPTZ | NOT NULL | Booking start |
| end_time | TIMESTAMPTZ | NOT NULL | Booking end |
| duration_minutes | INTEGER | NOT NULL | Duration in minutes |
| status | TEXT | DEFAULT 'pending' | pending, confirmed, cancelled, completed |
| payment_status | TEXT | DEFAULT 'pending' | pending, completed, failed, refunded |
| stripe_session_id | TEXT | UNIQUE | Stripe checkout session |
| payment_intent_id | TEXT | NULL | Stripe payment intent |
| amount_cents | INTEGER | NULL | Total amount in cents |
| currency | TEXT | DEFAULT 'USD' | Currency code |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `bookings_select_own`: Users can view their bookings
- `bookings_select_for_owned_screens`: Owners can view bookings for their screens
- `bookings_insert_own`: Users can create bookings
- `bookings_update_own`: Users can update their bookings
- `bookings_update_for_owned_screens`: Owners can update screen bookings

**Indexes**:
- `idx_bookings_screen_start` on `screen_id, start_time`
- `idx_bookings_user` on `user_id`
- `idx_bookings_status` on `status`

**Constraints**:
- No overlapping bookings for same screen (enforced via trigger or application logic)

---

### schedules

**Description**: Recurring booking schedules

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Schedule ID |
| booking_id | UUID | NOT NULL, FK → bookings(id) | Parent booking |
| recurrence_rule | TEXT | NOT NULL | iCal RRULE format |
| start_date | DATE | NOT NULL | Schedule start |
| end_date | DATE | NULL | Schedule end |
| exceptions | JSONB | DEFAULT '[]' | Skip dates |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## Payments & Finance

### payments

**Description**: Payment transaction records

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Payment ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Payer |
| booking_id | UUID | NOT NULL, FK → bookings(id) | Related booking |
| stripe_session_id | TEXT | UNIQUE | Stripe session |
| stripe_payment_intent_id | TEXT | NULL | Payment intent |
| amount_cents | INTEGER | NOT NULL | Total amount |
| platform_fee_cents | INTEGER | DEFAULT 0 | Platform commission |
| owner_amount_cents | INTEGER | DEFAULT 0 | Owner earnings |
| currency | TEXT | DEFAULT 'USD' | Currency code |
| status | TEXT | DEFAULT 'pending' | pending, completed, failed, refunded |
| refund_amount_cents | INTEGER | DEFAULT 0 | Refunded amount |
| refund_reason | TEXT | NULL | Refund explanation |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `payments_select_own`: Users can view their payments
- `payments_select_owner`: Screen owners can view earnings
- `payments_insert_system`: System can create payments
- `payments_update_system`: System can update payment status

**Indexes**:
- `idx_payments_user` on `user_id`
- `idx_payments_booking` on `booking_id`
- `idx_payments_status` on `status`

---

### payouts

**Description**: Payouts to screen owners

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Payout ID |
| screen_owner_id | UUID | NOT NULL, FK → auth.users(id) | Recipient |
| amount_cents | INTEGER | NOT NULL | Payout amount |
| currency | TEXT | DEFAULT 'USD' | Currency code |
| status | TEXT | DEFAULT 'pending' | pending, processing, completed, failed |
| stripe_payout_id | TEXT | UNIQUE | Stripe payout reference |
| booking_ids | JSONB | NOT NULL | Array of booking IDs |
| initiated_at | TIMESTAMPTZ | DEFAULT NOW() | Initiation time |
| completed_at | TIMESTAMPTZ | NULL | Completion time |
| failure_reason | TEXT | NULL | Failure explanation |

**RLS Policies**:
- `payouts_select_own`: Owners can view their payouts
- `payouts_insert_admin`: Admin can create payouts
- `payouts_update_system`: System can update status

---

### subscription_tiers

**Description**: Subscription plan definitions

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Tier ID |
| name | TEXT | NOT NULL | Tier name (free, basic, premium, enterprise) |
| price_monthly | INTEGER | NOT NULL | Monthly price in cents |
| price_yearly | INTEGER | NOT NULL | Yearly price in cents |
| features | JSONB | NOT NULL | Feature list |
| max_screens | INTEGER | NULL | Screen limit (NULL = unlimited) |
| max_uploads_per_month | INTEGER | NULL | Upload limit |
| priority_support | BOOLEAN | DEFAULT FALSE | Priority support access |

---

## Content Management

### content_uploads

**Description**: Uploaded advertising content

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Content ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Uploader |
| file_name | TEXT | NOT NULL | Original filename |
| file_url | TEXT | NOT NULL | Storage URL |
| file_type | TEXT | NOT NULL | MIME type |
| file_size | INTEGER | NOT NULL | Size in bytes |
| content_type | TEXT | NOT NULL | image, video, gif |
| duration_seconds | INTEGER | NULL | Video duration |
| thumbnail_url | TEXT | NULL | Thumbnail image |
| moderation_status | TEXT | DEFAULT 'pending' | pending, approved, rejected, flagged |
| moderation_score | DECIMAL(3,2) | NULL | AI confidence score |
| moderation_flags | JSONB | DEFAULT '[]' | Flagged categories |
| status | TEXT | DEFAULT 'active' | active, archived, deleted |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `content_select_own`: Users can view their content
- `content_select_approved`: Public can view approved content
- `content_insert_own`: Users can upload content
- `content_update_own`: Users can update their content
- `content_moderate_admin`: Admins can moderate content

**Indexes**:
- `idx_content_user` on `user_id`
- `idx_content_status` on `moderation_status, status`

**Storage Buckets**:
- `content-uploads`: User-uploaded content (private)
- `content-public`: Approved public content
- `thumbnails`: Generated thumbnails

---

## Device & Provisioning

### device_tokens

**Description**: Paired display devices

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Device ID |
| screen_id | UUID | NULL, FK → screens(id) | Bound screen |
| pairing_code | TEXT | UNIQUE | 6-digit pairing code |
| pairing_code_expires_at | TIMESTAMPTZ | NULL | Code expiry |
| device_info | JSONB | NOT NULL | Platform, model, OS version |
| auth_token | TEXT | UNIQUE | Device JWT token |
| status | TEXT | DEFAULT 'paired' | paired, active, inactive, revoked |
| last_seen | TIMESTAMPTZ | NULL | Last heartbeat |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Pairing timestamp |

**RLS Policies**:
- `device_tokens_select_owner`: Screen owners can view their devices
- `device_tokens_insert_system`: System can create devices
- `device_tokens_update_system`: System can update device status

**Indexes**:
- `idx_device_tokens_screen` on `screen_id`
- `idx_device_tokens_pairing_code` on `pairing_code`

---

### device_status

**Description**: Real-time device health status

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Status ID |
| screen_id | UUID | NOT NULL, FK → screens(id) | Screen reference |
| device_id | UUID | NULL, FK → device_tokens(id) | Device reference |
| status | TEXT | DEFAULT 'idle' | idle, broadcasting, offline, error |
| current_booking_id | UUID | NULL, FK → bookings(id) | Active booking |
| last_seen | TIMESTAMPTZ | DEFAULT NOW() | Last heartbeat |
| metrics | JSONB | DEFAULT '{}' | CPU, memory, temperature |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `device_status_select_owner`: Owners can view device status
- `device_status_update_device`: Devices can update their status

**Indexes**:
- `idx_device_status_screen` on `screen_id`
- `idx_device_status_updated` on `updated_at`

---

### device_metrics

**Description**: Historical device performance metrics

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Metric ID |
| device_id | UUID | NOT NULL, FK → device_tokens(id) | Device reference |
| timestamp | TIMESTAMPTZ | NOT NULL | Measurement time |
| cpu_usage | DECIMAL(5,2) | NULL | CPU percentage |
| memory_usage | DECIMAL(5,2) | NULL | Memory percentage |
| disk_usage | DECIMAL(5,2) | NULL | Disk percentage |
| temperature | DECIMAL(5,2) | NULL | Temperature (Celsius) |
| network_latency | INTEGER | NULL | Latency in ms |
| frame_drops | INTEGER | DEFAULT 0 | Dropped frames count |
| uptime | INTEGER | NULL | Uptime in seconds |

**Indexes**:
- `idx_device_metrics_device_time` on `device_id, timestamp`

**Retention**: 90 days (automated cleanup)

---

## Notifications & Communication

### notifications

**Description**: User notifications

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Recipient |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification body |
| type | TEXT | DEFAULT 'general' | booking, payout, system, general |
| read | BOOLEAN | DEFAULT FALSE | Read status |
| action_url | TEXT | NULL | Deep link URL |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**RLS Policies**:
- `notifications_select_own`: Users can view their notifications
- `notifications_update_own`: Users can mark as read
- `notifications_insert_system`: System can create notifications

**Indexes**:
- `idx_notifications_user` on `user_id, read`

**Real-time**: Enabled via Supabase Realtime

---

## System & Configuration

### app_config

**Description**: System-wide configuration

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | TEXT | PRIMARY KEY | Config key |
| value | JSONB | NOT NULL | Config value |
| description | TEXT | NULL | Config description |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Examples**:
```sql
INSERT INTO app_config (key, value, description) VALUES
  ('platform_fee_percentage', '15', 'Platform commission percentage'),
  ('max_upload_size_mb', '50', 'Maximum upload size in MB'),
  ('maintenance_mode', 'false', 'Maintenance mode flag');
```

---

### countries

**Description**: Supported countries

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| code | TEXT | PRIMARY KEY | ISO 3166-1 alpha-2 |
| name | TEXT | NOT NULL | Country name |
| currency | TEXT | NOT NULL | Currency code |
| enabled | BOOLEAN | DEFAULT TRUE | Service availability |

---

### languages

**Description**: Supported languages

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| code | TEXT | PRIMARY KEY | ISO 639-1 code |
| name | TEXT | NOT NULL | Language name |
| native_name | TEXT | NOT NULL | Native language name |
| enabled | BOOLEAN | DEFAULT TRUE | Availability |

---

### currencies

**Description**: Supported currencies

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| code | TEXT | PRIMARY KEY | ISO 4217 code |
| name | TEXT | NOT NULL | Currency name |
| symbol | TEXT | NOT NULL | Currency symbol |
| decimal_places | INTEGER | DEFAULT 2 | Decimal precision |

---

## Security & Audit

### rate_limits

**Description**: API rate limiting tracking

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Record ID |
| identifier | TEXT | NOT NULL | User ID or IP |
| endpoint | TEXT | NOT NULL | API endpoint |
| ip_address | TEXT | NULL | Request IP |
| user_agent | TEXT | NULL | Request user agent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Request timestamp |

**RLS Policies**:
- `rate_limits_insert_public`: Public can create (for tracking)
- `rate_limits_select_admin`: Admin can view rate limit data

**Indexes**:
- `idx_rate_limits_identifier_endpoint_time` on `identifier, endpoint, created_at`

**Cleanup**: Records older than 24 hours are deleted automatically

---

### blocked_identifiers

**Description**: Blocked users/IPs

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Block ID |
| identifier | TEXT | UNIQUE, NOT NULL | User ID or IP |
| reason | TEXT | NOT NULL | Block reason |
| blocked_by | UUID | FK → auth.users(id) | Admin who blocked |
| blocked_at | TIMESTAMPTZ | DEFAULT NOW() | Block timestamp |
| expires_at | TIMESTAMPTZ | NULL | Expiry (NULL = permanent) |
| notes | TEXT | NULL | Additional notes |

---

### audit_logs

**Description**: Security and action audit trail

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Log ID |
| user_id | UUID | NULL, FK → auth.users(id) | User who performed action |
| action | TEXT | NOT NULL | Action type |
| resource_type | TEXT | NOT NULL | Table/resource affected |
| resource_id | UUID | NULL | Resource ID |
| ip_address | TEXT | NULL | Request IP |
| user_agent | TEXT | NULL | Request user agent |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp |

**RLS Policies**:
- `audit_logs_insert_system`: System can create logs
- `audit_logs_select_admin`: Admin can view logs

**Indexes**:
- `idx_audit_logs_user_time` on `user_id, timestamp`
- `idx_audit_logs_resource` on `resource_type, resource_id`

**Retention**: 2 years

---

### security_events

**Description**: Security incidents and alerts

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Event ID |
| event_type | TEXT | NOT NULL | Type of security event |
| severity | TEXT | NOT NULL | low, medium, high, critical |
| user_id | UUID | NULL, FK → auth.users(id) | Related user |
| ip_address | TEXT | NULL | Source IP |
| description | TEXT | NOT NULL | Event description |
| resolved | BOOLEAN | DEFAULT FALSE | Resolution status |
| resolved_by | UUID | NULL, FK → auth.users(id) | Admin who resolved |
| resolved_at | TIMESTAMPTZ | NULL | Resolution timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |

---

## Analytics & Monitoring

### app_builds

**Description**: CI/CD build tracking

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Build ID |
| platform | TEXT | NOT NULL | ios, android, samsung_tizen, etc. |
| version | TEXT | NOT NULL | Semantic version |
| build_number | INTEGER | NOT NULL | Incremental build number |
| status | TEXT | DEFAULT 'queued' | queued, building, testing, success, failed |
| progress | INTEGER | DEFAULT 0 | Progress percentage |
| logs | TEXT | NULL | Build logs |
| artifact_url | TEXT | NULL | Download URL |
| triggered_by | UUID | FK → auth.users(id) | User who triggered |
| started_at | TIMESTAMPTZ | NULL | Build start time |
| completed_at | TIMESTAMPTZ | NULL | Build completion time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### app_releases

**Description**: Published app releases

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Release ID |
| platform | TEXT | NOT NULL | Platform identifier |
| version | TEXT | NOT NULL | Semantic version |
| build_id | UUID | FK → app_builds(id) | Related build |
| release_notes | TEXT | NULL | Markdown release notes |
| min_os_version | TEXT | NULL | Minimum OS version |
| download_url | TEXT | NULL | Download link |
| status | TEXT | DEFAULT 'draft' | draft, published, deprecated |
| published_at | TIMESTAMPTZ | NULL | Publish timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `UNIQUE(platform, version)`

---

## Database Functions

### update_updated_at_column()

**Description**: Trigger function to auto-update updated_at timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Used on**: profiles, screens, bookings, payments, content_uploads, notifications, device_status

---

### update_screen_rating_stats()

**Description**: Automatically updates screen average_rating when ratings change

```sql
CREATE OR REPLACE FUNCTION update_screen_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE screens
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM screen_ratings
      WHERE screen_id = COALESCE(NEW.screen_id, OLD.screen_id)
        AND status = 'published'
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM screen_ratings
      WHERE screen_id = COALESCE(NEW.screen_id, OLD.screen_id)
        AND status = 'published'
    )
  WHERE id = COALESCE(NEW.screen_id, OLD.screen_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Migrations

All migrations are located in `/supabase/migrations/`.

**Total Migrations**: 152 files
**Migration Format**: `[timestamp]_[description].sql`

**Key Migrations**:
- `20251113000000_screen_ratings_system.sql` - Rating system
- `20251113000001_rate_limiting_system.sql` - Rate limiting
- `20250810191057_*_core_schema.sql` - Core database tables

---

## Backup & Recovery

**Automated Backups**:
- Daily full backups via Supabase
- Point-in-time recovery available
- 7-day retention (configurable)

**Manual Backup**:
```bash
# Dump entire database
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql

# Restore
psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Performance Optimization

**Indexes**: 40+ indexes for query optimization

**Partitioning**: Consider for large tables:
- `audit_logs` - partition by month
- `device_metrics` - partition by week
- `notifications` - partition by month

**Query Optimization**:
- Use `EXPLAIN ANALYZE` for slow queries
- Monitor slow query log
- Regular `VACUUM ANALYZE`

---

## Data Retention

| Table | Retention | Cleanup Method |
|-------|-----------|----------------|
| audit_logs | 2 years | Automated job |
| rate_limits | 24 hours | Automated job |
| device_metrics | 90 days | Automated job |
| notifications | 1 year | Manual/user deletion |
| security_events | Permanent | Manual archive |

---

## Monitoring Queries

### Active Bookings
```sql
SELECT screen_id, COUNT(*) as active_bookings
FROM bookings
WHERE status = 'confirmed'
  AND start_time <= NOW()
  AND end_time >= NOW()
GROUP BY screen_id;
```

### Revenue Summary
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(amount_cents) / 100.0 as total_revenue,
  COUNT(*) as transaction_count
FROM payments
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

### Screen Utilization
```sql
SELECT
  s.screen_name,
  COUNT(b.id) as total_bookings,
  SUM(b.duration_minutes) as total_minutes,
  AVG(b.amount_cents) / 100.0 as avg_booking_value
FROM screens s
LEFT JOIN bookings b ON s.id = b.screen_id
WHERE b.created_at >= NOW() - INTERVAL '30 days'
GROUP BY s.id, s.screen_name
ORDER BY total_bookings DESC;
```

---

## Support

**Database Documentation**: `/docs/DATABASE_SCHEMA.md`
**Migration Guide**: `/docs/MIGRATION_GUIDE.md` (if exists)
**Schema Visualization**: Generate with [SchemaSpy](http://schemaspy.org/) or [pgModeler](https://pgmodeler.io/)

**Last Updated**: November 13, 2025
**Schema Version**: 1.0.0
