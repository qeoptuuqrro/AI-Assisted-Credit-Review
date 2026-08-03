import type { ActivityLedgerTone } from "../../shared/ui/ActivityLedger/ActivityLedger";
import type { IconName } from "../../shared/ui/Icon/Icon";
import type { CreditReview } from "./reviewData";
import {
  isFindingAddressed,
  type MeridianReviewState,
  type NorthstarReviewState,
} from "./workflow/creditReviewState";
import { isStandardReviewRevisionInProgress, type StandardReviewWorkflowState } from "./standard/standardReviewState";

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

export function getMeridianOpenReviewStatus(state: MeridianReviewState): Pick<CreditReview, "aiReviewState" | "caseStatus"> {
  const findingStates = Object.values(state.findingStates);
  if (findingStates.some((findingState) => findingState === "needs_judgment")) {
    return { aiReviewState: "needs-judgment", caseStatus: "needs-judgment" };
  }
  if (findingStates.some((findingState) => findingState === "analysis_ready")) {
    return { aiReviewState: "analysis-ready", caseStatus: "needs-judgment" };
  }
  if (findingStates.some((findingState) => findingState === "needs_verification")) {
    return { aiReviewState: "needs-verification", caseStatus: "needs-verification" };
  }
  return { aiReviewState: "analysis-ready", caseStatus: "analyst-review" };
}

function applyStandardState(review: CreditReview, state: StandardReviewWorkflowState): CreditReview {
  if (state.seniorDecision?.decision === "return_to_analyst") {
    return { ...review, aiReviewState: "review-complete", caseStatus: "revision-requested", hasUpdates: false, status: "needs-attention" };
  }
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", caseStatus: state.seniorDecision.decision === "decline" ? "declined" : "approved", hasUpdates: false, status: "completed" };
  }
  if (isStandardReviewRevisionInProgress(state)) {
    return { ...review, aiReviewState: "review-complete", caseStatus: "revision-requested", hasUpdates: false, status: "in-review" };
  }
  if (state.recommendationSubmitted || state.recommendation) {
    return { ...review, aiReviewState: "review-complete", caseStatus: "awaiting-decision", hasUpdates: false, status: "ready-for-decision" };
  }
  if (areStandardReviewFindingsComplete(review, state)) {
    return { ...review, aiReviewState: "review-complete", caseStatus: "ready-to-recommend", hasUpdates: false, status: "in-review" };
  }
  return review;
}

export function areStandardReviewFindingsComplete(review: CreditReview, state: StandardReviewWorkflowState) {
  if (!review.details) return false;
  const openFixtureFindings = review.details.findings.filter((finding) => finding.status !== "Complete");
  return openFixtureFindings.length > 0
    && openFixtureFindings.every((finding) => state.reviewedFindingIds.includes(finding.id));
}

function applyMeridianState(review: CreditReview, state: MeridianReviewState): CreditReview {
  if (state.seniorDecision?.decision === "return_to_analyst") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "revision-requested", hasUpdates: false, status: "needs-attention" };
  }
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: state.seniorDecision.decision === "decline" ? "declined" : "approved", hasUpdates: false, status: "completed" };
  }
  if (state.recommendation) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "awaiting-decision", hasUpdates: false, status: "ready-for-decision" };
  }
  if (state.recommendationDraft && state.decisionHistory?.some((decision) => decision.decision === "return_to_analyst")) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "revision-requested", hasUpdates: false, status: "in-review" };
  }

  const findingStates = Object.values(state.findingStates);
  if (findingStates.every(isFindingAddressed)) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "ready-to-recommend", hasUpdates: false, status: "in-review" };
  }

  const openCount = findingStates.filter((findingState) => !isFindingAddressed(findingState)).length;
  const openStatus = getMeridianOpenReviewStatus(state);
  return {
    ...review,
    ...openStatus,
    aiReviewDetail: openCount > 0 ? `${openCount} open` : undefined,
    hasUpdates: state.reassessments.some((record) => record.status === "current"),
    status: "needs-attention",
  };
}

function applyNorthstarState(review: CreditReview, state: NorthstarReviewState): CreditReview {
  if (state.seniorDecision?.decision === "return_to_analyst") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "revision-requested", hasUpdates: false, status: "needs-attention" };
  }
  if (state.seniorDecision) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: state.seniorDecision.decision === "decline" ? "declined" : "approved", hasUpdates: false, status: "completed" };
  }
  if (state.recommendation) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "awaiting-decision", hasUpdates: false, status: "ready-for-decision" };
  }
  if (state.decisionHistory?.some((decision) => decision.decision === "return_to_analyst")) {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "revision-requested", hasUpdates: false, status: "needs-attention" };
  }
  if (state.analysisReviewState === "completed") {
    return { ...review, aiReviewState: "review-complete", aiReviewDetail: undefined, caseStatus: "ready-to-recommend", hasUpdates: false, status: "in-review" };
  }
  if (state.analysisUpdated && state.evidenceReviewState === "verified_by_analyst") {
    return { ...review, aiReviewState: "analysis-updated", aiReviewDetail: undefined, caseStatus: "analyst-review", hasUpdates: true, status: "in-review" };
  }
  if (state.request.status === "sent") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "1 document", caseStatus: "needs-verification", hasUpdates: false, status: "needs-attention" };
  }
  if (state.request.status === "processing") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "Processing", caseStatus: "needs-verification", hasUpdates: false, status: "needs-attention" };
  }
  if (state.request.status === "ready" && state.evidenceReviewState === "needs_verification") {
    return { ...review, aiReviewState: "needs-verification", aiReviewDetail: "1 item", caseStatus: "needs-verification", hasUpdates: false, status: "needs-attention" };
  }
  return review;
}
