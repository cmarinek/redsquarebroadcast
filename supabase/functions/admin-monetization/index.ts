import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ListAction = { action: 'list' };
type UpdateAction = { action: 'update', screenId: string, data: {
  price_per_10s_cents?: number | null;
  platform_fee_percent?: number | null;
  currency?: string | null;
  unit_rounding_threshold_seconds?: number | null;
}};

type RequestBody = ListAction | UpdateAction;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use anon client to resolve user from JWT
    const supabaseAnon = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_ANON_KEY")
    );

    // Service client for privileged operations
    const supabaseService = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');

    const { data: authData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authData.user) throw new Error('Invalid or expired session');
    const user = authData.user;

    // Ensure caller is admin
    const { data: isAdmin } = await supabaseService.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const body = (await req.json()) as Partial<RequestBody> | null;
    const action = body?.action || 'list';

    if (action === 'list') {
      const { data: screens, error } = await supabaseService
        .from('screens')
        .select('id, screen_name, currency, price_per_10s_cents, platform_fee_percent, unit_rounding_threshold_seconds, owner_user_id, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ screens }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'update') {
      const { screenId, data } = body as UpdateAction;
      if (!screenId) throw new Error('screenId is required');

      // Only allow whitelisted fields
      const payload: Record<string, unknown> = {};
      if (data.hasOwnProperty('price_per_10s_cents')) payload.price_per_10s_cents = data.price_per_10s_cents;
      if (data.hasOwnProperty('platform_fee_percent')) payload.platform_fee_percent = data.platform_fee_percent;
      if (data.hasOwnProperty('currency')) payload.currency = data.currency;
      if (data.hasOwnProperty('unit_rounding_threshold_seconds')) payload.unit_rounding_threshold_seconds = data.unit_rounding_threshold_seconds ?? 5;

      const { error } = await supabaseService
        .from('screens')
        .update(payload)
        .eq('id', screenId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'invalid_action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (err) {
    console.error('[admin-monetization] error', err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
