import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getEnv } from "../_shared/env.ts";

// Helper function to create an authenticated Supabase client
const createAdminClient = (req: Request) => {
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"), // Use service role for admin queries
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role, userId, campaignId } = await req.json();
    const supabaseAdmin = createAdminClient(req);
    let responseData;

    switch (role) {
      case 'admin': {
        const { data, error } = await supabaseAdmin.rpc('get_platform_analytics');
        if (error) throw error;
        responseData = { summary: data, timeSeries: [] };
        break;
      }

      case 'advertiser': {
        const { data, error } = await supabaseAdmin.rpc('get_advertiser_analytics_summary', {
          p_user_id: userId,
        });
        if (error) throw error;
        responseData = { summary: data, timeSeries: [] }; // timeSeries can be built out later
        break;
      }

      case 'broadcaster': {
        // This is a simplified implementation. A real version would have complex aggregation.
        const { count: totalCampaigns, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (bookingError) throw bookingError;

        // Placeholder logic for other metrics until real data is available
        const summary = {
            views: (totalCampaigns ?? 0) * 2500,
            engagementRate: 12.3,
            totalCampaigns: totalCampaigns ?? 0,
        };
        responseData = { summary, timeSeries: [] };
        break;
      }

      default:
        throw new Error('Invalid role specified');
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
