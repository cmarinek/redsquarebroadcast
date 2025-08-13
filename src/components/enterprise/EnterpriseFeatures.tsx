import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Building2, Users, Shield, Zap, Globe, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function EnterpriseFeatures() {
  const { toast } = useToast();
  const [whiteLabel, setWhiteLabel] = useState({
    enabled: false,
    brandName: "",
    customDomain: "",
    logoUrl: ""
  });

  const handleSaveWhiteLabel = () => {
    toast({
      title: "White Label Settings Updated",
      description: "Your branding configuration has been saved successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enterprise Features</h2>
          <p className="text-muted-foreground">Advanced capabilities for enterprise clients</p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Building2 className="h-4 w-4 mr-1" />
          Enterprise
        </Badge>
      </div>

      <Tabs defaultValue="white-label" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="white-label">White Label</TabsTrigger>
          <TabsTrigger value="sso">SSO Integration</TabsTrigger>
          <TabsTrigger value="bulk-management">Bulk Management</TabsTrigger>
          <TabsTrigger value="custom-workflows">Custom Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="white-label" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                White Label Configuration
              </CardTitle>
              <CardDescription>
                Customize the platform with your own branding and domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={whiteLabel.enabled}
                  onCheckedChange={(checked) => 
                    setWhiteLabel(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label>Enable White Label Features</Label>
              </div>
              
              {whiteLabel.enabled && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand Name</Label>
                      <Input
                        id="brandName"
                        value={whiteLabel.brandName}
                        onChange={(e) => 
                          setWhiteLabel(prev => ({ ...prev, brandName: e.target.value }))
                        }
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customDomain">Custom Domain</Label>
                      <Input
                        id="customDomain"
                        value={whiteLabel.customDomain}
                        onChange={(e) => 
                          setWhiteLabel(prev => ({ ...prev, customDomain: e.target.value }))
                        }
                        placeholder="screens.yourcompany.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={whiteLabel.logoUrl}
                      onChange={(e) => 
                        setWhiteLabel(prev => ({ ...prev, logoUrl: e.target.value }))
                      }
                      placeholder="https://yourcompany.com/logo.png"
                    />
                  </div>
                  <Button onClick={handleSaveWhiteLabel}>
                    Save White Label Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Single Sign-On Integration
              </CardTitle>
              <CardDescription>
                Configure SAML, OIDC, and other enterprise authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">SAML 2.0</h4>
                      <p className="text-sm text-muted-foreground">Enterprise SAML integration</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">OpenID Connect</h4>
                      <p className="text-sm text-muted-foreground">Modern OAuth 2.0 authentication</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Active Directory</h4>
                      <p className="text-sm text-muted-foreground">Microsoft AD integration</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Management Tools
              </CardTitle>
              <CardDescription>
                Manage multiple screens, campaigns, and users at scale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button className="justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Bulk Screen Deployment
                </Button>
                <Button className="justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Mass User Import/Export
                </Button>
                <Button className="justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Batch Configuration Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Workflow Builder</CardTitle>
              <CardDescription>
                Create custom approval and content workflows for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Workflow builder coming soon</p>
                <Button variant="outline" className="mt-4">
                  Request Custom Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}