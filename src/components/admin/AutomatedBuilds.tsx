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

import { useCallback } from 'react';
import { CardDescription } from '@/components/ui/card';

export function AutomatedBuilds() {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuilds = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('app_builds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast.error('Failed to fetch build history.');
      console.error(error);
    } else {
      setBuilds(data as AppBuild[]);
    }
    setIsLoading(false);
  }, []);

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
  }, [fetchBuilds]);

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

  return null; // This component has been removed as its functionality is available in the Build System Verification tab
}
