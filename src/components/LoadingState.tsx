import { useState, useEffect, useRef } from "react";
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
  const [loopCount, setLoopCount] = useState(0);
  const hasSignaled = useRef(false);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      // Signal completion once (so parent knows animation has cycled)
      if (!hasSignaled.current) {
        hasSignaled.current = true;
        onComplete();
      }
      // Reset to loop again
      const timeout = setTimeout(() => {
        setCurrentStep(0);
        setLoopCount((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, STEP_DURATION);

    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-semibold">Generating CX Audit</h2>
        <p className="text-sm text-muted-foreground">
          Analyzing customer experience across multiple dimensions
        </p>
        {loopCount > 0 && (
          <p className="text-xs text-muted mt-1">
            This may take a minute — hang tight
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {STEPS.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep;

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
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
