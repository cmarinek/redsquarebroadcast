import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProductionHealthMonitor } from '@/components/production/ProductionHealthMonitor';
import { ProductionReadinessChecker } from '@/components/production/ProductionReadinessChecker';
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
          <Tabs defaultValue="health" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health">Health Monitor</TabsTrigger>
              <TabsTrigger value="readiness">Readiness Check</TabsTrigger>
              <TabsTrigger value="metrics">System Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="health">
              <ProductionHealthMonitor />
            </TabsContent>

            <TabsContent value="readiness">
              <ProductionReadinessChecker />
            </TabsContent>

            <TabsContent value="metrics">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground">
                      Advanced metrics dashboard will be available after full deployment.
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground">
                      Resource monitoring will be enabled in production environment.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}