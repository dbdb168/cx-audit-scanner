import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";

const STEPS = [
  "Scanning website...",
  "Analyzing app reviews...",
  "Assessing AI readiness...",
  "Evaluating accessibility...",
  "Generating report...",
];

const STEP_DURATION = 1800;

interface LoadingStateProps {
  onComplete: () => void;
}

export function LoadingState({ onComplete }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Once we've gone through all steps, signal completion
    if (currentStep >= STEPS.length) {
      onComplete();
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, STEP_DURATION);

    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);

  // After all steps complete, keep the last step spinning to show we're still working
  const allStepsDone = currentStep >= STEPS.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-semibold">Generating CX Audit</h2>
        <p className="text-sm text-muted-foreground">
          Analyzing customer experience across multiple dimensions
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {STEPS.map((step, idx) => {
          const isLastStep = idx === STEPS.length - 1;
          const isComplete = idx < currentStep && !(isLastStep && allStepsDone);
          const isActive = idx === currentStep || (isLastStep && allStepsDone);

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-300 ${
                isActive
                  ? "bg-card border border-border text-foreground"
                  : isComplete
                  ? "text-muted-foreground"
                  : "text-muted"
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isComplete ? (
                  <Check size={16} className="text-strong" />
                ) : isActive ? (
                  <Loader2 size={16} className="text-accent animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-border" />
                )}
              </div>
              <span>
                {isLastStep && allStepsDone ? "Finalizing report..." : step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
