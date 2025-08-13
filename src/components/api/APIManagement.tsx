import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Code, Key, Globe, Shield, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  status: 'active' | 'inactive';
}

export function APIManagement() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'rs_live_abc123...def456',
      permissions: ['read:screens', 'write:bookings'],
      lastUsed: '2024-01-15 14:30:00',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'rs_dev_xyz789...uvw012',
      permissions: ['read:screens'],
      lastUsed: '2024-01-14 09:15:00',
      status: 'active'
    }
  ]);

  const generateNewKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `rs_live_${Math.random().toString(36).substr(2, 20)}...`,
      permissions: ['read:screens'],
      lastUsed: 'Never',
      status: 'active'
    };
    setApiKeys(prev => [...prev, newKey]);
    toast({
      title: "API Key Generated",
      description: "New API key has been created successfully."
    });
  };

  const revokeKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, status: 'inactive' as const } : key
    ));
    toast({
      title: "API Key Revoked",
      description: "The API key has been deactivated."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-muted-foreground">Manage API keys, webhooks, and integrations</p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Code className="h-4 w-4 mr-1" />
          Developer
        </Badge>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access to Red Square
                  </CardDescription>
                </div>
                <Button onClick={generateNewKey}>
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Key: <code className="bg-muted px-2 py-1 rounded">{apiKey.key}</code>
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Last used: {apiKey.lastUsed}
                      </p>
                      <div className="flex gap-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === 'inactive'}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://yourapi.com/webhooks/redsquare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret">Secret Key</Label>
                    <Input
                      id="secret"
                      type="password"
                      placeholder="webhook_secret_key"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'booking.created',
                      'booking.cancelled',
                      'screen.registered',
                      'payment.completed',
                      'content.uploaded',
                      'broadcast.started'
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch />
                        <Label className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button>Save Webhook Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides and examples for integrating with Red Square
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">REST API Reference</div>
                    <div className="text-sm text-muted-foreground">
                      Complete API endpoints and examples
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">SDK Documentation</div>
                    <div className="text-sm text-muted-foreground">
                      Client libraries for popular languages
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-semibold">Webhook Guide</div>
                    <div className="text-sm text-muted-foreground">
                      Setting up real-time notifications
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Rate Limiting
              </CardTitle>
              <CardDescription>
                Configure API rate limits and monitor usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1,000</div>
                    <div className="text-sm text-muted-foreground">Requests/hour</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">10,000</div>
                    <div className="text-sm text-muted-foreground">Requests/day</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">850</div>
                    <div className="text-sm text-muted-foreground">Current usage</div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}