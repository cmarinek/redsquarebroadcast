import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { phases, getCurrentPhase, getRemainingTasks } from "@/data/productionPlan";
import { Badge } from "@/components/ui/badge";

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const setCanonical = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  const base = window.location.origin;
  link.href = `${base}${href}`;
};

const AdminProjectOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!rolesLoading && !isAdmin()) {
      navigate('/');
      toast({ title: 'Access Denied', description: "You don't have admin privileges.", variant: 'destructive' });
      return;
    }
  }, [user, rolesLoading, isAdmin, navigate, toast]);

  useEffect(() => {
    document.title = 'Admin Project Overview – RedSquare';
    setMetaTag('description', 'Admin-only project overview with feature map for RedSquare DOOH platform.');
    setCanonical('/admin/overview');
  }, []);

  const currentPhase = useMemo(() => getCurrentPhase(phases), []);
  const remainingTasks = useMemo(() => getRemainingTasks(currentPhase, 6), [currentPhase]);
  const [notes, setNotes] = useState("");
  const notesKey = "admin_production_notes";

  useEffect(() => {
    const saved = localStorage.getItem(notesKey);
    if (saved !== null) setNotes(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(notesKey, notes);
  }, [notes]);

  if (!user || (!rolesLoading && !isAdmin())) {
    return null;
  }

  return (
    <Layout>
      <header className="container mx-auto px-4 pt-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
          Project Overview (Admin)
        </h1>
        <p className="text-muted-foreground text-lg">Concise feature map and detailed system overview</p>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Production Status</CardTitle>
              <CardDescription>Current phase progress and remaining tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Phase</div>
                      <div className="font-semibold">{currentPhase.phase}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Progress</div>
                      <Progress value={currentPhase.progress} className="w-48" />
                      <div className="text-sm font-medium mt-1">{currentPhase.progress}%</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Remaining Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {remainingTasks.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Link to="/production-plan">
                      <Button size="sm" variant="secondary">View full Production Plan</Button>
                    </Link>
                  </div>
                </div>
                <aside className="space-y-2">
                  <h4 className="font-semibold">Notes</h4>
                  <Textarea
                    placeholder="Internal notes (saved locally)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[140px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotes("");
                        localStorage.removeItem(notesKey);
                      }}
                    >
                      Clear notes
                    </Button>
                  </div>
                </aside>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Feature Map (Concise)</CardTitle>
              <CardDescription>High-level map grouped by roles and shared/back-end components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <article>
                  <h3 className="text-lg font-semibold mb-2">Broadcasters <Badge className="ml-2">Core</Badge></h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><Link to="/discover" className="underline">Discovery</Link> (ScreenDiscovery, ScreenDetails)</li>
                    <li><Link to="/book/:screenId/upload" className="underline">Content Upload</Link> → Scheduling → Payment → <Link to="/confirmation/123" className="underline">Confirmation</Link></li>
                    <li><Link to="/my-campaigns" className="underline">Broadcaster Dashboard</Link></li>
                    <li>Advanced: ABTestingTools, AudienceTargeting, ContentSchedulingAutomation</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2">Screen Owners <Badge variant="secondary" className="ml-2">Core</Badge></h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>ScreenNetworkManagement, <Link to="/register-screen" className="underline">Register</Link></li>
                    <li>AvailabilityManager, Pricing, <Link to="/my-screens" className="underline">Inventory</Link></li>
                    <li>ContentApprovalWorkflows, DeviceMonitoring</li>
                    <li>PayoutManagement, RevenueOptimization</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2">Admin <Badge variant="outline" className="ml-2">Ops</Badge></h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><Link to="/admin" className="underline">Admin Dashboard</Link> (Overview, Users, Screens, Bookings, Security)</li>
                    <li>AdminSystemHealth, audit logs, alerts</li>
                  </ul>
                </article>

                <article className="md:col-span-2 lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-2">Shared UI</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Auth (Auth page, AuthContext, useUserRoles)</li>
                    <li>Onboarding (BroadcasterOnboarding, ScreenOwnerOnboarding)</li>
                    <li>Shadcn/Radix UI library, hooks, utils</li>
                  </ul>
                </article>

                <article className="md:col-span-2 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Backend (Supabase)</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Tables: profiles, screens, bookings, admin_system_health, admin_security_alerts</li>
                    <li>Storage: media assets; RLS on user-specific data</li>
                    <li>Edge Functions: content-moderation, create-payment, create-payout, real-time-broadcast, send-email-notifications, system-monitoring, verify-payment</li>
                  </ul>
                </article>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Detailed Overview</CardTitle>
              <CardDescription>Primary flows and module responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
              <article className="space-y-6 text-sm">
                <section>
                  <h4 className="font-semibold mb-1">Broadcaster flow</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Discover screens → compare price/availability → view ScreenDetails</li>
                    <li>Upload media → schedule slots → pay → receive Confirmation</li>
                    <li>Manage campaigns in BroadcasterDashboard; analytics and A/B testing tools</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold mb-1">Screen owner flow</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Register and manage screens; set availability/pricing</li>
                    <li>Approve content; monitor devices and uptime</li>
                    <li>Track revenue and payouts via PayoutManagement</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold mb-1">Admin operations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>User, screen, booking management; platform analytics</li>
                    <li>System health monitoring and security alerts</li>
                    <li>Audit logging and role enforcement</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold mb-1">Edge Functions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>content-moderation: checks uploaded media safety</li>
                    <li>create-payment / verify-payment: payment intents and confirmations</li>
                    <li>create-payout: screen owner payouts</li>
                    <li>real-time-broadcast: stream updates to clients</li>
                    <li>send-email-notifications: transactional emails</li>
                    <li>system-monitoring: periodic health checks</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold mb-1">Data model & access</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Profiles table for public user data; roles enforced in app</li>
                    <li>Bookings link users to screens; analytics via SQL/RPCs</li>
                    <li>RLS on user-owned records; admin bypass in controlled operations</li>
                  </ul>
                </section>
              </article>
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
};

export default AdminProjectOverview;
