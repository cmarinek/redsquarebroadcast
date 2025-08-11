-- Restrict API access to materialized view per linter warning
revoke all on table public.mv_screen_activity from anon;
revoke all on table public.mv_screen_activity from authenticated;