import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Download, 
  Bell, 
  RefreshCw, 
  Target,
  BarChart3,
  Settings,
  QrCode,
  ExternalLink,
  Globe,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "react-qr-code";

interface MobileFeature {
  id: string;
  feature_type: string;
  is_enabled: boolean;
  settings: Record<string, any>;
}

const MobileAppIntegration = () => {
  const [features, setFeatures] = useState<MobileFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // App store URLs
  const appStoreUrl = "https://apps.apple.com/app/redsquare-advertiser/id123456789";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.redsquare.advertiser";
  const downloadUrl = "https://redsquare.app/download";

  useEffect(() => {
    if (user) {
      fetchMobileFeatures();
    }
  }, [user]);

  const fetchMobileFeatures = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mobile_features')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // If no features exist, create default ones
      if (!data || data.length === 0) {
        const defaultFeatures = [
          {
            user_id: user.id,
            feature_type: 'push_notifications',
            is_enabled: true,
            settings: {
              campaign_updates: true,
              performance_alerts: true,
              booking_confirmations: true
            }
          },
          {
            user_id: user.id,
            feature_type: 'sync_preferences',
            is_enabled: true,
            settings: {
              auto_sync: true,
              sync_interval: '15min',
              offline_mode: true
            }
          },
          {
            user_id: user.id,
            feature_type: 'analytics_mobile',
            is_enabled: true,
            settings: {
              real_time_metrics: true,
              weekly_reports: true,
              custom_dashboards: false
            }
          },
          {
            user_id: user.id,
            feature_type: 'quick_actions',
            is_enabled: true,
            settings: {
              quick_booking: true,
              campaign_pause: true,
              budget_alerts: true
            }
          }
        ];

        const { data: newFeatures, error: insertError } = await supabase
          .from('mobile_features')
          .insert(defaultFeatures)
          .select();

        if (insertError) throw insertError;
        setFeatures(newFeatures || []);
      } else {
        setFeatures(data);
      }
    } catch (error) {
      console.error('Error fetching mobile features:', error);
      toast({
        title: "Error",
        description: "Failed to load mobile app settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = async (featureId: string, updates: Partial<MobileFeature>) => {
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('mobile_features')
        .update(updates)
        .eq('id', featureId);

      if (error) throw error;

      setFeatures(features.map(feature => 
        feature.id === featureId 
          ? { ...feature, ...updates }
          : feature
      ));

      toast({
        title: "Settings Updated",
        description: "Mobile app feature settings have been saved"
      });
    } catch (error) {
      console.error('Error updating mobile feature:', error);
      toast({
        title: "Error",
        description: "Failed to update mobile app settings",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getFeature = (type: string) => {
    return features.find(f => f.feature_type === type);
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'push_notifications': return Bell;
      case 'sync_preferences': return RefreshCw;
      case 'analytics_mobile': return BarChart3;
      case 'quick_actions': return Zap;
      default: return Settings;
    }
  };

  const getFeatureDescription = (type: string) => {
    switch (type) {
      case 'push_notifications': return 'Receive real-time updates about your campaigns';
      case 'sync_preferences': return 'Keep your data synchronized across devices';
      case 'analytics_mobile': return 'Access detailed analytics on your mobile device';
      case 'quick_actions': return 'Perform quick actions directly from the app';
      default: return 'Mobile app feature';
    }
  };

  if (loading) return <div>Loading mobile app settings...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Mobile App Integration</span>
          </CardTitle>
          <CardDescription>
            Manage your mobile app features and download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="download" className="space-y-4">
            <TabsList>
              <TabsTrigger value="download">App Download</TabsTrigger>
              <TabsTrigger value="features">Mobile Features</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="download" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Download Red Square Advertiser</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your advertising campaigns on the go with our mobile app
                      </p>
                      
                      <div className="flex flex-col space-y-3">
                        <Button asChild>
                          <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            App Store
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                        
                        <Button variant="outline" asChild>
                          <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Google Play
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                        
                        <Button variant="ghost" asChild>
                          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Web App
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <QrCode className="h-8 w-8 mx-auto text-muted-foreground" />
                      <h3 className="font-semibold">Quick Download</h3>
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code to download the app directly
                      </p>
                      
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg">
                          <QRCode
                            size={150}
                            value={downloadUrl}
                            viewBox="0 0 256 256"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = getFeatureIcon(feature.feature_type);
                  return (
                    <Card key={feature.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium capitalize">
                                {feature.feature_type.replace('_', ' ')}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {getFeatureDescription(feature.feature_type)}
                              </p>
                              
                              {feature.is_enabled && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <strong>Current settings:</strong>
                                  <ul className="list-disc pl-4 mt-1">
                                    {Object.entries(feature.settings).map(([key, value]) => (
                                      <li key={key}>
                                        {key.replace('_', ' ')}: {String(value)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={feature.is_enabled}
                              onCheckedChange={(enabled) => 
                                updateFeature(feature.id, { is_enabled: enabled })
                              }
                              disabled={updating}
                            />
                            <Badge variant={feature.is_enabled ? "default" : "secondary"}>
                              {feature.is_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Push Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure what notifications you want to receive on your mobile device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFeature('push_notifications')?.settings && (
                      Object.entries(getFeature('push_notifications')!.settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">
                            {key.replace('_', ' ')}
                          </Label>
                          <Switch
                            id={key}
                            checked={Boolean(value)}
                            onCheckedChange={(checked) => {
                              const feature = getFeature('push_notifications')!;
                              updateFeature(feature.id, {
                                settings: {
                                  ...feature.settings,
                                  [key]: checked
                                }
                              });
                            }}
                            disabled={updating}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Settings</CardTitle>
                  <CardDescription>
                    Control how your data syncs between devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFeature('sync_preferences')?.settings && (
                      Object.entries(getFeature('sync_preferences')!.settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">
                            {key.replace('_', ' ')}
                          </Label>
                          <Switch
                            id={key}
                            checked={Boolean(value)}
                            onCheckedChange={(checked) => {
                              const feature = getFeature('sync_preferences')!;
                              updateFeature(feature.id, {
                                settings: {
                                  ...feature.settings,
                                  [key]: checked
                                }
                              });
                            }}
                            disabled={updating}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>App Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>45.2 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compatibility:</span>
                      <span>iOS 14.0+, Android 8.0+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAppIntegration;