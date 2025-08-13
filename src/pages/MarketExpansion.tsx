import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIManagement } from "@/components/api/APIManagement";
import { ThirdPartyIntegrations } from "@/components/integrations/ThirdPartyIntegrations";
import { EnterpriseFeatures } from "@/components/enterprise/EnterpriseFeatures";
import { AdvancedAdvertising } from "@/components/advertising/AdvancedAdvertising";
import SEO from "@/components/SEO";

const MarketExpansion = () => {
  return (
    <>
      <SEO 
        title="Market Expansion - Red Square Admin"
        description="APIs, integrations, enterprise features, and advanced advertising capabilities for Red Square platform expansion."
      />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Market Expansion</h1>
            <p className="text-muted-foreground">
              APIs, integrations, enterprise features, and advanced advertising
            </p>
          </div>

          <Tabs defaultValue="apis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="apis">APIs & SDKs</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              <TabsTrigger value="advertising">Advanced Ads</TabsTrigger>
            </TabsList>

            <TabsContent value="apis" className="space-y-6">
              <APIManagement />
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <ThirdPartyIntegrations />
            </TabsContent>

            <TabsContent value="enterprise" className="space-y-6">
              <EnterpriseFeatures />
            </TabsContent>

            <TabsContent value="advertising" className="space-y-6">
              <AdvancedAdvertising />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default MarketExpansion;