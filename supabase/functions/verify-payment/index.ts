import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter per IP per minute
const RATE_LIMIT = 60;
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) { rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS }); return { allowed: true }; }
  if (e.count >= RATE_LIMIT) return { allowed: false };
  e.count += 1; return { allowed: true };
}

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

    // Idempotent check: if already completed, return early
    const { data: existingPayment } = await supabaseService
      .from('payments')
      .select('status')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (existingPayment?.status === 'completed') {
      return new Response(JSON.stringify({ status: 'completed', session: { id: session.id, payment_status: session.payment_status, amount_total: session.amount_total, currency: session.currency } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", 'Cache-Control': 'no-store' },
        status: 200,
      });
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

    if (paymentStatus === 'completed') {
      const { data: booking } = await supabaseService
        .from('bookings')
        .select('id, screen_id, content_upload_id, start_time, duration_minutes, amount_cents')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      // Notify screen owner via in-app notification
      if (booking?.screen_id) {
        const { data: screen } = await supabaseService
          .from('screens')
          .select('owner_user_id, screen_name')
          .eq('id', booking.screen_id)
          .maybeSingle();

        if (screen?.owner_user_id) {
          await supabaseService
            .from('notifications')
            .insert({
              user_id: screen.owner_user_id,
              title: 'New Booking Confirmed',
              message: 'A new broadcast has been confirmed for your screen.',
              type: 'booking'
            });
        }

        // Send email receipt/confirmation to purchaser (if email available)
        try {
          const payerEmail = (session as any)?.customer_details?.email || (session as any)?.customer_email;
          if (payerEmail) {
            // Fetch content name for nicer email
            const { data: content } = await supabaseService
              .from('content_uploads')
              .select('file_name')
              .eq('id', booking.content_upload_id)
              .maybeSingle();

            const start = new Date(booking.start_time);
            const end = new Date(start.getTime() + (booking.duration_minutes || 0) * 60000);

            // Fire-and-forget email notifications
            await supabaseService.functions.invoke('send-email-notifications', {
              body: {
                type: 'payment_success',
                to: payerEmail,
                data: {
                  userName: 'there',
                  amount: booking.amount_cents || 0,
                  bookingId: booking.id,
                }
              }
            });

            await supabaseService.functions.invoke('send-email-notifications', {
              body: {
                type: 'booking_confirmed',
                to: payerEmail,
                data: {
                  userName: 'there',
                  screenName: screen?.screen_name || 'Digital Screen',
                  date: start.toLocaleDateString(),
                  startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  contentName: content?.file_name || 'Your Content',
                  amount: booking.amount_cents || 0,
                }
              }
            });
          }
        } catch (emailErr) {
          console.error('Email notification error:', emailErr);
        }
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
      headers: { ...corsHeaders, "Content-Type": "application/json", 'Cache-Control': 'no-store' },
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