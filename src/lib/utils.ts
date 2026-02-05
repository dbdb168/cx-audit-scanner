import type { Tier } from "./types";

export function getTierFromScore(score: number): Tier {
  if (score >= 75) return "strong";
  if (score >= 50) return "adequate";
  return "needs-work";
}

export function getTierColor(tier: Tier): string {
  switch (tier) {
    case "strong":
      return "var(--color-strong)";
    case "adequate":
      return "var(--color-adequate)";
    case "needs-work":
      return "var(--color-needs-work)";
  }
}

export function getTierLabel(tier: Tier): string {
  switch (tier) {
    case "strong":
      return "Strong";
    case "adequate":
      return "Adequate";
    case "needs-work":
      return "Needs Work";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
