import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceOptimizer } from "@/components/admin/PerformanceOptimizer";
import { ContentWorkflowManager } from "@/components/content/ContentWorkflowManager";
import { SecurityComplianceCenter } from "@/components/security/SecurityComplianceCenter";
import { AdvancedOperationsCenter } from "@/components/operations/AdvancedOperationsCenter";
import { SystemAnalyticsDashboard } from "@/components/analytics/SystemAnalyticsDashboard";
import SEO from "@/components/SEO";

const AdminOperations = () => {
  return (
    <>
      <SEO 
        title="Operations Center - Red Square Admin"
        description="Advanced operations management, performance optimization, content workflows, and security compliance for Red Square platform administrators."
      />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Operations Center</h1>
            <p className="text-muted-foreground">
              Advanced operations management and system optimization
            </p>
          </div>

          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="content">Content Workflow</TabsTrigger>
              <TabsTrigger value="security">Security & Compliance</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <PerformanceOptimizer />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentWorkflowManager />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecurityComplianceCenter />
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <AdvancedOperationsCenter />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SystemAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default AdminOperations;