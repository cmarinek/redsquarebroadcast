import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// --- Mock Data ---
// In a real application, this data would be generated from database queries.
const mockAdvertiserData = {
  summary: {
    impressions: 125430,
    clicks: 6847,
    ctr: 5.46,
    conversions: 512,
    reach: 89250,
  },
  timeSeries: [
    { date: '2024-08-01', impressions: 4500, clicks: 320, conversions: 28 },
    { date: '2024-08-02', impressions: 5200, clicks: 380, conversions: 35 },
    { date: '2024-08-03', impressions: 4800, clicks: 340, conversions: 31 },
  ],
};

const mockBroadcasterData = {
  summary: {
    views: 280000,
    impressions: 1500000,
    engagementRate: 12.3,
    topPerformingScreen: 'City Center Plaza',
    peakHour: 18,
  },
  timeSeries: [
    { date: '2024-08-01', views: 8000, engagementRate: 11.5 },
    { date: '2024-08-02', views: 9500, engagementRate: 12.8 },
    { date: '2024-08-03', views: 8700, engagementRate: 12.1 },
  ],
};

const mockAdminData = {
    summary: {
        totalUsers: 1024,
        activeScreens: 350,
        totalBookings: 5432,
        totalRevenue: 150234.56
    },
    timeSeries: [
        { date: '2024-08-01', newUsers: 15, revenue: 4500 },
        { date: '2024-08-02', newUsers: 22, revenue: 5200 },
        { date: '2024-08-03', newUsers: 18, revenue: 4800 },
    ]
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

    let responseData;
    switch (role) {
      case 'advertiser':
        // In a real app, you would use userId and campaignId to filter the query
        responseData = mockAdvertiserData;
        break;
      case 'broadcaster':
        responseData = mockBroadcasterData;
        break;
      case 'admin':
        // Here you might call the get_platform_analytics() postgres function
        responseData = mockAdminData;
        break;
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
      status: 400, // Bad Request, likely due to missing role
    })
  }
})
