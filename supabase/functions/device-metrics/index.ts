import { getEnv } from "../_shared/env.ts";
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const {
      device_id,
      screen_id,
      bitrate_kbps,
      bandwidth_kbps,
      buffer_seconds,
      dropped_frames,
      rebuffer_count,
      playback_state,
      error_code,
    } = body || {};

    if (!device_id) {
      return new Response(JSON.stringify({ error: 'device_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Basic validation: ensure device exists
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('device_id')
      .eq('device_id', device_id)
      .maybeSingle();

    if (devErr) {
      console.error('device lookup error', devErr);
    }
    // If device doesn't exist, we still accept metrics for web TV preview clients
    // Insert metrics
    const { error: insErr } = await supabase
      .from('device_metrics')
      .insert({
        device_id,
        screen_id,
        bitrate_kbps,
        bandwidth_kbps,
        buffer_seconds,
        dropped_frames,
        rebuffer_count,
        playback_state,
        error_code,
      });

    if (insErr) {
      console.error('metrics insert error', insErr);
      return new Response(JSON.stringify({ error: 'insert_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('device-metrics error', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
