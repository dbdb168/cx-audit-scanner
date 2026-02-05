import type { Tier } from "../lib/types";
import { getTierColor, getTierLabel } from "../lib/utils";

interface ScoreGaugeProps {
  score: number;
  tier: Tier;
}

export function ScoreGauge({ score, tier }: ScoreGaugeProps) {
  const color = getTierColor(tier);
  const label = getTierLabel(tier);

  // SVG arc parameters
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc goes from 135° to 405° (270° sweep)
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;
  const progress = Math.min(score / 100, 1);
  const progressAngle = startAngle + sweepAngle * progress;

  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = {
      x: center + radius * Math.cos(toRadians(startDeg)),
      y: center + radius * Math.sin(toRadians(startDeg)),
    };
    const end = {
      x: center + radius * Math.cos(toRadians(endDeg)),
      y: center + radius * Math.sin(toRadians(endDeg)),
    };
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {score > 0 && (
            <path
              d={describeArc(startAngle, progressAngle)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono" style={{ color }}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>
      {/* Tier badge */}
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
        style={{
          color,
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        }}
      >
        {label}
      </span>
    </div>
  );
}
