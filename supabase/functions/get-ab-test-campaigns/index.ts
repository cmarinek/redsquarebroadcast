import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// --- Mock Data ---
// In a real application, this data would be generated from database queries
// based on the user's role and ID.
const mockAdvertiserCampaigns = {
  campaigns: [
    { id: 'adv-1', name: 'Advertiser Campaign 1', description: 'Adv Desc 1', status: 'draft', target_metric: 'ctr', start_date: '2024-09-01', end_date: '2024-09-15' },
    { id: 'adv-2', name: 'Advertiser Campaign 2', description: 'Adv Desc 2', status: 'running', target_metric: 'conversions', start_date: '2024-08-20', end_date: '2024-09-05' },
  ],
};

const mockBroadcasterCampaigns = {
  campaigns: [
    { id: 'brd-1', name: 'Broadcaster Campaign 1', description: 'Brd Desc 1', status: 'active', target_metric: 'engagement', start_date: '2024-08-25', end_date: '2024-09-10' },
    { id: 'brd-2', name: 'Broadcaster Campaign 2', description: 'Brd Desc 2', status: 'completed', target_metric: 'views', start_date: '2024-07-01', end_date: '2024-07-31' },
  ],
};


serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role } = await req.json();

    let responseData;
    switch (role) {
      case 'advertiser':
        responseData = mockAdvertiserCampaigns;
        break;
      case 'broadcaster':
        responseData = mockBroadcasterCampaigns;
        break;
      default:
        // Return empty array for unknown roles or default case
        responseData = { campaigns: [] };
        break;
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
