import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminRoute from "@/components/routing/AdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface MonetizationDefaults {
  platform_fee_percent?: number;
  currency?: string;
  price_per_10s_cents?: number | null;
  unit_rounding_threshold_seconds?: number;
}

interface ScreenRow {
  id: string;
  screen_name: string | null;
  currency: string | null;
  price_per_10s_cents: number | null;
  platform_fee_percent: number | null;
  unit_rounding_threshold_seconds: number | null;
  owner_user_id: string;
  status: string;
}

const AdminMonetization = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState<MonetizationDefaults>({
    platform_fee_percent: 15,
    currency: "USD",
    price_per_10s_cents: null,
    unit_rounding_threshold_seconds: 5,
  });
  const [screens, setScreens] = useState<ScreenRow[]>([]);

  useEffect(() => {
    document.title = "Admin Monetization Settings – Red Square";
    const meta = document.querySelector('meta[name="description"]');
    const text = "Configure platform fee, currency, and per-screen pricing (per 10s).";
    if (meta) meta.setAttribute("content", text);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = text;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: settings }, fnRes] = await Promise.all([
          supabase.from("app_settings").select("value").eq("key", "monetization_defaults").maybeSingle(),
          supabase.functions.invoke("admin-monetization", { body: { action: "list" } }),
        ]);
        if (settings?.value) setDefaults({ ...defaults, ...settings.value });
        if ((fnRes.data as any)?.screens) setScreens((fnRes.data as any).screens as ScreenRow[]);
      } catch (e: any) {
        console.error(e);
        toast({ title: "Load failed", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencies = useMemo(() => ["USD", "EUR", "GBP"], []);

  const saveDefaults = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("app_settings").upsert({
        key: "monetization_defaults",
        value: defaults as any,
        updated_by: user.id,
      });
      if (error) throw error;
      toast({ title: "Defaults saved", description: "Monetization defaults updated." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveScreen = async (row: ScreenRow) => {
    try {
      await supabase.functions.invoke("admin-monetization", {
        body: {
          action: "update",
          screenId: row.id,
          data: {
            price_per_10s_cents: row.price_per_10s_cents,
            platform_fee_percent: row.platform_fee_percent,
            currency: row.currency,
            unit_rounding_threshold_seconds: row.unit_rounding_threshold_seconds ?? 5,
          },
        },
      });
      toast({ title: "Screen updated", description: row.screen_name || row.id });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Monetization Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform fee, default currency, and per-screen overrides (price per 10s, rounding).</p>
        <link rel="canonical" href={`${window.location.origin}/admin/monetization`} />
      </header>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Global Defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="platform_fee_percent">Platform fee (%)</Label>
              <Input id="platform_fee_percent" type="number" step="0.1" value={defaults.platform_fee_percent ?? 15}
                onChange={(e) => setDefaults((d) => ({ ...d, platform_fee_percent: parseFloat(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default currency</Label>
              <Input id="currency" list="currency-list" value={defaults.currency ?? "USD"}
                onChange={(e) => setDefaults((d) => ({ ...d, currency: e.target.value.toUpperCase() }))} />
              <datalist id="currency-list">
                {currencies.map((c) => (<option key={c} value={c} />))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price10">Default price per 10s (cents)</Label>
              <Input id="price10" type="number" value={defaults.price_per_10s_cents ?? ''}
                placeholder="e.g. 25" onChange={(e) => setDefaults((d) => ({ ...d, price_per_10s_cents: e.target.value === '' ? null : parseInt(e.target.value, 10) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rounding">Rounding threshold (seconds)</Label>
              <Input id="rounding" type="number" value={defaults.unit_rounding_threshold_seconds ?? 5}
                onChange={(e) => setDefaults((d) => ({ ...d, unit_rounding_threshold_seconds: parseInt(e.target.value, 10) }))} />
            </div>
            <div className="md:col-span-4">
              <Button onClick={saveDefaults} disabled={saving}>{saving ? 'Saving…' : 'Save Defaults'}</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Per-screen Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Edit and save rows to apply overrides. Leave blank to use defaults.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Screen</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Price / 10s (¢)</TableHead>
                  <TableHead>Platform fee (%)</TableHead>
                  <TableHead>Rounding (s)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screens.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.screen_name || s.id}</TableCell>
                    <TableCell>
                      <Input value={s.currency ?? ''} placeholder="USD" onChange={(e) => setScreens((arr) => arr.map(r => r.id === s.id ? { ...r, currency: e.target.value.toUpperCase() } : r))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={s.price_per_10s_cents ?? ''} placeholder="25" onChange={(e) => setScreens((arr) => arr.map(r => r.id === s.id ? { ...r, price_per_10s_cents: e.target.value === '' ? null : parseInt(e.target.value, 10) } : r))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={s.platform_fee_percent ?? ''} placeholder="15" onChange={(e) => setScreens((arr) => arr.map(r => r.id === s.id ? { ...r, platform_fee_percent: e.target.value === '' ? null : parseFloat(e.target.value) } : r))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={s.unit_rounding_threshold_seconds ?? 5} onChange={(e) => setScreens((arr) => arr.map(r => r.id === s.id ? { ...r, unit_rounding_threshold_seconds: parseInt(e.target.value, 10) } : r))} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" onClick={() => saveScreen(s)}>Save</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default function AdminMonetizationPage() {
  return (
    <AdminRoute>
      <AdminMonetization />
    </AdminRoute>
  );
}
