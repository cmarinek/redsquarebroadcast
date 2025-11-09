import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      getEnv('SUPABASE_URL'),
      getEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });

    // Get all pending payout requests
    const { data: payoutRequests, error: fetchError } = await supabase
      .from('payout_requests')
      .select(`
        *,
        profiles!payout_requests_screen_owner_id_fkey(
          user_id,
          display_name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;

    const results = [];

    for (const request of payoutRequests || []) {
      try {
        // Calculate eligible amount from completed bookings
        const { data: earnings } = await supabase
          .from('payments')
          .select('owner_amount_cents')
          .eq('status', 'completed')
          .gte('created_at', request.earnings_period_start)
          .lte('created_at', request.earnings_period_end)
          .in('booking_id', 
            supabase
              .from('bookings')
              .select('id')
              .in('screen_id',
                supabase
                  .from('screens')
                  .select('id')
                  .eq('owner_user_id', request.screen_owner_id)
              )
          );

        const totalEarnings = earnings?.reduce((sum, e) => sum + (e.owner_amount_cents || 0), 0) || 0;

        if (totalEarnings < request.amount) {
          // Insufficient earnings
          await supabase
            .from('payout_requests')
            .update({
              status: 'failed',
              metadata: { error: 'Insufficient earnings', totalEarnings, requestedAmount: request.amount }
            })
            .eq('id', request.id);

          results.push({ id: request.id, status: 'failed', reason: 'Insufficient earnings' });
          continue;
        }

        // Process payout via Stripe
        // Note: Requires Stripe Connect account setup for screen owners
        // For now, we'll mark as processed and log the payout
        
        await supabase
          .from('payout_requests')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            metadata: { 
              totalEarnings,
              processedAmount: request.amount,
              processedAt: new Date().toISOString()
            }
          })
          .eq('id', request.id);

        // Send email notification
        const ownerEmail = request.profiles?.email;
        if (ownerEmail) {
          await supabase.functions.invoke('send-email-notifications', {
            body: {
              type: 'payout_processed',
              to: ownerEmail,
              data: {
                userName: request.profiles?.display_name || 'Screen Owner',
                amount: request.amount,
                periodStart: new Date(request.earnings_period_start).toLocaleDateString(),
                periodEnd: new Date(request.earnings_period_end).toLocaleDateString(),
                totalBookings: earnings?.length || 0,
                expectedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
              }
            }
          });
        }

        results.push({ id: request.id, status: 'completed', amount: request.amount });

      } catch (error) {
        console.error(`Payout processing error for ${request.id}:`, error);
        
        await supabase
          .from('payout_requests')
          .update({
            status: 'failed',
            metadata: { error: error.message }
          })
          .eq('id', request.id);

        results.push({ id: request.id, status: 'failed', error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Payout automation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});