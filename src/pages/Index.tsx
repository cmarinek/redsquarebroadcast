import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { MiniHowItWorks } from "@/components/miniHowItWorks";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Layout className="pt-0">
        <Hero />
        <Features />
        <HowItWorks />
        <Dashboard />
        <Footer />
      </Layout>
    </div>
  );
};

export default Index;
