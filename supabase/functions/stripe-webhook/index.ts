import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getEnv } from "../_shared/env.ts";

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  getEnv("SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 400 }
    );
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  
  // Update payment record
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("stripe_session_id", sessionId);

  if (paymentError) {
    console.error("Payment update error:", paymentError);
    throw paymentError;
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      payment_status: "completed",
      status: "confirmed",
    })
    .eq("stripe_session_id", sessionId);

  if (bookingError) {
    console.error("Booking update error:", bookingError);
    throw bookingError;
  }

  // Send notifications
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, screen_id, user_id")
    .eq("stripe_session_id", sessionId)
    .single();

  if (booking?.screen_id) {
    const { data: screen } = await supabase
      .from("screens")
      .select("owner_user_id")
      .eq("id", booking.screen_id)
      .single();

    if (screen?.owner_user_id) {
      await supabase.from("notifications").insert({
        user_id: screen.owner_user_id,
        title: "New Booking Confirmed",
        message: "A new broadcast has been confirmed for your screen.",
        type: "booking",
      });
    }
  }

  console.log(`Checkout completed for session: ${sessionId}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from("payments")
    .update({ status: "completed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Payment update error:", error);
  }

  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Payment update error:", error);
  }

  // Notify user of failed payment
  const { data: payment } = await supabase
    .from("payments")
    .select("user_id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single();

  if (payment?.user_id) {
    await supabase.from("notifications").insert({
      user_id: payment.user_id,
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again.",
      type: "payment",
    });
  }

  console.log(`Payment failed: ${paymentIntent.id}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Handle subscription updates for screen owners
  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // Handle subscription cancellation
  console.log(`Subscription canceled: ${subscription.id}`);
}
