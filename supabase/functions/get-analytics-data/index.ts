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
        // The RPC returns a single JSON object which we can use as the summary
        responseData = { summary: data, timeSeries: [] }; // timeSeries can be built out later
        break;
      }

      case 'advertiser': {
        // This is a simplified implementation. A real version would have complex aggregation.
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .select('id, total_amount, status')
          .eq('user_id', userId);
        if (error) throw error;

        const summary = {
          impressions: data.length * 1000, // Placeholder logic
          clicks: data.length * 50,      // Placeholder logic
          ctr: 5.0,                       // Placeholder logic
          conversions: data.length * 5,   // Placeholder logic
          totalSpent: data.reduce((acc, b) => acc + b.total_amount, 0),
        };
        responseData = { summary, timeSeries: [] };
        break;
      }

      case 'broadcaster': {
        // This is a simplified implementation.
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select('id, screen_id')
            .eq('user_id', userId);
        if (error) throw error;

        const summary = {
            views: data.length * 2500, // Placeholder logic
            engagementRate: 12.3,      // Placeholder logic
            totalCampaigns: data.length,
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
