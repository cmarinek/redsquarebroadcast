-- Phase 4: Scalability & Performance DB optimizations
-- Enable trigram extension for fast ILIKE searches
create extension if not exists pg_trgm with schema extensions;

-- Screens: common filters and search
create index if not exists idx_screens_status on public.screens (status);
create index if not exists idx_screens_owner on public.screens (owner_user_id);
create index if not exists idx_screens_name_trgm on public.screens using gin (screen_name gin_trgm_ops);
create index if not exists idx_screens_location_trgm on public.screens using gin (location gin_trgm_ops);

-- Content uploads
create index if not exists idx_content_uploads_user on public.content_uploads (user_id);
create index if not exists idx_content_uploads_screen on public.content_uploads (screen_id);
create index if not exists idx_content_uploads_type on public.content_uploads (file_type);
create index if not exists idx_content_uploads_created on public.content_uploads (created_at);

-- Bookings
create index if not exists idx_bookings_user on public.bookings (user_id);
create index if not exists idx_bookings_screen on public.bookings (screen_id);
create index if not exists idx_bookings_payment_status on public.bookings (payment_status);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_start_time on public.bookings (start_time);
create index if not exists idx_bookings_screen_start on public.bookings (screen_id, start_time);

-- Payments
create index if not exists idx_payments_user on public.payments (user_id);
create index if not exists idx_payments_booking on public.payments (booking_id);
create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_payments_created on public.payments (created_at);

-- Notifications
create index if not exists idx_notifications_user_read on public.notifications (user_id, read);
create index if not exists idx_notifications_created on public.notifications (created_at);

-- Frontend metrics (analytics)
create index if not exists idx_frontend_metrics_created on public.frontend_metrics (created_at);
create index if not exists idx_frontend_metrics_metric_created on public.frontend_metrics (metric_name, created_at);

-- Admin health and alerts
create index if not exists idx_admin_health_created on public.admin_system_health (created_at);
create index if not exists idx_admin_health_service on public.admin_system_health (service_name);
create index if not exists idx_admin_alerts_type on public.admin_security_alerts (alert_type);
create index if not exists idx_admin_alerts_created on public.admin_security_alerts (created_at);

-- Devices and telemetry
create index if not exists idx_devices_owner on public.devices (owner_user_id);
create index if not exists idx_devices_device_id on public.devices (device_id);
create index if not exists idx_device_status_screen on public.device_status (screen_id);
create index if not exists idx_device_status_updated on public.device_status (updated_at);
create index if not exists idx_device_metrics_device on public.device_metrics (device_id);
create index if not exists idx_device_metrics_screen on public.device_metrics (screen_id);
create index if not exists idx_device_metrics_created on public.device_metrics (created_at);

-- Misc frequently filtered tables
create index if not exists idx_event_logs_user on public.event_logs (user_id);
create index if not exists idx_event_logs_created on public.event_logs (created_at);
create index if not exists idx_media_jobs_user on public.media_jobs (user_id);
create index if not exists idx_media_jobs_status on public.media_jobs (status);
create index if not exists idx_media_jobs_created on public.media_jobs (created_at);
create index if not exists idx_content_schedule_screen on public.content_schedule (screen_id);
create index if not exists idx_content_schedule_time on public.content_schedule (scheduled_time);
