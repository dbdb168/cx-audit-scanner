import type { AuditCategory } from "../lib/types";
import { getTierFromScore, getTierColor } from "../lib/utils";

interface CategoryBreakdownProps {
  categories: AuditCategory[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold mb-4">Category Scores</h2>
      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const tier = getTierFromScore(category.score);
          const color = getTierColor(tier);
          return (
            <div key={category.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.label}</span>
                <span className="text-muted-foreground">{category.weight}% weight</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${category.score}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span
                  className="text-sm font-mono font-semibold w-8 text-right"
                  style={{ color }}
                >
                  {category.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
