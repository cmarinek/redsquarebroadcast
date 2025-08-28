import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

type AppBuild = {
  id: string;
  created_at: string;
  app_type: string;
  version: string | null;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
  artifact_url: string | null;
  logs_url: string | null;
  commit_hash: string | null;
};

export function AutomatedBuilds() {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringBuild, setIsTriggeringBuild] = useState(false);

  useEffect(() => {
    fetchBuilds();
    const channel = supabase
      .channel('app-builds-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_builds' }, () => {
        fetchBuilds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBuilds = async () => {
    const { data, error } = await supabase
      .from('app_builds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch build history.');
      console.error(error);
    } else {
      setBuilds(data as AppBuild[]);
    }
    setIsLoading(false);
  };

  const handleTriggerBuild = async (app_type: 'android_tv' | 'desktop_windows') => {
    setIsTriggeringBuild(true);
    toast.info(`Triggering new ${app_type.replace('_', ' ')} build...`);
    const { error } = await supabase.functions.invoke('trigger-app-build', {
      body: { app_type },
    });
    if (error) {
      toast.error(`Failed to trigger build: ${error.message}`);
    } else {
      toast.success('New build successfully triggered!');
    }
    setIsTriggeringBuild(false);
  };

  const getStatusBadge = (status: AppBuild['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500 text-white">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="text-blue-500 border-blue-500">In Progress</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-yellow-400 text-white">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automated Application Builds</CardTitle>
        <div className="flex gap-2">
            <Button onClick={() => handleTriggerBuild('android_tv')} disabled={isTriggeringBuild}>
              {isTriggeringBuild ? 'Starting...' : 'Start Android TV Build'}
            </Button>
            <Button onClick={() => handleTriggerBuild('desktop_windows')} disabled={isTriggeringBuild} variant="outline">
              {isTriggeringBuild ? 'Starting...' : 'Start Desktop Build'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>App Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Commit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading builds...</TableCell></TableRow>
            ) : builds.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">No builds have been run yet.</TableCell></TableRow>
            ) : (
              builds.map((build) => (
                <TableRow key={build.id}>
                  <TableCell>{format(new Date(build.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>{build.app_type}</TableCell>
                  <TableCell>{build.version || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(build.status)}</TableCell>
                  <TableCell><code className="text-xs">{build.commit_hash?.slice(0, 7) || 'N/A'}</code></TableCell>
                  <TableCell className="space-x-2">
                    {build.artifact_url && build.status === 'success' && (
                      <Button asChild variant="outline" size="sm">
                        <a href={build.artifact_url} target="_blank" rel="noopener noreferrer">Download</a>
                      </Button>
                    )}
                    {build.logs_url && (
                       <Button asChild variant="ghost" size="sm">
                        <a href={build.logs_url} target="_blank" rel="noopener noreferrer">Logs</a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
