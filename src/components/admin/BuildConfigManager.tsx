import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Save, Plus, Trash2, Copy, Calendar, Settings, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuildConfig {
  id: string;
  name: string;
  platform: string;
  version_strategy: 'auto' | 'manual' | 'semantic';
  build_mode: 'debug' | 'release';
  feature_flags: Record<string, boolean>;
  environment_variables: Record<string, string>;
  post_build_actions: string[];
  notification_channels: string[];
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface BuildTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<BuildConfig>;
  category: 'mobile' | 'web' | 'desktop' | 'tv';
}

const DEFAULT_CONFIG: Partial<BuildConfig> = {
  build_mode: 'release',
  version_strategy: 'auto',
  feature_flags: {},
  environment_variables: {},
  post_build_actions: [],
  notification_channels: ['email'],
  is_active: true
};

const BUILD_TEMPLATES: BuildTemplate[] = [
  {
    id: 'mobile-standard',
    name: 'Standard Mobile Build',
    description: 'Standard configuration for mobile app builds',
    category: 'mobile',
    config: {
      build_mode: 'release',
      version_strategy: 'semantic',
      feature_flags: {
        'analytics': true,
        'crash_reporting': true,
        'beta_features': false
      },
      post_build_actions: ['sign', 'upload_to_store', 'notify_team']
    }
  },
  {
    id: 'tv-optimized',
    name: 'TV Optimized Build',
    description: 'Configuration optimized for TV platforms',
    category: 'tv',
    config: {
      build_mode: 'release',
      version_strategy: 'auto',
      feature_flags: {
        'tv_mode': true,
        'remote_control': true,
        'fullscreen': true,
        'mobile_features': false
      },
      environment_variables: {
        'SCREEN_ORIENTATION': 'landscape',
        'INPUT_METHOD': 'remote'
      }
    }
  },
  {
    id: 'desktop-standard',
    name: 'Standard Desktop Build',
    description: 'Standard configuration for desktop applications',
    category: 'desktop',
    config: {
      build_mode: 'release',
      version_strategy: 'semantic',
      feature_flags: {
        'auto_updater': true,
        'system_tray': true,
        'offline_mode': true
      },
      post_build_actions: ['sign', 'package', 'create_installer']
    }
  }
];

export const BuildConfigManager = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<BuildConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<BuildConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<BuildConfig>>(DEFAULT_CONFIG);

  useEffect(() => {
    fetchBuildConfigs();
  }, []);

  const fetchBuildConfigs = async () => {
    try {
      // For now, we'll use app_settings table to store build configurations
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .like('key', 'build_config_%');

      if (error) throw error;

      const buildConfigs = data?.map(setting => ({
        id: setting.key.replace('build_config_', ''),
        ...(setting.value as Partial<BuildConfig>),
        created_at: setting.updated_at,
        updated_at: setting.updated_at
      })) as BuildConfig[] || [];

      setConfigs(buildConfigs);
    } catch (error) {
      console.error('Error fetching build configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load build configurations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBuildConfig = async () => {
    if (!formData.name || !formData.platform) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const configId = selectedConfig?.id || `config_${Date.now()}`;
      const configData = {
        ...formData,
        id: configId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: `build_config_${configId}`,
          value: configData,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: isEditing ? "Build configuration updated." : "Build configuration created.",
      });

      await fetchBuildConfigs();
      setIsEditing(false);
      setSelectedConfig(null);
      setFormData(DEFAULT_CONFIG);
    } catch (error) {
      console.error('Error saving build configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save build configuration.",
        variant: "destructive"
      });
    }
  };

  const deleteBuildConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this build configuration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('key', `build_config_${configId}`);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Build configuration deleted.",
      });

      await fetchBuildConfigs();
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting build configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete build configuration.",
        variant: "destructive"
      });
    }
  };

  const applyTemplate = (template: BuildTemplate) => {
    setFormData({
      ...DEFAULT_CONFIG,
      ...template.config,
      name: template.name,
      platform: template.category
    });
  };

  const duplicateConfig = (config: BuildConfig) => {
    setFormData({
      ...config,
      name: `${config.name} (Copy)`,
      id: undefined
    });
    setSelectedConfig(null);
    setIsEditing(true);
  };

  const startEditing = (config: BuildConfig) => {
    setSelectedConfig(config);
    setFormData(config);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedConfig(null);
    setFormData(DEFAULT_CONFIG);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading build configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Build Configuration Manager</h2>
          <p className="text-muted-foreground">Manage build configurations and templates</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configurations</CardTitle>
            <CardDescription>{configs.length} configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedConfig?.id === config.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedConfig(config)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{config.name}</h4>
                    <p className="text-sm text-muted-foreground">{config.platform}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {config.build_mode}
                      </Badge>
                      <Badge variant={config.is_active ? 'default' : 'secondary'} className="text-xs">
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(config);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateConfig(config);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBuildConfig(config.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {configs.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No configurations yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Configuration Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isEditing ? (selectedConfig ? 'Edit' : 'New') + ' Configuration' : 'Configuration Details'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Configure build settings, feature flags, and automation'
                : selectedConfig
                ? `Details for ${selectedConfig.name}`
                : 'Select a configuration to view details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedConfig && !isEditing ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a configuration or create a new one</p>
              </div>
            ) : isEditing ? (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="environment">Environment</TabsTrigger>
                  <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Configuration Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Production Android"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value) => setFormData({ ...formData, platform: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="redsquare_android">RedSquare Android</SelectItem>
                          <SelectItem value="redsquare_ios">RedSquare iOS</SelectItem>
                          <SelectItem value="redsquare_web">RedSquare Web</SelectItem>
                          <SelectItem value="screens_android_tv">Screens Android TV</SelectItem>
                          <SelectItem value="screens_windows">Screens Windows</SelectItem>
                          <SelectItem value="screens_macos">Screens macOS</SelectItem>
                          <SelectItem value="screens_linux">Screens Linux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="build_mode">Build Mode</Label>
                      <Select
                        value={formData.build_mode}
                        onValueChange={(value: 'debug' | 'release') => setFormData({ ...formData, build_mode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="release">Release</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version_strategy">Version Strategy</Label>
                      <Select
                        value={formData.version_strategy}
                        onValueChange={(value: 'auto' | 'manual' | 'semantic') => setFormData({ ...formData, version_strategy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="semantic">Semantic Versioning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active Configuration</Label>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div>
                    <Label>Feature Flags</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable or disable features for this build configuration
                    </p>
                    <div className="space-y-3">
                      {Object.entries(formData.feature_flags || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{key}</span>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => {
                              const newFlags = { ...formData.feature_flags };
                              newFlags[key] = checked;
                              setFormData({ ...formData, feature_flags: newFlags });
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const flagName = prompt('Enter feature flag name:');
                          if (flagName) {
                            const newFlags = { ...formData.feature_flags };
                            newFlags[flagName] = false;
                            setFormData({ ...formData, feature_flags: newFlags });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature Flag
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="environment" className="space-y-4">
                  <div>
                    <Label>Environment Variables</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set environment variables for this build
                    </p>
                    <div className="space-y-3">
                      {Object.entries(formData.environment_variables || {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <Input value={key} readOnly />
                          <Input
                            value={value}
                            onChange={(e) => {
                              const newVars = { ...formData.environment_variables };
                              newVars[key] = e.target.value;
                              setFormData({ ...formData, environment_variables: newVars });
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newVars = { ...formData.environment_variables };
                              delete newVars[key];
                              setFormData({ ...formData, environment_variables: newVars });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const varName = prompt('Enter variable name:');
                          if (varName) {
                            const newVars = { ...formData.environment_variables };
                            newVars[varName] = '';
                            setFormData({ ...formData, environment_variables: newVars });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variable
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4">
                  <div>
                    <Label>Post-Build Actions</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Actions to perform after successful build
                    </p>
                    <div className="space-y-2">
                      {(formData.post_build_actions || []).map((action, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={action}
                            onChange={(e) => {
                              const newActions = [...(formData.post_build_actions || [])];
                              newActions[index] = e.target.value;
                              setFormData({ ...formData, post_build_actions: newActions });
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newActions = formData.post_build_actions?.filter((_, i) => i !== index);
                              setFormData({ ...formData, post_build_actions: newActions });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newActions = [...(formData.post_build_actions || []), ''];
                          setFormData({ ...formData, post_build_actions: newActions });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Scheduled Builds</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically trigger builds on a schedule
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.schedule?.enabled || false}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              schedule: {
                                ...formData.schedule,
                                enabled: checked,
                                cron: formData.schedule?.cron || '0 2 * * *',
                                timezone: formData.schedule?.timezone || 'UTC'
                              }
                            });
                          }}
                        />
                        <Label>Enable Scheduled Builds</Label>
                      </div>
                      
                      {formData.schedule?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Cron Expression</Label>
                            <Input
                              value={formData.schedule?.cron || ''}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  schedule: {
                                    ...formData.schedule!,
                                    cron: e.target.value
                                  }
                                });
                              }}
                              placeholder="0 2 * * * (daily at 2 AM)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Input
                              value={formData.schedule?.timezone || ''}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  schedule: {
                                    ...formData.schedule!,
                                    timezone: e.target.value
                                  }
                                });
                              }}
                              placeholder="UTC"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <div className="flex gap-2 mt-6">
                  <Button onClick={saveBuildConfig}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              </Tabs>
            ) : (
              // View mode
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{selectedConfig?.name}</h3>
                    <p className="text-muted-foreground">{selectedConfig?.platform}</p>
                  </div>
                  <Button onClick={() => startEditing(selectedConfig!)}>
                    Edit Configuration
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Build Mode</Label>
                    <p>{selectedConfig?.build_mode}</p>
                  </div>
                  <div>
                    <Label>Version Strategy</Label>
                    <p>{selectedConfig?.version_strategy}</p>
                  </div>
                </div>

                {selectedConfig?.feature_flags && Object.keys(selectedConfig.feature_flags).length > 0 && (
                  <div>
                    <Label>Feature Flags</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {Object.entries(selectedConfig.feature_flags).map(([key, value]) => (
                        <Badge key={key} variant={value ? 'default' : 'secondary'}>
                          {key}: {value ? 'ON' : 'OFF'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Templates Section */}
      {!selectedConfig && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Templates</CardTitle>
            <CardDescription>Quick-start templates for common build configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUILD_TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4" onClick={() => applyTemplate(template)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};