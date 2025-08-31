import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🚀 Create app release function called");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("❌ Missing Supabase configuration");
      throw new Error("Internal server error: Missing Supabase configuration.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { build_id } = await req.json();
    console.log(`📦 Creating app release for build: ${build_id}`);

    if (!build_id) {
      console.error("❌ Missing required field: build_id");
      return new Response(JSON.stringify({ error: "build_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the successful build details
    const { data: build, error: buildError } = await supabaseAdmin
      .from('app_builds')
      .select('*')
      .eq('id', build_id)
      .eq('status', 'success')
      .single();

    if (buildError || !build) {
      console.error("❌ Build not found or not successful:", buildError);
      return new Response(JSON.stringify({ error: "Build not found or not successful" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if release already exists
    const { data: existingRelease } = await supabaseAdmin
      .from('app_releases')
      .select('id')
      .eq('version_name', build.version)
      .eq('platform', getPlatformFromAppType(build.app_type))
      .single();

    if (existingRelease) {
      console.log("✅ Release already exists for this build");
      return new Response(JSON.stringify({ success: true, release: existingRelease }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch file size from artifact URL
    let fileSize = 0;
    if (build.artifact_url) {
      try {
        console.log("📏 Fetching file size from:", build.artifact_url);
        const response = await fetch(build.artifact_url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          fileSize = parseInt(contentLength, 10);
          console.log("✅ File size fetched:", fileSize);
        }
      } catch (error) {
        console.warn("⚠️ Could not fetch file size:", error);
      }
    }

    // Create app release record
    const releaseData = {
      version_name: build.version,
      version_code: generateVersionCode(build.version),
      platform: getPlatformFromAppType(build.app_type),
      file_path: build.artifact_url || '',
      file_size: fileSize,
      file_extension: getFileExtension(build.app_type),
      bundle_id: getBundleId(build.app_type),
      uploaded_by: build.triggered_by,
      release_notes: `Automated build from commit ${build.commit_hash || 'unknown'}`,
      is_active: true
    };

    const { data: release, error: releaseError } = await supabaseAdmin
      .from('app_releases')
      .insert(releaseData)
      .select()
      .single();

    if (releaseError) {
      console.error("❌ Failed to create app release:", releaseError);
      throw releaseError;
    }

    console.log("✅ App release created successfully:", release);

    return new Response(JSON.stringify({ success: true, release }), {
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

function getPlatformFromAppType(appType: string): string {
  const platformMap: Record<string, string> = {
    'redsquare_android': 'android',
    'redsquare_ios': 'ios',
    'screens_android_mobile': 'android',
    'screens_android_tv': 'android_tv',
    'screens_ios': 'ios',
    'screens_macos': 'macos',
    'screens_windows': 'windows',
    'screens_linux': 'linux',
    'screens_amazon_fire': 'amazon_fire',
    'screens_roku': 'roku',
    'screens_samsung_tizen': 'samsung_tizen',
    'screens_lg_webos': 'lg_webos'
  };
  return platformMap[appType] || 'unknown';
}

function getFileExtension(appType: string): string {
  const extensionMap: Record<string, string> = {
    'redsquare_android': 'apk',
    'redsquare_ios': 'ipa',
    'screens_android_mobile': 'apk',
    'screens_android_tv': 'apk',
    'screens_ios': 'ipa',
    'screens_macos': 'dmg',
    'screens_windows': '7z',
    'screens_linux': 'AppImage',
    'screens_amazon_fire': 'apk',
    'screens_roku': 'zip',
    'screens_samsung_tizen': 'wgt',
    'screens_lg_webos': 'ipk'
  };
  return extensionMap[appType] || 'zip';
}

function getBundleId(appType: string): string {
  if (appType.startsWith('redsquare_')) {
    return 'com.redsquare.broadcast';
  } else if (appType.startsWith('screens_')) {
    return 'com.redsquare.screens';
  }
  return 'com.redsquare.app';
}

function generateVersionCode(version: string): number {
  // Extract timestamp from version like "1.0.1756661508"
  const parts = version.split('.');
  if (parts.length >= 3) {
    const timestamp = parseInt(parts[2]);
    if (!isNaN(timestamp)) {
      return timestamp;
    }
  }
  // Fallback to current timestamp
  return Math.floor(Date.now() / 1000);
}