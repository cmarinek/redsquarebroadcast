import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({ 
  title = "Loading...", 
  description = "Please wait while we fetch your data",
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <LoadingSpinner size="lg" className="mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingOverlay({ isLoading, children, loadingText = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <span className="text-sm font-medium">{loadingText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}