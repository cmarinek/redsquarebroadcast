import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function DeploymentGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard."
    });
  };

  const deploymentSteps = [
    {
      title: "Database Schema",
      status: "complete",
      description: "Core tables and relationships created",
      details: "✅ Profiles, screens, bookings, payments, devices, subscriptions, notifications"
    },
    {
      title: "Storage Buckets", 
      status: "complete",
      description: "File storage configured",
      details: "✅ Content uploads bucket (private), Avatars bucket (public)"
    },
    {
      title: "API Keys Setup",
      status: "pending",
      description: "Configure external service keys",
      details: "Required: STRIPE_SECRET_KEY, MAPBOX_PUBLIC_TOKEN, RESEND_API_KEY"
    },
    {
      title: "Payment Processing",
      status: "ready",
      description: "Stripe integration functions created",
      details: "✅ create-payment, check-subscription edge functions"
    },
    {
      title: "Map Integration",
      status: "ready", 
      description: "Mapbox integration ready",
      details: "✅ get-mapbox-token edge function"
    },
    {
      title: "Mobile App",
      status: "configured",
      description: "Capacitor configuration complete",
      details: "✅ Ready for iOS/Android deployment"
    },
    {
      title: "Email Services",
      status: "ready",
      description: "Notification system ready",
      details: "✅ send-email-notifications edge function"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'ready': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'configured': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'pending': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'complete' || status === 'ready' || status === 'configured') {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Red Square Deployment Status</h2>
        <p className="text-muted-foreground">
          Complete deployment checklist for your Red Square platform
        </p>
      </div>

      <div className="grid gap-4">
        {deploymentSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  {step.title}
                </CardTitle>
                <Badge className={getStatusColor(step.status)}>
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Next Steps for Full Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Configure API Keys</h4>
            <p className="text-sm text-muted-foreground mb-2">Add these secrets in Supabase Edge Functions Secrets:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="text-sm">STRIPE_SECRET_KEY</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard("sk_test_...")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="text-sm">MAPBOX_PUBLIC_TOKEN</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard("pk.eyJ1...")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="text-sm">RESEND_API_KEY</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard("re_...")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Mobile App Deployment</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Capacitor is configured. To deploy to mobile:
            </p>
            <div className="bg-muted p-3 rounded text-sm">
              <code>
                npm run build<br/>
                npx cap add ios<br/>
                npx cap add android<br/>
                npx cap sync<br/>
                npx cap run ios # or android
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Hardware Deployment</h4>
            <p className="text-sm text-muted-foreground">
              Deploy the Smart TV app and dongles with proper device provisioning tokens.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <a href="https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq/settings/functions" target="_blank">
                Configure Secrets <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://docs.lovable.dev/blogs/TODO" target="_blank">
                Mobile Guide <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}