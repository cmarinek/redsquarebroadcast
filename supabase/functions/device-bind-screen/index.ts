// Supabase Edge Function: device-bind-screen
// Authenticated owners bind a device to a screen_id (and optional screen_name)

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase environment configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Client with the user's JWT for identity
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;
    const body = await req.json();
    const device_id: string | undefined = body.device_id;
    const screen_id: string | undefined = body.screen_id;
    const screen_name: string | undefined = body.screen_name;

    if (!device_id || !screen_id) {
      return new Response(JSON.stringify({ error: "device_id and screen_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Service role client for privileged updates under RLS
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify the device belongs to the user
    const { data: device, error: devErr } = await supabase
      .from("devices")
      .select("device_id, owner_user_id")
      .eq("device_id", device_id)
      .maybeSingle();

    if (devErr) throw devErr;
    if (!device) {
      return new Response(JSON.stringify({ error: "Device not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (device.owner_user_id !== userId) {
      return new Response(JSON.stringify({ error: "You do not own this device" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Ensure a screen record exists for the provided screen_id
    const { data: existingScreen } = await supabase
      .from("screens")
      .select("id")
      .eq("id", screen_id)
      .maybeSingle();

    if (!existingScreen) {
      const { error: insErr } = await supabase.from("screens").insert({
        id: screen_id,
        owner_user_id: userId,
        screen_name: screen_name ?? screen_id,
        status: "active",
      });
      if (insErr) {
        console.error("Failed creating screen", insErr);
        return new Response(JSON.stringify({ error: "Failed to create screen" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else if (screen_name) {
      // Update name if provided
      await supabase
        .from("screens")
        .update({ screen_name })
        .eq("id", screen_id);
    }

    // Bind the device to the screen
    const { error: updErr } = await supabase
      .from("devices")
      .update({ screen_id })
      .eq("device_id", device_id);

    if (updErr) {
      console.error("Failed binding device to screen", updErr);
      return new Response(JSON.stringify({ error: "Failed to bind device to screen" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, device_id, screen_id, screen_name: screen_name ?? null }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("device-bind-screen error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
