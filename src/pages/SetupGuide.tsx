import { Layout } from "@/components/Layout";
import { DualAppSetupGuide } from "@/components/setup-guide/DualAppSetupGuide";
import SEO from "@/components/SEO";

export default function SetupGuide() {
  return (
    <Layout>
      <SEO 
        title="Red Square Setup Guide - Platform & Broadcast Apps"
        description="Complete setup guide for Red Square's dual-app ecosystem. Learn how to use both the Platform app for managing campaigns and the Broadcast app for screens."
        path="/setup-guide"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <DualAppSetupGuide />
        </div>
      </div>
    </Layout>
  );
}