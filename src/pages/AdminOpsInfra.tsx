import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const parseList = (v: string) => v.split(",").map(s => s.trim()).filter(Boolean);

export default function AdminOpsInfra() {
  const [cdnBaseUrl, setCdnBaseUrl] = useState("");
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [replicas, setReplicas] = useState("");
  const [failovers, setFailovers] = useState("");
  const [poolMode, setPoolMode] = useState("transaction");
  const [poolSize, setPoolSize] = useState("50");
  const [loading, setLoading] = useState(false);
  const [geoHealth, setGeoHealth] = useState<any>(null);
  const [infra, setInfra] = useState<any>(null);

  useEffect(() => {
    document.title = "Ops: External Infra | Red Square";
    const desc = "Configure CDN, read replicas, failover and pooling settings.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);

    // Load current values
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['cdn_base_url','primary_url','read_replica_urls','failover_urls','pgbouncer_pool_mode','pgbouncer_pool_size']);
      const map = new Map<string, any>();
      for (const row of data || []) map.set(row.key, row.value);
      setCdnBaseUrl(map.get('cdn_base_url')?.url || map.get('cdn_base_url') || "");
      setPrimaryUrl(map.get('primary_url') || "");
      setReplicas((map.get('read_replica_urls') || []).join(", "));
      setFailovers((map.get('failover_urls') || []).join(", "));
      setPoolMode(map.get('pgbouncer_pool_mode') || 'transaction');
      setPoolSize(String(map.get('pgbouncer_pool_size') || '50'));
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const rows = [
        { key: 'cdn_base_url', value: cdnBaseUrl ? { url: cdnBaseUrl } : null },
        { key: 'primary_url', value: primaryUrl || null },
        { key: 'read_replica_urls', value: parseList(replicas) },
        { key: 'failover_urls', value: parseList(failovers) },
        { key: 'pgbouncer_pool_mode', value: poolMode },
        { key: 'pgbouncer_pool_size', value: Number(poolSize) || 0 },
      ];
      const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Settings saved');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const runGeoHealth = async () => {
    const { data, error } = await supabase.functions.invoke('geo-health');
    if (error) {
      toast.error('Geo health failed');
    } else {
      setGeoHealth(data);
      toast.success('Geo health ok');
    }
  };

  const fetchInfra = async () => {
    const { data, error } = await supabase.functions.invoke('infra-config');
    if (error) {
      toast.error('Fetch infra config failed');
    } else {
      setInfra(data);
      toast.success('Fetched infra config');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-24 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Badge className="mb-3">Admin</Badge>
            <h1 className="text-3xl font-bold">External Infrastructure</h1>
            <p className="text-muted-foreground">CDN, replicas, failover, and pooling configuration</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CDN for Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="text-sm">CDN Base URL</label>
                <Input placeholder="https://cdn.example.com" value={cdnBaseUrl} onChange={e=>setCdnBaseUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Used by get-signed-view-url to swap origin to CDN.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Read Replicas & Failover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="text-sm">Primary URL</label>
                <Input placeholder="https://hqey...supabase.co" value={primaryUrl} onChange={e=>setPrimaryUrl(e.target.value)} />
                <label className="text-sm">Read Replica URLs (comma-separated)</label>
                <Input placeholder="https://rr1..., https://rr2..." value={replicas} onChange={e=>setReplicas(e.target.value)} />
                <label className="text-sm">Failover URLs (comma-separated)</label>
                <Input placeholder="https://fo1..., https://fo2..." value={failovers} onChange={e=>setFailovers(e.target.value)} />
                <p className="text-xs text-muted-foreground">Stored for clients/ops; provisioning occurs in Supabase dashboard.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PgBouncer Tuning Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="text-sm">Pool Mode</label>
                <Input placeholder="transaction" value={poolMode} onChange={e=>setPoolMode(e.target.value)} />
                <label className="text-sm">Pool Size</label>
                <Input placeholder="50" value={poolSize} onChange={e=>setPoolSize(e.target.value)} />
                <p className="text-xs text-muted-foreground">Reference-only values to align app expectations and docs.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={runGeoHealth}>Check Geo Health</Button>
                  <Button variant="outline" onClick={fetchInfra}>Fetch Infra Config</Button>
                  <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Settings'}</Button>
                </div>
                {geoHealth && (
                  <pre className="text-xs bg-secondary/40 p-3 rounded-md overflow-auto max-h-48">{JSON.stringify(geoHealth, null, 2)}</pre>
                )}
                {infra && (
                  <pre className="text-xs bg-secondary/40 p-3 rounded-md overflow-auto max-h-48">{JSON.stringify(infra, null, 2)}</pre>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-xs text-muted-foreground">
            <p>Note: Provisioning read replicas, CDN, and load balancing is performed in respective cloud dashboards (Supabase, CDN, hosting). This console stores configuration used by clients and ops tooling.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
