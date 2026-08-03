import type { AppPath } from "../../app/router";
import { standardReviewSlugs } from "../credit-reviews/reviewData";
import type { DemoPresetId } from "../credit-reviews/workflow/creditReviewState";

export type DesignOptionStatus = "current" | "candidate" | "archived";

// Legacy area names remain in the type because frozen design-history artifacts
// still describe them. Active Design Tools options use the screen-area names.
export type DesignOptionArea =
  | "workspace-overview"
  | "overview"
  | "financials"
  | "activity"
  | "source-review"
  | "credit-review-journey"
  | "case-workspace"
  | "findings-overview"
  | "finding-investigation"
  | "reassessment"
  | "recommendation-decision"
  | "senior-review-queue"
  | "senior-decision"
  | "credit-review-queue"
  | "design-tools"
  | "utility-bar"
  | "product-reference";

export type ActiveDesignOptionArea = Extract<DesignOptionArea, "workspace-overview" | "credit-review-queue" | "design-tools" | "utility-bar" | "overview" | "financials" | "activity" | "source-review" | "case-workspace" | "findings-overview" | "reassessment" | "recommendation-decision" | "senior-review-queue" | "senior-decision" | "product-reference">;

export type DesignOption = {
  id: string;
  area: ActiveDesignOptionArea;
  areaLabel: string;
  version: `V${number}`;
  name: string;
  status: DesignOptionStatus;
  route: AppPath;
  preset?: DemoPresetId;
  renderKey: "workspace-balanced-dashboard" | "workspace-operating-dashboard" | "workspace-trend-flow-dashboard" | "workspace-refined-momentum-dashboard" | "account-view" | "object-led" | "signature" | "card-stack" | "treasury" | "card-grid" | "timeline" | "activity-ledger" | "activity-connected-timeline" | "ledger" | "focused" | "compact-blocker" | "stateful-review" | "coherent-finding-states" | "finding-layout-lab" | "finding-decision-workspace" | "inline-dossier" | "focused-reassessment" | "insight-led-reassessment" | "attributable-insight-brief" | "breathable-judgment-reassessment" | "attributable-analysis-reassessment" | "attributable-decision-review" | "evidence-first-decision-review" | "verification-led-decision-review" | "recommendation-current" | "recommendation-open-canvas" | "recommendation-icon-led" | "recommendation-focused-lifecycle" | "recommendation-full-screen-lifecycle" | "senior-review-submission-queue" | "senior-review-decision-inbox" | "senior-decision-dense-brief" | "senior-decision-focused-layer" | "senior-decision-full-screen-review" | "senior-decision-command-center" | "senior-decision-unified-brief" | "senior-decision-aligned-workflow" | "credit-review-overlay-drawer" | "credit-review-responsive-drawer" | "credit-review-outcome-drawer" | "design-tools-stacked-accordion" | "design-tools-navigator" | "utility-documentation-label" | "utility-rationale-control" | "reimbursements-ledger" | "reimbursements-responsive-drawer";
  hypothesis: string;
};

export const designOptions = [
  {
    id: "workspace-overview-v1-balanced-modules",
    area: "workspace-overview",
    areaLabel: "Workspace overview",
    version: "V1",
    name: "Balanced status dashboard",
    status: "archived",
    route: "/",
    renderKey: "workspace-balanced-dashboard",
    hypothesis: "Two equal status modules and three repeated operational cards expose every aggregate at once, but duplicate the same queue counts and delay the next actionable review.",
  },
  {
    id: "workspace-overview-v2-operating-dashboard",
    area: "workspace-overview",
    areaLabel: "Workspace overview",
    version: "V2",
    name: "Portfolio command view",
    status: "current",
    route: "/",
    renderKey: "workspace-operating-dashboard",
    hypothesis: "An interactive six-week portfolio-flow chart beside a logo-led personal action queue makes queue growth, bottlenecks, deadlines, and the next review visible without a redundant KPI-card row.",
  },
  {
    id: "workspace-overview-v3-trend-flow-chart",
    area: "workspace-overview",
    areaLabel: "Workspace overview",
    version: "V3",
    name: "Trend flow chart",
    status: "candidate",
    route: "/",
    renderKey: "workspace-trend-flow-dashboard",
    hypothesis: "An inspected area chart makes total queue momentum and the needs-attention trend easier to read while preserving the exact selected-week status mix and the action-led Overview structure.",
  },
  {
    id: "workspace-overview-v4-momentum-mix",
    area: "workspace-overview",
    areaLabel: "Workspace overview",
    version: "V4",
    name: "Momentum + mix",
    status: "candidate",
    route: "/",
    renderKey: "workspace-refined-momentum-dashboard",
    hypothesis: "One calm workload momentum line plus a compact selected-week workflow strip removes chart noise while preserving exact attention, review, and decision-ready counts.",
  },
  {
    id: "credit-review-queue-v1-overlay-drawer",
    area: "credit-review-queue",
    areaLabel: "Credit review queue",
    version: "V1",
    name: "Overlay preview",
    status: "archived",
    route: "/credit-reviews",
    renderKey: "credit-review-overlay-drawer",
    hypothesis: "A compact overlay preserves the full-width queue, but covers part of the ledger and weakens simultaneous list-and-detail review.",
  },
  {
    id: "credit-review-queue-v2-responsive-rail",
    area: "credit-review-queue",
    areaLabel: "Credit review queue",
    version: "V2",
    name: "Responsive detail rail",
    status: "archived",
    route: "/credit-reviews",
    renderKey: "credit-review-responsive-drawer",
    hypothesis: "A 392px in-layout rail keeps the selected review visible, condenses the queue to its priority fields, and contains long evidence inside the drawer.",
  },
  {
    id: "credit-review-queue-v3-outcome-preview",
    area: "credit-review-queue",
    areaLabel: "Credit review queue",
    version: "V3",
    name: "Outcome-led preview",
    status: "current",
    route: "/credit-reviews",
    renderKey: "credit-review-outcome-drawer",
    hypothesis: "The proven responsive rail leads with company identity and request, separates evidence prerequisites from findings, removes repetitive AI framing, and turns finding cards into one icon-led decision ledger with one contextual action.",
  },
  {
    id: "design-tools-v1-stacked-accordion",
    area: "design-tools",
    areaLabel: "Design tools",
    version: "V1",
    name: "Stacked accordion",
    status: "archived",
    route: "/credit-reviews",
    renderKey: "design-tools-stacked-accordion",
    hypothesis: "Stacking workflow states, production screens, references, and expanded versions in one rail exposes the full inventory, but creates a long page and makes nested content difficult to reach.",
  },
  {
    id: "design-tools-v2-navigator",
    area: "design-tools",
    areaLabel: "Design tools",
    version: "V2",
    name: "Compact navigator",
    status: "current",
    route: "/credit-reviews",
    renderKey: "design-tools-navigator",
    hypothesis: "Dedicated Screens, States, and References modes with search and version drill-in keep the panel compact while preserving every saved direction and workflow shortcut.",
  },
  {
    id: "utility-bar-v1-persistent-documentation",
    area: "utility-bar",
    areaLabel: "Workspace utility bar",
    version: "V1",
    name: "Persistent documentation label",
    status: "archived",
    route: "/design-system",
    renderKey: "utility-documentation-label",
    hypothesis: "An always-visible Documentation label makes the global support action explicit, but gives a secondary utility too much permanent space and visual weight.",
  },
  {
    id: "utility-bar-v2-progressive-rationale",
    area: "utility-bar",
    areaLabel: "Workspace utility bar",
    version: "V2",
    name: "Progressive rationale control",
    status: "current",
    route: "/design-system",
    renderKey: "utility-rationale-control",
    hypothesis: "A compact book icon reveals its Documentation label on hover or keyboard focus, then opens page-aware design rationale without permanently occupying utility-bar space.",
  },
  {
    id: "overview-v1-card-stack",
    area: "overview",
    areaLabel: "Overview",
    version: "V1",
    name: "Card stack",
    status: "archived",
    route: "/credit-reviews/meridian-foods",
    renderKey: "card-stack",
    hypothesis: "A conventional assessment card and three metric cards make the hierarchy easy to understand, but create too many equal surfaces.",
  },
  {
    id: "overview-v2-signature-assessment",
    area: "overview",
    areaLabel: "Overview",
    version: "V2",
    name: "Signature assessment",
    status: "archived",
    route: "/credit-reviews/meridian-foods",
    renderKey: "signature",
    hypothesis: "A Vault-like status strip, split decision artifact, and flat priorities create a more distinctive and breathable opening.",
  },
  {
    id: "overview-v3-object-led",
    area: "overview",
    areaLabel: "Overview",
    version: "V3",
    name: "Object-led decision",
    status: "archived",
    route: "/credit-reviews/meridian-foods",
    renderKey: "object-led",
    hypothesis: "A tangible facility object and three evidence-led decision signals make the credit structure—not the automated assessment—the visual protagonist.",
  },
  {
    id: "overview-v4-account-view",
    area: "overview",
    areaLabel: "Overview",
    version: "V4",
    name: "Credit account view",
    status: "current",
    route: "/credit-reviews/meridian-foods",
    renderKey: "account-view",
    hypothesis: "An Accounts-style request summary beside one real repayment-capacity chart creates a quieter opening, followed by an Accounting-style review ledger.",
  },
  {
    id: "case-workspace-v1-compact-blocker",
    area: "case-workspace",
    areaLabel: "Northstar workspace",
    version: "V1",
    name: "Compact evidence blocker",
    status: "archived",
    route: "/credit-reviews/northstar-health",
    renderKey: "compact-blocker",
    hypothesis: "A two-tab blocker keeps the missing forecast immediately actionable, but makes the same credit-review product feel structurally different and leaves no durable home for later financials, sources, or findings.",
  },
  {
    id: "case-workspace-v2-stateful-review",
    area: "case-workspace",
    areaLabel: "Northstar workspace",
    version: "V2",
    name: "Stateful review workspace",
    status: "archived",
    route: "/credit-reviews/northstar-health",
    renderKey: "stateful-review",
    hypothesis: "A stable case shell with honest blocked and empty states preserves orientation while keeping evidence requirements distinct from findings.",
  },
  {
    id: "case-workspace-v3-coherent-finding-states",
    area: "case-workspace",
    areaLabel: "Northstar workspace",
    version: "V3",
    name: "Coherent finding states",
    status: "current",
    route: "/credit-reviews/northstar-health/findings",
    renderKey: "coherent-finding-states",
    hypothesis: "The stable case shell remains, while a structured prerequisite or zero-findings object uses the same icon, status, evidence, action, keyboard, and responsive hierarchy as every other findings workspace.",
  },
  {
    id: "standard-findings-v1-layout-lab",
    area: "findings-overview",
    areaLabel: "Standard findings",
    version: "V1",
    name: "Flexible layout lab",
    status: "archived",
    route: "/credit-reviews/brightline-energy/findings",
    renderKey: "finding-layout-lab",
    hypothesis: "Split, cards, and queue modes expose useful comparisons, but make layout selection compete with the analyst's review task and leave risk implicit inside workflow status.",
  },
  {
    id: "standard-findings-v2-decision-workspace",
    area: "findings-overview",
    areaLabel: "Standard findings",
    version: "V2",
    name: "Decision workspace",
    status: "current",
    route: "/credit-reviews/brightline-energy/findings",
    renderKey: "finding-decision-workspace",
    hypothesis: "One selected-ledger workspace separates risk severity from workflow status, shares the Meridian scan rhythm, and keeps the evidence and accountable analyst action visible without a layout control.",
  },
  {
    id: "financials-v1-card-grid",
    area: "financials",
    areaLabel: "Financials",
    version: "V1",
    name: "Card grid",
    status: "archived",
    route: "/credit-reviews/meridian-foods/financials",
    renderKey: "card-grid",
    hypothesis: "Repeated metric and driver cards expose every value but give scenarios and assumptions the same visual weight.",
  },
  {
    id: "financials-v2-treasury-workspace",
    area: "financials",
    areaLabel: "Financials",
    version: "V2",
    name: "Treasury workspace",
    status: "current",
    route: "/credit-reviews/meridian-foods/financials",
    renderKey: "treasury",
    hypothesis: "An open split composition and direct scenario ledger make covenant posture clearer without decorative rails.",
  },
  {
    id: "activity-v1-timeline",
    area: "activity",
    areaLabel: "Activity",
    version: "V1",
    name: "Decision timeline",
    status: "archived",
    route: "/credit-reviews/meridian-foods/activity",
    renderKey: "timeline",
    hypothesis: "An expandable vertical chronology makes causality explicit, but gives routine events too much visual weight.",
  },
  {
    id: "activity-v2-ledger",
    area: "activity",
    areaLabel: "Activity",
    version: "V2",
    name: "Attributable ledger",
    status: "archived",
    route: "/credit-reviews/meridian-foods/activity",
    renderKey: "activity-ledger",
    hypothesis: "A flat chronological ledger improves scanning while retaining filters and expandable supporting context.",
  },
  {
    id: "activity-v3-connected-timeline",
    area: "activity",
    areaLabel: "Activity",
    version: "V3",
    name: "Connected event timeline",
    status: "current",
    route: "/credit-reviews/meridian-foods/activity",
    renderKey: "activity-connected-timeline",
    hypothesis: "Round event icons and a continuous chronology make evidence, analyst actions, reassessments, and decisions easier to follow without losing attributable details.",
  },
  {
    id: "source-review-v1-ledger-drawer",
    area: "source-review",
    areaLabel: "Source review",
    version: "V1",
    name: "Ledger and drawer",
    status: "archived",
    route: "/credit-reviews/meridian-foods/sources",
    renderKey: "ledger",
    hypothesis: "A compact drawer preserves the list, but gives document review too little space and keeps the task text-heavy.",
  },
  {
    id: "source-review-v2-focused-verification",
    area: "source-review",
    areaLabel: "Source review",
    version: "V2",
    name: "Focused verification",
    status: "current",
    route: "/credit-reviews/meridian-foods/sources",
    renderKey: "focused",
    hypothesis: "A document artifact beside extracted facts creates a credible, single-purpose verification workspace.",
  },
  {
    id: "reassessment-v1-inline-dossier",
    area: "reassessment",
    areaLabel: "AI assessment",
    version: "V1",
    name: "Inline dossier",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    renderKey: "inline-dossier",
    hypothesis: "The complete assessment, evidence set, challenge form, and judgment action remain visible in one long case page.",
  },
  {
    id: "reassessment-v2-focused-change",
    area: "reassessment",
    areaLabel: "AI assessment",
    version: "V2",
    name: "Focused change review",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    renderKey: "focused-reassessment",
    hypothesis: "A Treasury-style assessment surface and a short focused flow make new context, reassessment, and human judgment legible as separate decisions.",
  },
  {
    id: "reassessment-v3-insight-brief",
    area: "reassessment",
    areaLabel: "AI assessment",
    version: "V3",
    name: "Insight-led assessment brief",
    status: "candidate",
    route: "/credit-reviews/meridian-foods/findings/declining-margins",
    preset: "meridian-margin-reassessment-ready",
    renderKey: "insight-led-reassessment",
    hypothesis: "One shared before-and-after brief keeps the working conclusion, verified change, and remaining evidence gap legible without equal-weight cards or repeated status language.",
  },
  {
    id: "reassessment-v4-breathable-judgment",
    area: "reassessment",
    areaLabel: "AI assessment",
    version: "V4",
    name: "Breathable analyst judgment",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    preset: "meridian-reassessment-ready",
    renderKey: "breathable-judgment-reassessment",
    hypothesis: "A wider vertical authoring surface separates the read-only AI baseline from a two-position analyst risk toggle, giving both options enough explanation and making human ownership unmistakable.",
  },
  {
    id: "reassessment-v5-attributable-analysis",
    area: "reassessment",
    areaLabel: "Finding review",
    version: "V5",
    name: "Attributable analysis",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    preset: "meridian-reassessment-ready",
    renderKey: "attributable-analysis-reassessment",
    hypothesis: "Evidence, scoped analysis, and analyst judgment form the visible workflow; model attribution remains preserved in supporting context without turning every heading, alert, preview, and action into AI branding.",
  },
  {
    id: "reassessment-v6-attributable-insight-brief",
    area: "reassessment",
    areaLabel: "Finding review",
    version: "V6",
    name: "Attributable insight brief",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    preset: "meridian-reassessment-ready",
    renderKey: "attributable-insight-brief",
    hypothesis: "A single insight brief leads with the verified change, residual exposure, and system conclusion, then hands the analyst one clear judgment action without repeating the same risk in stacked cards.",
  },
  {
    id: "reassessment-v7-attributable-decision-review",
    area: "reassessment",
    areaLabel: "Finding review",
    version: "V7",
    name: "Structured decision review",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    preset: "meridian-reassessment-ready",
    renderKey: "attributable-decision-review",
    hypothesis: "A contained before-and-after decision band, one rule-separated change ledger, and one credible analytical object preserve V5's scan path while removing repeated risk labels and excess card chrome.",
  },
  {
    id: "reassessment-v8-evidence-first-decision-review",
    area: "reassessment",
    areaLabel: "Finding review",
    version: "V8",
    name: "Evidence-first decision review",
    status: "archived",
    route: "/credit-reviews/meridian-foods/findings/customer-concentration",
    preset: "meridian-start",
    renderKey: "evidence-first-decision-review",
    hypothesis: "One coherent evidence record, explicit intake alternatives, a scoped pre-analysis review, and an analyst-owned judgment surface make verification, reassessment, and human decision ownership clear in sequence.",
  },
  {
    id: "reassessment-v9-verification-led-brief",
    area: "reassessment",
    areaLabel: "Finding review",
    version: "V9",
    name: "Capacity-first verification brief",
    status: "current",
    route: "/credit-reviews/meridian-foods/findings/increasing-leverage",
    preset: "meridian-start",
    renderKey: "verification-led-decision-review",
    hypothesis: "A dominant leverage position beside one explicit evidence gate makes capacity, covenant headroom, and the next analyst action scannable without repeating the same blocker in a notice and sticky footer.",
  },
  {
    id: "recommendation-decision-v1-credit-memo",
    area: "recommendation-decision",
    areaLabel: "Analyst recommendation",
    version: "V1",
    name: "Credit memo handoff",
    status: "archived",
    route: "/credit-reviews/meridian-foods/recommendation",
    preset: "meridian-recommendation-ready",
    renderKey: "recommendation-current",
    hypothesis: "A two-part handoff keeps the analyst form and senior-facing decision record visible together, but the raised surfaces can feel dense at a glance.",
  },
  {
    id: "recommendation-decision-v2-open-canvas",
    area: "recommendation-decision",
    areaLabel: "Analyst recommendation",
    version: "V2",
    name: "Guided recommendation",
    status: "candidate",
    route: "/credit-reviews/meridian-foods/recommendation",
    preset: "meridian-recommendation-ready",
    renderKey: "recommendation-open-canvas",
    hypothesis: "A focused section rail, readiness strip, and readable single-column canvas turn a dense memo form into a calm, accountable analyst workflow.",
  },
  {
    id: "recommendation-decision-v3-icon-led",
    area: "recommendation-decision",
    areaLabel: "Analyst recommendation",
    version: "V3",
    name: "Review-led handoff",
    status: "candidate",
    route: "/credit-reviews/meridian-foods/recommendation",
    preset: "meridian-recommendation-ready",
    renderKey: "recommendation-icon-led",
    hypothesis: "An open evidence brief and contained sticky composer keep the credit story visible while one action surface owns the analyst recommendation.",
  },
  {
    id: "recommendation-decision-v4-focused-lifecycle",
    area: "recommendation-decision",
    areaLabel: "Analyst recommendation",
    version: "V4",
    name: "Focused recommendation lifecycle",
    status: "candidate",
    route: "/credit-reviews/meridian-foods/recommendation",
    preset: "meridian-recommendation-ready",
    renderKey: "recommendation-focused-lifecycle",
    hypothesis: "A gated handoff, focused guided drafting task, optional case-context rail, and durable submitted record separate readiness, authorship, and review without making Recommendation a permanent peer task.",
  },
  {
    id: "recommendation-decision-v5-full-screen-lifecycle",
    area: "recommendation-decision",
    areaLabel: "Analyst recommendation",
    version: "V5",
    name: "Full-screen recommendation",
    status: "current",
    route: "/credit-reviews/meridian-foods/recommendation/draft",
    preset: "meridian-recommendation-ready",
    renderKey: "recommendation-full-screen-lifecycle",
    hypothesis: "A resumable full-screen task removes ordinary navigation during authorship, keeps the four-step recommendation readable, and returns the analyst to a durable case record after exit or submission.",
  },
  {
    id: "senior-review-queue-v1-submissions",
    area: "senior-review-queue",
    areaLabel: "Senior review queue",
    version: "V1",
    name: "Submission queue",
    status: "archived",
    route: "/credit-reviews/senior",
    preset: "senior-review-ready",
    renderKey: "senior-review-submission-queue",
    hypothesis: "A category queue and selected-review rail let senior credit triage submitted recommendations before entering the focused decision workspace.",
  },
  {
    id: "senior-review-queue-v2-decision-inbox",
    area: "senior-review-queue",
    areaLabel: "Senior review queue",
    version: "V2",
    name: "Restrained decision inbox",
    status: "current",
    route: "/credit-reviews/senior",
    preset: "senior-review-ready",
    renderKey: "senior-review-decision-inbox",
    hypothesis: "A flat stage-led ledger stays quiet until a reviewer selects a case, then opens one concise responsive decision preview with no redundant KPI tile, decorative facility card, or repeated evidence summary.",
  },
  {
    id: "senior-decision-v1-dense-brief",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V1",
    name: "Dense decision brief",
    status: "archived",
    route: "/credit-reviews/meridian-foods/senior-decision",
    preset: "senior-review-ready",
    renderKey: "senior-decision-dense-brief",
    hypothesis: "A complete brief and final-decision form keep every artifact visible, but the AI summary, finding columns, and approval controls compete for attention.",
  },
  {
    id: "senior-decision-v2-focused-layer",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V2",
    name: "Focused decision layer",
    status: "candidate",
    route: "/credit-reviews/meridian-foods/senior-decision",
    preset: "senior-review-ready",
    renderKey: "senior-decision-focused-layer",
    hypothesis: "A focused task layer leads with the analyst recommendation, reduces findings to a readable outcome ledger, and keeps one contained final-decision surface visible.",
  },
  {
    id: "senior-decision-v3-full-screen-review",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V3",
    name: "Full-screen senior review",
    status: "archived",
    route: "/credit-reviews/meridian-foods/senior-decision/review",
    preset: "senior-review-ready",
    renderKey: "senior-decision-full-screen-review",
    hypothesis: "A resumable full-screen decision task preserves a readable analyst record beside one accountable senior action, while exit, supporting links, and completion all return to the durable case record.",
  },
  {
    id: "senior-decision-v4-command-center",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V4",
    name: "Decision command center",
    status: "archived",
    route: "/credit-reviews/meridian-foods/senior-decision/review",
    preset: "senior-review-ready",
    renderKey: "senior-decision-command-center",
    hypothesis: "A quiet decision brief makes the facility and analyst recommendation the protagonist, keeps finding outcomes in a flat ledger, and reserves one compact composer for the accountable senior action.",
  },
  {
    id: "senior-decision-v5-unified-brief",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V5",
    name: "Reference-aligned review flow",
    status: "archived",
    route: "/credit-reviews/meridian-foods/senior-decision/review",
    preset: "senior-review-ready",
    renderKey: "senior-decision-unified-brief",
    hypothesis: "A quiet identity bar, centered narrow review measure, flat decision rows, and content-aligned actions make the senior task feel deliberate without dashboard scaffolding.",
  },
  {
    id: "senior-decision-v6-aligned-workflow",
    area: "senior-decision",
    areaLabel: "Senior decision",
    version: "V6",
    name: "Aligned decision workflow",
    status: "current",
    route: "/credit-reviews/meridian-foods/senior-decision/review",
    preset: "senior-review-ready",
    renderKey: "senior-decision-aligned-workflow",
    hypothesis: "A compact ruled identity bar, peripheral short rail, centered judgment measure, matched detail ledgers, and action-only footer make the senior decision feel continuous and deliberate.",
  },
  {
    id: "product-reference-v1-reimbursements",
    area: "product-reference",
    areaLabel: "Product references",
    version: "V1",
    name: "Reimbursements ledger",
    status: "current",
    route: "/reimbursements",
    renderKey: "reimbursements-ledger",
    hypothesis: "A preserved finance ledger demonstrates the table, filter, drawer, bulk-action, and creation patterns without entering the lending product navigation.",
  },
  {
    id: "product-reference-v2-responsive-drawer",
    area: "product-reference",
    areaLabel: "Product references",
    version: "V2",
    name: "Responsive drawer rail",
    status: "candidate",
    route: "/reimbursements",
    renderKey: "reimbursements-responsive-drawer",
    hypothesis: "A measured 392px detail rail shrinks the ledger in place, keeps the selected row visible, and contains overflow within a viewport-capped drawer body.",
  },
] as const satisfies readonly DesignOption[];

export function getDesignOption(id: string | null | undefined): DesignOption | undefined {
  return designOptions.find((option) => option.id === id);
}

export function getCurrentDesignOption(area: ActiveDesignOptionArea): DesignOption | undefined {
  return designOptions.find((option) => option.area === area && option.status === "current");
}

export function getDesignAreaForPath(pathname: AppPath): ActiveDesignOptionArea | undefined {
  if (pathname === "/design-system") return "utility-bar";
  if (pathname === "/" || pathname === "/overview") return "workspace-overview";
  if (pathname === "/credit-reviews") return "credit-review-queue";
  if (pathname === "/credit-reviews/senior") return "senior-review-queue";
  if (pathname === "/reimbursements") return "product-reference";
  if (pathname.includes("/senior-decision/review")) return "senior-decision";

  if (pathname.startsWith("/credit-reviews/northstar-health")) {
    return "case-workspace";
  }

  if (standardReviewSlugs.some((slug) => pathname === `/credit-reviews/${slug}/findings`)) {
    return "findings-overview";
  }

  if (pathname === "/credit-reviews/meridian-foods") return "overview";
  if (pathname.startsWith("/credit-reviews/meridian-foods/findings/")) return "reassessment";
  if (pathname === "/credit-reviews/meridian-foods/financials") return "financials";
  if (pathname === "/credit-reviews/meridian-foods/sources") return "source-review";
  if (pathname === "/credit-reviews/meridian-foods/activity") return "activity";
  if (pathname === "/credit-reviews/meridian-foods/recommendation" || pathname === "/credit-reviews/meridian-foods/recommendation/draft") return "recommendation-decision";
  if (pathname === "/credit-reviews/meridian-foods/senior-decision" || pathname === "/credit-reviews/meridian-foods/senior-decision/review") return "senior-decision";

  return undefined;
}

export function getActiveDesignOption(pathname: AppPath, selectedId?: string | null): DesignOption | undefined {
  const selectedOption = getDesignOption(selectedId);
  if (selectedOption) return selectedOption;

  const area = getDesignAreaForPath(pathname);
  return area ? getCurrentDesignOption(area) : undefined;
}

export const designOptionAreas = ["workspace-overview", "credit-review-queue", "utility-bar", "design-tools", "overview", "case-workspace", "findings-overview", "reassessment", "financials", "source-review", "activity", "recommendation-decision", "senior-review-queue", "senior-decision", "product-reference"] as const satisfies readonly ActiveDesignOptionArea[];
