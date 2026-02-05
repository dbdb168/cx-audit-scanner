import type { Recommendation } from "../lib/types";
import { Lightbulb } from "lucide-react";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb size={18} className="text-adequate" />
        Recommendations
      </h2>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex gap-4 p-4 rounded-lg border border-border bg-background"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-card flex items-center justify-center text-sm font-semibold text-accent font-mono">
              {idx + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-sm">{rec.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
