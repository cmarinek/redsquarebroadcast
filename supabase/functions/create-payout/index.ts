import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Parse request body
    const { amount, period_start, period_end } = await req.json();
    
    if (!amount || !period_start || !period_end) {
      throw new Error("Missing required fields: amount, period_start, period_end");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user has Stripe account set up
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_account_id) {
      throw new Error("Stripe account not set up. Please complete your payout setup first.");
    }

    // Create payout request record
    const { data: payoutRequest, error: insertError } = await supabaseClient
      .from('payout_requests')
      .insert({
        screen_owner_id: user.id,
        amount: Math.round(amount * 100), // Convert to cents
        earnings_period_start: period_start,
        earnings_period_end: period_end,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // For demo purposes, we'll simulate the payout process
    // In a real implementation, you would:
    // 1. Verify the earnings amount
    // 2. Create actual Stripe payout to connected account
    // 3. Update status based on Stripe response

    try {
      // Simulate Stripe payout creation
      // const payout = await stripe.payouts.create({
      //   amount: Math.round(amount * 100),
      //   currency: 'usd',
      // }, {
      //   stripeAccount: profile.stripe_account_id
      // });

      // For demo, we'll mark as completed immediately
      await supabaseClient
        .from('payout_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          stripe_payout_id: `demo_payout_${Date.now()}`
        })
        .eq('id', payoutRequest.id);

      return new Response(JSON.stringify({
        success: true,
        payout_request_id: payoutRequest.id,
        message: "Payout request processed successfully"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (stripeError) {
      // Update payout request status to failed
      await supabaseClient
        .from('payout_requests')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          metadata: { error: stripeError.message }
        })
        .eq('id', payoutRequest.id);

      throw stripeError;
    }

  } catch (error) {
    console.error("Error processing payout:", error);
    return new Response(JSON.stringify({
      error: error.message || "An error occurred processing the payout"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});