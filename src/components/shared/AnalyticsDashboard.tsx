import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, BarChart3, DollarSign, Download, Eye, Gauge, Target, TrendingUp, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

type AnalyticsRole = 'advertiser' | 'broadcaster' | 'admin';

interface AnalyticsDashboardProps {
  role: AnalyticsRole;
  userId: string;
  campaignId?: string;
}

const formatCurrency = (value?: unknown) => {
  if (value === null || value === undefined) return '—';
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numericValue / 100);
};

const formatPercent = (value?: unknown, fractionDigits = 2) => {
  if (value === null || value === undefined) return '—';
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return `${numericValue.toFixed(fractionDigits)}%`;
};

const formatNumber = (value?: unknown) => {
  if (value === null || value === undefined) return '—';
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return new Intl.NumberFormat().format(numericValue);
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ role, userId, campaignId }) => {
  const { data, loading, error, qualityAlerts, refetch } = useDashboardMetrics({ role, userId, campaignId });

  const summary = data?.summary ?? {};
  const dailySeries = (data?.timeSeries?.daily as Array<Record<string, unknown>>) ?? [];

  const metricCards = useMemo(() => {
    switch (role) {
      case 'advertiser':
        return [
          {
            label: 'Total Impressions',
            value: formatNumber(summary.impressions),
            icon: Eye,
          },
          {
            label: 'Click-Through Rate',
            value: formatPercent(summary.averageCtrPercent),
            icon: Target,
          },
          {
            label: 'Conversions',
            value: formatNumber(summary.conversions),
            icon: TrendingUp,
          },
          {
            label: 'Total Spend',
            value: formatCurrency(summary.totalSpendCents),
            icon: BarChart3,
          },
        ];
      case 'broadcaster':
        return [
          {
            label: 'Total Views',
            value: formatNumber(summary.totalViews),
            icon: Eye,
          },
          {
            label: 'Occupancy Rate',
            value: formatPercent(summary.occupancyRatePercent, 1),
            icon: Gauge,
          },
          {
            label: 'Owner Revenue',
            value: formatCurrency(summary.ownerRevenueCents),
            icon: DollarSign,
          },
          {
            label: 'Average Engagement',
            value: formatPercent(summary.averageEngagementPercent),
            icon: Users,
          },
        ];
      case 'admin':
        return [
          {
            label: 'Total Users',
            value: formatNumber(summary.totalUsers),
            icon: Users,
          },
          {
            label: 'Active Screens',
            value: formatNumber(summary.activeScreens),
            icon: Gauge,
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenueCents),
            icon: BarChart3,
          },
          {
            label: 'Conversion Rate',
            value: formatPercent(summary.conversionRatePercent),
            icon: Target,
          },
        ];
      default:
        return [];
    }
  }, [role, summary]);

  const hasData = metricCards.some(card => card.value !== '—') || dailySeries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            {role === 'advertiser' && 'Deep insights into your advertising performance'}
            {role === 'broadcaster' && 'Deep insights into your screen performance'}
            {role === 'admin' && 'Platform-wide analytics overview'}
          </p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Refreshing…' : 'Export Report'}
        </Button>
      </div>

      {qualityAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Data quality alerts
            </CardTitle>
            <CardDescription>Investigate recent checks that may impact KPI accuracy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900">
            {qualityAlerts.map(alert => (
              <div key={alert.check_name} className="flex items-center justify-between gap-3 rounded-md border border-amber-200/60 bg-white/70 p-3">
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">Last checked {new Date(alert.detected_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-semibold ${alert.status === 'passing' ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {alert.status.toUpperCase()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2 space-y-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </CardContent>
              </Card>
            ))
          : metricCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={`${card.label}-${idx}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {loading ? (
        <Card className="h-72">
          <CardContent className="h-full">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      ) : hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>Daily performance</CardTitle>
            <CardDescription>Bookings, revenue, and reach over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#1d4ed8" yAxisId="left" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="views" name="Views" stroke="#9333ea" yAxisId="left" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revenueCents" name="Revenue (¢)" stroke="#047857" yAxisId="right" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No analytics yet</CardTitle>
            <CardDescription>
              We haven't collected analytics for this selection. Adjust your filters or ensure data sources are connected.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
