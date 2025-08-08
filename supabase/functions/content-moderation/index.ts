import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  contentId: string;
  contentUrl: string;
  contentType: string;
  screenId?: string;
}

const PROHIBITED_CONTENT = [
  'violence', 'hate speech', 'adult content', 'illegal activities',
  'discriminatory content', 'harassment', 'spam', 'misinformation'
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { contentId, contentUrl, contentType, screenId }: ModerationRequest = await req.json();

    // Automated content analysis
    const automatedFlags = await performAutomatedModeration(contentUrl, contentType);
    
    // Determine moderation status
    const isProhibited = automatedFlags.some(flag => 
      PROHIBITED_CONTENT.some(prohibited => 
        flag.category.toLowerCase().includes(prohibited.toLowerCase())
      )
    );

    const status = isProhibited ? 'rejected' : 
                  automatedFlags.length > 0 ? 'pending' : 'approved';

    const moderationReason = isProhibited ? 
      `Content flagged for: ${automatedFlags.map(f => f.category).join(', ')}` : null;

    // Create moderation record
    const { data: moderation } = await supabaseService
      .from('content_moderation')
      .insert({
        content_id: contentId,
        screen_id: screenId,
        status,
        moderation_reason: moderationReason,
        automated_flags: automatedFlags
      })
      .select()
      .single();

    // Send notification if rejected
    if (status === 'rejected') {
      const { data: content } = await supabaseService
        .from('content_uploads')
        .select('user_id, file_name')
        .eq('id', contentId)
        .single();

      if (content) {
        const { data: user } = await supabaseService
          .from('profiles')
          .select('display_name')
          .eq('user_id', content.user_id)
          .single();

        // Send email notification
        await supabaseService.functions.invoke('send-email-notifications', {
          body: {
            type: 'content_rejected',
            to: content.user_id, // This would need to be email in real implementation
            data: {
              userName: user?.display_name || 'User',
              contentName: content.file_name,
              reason: moderationReason
            }
          }
        });
      }
    }

    return new Response(JSON.stringify({
      moderationId: moderation.id,
      status,
      flags: automatedFlags,
      reason: moderationReason
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Content moderation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function performAutomatedModeration(contentUrl: string, contentType: string) {
  const flags = [];

  try {
    // Basic content analysis (in production, you'd use OpenAI Vision API or similar)
    if (contentType.startsWith('image/')) {
      // Image analysis would go here
      // For now, just basic filename/URL analysis
      const suspiciousPatterns = ['xxx', 'adult', 'violence', 'hate'];
      const urlLower = contentUrl.toLowerCase();
      
      for (const pattern of suspiciousPatterns) {
        if (urlLower.includes(pattern)) {
          flags.push({
            category: pattern,
            confidence: 0.8,
            description: `Suspicious content pattern detected: ${pattern}`
          });
        }
      }
    }

    // File size checks
    try {
      const response = await fetch(contentUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB
        flags.push({
          category: 'file_size',
          confidence: 1.0,
          description: 'File size exceeds maximum limit'
        });
      }
    } catch (error) {
      console.error('Error checking file size:', error);
    }

  } catch (error) {
    console.error('Error in automated moderation:', error);
    flags.push({
      category: 'analysis_error',
      confidence: 0.5,
      description: 'Unable to analyze content automatically'
    });
  }

  return flags;
}