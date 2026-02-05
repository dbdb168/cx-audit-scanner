import type { CompanyInfo } from "../lib/types";
import { formatDate } from "../lib/utils";
import { Globe, Building2, Shield } from "lucide-react";

interface CompanyHeaderProps {
  company: CompanyInfo;
  generatedAt: string;
}

export function CompanyHeader({ company, generatedAt }: CompanyHeaderProps) {
  const sectorIcon = company.sector === "bank" ? <Building2 size={14} /> : <Shield size={14} />;
  const sectorLabel = company.sector === "bank" ? "Banking" : "Insurance";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Globe size={14} />
            {company.website}
          </span>
          <span className="flex items-center gap-1.5">
            {sectorIcon}
            {sectorLabel}
          </span>
        </div>
      </div>
      <div className="text-sm text-muted">
        Generated on {formatDate(generatedAt)}
      </div>
    </div>
  );
}
