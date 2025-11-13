import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  totalRatings?: number;
  className?: string;
  readonly?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({
  value,
  maxStars = 5,
  size = "md",
  showValue = false,
  totalRatings,
  className,
  readonly = true,
  onChange,
}: RatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const roundedValue = Math.round(value * 2) / 2; // Round to nearest 0.5

  const handleStarClick = (starValue: number) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= roundedValue;
          const halfFilled = starValue - 0.5 === roundedValue;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starValue)}
              disabled={readonly}
              className={cn(
                "relative transition-transform",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default"
              )}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-muted-foreground/30"
                )}
                fill="none"
              />

              {/* Foreground star (filled or half-filled) */}
              {(filled || halfFilled) && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute top-0 left-0 text-yellow-500"
                  )}
                  fill="currentColor"
                  style={
                    halfFilled
                      ? {
                          clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                        }
                      : undefined
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={cn("font-medium text-foreground", textSizeClasses[size])}>
          {value.toFixed(1)}
        </span>
      )}

      {totalRatings !== undefined && totalRatings > 0 && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({totalRatings.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Component for "No ratings yet" state
export function NoRating({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star className={cn(sizeClasses[size], "text-muted-foreground/30")} fill="none" />
      <span className={cn("text-muted-foreground", textSizeClasses[size])}>
        No ratings yet
      </span>
    </div>
  );
}
