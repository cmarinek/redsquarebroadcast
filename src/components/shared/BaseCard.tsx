import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BaseCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  actions?: ReactNode;
}

export const BaseCard = ({
  title,
  description,
  icon: Icon,
  children,
  loading = false,
  className,
  headerClassName,
  contentClassName,
  actions
}: BaseCardProps) => {
  if (loading) {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader className={headerClassName}>
          <Skeleton className="h-6 w-32" />
          {description && <Skeleton className="h-4 w-48" />}
        </CardHeader>
        <CardContent className={contentClassName}>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      {(title || description || Icon || actions) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", headerClassName)}>
          <div className="space-y-1">
            {title && (
              <CardTitle className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                {title}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
};