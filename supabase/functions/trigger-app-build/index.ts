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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const githubToken = Deno.env.get("GITHUB_ACCESS_TOKEN");
    const githubRepoOwner = Deno.env.get("GITHUB_REPO_OWNER");
    const githubRepoName = Deno.env.get("GITHUB_REPO_NAME");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Internal server error: Missing Supabase configuration.");
    }

    if (!githubToken || !githubRepoOwner || !githubRepoName) {
        return new Response(JSON.stringify({
            error: "Configuration Error: The following environment variables must be set in your Supabase project's settings (Settings > Configuration > Environment Variables): GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_ACCESS_TOKEN."
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    // 1. Authenticate user and check for admin role
    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: claims, error: claimsError } = await supabaseUserClient.rpc('get_my_claim', { claim: 'is_admin' }) as { data: { is_admin: boolean } | null, error: Error | null };
    if (claimsError || !claims?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const allowedAppTypes = ['redsquare_android', 'redsquare_ios', 'redsquare_web', 'screens_android_tv', 'screens_android_mobile', 'screens_ios', 'screens_windows', 'screens_macos', 'screens_linux', 'screens_amazon_fire', 'screens_roku', 'screens_samsung_tizen', 'screens_lg_webos'] as const;
    type AppType = typeof allowedAppTypes[number];

    const { app_type }: { app_type: AppType } = await req.json();

    if (!app_type || !allowedAppTypes.includes(app_type)) {
      return new Response(JSON.stringify({ error: `A valid app_type (${allowedAppTypes.join(', ')}) is required.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    // 3. Dispatch GitHub Action workflow using workflow_dispatch (more reliable than repository_dispatch)
    const workflowFileMap = {
      // RedSquare App (main user management app)
      'redsquare_android': 'redsquare-android-build.yml',
      'redsquare_ios': 'redsquare-ios-build.yml', 
      'redsquare_web': 'redsquare-web-build.yml',
      // RedSquare Screens (content display app)
      'screens_android_tv': 'screens-android-tv-build.yml',
      'screens_android_mobile': 'screens-android-mobile-build.yml',
      'screens_ios': 'screens-ios-build.yml',
      'screens_windows': 'screens-windows-build.yml',
      'screens_macos': 'screens-macos-build.yml',
      'screens_linux': 'screens-linux-build.yml',
      // RedSquare Screens (streaming platforms)
      'screens_amazon_fire': 'screens-amazon-fire-build.yml',
      'screens_roku': 'screens-roku-build.yml',
      'screens_samsung_tizen': 'screens-samsung-tizen-build.yml',
      'screens_lg_webos': 'screens-lg-webos-build.yml'
    };
    
    const workflowFile = workflowFileMap[app_type];
    if (!workflowFile) {
      throw new Error(`No workflow configured for app type: ${app_type}`);
    }

    // Use workflow_dispatch instead of repository_dispatch for better reliability
    const dispatchUrl = `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/actions/workflows/${workflowFile}/dispatches`;

    const dispatchPayload = {
      ref: 'main', // or 'master' depending on your default branch
      inputs: {
        build_id: newBuild.id,
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
