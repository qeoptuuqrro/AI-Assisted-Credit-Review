import type { AppPath } from "../../../app/router";
import type { StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { isStandardReview, reviews, type CreditReview, type StandardReviewSlug } from "../reviewData";
import {
  createInitialStandardReviewState,
  readPersistedStandardReviewState,
  type StandardReviewWorkflowState,
} from "../standard/standardReviewState";
import {
  seniorDecisionLabel,
  type AnalystRecommendationRecord,
  type MeridianReviewState,
  type NorthstarReviewState,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";

export type SeniorQueueStage = "ready" | "waiting" | "decided";

export type SeniorQueueItem = {
  id: string;
  company: CreditReview["company"];
  request: string;
  facilityType: string;
  stage: SeniorQueueStage;
  statusLabel: string;
  statusTone: StatusPillTone;
  submittedBy: string;
  submittedAt: string;
  recommendationTitle: string;
  recommendationRationale: string;
  conditions: string[];
  decisionQuestion: string;
  facts: Array<{ label: string; value: string }>;
  findingSummary: string;
  route: AppPath;
};

export const seniorQueueStageTabs: ReadonlyArray<{ id: SeniorQueueStage; label: string }> = [
  { id: "ready", label: "Needs review" },
  { id: "waiting", label: "Waiting on analyst" },
  { id: "decided", label: "Decided" },
];

export type StandardReviewStateReader = (slug: StandardReviewSlug) => StandardReviewWorkflowState | undefined;

type QueueRecommendation = Pick<AnalystRecommendationRecord, "decision" | "rationale" | "conditions" | "author">;

export function buildSeniorQueueItems(
  meridianState: MeridianReviewState,
  northstarState: NorthstarReviewState,
  readStandardReviewState: StandardReviewStateReader = readPersistedStandardReviewState,
): SeniorQueueItem[] {
  const meridian = reviews.find((review) => review.slug === "meridian-foods");
  const northstar = reviews.find((review) => review.slug === "northstar-health");
  const items: SeniorQueueItem[] = [];

  if (meridian) {
    items.push(workflowItem(
      meridian,
      meridianState.recommendation,
      meridianState.seniorDecision,
      {
        decisionQuestion: "Should Meridian receive an $18M working-capital line under the proposed covenant and monitoring package?",
        findingSummary: "Confirm that renewed customer evidence, margin pressure, and narrower leverage headroom are adequately addressed by the submitted protections.",
        facts: [
          { label: "Findings reviewed", value: `${meridianState.judgments.length} of 3` },
          { label: "Facility", value: "3-year revolver" },
          { label: "Decision owner", value: "Morgan Lee" },
        ],
        route: "/credit-reviews/meridian-foods/senior-decision/review",
      },
      meridianState.decisionHistory?.find((decision) => decision.decision === "return_to_analyst"),
      meridianState.recommendationHistory?.[0],
    ));
  }

  if (northstar) {
    items.push(workflowItem(
      northstar,
      northstarState.recommendation,
      northstarState.seniorDecision,
      {
        decisionQuestion: "Does the verified 2027 forecast support Northstar's requested revolving line through the downside case?",
        findingSummary: "Confirm that the verified 1.29x downside fixed-charge coverage and reporting package are sufficient for the final decision.",
        facts: [
          { label: "Downside FCCR", value: northstarState.analysisUpdated ? "1.29x" : "Pending" },
          { label: "Policy floor", value: "1.20x" },
          { label: "Decision owner", value: "Morgan Lee" },
        ],
        route: "/credit-reviews/northstar-health/senior-decision/review",
      },
      northstarState.decisionHistory?.find((decision) => decision.decision === "return_to_analyst"),
      northstarState.recommendationHistory?.[0],
    ));
  }

  for (const review of reviews.filter((candidate) => isStandardReview(candidate))) {
    if (!isStandardReview(review)) continue;

    const standardState = readStandardReviewState(review.slug) ?? createInitialStandardReviewState();
    const workflowReady = standardState.recommendationSubmitted
      || Boolean(standardState.recommendation)
      || standardState.reviewedFindingIds.length >= review.details.findings.length;

    if (review.status !== "ready-for-decision" && review.status !== "completed" && !workflowReady) continue;

    const submitted = standardState.recommendation ?? (
      review.status === "ready-for-decision" || review.status === "completed"
        ? {
            decision: review.details.recommendation.title,
            rationale: review.details.recommendation.rationale,
            conditions: review.details.recommendation.conditions,
            author: review.owner,
          }
        : undefined
    );

    items.push(standardWorkflowItem(review, standardState, submitted));
  }

  return items;
}

function standardWorkflowItem(
  review: CreditReview & { details: NonNullable<CreditReview["details"]> },
  state: StandardReviewWorkflowState,
  recommendation: QueueRecommendation | undefined,
): SeniorQueueItem {
  const decision = state.seniorDecision;
  const returnedDecision = state.decisionHistory?.find((record) => record.decision === "return_to_analyst");
  const revisionInProgress = !decision && !state.recommendationSubmitted && Boolean(returnedDecision);
  const decisionPresentation = decision ? getDecisionPresentation(decision) : undefined;
  const completedWithoutPersistedDecision = !decision && review.status === "completed";
  const awaitingAnalystRecommendation = !decision && !completedWithoutPersistedDecision && !recommendation;
  const stage = revisionInProgress
    ? "waiting"
    : decisionPresentation?.stage ?? (completedWithoutPersistedDecision ? "decided" : recommendation ? "ready" : "waiting");
  const fallbackDecisionLabel = recommendation?.decision || "Decision recorded";
  const statusLabel = revisionInProgress ? "Revision in progress" : decisionPresentation?.statusLabel
    ?? (completedWithoutPersistedDecision ? fallbackDecisionLabel : awaitingAnalystRecommendation ? "Awaiting analyst" : "Decision ready");
  const statusTone = revisionInProgress ? "warning" : decisionPresentation?.statusTone
    ?? (completedWithoutPersistedDecision ? "success" : awaitingAnalystRecommendation ? "neutral" : "warning");

  return {
    id: review.slug,
    company: review.company,
    request: review.request,
    facilityType: review.facilityType,
    stage,
    statusLabel,
    statusTone,
    submittedBy: recommendation?.author ?? review.owner,
    submittedAt: revisionInProgress && returnedDecision
      ? `Returned ${formatRecordDate(returnedDecision.createdAt)}`
      : decision
      ? `${decisionPresentation?.dateVerb ?? "Decided"} ${formatRecordDate(decision.createdAt)}`
      : completedWithoutPersistedDecision
        ? `Decided ${review.due}`
        : `Due ${review.due}`,
    recommendationTitle: revisionInProgress
      ? "Analyst revision in progress"
      : decisionPresentation?.recommendationTitle ?? recommendation?.decision ?? "Recommendation not submitted",
    recommendationRationale: decision?.rationale
      || (revisionInProgress ? returnedDecision?.rationale : undefined)
      || recommendation?.rationale
      || "The analyst review is complete, but an attributable recommendation has not been submitted for senior decision.",
    conditions: decision?.conditions.length
      ? decision.conditions
      : recommendation?.conditions ?? [],
    decisionQuestion: review.details.decisionQuestion,
    facts: [
      { label: "Findings", value: `${review.details.findings.length} reviewed` },
      { label: "Term", value: review.details.term },
      { label: "Decision owner", value: "Morgan Lee" },
    ],
    findingSummary: review.details.findings.map((finding) => finding.description).join(" "),
    route: stage === "waiting"
      ? `/credit-reviews/${review.slug}`
      : `/credit-reviews/${review.slug}/senior-decision/review`,
  };
}

function workflowItem(
  review: CreditReview,
  recommendation: AnalystRecommendationRecord | undefined,
  decision: SeniorDecisionRecord | undefined,
  context: Pick<SeniorQueueItem, "decisionQuestion" | "findingSummary" | "facts" | "route">,
  returnedDecision?: SeniorDecisionRecord,
  priorRecommendation?: AnalystRecommendationRecord,
): SeniorQueueItem {
  const revisionInProgress = !decision && !recommendation && returnedDecision?.decision === "return_to_analyst";
  const decisionPresentation = decision ? getDecisionPresentation(decision) : undefined;
  const stage: SeniorQueueStage = decisionPresentation?.stage ?? (recommendation ? "ready" : "waiting");
  const fallbackTitle = stage === "waiting" ? "Recommendation not submitted" : "Proceed with conditions";

  return {
    id: review.slug,
    company: review.company,
    request: review.request,
    facilityType: review.facilityType,
    stage,
    statusLabel: revisionInProgress
      ? "Revision in progress"
      : decisionPresentation?.statusLabel ?? (recommendation ? "Decision ready" : "Awaiting analyst"),
    statusTone: revisionInProgress
      ? "warning"
      : decisionPresentation?.statusTone ?? (recommendation ? "warning" : "neutral"),
    submittedBy: recommendation?.author ?? priorRecommendation?.author ?? review.owner,
    submittedAt: revisionInProgress
      ? `Returned ${formatRecordDate(returnedDecision.createdAt)}`
      : decision
        ? `${decisionPresentation?.dateVerb ?? "Decided"} ${formatRecordDate(decision.createdAt)}`
        : recommendation
          ? `Submitted ${formatRecordDate(recommendation.createdAt)}`
          : `Due ${review.due}`,
    recommendationTitle: revisionInProgress
      ? "Analyst revision in progress"
      : decisionPresentation?.recommendationTitle ?? recommendation?.decision ?? fallbackTitle,
    recommendationRationale: decision?.rationale
      || recommendation?.rationale
      || (revisionInProgress ? returnedDecision.rationale : undefined)
      || "The analyst workflow is still in progress. Senior credit can monitor the case but cannot make a decision until an attributable recommendation is submitted.",
    conditions: decision?.conditions.length
      ? decision.conditions
      : recommendation?.conditions ?? priorRecommendation?.conditions ?? [],
    ...context,
    route: stage === "waiting" ? `/credit-reviews/${review.slug}` : context.route,
  };
}

function getDecisionPresentation(decision: SeniorDecisionRecord): {
  stage: SeniorQueueStage;
  statusLabel: string;
  statusTone: StatusPillTone;
  recommendationTitle: string;
  dateVerb: "Decided" | "Returned";
} {
  if (decision.decision === "return_to_analyst") {
    return {
      stage: "waiting",
      statusLabel: "Revision requested",
      statusTone: "warning",
      recommendationTitle: "Revision requested",
      dateVerb: "Returned",
    };
  }

  return {
    stage: "decided",
    statusLabel: seniorDecisionLabel(decision.decision),
    statusTone: decision.decision === "decline" ? "danger" : "success",
    recommendationTitle: seniorDecisionLabel(decision.decision),
    dateVerb: "Decided",
  };
}

function formatRecordDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "recently"
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function getStageTabsScrollCue({
  scrollWidth,
  clientWidth,
  scrollLeft,
}: {
  scrollWidth: number;
  clientWidth: number;
  scrollLeft: number;
}) {
  return {
    overflow: scrollWidth > clientWidth + 1,
    atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
  };
}
