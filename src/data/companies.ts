import type { CompanyInfo } from "../lib/types";

export interface CompanyListItem extends CompanyInfo {
  hasAudit: boolean;
}

export const companies: CompanyListItem[] = [
  { id: "wells-fargo", name: "Wells Fargo", website: "wellsfargo.com", sector: "bank", hasAudit: true },
  { id: "jpmorgan-chase", name: "JPMorgan Chase", website: "chase.com", sector: "bank", hasAudit: false },
  { id: "bank-of-america", name: "Bank of America", website: "bankofamerica.com", sector: "bank", hasAudit: false },
  { id: "citigroup", name: "Citigroup", website: "citi.com", sector: "bank", hasAudit: false },
  { id: "us-bancorp", name: "U.S. Bancorp", website: "usbank.com", sector: "bank", hasAudit: false },
  { id: "pnc-financial", name: "PNC Financial", website: "pnc.com", sector: "bank", hasAudit: false },
  { id: "truist-financial", name: "Truist Financial", website: "truist.com", sector: "bank", hasAudit: false },
  { id: "capital-one", name: "Capital One", website: "capitalone.com", sector: "bank", hasAudit: false },
  { id: "td-bank", name: "TD Bank", website: "td.com", sector: "bank", hasAudit: false },
  { id: "goldman-sachs", name: "Goldman Sachs", website: "goldmansachs.com", sector: "bank", hasAudit: false },
  { id: "state-farm", name: "State Farm", website: "statefarm.com", sector: "insurance", hasAudit: false },
  { id: "progressive", name: "Progressive", website: "progressive.com", sector: "insurance", hasAudit: false },
  { id: "allstate", name: "Allstate", website: "allstate.com", sector: "insurance", hasAudit: false },
  { id: "geico", name: "GEICO", website: "geico.com", sector: "insurance", hasAudit: false },
  { id: "usaa", name: "USAA", website: "usaa.com", sector: "insurance", hasAudit: false },
  { id: "liberty-mutual", name: "Liberty Mutual", website: "libertymutual.com", sector: "insurance", hasAudit: false },
  { id: "nationwide", name: "Nationwide", website: "nationwide.com", sector: "insurance", hasAudit: false },
  { id: "travelers", name: "Travelers", website: "travelers.com", sector: "insurance", hasAudit: false },
  { id: "metlife", name: "MetLife", website: "metlife.com", sector: "insurance", hasAudit: false },
  { id: "prudential", name: "Prudential", website: "prudential.com", sector: "insurance", hasAudit: false },
];
