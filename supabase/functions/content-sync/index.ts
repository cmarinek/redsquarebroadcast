// Content Sync Edge Function
// Returns schedule and minimal screen/device info for a given device or screen
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const { device_id, provisioning_token, screen_id } = body as {
      device_id?: string;
      provisioning_token?: string;
      screen_id?: string;
    };

    let resolvedScreenId: string | null = null;

    if (screen_id) {
      resolvedScreenId = String(screen_id);
    } else if (device_id && provisioning_token) {
      // Validate device using provisioning token
      const { data: device, error: deviceError } = await supabaseAdmin
        .from("devices")
        .select("device_id, screen_id, provisioning_token, status")
        .eq("device_id", device_id)
        .maybeSingle();

      if (deviceError) {
        console.error("content-sync: device fetch error", deviceError);
        return new Response(JSON.stringify({ error: "Device lookup failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!device || device.provisioning_token !== provisioning_token) {
        return new Response(JSON.stringify({ error: "Invalid device or token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      resolvedScreenId = device.screen_id ?? null;
    } else {
      return new Response(
        JSON.stringify({ error: "Provide screen_id or (device_id + provisioning_token)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch minimal screen info
    let screen: any = null;
    if (resolvedScreenId) {
      const { data: s, error: sErr } = await supabaseAdmin
        .from("screens")
        .select("id, screen_name, status")
        .eq("id", resolvedScreenId)
        .maybeSingle();
      if (sErr) {
        console.error("content-sync: screen fetch error", sErr);
      }
      screen = s ?? null;
    }

    // Fetch upcoming schedule (next 20 items)
    const nowIso = new Date().toISOString();
    const { data: schedule, error: schedErr } = await supabaseAdmin
      .from("content_schedule")
      .select("id, screen_id, content_url, scheduled_time, duration_seconds, status")
      .eq("screen_id", resolvedScreenId)
      .gte("scheduled_time", nowIso)
      .order("scheduled_time", { ascending: true })
      .limit(20);

    if (schedErr) {
      console.error("content-sync: schedule fetch error", schedErr);
      return new Response(JSON.stringify({ error: "Schedule fetch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        screen,
        schedule: schedule ?? [],
        generated_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("content-sync: unexpected error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});