// Device Bind Screen Edge Function
// Binds a paired device to a screen (creates the screen if needed)
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
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { device_id, screen_id, screen_name } = body as {
      device_id?: string;
      screen_id?: string;
      screen_name?: string;
    };

    if (!device_id || !screen_id) {
      return new Response(JSON.stringify({ error: "device_id and screen_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure the device belongs to the user
    const { data: device, error: devErr } = await supabaseAdmin
      .from("devices")
      .select("device_id, owner_user_id, screen_id")
      .eq("device_id", device_id)
      .maybeSingle();

    if (devErr) {
      console.error("device-bind-screen: device fetch error", devErr);
      return new Response(JSON.stringify({ error: "Device lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!device || device.owner_user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: device not owned by user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure screen exists (create if missing)
    const { data: existingScreen } = await supabaseAdmin
      .from("screens")
      .select("id")
      .eq("id", screen_id)
      .maybeSingle();

    if (!existingScreen) {
      const { error: screenInsErr } = await supabaseAdmin.from("screens").insert({
        id: screen_id,
        owner_user_id: userData.user.id,
        screen_name: screen_name ?? screen_id,
        status: "active",
      });
      if (screenInsErr) {
        console.error("device-bind-screen: screen insert error", screenInsErr);
        return new Response(JSON.stringify({ error: "Failed creating screen" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Bind device to screen
    const { error: updErr } = await supabaseAdmin
      .from("devices")
      .update({ screen_id })
      .eq("device_id", device_id);

    if (updErr) {
      console.error("device-bind-screen: device update error", updErr);
      return new Response(JSON.stringify({ error: "Failed binding device" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, device_id, screen_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("device-bind-screen: unexpected error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});