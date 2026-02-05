export interface Finding {
  observation: string;
  whyItMatters: string;
  evidence: string;
}

export interface AuditCategory {
  key: string;
  label: string;
  score: number;
  weight: number;
  findings: Finding[];
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  website: string;
  sector: "bank" | "insurance";
}

export interface Audit {
  id: string;
  company: CompanyInfo;
  overallScore: number;
  tier: "strong" | "adequate" | "needs-work";
  categories: AuditCategory[];
  recommendations: Recommendation[];
  generatedAt: string;
}

export type Tier = Audit["tier"];

export const CATEGORY_LABELS: Record<string, string> = {
  aiReadiness: "AI Readiness",
  mobileApp: "Mobile App Experience",
  customerSentiment: "Customer Sentiment",
  webExperience: "Web Experience",
  accessibility: "Accessibility",
};
