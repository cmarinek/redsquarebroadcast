import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Dashboard } from "@/components/Dashboard";
import { DeploymentGuide } from "@/components/deployment/DeploymentGuide";
import { PlatformOverview } from "@/features/shared";
import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";
import { ENVIRONMENT } from "@/config/environment";

const Index = () => {
  useDeploymentStatus();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Layout className="pt-0">
        <Hero />
        <PlatformOverview />
        <Features />
        <HowItWorks />
        
        {/* Unified Dashboard - role-aware, no duplicates */}
        <Dashboard />
        
        {/* Deployment Guide Section - showing Red Square platform capabilities */}
        {ENVIRONMENT.IS_DEVELOPMENT && (
          <div className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <DeploymentGuide />
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default Index;
