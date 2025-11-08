import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DashboardRole = "admin" | "advertiser" | "broadcaster" | "public";

export interface DashboardMetricsSummary {
  [key: string]: unknown;
}

export interface DashboardTimeSeries {
  [key: string]: unknown;
}

export interface DashboardMetricsResponse {
  summary: DashboardMetricsSummary;
  timeSeries: DashboardTimeSeries;
}

export interface DataQualityAlert {
  check_name: string;
  status: "passing" | "failing";
  message: string;
  details?: Record<string, unknown>;
  detected_at: string;
  resolved_at?: string | null;
}

interface UseDashboardMetricsOptions {
  role: DashboardRole;
  userId?: string;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
  skipToast?: boolean;
}

interface UseDashboardMetricsState {
  data: DashboardMetricsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  qualityAlerts: DataQualityAlert[];
}

const buildRequestBody = (options: UseDashboardMetricsOptions) => ({
  role: options.role,
  userId: options.userId,
  campaignId: options.campaignId,
  startDate: options.startDate,
  endDate: options.endDate,
});

export const useDashboardMetrics = (options: UseDashboardMetricsOptions): UseDashboardMetricsState => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityAlerts, setQualityAlerts] = useState<DataQualityAlert[]>([]);

  const fetchQualityAlerts = useCallback(async () => {
    // Data quality alerts feature not yet implemented in database
    setQualityAlerts([]);
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: response, error: rpcError } = await supabase.functions.invoke("get-analytics-data", {
        body: buildRequestBody(options),
      });

      if (rpcError) {
        throw rpcError;
      }

      const payload: DashboardMetricsResponse = {
        summary: response?.summary ?? {},
        timeSeries: response?.timeSeries ?? {},
      };

      setData(payload);
      await fetchQualityAlerts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load dashboard metrics.";
      setError(message);
      if (!options.skipToast) {
        toast({
          title: "Analytics unavailable",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [fetchQualityAlerts, options, toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  return useMemo(() => ({
    data,
    loading,
    error,
    refetch,
    qualityAlerts,
  }), [data, loading, error, refetch, qualityAlerts]);
};
