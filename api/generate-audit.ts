import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CACHE_DAYS = 7;

// ── Allowed companies (SSRF prevention) ────────────────────────
const ALLOWED_COMPANIES: Record<string, { name: string; website: string; sector: "bank" | "insurance" }> = {
  "wells-fargo": { name: "Wells Fargo", website: "wellsfargo.com", sector: "bank" },
  "jpmorgan-chase": { name: "JPMorgan Chase", website: "chase.com", sector: "bank" },
  "bank-of-america": { name: "Bank of America", website: "bankofamerica.com", sector: "bank" },
  "citigroup": { name: "Citigroup", website: "citi.com", sector: "bank" },
  "us-bancorp": { name: "U.S. Bancorp", website: "usbank.com", sector: "bank" },
  "pnc-financial": { name: "PNC Financial", website: "pnc.com", sector: "bank" },
  "truist-financial": { name: "Truist Financial", website: "truist.com", sector: "bank" },
  "capital-one": { name: "Capital One", website: "capitalone.com", sector: "bank" },
  "td-bank": { name: "TD Bank", website: "td.com", sector: "bank" },
  "goldman-sachs": { name: "Goldman Sachs", website: "goldmansachs.com", sector: "bank" },
  "state-farm": { name: "State Farm", website: "statefarm.com", sector: "insurance" },
  "progressive": { name: "Progressive", website: "progressive.com", sector: "insurance" },
  "allstate": { name: "Allstate", website: "allstate.com", sector: "insurance" },
  "geico": { name: "GEICO", website: "geico.com", sector: "insurance" },
  "usaa": { name: "USAA", website: "usaa.com", sector: "insurance" },
  "liberty-mutual": { name: "Liberty Mutual", website: "libertymutual.com", sector: "insurance" },
  "nationwide": { name: "Nationwide", website: "nationwide.com", sector: "insurance" },
  "travelers": { name: "Travelers", website: "travelers.com", sector: "insurance" },
  "metlife": { name: "MetLife", website: "metlife.com", sector: "insurance" },
  "prudential": { name: "Prudential", website: "prudential.com", sector: "insurance" },
};

// ── Rate limiting (in-memory, resets on cold start) ────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ── Types ──────────────────────────────────────────────────────
interface CompanyInfo {
  id: string;
  name: string;
  website: string;
  sector: "bank" | "insurance";
}

interface Finding {
  observation: string;
  whyItMatters: string;
  evidence: string;
}

interface AuditCategory {
  key: string;
  label: string;
  score: number;
  weight: number;
  findings: Finding[];
}

interface Recommendation {
  title: string;
  description: string;
}

interface Audit {
  id: string;
  company: CompanyInfo;
  overallScore: number;
  tier: "strong" | "adequate" | "needs-work";
  categories: AuditCategory[];
  recommendations: Recommendation[];
  generatedAt: string;
}

// ── Step 1: Fetch website HTML ─────────────────────────────────
async function fetchWebsite(website: string): Promise<string> {
  const url = `https://www.${website}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CXAuditScanner/1.0" },
    redirect: "follow",
  });
  const html = await res.text();
  return html.slice(0, 15000);
}

// ── Step 2: PageSpeed Insights ─────────────────────────────────
interface PageSpeedResult {
  performanceScore: number;
  accessibilityScore: number;
  lcp: number;
  cls: number;
  fid: number;
  mobileUsability: boolean;
}

async function fetchPageSpeed(
  website: string
): Promise<PageSpeedResult | null> {
  const url = `https://www.${website}`;
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&strategy=MOBILE`;
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const perf = data.lighthouseResult?.categories?.performance;
    const a11y = data.lighthouseResult?.categories?.accessibility;
    const audits = data.lighthouseResult?.audits;
    return {
      performanceScore: Math.round((perf?.score ?? 0) * 100),
      accessibilityScore: Math.round((a11y?.score ?? 0) * 100),
      lcp: audits?.["largest-contentful-paint"]?.numericValue ?? 0,
      cls: audits?.["cumulative-layout-shift"]?.numericValue ?? 0,
      fid: audits?.["max-potential-fid"]?.numericValue ?? 0,
      mobileUsability: (perf?.score ?? 0) > 0.5,
    };
  } catch {
    return null;
  }
}

// ── Step 3: Claude synthesis ───────────────────────────────────
const AUDIT_TOOL_SCHEMA: Anthropic.Tool = {
  name: "submit_audit",
  description:
    "Submit the completed CX audit for a financial services company.",
  input_schema: {
    type: "object" as const,
    properties: {
      overallScore: {
        type: "number" as const,
        description: "Overall weighted score 0-100",
      },
      tier: {
        type: "string" as const,
        enum: ["strong", "adequate", "needs-work"],
        description: "strong: 75-100, adequate: 50-74, needs-work: 0-49",
      },
      categories: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            key: {
              type: "string" as const,
              enum: [
                "aiReadiness",
                "mobileApp",
                "customerSentiment",
                "webExperience",
                "accessibility",
              ],
            },
            label: { type: "string" as const },
            score: {
              type: "number" as const,
              description: "Category score 0-100",
            },
            weight: {
              type: "number" as const,
              description: "Category weight as percentage (e.g. 25)",
            },
            findings: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  observation: { type: "string" as const },
                  whyItMatters: { type: "string" as const },
                  evidence: { type: "string" as const },
                },
                required: ["observation", "whyItMatters", "evidence"],
              },
            },
          },
          required: ["key", "label", "score", "weight", "findings"],
        },
      },
      recommendations: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            title: { type: "string" as const },
            description: { type: "string" as const },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["overallScore", "tier", "categories", "recommendations"],
  },
};

const WELLS_FARGO_EXAMPLE = `Here is an example of a completed audit for Wells Fargo (score 64, adequate tier):
- AI Readiness (25% weight, score 68): Deployed Fargo virtual assistant on Google Cloud AI. Lacks AI-powered personalization. Strong internal AI investment but limited customer-facing applications.
- Mobile App (25% weight, score 58): 4.7 iOS rating but declining sentiment on navigation. Bill pay requires too many taps. Lacks biometric auth for in-app actions.
- Customer Sentiment (20% weight, score 55): NPS of 12 vs industry 34. Negative social sentiment on fees. Branch satisfaction much higher than digital.
- Web Experience (15% weight, score 72): Lighthouse 88 performance, good Core Web Vitals. But fragmented design systems and low account opening completion rates.
- Accessibility (15% weight, score 61): Mostly WCAG 2.1 AA compliant but gaps in dynamic content. Inconsistent screen reader support. Poor contrast in data visualizations.

Each finding has: observation (what we found), whyItMatters (business impact), evidence (specific data points).
Recommendations are actionable and specific to the company's situation.`;

async function synthesizeAudit(
  company: CompanyInfo,
  html: string,
  pageSpeed: PageSpeedResult | null
): Promise<Omit<Audit, "id" | "company" | "generatedAt">> {
  const pageSpeedSummary = pageSpeed
    ? `PageSpeed Insights (mobile):
- Performance: ${pageSpeed.performanceScore}/100
- Accessibility: ${pageSpeed.accessibilityScore}/100
- LCP: ${Math.round(pageSpeed.lcp)}ms
- CLS: ${pageSpeed.cls.toFixed(3)}
- Max Potential FID: ${Math.round(pageSpeed.fid)}ms
- Mobile usable: ${pageSpeed.mobileUsability}`
    : "PageSpeed data unavailable — base web experience and accessibility scores on HTML analysis only.";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    tools: [AUDIT_TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "submit_audit" },
    messages: [
      {
        role: "user",
        content: `You are a CX auditor for financial services companies. Analyze the following data and produce a detailed CX audit.

COMPANY: ${company.name} (${company.sector})
WEBSITE: ${company.website}

SCORING RUBRIC:
- AI Readiness (25% weight): Chatbot/VA presence, AI features, innovation signals
- Mobile App Experience (25% weight): Mobile-friendliness, app links present, mobile-first design signals
- Customer Sentiment (20% weight): Trust signals, testimonials, complaint handling, brand messaging
- Web Experience (15% weight): PageSpeed metrics, navigation clarity, value proposition
- Accessibility (15% weight): WCAG signals, semantic HTML, contrast, assistive tech support

TIER THRESHOLDS:
- Strong: 75-100
- Adequate: 50-74
- Needs Work: 0-49

The overallScore MUST equal the weighted average of category scores (rounded to nearest integer).

${WELLS_FARGO_EXAMPLE}

COLLECTED DATA:

${pageSpeedSummary}

HOMEPAGE HTML (truncated):
${html}

Produce 5 categories with exactly 3 findings each (observation, whyItMatters, evidence) and exactly 4 recommendations. Be specific and evidence-based — reference actual content from the HTML and PageSpeed data. Do not make up specific numeric statistics that aren't supported by the data provided; instead reference qualitative observations from the website content. Use the submit_audit tool to return your analysis.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return tool_use response");
  }

  const result = toolUse.input as Omit<Audit, "id" | "company" | "generatedAt">;

  // Validate response shape
  if (
    typeof result.overallScore !== "number" ||
    !["strong", "adequate", "needs-work"].includes(result.tier) ||
    !Array.isArray(result.categories) ||
    result.categories.length !== 5 ||
    !Array.isArray(result.recommendations)
  ) {
    throw new Error("Invalid audit response shape");
  }

  return result;
}

// ── Main handler ───────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit by IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }

  // Validate input: company ID must be in our allowed list
  const { company } = req.body as { company: { id?: string } };
  if (!company?.id || typeof company.id !== "string") {
    return res.status(400).json({ error: "Missing company ID" });
  }

  const allowed = ALLOWED_COMPANIES[company.id];
  if (!allowed) {
    return res.status(400).json({ error: "Unknown company" });
  }

  // Use server-side company data, not user-supplied (prevents SSRF)
  const validatedCompany: CompanyInfo = {
    id: company.id,
    name: allowed.name,
    website: allowed.website,
    sector: allowed.sector,
  };

  try {
    // Check cache
    const { data: cached } = await supabase
      .from("audits")
      .select("audit_data, created_at")
      .eq("company_id", validatedCompany.id)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < CACHE_DAYS * 24 * 60 * 60 * 1000) {
        return res.status(200).json(cached.audit_data);
      }
    }

    // Run pipeline
    const [html, pageSpeed] = await Promise.all([
      fetchWebsite(validatedCompany.website),
      fetchPageSpeed(validatedCompany.website),
    ]);

    const auditResult = await synthesizeAudit(validatedCompany, html, pageSpeed);

    const audit: Audit = {
      id: validatedCompany.id,
      company: validatedCompany,
      ...auditResult,
      generatedAt: new Date().toISOString(),
    };

    // Cache (upsert)
    await supabase.from("audits").upsert({
      company_id: validatedCompany.id,
      audit_data: audit,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json(audit);
  } catch (error: any) {
    console.error("Audit generation failed:", error);
    return res.status(500).json({ error: "Audit generation failed" });
  }
}
