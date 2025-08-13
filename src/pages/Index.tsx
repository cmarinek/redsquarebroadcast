import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Dashboard } from "@/components/Dashboard";
import { DeploymentGuide } from "@/components/deployment/DeploymentGuide";
import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";


const Index = () => {
  useDeploymentStatus();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Layout className="pt-0">
        <Hero />
        <Features />
        <HowItWorks />
        <Dashboard />
        
        {/* Deployment Guide Section */}
        <div className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <DeploymentGuide />
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Index;
