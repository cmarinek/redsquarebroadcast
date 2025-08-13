import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useDeploymentStatus() {
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has been notified about the deployment status
    const hasBeenNotified = localStorage.getItem('red-square-deployment-status-notified');
    
    if (!hasBeenNotified) {
      // Show welcome toast after a brief delay
      const timer = setTimeout(() => {
        toast({
          title: "🚀 Platform Ready!",
          description: "All systems are operational. Start broadcasting or register your screen now!",
          duration: 5000,
        });
        
        localStorage.setItem('red-square-deployment-status-notified', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [toast]);
}