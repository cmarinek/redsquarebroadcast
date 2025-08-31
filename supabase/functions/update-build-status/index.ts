import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Update build status function called");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ghActionSecret = Deno.env.get("GH_ACTION_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    console.log("Environment check:", {
      hasServiceKey: !!serviceKey,
      hasGhActionSecret: !!ghActionSecret,
      hasSupabaseUrl: !!supabaseUrl
    });

    if (!serviceKey || !ghActionSecret || !supabaseUrl) {
      console.error("Missing environment variables");
      throw new Error("Missing required environment variables.");
    }

    // 1. Authenticate the request from GitHub Actions
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header received:", authHeader ? "Bearer [REDACTED]" : "None");
    console.log("Expected format: Bearer [SECRET]");
    
    if (authHeader !== `Bearer ${ghActionSecret}`) {
      console.error("Authentication failed - header mismatch");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    console.log("Authentication successful");

    const {
        build_id,
        status,
        artifact_url,
        logs_url,
        commit_hash,
        version
    } = await req.json();

    if (!build_id || !status) {
        return new Response(JSON.stringify({ error: "build_id and status are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Update the build record in the database
    const supabaseAdminClient = createClient(supabaseUrl, serviceKey);
    const updatePayload: {
        status: string;
        artifact_url?: string;
        logs_url?: string;
        commit_hash?: string;
        version?: string;
    } = {
        status,
        artifact_url,
        logs_url,
        commit_hash,
        version
    };

    // Remove undefined properties so they don't overwrite existing values
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });


    const { data, error } = await supabaseAdminClient
      .from('app_builds')
      .update(updatePayload)
      .eq('id', build_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, build: data }), {
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
