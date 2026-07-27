import type { SourceRecord, SourceReviewState } from "./meridianData";

export type SourceExtractionField = {
  label: string;
  value: string;
  context: string;
  attention?: boolean;
};

type SourceReviewPresentation = {
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
};

const sourceFields: Record<string, SourceExtractionField[]> = {
  "q2-financials": [
    { label: "Net sales", value: "$128.4M", context: "Q2 2026" },
    { label: "EBITDA", value: "$11.7M", context: "9.1% margin" },
    { label: "Cash from operations", value: "$8.6M", context: "Quarter to date" },
    { label: "Funded debt", value: "$34.8M", context: "Quarter end" },
  ],
  "q1-financials": [
    { label: "Net sales", value: "$117.1M", context: "Q1 2026" },
    { label: "EBITDA margin", value: "10.4%", context: "Down 1.6 pts YoY" },
    { label: "Funded debt", value: "$29.6M", context: "Quarter end" },
  ],
  "concentration-report": [
    { label: "Customer A", value: "36%", context: "Trailing revenue" },
    { label: "Customer B", value: "25%", context: "Trailing revenue" },
    { label: "Top two customers", value: "61%", context: "Monitoring threshold: 50%", attention: true },
  ],
  "operating-statements": [
    { label: "Average collected balance", value: "$6.8M", context: "Trailing 90 days" },
    { label: "Overdrafts", value: "0", context: "Trailing 90 days" },
    { label: "Primary operating account", value: "••0297", context: "BCGX Bank" },
  ],
  "ar-aging": [
    { label: "Eligible A/R current", value: "92%", context: "As of Jun 30" },
    { label: "Customer A share", value: "34%", context: "Eligible receivables", attention: true },
    { label: "A/R over 90 days", value: "3%", context: "Eligible receivables" },
  ],
  "revenue-forecast": [
    { label: "Q2 2027 EBITDA margin", value: "10.8%", context: "Base case" },
    { label: "Lowest coverage", value: "1.12x", context: "Downside case", attention: true },
    { label: "Forecast horizon", value: "2028", context: "Management case" },
  ],
  "board-plan": [
    { label: "Gross-margin recovery", value: "+240 bps", context: "Board plan" },
    { label: "Commodity-cost update", value: "Excluded", context: "Latest increase", attention: true },
    { label: "Plan approved", value: "Mar 28, 2026", context: "Before latest actuals" },
  ],
  "customer-a-contract": [
    { label: "Agreement end", value: "Mar 31, 2027", context: "Original term", attention: true },
    { label: "Counterparty", value: "Customer A", context: "36% of revenue" },
    { label: "Minimum purchases", value: "In effect", context: "Through original term" },
  ],
  "customer-a-renewal": [
    { label: "Extended through", value: "Mar 31, 2030", context: "Three-year renewal" },
    { label: "Executed", value: "Jul 18, 2026", context: "Both parties" },
    { label: "Minimum purchases", value: "Preserved", context: "No change" },
  ],
  "debt-schedule": [
    { label: "Total funded debt", value: "$34.8M", context: "Pro forma" },
    { label: "Equipment obligation", value: "$2.1M", context: "Classification pending", attention: true },
    { label: "Pro forma leverage", value: "3.70x", context: "Before reclassification" },
  ],
  "credit-agreement": [
    { label: "Maximum leverage", value: "4.25x", context: "Quarterly test" },
    { label: "Minimum coverage", value: "1.20x", context: "Quarterly test" },
    { label: "Facility term", value: "3 years", context: "$18M revolver" },
  ],
  "covenant-package": [
    { label: "Reported leverage", value: "3.20x", context: "Jun 30, 2026" },
    { label: "Fixed-charge coverage", value: "1.41x", context: "Jun 30, 2026" },
    { label: "Existing defaults", value: "None", context: "Latest certificate" },
  ],
};

export const relatedSourceIds: Partial<Record<string, string>> = {
  "customer-a-contract": "customer-a-renewal",
  "customer-a-renewal": "customer-a-contract",
};

export function getSourceExtractionFields(source: SourceRecord) {
  return sourceFields[source.id] ?? [
    { label: "Reporting date", value: source.asOf, context: source.format },
    { label: "Review status", value: source.freshness, context: source.reviewed },
  ];
}

export function getSourceReviewPresentation(source: SourceRecord, state: SourceReviewState | undefined, renewalLinked: boolean): SourceReviewPresentation {
  if (source.id === "customer-a-renewal" && renewalLinked) return { label: "Current evidence", tone: "success" };
  if (state === "verified") return { label: "Verified", tone: "success" };
  if (state === "flagged") return { label: "Discrepancy flagged", tone: "danger" };
  if (source.freshness === "Attention") return { label: "Needs review", tone: "warning" };
  return { label: "Ready", tone: "neutral" };
}
