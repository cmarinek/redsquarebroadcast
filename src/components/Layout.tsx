import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { StatusIndicator } from "./StatusIndicator";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      style={{
        // Fallback styles for Electron
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)'
      }}
    >
      <Navigation />
      <StatusIndicator />
      <main className={`pt-16 ${className}`} style={{ paddingTop: '4rem' }}>
        {children}
      </main>
    </div>
  );
};