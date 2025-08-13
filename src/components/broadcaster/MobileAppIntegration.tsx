import { useState, useEffect } from "react";
import { Smartphone, Bell, Wifi, Upload, Eye, Settings, Download, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

interface MobileFeature {
  id: string;
  feature_type: 'push_notifications' | 'offline_mode' | 'quick_upload' | 'live_monitoring';
  is_enabled: boolean;
  settings: Record<string, any>;
}

const MobileAppIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<MobileFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Mobile app download info
  const appStoreUrl = "https://apps.apple.com/app/redsquare-digital-advertising";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.redsquare.broadcaster";
  const appDownloadUrl = `${window.location.origin}/mobile-app`;

  useEffect(() => {
    if (user) {
      fetchMobileFeatures();
    }
  }, [user]);

  const fetchMobileFeatures = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mobile_features')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Ensure all features exist with defaults
      const defaultFeatures: Omit<MobileFeature, 'id'>[] = [
        {
          feature_type: 'push_notifications',
          is_enabled: true,
          settings: {
            booking_confirmations: true,
            campaign_alerts: true,
            system_notifications: false,
            marketing_updates: false
          }
        },
        {
          feature_type: 'offline_mode',
          is_enabled: false,
          settings: {
            cache_duration_hours: 24,
            auto_sync: true
          }
        },
        {
          feature_type: 'quick_upload',
          is_enabled: true,
          settings: {
            max_file_size_mb: 50,
            auto_compress: true,
            upload_quality: 'high'
          }
        },
        {
          feature_type: 'live_monitoring',
          is_enabled: true,
          settings: {
            real_time_alerts: true,
            performance_tracking: true,
            screen_health_monitoring: true
          }
        }
      ];

      const existingTypes = (data || []).map(f => f.feature_type);
      const missingFeatures = defaultFeatures.filter(f => !existingTypes.includes(f.feature_type));

      // Insert missing features
      if (missingFeatures.length > 0) {
        const { error: insertError } = await supabase
          .from('mobile_features')
          .insert(missingFeatures.map(f => ({ ...f, user_id: user.id })));

        if (insertError) throw insertError;

        // Refetch to get complete data with IDs
        const { data: completeData, error: refetchError } = await supabase
          .from('mobile_features')
          .select('*')
          .eq('user_id', user.id);

        if (refetchError) throw refetchError;
        setFeatures(completeData || []);
      } else {
        setFeatures(data || []);
      }
    } catch (error) {
      console.error('Error fetching mobile features:', error);
      toast({
        title: "Error loading mobile features",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = async (featureType: string, isEnabled: boolean, newSettings?: Record<string, any>) => {
    if (!user) return;

    setUpdating(featureType);
    try {
      const updateData: any = { is_enabled: isEnabled };
      if (newSettings) {
        updateData.settings = newSettings;
      }

      const { error } = await supabase
        .from('mobile_features')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('feature_type', featureType);

      if (error) throw error;

      // Update local state
      setFeatures(prev => prev.map(f => 
        f.feature_type === featureType 
          ? { ...f, is_enabled: isEnabled, ...(newSettings && { settings: newSettings }) }
          : f
      ));

      toast({
        title: "Settings updated",
        description: `${featureType.replace('_', ' ')} has been ${isEnabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error updating settings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getFeature = (type: string) => features.find(f => f.feature_type === type);

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'push_notifications':
        return <Bell className="h-5 w-5" />;
      case 'offline_mode':
        return <Wifi className="h-5 w-5" />;
      case 'quick_upload':
        return <Upload className="h-5 w-5" />;
      case 'live_monitoring':
        return <Eye className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getFeatureDescription = (type: string) => {
    switch (type) {
      case 'push_notifications':
        return 'Receive real-time alerts and updates on your mobile device';
      case 'offline_mode':
        return 'Access your content and basic features without internet connection';
      case 'quick_upload':
        return 'Fast content upload directly from your mobile device';
      case 'live_monitoring':
        return 'Monitor your campaigns and screen performance in real-time';
      default:
        return 'Mobile feature configuration';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile App Integration
              </CardTitle>
              <CardDescription>
                Manage your Red Square campaigns on the go with our mobile app
              </CardDescription>
            </div>
            <Badge variant="secondary">Mobile Ready</Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="download">App Download</TabsTrigger>
          <TabsTrigger value="features">Mobile Features</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* App Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Download Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Red Square Mobile
                </CardTitle>
                <CardDescription>
                  Get the full Red Square experience on your mobile device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">GP</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Google Play Store</div>
                          <div className="text-xs text-muted-foreground">Android 8.0+</div>
                        </div>
                      </div>
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AS</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Apple App Store</div>
                          <div className="text-xs text-muted-foreground">iOS 14.0+</div>
                        </div>
                      </div>
                    </a>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Features included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Campaign management on the go</li>
                    <li>• Real-time performance monitoring</li>
                    <li>• Quick content upload from camera roll</li>
                    <li>• Push notifications for important updates</li>
                    <li>• Offline mode for basic functionality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Quick Download
                </CardTitle>
                <CardDescription>
                  Scan this QR code with your mobile device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <QRCode
                      size={160}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      value={appDownloadUrl}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan to get download links sent to your device
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mobile Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-4">
            {['push_notifications', 'offline_mode', 'quick_upload', 'live_monitoring'].map((featureType) => {
              const feature = getFeature(featureType);
              const isEnabled = feature?.is_enabled || false;
              
              return (
                <Card key={featureType}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFeatureIcon(featureType)}
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {featureType.replace('_', ' ')}
                          </CardTitle>
                          <CardDescription>
                            {getFeatureDescription(featureType)}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateFeature(featureType, checked)}
                        disabled={updating === featureType}
                      />
                    </div>
                  </CardHeader>
                  
                  {isEnabled && feature?.settings && (
                    <CardContent className="pt-0">
                      <div className="grid gap-3 text-sm">
                        {Object.entries(feature.settings).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-muted-foreground capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="font-medium">
                              {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Settings</CardTitle>
              <CardDescription>
                Configure your mobile app preferences and synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Push Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Push Notification Preferences</h4>
                <div className="space-y-3">
                  {[
                    { key: 'booking_confirmations', label: 'Booking Confirmations' },
                    { key: 'campaign_alerts', label: 'Campaign Performance Alerts' },
                    { key: 'system_notifications', label: 'System Updates' },
                    { key: 'marketing_updates', label: 'Marketing Updates' }
                  ].map(({ key, label }) => {
                    const notificationFeature = getFeature('push_notifications');
                    const isEnabled = notificationFeature?.settings?.[key] || false;
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-sm font-normal">
                          {label}
                        </Label>
                        <Switch
                          id={key}
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            const currentSettings = notificationFeature?.settings || {};
                            updateFeature('push_notifications', true, {
                              ...currentSettings,
                              [key]: checked
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sync Settings */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium">Synchronization</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Auto-sync when opening app</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Background sync</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">WiFi only for large files</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium">App Information</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">Dec 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">24.5 MB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAppIntegration;