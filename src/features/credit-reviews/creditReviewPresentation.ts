import type { ActivityLedgerTone } from "../../shared/ui/ActivityLedger/ActivityLedger";
import type { IconName } from "../../shared/ui/Icon/Icon";
import type { CreditReview } from "./reviewData";
import {
  isFindingAddressed,
  seniorDecisionLabel,
  type MeridianReviewState,
  type NorthstarReviewState,
} from "./workflow/creditReviewState";
import type { StandardReviewWorkflowState } from "./standard/standardReviewState";

type FindingIdentity = {
  id: string;
  title?: string;
};

type SourceIdentity = {
  id?: string;
  name?: string;
  type?: string;
};

export type CreditActivityKind = "ai" | "human" | "evidence" | "decision";

const findingIcons: Record<string, IconName> = {
  "customer-concentration": "users",
  "declining-margins": "trendDown",
  "increasing-leverage": "scale",
  "merchant-exposure": "trendDown",
  "reimbursement-update": "fileCheck",
  "integration-plan": "branch",
  "fleet-renewal": "calculator",
  "borrowing-base-update": "calculator",
  "program-concentration": "users",
  "inventory-reconciliation": "fileCheck",
  "ar-reconciliation": "fileCheck",
  "expansion-capacity": "trendUp",
  "customer-update": "users",
  "referral-stability": "users",
  "backlog-variance": "chart",
  "debt-omission": "scale",
  "contract-retention": "users",
};

/** One semantic finding vocabulary shared by overview and finding-review rows. */
export function getCreditFindingIcon(finding: FindingIdentity): IconName {
  return findingIcons[finding.id] ?? "alertCircle";
}

/** All evidence records use one glyph; metadata carries category and file format. */
export function getCreditSourceIcon(_source: SourceIdentity): IconName {
  return "document";
}

/** Activity glyphs describe the event; color is reserved for workflow outcome. */
export function getCreditActivityPresentation(kind: CreditActivityKind, warning = false): { icon: IconName; tone: ActivityLedgerTone } {
  if (warning) return { icon: "alertCircle", tone: "warning" };
  if (kind === "human") return { icon: "user", tone: "neutral" };
  if (kind === "evidence") return { icon: "document", tone: "neutral" };
  if (kind === "decision") return { icon: "checkCircle", tone: "success" };
  return { icon: "refresh", tone: "neutral" };
}

/** Projects persisted workflow state back into every queue and bookmark surface. */
export function applyCreditReviewWorkflowState(
  review: CreditReview,
  meridianState: MeridianReviewState,
  northstarState: NorthstarReviewState,
  standardStates: Record<string, StandardReviewWorkflowState> = {},
): CreditReview {
  if (review.slug === "meridian-foods") return applyMeridianState(review, meridianState);
  if (review.slug === "northstar-health") return applyNorthstarState(review, northstarState);
  if (review.details && standardStates[review.slug]) return applyStandardState(review, standardStates[review.slug]);
  return review;
}

function applyStandardState(review: CreditReview, state: StandardReviewWorkflowState): CreditReview {
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", status: "completed", statusLabel: seniorDecisionLabel(state.seniorDecision.decision), statusTone: state.seniorDecision.decision === "decline" ? "danger" : state.seniorDecision.decision === "return_to_analyst" ? "warning" : "success" };
  }
  if (state.recommendationSubmitted || state.recommendation) {
    return { ...review, aiReviewState: "review-complete", status: "ready-for-decision", statusLabel: "Awaiting senior decision", statusTone: "warning" };
  }
  if (review.details && state.reviewedFindingIds.length >= review.details.findings.length && review.details.findings.length > 0) {
    return { ...review, aiReviewState: "review-complete", status: "in-review", statusLabel: "Recommendation ready", statusTone: "info" };
  }
  return review;
}

function applyMeridianState(review: CreditReview, state: MeridianReviewState): CreditReview {
  if (state.seniorDecision?.decision === "return_to_analyst") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Returned to analyst", statusTone: "warning", status: "needs-attention" };
  }
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: seniorDecisionLabel(state.seniorDecision.decision), statusTone: state.seniorDecision.decision === "decline" ? "danger" : "success", status: "completed" };
  }
  if (state.recommendation) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Awaiting senior decision", statusTone: "warning", status: "ready-for-decision" };
  }
  if (state.recommendationDraft && state.decisionHistory?.some((decision) => decision.decision === "return_to_analyst")) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Revision in progress", statusTone: "info", status: "in-review" };
  }

  const findingStates = Object.values(state.findingStates);
  if (findingStates.every(isFindingAddressed)) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Recommendation ready", statusTone: "info", status: "in-review" };
  }

  const verificationCount = findingStates.filter((findingState) => findingState === "needs_verification").length;
  if (verificationCount > 0) {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: `${verificationCount} ${verificationCount === 1 ? "item" : "items"}`, statusLabel: undefined, statusTone: undefined, status: "needs-attention" };
  }

  const judgmentCount = findingStates.filter((findingState) => findingState === "needs_judgment" || findingState === "analysis_ready").length;
  return { ...review, aiReviewState: "needs-judgment", aiReviewDetail: judgmentCount > 0 ? `${judgmentCount} open` : undefined, statusLabel: undefined, statusTone: undefined, status: "needs-attention" };
}

function applyNorthstarState(review: CreditReview, state: NorthstarReviewState): CreditReview {
  if (state.seniorDecision?.decision === "return_to_analyst") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Returned to analyst", statusTone: "warning", status: "needs-attention" };
  }
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: seniorDecisionLabel(state.seniorDecision.decision), statusTone: state.seniorDecision.decision === "decline" ? "danger" : "success", status: "completed" };
  }
  if (state.recommendation) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Awaiting senior decision", statusTone: "warning", status: "ready-for-decision" };
  }
  if (state.decisionHistory?.some((decision) => decision.decision === "return_to_analyst")) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Revision required", statusTone: "warning", status: "needs-attention" };
  }
  if (state.analysisReviewState === "completed") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, statusLabel: "Recommendation ready", statusTone: "info", status: "in-review" };
  }
  if (state.analysisUpdated && state.evidenceReviewState === "verified_by_analyst") {
    return { ...review, aiReviewState: "analysis-updated", aiReviewDetail: undefined, statusLabel: "Analysis updated", statusTone: "info", status: "in-review" };
  }
  if (state.request.status === "sent") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "1 document", statusLabel: "Awaiting borrower", statusTone: "warning", status: "needs-attention" };
  }
  if (state.request.status === "processing") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "Processing", statusLabel: "Forecast processing", statusTone: "info", status: "needs-attention" };
  }
  if (state.request.status === "ready" && state.evidenceReviewState === "needs_verification") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "1 item", statusLabel: "Forecast ready to verify", statusTone: "danger", status: "needs-attention" };
  }
  return review;
}
