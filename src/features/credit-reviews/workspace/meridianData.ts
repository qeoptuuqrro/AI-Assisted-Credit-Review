import type { TimelineTone } from "../../../shared/ui/Timeline/Timeline";
import type { FindingId, FindingWorkflowState, SourceReviewState } from "../workflow/creditReviewState";

export type { FindingId, FindingWorkflowState, SourceReviewState } from "../workflow/creditReviewState";

export type ReviewTab = "overview" | "findings" | "financials" | "sources" | "activity" | "recommendation";
export type RiskLevel = "Material" | "Moderate";
export type SourceFreshness = "Current" | "Attention";
export type ActivityFilter = "all" | "ai" | "human" | "evidence" | "decision";

export type FindingDefinition = {
  id: FindingId;
  title: string;
  scanSummary: string;
  initialRisk: RiskLevel;
  updatedRisk?: RiskLevel;
  initialState: FindingWorkflowState;
  question: string;
  summary: string;
  whyItMatters: string;
  rationale: string[];
  assumptions: string[];
  uncertainty: string;
  summaryFacts: Array<{ label: string; value: string; updatedValue?: string }>;
  sourceIds: string[];
  challengePrompt: string;
};

export type SourceRecord = {
  id: string;
  name: string;
  type: "Financial statements" | "Bank data" | "Projections" | "Contracts" | "Credit documents";
  format: "PDF" | "XLSX";
  asOf: string;
  reviewed: string;
  freshness: SourceFreshness;
  usedIn: FindingId[];
  warning?: string;
  summary: string;
  excerpt: string;
};

export function isSourceReviewReady(source: SourceRecord, state: SourceReviewState | undefined) {
  if (state === "flagged") return false;
  return source.freshness === "Current" || state === "verified";
}

export type ReviewActivity = {
  id: string;
  type: Exclude<ActivityFilter, "all">;
  title: string;
  meta: string;
  description: string;
  tone: TimelineTone;
  detail: string;
};

export const findings: FindingDefinition[] = [
  {
    id: "customer-concentration",
    title: "Customer concentration",
    scanSummary: "Top two customers represent 61% of revenue",
    initialRisk: "Material",
    updatedRisk: "Moderate",
    initialState: "needs_judgment",
    question: "How exposed is repayment capacity to the two largest customers?",
    summary: "Two customers represent 61% of revenue, and the original analysis assumed Customer A's agreement expires within 12 months.",
    whyItMatters: "A loss or delayed renewal could reduce cash generation while Meridian is carrying higher leverage.",
    rationale: [
      "Customer A contributes 36% of revenue and Customer B contributes 25%.",
      "The original contract schedule showed Customer A expiring in March 2027.",
      "The downside forecast assumed no replacement revenue for six months after a loss.",
    ],
    assumptions: [
      "The March 2027 expiration date is still current.",
      "No enforceable renewal agreement was available in the original source set.",
      "Customer concentration remains above the bank's 50% monitoring threshold.",
    ],
    uncertainty: "The concentration percentages are verified. Contract duration is the material uncertainty that could change near-term risk.",
    summaryFacts: [
      { label: "Top-two revenue", value: "61%" },
      { label: "Monitoring threshold", value: "50%" },
      { label: "Contract term used", value: "Mar 2027", updatedValue: "Mar 2030" },
    ],
    sourceIds: ["concentration-report", "customer-a-contract", "revenue-forecast", "q2-financials"],
    challengePrompt: "Explain why the contract-expiration assumption is incomplete or incorrect.",
  },
  {
    id: "declining-margins",
    title: "Declining margins",
    scanSummary: "EBITDA margin fell 5.1 points to 9.1%",
    initialRisk: "Material",
    initialState: "needs_judgment",
    question: "Are current margins sufficient to support repayment through a downside period?",
    summary: "EBITDA margin declined from 14.2% to 9.1% as commodity and labor costs outpaced pricing actions.",
    whyItMatters: "Lower operating cushion reduces debt-service capacity and makes the forecast more sensitive to execution risk.",
    rationale: [
      "Gross margin fell 310 basis points year over year.",
      "Pricing actions are expected to recover only half of the decline during the next two quarters.",
      "Base-case fixed-charge coverage remains above policy, but the downside case falls to 1.12x.",
    ],
    assumptions: [
      "Management implements scheduled pricing actions by September.",
      "Commodity costs remain within the forecast range.",
      "No material customer volume loss occurs during repricing.",
    ],
    uncertainty: "Pricing execution has not yet been demonstrated in actual results. July order data provides only one month of confirmation.",
    summaryFacts: [
      { label: "EBITDA margin", value: "9.1%" },
      { label: "Change since 2024", value: "−5.1 pts" },
      { label: "Downside coverage", value: "1.12x" },
    ],
    sourceIds: ["q2-financials", "revenue-forecast", "board-plan"],
    challengePrompt: "Add relationship or operating context that changes the margin assessment.",
  },
  {
    id: "increasing-leverage",
    title: "Increasing leverage",
    scanSummary: "3.7x leverage · $2.1M classification open",
    initialRisk: "Moderate",
    initialState: "needs_verification",
    question: "Does Meridian retain sufficient capacity after the requested facility?",
    summary: "Pro forma debt to EBITDA increases to 3.7x, while one equipment obligation requires final classification.",
    whyItMatters: "Misclassified debt could understate leverage and reduce covenant headroom at close.",
    rationale: [
      "Funded debt increased by $9.4M over the last twelve months.",
      "Pro forma leverage is 3.7x before resolving the equipment obligation.",
      "The proposed maximum leverage covenant is 4.25x with quarterly testing.",
    ],
    assumptions: [
      "The equipment obligation is an operating lease rather than funded debt.",
      "The line is initially drawn to 65% of commitment.",
      "Trailing EBITDA includes verified normalization adjustments of $1.2M.",
    ],
    uncertainty: "Legal classification of the equipment obligation remains unverified and could add 0.2x to pro forma leverage.",
    summaryFacts: [
      { label: "Pro forma leverage", value: "3.7x" },
      { label: "Proposed maximum", value: "4.25x" },
      { label: "Unclassified obligation", value: "$2.1M" },
    ],
    sourceIds: ["debt-schedule", "credit-agreement", "q2-financials", "covenant-package"],
    challengePrompt: "Provide evidence or policy context for the equipment-obligation classification.",
  },
];

export const sources: SourceRecord[] = [
  { id: "q2-financials", name: "Q2 2026 Financials", type: "Financial statements", format: "PDF", asOf: "Jun 30, 2026", reviewed: "Jul 24, 2026", freshness: "Current", usedIn: ["customer-concentration", "declining-margins", "increasing-leverage"], summary: "Current balance sheet, income statement, and cash-flow reporting used throughout the review.", excerpt: "Net sales increased 11.8% year over year while gross margin declined to 22.4% and EBITDA margin declined to 9.1%." },
  { id: "q1-financials", name: "Q1 2026 Financials", type: "Financial statements", format: "PDF", asOf: "Mar 31, 2026", reviewed: "Jul 24, 2026", freshness: "Current", usedIn: ["declining-margins", "increasing-leverage"], summary: "Prior-quarter statements used for sequential trend and debt reconciliation.", excerpt: "Quarter-end funded debt totaled $29.6M with reported EBITDA margin of 10.4%." },
  { id: "concentration-report", name: "Customer concentration report", type: "Financial statements", format: "XLSX", asOf: "Jun 30, 2026", reviewed: "Jul 24, 2026", freshness: "Current", usedIn: ["customer-concentration"], summary: "Customer-level revenue and receivables concentration for the trailing twelve months.", excerpt: "Customer A: 36% of net sales. Customer B: 25%. Top two customers: 61%." },
  { id: "operating-statements", name: "Operating account statements", type: "Bank data", format: "PDF", asOf: "Jul 18, 2026", reviewed: "Jul 23, 2026", freshness: "Current", usedIn: ["declining-margins", "increasing-leverage"], summary: "Recent operating-account activity used to verify liquidity and cash conversion.", excerpt: "Average collected balance for the trailing 90 days was $6.8M with no overdrafts." },
  { id: "ar-aging", name: "A/R aging schedule", type: "Bank data", format: "XLSX", asOf: "Jun 30, 2026", reviewed: "Jul 23, 2026", freshness: "Current", usedIn: ["customer-concentration"], summary: "Receivable aging and dilution used in borrowing-base support.", excerpt: "92% of eligible receivables are current; Customer A represents 34% of eligible A/R." },
  { id: "revenue-forecast", name: "Revenue and margin forecast", type: "Projections", format: "XLSX", asOf: "Jun 30, 2026", reviewed: "Jul 24, 2026", freshness: "Current", usedIn: ["customer-concentration", "declining-margins"], summary: "Management's base and downside operating forecast through 2028.", excerpt: "Base-case EBITDA margin recovers to 10.8% by Q2 2027; downside fixed-charge coverage reaches a low of 1.12x." },
  { id: "board-plan", name: "Board-approved operating plan", type: "Projections", format: "PDF", asOf: "Mar 28, 2026", reviewed: "Jul 22, 2026", freshness: "Attention", warning: "Prepared before the latest commodity-cost increase", usedIn: ["declining-margins"], summary: "Annual operating plan supporting volume, pricing, and margin assumptions.", excerpt: "The plan assumes 240 basis points of gross-margin recovery from pricing and procurement actions." },
  { id: "customer-a-contract", name: "Customer A supply agreement", type: "Contracts", format: "PDF", asOf: "Mar 14, 2024", reviewed: "Jul 24, 2026", freshness: "Attention", warning: "Original agreement shows a March 2027 expiration", usedIn: ["customer-concentration"], summary: "Original Customer A agreement used by the initial assessment.", excerpt: "The initial term ends March 31, 2027 unless extended by written agreement of both parties." },
  { id: "customer-a-renewal", name: "Customer A renewal agreement", type: "Contracts", format: "PDF", asOf: "Jul 18, 2026", reviewed: "Not yet linked", freshness: "Current", usedIn: [], summary: "Executed three-year renewal supplied by the relationship team after initial analysis.", excerpt: "The parties extend the term through March 31, 2030. All minimum-purchase provisions remain in effect." },
  { id: "debt-schedule", name: "Debt schedule", type: "Credit documents", format: "XLSX", asOf: "Jun 30, 2026", reviewed: "Jul 24, 2026", freshness: "Attention", warning: "Equipment obligation classification needs verification", usedIn: ["increasing-leverage"], summary: "Outstanding debt, maturities, pricing, and equipment obligations.", excerpt: "Total funded debt: $34.8M. Equipment obligation: $2.1M, classification pending legal review." },
  { id: "credit-agreement", name: "Draft credit agreement", type: "Credit documents", format: "PDF", asOf: "Jul 21, 2026", reviewed: "Jul 24, 2026", freshness: "Current", usedIn: ["increasing-leverage"], summary: "Proposed facility structure, covenants, reporting, and borrowing-base controls.", excerpt: "Maximum total leverage ratio: 4.25x. Minimum fixed-charge coverage ratio: 1.20x." },
  { id: "covenant-package", name: "Covenant compliance package", type: "Credit documents", format: "PDF", asOf: "Jun 30, 2026", reviewed: "Jul 23, 2026", freshness: "Current", usedIn: ["increasing-leverage"], summary: "Latest lender covenant calculations and supporting adjustments.", excerpt: "Reported leverage: 3.2x. Fixed-charge coverage: 1.41x. No existing covenant defaults." },
];

export const baseActivity: ReviewActivity[] = [
  { id: "source-warning", type: "evidence", title: "Contract date flagged for review", meta: "Today, 10:25 AM", description: "Customer A's agreement appears to expire within 12 months.", tone: "warning", detail: "The source set included the original 2024 agreement and did not include a later renewal document." },
  { id: "analysis-complete", type: "ai", title: "Initial assessment completed", meta: "Today, 10:24 AM", description: "Three findings require analyst review.", tone: "neutral", detail: "The assessment used 12 approved sources and classified customer concentration and declining margins as material risks." },
  { id: "case-assigned", type: "human", title: "Review assigned to Alex Kim", meta: "Yesterday, 4:18 PM", description: "Due today.", tone: "human", detail: "Assignment created by the commercial credit review queue." },
  { id: "documents-ready", type: "evidence", title: "Source package completed", meta: "Yesterday, 3:52 PM", description: "Twelve documents passed extraction and validation.", tone: "neutral", detail: "Financial statements, debt schedule, concentration report, contracts, and bank data were approved for analysis." },
];

export const financialSeries = {
  margin: {
    label: "EBITDA margin",
    value: "9.1%",
    change: "Down 5.1 pts since 2024",
    direction: "down" as const,
    insight: "Margins remain above the downside covenant break-even, but recovery depends on pricing execution.",
    points: [14.2, 13.6, 12.8, 11.7, 10.4, 9.8, 9.1, 9.4, 9.9, 10.3, 10.8],
    labels: ["Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26F", "Q4 '26F", "Q1 '27F", "Q2 '27F"],
  },
  leverage: {
    label: "Debt / EBITDA",
    value: "3.7x",
    change: "Up 1.1x since 2024",
    direction: "up" as const,
    insight: "Pro forma leverage remains inside the proposed 4.25x covenant, with limited downside headroom.",
    points: [2.6, 2.7, 2.8, 3.0, 3.2, 3.4, 3.7, 3.6, 3.4, 3.2, 3.0],
    labels: ["Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26F", "Q4 '26F", "Q1 '27F", "Q2 '27F"],
  },
  coverage: {
    label: "Fixed-charge coverage",
    value: "1.41x",
    change: "Downside reaches 1.12x",
    direction: "down" as const,
    insight: "Base-case coverage is acceptable; the downside falls 0.08x below the proposed covenant floor.",
    points: [1.72, 1.68, 1.63, 1.55, 1.48, 1.44, 1.41, 1.36, 1.32, 1.38, 1.46],
    labels: ["Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26F", "Q4 '26F", "Q1 '27F", "Q2 '27F"],
  },
};

export type FinancialMetric = keyof typeof financialSeries;
