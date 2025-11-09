import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProductionHealthMonitor } from '@/components/production/ProductionHealthMonitor';
import { ProductionReadinessChecker } from '@/components/production/ProductionReadinessChecker';
import { ProductionMonitoringDashboard } from '@/components/production/ProductionMonitoringDashboard';
import { ProductionReadinessScorecard } from '@/components/admin/ProductionReadinessScorecard';
import { DeviceMonitoringPanel } from '@/components/shared/DeviceMonitoringPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';

export default function ProductionDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <SEO
        title="Production Dashboard | Red Square"
        description="Monitor production system health, readiness, and critical metrics for Red Square platform"
        path="/production"
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Production Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor system health and ensure production readiness
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="scorecard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="health">Health Monitor</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
              <TabsTrigger value="quicklinks">Quick Links</TabsTrigger>
            </TabsList>

            <TabsContent value="scorecard">
              <ProductionReadinessScorecard />
            </TabsContent>

            <TabsContent value="monitoring">
              <ProductionMonitoringDashboard />
            </TabsContent>

            <TabsContent value="health">
              <ProductionHealthMonitor />
            </TabsContent>

            <TabsContent value="devices">
              <DeviceMonitoringPanel />
            </TabsContent>

            <TabsContent value="readiness">
              <ProductionReadinessChecker />
            </TabsContent>

            <TabsContent value="quicklinks" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/admin/users">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        User Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Manage users, roles, and permissions
                      </p>
                    </CardContent>
                  </a>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/admin/financials">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        Financial Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View revenue, process payouts
                      </p>
                    </CardContent>
                  </a>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/admin/content-moderation">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        Content Moderation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Review and moderate content
                      </p>
                    </CardContent>
                  </a>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/support">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Support Center
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Handle user tickets and issues
                      </p>
                    </CardContent>
                  </a>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/admin/performance">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Performance Monitoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View system performance metrics
                      </p>
                    </CardContent>
                  </a>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <a href="/admin/operations">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">⚙️</span>
                        Operations Center
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Manage system operations
                      </p>
                    </CardContent>
                  </a>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}