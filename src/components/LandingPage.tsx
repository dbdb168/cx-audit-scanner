import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companies } from "../data/companies";
import { Search, ArrowRight, Building2, Shield } from "lucide-react";

export function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = query
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : companies;

  const handleCompanyClick = (id: string, hasAudit: boolean) => {
    if (hasAudit) {
      navigate(`/audit/${id}`);
    }
  };

  const handleGenerate = () => {
    const match = companies.find((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    if (match?.hasAudit) {
      navigate(`/audit/${match.id}/loading`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            CX Audit Scanner
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            AI-powered customer experience audits for financial services.
            Analyze digital touchpoints, sentiment, accessibility, and AI
            readiness across banks and insurers.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Enter a company name or URL"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-muted transition-colors cursor-pointer"
            >
              Generate Audit
            </button>
          </div>
        </div>

        {/* Company grid */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Companies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanyClick(company.id, company.hasAudit)}
                className={`group relative flex items-center gap-3 rounded-lg border p-4 text-left transition-all cursor-pointer ${
                  company.hasAudit
                    ? "border-border bg-card hover:bg-card-hover hover:border-accent/50"
                    : "border-border/50 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted">
                  {company.sector === "bank" ? (
                    <Building2 size={14} />
                  ) : (
                    <Shield size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">
                    {company.name}
                  </span>
                  <span className="text-xs text-muted">
                    {company.sector === "bank" ? "Banking" : "Insurance"}
                  </span>
                </div>
                {company.hasAudit ? (
                  <ArrowRight
                    size={14}
                    className="text-muted group-hover:text-accent transition-colors flex-shrink-0"
                  />
                ) : (
                  <span className="text-[10px] text-muted uppercase tracking-wider flex-shrink-0">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted">
          CX Audit Scanner — BuildFirst prototype
        </div>
      </div>
    </div>
  );
}
