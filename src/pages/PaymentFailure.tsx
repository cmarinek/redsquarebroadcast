import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw, HelpCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const COMMON_ERROR_MESSAGES: Record<string, string> = {
  card_declined: "Your card was declined. Please try a different payment method.",
  insufficient_funds: "Your card has insufficient funds. Please use a different card.",
  expired_card: "Your card has expired. Please use a different card.",
  incorrect_cvc: "The CVC code was incorrect. Please try again.",
  processing_error: "An error occurred while processing your payment. Please try again.",
  network_error: "Network connection error. Please check your connection and try again.",
};

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retrying, setRetrying] = useState(false);

  const errorCode = searchParams.get("error");
  const errorMessage = searchParams.get("message");
  const bookingId = searchParams.get("booking_id");
  const screenId = searchParams.get("screen_id");

  useEffect(() => {
    // Show toast notification
    toast({
      title: "Payment Failed",
      description: getErrorMessage(),
      variant: "destructive",
    });
  }, []);

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (errorCode && COMMON_ERROR_MESSAGES[errorCode]) {
      return COMMON_ERROR_MESSAGES[errorCode];
    }
    return "We couldn't process your payment. Please try again.";
  };

  const handleRetryPayment = async () => {
    setRetrying(true);

    // If we have a booking ID, navigate back to payment with the booking
    if (bookingId) {
      navigate(`/payment?booking_id=${bookingId}&retry=true`);
    } else if (screenId) {
      // Otherwise go back to scheduling for that screen
      navigate(`/book/${screenId}/schedule`);
    } else {
      // Fallback to screen discovery
      navigate("/screen-discovery");
    }
  };

  const handleContactSupport = () => {
    // Navigate to support or open email client
    window.location.href = `mailto:support@redsquare.app?subject=Payment%20Failed%20-%20${bookingId || "Unknown"}&body=Error:%20${errorCode || errorMessage}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Payment Failed
            </h1>
            <p className="text-lg text-muted-foreground">
              We couldn't process your payment
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What Happened?</CardTitle>
              <CardDescription>
                Your payment was not successful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {getErrorMessage()}
                </AlertDescription>
              </Alert>

              {errorCode && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">Error Code: {errorCode}</span>
                </div>
              )}

              <div className="pt-4">
                <h3 className="font-semibold mb-3 text-sm">Common Reasons for Payment Failure:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>Insufficient funds in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>Card details were entered incorrectly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>Your card has expired or been declined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>Your bank blocked the transaction (contact your bank)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>Network connection was interrupted</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Button
              className="w-full"
              onClick={handleRetryPayment}
              disabled={retrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Redirecting..." : "Try Again"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(screenId ? `/screen/${screenId}` : "/screen-discovery")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Alternative Payment Methods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Try a Different Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If your current payment method isn't working, try:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Using a different credit or debit card</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Checking with your bank for transaction blocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Ensuring your billing address is correct</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you continue to experience issues or believe this was an error, our support team is here to help.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleContactSupport}
                >
                  Contact Support
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Email:{" "}
                  <a
                    href="mailto:support@redsquare.app"
                    className="text-primary hover:underline"
                  >
                    support@redsquare.app
                  </a>
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">Before Contacting Support:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Have your booking reference ready: <span className="font-mono">{bookingId?.slice(0, 8) || "N/A"}</span></li>
                  <li>• Note the error code: <span className="font-mono">{errorCode || "None"}</span></li>
                  <li>• Try the payment again with a different card</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-1">Will I be charged for a failed payment?</p>
                <p className="text-muted-foreground">
                  No, you will not be charged if the payment fails. Only successful payments are processed.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Is my booking still reserved?</p>
                <p className="text-muted-foreground">
                  Your booking is held for 15 minutes. Please complete the payment within this time to secure your slot.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Can I use a different payment method?</p>
                <p className="text-muted-foreground">
                  Yes, you can try again with a different card or contact support for alternative payment options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
