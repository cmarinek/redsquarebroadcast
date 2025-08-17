import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shadow-lg animate-pulse">
        <Zap className="w-3 h-3 mr-1" />
        All Systems Operational
      </Badge>
    </div>
  );
}