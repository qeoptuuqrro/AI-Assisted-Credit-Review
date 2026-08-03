import { useMemo, useState, type CSSProperties } from "react";
import { useRouter, type AppPath } from "../../../app/router";
import { ActivityLedger, type ActivityLedgerItem } from "../../../shared/ui/ActivityLedger/ActivityLedger";
import { Button } from "../../../shared/ui/Button/Button";
import { CaseStatusPill } from "../../../shared/ui/CaseStatusPill/CaseStatusPill";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { DesignVariantNotice } from "../../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { DocumentRow } from "../../../shared/ui/DocumentRow/DocumentRow";
import { DocumentViewer } from "../../../shared/ui/DocumentViewer/DocumentViewer";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../../shared/ui/Drawer/Drawer";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { KeyValueGrid } from "../../../shared/ui/KeyValueGrid/KeyValueGrid";
import { MetricCard } from "../../../shared/ui/MetricCard/MetricCard";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { ObjectHeader } from "../../../shared/ui/ObjectHeader/ObjectHeader";
import { Panel } from "../../../shared/ui/Panel/Panel";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import type { StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { Tabs } from "../../../shared/ui/Tabs/Tabs";
import { Toast } from "../../../shared/ui/Toast/Toast";
import { companyLogoDomains } from "../companyLogos";
import { areStandardReviewFindingsComplete } from "../creditReviewPresentation";
import { ReviewBookmarkButton } from "../bookmarks/ReviewBookmarkButton";
import { getLearningTargetProps, LearningModeSurface, LearningTarget, useLearningMode } from "../learning/MeridianLearningMode";
import type { PlatformLearningScope } from "../learning/meridianLearningContent";
import { CreditFindingsWorkspace, type CreditFindingListItem } from "../findings/CreditFindingsWorkspace";
import { ReviewWorkspaceHeader } from "../workspace-header/ReviewWorkspaceHeader";
import { getCreditActivityPresentation, getCreditFindingIcon, getCreditSourceIcon, type CreditActivityKind } from "../creditReviewPresentation";
import { getDesignOption } from "../../design-tools/designOptions";
import {
  getPrimaryReviewSection,
  getStandardReview,
  getStandardReviewPath,
  standardReviewSlugs,
  type ReviewActivity,
  type ReviewFinding,
  type ReviewMetric,
  type StandardReviewSection,
  type StandardReviewSlug,
} from "../reviewData";
import type { CaseStatus } from "../../../shared/ui/CaseStatusPill/CaseStatusPill";
import styles from "./StandardReviewWorkspace.module.css";
import { isStandardReviewRevisionInProgress, usePersistentStandardReviewState } from "./standardReviewState";
import {
  seniorDecisionLabel,
  type AnalystRecommendationDraft,
  type AnalystRecommendationRecord,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";

type StandardReviewTab = "overview" | StandardReviewSection;
type DecisionChoice = "approve" | "approve-with-conditions" | "defer";
type FindingLayout = "split" | "cards" | "queue";

function getStandardLearningScope(activeTab: StandardReviewTab): PlatformLearningScope {
  return `standard-${activeTab}` as PlatformLearningScope;
}

const findingLayoutOptions = [
  { id: "split", label: "Split", description: "Keep the finding list beside the selected detail." },
  { id: "cards", label: "Cards", description: "Compare findings as spacious decision cards." },
  { id: "queue", label: "Queue", description: "Work through a focused review queue." },
] satisfies Array<{ id: FindingLayout; label: string; description: string }>;

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "findings", label: "Findings" },
  { id: "sources", label: "Sources" },
  { id: "activity", label: "Activity" },
  { id: "recommendation", label: "Recommendation" },
] satisfies Array<{ id: StandardReviewTab; label: string }>;

export function StandardReviewWorkspace() {
  const { pathname, search, navigate } = useRouter();
  const slug = standardReviewSlugs.find((candidate) => pathname === `/credit-reviews/${candidate}` || pathname.startsWith(`/credit-reviews/${candidate}/`));
  const review = slug ? getStandardReview(slug) : undefined;

  const activeTab: StandardReviewTab = pathname.endsWith("/findings")
    ? "findings"
    : pathname.endsWith("/sources")
      ? "sources"
      : pathname.endsWith("/activity")
        ? "activity"
        : pathname.endsWith("/recommendation")
          ? "recommendation"
          : "overview";

  if (!review || !slug) return null;
  return (
    <LearningModeSurface scope={getStandardLearningScope(activeTab)}>
    <StandardWorkspaceContent
      review={review}
      slug={slug as StandardReviewSlug}
      activeTab={activeTab}
      pathname={pathname}
      search={search}
      navigate={navigate}
    />
    </LearningModeSurface>
  );
}

function StandardWorkspaceContent({ review, slug, activeTab, pathname, search, navigate }: { review: NonNullable<ReturnType<typeof getStandardReview>>; slug: StandardReviewSlug; activeTab: StandardReviewTab; pathname: string; search: string; navigate: ReturnType<typeof useRouter>["navigate"] }) {
  const { enabled } = useLearningMode();
  const [workflowState, dispatchWorkflow] = usePersistentStandardReviewState(slug);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const reviewedFindingIds = workflowState.reviewedFindingIds;
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionChoice, setDecisionChoice] = useState<DecisionChoice>("approve-with-conditions");
  const [decisionNote, setDecisionNote] = useState("");
  const returnedToAnalyst = workflowState.seniorDecision?.decision === "return_to_analyst";
  const returnedDecision = returnedToAnalyst
    ? workflowState.seniorDecision
    : workflowState.decisionHistory?.find((record) => record.decision === "return_to_analyst");
  const finalSeniorDecision = workflowState.seniorDecision?.decision === "return_to_analyst" ? undefined : workflowState.seniorDecision;
  const recordedDecision = finalSeniorDecision ? seniorDecisionLabel(finalSeniorDecision.decision) : null;
  const revisionInProgress = isStandardReviewRevisionInProgress(workflowState);
  const recommendationSubmitted = !returnedToAnalyst && (workflowState.recommendationSubmitted
    || (!revisionInProgress && (review.status === "ready-for-decision" || review.status === "completed")));
  const priorRecommendation = workflowState.recommendationHistory?.[0] ?? workflowState.recommendation;
  const revisionDraft: AnalystRecommendationDraft = workflowState.recommendationDraft ?? {
    decision: priorRecommendation?.decision ?? review.details.recommendation.title,
    amount: priorRecommendation?.amount ?? review.request,
    rationale: priorRecommendation?.rationale ?? review.details.recommendation.rationale,
    conditions: [...(priorRecommendation?.conditions ?? review.details.recommendation.conditions)],
    activeSection: 1,
    updatedAt: priorRecommendation?.createdAt ?? new Date().toISOString(),
  };
  const displayedRecommendation = revisionInProgress
    ? revisionDraft
    : workflowState.recommendation ?? {
      decision: review.details.recommendation.title,
      amount: review.request,
      rationale: review.details.recommendation.rationale,
      conditions: review.details.recommendation.conditions,
    };
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const reviewCompany = review.company;
  const reviewOwner = review.owner;
  const learning = (topicId: "standard-overview" | "standard-findings" | "standard-sources" | "standard-activity" | "standard-recommendation") => getLearningTargetProps(enabled, topicId);
  const findingParams = useMemo(() => new URLSearchParams(search), [search]);
  const requestedDesignOption = getDesignOption(findingParams.get("design"));
  const findingsDesignOption = requestedDesignOption?.area === "findings-overview" ? requestedDesignOption : undefined;
  const legacyFindingLayout = findingsDesignOption?.renderKey === "finding-layout-lab";
  const findingFromUrl = findingParams.get("finding");
  const findingLayout: FindingLayout = findingParams.get("layout") === "cards" || findingParams.get("layout") === "queue"
    ? findingParams.get("layout") as FindingLayout
    : "split";
  const selectedFinding = review.details.findings.find((finding) => finding.id === findingFromUrl) ?? review.details.findings[0];
  const selectedSource = review.details.sources.find((source) => source.id === selectedSourceId);

  function navigateToTab(tab: StandardReviewTab) {
    navigate(tab === "overview" ? getStandardReviewPath(slug) : getStandardReviewPath(slug, tab));
  }

  function selectFinding(finding: ReviewFinding) {
    const params = new URLSearchParams(search);
    params.set("finding", finding.id);
    navigate(getStandardReviewPath(slug, "findings"), { search: `?${params.toString()}` });
  }

  function setFindingLayout(layout: FindingLayout) {
    const params = new URLSearchParams(search);
    if (layout === "split") params.delete("layout");
    else params.set("layout", layout);
    navigate(getStandardReviewPath(slug, "findings"), { search: params.toString() ? `?${params.toString()}` : "" });
  }

  function markFindingReviewed(finding: ReviewFinding) {
    dispatchWorkflow({ type: "toggle_finding", findingId: finding.id });
    setToast({ title: reviewedFindingIds.includes(finding.id) ? "Review mark removed" : "Finding marked reviewed", message: `${finding.title} remains attributable to you; the underlying assessment was not changed.` });
  }

  function recordDecision() {
    const decision: SeniorDecisionRecord["decision"] = decisionChoice === "approve" ? "approve" : decisionChoice === "approve-with-conditions" ? "approve_with_conditions" : "return_to_analyst";
    const record: SeniorDecisionRecord = { decision, rationale: decisionNote, conditions: decision === "approve_with_conditions" ? review.details.recommendation.conditions : [], decisionMaker: "Morgan Lee", createdAt: new Date().toISOString() };
    const label = seniorDecisionLabel(decision);
    dispatchWorkflow({ type: "record_senior_decision", record });
    setDecisionOpen(false);
    setToast({ title: "Decision recorded", message: `${label} for ${reviewCompany}. The case activity now attributes the action to ${reviewOwner}.` });
  }

  function submitRecommendation() {
    const recommendation = revisionInProgress ? revisionDraft : displayedRecommendation;
    const record: AnalystRecommendationRecord = {
      decision: recommendation.decision.trim(),
      amount: recommendation.amount,
      rationale: recommendation.rationale.trim(),
      conditions: [...recommendation.conditions],
      author: review.owner,
      createdAt: new Date().toISOString(),
    };
    dispatchWorkflow({ type: "submit_recommendation", record });
    setToast({ title: "Recommendation submitted", message: `${reviewCompany} is now awaiting a senior credit decision. The analyst recommendation is preserved separately from the final outcome.` });
  }

  function reopenReturnedRecommendation() {
    dispatchWorkflow({ type: "reopen_returned_recommendation", at: new Date().toISOString() });
    setToast({ title: "Recommendation reopened", message: "The senior return instructions remain in Activity while the analyst prepares a revision." });
  }

  function updateRevisionDraft(patch: Partial<Pick<AnalystRecommendationDraft, "decision" | "rationale" | "conditions">>) {
    dispatchWorkflow({
      type: "save_recommendation_draft",
      draft: { ...revisionDraft, ...patch, updatedAt: new Date().toISOString() },
    });
  }

  function toggleRevisionCondition(condition: string) {
    updateRevisionDraft({
      conditions: revisionDraft.conditions.includes(condition)
        ? revisionDraft.conditions.filter((item) => item !== condition)
        : [...revisionDraft.conditions, condition],
    });
  }

  const primarySection = getPrimaryReviewSection(review.aiReviewState);
  const findingsReviewed = review.details.findings.every((finding) => finding.status === "Complete" || reviewedFindingIds.includes(finding.id));
  const analysisReviewComplete = review.status === "ready-for-decision" || review.status === "completed" || review.aiReviewState === "review-complete" || findingsReviewed;
  const openFindings = review.details.findings.filter((finding) => finding.status !== "Complete" && !reviewedFindingIds.includes(finding.id));
  const addressedFindings = review.details.findings.filter((finding) => finding.status === "Complete" || reviewedFindingIds.includes(finding.id));
  const decisionActivityRecords = [...(workflowState.decisionHistory ?? [])];
  if (workflowState.seniorDecision && !decisionActivityRecords.some((record) => record.createdAt === workflowState.seniorDecision?.createdAt)) {
    decisionActivityRecords.unshift(workflowState.seniorDecision);
  }
  const recommendationActivityRecords = [...(workflowState.recommendationHistory ?? [])];
  if (workflowState.recommendation && !recommendationActivityRecords.some((record) => record.createdAt === workflowState.recommendation?.createdAt)) {
    recommendationActivityRecords.unshift(workflowState.recommendation);
  }
  const workflowActivityItems = [
    ...decisionActivityRecords.map((record) => ({ createdAt: record.createdAt, item: toSeniorDecisionActivityItem(record) })),
    ...recommendationActivityRecords.map((record) => ({ createdAt: record.createdAt, item: toRecommendationActivityItem(record) })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).map(({ item }) => item);
  const isRecommendationSubmitted = recommendationSubmitted;
  const isDecisionRecorded = Boolean(finalSeniorDecision) || (!returnedToAnalyst && !revisionInProgress && review.status === "completed");
  const reviewNextActionLabel = review.aiReviewState === "needs-verification" ? "Resolve source verification" : review.aiReviewState === "needs-judgment" ? "Review open finding" : review.aiReviewState === "analysis-updated" ? "Review updated analysis" : "Review analysis";
  const headerActionLabel = returnedToAnalyst
    ? "Revise recommendation"
    : revisionInProgress
      ? "Continue revision"
      : isDecisionRecorded
        ? "View decision record"
        : isRecommendationSubmitted
          ? "Review decision"
          : analysisReviewComplete
            ? "Prepare recommendation"
            : reviewNextActionLabel;
  const headerActionTab: StandardReviewTab = returnedToAnalyst || revisionInProgress || analysisReviewComplete ? "recommendation" : primarySection ?? "findings";
  const headerCaseStatus: CaseStatus = returnedToAnalyst
    ? "revision-requested"
    : revisionInProgress
      ? "revision-requested"
      : workflowState.seniorDecision
        ? workflowState.seniorDecision.decision === "decline" ? "declined" : "approved"
        : isRecommendationSubmitted
          ? "awaiting-decision"
          : areStandardReviewFindingsComplete(review, workflowState)
            ? "ready-to-recommend"
          : review.caseStatus;

  function openHeaderAction() {
    if (isDecisionRecorded || isRecommendationSubmitted) {
      navigate(`/credit-reviews/${slug}/senior-decision/review` as AppPath);
      return;
    }
    navigateToTab(headerActionTab);
  }

  return (
    <div className={styles.page}>
      <ReviewWorkspaceHeader>
        <div {...getLearningTargetProps(enabled, "case-header")}><ObjectHeader
          backLabel="Credit reviews"
          onBack={() => navigate("/credit-reviews")}
          logo={<CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} size="lg" />}
          title={review.company}
          metadata={[review.request, review.details.term, review.owner, `Due ${review.due.toLowerCase()}`]}
          status={<CaseStatusPill status={headerCaseStatus} />}
          utilityAction={<ReviewBookmarkButton slug={review.slug} company={review.company} />}
          action={activeTab === "overview" ? <Button variant={isRecommendationSubmitted || analysisReviewComplete ? "primary" : "secondary"} onClick={openHeaderAction}>{headerActionLabel}</Button> : undefined}
        /></div>

        <div {...getLearningTargetProps(enabled, "review-navigation")}><Tabs<StandardReviewTab>
          ariaLabel={`${review.company} review sections`}
          value={activeTab}
          onChange={navigateToTab}
          items={tabItems.map((item) => item.id === "findings"
            ? { ...item, count: openFindings.length }
            : item.id === "sources"
              ? { ...item, count: review.details.sources.length }
              : item)}
        /></div>
      </ReviewWorkspaceHeader>

      {activeTab === "overview" && (
        <div id="overview-panel" role="tabpanel" className={styles.tabContent} {...learning("standard-overview")}>
          <section className={styles.summaryGrid} aria-label="Review summary">
            <Panel className={styles.assessmentPanel}>
              <span className={styles.eyebrow}>Decision focus</span>
              <h2>{review.details.decisionQuestion}</h2>
              <p>{review.details.assessment}</p>
              <KeyValueGrid columns={2} items={[
                { label: "Request", value: review.request },
                { label: "Purpose", value: review.details.purpose },
                { label: "Term", value: review.details.term },
                { label: "Owner", value: review.owner },
              ]} />
            </Panel>

            <Panel className={styles.posturePanel}>
              <div className={styles.postureHeader}>
                <span>Initial view</span>
                <CaseStatusPill status={headerCaseStatus} />
              </div>
              <strong>{review.details.posture}</strong>
              <p>{review.details.recommendation.rationale}</p>
              <div className={styles.postureAction}>
                <span><strong>Next step</strong>{review.details.recommendation.nextStep}</span>
              </div>
            </Panel>
          </section>

          <Notice tone={review.aiReviewState === "needs-verification" ? "warning" : review.aiReviewState === "review-complete" ? "success" : "info"} title="Human review remains authoritative">
            The analysis organizes evidence and calculations. The analyst owns the recommendation, and the credit approver owns the final decision.
          </Notice>

          {review.details.metrics.some((metric) => metric.policyComparison) ? (
            <section className={styles.section} aria-labelledby="policy-headroom-title">
            <SectionHeader headingId="policy-headroom-title" title="Policy headroom" description="Projected leverage and downside coverage compared with underwriting boundaries." />
              <PolicyHeadroomProfile metrics={review.details.metrics} />
            </section>
          ) : (
            <section className={styles.section} aria-labelledby="case-metrics-title">
              <SectionHeader headingId="case-metrics-title" title="Decision metrics" description="Current values from the evidence included in this review." />
              <div className={styles.metricGrid}>
                {review.details.metrics.map((metric) => <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} detailTone={metric.detailTone} density="compact" />)}
              </div>
            </section>
          )}

          <section className={styles.section} aria-labelledby="key-findings-title">
            <SectionHeader headingId="key-findings-title" title="Key findings" description="Open a finding to review the underlying evidence and required next step." />
            <Panel elevation="flat" className={styles.ledger}>
              {review.details.findings.map((finding) => <FindingRow key={finding.id} finding={finding} onOpen={() => selectFinding(finding)} reviewed={reviewedFindingIds.includes(finding.id)} />)}
            </Panel>
          </section>
        </div>
      )}

      {activeTab === "findings" && selectedFinding && (
        <div id="findings-panel" role="tabpanel" className={`${styles.tabContent} ${styles.findingsContent}`} {...learning("standard-findings")}>
          {findingsDesignOption && findingsDesignOption.status !== "current" && (
            <DesignVariantNotice
              area={findingsDesignOption.areaLabel}
              variant={`${findingsDesignOption.version} — ${findingsDesignOption.name}`}
              onReturn={() => navigate(getStandardReviewPath(slug as StandardReviewSlug, "findings"))}
            />
          )}
          <SectionHeader
            title={legacyFindingLayout ? "Findings" : "Review findings"}
            description={legacyFindingLayout ? findingLayoutOptions.find((option) => option.id === findingLayout)?.description : "Select a finding to inspect its risk, evidence, policy context, and required next step."}
            actions={legacyFindingLayout ? <FindingLayoutSwitcher value={findingLayout} onChange={setFindingLayout} /> : undefined}
          />
          {legacyFindingLayout ? (
            <div className={`${styles.findingWorkspace} ${findingLayout === "cards" ? styles.findingWorkspaceCards : findingLayout === "queue" ? styles.findingWorkspaceQueue : styles.findingWorkspaceSplit}`}>
              <Panel elevation="flat" className={styles.findingList}>
                <div className={styles.findingListHeader}>
                  <span>Review status</span>
                  <small>{openFindings.length} open</small>
                </div>
                {review.details.findings.map((finding) => (
                  <button key={finding.id} type="button" className={finding.id === selectedFinding.id ? styles.findingSelected : ""} aria-pressed={finding.id === selectedFinding.id} onClick={() => selectFinding(finding)}>
                    <span className={styles.findingIdentity}><IconTile size="sm"><Icon name={getCreditFindingIcon(finding)} size="sm" /></IconTile><span className={styles.findingRowCopy}><strong>{finding.title}</strong><small>{finding.description}</small></span></span>
                    <span className={styles.findingRowMeta}><StatusPill tone={findingStatusTone(finding, reviewedFindingIds.includes(finding.id))}>{findingStatusLabel(finding, reviewedFindingIds.includes(finding.id))}</StatusPill><Icon name="chevronRight" size="sm" /></span>
                  </button>
                ))}
              </Panel>
              <Panel elevation="flat" className={styles.findingDetail}>
                <StandardFindingDetail
                  finding={selectedFinding}
                  reviewed={reviewedFindingIds.includes(selectedFinding.id)}
                  sources={review.details.sources}
                  onOpenSource={setSelectedSourceId}
                  onToggleReview={() => markFindingReviewed(selectedFinding)}
                  onViewActivity={() => navigateToTab("activity")}
                />
              </Panel>
            </div>
          ) : (
            <CreditFindingsWorkspace
              groups={[
                ...(openFindings.length > 0 ? [{ title: "Open findings", items: openFindings.map((finding) => toWorkspaceFinding(finding, false)) }] : []),
                ...(addressedFindings.length > 0 ? [{ title: "Addressed findings", items: addressedFindings.map((finding) => toWorkspaceFinding(finding, reviewedFindingIds.includes(finding.id))) }] : []),
              ]}
              selectedId={selectedFinding.id}
              onSelect={(id) => {
                const finding = review.details.findings.find((item) => item.id === id);
                if (finding) selectFinding(finding);
              }}
              previewLabel={`${selectedFinding.title} preview`}
            >
              <div className={styles.findingDetail}>
                <StandardFindingDetail
                  finding={selectedFinding}
                  reviewed={reviewedFindingIds.includes(selectedFinding.id)}
                  sources={review.details.sources}
                  onOpenSource={setSelectedSourceId}
                  onToggleReview={() => markFindingReviewed(selectedFinding)}
                  onViewActivity={() => navigateToTab("activity")}
                  showRisk
                />
              </div>
            </CreditFindingsWorkspace>
          )}
        </div>
      )}

      {activeTab === "sources" && (
        <div id="sources-panel" role="tabpanel" className={styles.tabContent} {...learning("standard-sources")}>
          <SectionHeader title="Sources" description="Evidence included in the current assessment. Open any source to inspect its review context." />
          {review.aiReviewState === "needs-verification" && <Notice tone="warning" title="Verification is still open">Resolve the cited source exceptions before relying on the affected calculations.</Notice>}
          <Panel elevation="flat" className={styles.sourceLedger}>
            <div className={styles.ledgerHeader} aria-hidden="true"><span>Document</span><span>Review context</span></div>
            {review.details.sources.map((source) => (
              <div key={source.id} className={styles.sourceRow}>
                <DocumentRow name={source.name} meta={source.meta} icon={getCreditSourceIcon(source)} onOpen={() => setSelectedSourceId(source.id)} />
                <span>{source.summary}</span>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {activeTab === "activity" && (
        <div id="activity-panel" role="tabpanel" className={styles.tabContent} {...learning("standard-activity")}>
          <SectionHeader title="Activity" description="Evidence, analysis, and human actions remain separately attributable." />
          <ActivityLedger
            layout="timeline"
            items={[
              ...workflowActivityItems,
              ...(recommendationActivityRecords.length === 0 && recommendationSubmitted ? [{ id: "recommendation-submitted", title: "Analyst recommendation submitted for senior review", meta: "Submitted record", description: `${displayedRecommendation.decision} · Prepared by ${review.owner}.`, tone: "human" as const, icon: "send" as const, details: displayedRecommendation.rationale }] : []),
              ...review.details.activity.map(toActivityLedgerItem),
            ]}
            expandedId={expandedActivityId}
            onToggle={(id) => setExpandedActivityId((current) => current === id ? null : id)}
          />
        </div>
      )}

      {activeTab === "recommendation" && (
        <div id="recommendation-panel" role="tabpanel" className={styles.tabContent} {...learning("standard-recommendation")}>
          <SectionHeader
            title="Recommendation"
            description="Turn completed analyst review into an attributable package for senior approval. This is a handoff stage—not the final credit decision."
            actions={<StatusPill tone={returnedToAnalyst ? "warning" : revisionInProgress ? "info" : isDecisionRecorded ? "success" : isRecommendationSubmitted ? "warning" : analysisReviewComplete ? "info" : "neutral"}>{returnedToAnalyst ? "Returned to analyst" : revisionInProgress ? "Revision in progress" : recordedDecision ? "Decision recorded" : isDecisionRecorded ? "Completed" : isRecommendationSubmitted ? "Awaiting senior decision" : analysisReviewComplete ? "Ready to prepare" : "Not ready"}</StatusPill>}
          />
          <div className={styles.recommendationChecklist} aria-label="Recommendation prerequisites">
            <div data-complete={review.aiReviewState !== "needs-verification"}><span><Icon name={review.aiReviewState !== "needs-verification" ? "check" : "lock"} size="xs" /></span><div><strong>Required sources verified</strong><small>{review.aiReviewState !== "needs-verification" ? "The cited evidence is available to the analysis." : "Resolve the source exception before relying on the affected calculation."}</small></div><StatusPill tone={review.aiReviewState !== "needs-verification" ? "success" : "neutral"}>{review.aiReviewState !== "needs-verification" ? "Complete" : "Required"}</StatusPill></div>
            <div data-complete={analysisReviewComplete}><span><Icon name={analysisReviewComplete ? "check" : "lock"} size="xs" /></span><div><strong>Analyst review complete</strong><small>{analysisReviewComplete ? "The updated analysis and findings have been reviewed." : "Open the affected finding and mark the updated analysis reviewed."}</small></div><StatusPill tone={analysisReviewComplete ? "success" : "neutral"}>{analysisReviewComplete ? "Complete" : "Required"}</StatusPill></div>
            <div data-complete={isRecommendationSubmitted}><span><Icon name={returnedToAnalyst || revisionInProgress ? "refresh" : isRecommendationSubmitted ? "check" : "lock"} size="xs" /></span><div><strong>Recommendation handoff</strong><small>{returnedToAnalyst ? "Senior credit requested a revision before another decision." : revisionInProgress ? "The prior submission is preserved while you update the draft." : isRecommendationSubmitted ? "The analyst package is locked for senior review." : "Submission remains an analyst-owned action."}</small></div><StatusPill tone={returnedToAnalyst ? "warning" : revisionInProgress ? "info" : isRecommendationSubmitted ? "success" : "neutral"}>{returnedToAnalyst ? "Revision required" : revisionInProgress ? "In progress" : isRecommendationSubmitted ? "Complete" : "Required"}</StatusPill></div>
          </div>
          <Panel className={styles.recommendationPanel}>
            <SectionHeader
              eyebrow={returnedToAnalyst ? "Submitted analyst recommendation" : revisionInProgress ? "Analyst revision · Editable draft" : isDecisionRecorded ? "Decision record" : isRecommendationSubmitted ? "Submitted analyst recommendation" : "AI-assisted draft · Analyst owned"}
              title={recordedDecision ?? displayedRecommendation.decision}
              actions={<StatusPill tone={returnedToAnalyst ? "warning" : revisionInProgress ? "info" : recordedDecision ? "success" : review.details.recommendation.tone}>{returnedToAnalyst ? "Returned" : revisionInProgress ? "Editing" : recordedDecision ? "Recorded" : isRecommendationSubmitted ? "Submitted" : "Draft"}</StatusPill>}
            />
            {revisionInProgress ? (
              <RecommendationRevisionEditor
                draft={revisionDraft}
                availableConditions={Array.from(new Set([...review.details.recommendation.conditions, ...revisionDraft.conditions]))}
                onDecisionChange={(decision) => updateRevisionDraft({ decision })}
                onRationaleChange={(rationale) => updateRevisionDraft({ rationale })}
                onToggleCondition={toggleRevisionCondition}
              />
            ) : (
              <>
                <p className={styles.recommendationRationale}>{displayedRecommendation.rationale}</p>
                <div className={styles.conditionList}>
                  <span>Proposed conditions</span>
                  {displayedRecommendation.conditions.map((condition) => <div key={condition}><Icon name="check" size="xs" /><span>{condition}</span></div>)}
                </div>
              </>
            )}
            {returnedToAnalyst ? (
              <Notice tone="warning" title="Revision requested">
                {returnedDecision?.rationale || "Senior credit returned the recommendation for analyst revision."} The submitted analyst record remains preserved in Activity.
              </Notice>
            ) : revisionInProgress ? (
              <Notice tone="info" title="Revision in progress">Update the posture, rationale, and conditions, then submit a new attributable recommendation for senior review.</Notice>
            ) : (
              <Notice tone={isDecisionRecorded ? "success" : isRecommendationSubmitted || analysisReviewComplete ? "info" : "warning"} title={recordedDecision ? "Decision recorded" : isDecisionRecorded ? "Decision completed" : isRecommendationSubmitted ? "Awaiting senior decision" : analysisReviewComplete ? "Ready for analyst submission" : "Complete the analyst review first"}>
                {recordedDecision ? `${recordedDecision}. The action is available in Activity.` : isRecommendationSubmitted ? "The recommendation is now a submitted record. A senior credit officer must approve, approve with conditions, return, or decline it." : analysisReviewComplete ? "Confirm the rationale and proposed conditions, then submit the package for senior review." : review.details.recommendation.nextStep}
              </Notice>
            )}
            <div className={styles.recommendationActions}>
              {returnedToAnalyst
                ? <Button variant="primary" onClick={reopenReturnedRecommendation}>Revise recommendation</Button>
                : revisionInProgress
                  ? <Button variant="primary" disabled={!revisionDraft.decision.trim() || !revisionDraft.rationale.trim()} onClick={submitRecommendation}>Submit revised recommendation</Button>
                : isDecisionRecorded
                  ? <Button variant="secondary" onClick={() => navigate(`/credit-reviews/${slug}/senior-decision/review` as import("../../../app/router").AppPath)}>View decision record</Button>
                : isRecommendationSubmitted
                  ? <Button variant="primary" onClick={() => navigate(`/credit-reviews/${slug}/senior-decision/review` as import("../../../app/router").AppPath)}>{recordedDecision ? "View decision record" : "Open senior review"}</Button>
                  : analysisReviewComplete
                    ? <Button variant="primary" onClick={submitRecommendation}>Submit for senior review</Button>
                    : <Button variant="primary" onClick={() => navigateToTab(headerActionTab)}>{reviewNextActionLabel}</Button>}
            </div>
          </Panel>
        </div>
      )}

      <DocumentViewer open={Boolean(selectedSource)} onClose={() => setSelectedSourceId(null)} title={selectedSource?.name ?? "Source document"} meta={selectedSource?.meta ?? "Reviewed source"} learningTargetProps={getLearningTargetProps(enabled, "standard-sources")}>
          <p>{selectedSource?.summary}</p>
          <p>This evidence is cited in the current {review.company} credit review.</p>
      </DocumentViewer>

      {decisionOpen && !workflowState.recommendation && <LearningTarget topicId="standard-recommendation">
        <DecisionDrawer
          company={review.company}
          completed={isDecisionRecorded}
          currentDecision={recordedDecision ?? (isDecisionRecorded ? review.details.recommendation.title : null)}
          choice={decisionChoice}
          note={decisionNote}
          conditions={review.details.recommendation.conditions}
          onChoiceChange={setDecisionChoice}
          onNoteChange={setDecisionNote}
          onClose={() => setDecisionOpen(false)}
          onSubmit={recordDecision}
        />
      </LearningTarget>}

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

function PolicyHeadroomProfile({ metrics }: { metrics: ReviewMetric[] }) {
  const comparedMetrics = metrics.filter((metric): metric is ReviewMetric & { policyComparison: NonNullable<ReviewMetric["policyComparison"]> } => Boolean(metric.policyComparison));
  const supportingMetrics = metrics.filter((metric) => !metric.policyComparison);
  const insidePolicy = comparedMetrics.every(({ policyComparison }) => policyComparison.direction === "minimum"
    ? policyComparison.actual >= policyComparison.boundary
    : policyComparison.actual <= policyComparison.boundary);

  return (
    <Panel elevation="flat" className={styles.policyProfile}>
      <header className={styles.policyProfileHeader}>
        <div>
          <strong>{insidePolicy ? "Capacity remains inside policy" : "Policy exception requires review"}</strong>
          <p>Scenario values and policy markers share the same scale for each measure.</p>
        </div>
        <StatusPill tone={insidePolicy ? "success" : "warning"}>{insidePolicy ? "Inside policy" : "Needs judgment"}</StatusPill>
      </header>

      <div className={styles.policyProfileBody}>
        <div className={styles.policyMeasures}>
          {comparedMetrics.map((metric) => <PolicyMeasure key={metric.label} metric={metric} />)}
        </div>
        {supportingMetrics.length > 0 && (
          <dl className={styles.policySupport} aria-label="Supporting capacity facts">
            {supportingMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
                <small>{metric.detail}</small>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Panel>
  );
}

function PolicyMeasure({ metric }: { metric: ReviewMetric & { policyComparison: NonNullable<ReviewMetric["policyComparison"]> } }) {
  const { policyComparison } = metric;
  const actualPosition = getScalePosition(policyComparison.actual, policyComparison.domain);
  const boundaryPosition = getScalePosition(policyComparison.boundary, policyComparison.domain);
  const trackStyle = {
    "--policy-actual-position": `${actualPosition}%`,
    "--policy-boundary-position": `${boundaryPosition}%`,
  } as CSSProperties;
  return (
    <div className={styles.policyMeasure}>
      <div className={styles.policyMeasureHeader}>
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
      </div>
      <div
        className={styles.policyTrack}
        style={trackStyle}
        role="img"
        aria-label={`${metric.label}: ${metric.value}. ${policyComparison.varianceLabel}. ${policyComparison.boundaryLabel}.`}
      >
        <span className={styles.policyActual} aria-hidden="true" />
        <span className={styles.policyBoundary} aria-hidden="true" />
        <span className={styles.policyPoint} aria-hidden="true" />
      </div>
      <div className={styles.policyMeasureMeta}>
        <span>{policyComparison.varianceLabel}</span>
        <span>{policyComparison.boundaryLabel}</span>
      </div>
    </div>
  );
}

function getScalePosition(value: number, domain: readonly [number, number]) {
  const [minimum, maximum] = domain;
  if (maximum <= minimum) return 0;
  return Math.min(100, Math.max(0, ((value - minimum) / (maximum - minimum)) * 100));
}

function RecommendationRevisionEditor({ draft, availableConditions, onDecisionChange, onRationaleChange, onToggleCondition }: {
  draft: AnalystRecommendationDraft;
  availableConditions: string[];
  onDecisionChange: (decision: string) => void;
  onRationaleChange: (rationale: string) => void;
  onToggleCondition: (condition: string) => void;
}) {
  return (
    <div className={styles.revisionEditor}>
      <label className={styles.revisionField}>
        <span>Recommendation posture <small>Required</small></span>
        <input value={draft.decision} onChange={(event) => onDecisionChange(event.target.value)} />
      </label>
      <label className={styles.revisionField}>
        <span>Analyst rationale <small>Required</small></span>
        <textarea value={draft.rationale} onChange={(event) => onRationaleChange(event.target.value)} />
      </label>
      <fieldset className={styles.revisionConditions}>
        <legend>Proposed conditions <small>Select the protections that should travel with the revised recommendation.</small></legend>
        {availableConditions.map((condition) => (
          <label key={condition}>
            <input type="checkbox" checked={draft.conditions.includes(condition)} onChange={() => onToggleCondition(condition)} />
            <span>{condition}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

function toSeniorDecisionActivityItem(record: SeniorDecisionRecord): ActivityLedgerItem {
  const returned = record.decision === "return_to_analyst";
  const declined = record.decision === "decline";
  const label = seniorDecisionLabel(record.decision);
  return {
    id: `senior-decision-${record.createdAt}`,
    title: returned ? `${record.decisionMaker} returned the recommendation to the analyst` : `${record.decisionMaker} recorded a senior credit decision`,
    meta: "Senior decision record",
    description: `${label}${record.rationale ? ` · ${record.rationale}` : ""}`,
    details: record.rationale || "Decision recorded from the reviewed case record.",
    icon: returned || declined ? "alertCircle" : "checkCircle",
    tone: returned ? "warning" : declined ? "danger" : "success",
  };
}

function toRecommendationActivityItem(record: AnalystRecommendationRecord): ActivityLedgerItem {
  return {
    id: `recommendation-${record.createdAt}`,
    title: `${record.author} submitted a recommendation for senior review`,
    meta: "Analyst submission",
    description: `${record.decision} · ${record.amount}`,
    details: record.rationale,
    icon: "send",
    tone: "human",
  };
}

function toActivityLedgerItem(event: ReviewActivity): ActivityLedgerItem {
  const isDecision = /decision/i.test(`${event.id} ${event.title}`);
  const kind: CreditActivityKind = isDecision ? "decision" : event.tone === "ai" ? "ai" : event.tone === "human" ? "human" : "evidence";
  return { ...event, ...getCreditActivityPresentation(kind, event.tone === "warning") };
}

function FindingLayoutSwitcher({ value, onChange }: { value: FindingLayout; onChange: (layout: FindingLayout) => void }) {
  return (
    <div className={styles.layoutSwitcher} role="group" aria-label="Finding layout">
      {findingLayoutOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-label={`${option.label} finding layout`}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FindingRow({ finding, reviewed, onOpen }: { finding: ReviewFinding; reviewed: boolean; onOpen: () => void }) {
  return (
    <button type="button" className={styles.ledgerRow} onClick={onOpen}>
      <span className={styles.findingIdentity}><IconTile size="sm"><Icon name={getCreditFindingIcon(finding)} size="sm" /></IconTile><span className={styles.findingRowCopy}><strong>{finding.title}</strong><small>{finding.description}</small></span></span>
      <span><StatusPill tone={findingStatusTone(finding, reviewed)}>{findingStatusLabel(finding, reviewed)}</StatusPill><Icon name="chevronRight" size="sm" /></span>
    </button>
  );
}

function toWorkspaceFinding(finding: ReviewFinding, reviewed: boolean): CreditFindingListItem {
  return {
    id: finding.id,
    title: finding.title,
    summary: finding.description,
    icon: getCreditFindingIcon(finding),
    risk: { label: `${finding.risk} risk`, level: finding.risk.toLowerCase() as CreditFindingListItem["risk"]["level"] },
    status: { label: findingStatusLabel(finding, reviewed), tone: findingStatusTone(finding, reviewed) },
  };
}

function findingStatusLabel(finding: ReviewFinding, reviewed: boolean) {
  if (finding.status === "Complete") return "Complete";
  return reviewed ? "Reviewed in this session" : finding.status;
}

function findingStatusTone(finding: ReviewFinding, reviewed: boolean): StatusPillTone {
  return finding.status === "Complete" || reviewed ? "success" : finding.tone;
}

function StandardFindingDetail({ finding, reviewed, sources, onOpenSource, onToggleReview, onViewActivity, showRisk = false }: {
  finding: ReviewFinding;
  reviewed: boolean;
  sources: Array<{ id: string; name: string; meta: string }>;
  onOpenSource: (id: string) => void;
  onToggleReview: () => void;
  onViewActivity: () => void;
  showRisk?: boolean;
}) {
  return (
    <>
      <div className={styles.findingDetailHeader}>
        {showRisk
          ? <span className={styles.findingRisk} data-risk={finding.risk.toLowerCase()}>{finding.risk} risk</span>
          : <span className={styles.eyebrow}>Finding review</span>}
        <StatusPill tone={findingStatusTone(finding, reviewed)}>{findingStatusLabel(finding, reviewed)}</StatusPill>
      </div>
      <h2>{finding.title}</h2>
      <p className={styles.findingLead}>{finding.description}</p>
      <p>{finding.detail}</p>
      {finding.change && <div className={styles.changeRecord}><span>Assessment changed</span><strong>{finding.change.from}</strong><Icon name="arrowRight" size="sm" /><strong>{finding.change.to}</strong></div>}
      <KeyValueGrid items={[
        { label: "Policy context", value: finding.policy },
        { label: "Required next step", value: finding.nextStep },
      ]} />
      <div className={styles.citedSource}>
        <span>Cited evidence</span>
        {sources.filter((source) => source.id === finding.sourceId).map((source) => <DocumentRow key={source.id} name={source.name} meta={source.meta} icon={getCreditSourceIcon(source)} onOpen={() => onOpenSource(source.id)} />)}
      </div>
      <div className={styles.detailActions}>
        {finding.status !== "Complete" && <Button variant={reviewed ? "secondary" : "primary"} onClick={onToggleReview}>{reviewed ? "Remove review mark" : "Mark reviewed"}</Button>}
        <Button variant="quiet" onClick={onViewActivity}>View activity</Button>
      </div>
    </>
  );
}

function DecisionDrawer({ company, completed, currentDecision, choice, note, conditions, onChoiceChange, onNoteChange, onClose, onSubmit }: {
  company: string;
  completed: boolean;
  currentDecision: string | null;
  choice: DecisionChoice;
  note: string;
  conditions: string[];
  onChoiceChange: (choice: DecisionChoice) => void;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const titleId = `decision-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Drawer open onClose={onClose} labelledBy={titleId}>
      <DrawerHeader onClose={onClose}>
        <span className={styles.eyebrow}>{completed ? "Decision record" : "Credit decision"}</span>
        <h2 id={titleId}>{company}</h2>
        <p>{completed ? currentDecision : "Record an accountable human outcome"}</p>
      </DrawerHeader>
      <DrawerBody>
        {completed ? (
          <DrawerSection className={styles.decisionSummary}>
            <StatusPill tone="success">{currentDecision ?? "Approved"}</StatusPill>
            <p>The decision, conditions, and actor are preserved in the case activity.</p>
            <dl><div><dt>Decision owner</dt><dd>Credit approver</dd></div><div><dt>Recorded</dt><dd>{currentDecision ? "Just now" : "Jul 25, 2026"}</dd></div></dl>
          </DrawerSection>
        ) : (
          <>
            <DrawerSection>
              <fieldset className={styles.decisionOptions}>
                <legend>Decision</legend>
                {([
                  ["approve-with-conditions", "Approve with conditions"],
                  ["approve", "Approve"],
                  ["defer", "Defer for more information"],
                ] as Array<[DecisionChoice, string]>).map(([value, label]) => <label key={value}><input type="radio" name="credit-decision" checked={choice === value} onChange={() => onChoiceChange(value)} /><span>{label}</span></label>)}
              </fieldset>
            </DrawerSection>
            <DrawerSection className={styles.decisionConditions}>
              <h3>Conditions carried forward</h3>
              {conditions.map((condition) => <span key={condition}><Icon name="check" size="xs" />{condition}</span>)}
            </DrawerSection>
            <DrawerSection className={styles.decisionNote}>
              <label htmlFor={`${titleId}-note`}>Decision note <span>Optional</span></label>
              <textarea id={`${titleId}-note`} value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Add rationale or follow-up for the case record" />
            </DrawerSection>
          </>
        )}
      </DrawerBody>
      <DrawerFooter className={styles.drawerFooter}>
        <Button variant="secondary" onClick={onClose}>{completed ? "Close" : "Cancel"}</Button>
        {!completed && <Button variant="primary" onClick={onSubmit}>Record decision</Button>}
      </DrawerFooter>
    </Drawer>
  );
}
