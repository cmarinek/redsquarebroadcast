import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2 } from "lucide-react";

export const EmailTestingPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState<string>("booking");
  const [testEmail, setTestEmail] = useState("");
  
  const sendTestEmail = async (functionName: string, payload: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "✅ Email Sent Successfully",
        description: `Test email sent via ${functionName}`,
      });
    } catch (error: any) {
      console.error("Email test error:", error);
      toast({
        title: "❌ Email Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingConfirmation = async () => {
    // Use an existing booking or show helpful error
    const { data: bookings } = await supabase.from("bookings").select("id").limit(1).single();
    
    if (!bookings) {
      toast({ 
        title: "No Bookings Found", 
        description: "Create at least one booking first to test this email.",
        variant: "destructive" 
      });
      return;
    }

    await sendTestEmail("send-booking-confirmation", { bookingId: bookings.id });
  };

  const handlePaymentConfirmation = async () => {
    const { data: payments } = await supabase.from("payments").select("id").limit(1).single();
    
    if (!payments) {
      toast({ 
        title: "No Payments Found", 
        description: "Create at least one payment first to test this email.",
        variant: "destructive" 
      });
      return;
    }

    await sendTestEmail("send-payment-confirmation", { paymentId: payments.id });
  };

  const handleScreenOwnerNotification = async () => {
    const { data: bookings } = await supabase.from("bookings").select("id").limit(1).single();
    
    if (!bookings) {
      toast({ 
        title: "No Bookings Found", 
        description: "Create at least one booking first to test this email.",
        variant: "destructive" 
      });
      return;
    }

    await sendTestEmail("send-screen-owner-notification", { bookingId: bookings.id });
  };

  const handleSystemAlert = async () => {
    await sendTestEmail("send-system-alert", {
      alertType: "test_alert",
      severity: "medium",
      title: "Test System Alert",
      message: "This is a test alert from the email testing panel",
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Testing Panel
        </CardTitle>
        <CardDescription>
          Test all email notification functions with sample data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            onClick={handleBookingConfirmation}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test Booking Confirmation
          </Button>

          <Button
            onClick={handlePaymentConfirmation}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test Payment Confirmation
          </Button>

          <Button
            onClick={handleScreenOwnerNotification}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test Screen Owner Notification
          </Button>

          <Button
            onClick={handleSystemAlert}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test System Alert
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Emails will be sent to the email address of the authenticated user.
            Make sure you have configured the RESEND_API_KEY secret and verified your domain in Resend.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
