import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🔄 Update build status function called");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("❌ Missing Supabase configuration");
      throw new Error("Internal server error: Missing Supabase configuration.");
    }

    console.log("✅ Environment variables present");

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { build_id, status, artifact_url, logs_url, commit_hash } = await req.json();
    console.log(`📝 Updating build ${build_id} to status: ${status}`);

    if (!build_id || !status) {
      console.error("❌ Missing required fields");
      return new Response(JSON.stringify({ error: "build_id and status are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (artifact_url) {
      updateData.artifact_url = artifact_url;
    }
    if (logs_url) {
      updateData.logs_url = logs_url;
    }
    if (commit_hash) {
      updateData.commit_hash = commit_hash;
    }

    // Update the build record
    const { data, error } = await supabaseAdmin
      .from('app_builds')
      .update(updateData)
      .eq('id', build_id)
      .select()
      .single();

    if (error) {
      console.error("❌ Database update error:", error);
      throw error;
    }

    console.log("✅ Build status updated successfully:", data);

    // If build is successful and has an artifact, create an app release
    if (status === 'success' && artifact_url) {
      try {
        console.log("🎯 Creating app release for successful build");
        const createReleaseResponse = await supabaseAdmin.functions.invoke('create-app-release', {
          body: { build_id }
        });
        
        if (createReleaseResponse.error) {
          console.error("⚠️ Failed to create app release:", createReleaseResponse.error);
        } else {
          console.log("✅ App release created successfully");
        }
      } catch (error) {
        console.error("⚠️ Error creating app release:", error);
        // Don't fail the main request if release creation fails
      }
    }

    return new Response(JSON.stringify({ success: true, build: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("💥 Function error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});