// Supabase Edge Function: content-sync
// Returns the upcoming schedule and minimal screen/device info for a device or screen
// CORS enabled, no JWT required (devices call this directly)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { device_id, provisioning_token, screen_id } = await req.json();

    if (!device_id && !screen_id) {
      return new Response(JSON.stringify({ error: "device_id or screen_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment configuration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    let resolvedScreenId: string | null = null;
    let deviceInfo: any = null;

    if (device_id) {
      const { data: device, error: devErr } = await supabase
        .from("devices")
        .select("device_id, screen_id, status, screen_name, owner_user_id, provisioning_token")
        .eq("device_id", device_id)
        .maybeSingle();

      if (devErr) throw devErr;
      if (!device) {
        return new Response(JSON.stringify({ error: "Device not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // If provisioning_token provided, validate it
      if (provisioning_token && device.provisioning_token !== provisioning_token) {
        return new Response(JSON.stringify({ error: "Invalid provisioning token" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      resolvedScreenId = device.screen_id ?? null;
      deviceInfo = {
        device_id: device.device_id,
        status: device.status,
        screen_id: device.screen_id,
        screen_name: device.screen_name ?? null,
      };
    }

    // If screen_id was provided directly use it
    if (!resolvedScreenId && screen_id) {
      resolvedScreenId = screen_id;
    }

    let screen: any = null;
    if (resolvedScreenId) {
      const { data: screenRow, error: screenErr } = await supabase
        .from("screens")
        .select("id, screen_name, status")
        .eq("id", resolvedScreenId)
        .maybeSingle();
      if (screenErr) throw screenErr;
      screen = screenRow;
    }

    // Fetch upcoming schedule (next 20 items)
    let schedule: any[] = [];
    if (resolvedScreenId) {
      const { data: schedRows, error: schedErr } = await supabase
        .from("content_schedule")
        .select("content_url, scheduled_time, duration_seconds, status")
        .eq("screen_id", resolvedScreenId)
        .gte("scheduled_time", new Date().toISOString())
        .order("scheduled_time", { ascending: true })
        .limit(20);
      if (schedErr) throw schedErr;
      schedule = schedRows ?? [];
    }

    return new Response(
      JSON.stringify({
        device: deviceInfo,
        screen,
        schedule,
        server_time: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("content-sync error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
