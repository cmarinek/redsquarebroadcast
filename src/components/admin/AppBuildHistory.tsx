import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ExternalLink, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AppBuild {
  id: string;
  app_type: 'redsquare_android' | 'redsquare_ios' | 'redsquare_web' | 'screens_android_tv' | 'screens_android_mobile' | 'screens_ios' | 'screens_windows' | 'screens_macos' | 'screens_linux' | 'screens_amazon_fire' | 'screens_roku' | 'screens_samsung_tizen' | 'screens_lg_webos';
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
  // RedSquare App (main user management app)
  redsquare_android: 'RedSquare Android',
  redsquare_ios: 'RedSquare iOS',
  redsquare_web: 'RedSquare Web',
  // RedSquare Screens (content display app)
  screens_android_tv: 'Screens Android TV',
  screens_android_mobile: 'Screens Android Mobile',
  screens_ios: 'Screens iOS',
  screens_windows: 'Screens Windows',
  screens_macos: 'Screens macOS',
  screens_linux: 'Screens Linux',
  // RedSquare Screens (streaming platforms)
  screens_amazon_fire: 'Screens Amazon Fire TV',
  screens_roku: 'Screens Roku',
  screens_samsung_tizen: 'Screens Samsung Tizen',
  screens_lg_webos: 'Screens LG webOS'
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBuilds();
    // Set up real-time subscription for build updates
    const subscription = supabase
      .channel('app_builds_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_builds' },
        (payload) => {
          console.log('Build update received:', payload);
          fetchBuilds(); // Refresh the builds list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentPage]);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // First get the total count
      const { count } = await supabase
        .from('app_builds')
        .select('*', { count: 'exact', head: true });

      // Then get the paginated data
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setBuilds((data || []) as AppBuild[]);
      setTotalCount(count || 0);
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading build history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Build History</CardTitle>
        <CardDescription>
          Track the status of automated Red Square application builds across all platforms.
          {totalCount > 0 && ` Showing ${builds.length} of ${totalCount} builds.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {builds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No builds found. Trigger your first automated build above.
          </p>
        ) : (
          <>
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
            
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>1</PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                      </>
                    )}
                    
                    {renderPaginationItems()}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}>{totalPages}</PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};