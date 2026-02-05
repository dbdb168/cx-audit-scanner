import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Audit } from "../lib/types";
import { CompanyHeader } from "./CompanyHeader";
import { ScoreGauge } from "./ScoreGauge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { FindingsPanel } from "./FindingsPanel";
import { Recommendations } from "./Recommendations";
import { LoadingState } from "./LoadingState";
import { ArrowLeft, ChevronDown, ArrowUpRight, MessageCircle } from "lucide-react";

import wellsFargoData from "../data/wells-fargo.json";

const audits: Record<string, Audit> = {
  "wells-fargo": wellsFargoData as Audit,
};

interface AuditResultsProps {
  showLoading?: boolean;
}

export function AuditResults({ showLoading = false }: AuditResultsProps) {
  const { companyId } = useParams<{ companyId: string }>();
  const [loading, setLoading] = useState(showLoading);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const audit = companyId ? audits[companyId] : undefined;

  if (!audit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Audit not found</p>
        <Link
          to="/"
          className="text-sm text-accent hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <LoadingState onComplete={() => setLoading(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        {/* Company header */}
        <CompanyHeader
          company={audit.company}
          generatedAt={audit.generatedAt}
        />

        {/* Score + Categories row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 rounded-lg border border-border bg-card p-6 flex items-center justify-center">
            <ScoreGauge score={audit.overallScore} tier={audit.tier} />
          </div>
          <div className="md:col-span-3">
            <CategoryBreakdown categories={audit.categories} />
          </div>
        </div>

        {/* Findings */}
        <div className="mt-6">
          <FindingsPanel categories={audit.categories} />
        </div>

        {/* Recommendations */}
        <div className="mt-6">
          <Recommendations recommendations={audit.recommendations} />
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-lg border border-accent/30 bg-gradient-to-r from-accent/5 to-accent/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Interested in {audit.company.name}?</h3>
            <p className="text-sm text-muted-foreground">
              See how they score as a prospect, or get in touch to discuss these findings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/company/${audit.company.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-card-hover transition-colors"
            >
              View in Account Scorer
              <ArrowUpRight size={14} />
            </a>
            <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-muted transition-colors cursor-pointer">
              <MessageCircle size={14} />
              Reach Out
            </button>
          </div>
        </div>

        {/* Methodology */}
        <div className="mt-6 rounded-lg border border-border bg-card">
          <button
            onClick={() => setMethodologyOpen(!methodologyOpen)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-card-hover transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium">Methodology</span>
            <ChevronDown
              size={16}
              className={`text-muted transition-transform ${
                methodologyOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {methodologyOpen && (
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
              <p>
                This CX audit evaluates financial services companies across five
                key dimensions: AI Readiness, Mobile App Experience, Customer
                Sentiment, Web Experience, and Accessibility. Each category is
                weighted based on its impact on overall customer experience.
              </p>
              <p>
                Scores are derived from a combination of public data sources
                including app store reviews, website performance metrics (Core
                Web Vitals), accessibility audits (WCAG 2.1), social media
                sentiment analysis, industry reports, and competitive
                benchmarking.
              </p>
              <p>
                The overall score is a weighted average of category scores. Tier
                ratings are assigned as: Strong (75-100), Adequate (50-74), and
                Needs Work (0-49).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted">
          CX Audit Scanner — BuildFirst prototype
        </div>
      </div>
    </div>
  );
}
