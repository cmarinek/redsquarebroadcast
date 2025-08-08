import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'booking_confirmed' | 'payment_success' | 'screen_registered' | 'content_approved' | 'content_rejected' | 'welcome';
  to: string;
  data: Record<string, any>;
}

const emailTemplates = {
  booking_confirmed: (data: any) => ({
    subject: `Booking Confirmed - ${data.screenName}`,
    html: `
      <h1>Your broadcast is confirmed!</h1>
      <p>Hi ${data.userName},</p>
      <p>Your booking for <strong>${data.screenName}</strong> has been confirmed.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Date: ${data.date}</li>
        <li>Time: ${data.startTime} - ${data.endTime}</li>
        <li>Content: ${data.contentName}</li>
        <li>Total: $${(data.amount / 100).toFixed(2)}</li>
      </ul>
      <p>Your content will start broadcasting at the scheduled time.</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  }),

  payment_success: (data: any) => ({
    subject: 'Payment Successful',
    html: `
      <h1>Payment Successful</h1>
      <p>Hi ${data.userName},</p>
      <p>Your payment of $${(data.amount / 100).toFixed(2)} has been processed successfully.</p>
      <p>Booking ID: ${data.bookingId}</p>
      <p>Your broadcast will begin as scheduled.</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  }),

  screen_registered: (data: any) => ({
    subject: 'Screen Successfully Registered',
    html: `
      <h1>Welcome to Red Square!</h1>
      <p>Hi ${data.ownerName},</p>
      <p>Your screen <strong>${data.screenName}</strong> has been successfully registered.</p>
      <p><strong>Screen Details:</strong></p>
      <ul>
        <li>Screen ID: ${data.screenId}</li>
        <li>Location: ${data.address}</li>
        <li>Price: $${(data.pricePerHour / 100).toFixed(2)}/hour</li>
      </ul>
      <p>Your screen is now available for broadcasters to book!</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  }),

  content_approved: (data: any) => ({
    subject: 'Content Approved',
    html: `
      <h1>Content Approved</h1>
      <p>Hi ${data.userName},</p>
      <p>Your content <strong>${data.contentName}</strong> has been approved and is ready for broadcast.</p>
      <p>You can now schedule this content on available screens.</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  }),

  content_rejected: (data: any) => ({
    subject: 'Content Needs Review',
    html: `
      <h1>Content Requires Modification</h1>
      <p>Hi ${data.userName},</p>
      <p>Your content <strong>${data.contentName}</strong> requires some modifications before it can be approved.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please upload a revised version that addresses these concerns.</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  }),

  welcome: (data: any) => ({
    subject: 'Welcome to Red Square!',
    html: `
      <h1>Welcome to Red Square!</h1>
      <p>Hi ${data.userName},</p>
      <p>Thank you for joining Red Square - the future of democratized advertising.</p>
      <p>You can now:</p>
      <ul>
        <li>Discover screens in your area</li>
        <li>Upload and schedule content</li>
        <li>Register your own screens (if you're a screen owner)</li>
      </ul>
      <p>Get started by exploring nearby screens!</p>
      <p>Best regards,<br>Red Square Team</p>
    `
  })
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { type, to, data }: EmailRequest = await req.json();

    if (!emailTemplates[type]) {
      throw new Error(`Unknown email type: ${type}`);
    }

    const template = emailTemplates[type](data);

    const emailResponse = await resend.emails.send({
      from: "Red Square <notifications@redsquare.com>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log(`Email sent successfully: ${type} to ${to}`);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Email notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});