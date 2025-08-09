import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, RefreshCw, Settings } from "lucide-react";

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { subscribed: boolean; subscription_tier?: string | null; subscription_end?: string | null }>(null);

  useEffect(() => {
    // Basic SEO for SPA
    document.title = "Subscription | Red Square";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage your Red Square subscription.');
  }, []);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planName: "Screen Owner Subscription" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Activate and manage your Red Square plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={startCheckout} disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
                <Button variant="outline" onClick={refreshStatus} disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" onClick={openPortal} disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Settings className="h-4 w-4 mr-2" />
                  Manage in Portal
                </Button>
              </div>

              {status && (
                <div className="text-sm text-muted-foreground">
                  <div>
                    Status: {status.subscribed ? "Active" : "Not Active"}
                  </div>
                  {status.subscription_tier && (
                    <div>Tier: {status.subscription_tier}</div>
                  )}
                  {status.subscription_end && (
                    <div>Renews until: {new Date(status.subscription_end).toLocaleString()}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
