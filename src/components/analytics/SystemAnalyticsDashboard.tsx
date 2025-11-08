import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

interface HealthSample {
  service_name: string;
  status: string;
  response_time_ms: number | null;
  created_at: string;
}

const formatCurrency = (value?: unknown) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    numericValue / 100
  );
};

const formatNumber = (value?: unknown) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return new Intl.NumberFormat().format(numericValue);
};

const formatPercent = (value?: unknown, fractionDigits = 2) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return `${numericValue.toFixed(fractionDigits)}%`;
};

export const SystemAnalyticsDashboard = () => {
  const { data, loading, error, qualityAlerts, refetch } = useDashboardMetrics({ role: "admin" });
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [healthSamples, setHealthSamples] = useState<HealthSample[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      const [{ data: alerts, error: alertsError }, { data: health, error: healthError }] = await Promise.all([
        supabase
          .from("admin_security_alerts")
          .select("id, title, message, severity, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("admin_system_health")
          .select("service_name, status, response_time_ms, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (alertsError || healthError) {
        setAlertsError(alertsError?.message ?? healthError?.message ?? "Unable to load monitoring data");
      } else {
        setSecurityAlerts(alerts ?? []);
        setHealthSamples(health ?? []);
      }
    };

    loadAlerts();
  }, []);

  const summary = data?.summary ?? {};
  const dailySeries = (data?.timeSeries?.daily as Array<Record<string, unknown>>) ?? [];

  const healthByService = useMemo(() => {
    const grouped = new Map<string, { samples: number; avg: number; status: string }>();
    healthSamples.forEach(sample => {
      const current = grouped.get(sample.service_name) ?? { samples: 0, avg: 0, status: sample.status };
      const updatedSamples = current.samples + 1;
      const updatedAvg = ((current.avg * current.samples) + (sample.response_time_ms ?? 0)) / updatedSamples;
      grouped.set(sample.service_name, { samples: updatedSamples, avg: updatedAvg, status: sample.status });
    });
    return Array.from(grouped.entries()).map(([service_name, data]) => ({
      service_name,
      average_response: Math.round(data.avg),
      status: data.status,
    }));
  }, [healthSamples]);

  const metricCards = [
    {
      label: "Total Users",
      value: formatNumber(summary.totalUsers),
    },
    {
      label: "Active Screens",
      value: formatNumber(summary.activeScreens),
    },
    {
      label: "Total Bookings",
      value: formatNumber(summary.totalBookings),
    },
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenueCents),
    },
  ];

  const engagementCards = [
    {
      label: "Daily Active Users",
      value: formatNumber(summary.dailyActiveUsers),
    },
    {
      label: "Weekly Active Users",
      value: formatNumber(summary.weeklyActiveUsers),
    },
    {
      label: "Monthly Active Users",
      value: formatNumber(summary.monthlyActiveUsers),
    },
    {
      label: "Screen Utilization",
      value: formatPercent(summary.screenUtilizationPercent, 1),
    },
  ];

  const revenueCards = [
    {
      label: "Average Session Duration",
      value: `${formatNumber(summary.avgSessionDurationMinutes)} min`,
    },
    {
      label: "Bounce Rate",
      value: formatPercent(summary.bounceRatePercent),
    },
    {
      label: "Conversion Rate",
      value: formatPercent(summary.conversionRatePercent),
    },
    {
      label: "Revenue Growth",
      value: formatPercent(summary.revenueGrowthPercent, 1),
    },
  ];

  const hasSeries = dailySeries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights into system performance and business metrics
          </p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {qualityAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Data quality alerts
            </CardTitle>
            <CardDescription>Investigate open data-quality items impacting KPI accuracy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900">
            {qualityAlerts.map(alert => (
              <div key={alert.check_name} className="flex items-center justify-between gap-3 rounded-md border border-amber-200/60 bg-white/70 p-3">
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">Last checked {new Date(alert.detected_at).toLocaleString()}</p>
                </div>
                <Badge variant={alert.status === "passing" ? "secondary" : "destructive"}>
                  {alert.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="kpis">
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="kpis">Core KPIs</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Efficiency</TabsTrigger>
        </TabsList>
        <TabsContent value="kpis" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`core-${index}`}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))
              : metricCards.map(card => (
                  <Card key={card.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`engagement-${index}`}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))
              : engagementCards.map(card => (
                  <Card key={card.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`revenue-${index}`}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))
              : revenueCards.map(card => (
                  <Card key={card.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>

      {loading ? (
        <Card className="h-72">
          <CardContent className="h-full">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      ) : hasSeries ? (
        <Card>
          <CardHeader>
            <CardTitle>Daily bookings & revenue</CardTitle>
            <CardDescription>Aggregated performance for the selected range.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenueCents" name="Revenue (¢)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No time-series data</CardTitle>
            <CardDescription>We have not recorded any daily aggregates for this timeframe.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent security alerts</CardTitle>
            <CardDescription>Latest platform alerts from the past 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{alertsError}</span>
              </div>
            )}
            {!alertsError && securityAlerts.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>No active security alerts.</span>
              </div>
            )}
            {securityAlerts.map(alert => (
              <div key={alert.id} className="rounded-md border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "default" : "secondary"}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service health</CardTitle>
            <CardDescription>Average response times from the most recent samples.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthByService.length === 0 && !alertsError ? (
              <p className="text-sm text-muted-foreground">No health samples recorded yet.</p>
            ) : (
              healthByService.map(service => (
                <div key={service.service_name} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-xs text-muted-foreground">Status: {service.status}</p>
                  </div>
                  <span className="text-sm font-semibold">{service.average_response} ms</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {error && !loading && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-destructive">Analytics unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
