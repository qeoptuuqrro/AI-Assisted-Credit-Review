import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter, type AppPath } from "../../../app/router";
import { AppUtilityAction } from "../../../app/AppUtilityActions";
import { getCurrentDesignOption, getDesignOption } from "../../design-tools/designOptions";
import { Button } from "../../../shared/ui/Button/Button";
import { CaseStatusPill, type CaseStatus } from "../../../shared/ui/CaseStatusPill/CaseStatusPill";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { DesignVariantNotice } from "../../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { ObjectHeader } from "../../../shared/ui/ObjectHeader/ObjectHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { Tabs, type TabItem } from "../../../shared/ui/Tabs/Tabs";
import { Toast } from "../../../shared/ui/Toast/Toast";
import { companyLogoDomains } from "../companyLogos";
import { ReviewBookmarkButton } from "../bookmarks/ReviewBookmarkButton";
import { getMeridianOpenReviewStatus } from "../creditReviewPresentation";
import { getLearningTargetProps, MeridianLearningPanel, MeridianLearningToggle } from "../learning/MeridianLearningMode";
import {
  firstLearningTopicForScope,
  meridianLearningTopicIdsByScope,
  meridianWalkthroughTopicIds,
  type MeridianLearningScope,
  type MeridianLearningTopicId,
} from "../learning/meridianLearningContent";
import { ReviewWorkspaceHeader } from "../workspace-header/ReviewWorkspaceHeader";
import {
  evidenceRequirements,
  findingRequirementIds,
  type EvidenceRequestRecord,
} from "../workflow/evidenceWorkflow";
import {
  createInitialMeridianState,
  createMeridianPreset,
  deriveMeridianCaseAttention,
  isFindingAddressed,
  meridianReviewReducer,
  type AnalystRecommendationRecord,
  type AnalystRecommendationDraft,
  type DemoPresetId,
  type JudgmentRecord,
  type ReassessmentInput,
  type SeniorDecisionDraft,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import { MERIDIAN_STORAGE_KEY, usePersistentReviewState } from "../workflow/usePersistentReviewState";
import { ActivityTab } from "./ActivityTab";
import { FinancialsTab } from "./FinancialsTab";
import { FindingsTab } from "./FindingsTab";
import { OverviewTab } from "./OverviewTab";
import { RecommendationTab } from "./RecommendationTab";
import { SourcesTab } from "./SourcesTab";
import {
  baseActivity,
  findings,
  sources,
  type FindingId,
  type ReviewActivity,
  type ReviewTab,
  type SourceReviewState,
  isSourceReviewReady,
} from "./meridianData";
import styles from "./MeridianReviewWorkspace.module.css";

const tabPaths: Record<ReviewTab, AppPath> = {
  overview: "/credit-reviews/meridian-foods",
  findings: "/credit-reviews/meridian-foods/findings",
  financials: "/credit-reviews/meridian-foods/financials",
  sources: "/credit-reviews/meridian-foods/sources",
  activity: "/credit-reviews/meridian-foods/activity",
  recommendation: "/credit-reviews/meridian-foods/recommendation",
};

const seniorDecisionPath: AppPath = "/credit-reviews/meridian-foods/senior-decision";
const recommendationDraftPath: AppPath = "/credit-reviews/meridian-foods/recommendation/draft";
const seniorDecisionReviewPath: AppPath = "/credit-reviews/meridian-foods/senior-decision/review";

const findingPaths: Record<FindingId, AppPath> = {
  "customer-concentration": "/credit-reviews/meridian-foods/findings/customer-concentration",
  "declining-margins": "/credit-reviews/meridian-foods/findings/declining-margins",
  "increasing-leverage": "/credit-reviews/meridian-foods/findings/increasing-leverage",
};

function getActiveTab(pathname: AppPath): ReviewTab {
  if (pathname.includes("/findings")) return "findings";
  if (pathname.endsWith("/financials")) return "financials";
  if (pathname.endsWith("/sources")) return "sources";
  if (pathname.endsWith("/activity")) return "activity";
  if (pathname.startsWith("/credit-reviews/meridian-foods/recommendation") || pathname.startsWith("/credit-reviews/meridian-foods/senior-decision")) return "recommendation";
  return "overview";
}

function getActiveFinding(pathname: AppPath): FindingId | null {
  const match = Object.entries(findingPaths).find(([, path]) => path === pathname);
  return match ? match[0] as FindingId : null;
}

export function getMeridianLearningScope({
  activeTab,
  activeFindingId,
  activeSourceId,
  isRecommendationDraftRoute,
  isSeniorDecisionRoute,
  isSeniorDecisionReviewRoute,
}: {
  activeTab: ReviewTab;
  activeFindingId: FindingId | null;
  activeSourceId: string | null;
  isRecommendationDraftRoute: boolean;
  isSeniorDecisionRoute: boolean;
  isSeniorDecisionReviewRoute: boolean;
}): MeridianLearningScope {
  if (activeFindingId) return "finding";
  if (activeSourceId) return "source-review";
  if (isRecommendationDraftRoute) return "recommendation-draft";
  if (isSeniorDecisionReviewRoute) return "senior-review";
  if (isSeniorDecisionRoute) return "senior-decision";
  if (activeTab === "findings") return "findings-overview";
  if (activeTab === "financials") return "financials";
  if (activeTab === "sources") return "sources-index";
  if (activeTab === "activity") return "activity";
  if (activeTab === "recommendation") return "recommendation";
  return "workspace-overview";
}

type ToastMessage = { title: string; message?: string };

const meridianPresetIds: DemoPresetId[] = [
  "meridian-start",
  "meridian-reassessment-ready",
  "meridian-margin-reassessment-ready",
  "meridian-recommendation-ready",
  "meridian-escalation-ready",
  "senior-review-ready",
];

function findingLabel(id: FindingId) {
  return findings.find((finding) => finding.id === id)?.title ?? "Finding";
}

export function MeridianReviewWorkspace() {
  const { pathname, search, navigate } = useRouter();
  const activeTab = getActiveTab(pathname);
  const activeFindingId = getActiveFinding(pathname);
  const searchParams = new URLSearchParams(search);
  const requestedDesignOption = getDesignOption(searchParams.get("design"));
  const designOption = requestedDesignOption && (
    requestedDesignOption.route === pathname ||
    (requestedDesignOption.area === "reassessment" && Boolean(activeFindingId))
  ) ? requestedDesignOption : undefined;
  const overviewVariant = designOption?.area === "overview"
    ? designOption.renderKey === "card-stack"
      ? "card-stack"
      : designOption.renderKey === "signature"
        ? "signature"
        : designOption.renderKey === "object-led"
          ? "object-led"
          : "account-view"
    : "account-view";
  const financialVariant = designOption?.area === "financials" && designOption.renderKey === "card-grid"
    ? "card-grid"
    : "treasury";
  const reassessmentDesignOption = designOption?.area === "reassessment"
    ? designOption
    : getCurrentDesignOption("reassessment");
  const findingVariant = reassessmentDesignOption
    ? reassessmentDesignOption.renderKey === "inline-dossier"
      ? "inline-dossier"
      : reassessmentDesignOption.renderKey === "insight-led-reassessment"
        ? "insight-led-reassessment"
        : reassessmentDesignOption.renderKey === "verification-led-decision-review"
          ? "verification-led-decision-review"
        : reassessmentDesignOption.renderKey === "evidence-first-decision-review"
          ? "evidence-first-decision-review"
        : reassessmentDesignOption.renderKey === "attributable-decision-review"
          ? "attributable-decision-review"
        : reassessmentDesignOption.renderKey === "attributable-insight-brief"
          ? "attributable-insight-brief"
        : reassessmentDesignOption.renderKey === "attributable-analysis-reassessment"
          ? "attributable-analysis-reassessment"
        : reassessmentDesignOption.renderKey === "breathable-judgment-reassessment"
          ? "breathable-judgment-reassessment"
          : "focused-reassessment"
    : "focused-reassessment";
  const activityVariant = designOption?.area === "activity"
    ? designOption.renderKey === "timeline"
      ? "timeline"
      : designOption.renderKey === "activity-ledger"
        ? "ledger"
        : "connected-timeline"
    : "connected-timeline";
  const recommendationVariant = designOption?.area === "recommendation-decision"
    ? designOption.renderKey === "recommendation-full-screen-lifecycle"
      ? "full-screen-lifecycle"
      : designOption.renderKey === "recommendation-focused-lifecycle"
      ? "focused-lifecycle"
      : designOption.renderKey === "recommendation-open-canvas"
      ? "open-canvas"
      : designOption.renderKey === "recommendation-icon-led"
        ? "icon-led"
        : "credit-memo"
    : "full-screen-lifecycle";
  const seniorDecisionVariant = designOption?.area === "senior-decision"
    ? designOption.renderKey === "senior-decision-aligned-workflow"
      ? "aligned-workflow"
      : designOption.renderKey === "senior-decision-unified-brief"
      ? "unified-brief"
      : designOption.renderKey === "senior-decision-command-center"
      ? "command-center"
      : designOption.renderKey === "senior-decision-full-screen-review"
      ? "full-screen-review"
      : designOption.renderKey === "senior-decision-dense-brief"
        ? "dense-brief"
        : "focused-layer"
    : "aligned-workflow";
  const requestedSourceId = searchParams.get("source");
  const activeSourceId = activeTab === "sources"
    ? requestedSourceId && sources.some((source) => source.id === requestedSourceId)
      ? requestedSourceId
      : null
    : null;
  const requestedReturnFindingId = searchParams.get("fromFinding");
  const returnFindingId = requestedReturnFindingId && findings.some((finding) => finding.id === requestedReturnFindingId)
    ? requestedReturnFindingId as FindingId
    : null;
  const requestedResumeEvidenceStage = searchParams.get("resumeEvidence");
  const sourceResumeEvidenceStage = requestedResumeEvidenceStage === "evidence" || requestedResumeEvidenceStage === "review"
    ? requestedResumeEvidenceStage
    : null;
  const resumeEvidenceStage = activeFindingId ? sourceResumeEvidenceStage : null;
  const [reviewState, dispatchReview] = usePersistentReviewState(meridianReviewReducer, createInitialMeridianState(baseActivity), MERIDIAN_STORAGE_KEY);
  const { findingStates, sourceReviewStates, evidenceStates, activity, judgments, recommendationDraft, recommendation, seniorDecisionDraft, seniorDecision } = reviewState;
  const isSeniorDecisionRoute = pathname === seniorDecisionPath;
  const isRecommendationDraftRoute = pathname === recommendationDraftPath;
  const isSeniorDecisionReviewRoute = pathname === seniorDecisionReviewPath;
  const focusedRecommendationLifecycle = recommendationVariant === "focused-lifecycle";
  const fullScreenRecommendationLifecycle = recommendationVariant === "full-screen-lifecycle";
  const recommendationAuthoringWorkspace = activeTab === "recommendation" && focusedRecommendationLifecycle && !recommendation;
  const legacySeniorReviewWorkspace = isSeniorDecisionRoute && seniorDecisionVariant !== "full-screen-review" && seniorDecisionVariant !== "command-center" && Boolean(recommendation) && !seniorDecision;
  const immersiveDecisionWorkspace = isRecommendationDraftRoute || isSeniorDecisionReviewRoute;
  const focusedWorkspace = Boolean(activeFindingId || activeSourceId || recommendationAuthoringWorkspace || legacySeniorReviewWorkspace || immersiveDecisionWorkspace);
  const reassessedFindings = Object.fromEntries(findings.map((finding) => [finding.id, reviewState.reassessments.some((record) => record.findingId === finding.id && record.status === "current")])) as Record<FindingId, boolean>;
  const renewalLinked = !["idle", "failed"].includes(evidenceStates["customer-renewal"].status);
  const recommendationStarted = pathname.startsWith("/credit-reviews/meridian-foods/recommendation")
    || pathname.startsWith("/credit-reviews/meridian-foods/senior-decision")
    || Boolean(recommendationDraft)
    || Boolean(recommendation);
  const recommendationSubmitted = Boolean(recommendation);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [learningPanelOpen, setLearningPanelOpen] = useState(false);
  const [learningTopicId, setLearningTopicId] = useState<MeridianLearningTopicId>("page-story");
  const [learningScope, setLearningScope] = useState<MeridianLearningScope>("workspace-overview");
  const concentrationReassessed = reassessedFindings["customer-concentration"];

  const resolvedCount = findings.filter((finding) => isFindingAddressed(findingStates[finding.id])).length;
  const unresolvedFindings = findings.filter((finding) => !isFindingAddressed(findingStates[finding.id]));
  const escalatedCount = findings.filter((finding) => findingStates[finding.id] === "escalated").length;
  const reviewComplete = resolvedCount === findings.length;
  const revisionInProgress = Boolean(recommendationDraft && reviewState.decisionHistory?.some((decision) => decision.decision === "return_to_analyst"));
  const caseAttention = deriveMeridianCaseAttention(reviewState);
  const requestedPreset = searchParams.get("preset") as DemoPresetId | null;
  const applyingPreset = requestedPreset !== null && meridianPresetIds.includes(requestedPreset);
  const routeLearningScope = getMeridianLearningScope({
    activeTab,
    activeFindingId,
    activeSourceId,
    isRecommendationDraftRoute,
    isSeniorDecisionRoute,
    isSeniorDecisionReviewRoute,
  });

  useEffect(() => {
    if (!requestedPreset || !applyingPreset) return;
    dispatchReview({ type: "replace_state", state: createMeridianPreset(requestedPreset, baseActivity) });
    const nextSearchParams = new URLSearchParams(search);
    nextSearchParams.delete("preset");
    const nextSearch = nextSearchParams.size > 0 ? `?${nextSearchParams.toString()}` : "";
    navigate(pathname, { search: nextSearch, replace: true });
  }, [applyingPreset, dispatchReview, navigate, pathname, requestedPreset, search]);

  useEffect(() => {
    if (applyingPreset || focusedRecommendationLifecycle || fullScreenRecommendationLifecycle || !recommendation || seniorDecision || pathname !== tabPaths.recommendation) return;
    navigate(seniorDecisionPath, { replace: true });
  }, [applyingPreset, focusedRecommendationLifecycle, fullScreenRecommendationLifecycle, navigate, pathname, recommendation, seniorDecision]);

  useEffect(() => {
    if (applyingPreset || focusedRecommendationLifecycle || fullScreenRecommendationLifecycle || activeTab !== "recommendation" || reviewComplete) return;
    navigate(tabPaths.findings);
  }, [activeTab, applyingPreset, focusedRecommendationLifecycle, fullScreenRecommendationLifecycle, navigate, reviewComplete]);

  useEffect(() => {
    if (applyingPreset) return;
    if (isRecommendationDraftRoute && (!reviewComplete || Boolean(recommendation))) {
      navigate(tabPaths.recommendation, { replace: true });
      return;
    }
    if (isSeniorDecisionReviewRoute && (!recommendation || (Boolean(seniorDecision) && seniorDecisionVariant !== "unified-brief"))) {
      navigate(tabPaths.recommendation, { replace: true });
    }
  }, [applyingPreset, isRecommendationDraftRoute, isSeniorDecisionReviewRoute, navigate, recommendation, reviewComplete, seniorDecision, seniorDecisionVariant]);

  useEffect(() => {
    setLearningScope(routeLearningScope);
    setLearningTopicId(firstLearningTopicForScope(routeLearningScope));
  }, [routeLearningScope]);

  const visibleTabs = useMemo<Array<TabItem<ReviewTab>>>(() => {
    const items: Array<TabItem<ReviewTab>> = [
      { id: "overview", label: "Overview" },
      { id: "findings", label: "Findings", count: unresolvedFindings.length > 0 ? unresolvedFindings.length : undefined },
      { id: "financials", label: "Financials" },
      { id: "sources", label: "Sources", count: sources.length },
      { id: "activity", label: "Activity" },
    ];
    if (recommendationStarted) items.push({ id: "recommendation", label: "Recommendation" });
    return items;
  }, [recommendationStarted, unresolvedFindings.length]);

  function navigateToTab(tab: ReviewTab) {
    navigate(tabPaths[tab]);
  }

  function openFinding(id: FindingId) {
    navigate(findingPaths[id]);
  }

  function openSource(id: string, fromFinding: FindingId | null = returnFindingId, resumeStage: "evidence" | "review" | null = sourceResumeEvidenceStage) {
    const params = new URLSearchParams();
    params.set("source", id);
    if (fromFinding) params.set("fromFinding", fromFinding);
    if (resumeStage) params.set("resumeEvidence", resumeStage);
    const activeDesign = searchParams.get("design");
    if (activeDesign) params.set("design", activeDesign);
    navigate(tabPaths.sources, { search: `?${params.toString()}` });
  }

  function closeSource() {
    if (returnFindingId) {
      const activeDesign = searchParams.get("design");
      const params = new URLSearchParams();
      if (sourceResumeEvidenceStage) params.set("resumeEvidence", sourceResumeEvidenceStage);
      if (activeDesign) params.set("design", activeDesign);
      navigate(findingPaths[returnFindingId], { search: `?${params.toString()}` });
      return;
    }
    navigate(tabPaths.sources);
  }

  function updateSourceReviewState(id: string, state: SourceReviewState) {
    const source = sources.find((item) => item.id === id);
    if (!source || sourceReviewStates[id] === state) return;
    dispatchReview({ type: "source_review_transition", id, state });

    if (state === "verified") {
      if (id === "customer-a-renewal") return;
      addActivity({
        id: `source-${id}-verified`,
        type: "evidence",
        title: `${source.name} verified by Alex`,
        meta: "Just now",
        description: source.warning ? "The documented exception was reviewed against the source." : "Extracted values were confirmed against the source document.",
        tone: "human",
        detail: `Alex Kim confirmed the extracted values, provenance, and cited evidence for ${source.name}.`,
      });
      setToast({ title: "Source verified", message: `${source.name} is ready for use in the decision.` });
      return;
    }

    if (state === "flagged") {
      addActivity({
        id: `source-${id}-flagged`,
        type: "evidence",
        title: `Discrepancy flagged in ${source.name}`,
        meta: "Just now",
        description: "The source is blocked from decision use until the discrepancy is cleared.",
        tone: "warning",
        detail: `Alex Kim flagged the extracted values in ${source.name} for follow-up. Any prior readiness status is suspended.`,
      });
      setToast({ title: "Discrepancy flagged", message: `${source.name} is blocked until the discrepancy is cleared.` });
      return;
    }

    addActivity({
      id: `source-${id}-flag-cleared`,
      type: "human",
      title: `Discrepancy cleared for ${source.name}`,
      meta: "Just now",
      description: "The source returned to the review queue.",
      tone: "human",
      detail: `Alex Kim cleared the discrepancy flag. ${source.name} still requires confirmation before it can be relied upon.`,
    });
    setToast({ title: "Discrepancy cleared", message: `${source.name} is ready to review again.` });
  }

  function addActivity(event: ReviewActivity) {
    dispatchReview({ type: "add_activity", activity: event });
  }

  function openLearningTopic(topicId: MeridianLearningTopicId) {
    setLearningScope(meridianWalkthroughTopicIds.includes(topicId) ? "walkthrough" : routeLearningScope);
    setLearningTopicId(topicId);
    setLearningPanelOpen(true);
  }

  function startLearningWalkthrough() {
    setLearningScope("walkthrough");
    setLearningTopicId("walkthrough-start");
    setLearningPanelOpen(true);
  }

  function toggleLearningMode() {
    if (learningMode) {
      setLearningMode(false);
      setLearningPanelOpen(false);
      return;
    }
    setLearningMode(true);
    setLearningScope(routeLearningScope);
    openLearningTopic(firstLearningTopicForScope(routeLearningScope));
  }

  function learningTopicFromEventTarget(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest("[data-learning-control]")) return null;
    const learningTarget = target.closest<HTMLElement>("[data-learning-target]");
    return learningTarget?.dataset.learningTarget as MeridianLearningTopicId | undefined;
  }

  function inspectLearningClick(event: MouseEvent<HTMLDivElement>) {
    if (!learningMode) return;
    const topicId = learningTopicFromEventTarget(event.target);
    if (!topicId) return;
    event.preventDefault();
    event.stopPropagation();
    openLearningTopic(topicId);
  }

  function inspectLearningKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!learningMode || (event.key !== "Enter" && event.key !== " ")) return;
    const topicId = learningTopicFromEventTarget(event.target);
    if (!topicId) return;
    event.preventDefault();
    event.stopPropagation();
    openLearningTopic(topicId);
  }

  function linkRenewal() {
    dispatchReview({ type: "evidence_transition", id: "customer-renewal", action: { type: "existing-source-selected", fileName: evidenceRequirements["customer-renewal"].fixtureFileName } });
    addActivity({
      id: "renewal-linked",
      type: "evidence",
      title: "Customer A renewal agreement linked",
      meta: "Just now",
      description: "Executed three-year renewal added to the finding.",
      tone: "human",
      detail: "The agreement extends the customer relationship through March 31, 2030 and preserves minimum-purchase provisions.",
    });
    setToast({ title: "Evidence linked", message: "Customer A renewal agreement is ready for reassessment." });
  }

  function uploadEvidence(id: FindingId, _file: File) {
    const requirementId = findingRequirementIds[id];
    const requirement = evidenceRequirements[requirementId];
    dispatchReview({ type: "evidence_transition", id: requirementId, action: { type: "upload-started", fileName: requirement.fixtureFileName, provenance: "analyst-upload" } });
    dispatchReview({ type: "evidence_transition", id: requirementId, action: { type: "upload-ready" } });
    addActivity({
      id: `${requirementId}-uploaded`,
      type: "evidence",
      title: `${requirement.fixtureFileName} uploaded by Alex`,
      meta: "Just now",
      description: "Matched to the open evidence requirement and ready for review.",
      tone: "human",
      detail: "The file is available to the scoped reassessment, but it is not treated as verified until the analyst confirms the evidence checks.",
    });
    setToast({ title: "Ready for review", message: `${requirement.fixtureFileName} still requires verification.` });
  }

  function requestEvidence(id: FindingId, request: EvidenceRequestRecord) {
    const requirementId = findingRequirementIds[id];
    const requirement = evidenceRequirements[requirementId];
    dispatchReview({ type: "evidence_transition", id: requirementId, action: { type: "request-sent", request } });
    addActivity({
      id: `${requirementId}-requested-${request.sentAt}`,
      type: "evidence",
      title: `${requirement.title} requested from ${request.recipientName}`,
      meta: "Just now",
      description: `${request.recipientRole} · Due ${request.dueDate}`,
      tone: "human",
      detail: request.remindersEnabled
        ? `Automatic reminders are on. The request remains linked to ${findingLabel(id)} until evidence is received and verified.`
        : `The request remains linked to ${findingLabel(id)} until evidence is received and verified.`,
    });
    setToast({ title: "Request sent", message: `${request.recipientName} will receive the request for ${requirement.title.toLowerCase()}.` });
  }

  function rejectEvidence(id: FindingId, message: string) {
    const requirementId = findingRequirementIds[id];
    dispatchReview({ type: "evidence_transition", id: requirementId, action: { type: "upload-failed", message } });
    setToast({ title: "File not accepted", message });
  }

  function resetEvidence(id: FindingId) {
    dispatchReview({ type: "evidence_transition", id: findingRequirementIds[id], action: { type: "reset" } });
  }

  function useExistingEvidence(id: FindingId) {
    if (id === "customer-concentration") {
      const requirement = evidenceRequirements["customer-renewal"];
      dispatchReview({ type: "evidence_transition", id: "customer-renewal", action: { type: "existing-source-selected", fileName: requirement.fixtureFileName } });
      addActivity({
        id: "renewal-matched-for-review",
        type: "evidence",
        title: "Customer A renewal matched to finding",
        meta: "Just now",
        description: "AI matched relationship-team evidence to the open contract-duration assumption.",
        tone: "ai",
        detail: `${requirement.existingSource?.suppliedBy ?? "Relationship team"} supplied the executed renewal on ${requirement.existingSource?.receivedAt ?? "Jul 18, 2026"}. Analyst verification is required before the scoped reassessment can use it.`,
      });
      setToast({ title: "Renewal ready for verification", message: "Confirm provenance and material terms before reassessment." });
      return;
    }
  }

  function verifyEvidence(id: FindingId) {
    const requirementId = findingRequirementIds[id];
    const evidence = evidenceStates[requirementId];
    if (!evidence.fileName || !["ready-for-review", "verified"].includes(evidence.status)) return;
    dispatchReview({ type: "evidence_transition", id: requirementId, action: { type: "verification-complete" } });
    addActivity({
      id: `${requirementId}-verified`,
      type: "human",
      title: `Alex verified ${evidence.fileName}`,
      meta: "Just now",
      description: `Evidence checks completed for ${findingLabel(id)}.`,
      tone: "human",
      detail: "Provenance, material terms, and the affected analysis scope were confirmed before reassessment.",
    });
  }

  function updateVerificationDraft(id: FindingId, draft: { confirmedChecks: string[]; analystContext?: string }) {
    const requirementId = findingRequirementIds[id];
    dispatchReview({
      type: "evidence_transition",
      id: requirementId,
      action: {
        type: "verification-progress-updated",
        confirmedChecks: draft.confirmedChecks,
        analystContext: draft.analystContext,
        updatedBy: "Alex Kim",
        updatedAt: new Date().toISOString(),
      },
    });
  }

  function reassessFinding(id: FindingId, input: ReassessmentInput = {}) {
    const requirementId = findingRequirementIds[id];
    const evidence = evidenceStates[requirementId];
    if (!evidence.fileName || !["ready-for-review", "verified"].includes(evidence.status)) return;
    const requirement = evidenceRequirements[requirementId];
    const createdAt = new Date().toISOString();
    dispatchReview({ type: "analysis_completed", record: { id: `${id}-${createdAt}`, findingId: id, evidenceRequirementId: requirementId, createdAt, status: "current", ...input } });
    addActivity({
      id: `${id}-reassessed`,
      type: "ai",
      title: `${findingLabel(id)} assessment revised after verified evidence`,
      meta: "Just now",
      description: requirement.result.initialRisk === requirement.result.updatedRisk
        ? `${requirement.result.updatedRisk} risk retained with updated evidence.`
        : `${requirement.result.initialRisk} risk changed to ${requirement.result.updatedRisk}.`,
      tone: "neutral",
      detail: `Changed: ${requirement.result.changedTitle}. Unchanged: ${requirement.result.unchangedTitle}.`,
    });
    setToast({ title: "Analysis updated", message: `${findingLabel(id)} is ready for human judgment.` });
  }

  function recordFindingJudgment(id: FindingId, judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) {
    const finding = findings.find((item) => item.id === id);
    if (!finding || isFindingAddressed(findingStates[id])) return;
    if (id === "increasing-leverage") {
      const debtSchedule = sources.find((source) => source.id === "debt-schedule");
      const classificationVerified = evidenceStates["equipment-obligation-classification"].status === "verified";
      if (debtSchedule && !classificationVerified && !isSourceReviewReady(debtSchedule, sourceReviewStates[debtSchedule.id])) {
        setToast({ title: "Evidence review required", message: "Verify the debt schedule classification before completing leverage review." });
        openSource(debtSchedule.id, id);
        return;
      }
    }
    const currentReassessment = reviewState.reassessments.find((record) => record.findingId === id && record.status === "current");
    dispatchReview({ type: "record_judgment", record: { ...judgment, findingId: id, author: "Alex Kim", createdAt: new Date().toISOString(), reassessmentId: currentReassessment?.id } });
    setToast(judgment.decision === "escalate"
      ? { title: "Finding escalated", message: `${finding.title} will remain visible in the senior handoff.` }
      : judgment.decision === "revise"
        ? { title: "Conclusion revised", message: `Your analyst-owned conclusion is now primary for ${finding.title}.` }
        : { title: "Judgment recorded", message: `${finding.title} is ready for recommendation.` });
  }

  function startRecommendation() {
    navigate(recommendationDraftPath);
  }

  function saveRecommendationDraft(draft: AnalystRecommendationDraft) {
    dispatchReview({ type: "save_recommendation_draft", draft });
  }

  function submitRecommendation(record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) {
    dispatchReview({ type: "submit_recommendation", record: { ...record, author: "Alex Kim", createdAt: new Date().toISOString() } });
    setToast({ title: "Recommendation submitted", message: "The case is ready for senior credit review." });
  }

  function saveSeniorDecisionDraft(draft: SeniorDecisionDraft) {
    dispatchReview({ type: "save_senior_decision_draft", draft });
  }

  function recordSeniorDecision(record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) {
    dispatchReview({ type: "record_senior_decision", record: { ...record, decisionMaker: "Morgan Lee", createdAt: new Date().toISOString() } });
    setToast({ title: "Decision recorded", message: "The attributable senior decision is now part of the case record." });
  }

  function reopenReturnedRecommendation() {
    dispatchReview({ type: "reopen_returned_recommendation", at: new Date().toISOString() });
  }

  function handlePrimaryAction() {
    if (recommendationSubmitted) {
      navigate(seniorDecisionReviewPath);
      return;
    }
    if (reviewComplete) {
      startRecommendation();
      return;
    }
    const next = unresolvedFindings[0];
    if (next) openFinding(next.id);
  }

  const caseStatus: CaseStatus = seniorDecision
    ? seniorDecision.decision === "return_to_analyst" ? "revision-requested" : seniorDecision.decision === "decline" ? "declined" : "approved"
    : caseAttention === "awaiting_senior_decision"
      ? "awaiting-decision"
    : revisionInProgress
      ? "revision-requested"
    : reviewComplete
      ? "ready-to-recommend"
      : getMeridianOpenReviewStatus(reviewState).caseStatus;
  const primaryLabel = recommendationSubmitted
    ? seniorDecisionDraft ? "Resume senior review" : "Senior review"
    : reviewComplete
      ? recommendationDraft ? "Resume recommendation" : "Draft recommendation"
      : "Continue review";
  const headerAction = (activeTab === "findings" && !reviewComplete) || activeTab === "recommendation" || seniorDecision
    ? undefined
    : <Button variant="primary" onClick={handlePrimaryAction}>{primaryLabel}</Button>;

  return (
    <div
      className={`${styles.page} ${focusedWorkspace ? styles.focusedPage : ""} ${immersiveDecisionWorkspace ? styles.immersiveDecisionPage : ""} ${designOption?.area === "recommendation-decision" && designOption.status !== "current" ? styles.recommendationPreviewPage : ""} ${activeSourceId ? styles.sourcePage : ""} ${legacySeniorReviewWorkspace ? styles.seniorDecisionPage : ""}`}
      data-learning-mode={learningMode || undefined}
      onClickCapture={inspectLearningClick}
      onKeyDownCapture={inspectLearningKey}
    >
      {!focusedWorkspace && (
        <ReviewWorkspaceHeader>
          <div {...getLearningTargetProps(learningMode, "case-header")}>
            <ObjectHeader
              backLabel="Credit reviews"
              onBack={() => navigate("/credit-reviews")}
              logo={<CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="lg" />}
              title="Meridian Foods"
              metadata={["$18M working-capital line", "3-year revolver", "Alex Kim", "Due today"]}
              status={<CaseStatusPill status={caseStatus} />}
              utilityAction={<ReviewBookmarkButton slug="meridian-foods" company="Meridian Foods" />}
              action={headerAction}
            />
          </div>

          <div {...getLearningTargetProps(learningMode, "review-navigation")}>
            <Tabs ariaLabel="Meridian Foods review sections" items={visibleTabs} value={activeTab} onChange={navigateToTab} />
          </div>
        </ReviewWorkspaceHeader>
      )}

      <div className={`${styles.content} ${focusedWorkspace ? styles.focusedContent : ""} ${immersiveDecisionWorkspace ? styles.immersiveDecisionContent : ""} ${legacySeniorReviewWorkspace ? styles.seniorDecisionContent : ""}`} id={`${activeTab}-panel`} role={focusedWorkspace ? undefined : "tabpanel"}>
        {designOption?.status !== "current" && designOption && (
          <DesignVariantNotice
            area={designOption.areaLabel}
            variant={`${designOption.version} — ${designOption.name}`}
            onReturn={() => navigate(pathname, { replace: true })}
          />
        )}
        {activeTab === "overview" && (
          <OverviewTab
            findingStates={findingStates}
            judgments={judgments}
            reassessedFindings={reassessedFindings}
            concentrationReassessed={concentrationReassessed}
            sourceReviewStates={sourceReviewStates}
            onOpenFinding={openFinding}
            onNavigate={navigateToTab}
            variant={overviewVariant}
            learningMode={learningMode}
          />
        )}
        {activeTab === "findings" && (
          <FindingsTab
            variant={findingVariant}
            activeFindingId={activeFindingId}
            findingStates={findingStates}
            sourceReviewStates={sourceReviewStates}
            evidenceStates={evidenceStates}
            reassessedFindings={reassessedFindings}
            judgments={judgments}
            renewalLinked={renewalLinked}
            concentrationReassessed={concentrationReassessed}
            onOpenFinding={openFinding}
            onBack={() => navigate(tabPaths.findings)}
            onLinkRenewal={linkRenewal}
            onUploadEvidence={uploadEvidence}
            onRequestEvidence={requestEvidence}
            onRejectEvidence={rejectEvidence}
            onUseExistingEvidence={useExistingEvidence}
            onResetEvidence={resetEvidence}
            onUpdateVerificationDraft={updateVerificationDraft}
            onVerifyEvidence={verifyEvidence}
            onReassess={reassessFinding}
            onRecordJudgment={recordFindingJudgment}
            onOpenSource={(sourceId, fromFindingId, resumeStage) => {
              const sourceFindingId = fromFindingId ?? activeFindingId;
              const firstFindingSource = sourceFindingId ? findings.find((finding) => finding.id === sourceFindingId)?.sourceIds[0] : undefined;
              openSource(sourceId ?? firstFindingSource ?? "customer-a-contract", sourceFindingId, resumeStage ?? null);
            }}
            resumeEvidenceStage={resumeEvidenceStage}
            onEvidenceResumeHandled={() => {
              if (!activeFindingId) return;
              const activeDesign = searchParams.get("design");
              navigate(findingPaths[activeFindingId], { search: activeDesign ? `?design=${encodeURIComponent(activeDesign)}` : "", replace: true });
            }}
            learningMode={learningMode}
          />
        )}
        {activeTab === "financials" && <FinancialsTab onOpenFinding={openFinding} variant={financialVariant} learningMode={learningMode} />}
        {activeTab === "sources" && (
          <SourcesTab
            key={designOption?.id ?? "source-current"}
            renewalLinked={renewalLinked}
            onLinkRenewal={linkRenewal}
            selectedId={activeSourceId}
            returnFindingId={returnFindingId}
            resumeEvidenceStage={sourceResumeEvidenceStage}
            reviewStates={sourceReviewStates}
            onReviewStateChange={updateSourceReviewState}
            onSelectSource={(sourceId) => openSource(sourceId)}
            onCloseSource={closeSource}
            learningMode={learningMode}
            learningControl={activeSourceId ? <MeridianLearningToggle enabled={learningMode} onToggle={toggleLearningMode} /> : undefined}
          />
        )}
        {activeTab === "activity" && <ActivityTab key={designOption?.id ?? "activity-current"} activity={activity} variant={activityVariant} learningMode={learningMode} />}
        {activeTab === "recommendation" && (
          <RecommendationTab
            variant={recommendationVariant}
            seniorVariant={seniorDecisionVariant}
            findingStates={findingStates}
            judgments={reviewState.judgments}
            reassessedFindings={reassessedFindings}
            recommendation={recommendation}
            recommendationDraft={recommendationDraft}
            seniorDecision={seniorDecision}
            seniorDecisionDraft={seniorDecisionDraft}
            routeMode={isRecommendationDraftRoute ? "recommendation-draft" : isSeniorDecisionReviewRoute ? "senior-review" : isSeniorDecisionRoute ? "senior-decision" : "recommendation"}
            onSaveDraft={saveRecommendationDraft}
            onSubmit={submitRecommendation}
            onSaveSeniorDraft={saveSeniorDecisionDraft}
            onSeniorDecision={recordSeniorDecision}
            onStartRecommendation={startRecommendation}
            onExitRecommendation={() => navigate(tabPaths.recommendation)}
            onOpenSeniorReview={() => navigate(seniorDecisionReviewPath)}
            onExitSeniorReview={() => navigate("/credit-reviews/senior")}
            onReopenReturnedRecommendation={reopenReturnedRecommendation}
            onNavigate={navigateToTab}
            learningMode={learningMode}
            learningControl={immersiveDecisionWorkspace ? <MeridianLearningToggle enabled={learningMode} onToggle={toggleLearningMode} /> : undefined}
          />
        )}
      </div>

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      <AppUtilityAction>
        <MeridianLearningToggle enabled={learningMode} onToggle={toggleLearningMode} />
      </AppUtilityAction>
      <MeridianLearningPanel
        open={learningPanelOpen}
        topicId={learningTopicId}
        topicIds={meridianLearningTopicIdsByScope[learningScope]}
        onSelectTopic={openLearningTopic}
        onStartWalkthrough={startLearningWalkthrough}
        onClose={() => setLearningPanelOpen(false)}
      />
    </div>
  );
}
