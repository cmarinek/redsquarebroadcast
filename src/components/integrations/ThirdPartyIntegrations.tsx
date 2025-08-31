import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Zap, Calendar, BarChart3, MessageSquare, Mail, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: string;
}

export function ThirdPartyIntegrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: <Zap className="h-5 w-5" />,
      connected: false,
      category: 'automation'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync bookings with your calendar',
      icon: <Calendar className="h-5 w-5" />,
      connected: true,
      category: 'productivity'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track screen performance and audience',
      icon: <BarChart3 className="h-5 w-5" />,
      connected: false,
      category: 'analytics'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your workspace',
      icon: <MessageSquare className="h-5 w-5" />,
      connected: true,
      category: 'communication'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing integration',
      icon: <Mail className="h-5 w-5" />,
      connected: false,
      category: 'marketing'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Promote products on screens',
      icon: <ShoppingCart className="h-5 w-5" />,
      connected: false,
      category: 'ecommerce'
    }
  ]);

  const [zapierWebhook, setZapierWebhook] = useState('');

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, connected: !integration.connected }
        : integration
    ));

    const integration = integrations.find(i => i.id === integrationId);
    toast({
      title: `${integration?.name} ${integration?.connected ? 'Disconnected' : 'Connected'}`,
      description: `${integration?.name} integration has been ${integration?.connected ? 'disabled' : 'enabled'}.`
    });
  };

  const categories = ['all', 'automation', 'productivity', 'analytics', 'communication', 'marketing', 'ecommerce'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const handleZapierConnect = () => {
    if (!zapierWebhook) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive"
      });
      return;
    }

    toggleIntegration('zapier');
    toast({
      title: "Zapier Connected",
      description: "Your webhook has been configured successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Third-Party Integrations</h2>
          <p className="text-muted-foreground">Connect Red Square with your favorite tools</p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="h-4 w-4 mr-1" />
          Integrations
        </Badge>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-1">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="zapier-setup">Zapier Setup</TabsTrigger>
          <TabsTrigger value="custom">Custom Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {integration.icon}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{integration.description}</CardDescription>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {integration.category}
                    </Badge>
                    {integration.connected && (
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zapier-setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Zapier Integration Setup
              </CardTitle>
              <CardDescription>
                Connect Red Square to 5000+ apps through Zapier webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Step 1: Create a Zapier Webhook</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to Zapier and create a new Zap with a "Webhook" trigger. Copy the webhook URL provided.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zapierWebhook">Zapier Webhook URL</Label>
                  <Input
                    id="zapierWebhook"
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Events</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'New Screen Registration',
                      'Booking Created',
                      'Booking Cancelled', 
                      'Payment Completed',
                      'Content Uploaded',
                      'Broadcast Started'
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleZapierConnect} className="w-full">
                  Connect Zapier Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Integration Builder</CardTitle>
              <CardDescription>
                Build custom integrations using our REST API and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">REST API Integration</div>
                    <div className="text-sm text-muted-foreground">
                      Use our comprehensive REST API for custom integrations
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Webhook Integration</div>
                    <div className="text-sm text-muted-foreground">
                      Receive real-time notifications via webhooks
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">SDK Libraries</div>
                    <div className="text-sm text-muted-foreground">
                      Use our official SDKs for popular programming languages
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}