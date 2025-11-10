import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { getEnv } from "../_shared/env.ts";
import { PaymentConfirmationEmail } from "./_templates/payment-confirmation.tsx";

const resend = new Resend(getEnv("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { paymentId } = await req.json();

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(
          id,
          start_time,
          end_time,
          duration_minutes,
          screen:screens(name, location)
        )
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      payment.user_id
    );

    if (userError || !user?.email) {
      throw new Error("User email not found");
    }

    // Render email template
    const html = await renderAsync(
      React.createElement(PaymentConfirmationEmail, {
        paymentId: payment.id,
        amount: payment.amount_cents / 100,
        currency: payment.currency,
        paymentMethod: payment.payment_method,
        transactionId: payment.stripe_payment_intent_id || payment.id,
        bookingId: payment.booking_id,
        screenName: payment.booking?.screen?.name || "Screen",
        receiptUrl: `https://redsquare.app/payment/receipt?id=${payment.id}`,
      })
    );

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "Red Square Payments <payments@redsquare.app>",
      to: [user.email],
      subject: `Payment Received - ${payment.currency.toUpperCase()} ${(payment.amount_cents / 100).toFixed(2)}`,
      html,
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`Payment confirmation email sent to ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending payment confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
