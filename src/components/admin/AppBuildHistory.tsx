import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AppBuild {
  id: string;
  app_type: 'android_tv' | 'desktop_windows' | 'ios' | 'android_mobile';
  version: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
  triggered_by: string;
  created_at: string;
  updated_at: string;
  logs_url?: string;
  artifact_url?: string;
  commit_hash?: string;
}

const APP_TYPE_LABELS = {
  android_tv: 'Android TV',
  desktop_windows: 'Desktop Windows',
  ios: 'iOS',
  android_mobile: 'Android Mobile'
};

const STATUS_COLORS = {
  pending: 'secondary',
  in_progress: 'default',
  success: 'default',
  failed: 'destructive',
  cancelled: 'secondary'
} as const;

export const AppBuildHistory = () => {
  const { toast } = useToast();
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuilds();
    // Set up real-time subscription for build updates
    const subscription = supabase
      .channel('app_builds_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_builds' },
        () => {
          fetchBuilds();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBuilds(data || []);
    } catch (error) {
      console.error("Error fetching app builds:", error);
      toast({
        title: "Error fetching build history",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadArtifact = async (build: AppBuild) => {
    if (!build.artifact_url) return;

    try {
      const link = document.createElement('a');
      link.href = build.artifact_url;
      link.download = `RedSquare-${build.app_type}-${build.version}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `${APP_TYPE_LABELS[build.app_type]} v${build.version} is downloading.`,
      });
    } catch (error) {
      console.error("Error downloading artifact:", error);
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading build history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Build History</CardTitle>
        <CardDescription>
          Track the status of automated Red Square application builds across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {builds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No builds found. Trigger your first automated build above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {builds.map((build) => (
                <TableRow key={build.id}>
                  <TableCell className="font-medium">
                    {APP_TYPE_LABELS[build.app_type]}
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {build.version}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[build.status]}>
                      {build.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(build.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(build.updated_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {build.logs_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(build.logs_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Logs
                        </Button>
                      )}
                      {build.artifact_url && build.status === 'success' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadArtifact(build)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};