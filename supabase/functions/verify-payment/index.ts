import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Update payment status based on Stripe session
    const paymentStatus = session.payment_status === 'paid' ? 'completed' : 'failed';
    
    // Update payment record
    const { error: paymentError } = await supabaseService
      .from('payments')
      .update({
        status: paymentStatus,
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('stripe_session_id', sessionId);

    if (paymentError) {
      console.error("Payment update error:", paymentError);
    }

    // Update booking status
    const { error: bookingError } = await supabaseService
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === 'completed' ? 'confirmed' : 'cancelled',
      })
      .eq('stripe_session_id', sessionId);

    if (bookingError) {
      console.error("Booking update error:", bookingError);
    }

    // If payment successful, create notification for screen owner
    if (paymentStatus === 'completed') {
      const { data: booking } = await supabaseService
        .from('bookings')
        .select('screens!inner(owner_id), content_uploads!inner(file_name)')
        .eq('stripe_session_id', sessionId)
        .single();

      if (booking?.screens.owner_id) {
        await supabaseService
          .from('notifications')
          .insert({
            user_id: booking.screens.owner_id,
            title: 'New Booking Confirmed',
            message: `A new broadcast of "${booking.content_uploads.file_name}" has been confirmed for your screen.`,
            type: 'booking'
          });
      }
    }

    return new Response(JSON.stringify({ 
      status: paymentStatus,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});