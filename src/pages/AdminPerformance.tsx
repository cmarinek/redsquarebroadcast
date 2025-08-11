import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface FrontendMetricRow {
  created_at: string;
  metric_name: string;
  value: number;
  path: string | null;
  navigation_type: string | null;
}

interface PerfEntry {
  id: string;
  created_at: string;
  status: string;
  duration_ms: number;
  details: Record<string, any>;
}

interface FrontendError {
  id: string;
  created_at: string;
  message: string;
  path: string | null;
  user_agent: string | null;
}

const METRICS = ['LCP', 'FID', 'CLS', 'INP', 'FCP', 'TTFB'] as const;

type Timeframe = '24h' | '7d';

export default function AdminPerformance() {
  const [metric, setMetric] = useState<(typeof METRICS)[number]>('LCP');
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [tests, setTests] = useState<PerfEntry[]>([]);
  const [errors, setErrors] = useState<FrontendError[]>([]);
  const [paths, setPaths] = useState<string[]>(['All']);
  const [selectedPath, setSelectedPath] = useState<string>('All');
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [lastAlertSummary, setLastAlertSummary] = useState<any | null>(null);
  const [autoCheck, setAutoCheck] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Performance Dashboard | RedSquare';
    const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Admin performance dashboard with web vitals and load testing for RedSquare.');
    document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.href);
    document.head.appendChild(canonical);
  }, []);

const loadData = async () => {
  setLoading(true);
  try {
    const since = new Date();
    if (timeframe === '24h') since.setDate(since.getDate() - 1);
    else since.setDate(since.getDate() - 7);

    const { data, error } = await supabase
      .from('frontend_metrics')
      .select('created_at, metric_name, value, path, navigation_type')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    const filtered = (data || []).filter((d: any) => d.metric_name === metric);

    // Build path list (top 10 by frequency)
    const pathCounts = new Map<string, number>();
    for (const r of filtered) {
      const p = r.path || 'unknown';
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
    }
    const topPaths = Array.from(pathCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([p]) => p);
    setPaths(['All', ...topPaths]);

    const bucketFmt = timeframe === '24h' ? 'HH:mm' : 'MM-dd HH:00';
    type BucketVal = { time: string; avg: number; p50: number; p95: number; count: number };
    const byBucket = new Map<string, number[]>();

    for (const d of filtered) {
      if (selectedPath !== 'All' && (d.path || 'unknown') !== selectedPath) continue;
      const key = format(new Date(d.created_at), bucketFmt);
      const list = byBucket.get(key) || [];
      list.push(Number(d.value || 0));
      byBucket.set(key, list);
    }

    const points: BucketVal[] = [];
    for (const [timeKey, values] of byBucket.entries()) {
      const sorted = values.slice().sort((a, b) => a - b);
      const count = sorted.length;
      const avg = sorted.reduce((a, n) => a + n, 0) / Math.max(1, count);
      const p50 = sorted.length ? sorted[Math.floor(0.5 * (sorted.length - 1))] : 0;
      const p95 = sorted.length ? sorted[Math.floor(0.95 * (sorted.length - 1))] : 0;
      points.push({ time: timeKey, avg, p50, p95, count });
    }

    // Sort by time label
    points.sort((a, b) => a.time.localeCompare(b.time));
    setSeries(points);

    const lt = await supabase.functions.invoke('load-test', { body: { action: 'summary' } });
    setTests((lt.data?.data as any[]) || []);

    const { data: errs } = await supabase
      .from('frontend_errors')
      .select('id, created_at, message, path, user_agent')
      .order('created_at', { ascending: false })
      .limit(10);
    setErrors((errs as any[]) || []);
  } catch (e: any) {
    console.error('load perf data error', e);
    toast.error('Failed to load performance data');
  } finally {
    setLoading(false);
  }
};

const runLoadTest = async () => {
  try {
    toast.info('Running load test...');
    const res = await supabase.functions.invoke('load-test', { body: { action: 'run' } });
    if (res.error) throw res.error;
    toast.success(`Load test: ${res.data?.status} in ${res.data?.duration_ms}ms`);
    const lt = await supabase.functions.invoke('load-test', { body: { action: 'summary' } });
    setTests((lt.data?.data as any[]) || []);
  } catch (e: any) {
    console.error('load test error', e);
    toast.error('Load test failed');
  }
};

const checkAlerts = async () => {
  try {
    toast.info('Checking alerts...');
    const to = (recipientEmail || user?.email || '').trim();
    const res = await supabase.functions.invoke('perf-alerts', { body: { to: to || undefined } });
    if (res.error) throw res.error;
    const breaches = (res.data?.breaches as any[]) || [];
    setLastAlertSummary(res.data?.summary || null);
    if (breaches.length > 0) toast.warning(`${breaches.length} alert(s): ${breaches.join('; ')}`);
    else toast.success('No alert thresholds breached');
  } catch (e: any) {
    console.error('alerts error', e);
    toast.error('Alerts check failed');
  }
};

  const purgeTelemetry = async () => {
    try {
      toast.info('Purging telemetry older than 30 days...');
      const [a, b] = await Promise.all([
        supabase.rpc('purge_frontend_metrics', { days_old: 30 }),
        supabase.rpc('purge_performance_metrics', { days_old: 30 }),
      ]);
      const purged = (a.data as number || 0) + (b.data as number || 0);
      toast.success(`Purged ${purged} rows`);
      loadData();
    } catch (e: any) {
      console.error('purge error', e);
      toast.error('Purge failed');
    }
  };

  useEffect(() => { loadData(); }, [metric, timeframe, selectedPath]);

  useEffect(() => {
    const local = localStorage.getItem('perf_alert_recipient');
    setRecipientEmail(local || user?.email || '');
  }, [user?.email]);

  useEffect(() => {
    let id: any;
    if (autoCheck) {
      id = setInterval(() => { checkAlerts(); }, 60 * 60 * 1000); // hourly
    }
    return () => { if (id) clearInterval(id); };
  }, [autoCheck, recipientEmail]);


  const latest = useMemo(() => tests.slice(0, 5), [tests]);

  return (
    <>
      <Navigation />
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor Web Vitals and backend performance.</p>
        </header>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card className="lg:col-span-2">
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-lg">Web Vitals Trend ({metric})</CardTitle>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Metric" /></SelectTrigger>
          <SelectContent>
            {METRICS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPath} onValueChange={(v) => setSelectedPath(v)}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Path" /></SelectTrigger>
          <SelectContent>
            {paths.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={loadData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
      </div>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avg" name="Avg" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="p50" name="p50" stroke="hsl(var(--muted-foreground))" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="p95" name="p95" stroke="hsl(var(--secondary-foreground))" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Synthetic Load Tests & Alerts</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Alert recipient email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              localStorage.setItem('perf_alert_recipient', recipientEmail.trim());
              toast.success('Recipient saved');
            }}
          >
            Save
          </Button>
          <Button
            variant={autoCheck ? 'secondary' : 'outline'}
            onClick={() => setAutoCheck((v) => !v)}
          >
            {autoCheck ? 'Auto-check ON' : 'Auto-check OFF'}
          </Button>
        </div>
        {lastAlertSummary && (
          <div className="text-sm text-muted-foreground">
            <div>p95 LCP: {lastAlertSummary?.lcp?.p95 ?? '—'} ms | p95 INP: {lastAlertSummary?.inp?.p95 ?? '—'} ms</div>
            <div>CLS p95: {lastAlertSummary?.cls?.p95 ?? '—'} | Avg load test: {lastAlertSummary?.load_test?.avg_ms ?? '—'} ms</div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button onClick={runLoadTest}>Run Load Test</Button>
          <Button variant="outline" onClick={purgeTelemetry}>Purge Telemetry (30d+)</Button>
          <Button variant="secondary" onClick={checkAlerts}>Check Alerts</Button>
        </div>
      </div>
      <div className="space-y-3">
        {latest.map((t) => (
          <div key={t.id} className="p-3 rounded-md border border-border">
            <div className="flex items-center justify-between">
              <div className="font-medium">{format(new Date(t.created_at), 'MMM d, HH:mm')}</div>
              <div className={`text-sm ${t.status === 'ok' ? 'text-emerald-600' : 'text-yellow-600'}`}>{t.status.toUpperCase()}</div>
            </div>
            <div className="text-sm text-muted-foreground">Total: {t.duration_ms} ms</div>
          </div>
        ))}
        {latest.length === 0 && <div className="text-sm text-muted-foreground">No tests yet.</div>}
      </div>
    </CardContent>
  </Card>
</div>

<div className="mt-4 grid grid-cols-1">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Recent Frontend Errors</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {errors.map((e) => (
          <div key={e.id} className="p-3 rounded-md border border-border">
            <div className="flex items-center justify-between">
              <div className="font-medium">{format(new Date(e.created_at), 'MMM d, HH:mm')}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[60%]">{e.path || 'unknown path'}</div>
            </div>
            <div className="text-sm text-destructive mt-1 line-clamp-2">{e.message}</div>
          </div>
        ))}
        {errors.length === 0 && (
          <div className="text-sm text-muted-foreground">No errors captured in the last samples.</div>
        )}
      </div>
    </CardContent>
  </Card>
</div>
      </main>
    </>
  );
}
