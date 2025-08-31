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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!serviceKey || !supabaseUrl) {
      throw new Error("Missing required environment variables.");
    }

    // Get the build ID from the latest Samsung build
    const supabaseAdminClient = createClient(supabaseUrl, serviceKey);
    
    const { data: build, error: fetchError } = await supabaseAdminClient
      .from('app_builds')
      .select('*')
      .eq('app_type', 'screens_samsung_tizen')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;
    
    if (!build) {
      return new Response(JSON.stringify({ message: "No pending Samsung build found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the build to success with the correct artifact URL
    const artifactUrl = `https://hqeyyutbuxhyildsasqq.supabase.co/storage/v1/object/public/tv-files/screens-samsung-tizen-app-v${build.version}.tpk`;
    
    const { data, error } = await supabaseAdminClient
      .from('app_builds')
      .update({
        status: 'success',
        artifact_url: artifactUrl
      })
      .eq('id', build.id)
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