import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("📏 Get file size function called");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_url } = await req.json();
    console.log(`📏 Fetching file size for: ${file_url}`);

    if (!file_url) {
      console.error("❌ Missing required field: file_url");
      return new Response(JSON.stringify({ error: "file_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Attempt to fetch file size with multiple strategies
    let fileSize = 0;
    let method = 'unknown';

    // Strategy 1: HEAD request
    try {
      console.log("🔍 Trying HEAD request...");
      const response = await fetch(file_url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength && response.ok) {
        fileSize = parseInt(contentLength, 10);
        method = 'head';
        console.log("✅ File size from HEAD request:", fileSize);
      } else {
        console.log("⚠️ HEAD request failed or no content-length");
      }
    } catch (error) {
      console.log("⚠️ HEAD request error:", error.message);
    }

    // Strategy 2: Partial GET request if HEAD failed
    if (fileSize === 0) {
      try {
        console.log("🔍 Trying partial GET request...");
        const response = await fetch(file_url, {
          method: 'GET',
          headers: {
            'Range': 'bytes=0-0'
          }
        });
        
        const contentRange = response.headers.get('content-range');
        if (contentRange) {
          // Format: "bytes 0-0/12345"
          const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
          if (match) {
            fileSize = parseInt(match[1], 10);
            method = 'range';
            console.log("✅ File size from range request:", fileSize);
          }
        }
      } catch (error) {
        console.log("⚠️ Range request error:", error.message);
      }
    }

    // Strategy 3: Parse from URL if it's a GitHub release
    if (fileSize === 0 && file_url.includes('github.com/')) {
      try {
        console.log("🔍 Trying GitHub API...");
        // Extract owner, repo, and asset info from GitHub release URL
        const urlParts = file_url.split('/');
        const ownerIndex = urlParts.indexOf('github.com') + 1;
        const owner = urlParts[ownerIndex];
        const repo = urlParts[ownerIndex + 1];
        
        if (file_url.includes('/releases/download/')) {
          const tagIndex = urlParts.indexOf('download') + 1;
          const tag = urlParts[tagIndex];
          const fileName = urlParts[tagIndex + 1];
          
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const release = await response.json();
            const asset = release.assets?.find((a: any) => a.name === fileName);
            
            if (asset && asset.size) {
              fileSize = asset.size;
              method = 'github_api';
              console.log("✅ File size from GitHub API:", fileSize);
            }
          }
        }
      } catch (error) {
        console.log("⚠️ GitHub API error:", error.message);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      file_size: fileSize,
      method,
      file_url 
    }), {
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