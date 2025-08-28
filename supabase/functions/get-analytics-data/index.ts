import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper function to create an authenticated Supabase client
const createAdminClient = (req: Request) => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for admin queries
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
        let query_user_id = userId;
        // In a real app, you might have more complex logic for campaign filtering
        // For now, we just filter by user_id if no specific campaignId is passed
        if (campaignId) {
            const { data: booking, error } = await supabaseAdmin.from('bookings').select('user_id').eq('id', campaignId).single();
            if(error) throw error;
            query_user_id = booking.user_id;
        }

        const [
          { count: impressions, error: impError },
          { count: clicks, error: clickError },
          { count: conversions, error: convError }
        ] = await Promise.all([
          supabaseAdmin.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('user_id', query_user_id),
          supabaseAdmin.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('user_id', query_user_id),
          supabaseAdmin.from('ad_conversions').select('*', { count: 'exact', head: true }).eq('user_id', query_user_id)
        ]);

        if (impError || clickError || convError) {
            throw impError || clickError || convError;
        }

        const summary = {
          impressions: impressions ?? 0,
          clicks: clicks ?? 0,
          conversions: conversions ?? 0,
          ctr: (impressions && clicks) ? (clicks / impressions) * 100 : 0,
        };
        responseData = { summary, timeSeries: [] };
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
