import { useState } from "react";
import type { AuditCategory } from "../lib/types";
import { getTierFromScore, getTierColor } from "../lib/utils";
import { ChevronDown } from "lucide-react";

interface FindingsPanelProps {
  categories: AuditCategory[];
}

export function FindingsPanel({ categories }: FindingsPanelProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(
    categories[0]?.key ?? null
  );

  const toggle = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <h2 className="text-lg font-semibold p-5 pb-0">Detailed Findings</h2>
      <div className="divide-y divide-border mt-4">
        {categories.map((category) => {
          const isExpanded = expandedKey === category.key;
          const tier = getTierFromScore(category.score);
          const color = getTierColor(tier);

          return (
            <div key={category.key}>
              <button
                onClick={() => toggle(category.key)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-card-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{category.label}</span>
                  <span
                    className="text-xs font-mono font-semibold rounded-full px-2 py-0.5"
                    style={{
                      color,
                      backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                    }}
                  >
                    {category.score}
                  </span>
                  <span className="text-xs text-muted">
                    {category.findings.length} finding{category.findings.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  {category.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-background p-4 flex flex-col gap-2"
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: color,
                      }}
                    >
                      <p className="font-medium text-sm leading-relaxed">
                        {finding.observation}
                      </p>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Why it matters: </span>
                        {finding.whyItMatters}
                      </div>
                      <div className="text-xs text-muted leading-relaxed mt-1 p-3 rounded bg-card">
                        <span className="font-medium text-muted-foreground">Evidence: </span>
                        {finding.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
