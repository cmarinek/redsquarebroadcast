import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { getEnv } from "../_shared/env.ts";
import { SystemAlertEmail } from "./_templates/system-alert.tsx";

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

    const { alertType, severity, title, message, metadata } = await req.json();

    // Get all admin emails
    const { data: admins, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminsError || !admins || admins.length === 0) {
      throw new Error("No admin users found");
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const admin of admins) {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(admin.user_id);
      if (!error && user?.email) {
        adminEmails.push(user.email);
      }
    }

    if (adminEmails.length === 0) {
      throw new Error("No admin email addresses found");
    }

    // Render email template
    const html = await renderAsync(
      React.createElement(SystemAlertEmail, {
        alertType,
        severity,
        title,
        message,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        dashboardUrl: "https://redsquare.app/admin",
      })
    );

    // Send to all admins
    const { error: emailError } = await resend.emails.send({
      from: "Red Square Alerts <alerts@redsquare.app>",
      to: adminEmails,
      subject: `[${severity.toUpperCase()}] ${title}`,
      html,
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`System alert sent to ${adminEmails.length} admins`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Alert sent successfully",
        recipients: adminEmails.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending system alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
