import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap } from "lucide-react";

export function StatusIndicator() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shadow-lg animate-pulse">
        <Zap className="w-3 h-3 mr-1" />
        All Systems Operational
      </Badge>
    </div>
  );
}