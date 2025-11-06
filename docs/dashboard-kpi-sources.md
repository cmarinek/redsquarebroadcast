# Dashboard KPI Data Inventory

This document enumerates the dashboard components and Supabase functions that previously relied on placeholder or randomized values. It describes the concrete RedSquare Broadcast data sources that now back those metrics.

## React components

### `src/components/Dashboard.tsx`

| UI element | Previous behaviour | Backing data source |
| --- | --- | --- |
| Advertiser stat cards (`totalCampaigns`, `totalViews`, `activeScreens`, `totalSpent`) | Hard-coded values (`12`, `1.2M`, `89`, `$4,230`). | Aggregated bookings & payment data returned by the `get_public_dashboard_metrics` RPC (derived from `public.bookings`, `public.payments`, and `public.mv_screen_activity`). |
| Advertiser active campaigns list | Generated from `[1,2,3]` placeholder array. | Campaign list hydrated from `public.bookings` joined to `public.content_uploads` for the currently selected timeframe. |
| Upload progress sample (`75%`) | Static percentage. | Reflects the real-time processing percentage reported in `public.content_uploads.processing_progress`. |
| Screen-owner stat cards (`myScreens`, `monthlyRevenue`, `totalViews`, `occupancyRate`) | Hard-coded values (`5`, `$2,340`, `450K`, `87%`). | Metrics resolved by `get_screen_owner_dashboard_metrics` RPC (see Supabase functions section). |

### `src/components/shared/AnalyticsDashboard.tsx`

| UI element | Previous behaviour | Backing data source |
| --- | --- | --- |
| Metric cards for advertiser/broadcaster roles | Displayed "N/A" unless placeholder summary existed; CTR/conversions were derived from static JSON. | Supplied by `get_advertiser_dashboard_metrics`/`get_screen_owner_dashboard_metrics` RPCs (aggregated from `public.broadcast_analytics`, `public.ab_test_results`, and `public.kpi_daily_rollups`). |
| Time-series charts | Not rendered. | Populated from daily rollups exposed via the Supabase RPC responses. |
| Error handling | Generic "Could not load analytics data." toast. | Dedicated empty-state messaging now indicates when upstream data is missing or stale, using data-quality alerts from `public.data_quality_alerts`. |

### `src/components/analytics/SystemAnalyticsDashboard.tsx`

| UI element | Previous behaviour | Backing data source |
| --- | --- | --- |
| KPI cards | Static array with fabricated totals (e.g., `1,247` active screens). | Live platform metrics from `get_platform_analytics` RPC, based on `public.profiles`, `public.screens`, `public.bookings`, `public.payments`, and `public.mv_screen_activity`. |
| Alert feed | Hard-coded list of three alerts. | Hydrated from the `admin_security_alerts` table, filtered to the last 24 hours. |
| System health progress bars | Static percentages. | Derived from `admin_system_health` response times averaged over the last day. |

## Supabase Edge functions

### `supabase/functions/get-analytics-data`

| Role branch | Previous behaviour | Backing data source |
| --- | --- | --- |
| `admin` | Called `get_platform_analytics` which mixed real counts with `random()`-driven fallbacks. | Calls the new parameterised `get_platform_analytics` RPC that returns strictly deterministic aggregates from transactional tables. |
| `advertiser` | Called `get_advertiser_analytics_summary` (non-existent) and returned placeholders. | Invokes `get_advertiser_dashboard_metrics`, sourcing data from `bookings`, `payments`, `broadcast_analytics`, and `ab_test_results`. |
| `broadcaster` | Fabricated views as `(totalCampaigns ?? 0) * 2500`. | Invokes `get_screen_owner_dashboard_metrics`, which computes utilisation, revenue, and viewership from first-party tables. |
| `public` (new) | n/a | Exposes anonymised platform KPIs backed by the same admin aggregates, filtered for values safe to display publicly. |

## Supabase SQL & storage

| Function / table | Purpose |
| --- | --- |
| `public.get_platform_analytics(p_start_date date, p_end_date date)` | Returns platform-level KPI summary and daily revenue/bookings series using `profiles`, `screens`, `bookings`, `payments`, and the `mv_screen_activity` materialised view. |
| `public.get_advertiser_dashboard_metrics(p_user_id uuid, p_start_date date, p_end_date date)` | Aggregates advertiser campaign, spend, reach, and conversion metrics using `bookings`, `payments`, `broadcast_analytics`, and `ab_test_results`. |
| `public.get_screen_owner_dashboard_metrics(p_user_id uuid, p_start_date date, p_end_date date)` | Computes occupancy, revenue, and viewership for screen owners based on `screens`, `bookings`, `payments`, `mv_screen_activity`, and `broadcast_analytics`. |
| `public.get_public_dashboard_metrics(p_start_date date, p_end_date date)` | Provides a redacted subset of platform KPIs for unauthenticated marketing dashboards. |
| `public.kpi_daily_rollups` | Stores daily KPI snapshots (platform, advertiser, screen-owner scopes) generated from bookings, payments, and analytics tables; backfilled for historical analysis. |
| `public.backfill_kpi_rollups(days_back integer)` | Populates `kpi_daily_rollups` from historical bookings/payments/analytics for the requested look-back window. |
| `public.data_quality_alerts` | Persists the outcome of automated data-quality checks. |
| `public.run_data_quality_checks()` | Validates schema divergence, missing relationships, and freshness thresholds for KPI dependencies; raises alerts when thresholds are exceeded. |

Refer to the corresponding migration for exact SQL definitions and validation queries.
