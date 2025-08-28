import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// These should be set in your Supabase project's environment variables
const GITHUB_REPO_OWNER = Deno.env.get("GITHUB_REPO_OWNER") || "redsquare-dev";
const GITHUB_REPO_NAME = Deno.env.get("GITHUB_REPO_NAME") || "redsquare-app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const githubToken = Deno.env.get("GITHUB_ACCESS_TOKEN");

    if (!supabaseUrl || !anonKey || !serviceKey || !githubToken) {
      throw new Error("Missing required environment variables for Supabase or GitHub.");
    }

    // 1. Authenticate user and check for admin role
    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: claims, error: claimsError } = await supabaseUserClient.rpc('get_my_claim', { claim: 'is_admin' }) as { data: { is_admin: boolean } | null, error: any };
    if (claimsError || !claims?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { app_type } = await req.json();
    if (!app_type) {
      return new Response(JSON.stringify({ error: "app_type is required in the request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Create a new build record in the database
    const supabaseAdminClient = createClient(supabaseUrl, serviceKey);
    const version = `1.0.${Math.floor(Date.now() / 1000)}`; // Simple timestamp-based version

    const { data: newBuild, error: insertError } = await supabaseAdminClient
      .from('app_builds')
      .insert({
        app_type,
        version,
        status: 'pending',
        triggered_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Dispatch GitHub Action workflow
    const dispatchUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`;
    // Sanitize app_type to be safe for an event name
    const sanitizedAppType = app_type.replace(/[^a-zA-Z0-9_-]/g, '');
    const eventType = `trigger-${sanitizedAppType}-build`;

    const dispatchPayload = {
      event_type: eventType,
      client_payload: {
        build_id: newBuild.id,
        app_type: newBuild.app_type,
        version: newBuild.version,
      },
    };

    const ghResponse = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dispatchPayload),
    });

    if (!ghResponse.ok) {
        const errorBody = await ghResponse.text();
        console.error("GitHub API Error:", errorBody);
        // If GitHub dispatch fails, update the build status to 'failed'
        await supabaseAdminClient
            .from('app_builds')
            .update({ status: 'failed' })
            .eq('id', newBuild.id);
      throw new Error(`GitHub API request failed: ${ghResponse.statusText}`);
    }

    return new Response(JSON.stringify({ success: true, build: newBuild }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
