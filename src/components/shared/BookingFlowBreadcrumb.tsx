import { Link, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  path: (screenId: string) => string;
  completed?: boolean;
}

interface BookingFlowBreadcrumbProps {
  currentStep: "upload" | "schedule" | "payment" | "confirmation";
  className?: string;
}

export function BookingFlowBreadcrumb({
  currentStep,
  className,
}: BookingFlowBreadcrumbProps) {
  const { screenId, bookingId } = useParams();

  if (!screenId && !bookingId) {
    return null;
  }

  const steps: Step[] = [
    {
      id: "upload",
      label: "Upload Content",
      path: (id: string) => `/book/${id}/upload`,
      completed: currentStep !== "upload",
    },
    {
      id: "schedule",
      label: "Schedule",
      path: (id: string) => `/book/${id}/schedule`,
      completed:
        currentStep === "payment" || currentStep === "confirmation",
    },
    {
      id: "payment",
      label: "Payment",
      path: (id: string) => `/book/${id}/payment`,
      completed: currentStep === "confirmation",
    },
    {
      id: "confirmation",
      label: "Confirmation",
      path: () => `/confirmation/${bookingId || ""}`,
      completed: false,
    },
  ];

  const currentStepIndex = steps.findIndex(
    (step) => step.id === currentStep
  );

  return (
    <div
      className={cn(
        "bg-background border-b border-border py-4 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="max-w-3xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            {steps.map((step, index) => {
              const isCurrentStep = step.id === currentStep;
              const isPastStep = index < currentStepIndex;
              const isFutureStep = index > currentStepIndex;
              const isClickable = isPastStep && screenId;

              return (
                <BreadcrumbItem key={step.id}>
                  {index > 0 && <BreadcrumbSeparator />}

                  {isCurrentStep ? (
                    <BreadcrumbPage
                      className="flex items-center gap-2 font-semibold"
                      aria-current="step"
                    >
                      <Circle
                        className="w-4 h-4 text-primary fill-primary"
                        aria-hidden="true"
                      />
                      <span>{step.label}</span>
                      <span className="sr-only">(current step)</span>
                    </BreadcrumbPage>
                  ) : isClickable ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={step.path(screenId!)}
                        className="flex items-center gap-2"
                        aria-label={`Go back to ${step.label}`}
                      >
                        <CheckCircle2
                          className="w-4 h-4 text-green-500"
                          aria-hidden="true"
                        />
                        <span>{step.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <span
                      className={cn(
                        "flex items-center gap-2",
                        isPastStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                      aria-disabled={isFutureStep}
                    >
                      {isPastStep ? (
                        <CheckCircle2
                          className="w-4 h-4 text-green-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{step.label}</span>
                    </span>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Progress bar */}
        <div
          className="mt-4 h-1 bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={((currentStepIndex + 1) / steps.length) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Booking progress"
        >
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Step indicator */}
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
