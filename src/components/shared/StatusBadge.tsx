import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";

export type StatusType = 'online' | 'offline' | 'error' | 'idle' | 'playing' | 'loading' | 'critical' | 'high' | 'medium' | 'low';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  online: {
    variant: "default" as const,
    className: "bg-green-500/10 text-green-700 border-green-500/20",
    icon: CheckCircle
  },
  playing: {
    variant: "default" as const,
    className: "bg-green-500/10 text-green-700 border-green-500/20",
    icon: CheckCircle
  },
  offline: {
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-700 border-red-500/20",
    icon: XCircle
  },
  error: {
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-700 border-red-500/20",
    icon: AlertTriangle
  },
  idle: {
    variant: "secondary" as const,
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    icon: Clock
  },
  loading: {
    variant: "outline" as const,
    className: "bg-muted/50 text-muted-foreground",
    icon: Clock
  },
  critical: {
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-700 border-red-500/20",
    icon: AlertTriangle
  },
  high: {
    variant: "destructive" as const,
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    icon: AlertTriangle
  },
  medium: {
    variant: "secondary" as const,
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    icon: Clock
  },
  low: {
    variant: "outline" as const,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    icon: CheckCircle
  }
};

export const StatusBadge = ({ status, showIcon = false, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.loading;
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};