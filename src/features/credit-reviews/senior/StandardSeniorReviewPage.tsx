import { useEffect, useMemo } from "react";
import { useRouter, type AppPath } from "../../../app/router";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { companyLogoDomains } from "../companyLogos";
import { getStandardReview, standardReviewSlugs, type StandardReviewSlug } from "../reviewData";
import { createInitialStandardReviewState, usePersistentStandardReviewState } from "../standard/standardReviewState";
import { type SeniorDecisionDraft, type SeniorDecisionRecord } from "../workflow/creditReviewState";
import { SeniorReviewPackage, type SeniorReviewPackageFinding } from "./SeniorReviewPackage";

export function StandardSeniorReviewPage() {
  const { pathname, navigate } = useRouter();
  const slug = standardReviewSlugs.find((candidate) => pathname === `/credit-reviews/${candidate}/senior-decision/review`) as StandardReviewSlug | undefined;
  const review = slug ? getStandardReview(slug) : undefined;
  const [workflowState, dispatchWorkflow] = usePersistentStandardReviewState(slug ?? "unknown");
  const recommendation = workflowState.recommendation ?? (review ? {
    decision: review.details.recommendation.title,
    amount: review.request,
    rationale: review.details.recommendation.rationale,
    conditions: review.details.recommendation.conditions,
    author: review.owner,
    createdAt: new Date().toISOString(),
  } : undefined);
  const canOpenSenior = Boolean(review && (workflowState.recommendationSubmitted || review.status === "ready-for-decision" || review.status === "completed"));

  useEffect(() => {
    if (!review) return;
    if (!canOpenSenior) {
      navigate(`/credit-reviews/${slug}/recommendation` as AppPath, { replace: true });
      return;
    }
    if (workflowState.recommendationSubmitted) return;
    dispatchWorkflow({ type: "submit_recommendation", record: {
      decision: review.details.recommendation.title,
      amount: review.request,
      rationale: review.details.recommendation.rationale,
      conditions: review.details.recommendation.conditions,
      author: review.owner,
      createdAt: new Date().toISOString(),
    } });
  }, [canOpenSenior, dispatchWorkflow, navigate, review, slug, workflowState.recommendationSubmitted]);

  useEffect(() => {
    if (!review || review.status !== "completed" || !workflowState.recommendationSubmitted || workflowState.seniorDecision) return;
    dispatchWorkflow({ type: "record_senior_decision", record: {
      decision: "approve_with_conditions",
      rationale: review.details.recommendation.rationale,
      conditions: review.details.recommendation.conditions,
      decisionMaker: "Morgan Lee",
      createdAt: "2026-07-25T15:16:00.000Z",
    } });
  }, [dispatchWorkflow, review, workflowState.recommendationSubmitted, workflowState.seniorDecision]);

  const findings = useMemo<SeniorReviewPackageFinding[]>(() => review?.details.findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    detail: finding.detail,
    risk: finding.risk,
    status: workflowState.reviewedFindingIds.includes(finding.id) ? "Reviewed" : finding.status,
    tone: workflowState.reviewedFindingIds.includes(finding.id) ? "success" : finding.tone,
  })) ?? [], [review, workflowState.reviewedFindingIds]);

  if (!slug || !review || !recommendation) return null;
  if (!canOpenSenior) return null;
  return <SeniorReviewPackage
    company={review.company}
    logoDomain={companyLogoDomains[review.company]}
    request={review.request}
    facilityType={`${review.details.term} · ${review.facilityType}`}
    recommendation={recommendation}
    findings={findings}
    sourcesCount={review.details.sources.length}
    draft={workflowState.seniorDecisionDraft}
    existingDecision={workflowState.seniorDecision}
    onDraftChange={(draft: SeniorDecisionDraft) => dispatchWorkflow({ type: "save_senior_decision_draft", draft })}
    onExit={() => navigate(`/credit-reviews/${slug}/recommendation`)}
    onOpenRecord={(tab) => navigate(`/credit-reviews/${slug}/${tab}`)}
    onSubmit={(record) => {
      const seniorDecision: SeniorDecisionRecord = { ...record, decisionMaker: "Morgan Lee", createdAt: new Date().toISOString() };
      dispatchWorkflow({ type: "record_senior_decision", record: seniorDecision });
      navigate(`/credit-reviews/${slug}/recommendation`);
    }}
  />;
}
