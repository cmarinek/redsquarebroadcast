import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Monitor, 
  Tv, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuildStatus {
  id: string;
  app_type: string;
  platform: string;
  version: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  artifact_url?: string;
}

export const EnhancedBuildManager = () => {
  const [builds, setBuilds] = useState<BuildStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const platformIcons = {
    'android': Smartphone,
    'ios': Smartphone,
    'windows': Monitor,
    'macos': Monitor,
    'linux': Monitor,
    'android-tv': Tv,
    'lg-webos': Tv,
    'samsung-tizen': Tv,
    'roku': Tv,
    'amazon-fire': Tv,
  };

  const statusColors = {
    'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'in_progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'success': 'bg-green-500/10 text-green-600 border-green-500/20',
    'failed': 'bg-red-500/10 text-red-600 border-red-500/20',
    'cancelled': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  const statusIcons = {
    'pending': Clock,
    'in_progress': RefreshCw,
    'success': CheckCircle,
    'failed': AlertCircle,
    'cancelled': AlertCircle,
  };

  useEffect(() => {
    // Mock data for demonstration
    const mockBuilds: BuildStatus[] = [
      {
        id: '1',
        app_type: 'screens',
        platform: 'android-tv',
        version: 'v1.0.0',
        status: 'success',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        artifact_url: '#'
      },
      {
        id: '2',
        app_type: 'redsquare',
        platform: 'android',
        version: 'v2.1.0',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setBuilds(mockBuilds);
    setLoading(false);
  }, []);

  const triggerBuild = async (appType: string, platform: string) => {
    try {
      // In a real implementation, this would call the Supabase function
      toast({
        title: "Build Started",
        description: `${appType} build for ${platform} has been triggered`
      });
      
      // Add mock build to list
      const newBuild: BuildStatus = {
        id: Date.now().toString(),
        app_type: appType,
        platform: platform,
        version: `v${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBuilds(prev => [newBuild, ...prev]);
    } catch (error) {
      console.error('Error triggering build:', error);
      toast({
        title: "Error",
        description: "Failed to trigger build",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Build Management</CardTitle>
          <CardDescription>Loading build statuses...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const screenBuilds = builds.filter(build => build.app_type === 'screens');
  const platformBuilds = builds.filter(build => build.app_type === 'redsquare');

  return (
    <div className="space-y-6">
      {/* Build Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Build Management</span>
          </CardTitle>
          <CardDescription>
            Manage builds for both RedSquare Platform and RedSquare Screens applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* RedSquare Screens Builds */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">RedSquare Screens</h3>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Child App
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['android-tv', 'lg-webos', 'samsung-tizen', 'roku'].map((platform) => {
                  const Icon = platformIcons[platform as keyof typeof platformIcons];
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      onClick={() => triggerBuild('screens', platform)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* RedSquare Platform Builds */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">RedSquare Platform</h3>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Main App
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['android', 'ios', 'windows', 'macos'].map((platform) => {
                  const Icon = platformIcons[platform as keyof typeof platformIcons];
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      onClick={() => triggerBuild('redsquare', platform)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Builds */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Builds</CardTitle>
          <CardDescription>Latest build statuses across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {builds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No builds found. Trigger a build to get started.
              </div>
            ) : (
              builds.map((build) => {
                const Icon = statusIcons[build.status];
                const PlatformIcon = platformIcons[build.platform as keyof typeof platformIcons] || Monitor;
                const isInProgress = build.status === 'in_progress';
                
                return (
                  <div
                    key={build.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <PlatformIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {build.app_type === 'screens' ? 'RedSquare Screens' : 'RedSquare Platform'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {build.platform}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {build.version} • {new Date(build.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isInProgress && (
                        <Progress value={45} className="w-20" />
                      )}
                      <Badge className={statusColors[build.status]}>
                        <Icon className={`w-3 h-3 mr-1 ${isInProgress ? 'animate-spin' : ''}`} />
                        {build.status.replace('_', ' ')}
                      </Badge>
                      {build.artifact_url && build.status === 'success' && (
                        <Button asChild variant="outline" size="sm">
                          <a href={build.artifact_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};