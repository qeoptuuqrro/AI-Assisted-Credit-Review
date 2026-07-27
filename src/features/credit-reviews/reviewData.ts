import type { StatusPillTone } from "../../shared/ui/StatusPill/StatusPill";
import type { TimelineTone } from "../../shared/ui/Timeline/Timeline";
import type { ReviewCompanyName } from "./companyLogos";

export type ReviewScope = "mine" | "all";
export type ReviewStatus = "needs-attention" | "in-review" | "ready-for-decision" | "completed";
export type AIReviewState = "needs-judgment" | "needs-verification" | "analysis-ready" | "analysis-updated" | "review-complete";
export type ReviewFacilityType = "Revolving line" | "Term loan";

export const standardReviewSlugs = [
  "brightline-energy",
  "lakeview-medical",
  "cedar-ridge-packaging",
  "atlas-logistics",
  "harbor-retail",
  "pioneer-components",
  "westfield-produce",
  "apex-manufacturing",
  "redwood-distribution",
  "stonebridge-healthcare",
  "summit-industrial",
  "oakridge-services",
] as const;

export type StandardReviewSlug = (typeof standardReviewSlugs)[number];
export type StandardReviewSection = "findings" | "sources" | "activity" | "recommendation";
export type StandardReviewPath =
  | `/credit-reviews/${StandardReviewSlug}`
  | `/credit-reviews/${StandardReviewSlug}/${StandardReviewSection}`
  | `/credit-reviews/${StandardReviewSlug}/senior-decision/review`;

export type ReviewSource = {
  id: string;
  name: string;
  meta: string;
  summary: string;
};

export type ReviewFinding = {
  id: string;
  title: string;
  description: string;
  detail: string;
  risk: "Material" | "Moderate" | "Low";
  status: string;
  tone: StatusPillTone;
  sourceId: string;
  policy: string;
  nextStep: string;
  change?: { from: string; to: string };
};

export type ReviewMetric = {
  label: string;
  value: string;
  detail: string;
  detailTone?: "neutral" | "positive" | "negative";
};

export type ReviewActivity = {
  id: string;
  title: string;
  meta: string;
  description: string;
  tone: TimelineTone;
  details: string;
};

export type ReviewRecommendation = {
  title: string;
  rationale: string;
  conditions: string[];
  nextStep: string;
  tone: StatusPillTone;
};

export type StandardReviewDetails = {
  decisionQuestion: string;
  assessment: string;
  posture: string;
  term: string;
  purpose: string;
  metrics: ReviewMetric[];
  findings: ReviewFinding[];
  sources: ReviewSource[];
  activity: ReviewActivity[];
  recommendation: ReviewRecommendation;
};

export type CreditReview = {
  company: ReviewCompanyName;
  slug: "meridian-foods" | "northstar-health" | StandardReviewSlug;
  request: string;
  facilityType: ReviewFacilityType;
  aiReviewState: AIReviewState;
  aiReviewDetail?: string;
  statusLabel?: string;
  statusTone?: StatusPillTone;
  owner: "Alex Kim" | "Jordan Lee";
  due: string;
  dueGroup: "urgent" | "this-week";
  status: ReviewStatus;
  details?: StandardReviewDetails;
};

export const aiReviewStatus: Record<AIReviewState, { label: string; tone: StatusPillTone }> = {
  "needs-judgment": { label: "Needs judgment", tone: "warning" },
  "needs-verification": { label: "Needs verification", tone: "danger" },
  "analysis-ready": { label: "Analysis ready", tone: "neutral" },
  "analysis-updated": { label: "Analysis updated", tone: "info" },
  "review-complete": { label: "Review complete", tone: "success" },
};

export function getAIReviewLabel(review: Pick<CreditReview, "aiReviewState" | "statusLabel">) {
  return review.statusLabel ?? aiReviewStatus[review.aiReviewState].label;
}

export function getAIReviewTone(review: Pick<CreditReview, "aiReviewState" | "statusTone">) {
  return review.statusTone ?? aiReviewStatus[review.aiReviewState].tone;
}

export function isStandardReview(review: CreditReview): review is CreditReview & { slug: StandardReviewSlug; details: StandardReviewDetails } {
  return Boolean(review.details);
}

export function getStandardReview(slug: StandardReviewSlug) {
  return reviews.find((review): review is CreditReview & { slug: StandardReviewSlug; details: StandardReviewDetails } => review.slug === slug && Boolean(review.details));
}

export function getStandardReviewPath(slug: StandardReviewSlug, section?: StandardReviewSection): StandardReviewPath {
  return section ? `/credit-reviews/${slug}/${section}` : `/credit-reviews/${slug}`;
}

export function getPrimaryReviewSection(state: AIReviewState): StandardReviewSection | undefined {
  if (state === "needs-judgment") return "findings";
  if (state === "needs-verification") return "sources";
  if (state === "review-complete") return "recommendation";
  return undefined;
}

type SourceSeed = [id: string, name: string, meta: string, summary: string];

function sources(primary: SourceSeed, secondary: SourceSeed): ReviewSource[] {
  return [
    { id: primary[0], name: primary[1], meta: primary[2], summary: primary[3] },
    { id: secondary[0], name: secondary[1], meta: secondary[2], summary: secondary[3] },
    { id: "q2-financials", name: "Q2 2026 Financials", meta: "PDF · Reviewed Jul 24, 2026", summary: "Current income statement, balance sheet, and cash-flow reporting used in the initial assessment." },
    { id: "debt-schedule", name: "Debt and covenant schedule", meta: "XLSX · Reviewed Jul 23, 2026", summary: "Outstanding debt, maturities, covenant definitions, and pro forma facility obligations." },
  ];
}

function activity(company: string, analysisEvent: string, evidenceEvent: string): ReviewActivity[] {
  return [
    { id: "analysis", title: analysisEvent, meta: "Today · 9:42 AM", description: `Initial analysis for ${company} was refreshed against current evidence.`, tone: "ai", details: "The system preserved source citations and separated calculated observations from analyst-owned judgment." },
    { id: "evidence", title: evidenceEvent, meta: "Yesterday · 4:18 PM", description: "The document was matched to the case and included in the current review.", tone: "neutral", details: "Document identity, review time, and affected calculations remain attributable in the evidence record." },
    { id: "assignment", title: "Review assigned to Alex Kim", meta: "Jul 22 · 11:06 AM", description: "Ownership and due date were confirmed for the active review cycle.", tone: "human", details: "Assignment created from the portfolio review queue." },
  ];
}

export const reviews: CreditReview[] = [
  {
    company: "Meridian Foods", slug: "meridian-foods", request: "$18M working-capital line", facilityType: "Revolving line",
    aiReviewState: "needs-judgment", aiReviewDetail: "3 open", statusLabel: "Analyst review", owner: "Alex Kim", due: "Today", dueGroup: "urgent", status: "needs-attention",
  },
  {
    company: "Northstar Health", slug: "northstar-health", request: "$15M revolving line", facilityType: "Revolving line",
    aiReviewState: "needs-verification", aiReviewDetail: "1 item", owner: "Alex Kim", due: "Tomorrow", dueGroup: "urgent", status: "needs-attention",
  },
  {
    company: "Brightline Energy", slug: "brightline-energy", request: "$11M revolving line", facilityType: "Revolving line",
    aiReviewState: "needs-judgment", aiReviewDetail: "1 finding", owner: "Alex Kim", due: "Jul 29", dueGroup: "this-week", status: "needs-attention",
    details: {
      decisionQuestion: "Does contracted cash flow sufficiently protect an $11M liquidity line from merchant-power volatility?",
      assessment: "Contracted revenue supports the request, but the unhedged merchant tail creates a judgment point around advance availability and covenant headroom.",
      posture: "Proceed with a borrowing limit tied to contracted receipts", term: "3 years", purpose: "Working capital and collateral posting",
      metrics: [
        { label: "Contracted revenue", value: "78%", detail: "Next 24 months", detailTone: "positive" },
        { label: "Downside FCCR", value: "1.24x", detail: "1.20x policy floor" },
        { label: "Merchant exposure", value: "22%", detail: "+6 pts after 2027", detailTone: "negative" },
      ],
      findings: [{ id: "merchant-exposure", title: "Merchant-price exposure", description: "Unhedged generation increases after two contracts roll off in 2027.", detail: "The base case maintains coverage, but a 15% power-price decline compresses fixed-charge coverage to 1.24x. The structure should distinguish contracted receipts from merchant revenue.", risk: "Moderate", status: "Needs judgment", tone: "warning", sourceId: "contract-schedule", policy: "Downside fixed-charge coverage ≥ 1.20x", nextStep: "Confirm whether borrowing availability should step down as contracts expire." }],
      sources: sources(["contract-schedule", "Power purchase agreement schedule", "XLSX · Reviewed Jul 25, 2026", "Counterparty, term, price, volume, and expiry details for Brightline's contracted generation."], ["price-sensitivity", "Merchant price sensitivity", "PDF · Reviewed Jul 25, 2026", "Management's merchant-price cases and the associated cash-flow sensitivity." ]),
      activity: activity("Brightline Energy", "Merchant-price sensitivity recalculated", "Contract schedule replaced with signed counterparties"),
      recommendation: { title: "Proceed with conditions", rationale: "Contracted receipts provide adequate primary support while a stepped availability mechanism limits exposure as contracts expire.", conditions: ["Tie availability to eligible contracted receipts", "Quarterly hedge and contract-rolloff reporting", "Minimum fixed-charge coverage of 1.20x"], nextStep: "Analyst must confirm the availability step-down before recommendation.", tone: "warning" },
    },
  },
  {
    company: "Lakeview Medical", slug: "lakeview-medical", request: "$7.5M revolving line", facilityType: "Revolving line",
    aiReviewState: "analysis-updated", owner: "Alex Kim", due: "Jul 29", dueGroup: "this-week", status: "needs-attention",
    details: {
      decisionQuestion: "Do updated reimbursement records resolve the receivables uncertainty in Lakeview's liquidity request?",
      assessment: "New payer evidence reduced the modeled denial rate and improved availability, while collection timing remains modestly slower than peers.",
      posture: "Analysis improved after verified reimbursement evidence", term: "2 years", purpose: "Seasonal reimbursement timing",
      metrics: [
        { label: "Eligible A/R", value: "$10.2M", detail: "+$1.1M after update", detailTone: "positive" },
        { label: "Denial rate", value: "4.8%", detail: "Was 7.2%", detailTone: "positive" },
        { label: "Days sales outstanding", value: "61", detail: "Peer median 54 days", detailTone: "negative" },
      ],
      findings: [{ id: "reimbursement-update", title: "Reimbursement evidence", description: "Verified payer remittances lowered the modeled denial rate from 7.2% to 4.8%.", detail: "The updated remittance sample reconciles to the general ledger and supports a larger eligible receivables base. DSO remains above the peer median and should be monitored.", risk: "Low", status: "Updated", tone: "info", sourceId: "remittance-sample", policy: "A/R eligibility excludes balances over 90 days and unresolved denials", nextStep: "Review the changed borrowing-base result and retain monthly aging reporting.", change: { from: "Moderate", to: "Low" } }],
      sources: sources(["remittance-sample", "Payer remittance sample", "ZIP · Verified Jul 26, 2026", "A verified sample of commercial and government payer remittances reconciled to billed receivables."], ["ar-aging", "A/R aging and denial report", "XLSX · Reviewed Jul 25, 2026", "Patient and payer receivables aging, denial reason, and recovery status." ]),
      activity: activity("Lakeview Medical", "Eligibility analysis updated", "Payer remittance sample verified"),
      recommendation: { title: "Proceed with monitoring", rationale: "Verified remittance evidence supports the requested line while monthly aging reporting addresses slower collection timing.", conditions: ["Monthly payer aging and denial reporting", "Exclude balances over 90 days", "Springing availability review if DSO exceeds 70 days"], nextStep: "Review the updated analysis before preparing the recommendation.", tone: "info" },
    },
  },
  {
    company: "Cedar Ridge Packaging", slug: "cedar-ridge-packaging", request: "$14M term loan", facilityType: "Term loan",
    aiReviewState: "needs-judgment", aiReviewDetail: "1 finding", owner: "Alex Kim", due: "Jul 30", dueGroup: "this-week", status: "needs-attention",
    details: {
      decisionQuestion: "Can Cedar Ridge fund acquisition integration without weakening debt-service capacity below policy?",
      assessment: "The combined company supports the loan in the base case, but management's integration savings and near-term capex overlap require structural judgment.",
      posture: "Proceed only with staged capex and synergy controls", term: "5 years", purpose: "Acquisition refinancing and plant integration",
      metrics: [
        { label: "Pro forma leverage", value: "3.5x", detail: "Policy guide 3.75x" },
        { label: "Downside DSCR", value: "1.18x", detail: "Below 1.20x guide", detailTone: "negative" },
        { label: "Synergies in EBITDA", value: "19%", detail: "$3.2M run-rate" },
      ],
      findings: [{ id: "integration-plan", title: "Integration and capex overlap", description: "The downside case depends on $3.2M of savings while two plant projects remain active.", detail: "Without half of planned synergies, debt-service coverage falls to 1.18x. A staged capex basket or delayed draw would preserve liquidity through integration.", risk: "Material", status: "Needs judgment", tone: "warning", sourceId: "integration-budget", policy: "Downside debt-service coverage ≥ 1.20x", nextStep: "Select a staged funding structure and set a synergy reporting cadence." }],
      sources: sources(["integration-budget", "Integration budget and milestones", "XLSX · Reviewed Jul 24, 2026", "Workstream-level costs, savings, owners, and timing for the acquired plants."], ["capex-plan", "Plant capital plan", "PDF · Reviewed Jul 24, 2026", "Committed and discretionary capital projects across the combined manufacturing footprint." ]),
      activity: activity("Cedar Ridge Packaging", "Integration downside case completed", "Plant capital plan linked to the acquisition model"),
      recommendation: { title: "Proceed with a staged structure", rationale: "Base-case capacity is adequate, but staging discretionary capex reduces reliance on unproven integration savings.", conditions: ["Cap discretionary plant spend at $2M until synergies are verified", "Quarterly integration milestone reporting", "Minimum DSCR of 1.20x"], nextStep: "Analyst must select and document the staged structure.", tone: "warning" },
    },
  },
  {
    company: "Atlas Logistics", slug: "atlas-logistics", request: "$8.5M term loan", facilityType: "Term loan",
    aiReviewState: "analysis-ready", owner: "Alex Kim", due: "Jul 29", dueGroup: "this-week", status: "in-review",
    details: {
      decisionQuestion: "Does fleet-renewal cash flow support the requested term debt through a softer freight cycle?",
      assessment: "Normalized cash flow covers the fleet program with adequate downside headroom and no unresolved evidence gaps.",
      posture: "Analysis ready for analyst review", term: "4 years", purpose: "Fleet replacement",
      metrics: [
        { label: "Downside DSCR", value: "1.31x", detail: "+0.11x to policy", detailTone: "positive" },
        { label: "Fleet age after renewal", value: "3.8 yrs", detail: "From 6.1 years", detailTone: "positive" },
        { label: "Customer retention", value: "92%", detail: "Top 20 accounts" },
      ],
      findings: [{ id: "fleet-renewal", title: "Fleet renewal capacity", description: "Replacement savings offset most of the new debt service in the downside case.", detail: "Lower maintenance expense and improved fuel efficiency contribute $1.4M annually. Coverage remains above policy with freight volume 10% below plan.", risk: "Low", status: "Analysis ready", tone: "neutral", sourceId: "fleet-plan", policy: "Downside debt-service coverage ≥ 1.20x", nextStep: "Confirm maintenance savings are treated consistently in the final credit memo." }],
      sources: sources(["fleet-plan", "Fleet replacement schedule", "XLSX · Reviewed Jul 25, 2026", "Unit-level purchase timing, retirement proceeds, maintenance history, and fuel assumptions."], ["customer-retention", "Customer retention report", "PDF · Reviewed Jul 24, 2026", "Contract renewal and revenue retention for Atlas's largest freight accounts." ]),
      activity: activity("Atlas Logistics", "Fleet-renewal analysis completed", "Unit replacement schedule reconciled to vendor quotes"),
      recommendation: { title: "Proceed with standard protections", rationale: "Downside coverage and fleet economics support the request without relying on aggressive volume growth.", conditions: ["Minimum DSCR of 1.20x", "Annual fleet and maintenance report", "No distributions while a covenant default exists"], nextStep: "Analyst review is required before the recommendation can move to decision.", tone: "neutral" },
    },
  },
  {
    company: "Harbor Retail", slug: "harbor-retail", request: "$12M asset-based line", facilityType: "Revolving line",
    aiReviewState: "analysis-updated", owner: "Alex Kim", due: "Jul 30", dueGroup: "this-week", status: "in-review",
    details: {
      decisionQuestion: "Does the updated borrowing base provide reliable availability through Harbor's seasonal inventory build?",
      assessment: "Updated eligibility removed slow-moving inventory and lowered peak availability, but the revised base still supports the seasonal need.",
      posture: "Revised availability supports a smaller seasonal cushion", term: "2 years", purpose: "Seasonal inventory and working capital",
      metrics: [
        { label: "Eligible collateral", value: "$16.8M", detail: "Was $19.1M", detailTone: "negative" },
        { label: "Peak availability", value: "$3.4M", detail: "After requested draw" },
        { label: "Inventory ineligible", value: "14%", detail: "+5 pts after aging update", detailTone: "negative" },
      ],
      findings: [{ id: "borrowing-base-update", title: "Borrowing-base eligibility", description: "The revised certificate excludes $2.3M of aged and seasonal inventory.", detail: "The updated base remains sufficient for the requested line, but cushion is narrower during the October build. Weekly reporting should begin when availability falls below $2M.", risk: "Moderate", status: "Updated", tone: "info", sourceId: "borrowing-base", policy: "Minimum excess availability of $1.5M", nextStep: "Review the lower peak cushion and proposed reporting trigger.", change: { from: "$5.7M", to: "$3.4M" } }],
      sources: sources(["borrowing-base", "Updated borrowing base certificate", "XLSX · Verified Jul 26, 2026", "Receivables and inventory eligibility after removing aged and slow-moving collateral."], ["inventory-aging", "Inventory aging report", "XLSX · Reviewed Jul 25, 2026", "SKU-level inventory aging, turns, markdowns, and seasonal classification." ]),
      activity: activity("Harbor Retail", "Borrowing-base availability recalculated", "Updated borrowing base certificate verified"),
      recommendation: { title: "Proceed with enhanced reporting", rationale: "The revised base covers the seasonal need while a tighter reporting trigger protects against collateral deterioration.", conditions: ["Weekly reporting below $2M availability", "Minimum excess availability of $1.5M", "Exclude inventory aged over 365 days"], nextStep: "Review the changed availability before preparing the final recommendation.", tone: "info" },
    },
  },
  {
    company: "Pioneer Components", slug: "pioneer-components", request: "$10M term loan", facilityType: "Term loan",
    aiReviewState: "analysis-ready", owner: "Alex Kim", due: "Jul 31", dueGroup: "this-week", status: "in-review",
    details: {
      decisionQuestion: "Can program backlog offset Pioneer's customer concentration over the proposed loan term?",
      assessment: "Signed program awards support capacity, although two automotive platforms account for a large share of projected EBITDA.",
      posture: "Analysis ready with concentration protections", term: "5 years", purpose: "Automation equipment",
      metrics: [
        { label: "Top-two revenue", value: "49%", detail: "Two vehicle programs", detailTone: "negative" },
        { label: "Awarded backlog", value: "$42M", detail: "2.6 years coverage", detailTone: "positive" },
        { label: "Downside DSCR", value: "1.27x", detail: "+0.07x to policy" },
      ],
      findings: [{ id: "program-concentration", title: "Customer and program concentration", description: "Two awarded platforms represent 49% of forecast revenue.", detail: "Awards are signed and tooling is underway, but a launch delay would tighten 2027 coverage. Monthly launch reporting keeps this observable before full debt-service ramp.", risk: "Moderate", status: "Analysis ready", tone: "neutral", sourceId: "program-awards", policy: "Material concentration requires monitored mitigants", nextStep: "Confirm launch milestones and the reporting condition in the memo." }],
      sources: sources(["program-awards", "Customer program awards", "PDF · Reviewed Jul 25, 2026", "Signed award notices, expected volumes, platform life, and launch timing."], ["launch-plan", "Program launch plan", "XLSX · Reviewed Jul 24, 2026", "Tooling, validation, hiring, and production milestones for the concentrated programs." ]),
      activity: activity("Pioneer Components", "Program concentration analysis completed", "Signed award notices matched to forecast volumes"),
      recommendation: { title: "Proceed with milestone reporting", rationale: "Signed backlog and adequate downside coverage support the equipment loan while launch reporting addresses concentration timing.", conditions: ["Monthly reporting through both program launches", "Minimum DSCR of 1.20x", "Lender notice for launch delays over 30 days"], nextStep: "Analyst review is required before the recommendation can move to decision.", tone: "neutral" },
    },
  },
  {
    company: "Westfield Produce", slug: "westfield-produce", request: "$6.5M revolving line", facilityType: "Revolving line",
    aiReviewState: "needs-verification", aiReviewDetail: "2 items", owner: "Alex Kim", due: "Aug 1", dueGroup: "this-week", status: "in-review",
    details: {
      decisionQuestion: "Is Westfield's perishable inventory and receivables base reliable enough to support seasonal borrowing?",
      assessment: "The requested line fits normalized seasonality, but two collateral schedules do not reconcile to the June general ledger.",
      posture: "Verification required before availability can be concluded", term: "2 years", purpose: "Seasonal crop purchases",
      metrics: [
        { label: "Reported collateral", value: "$9.1M", detail: "Subject to verification" },
        { label: "Unreconciled variance", value: "$740K", detail: "Inventory and A/R", detailTone: "negative" },
        { label: "Peak seasonal need", value: "$5.8M", detail: "August–October" },
      ],
      findings: [
        { id: "inventory-reconciliation", title: "Inventory reconciliation", description: "Cold-storage inventory exceeds the general ledger by $460K.", detail: "Lot-level quantities were dated two business days after the ledger close. A same-date reconciliation is required before applying an advance rate.", risk: "Material", status: "Needs verification", tone: "danger", sourceId: "inventory-report", policy: "Collateral schedules must reconcile to the general ledger", nextStep: "Obtain a June 30 lot-level inventory reconciliation." },
        { id: "ar-reconciliation", title: "Receivables reconciliation", description: "The customer aging differs from the control account by $280K.", detail: "The variance appears concentrated in grower pass-through invoices, but the supporting detail has not been supplied.", risk: "Material", status: "Needs verification", tone: "danger", sourceId: "ar-aging", policy: "A/R control variance must be resolved before eligibility", nextStep: "Verify the pass-through invoice population and refresh eligibility." },
      ],
      sources: sources(["inventory-report", "Cold-storage inventory report", "XLSX · Needs verification · Jul 25, 2026", "Lot-level produce inventory by storage location, age, and reported cost."], ["ar-aging", "Customer A/R aging", "XLSX · Needs verification · Jul 25, 2026", "Customer balances, invoice aging, disputes, and grower pass-through items." ]),
      activity: activity("Westfield Produce", "Collateral analysis paused", "June collateral schedules received with variances"),
      recommendation: { title: "Verify before proceeding", rationale: "Seasonal need appears supportable, but collateral reliability cannot be concluded until both schedules reconcile.", conditions: ["Same-date inventory reconciliation", "Resolved A/R control variance", "Weekly collateral reporting during peak season"], nextStep: "Resolve both verification items before preparing a recommendation.", tone: "danger" },
    },
  },
  {
    company: "Apex Manufacturing", slug: "apex-manufacturing", request: "$20M term loan", facilityType: "Term loan",
    aiReviewState: "review-complete", owner: "Alex Kim", due: "Jul 30", dueGroup: "this-week", status: "ready-for-decision",
    details: {
      decisionQuestion: "Should Apex receive $20M for capacity expansion under the proposed leverage and covenant package?",
      assessment: "All evidence and findings are complete. Contracted demand and downside coverage support the expansion with standard leverage controls.",
      posture: "Ready for credit decision", term: "6 years", purpose: "Capacity expansion",
      metrics: [
        { label: "Pro forma leverage", value: "3.1x", detail: "0.6x inside policy", detailTone: "positive" },
        { label: "Downside DSCR", value: "1.34x", detail: "+0.14x to policy", detailTone: "positive" },
        { label: "Contracted backlog", value: "$68M", detail: "2.2 years revenue" },
      ],
      findings: [{ id: "expansion-capacity", title: "Expansion repayment capacity", description: "Contracted backlog and existing free cash flow support the capacity plan.", detail: "The downside case delays 30% of incremental volume and still maintains 1.34x coverage. All supporting contracts were verified.", risk: "Low", status: "Complete", tone: "success", sourceId: "backlog", policy: "Downside debt-service coverage ≥ 1.20x", nextStep: "Present the completed recommendation to the credit approver." }],
      sources: sources(["backlog", "Contracted backlog schedule", "XLSX · Verified Jul 25, 2026", "Customer orders, cancellation terms, delivery timing, and contribution margin."], ["expansion-budget", "Expansion budget and draw schedule", "PDF · Reviewed Jul 24, 2026", "Vendor bids, contingency, draw timing, and construction milestones." ]),
      activity: activity("Apex Manufacturing", "Review completed and recommendation prepared", "Contracted backlog fully verified"),
      recommendation: { title: "Approve with conditions", rationale: "Contracted backlog, manageable leverage, and resilient downside coverage support the expansion request.", conditions: ["Maximum total leverage of 3.75x", "Minimum DSCR of 1.20x", "Construction draw controls and 10% contingency"], nextStep: "Credit approver owns the final decision.", tone: "success" },
    },
  },
  {
    company: "Redwood Distribution", slug: "redwood-distribution", request: "$16M revolving line", facilityType: "Revolving line",
    aiReviewState: "analysis-updated", owner: "Alex Kim", due: "Jul 31", dueGroup: "this-week", status: "ready-for-decision",
    details: {
      decisionQuestion: "Does Redwood's revised customer-diversification plan support a $16M distribution line?",
      assessment: "A new national account lowered concentration and improved the downside case; the updated recommendation is ready for human confirmation.",
      posture: "Updated recommendation ready for decision review", term: "3 years", purpose: "Inventory and receivables funding",
      metrics: [
        { label: "Top customer", value: "24%", detail: "Was 31%", detailTone: "positive" },
        { label: "Availability cushion", value: "$4.6M", detail: "At seasonal peak" },
        { label: "Downside FCCR", value: "1.28x", detail: "+0.08x to policy" },
      ],
      findings: [{ id: "customer-update", title: "Customer concentration update", description: "A signed national account reduces top-customer exposure from 31% to 24%.", detail: "The contract begins in September and includes a two-year minimum volume commitment. The downside case excludes uncommitted expansion volume.", risk: "Moderate", status: "Updated", tone: "info", sourceId: "customer-contract", policy: "Material customer concentration requires documented mitigants", nextStep: "Confirm the revised concentration language before decision.", change: { from: "High", to: "Moderate" } }],
      sources: sources(["customer-contract", "National account agreement", "PDF · Verified Jul 26, 2026", "Signed term, minimum volume, pricing, termination, and payment provisions."], ["borrowing-base", "Pro forma borrowing base", "XLSX · Reviewed Jul 25, 2026", "Projected receivables and inventory eligibility including the new account." ]),
      activity: activity("Redwood Distribution", "Customer concentration assessment updated", "National account agreement verified"),
      recommendation: { title: "Approve with concentration reporting", rationale: "The signed account improves diversification and maintains adequate borrowing-base cushion in the downside case.", conditions: ["Quarterly customer concentration reporting", "Minimum excess availability of $2M", "Annual field examination"], nextStep: "Credit approver should confirm the changed recommendation.", tone: "info" },
    },
  },
  {
    company: "Stonebridge Healthcare", slug: "stonebridge-healthcare", request: "$13M term loan", facilityType: "Term loan",
    aiReviewState: "review-complete", owner: "Alex Kim", due: "Aug 1", dueGroup: "this-week", status: "ready-for-decision",
    details: {
      decisionQuestion: "Should Stonebridge receive acquisition financing given stable referrals and reimbursement mix?",
      assessment: "The review is complete. Verified census, referral, and reimbursement evidence supports the acquisition at moderate leverage.",
      posture: "Ready for credit decision", term: "5 years", purpose: "Outpatient clinic acquisition",
      metrics: [
        { label: "Pro forma leverage", value: "2.9x", detail: "Policy guide 3.5x", detailTone: "positive" },
        { label: "Downside DSCR", value: "1.37x", detail: "+0.17x to policy", detailTone: "positive" },
        { label: "Government payers", value: "46%", detail: "Stable year over year" },
      ],
      findings: [{ id: "referral-stability", title: "Referral and census stability", description: "Verified referral sources support the acquired clinic's base-case volume.", detail: "No single physician group represents more than 14% of referrals. The downside case assumes an 8% census decline and remains above policy.", risk: "Low", status: "Complete", tone: "success", sourceId: "referral-report", policy: "Downside debt-service coverage ≥ 1.20x", nextStep: "Present the completed recommendation to the credit approver." }],
      sources: sources(["referral-report", "Referral and census report", "XLSX · Verified Jul 25, 2026", "Referral source, procedure volume, payer, and location trends for the acquired clinic."], ["purchase-agreement", "Executed purchase agreement", "PDF · Reviewed Jul 24, 2026", "Purchase consideration, holdbacks, working capital, and closing conditions." ]),
      activity: activity("Stonebridge Healthcare", "Review completed and recommendation prepared", "Referral and census report verified"),
      recommendation: { title: "Approve with standard conditions", rationale: "Diversified referrals, stable reimbursement, and resilient downside coverage support the acquisition.", conditions: ["Minimum DSCR of 1.20x", "Quarterly census and payer-mix reporting", "No additional acquisitions without lender consent"], nextStep: "Credit approver owns the final decision.", tone: "success" },
    },
  },
  {
    company: "Summit Industrial", slug: "summit-industrial", request: "$9M term loan", facilityType: "Term loan",
    aiReviewState: "needs-verification", aiReviewDetail: "2 items", owner: "Jordan Lee", due: "Aug 1", dueGroup: "this-week", status: "needs-attention",
    details: {
      decisionQuestion: "Can Summit's equipment request be assessed using the current backlog and debt records?",
      assessment: "Analysis is paused because the backlog detail conflicts with the forecast and one equipment obligation is absent from the debt schedule.",
      posture: "Evidence conflicts must be resolved", term: "5 years", purpose: "Production equipment",
      metrics: [
        { label: "Reported backlog", value: "$27M", detail: "$4.2M variance", detailTone: "negative" },
        { label: "Unscheduled debt", value: "$1.1M", detail: "Equipment obligation", detailTone: "negative" },
        { label: "Coverage", value: "—", detail: "Paused pending verification" },
      ],
      findings: [
        { id: "backlog-variance", title: "Backlog variance", description: "The customer schedule exceeds forecast backlog by $4.2M.", detail: "Three purchase orders included in the schedule are missing from the approved forecast. Their status and cancellation terms must be verified.", risk: "Material", status: "Needs verification", tone: "danger", sourceId: "backlog-detail", policy: "Material forecast inputs must reconcile to source evidence", nextStep: "Reconcile the three purchase orders to the approved forecast." },
        { id: "debt-omission", title: "Debt schedule omission", description: "A $1.1M equipment obligation appears in bank statements but not the debt schedule.", detail: "The recurring payment is consistent with a financing lease. Agreement terms are required before leverage and coverage can be calculated.", risk: "Material", status: "Needs verification", tone: "danger", sourceId: "bank-statements", policy: "All funded obligations must be included in leverage", nextStep: "Obtain the equipment agreement and refresh the debt schedule." },
      ],
      sources: sources(["backlog-detail", "Customer backlog detail", "XLSX · Needs verification · Jul 25, 2026", "Customer purchase orders, delivery dates, status, and cancellation terms."], ["bank-statements", "Operating account statements", "PDF · Needs verification · Jul 24, 2026", "Account activity showing a recurring equipment payment not listed in reported debt." ]),
      activity: activity("Summit Industrial", "Repayment analysis paused", "Backlog and bank-statement exceptions identified"),
      recommendation: { title: "Resolve evidence before proceeding", rationale: "Repayment capacity cannot be concluded while backlog and funded-debt inputs remain contradictory.", conditions: ["Reconciled backlog schedule", "Complete equipment obligation terms", "Refreshed leverage and downside coverage"], nextStep: "Resolve both verification items before preparing a recommendation.", tone: "danger" },
    },
  },
  {
    company: "Oakridge Services", slug: "oakridge-services", request: "$6M revolving line", facilityType: "Revolving line",
    aiReviewState: "review-complete", owner: "Jordan Lee", due: "Jul 25", dueGroup: "this-week", status: "completed",
    details: {
      decisionQuestion: "Was the approved $6M line supported by recurring service revenue and adequate liquidity?",
      assessment: "The review and decision are complete. Recurring contracts, low leverage, and stable collections supported approval with standard reporting.",
      posture: "Approved · Decision recorded Jul 25", term: "3 years", purpose: "General working capital",
      metrics: [
        { label: "Recurring revenue", value: "84%", detail: "Contracted services", detailTone: "positive" },
        { label: "Downside FCCR", value: "1.42x", detail: "+0.22x to policy", detailTone: "positive" },
        { label: "Total leverage", value: "1.8x", detail: "At closing" },
      ],
      findings: [{ id: "contract-retention", title: "Contract retention", description: "Recurring service agreements provide stable repayment support.", detail: "Customer retention remained above 94% across three years and no single contract exceeds 11% of revenue.", risk: "Low", status: "Complete", tone: "success", sourceId: "contract-report", policy: "Recurring revenue assumptions require contract support", nextStep: "No action required; retain the decision record for monitoring." }],
      sources: sources(["contract-report", "Service contract retention report", "XLSX · Verified Jul 24, 2026", "Contract renewal, churn, pricing, and customer concentration history."], ["decision-record", "Executed credit approval", "PDF · Signed Jul 25, 2026", "Final approval, conditions, voting record, and effective date." ]),
      activity: [
        { id: "decision", title: "Credit decision recorded: Approved", meta: "Jul 25 · 3:16 PM", description: "Jordan Lee recorded the approval and confirmed all closing conditions.", tone: "human", details: "Approved for $6M over three years with quarterly reporting and a 1.20x minimum fixed-charge coverage covenant." },
        ...activity("Oakridge Services", "Review completed and recommendation submitted", "Service contract retention report verified"),
      ],
      recommendation: { title: "Approved", rationale: "Recurring service revenue, low leverage, and resilient downside coverage supported the $6M line.", conditions: ["Minimum FCCR of 1.20x", "Quarterly financial reporting", "Annual customer concentration report"], nextStep: "Decision recorded by Jordan Lee on Jul 25, 2026.", tone: "success" },
    },
  },
];
