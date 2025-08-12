import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter per user per minute
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (e.count >= RATE_LIMIT) return { allowed: false };
  e.count += 1;
  return { allowed: true };
}

interface EarningsRequest {
  period_start?: string; // yyyy-mm-dd
  period_end?: string;   // yyyy-mm-dd
}

interface ScreenBreakdown {
  screen_id: string;
  screen_name: string | null;
  gross_cents: number;
  owner_cents: number;
  platform_fee_cents: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth with service role for privileged reads while still identifying the caller
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    // Rate limit per owner
    const rl = rateLimit(`${user.id}|owner-earnings`);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { period_start, period_end } = (await req.json().catch(() => ({}))) as EarningsRequest;

    // Default to current month
    const now = new Date();
    const start = period_start ? new Date(period_start) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = period_end ? new Date(period_end) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startISO = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
    const endISO = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)).toISOString();

    // Fetch owner's screens
    const { data: screens, error: screensErr } = await supabase
      .from('screens')
      .select('id, screen_name')
      .eq('owner_user_id', user.id);
    if (screensErr) throw screensErr;

    const screenIds = (screens ?? []).map(s => s.id);
    if (screenIds.length === 0) {
      return new Response(JSON.stringify({
        period_start: startISO,
        period_end: endISO,
        totals: { gross_cents: 0, owner_cents: 0, platform_fee_cents: 0 },
        breakdown_by_screen: [],
        payout: { completed_cents: 0, pending_cents: 0 },
        payout_requests: []
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Get bookings for those screens within period
    const { data: bookings, error: bookingsErr } = await supabase
      .from('bookings')
      .select('id, screen_id, start_time')
      .in('screen_id', screenIds)
      .gte('start_time', startISO)
      .lte('start_time', endISO);
    if (bookingsErr) throw bookingsErr;

    const bookingIds = (bookings ?? []).map(b => b.id);
    if (bookingIds.length === 0) {
      // Still return payout info
      const { data: payoutRows } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('screen_owner_id', user.id)
        .order('requested_at', { ascending: false });

      const completed = (payoutRows ?? []).filter(r => r.status === 'completed').reduce((s, r) => s + (r.amount || 0), 0);
      const pending = (payoutRows ?? []).filter(r => r.status === 'pending' || r.status === 'processing').reduce((s, r) => s + (r.amount || 0), 0);

      return new Response(JSON.stringify({
        period_start: startISO,
        period_end: endISO,
        totals: { gross_cents: 0, owner_cents: 0, platform_fee_cents: 0 },
        breakdown_by_screen: [],
        payout: { completed_cents: completed, pending_cents: pending },
        payout_requests: payoutRows ?? []
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Fetch payments for those bookings
    const { data: payments, error: paymentsErr } = await supabase
      .from('payments')
      .select('booking_id, amount_cents, owner_amount_cents, platform_fee_cents, status')
      .in('booking_id', bookingIds);
    if (paymentsErr) throw paymentsErr;

    // Consider successful statuses
    const ok = new Set(['completed', 'succeeded', 'paid']);

    // Aggregate totals
    let grossTotal = 0; let ownerTotal = 0; let feeTotal = 0;

    // Map booking_id -> booking
    const bookingById = new Map<string, { id: string; screen_id: string }>();
    for (const b of bookings ?? []) bookingById.set(b.id, { id: b.id, screen_id: b.screen_id });

    // Initialize breakdown per screen
    const screenNameById = new Map<string, string | null>();
    for (const s of screens ?? []) screenNameById.set(s.id, s.screen_name ?? null);
    const breakdownMap = new Map<string, ScreenBreakdown>();

    for (const p of payments ?? []) {
      if (!ok.has((p.status || '').toLowerCase())) continue;
      const b = bookingById.get(p.booking_id);
      if (!b) continue;
      const sid = b.screen_id;
      const gross = p.amount_cents || 0;
      const owner = p.owner_amount_cents || 0;
      const fee = p.platform_fee_cents || Math.max(0, gross - owner);

      grossTotal += gross; ownerTotal += owner; feeTotal += fee;

      const existing = breakdownMap.get(sid) ?? {
        screen_id: sid,
        screen_name: screenNameById.get(sid) || null,
        gross_cents: 0,
        owner_cents: 0,
        platform_fee_cents: 0,
      };
      existing.gross_cents += gross;
      existing.owner_cents += owner;
      existing.platform_fee_cents += fee;
      breakdownMap.set(sid, existing);
    }

    const breakdown = Array.from(breakdownMap.values());

    // Payouts summary and history
    const { data: payoutRows } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('screen_owner_id', user.id)
      .order('requested_at', { ascending: false });

    const completed = (payoutRows ?? []).filter(r => r.status === 'completed').reduce((s, r) => s + (r.amount || 0), 0);
    const pending = (payoutRows ?? []).filter(r => r.status === 'pending' || r.status === 'processing').reduce((s, r) => s + (r.amount || 0), 0);

    return new Response(JSON.stringify({
      period_start: startISO,
      period_end: endISO,
      totals: { gross_cents: grossTotal, owner_cents: ownerTotal, platform_fee_cents: feeTotal },
      breakdown_by_screen: breakdown,
      payout: { completed_cents: completed, pending_cents: pending },
      payout_requests: payoutRows ?? []
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", 'Cache-Control': 'no-store' }, status: 200 });

  } catch (error) {
    console.error('[owner-earnings] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
