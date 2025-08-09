import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { device_id, provisioning_token, status } = await req.json();

    if (!device_id || typeof device_id !== "string") {
      return new Response(JSON.stringify({ error: "device_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    if (!provisioning_token || typeof provisioning_token !== "string") {
      return new Response(JSON.stringify({ error: "provisioning_token is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Service-role client to bypass RLS (public endpoint validates token)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch device by device_id
    const { data: existing, error: fetchErr } = await supabaseService
      .from("devices")
      .select("device_id, provisioning_token")
      .eq("device_id", device_id)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      // PGRST116 = No rows found
      console.error("Fetch device error:", fetchErr);
    }

    // If device exists, ensure token matches
    if (existing) {
      if (existing.provisioning_token !== provisioning_token) {
        return new Response(JSON.stringify({ error: "invalid provisioning token" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      const { error: updateErr } = await supabaseService
        .from("devices")
        .update({ last_seen: new Date().toISOString(), status: status ?? "online" })
        .eq("device_id", device_id);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({ ok: true, action: "updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Otherwise, create new device as unpaired
    const { error: insertErr } = await supabaseService
      .from("devices")
      .insert({
        device_id,
        provisioning_token,
        status: status ?? "unpaired",
        last_seen: new Date().toISOString(),
      });

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ ok: true, action: "created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("device-heartbeat error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
