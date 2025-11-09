import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { phases, getCurrentPhase, getRemainingTasks } from "@/data/productionPlan";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductionReadinessScorecard } from "@/components/admin/ProductionReadinessScorecard";
import { LoadTestingDashboard } from "@/components/admin/LoadTestingDashboard";

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

  // Local task tracking (client-only)
  const TASKS_KEY = "admin_production_tasks_v1";
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const makeKey = (phase: string, category: string, task: string) => `${phase}::${category}::${task}`;
  const isDone = (phase: string, category: string, task: string) => !!doneMap[makeKey(phase, category, task)];
  const toggleTask = (phase: string, category: string, task: string) => {
    const key = makeKey(phase, category, task);
    setDoneMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTasks = useMemo(
    () => currentPhase.items.reduce((acc, item) => acc + item.tasks.length, 0),
    [currentPhase]
  );
  const doneCount = useMemo(() => {
    return currentPhase.items.reduce((count, item) => {
      return count + item.tasks.filter((t) => isDone(currentPhase.phase, item.category, t)).length;
    }, 0);
  }, [currentPhase, doneMap]);
  const hasLocalForPhase = useMemo(
    () => Object.keys(doneMap).some((k) => k.startsWith(`${currentPhase.phase}::`)),
    [doneMap, currentPhase]
  );
  const derivedProgress = useMemo(
    () => (totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0),
    [doneCount, totalTasks]
  );
  const progressToShow = hasLocalForPhase ? derivedProgress : currentPhase.progress;

  const findCategoryForTask = (task: string): string | undefined => {
    const found = currentPhase.items.find((i) => i.tasks.includes(task));
    return found?.category;
  };

  const [notes, setNotes] = useState("");
  const notesKey = "admin_production_notes";

  useEffect(() => {
    const saved = localStorage.getItem(notesKey);
    if (saved !== null) setNotes(saved);
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (raw) setDoneMap(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(notesKey, notes);
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(doneMap));
    } catch {}
  }, [doneMap]);

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

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="readiness">Production Readiness</TabsTrigger>
            <TabsTrigger value="checklist">Testing Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
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
                          <Progress value={progressToShow} className="w-48" />
                          <div className="text-sm font-medium mt-1">{progressToShow}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Remaining Tasks</h4>
                        <ul className="space-y-2">
                          {remainingTasks.map((t, i) => {
                            const cat = findCategoryForTask(t) || "General";
                            const done = isDone(currentPhase.phase, cat, t);
                            return (
                              <li key={i} className="flex items-center gap-3">
                                <Checkbox
                                  checked={done}
                                  onCheckedChange={() => toggleTask(currentPhase.phase, cat, t)}
                                  aria-label={`Mark ${t} as done`}
                                />
                                <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{t}</span>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" onClick={() => setShowAll((s) => !s)}>
                            {showAll ? "Hide all tasks" : "Show all tasks"}
                          </Button>
                        </div>
                        {showAll && (
                          <div className="mt-4 space-y-4">
                            {currentPhase.items.map((item, idx) => (
                              <div key={idx}>
                                <div className="font-medium mb-2">{item.category}</div>
                                <ul className="space-y-2">
                                  {item.tasks.map((task, j) => {
                                    const done = isDone(currentPhase.phase, item.category, task);
                                    return (
                                      <li key={j} className="flex items-center gap-3">
                                        <Checkbox
                                          checked={done}
                                          onCheckedChange={() => toggleTask(currentPhase.phase, item.category, task)}
                                          aria-label={`Mark ${task} as done`}
                                        />
                                        <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{task}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to="/production-plan">
                            <Button size="sm" variant="secondary">View full Production Plan</Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDoneMap({});
                              try {
                                localStorage.removeItem(TASKS_KEY);
                              } catch {}
                            }}
                          >
                            Reset task status
                          </Button>
                        </div>
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
                      <h3 className="text-lg font-semibold mb-2">Advertisers <Badge className="ml-2">Core</Badge></h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><Link to="/discover" className="underline">Discovery</Link> (ScreenDiscovery, ScreenDetails)</li>
                        <li><Link to="/book/:screenId/upload" className="underline">Content Upload</Link> → Scheduling → Payment → <Link to="/confirmation/123" className="underline">Confirmation</Link></li>
                        <li><Link to="/my-campaigns" className="underline">Advertiser Dashboard</Link></li>
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
                        <li>Edge Functions: content-moderation, create-payment, create-payout, real-time-broadcast, send-email-notifications, system-monitoring, verify-payment, stripe-webhook</li>
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
                      <h4 className="font-semibold mb-1">Advertiser flow</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Discover screens → compare price/availability → view ScreenDetails</li>
                        <li>Upload media → schedule slots → pay → receive Confirmation</li>
                        <li>Manage campaigns in AdvertiserDashboard; analytics and A/B testing tools</li>
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
                        <li>stripe-webhook: production-grade Stripe webhook handler</li>
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
          </TabsContent>

          <TabsContent value="readiness" className="space-y-6">
            <ProductionReadinessScorecard />
            <LoadTestingDashboard />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Feature Verification Checklist</CardTitle>
                <CardDescription>
                  Manual testing checklist to verify features against productionPlan.ts claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The Feature Verification Checklist provides structured manual testing steps for all features.
                  Use this to verify actual implementation against the 100% completion claims in productionPlan.ts.
                </p>
                <div className="space-y-4">
                  <a 
                    href="/docs/FEATURE_VERIFICATION_CHECKLIST.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="default" className="w-full">
                      📋 Open Feature Verification Checklist
                    </Button>
                  </a>
                  <a 
                    href="/docs/OAUTH_SETUP_GUIDE.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="secondary" className="w-full">
                      🔐 OAuth Provider Setup Guide
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
};

export default AdminProjectOverview;
