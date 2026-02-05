import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import type { Audit } from "../lib/types";
import { companies } from "../data/companies";
import { CompanyHeader } from "./CompanyHeader";
import { ScoreGauge } from "./ScoreGauge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { FindingsPanel } from "./FindingsPanel";
import { Recommendations } from "./Recommendations";
import { LoadingState } from "./LoadingState";
import { ArrowLeft, ChevronDown } from "lucide-react";

export function AuditResults() {
  const { companyId } = useParams<{ companyId: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const fetchStarted = useRef(false);

  const company = companies.find((c) => c.id === companyId);

  useEffect(() => {
    if (!company || fetchStarted.current) return;
    fetchStarted.current = true;

    fetch("/api/generate-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data: Audit) => {
        setAudit(data);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [company]);

  // Transition to results when both API and animation are done
  useEffect(() => {
    if (audit && animationDone) {
      setLoading(false);
    }
  }, [audit, animationDone]);

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Company not found</p>
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to generate audit</p>
        <p className="text-sm text-muted">{error}</p>
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
        <LoadingState onComplete={() => setAnimationDone(true)} />
      </div>
    );
  }

  if (!audit) return null;

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
                including website performance metrics (Core Web Vitals),
                accessibility audits (WCAG 2.1), homepage content analysis, and
                AI-powered synthesis using industry benchmarks.
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
