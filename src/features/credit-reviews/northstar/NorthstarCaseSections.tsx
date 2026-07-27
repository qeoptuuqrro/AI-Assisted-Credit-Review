import { ActivityLedger, type ActivityLedgerItem } from "../../../shared/ui/ActivityLedger/ActivityLedger";
import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { CreditFindingsState } from "../findings/CreditFindingsWorkspace";
import {
  evidenceProvenanceLabel,
  type EvidenceIntakeState,
} from "../workflow/evidenceWorkflow";
import {
  seniorDecisionLabel,
  type AnalystRecommendationRecord,
  type DocumentRequestRecord,
  type DocumentRequestStatus,
  type NorthstarReviewState,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import { NorthstarRecommendation } from "./NorthstarRecommendation";
import { getLearningTargetProps, useLearningMode } from "../learning/MeridianLearningMode";
import styles from "./NorthstarReviewWorkspace.module.css";

export type NorthstarTab = "overview" | "findings" | "financials" | "sources" | "activity" | "recommendation";
export type VerificationDisplayState = "missing" | "requested" | "received" | "processing" | "ready-for-review" | "verified" | "failed" | "cancelled";

type NorthstarCaseSectionsProps = {
  activeTab: NorthstarTab;
  legacyMode: boolean;
  useLegacyFindingsState: boolean;
  reviewState: NorthstarReviewState;
  evidenceState: EvidenceIntakeState;
  displayState: VerificationDisplayState;
  verified: boolean;
  onNavigate: (tab: NorthstarTab) => void;
  onOpenUpload: () => void;
  onOpenRequest: () => void;
  onCompleteAnalysisReview: () => void;
  onSubmitRecommendation: (record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) => void;
  onSeniorDecision: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onReopenReturnedRecommendation: () => void;
  onOpenSeniorReview?: () => void;
};

export function NorthstarCaseSections({
  activeTab,
  legacyMode,
  useLegacyFindingsState,
  reviewState,
  evidenceState,
  displayState,
  verified,
  onNavigate,
  onOpenUpload,
  onOpenRequest,
  onCompleteAnalysisReview,
  onSubmitRecommendation,
  onSeniorDecision,
  onReopenReturnedRecommendation,
  onOpenSeniorReview,
}: NorthstarCaseSectionsProps) {
  if (legacyMode) {
    return activeTab === "activity"
      ? <NorthstarActivity reviewState={reviewState} />
      : <LegacyOverview reviewState={reviewState} evidenceState={evidenceState} displayState={displayState} verified={verified} onOpenUpload={onOpenUpload} onOpenRequest={onOpenRequest} />;
  }

  if (activeTab === "findings") return <NorthstarFindings verified={verified} useLegacyState={useLegacyFindingsState} onNavigate={onNavigate} />;
  if (activeTab === "financials") return <NorthstarFinancials verified={verified} analysisReviewed={reviewState.analysisReviewState === "completed"} onNavigate={onNavigate} onCompleteAnalysisReview={onCompleteAnalysisReview} />;
  if (activeTab === "sources") return <NorthstarSources reviewState={reviewState} evidenceState={evidenceState} displayState={displayState} verified={verified} onOpenUpload={onOpenUpload} onOpenRequest={onOpenRequest} />;
  if (activeTab === "activity") return <NorthstarActivity reviewState={reviewState} />;
  if (activeTab === "recommendation") return <NorthstarRecommendation reviewState={reviewState} onNavigate={onNavigate} onSubmit={onSubmitRecommendation} onSeniorDecision={onSeniorDecision} onReopenReturnedRecommendation={onReopenReturnedRecommendation} onOpenSeniorReview={onOpenSeniorReview ?? (() => undefined)} />;
  return <NorthstarOverview reviewState={reviewState} evidenceState={evidenceState} displayState={displayState} verified={verified} onNavigate={onNavigate} />;
}

function NorthstarOverview({ reviewState, evidenceState, displayState, verified, onNavigate }: { reviewState: NorthstarReviewState; evidenceState: EvidenceIntakeState; displayState: VerificationDisplayState; verified: boolean; onNavigate: (tab: NorthstarTab) => void }) {
  const { enabled } = useLearningMode();
  return (
    <div id="overview-panel" role="tabpanel" className={styles.tabContent}>
      <section className={styles.overviewGrid} aria-label="Northstar assessment summary" {...getLearningTargetProps(enabled, "northstar-overview")}>
        <article className={styles.assessmentSummary}>
          <span>Initial assessment</span>
          <h2>{verified ? "Analysis ready" : "Evidence required"}</h2>
          <p>{verified ? "The verified forecast supports downside repayment capacity above the proposed policy floor." : "Downside repayment analysis is paused until the missing forecast is supplied and verified."}</p>
          <dl><div><dt>Request</dt><dd>$15M</dd></div><div><dt>Term</dt><dd>3 years</dd></div><div><dt>Owner</dt><dd>Alex Kim</dd></div></dl>
        </article>
        <CapacitySummary verified={verified} displayState={displayState} />
      </section>

      <VerificationNotice state={displayState} evidenceState={evidenceState} request={reviewState.request} />

      <section className={styles.flatSection} aria-labelledby="northstar-priorities-title">
        <SectionHeader headingId="northstar-priorities-title" title="Review priorities" description="Resolve the prerequisite that determines whether this case can advance." />
        <div className={styles.priorityLedger}>
          <button type="button" className={styles.priorityRow} onClick={() => onNavigate("sources")}>
            <IconTile size="sm"><Icon name="trendUp" size="sm" /></IconTile>
            <span><strong>2027 Operating Forecast</strong><small>{verified ? "Verified evidence completed the downside period." : "FY 2027 is missing from the approved source package."}</small></span>
            <span><small>Impact</small><strong>Downside capacity</strong></span>
            <span><small>Status</small><StatusPill tone={verified ? "success" : displayState === "ready-for-review" ? "info" : "warning"}>{requirementLabel(displayState)}</StatusPill></span>
            <span className={styles.requirementAction}><Icon name="chevronRight" size="sm" /></span>
          </button>
        </div>
      </section>
    </div>
  );
}

function LegacyOverview({ reviewState, evidenceState, displayState, verified, onOpenUpload, onOpenRequest }: Omit<NorthstarCaseSectionsProps, "activeTab" | "legacyMode" | "useLegacyFindingsState" | "onNavigate" | "onCompleteAnalysisReview" | "onSubmitRecommendation" | "onSeniorDecision" | "onReopenReturnedRecommendation">) {
  const requestSent = reviewState.request.status !== "draft" && reviewState.request.status !== "cancelled";
  return (
    <div id="overview-panel" role="tabpanel">
      <section className={styles.summaryGrid} aria-label="Northstar assessment summary">
        <article className={styles.requestCard}>
          <span>Initial assessment</span>
          <h2>{verified ? "Analysis ready" : "Evidence required"}</h2>
          <p>{verified ? "The verified forecast supports downside repayment capacity above the proposed policy floor." : "Downside repayment analysis cannot be completed using the currently approved evidence."}</p>
          <dl><div><dt>Request</dt><dd>$15M</dd></div><div><dt>Term</dt><dd>3 years</dd></div><div><dt>Owner</dt><dd>Alex Kim</dd></div></dl>
        </article>
        <CapacitySummary verified={verified} displayState={displayState} />
      </section>

      <VerificationNotice state={displayState} evidenceState={evidenceState} request={reviewState.request} />

      {!verified && (
        <div className={styles.evidenceActions} aria-label="Evidence options">
          <Button variant="primary" onClick={onOpenUpload}>{uploadActionLabel(evidenceState, reviewState.request.status)}</Button>
          <Button variant="secondary" onClick={onOpenRequest}>{requestSent ? "View borrower request" : "Request borrower"}</Button>
        </div>
      )}

      <RequirementLedger reviewState={reviewState} evidenceState={evidenceState} displayState={displayState} verified={verified} onOpenUpload={onOpenUpload} onOpenRequest={onOpenRequest} />
    </div>
  );
}

function NorthstarFindings({ verified, useLegacyState, onNavigate }: { verified: boolean; useLegacyState: boolean; onNavigate: (tab: NorthstarTab) => void }) {
  const { enabled } = useLearningMode();
  const action = <Button variant={verified ? "secondary" : "primary"} onClick={() => onNavigate(verified ? "financials" : "sources")}>{verified ? "Review financials" : "Resolve source"}</Button>;

  return (
    <section id="findings-panel" role="tabpanel" className={styles.flatSection} aria-labelledby="northstar-findings-title" {...getLearningTargetProps(enabled, "northstar-findings")}>
      <SectionHeader headingId="northstar-findings-title" title={useLegacyState ? "Findings" : "Review findings"} description="Decision-relevant conclusions appear only after their supporting evidence is verified." />
      {useLegacyState ? (
        <div className={styles.workflowState} data-complete={verified}>
          <span className={styles.workflowStateIcon}><Icon name={verified ? "checkCircle" : "lock"} size="md" /></span>
          <div>
            <h3>{verified ? "No findings require judgment" : "Findings are waiting on evidence"}</h3>
            <p>{verified ? "The verified downside case remains above the 1.20x policy floor, so Northstar has no exception requiring analyst judgment." : "The missing forecast is a verification requirement—not a finding. Findings will appear here only if the completed analysis identifies an exception requiring judgment."}</p>
          </div>
          {action}
        </div>
      ) : (
        <CreditFindingsState
          eyebrow={verified ? "Completed analysis" : "Evidence prerequisite"}
          title={verified ? "No finding requires judgment" : "Findings are waiting on verified evidence"}
          description={verified
            ? "The verified downside case remains above the 1.20x policy floor. Northstar therefore has no credit exception that requires an analyst judgment."
            : "The missing forecast remains a verification requirement—not a finding. A finding will appear only if the completed analysis identifies a decision-relevant exception."}
          icon={verified ? "checkCircle" : "fileCheck"}
          iconTone={verified ? "success" : "warning"}
          status={<StatusPill tone={verified ? "success" : "warning"}>{verified ? "0 open" : "1 requirement"}</StatusPill>}
          facts={verified
            ? [
                { label: "Downside coverage", value: "1.29x" },
                { label: "Policy floor", value: "1.20x" },
                { label: "Headroom", value: "+0.09x" },
              ]
            : [
                { label: "Open findings", value: "0" },
                { label: "Required evidence", value: "2027 forecast" },
                { label: "Analysis state", value: "Paused" },
              ]}
          action={action}
        />
      )}
    </section>
  );
}

function NorthstarFinancials({ verified, analysisReviewed, onNavigate, onCompleteAnalysisReview }: { verified: boolean; analysisReviewed: boolean; onNavigate: (tab: NorthstarTab) => void; onCompleteAnalysisReview: () => void }) {
  const { enabled } = useLearningMode();
  return (
    <section id="financials-panel" role="tabpanel" className={styles.flatSection} aria-labelledby="northstar-financials-title" {...getLearningTargetProps(enabled, "northstar-financials")}>
      <SectionHeader
        headingId="northstar-financials-title"
        title="Financials"
        description="Known performance, required downside analysis, and the policy floor share one comparison."
        actions={!verified
          ? <Button variant="secondary" size="sm" onClick={() => onNavigate("sources")}>Resolve source</Button>
          : analysisReviewed
            ? <Button variant="secondary" size="sm" onClick={() => onNavigate("recommendation")}>View recommendation</Button>
            : <Button variant="primary" size="sm" onClick={onCompleteAnalysisReview}>Complete analysis review</Button>}
      />
      {!verified && <Notice title="Downside period unavailable">The approved package ends in December 2026. The application preserves the missing period instead of estimating it.</Notice>}
      {verified && !analysisReviewed && <Notice title="Analyst sign-off required">AI recalculated the affected coverage result. Confirm the verified inputs, result, and policy comparison before preparing the recommendation.</Notice>}
      {analysisReviewed && <Notice tone="success" title="Analysis review complete">Alex Kim confirmed the updated result. The case can now be packaged as an analyst recommendation for senior review.</Notice>}
      <div className={styles.financialLedger} role="table" aria-label="Fixed-charge coverage comparison">
        <div className={styles.financialHeader} role="row"><span role="columnheader">Scenario</span><span role="columnheader">Coverage</span><span role="columnheader">Headroom</span><span role="columnheader">Status</span></div>
        <div className={styles.financialRow} role="row"><span role="cell"><strong>Current period</strong><small>Previously verified actuals</small></span><strong role="cell">1.36x</strong><span role="cell">+0.16x</span><span role="cell"><StatusPill tone="success">Verified</StatusPill></span></div>
        <div className={styles.financialRow} role="row"><span role="cell"><strong>2027 downside</strong><small>{verified ? "Approved forecast and downside assumptions" : "Requires the 2027 Operating Forecast"}</small></span><strong role="cell">{verified ? "1.29x" : "—"}</strong><span role="cell">{verified ? "+0.09x" : "—"}</span><span role="cell"><StatusPill tone={verified ? "success" : "warning"}>{verified ? "Verified" : "Blocked"}</StatusPill></span></div>
        <div className={styles.financialRow} role="row"><span role="cell"><strong>Policy floor</strong><small>Minimum fixed-charge coverage</small></span><strong role="cell">1.20x</strong><span role="cell">Threshold</span><span role="cell"><StatusPill tone="neutral">Policy</StatusPill></span></div>
      </div>
    </section>
  );
}

function NorthstarSources({ reviewState, evidenceState, displayState, verified, onOpenUpload, onOpenRequest }: Omit<NorthstarCaseSectionsProps, "activeTab" | "legacyMode" | "useLegacyFindingsState" | "onNavigate" | "onCompleteAnalysisReview" | "onSubmitRecommendation" | "onSeniorDecision" | "onReopenReturnedRecommendation">) {
  const { enabled } = useLearningMode();
  const requestSent = reviewState.request.status !== "draft" && reviewState.request.status !== "cancelled";
  const sourceCount = evidenceState.fileName ? 1 : 0;
  return (
    <section id="sources-panel" role="tabpanel" className={styles.flatSection} aria-labelledby="northstar-sources-title" {...getLearningTargetProps(enabled, "northstar-sources")}>
      <SectionHeader title="Sources" headingId="northstar-sources-title" description={`${sourceCount} of 1 required documents supplied. Intake, provenance, verification, and analysis remain separate states.`} />
      <VerificationNotice state={displayState} evidenceState={evidenceState} request={reviewState.request} />
      {!verified && (
        <div className={styles.evidenceActions} aria-label="Evidence options">
          <Button variant="primary" onClick={onOpenUpload}>{uploadActionLabel(evidenceState, reviewState.request.status)}</Button>
          <Button variant="secondary" onClick={onOpenRequest}>{requestSent ? "View borrower request" : "Request borrower"}</Button>
        </div>
      )}
      <RequirementLedger reviewState={reviewState} evidenceState={evidenceState} displayState={displayState} verified={verified} onOpenUpload={onOpenUpload} onOpenRequest={onOpenRequest} />
    </section>
  );
}

function NorthstarActivity({ reviewState }: { reviewState: NorthstarReviewState }) {
  const { enabled } = useLearningMode();
  return (
    <section id="activity-panel" role="tabpanel" className={styles.flatSection} aria-labelledby="northstar-activity-title" {...getLearningTargetProps(enabled, "northstar-activity")}>
      <SectionHeader headingId="northstar-activity-title" title="Activity" description="Request, upload, verification, analyst review, recommendation, and decision events remain separately attributable." />
      <ActivityLedger layout="timeline" items={activityForState(reviewState)} />
    </section>
  );
}

function CapacitySummary({ verified, displayState }: { verified: boolean; displayState: VerificationDisplayState }) {
  return (
    <article className={styles.capacityCard} data-ready={verified}>
      <header><span>Downside repayment analysis</span><StatusPill tone={verified ? "success" : displayState === "ready-for-review" ? "info" : "neutral"}>{verified ? "Verified" : displayState === "ready-for-review" ? "Ready for review" : "Waiting for forecast"}</StatusPill></header>
      <div className={styles.capacityMetrics}>
        <div><span>Current coverage</span><strong>1.36x</strong></div>
        <div><span>2027 downside</span><strong>{verified ? "1.29x" : "—"}</strong></div>
        <div><span>Policy floor</span><strong>1.20x</strong></div>
      </div>
      <div className={styles.coverageScale} aria-label={verified ? "Downside coverage is 1.29 times, 0.09 times above the 1.20 times policy floor" : "Downside coverage is not available until the 2027 operating forecast is verified"}>
        <span>1.0x</span><i className={styles.floor} /><i className={styles.current} /><i className={styles.downside} data-visible={verified} /><span>1.5x</span>
      </div>
      <footer>{verified ? <><span>Downside headroom</span><strong>+0.09x</strong></> : <><span>Missing forecast period</span><strong>FY 2027</strong></>}</footer>
    </article>
  );
}

function RequirementLedger({ reviewState, evidenceState, displayState, verified, onOpenUpload, onOpenRequest }: Omit<NorthstarCaseSectionsProps, "activeTab" | "legacyMode" | "useLegacyFindingsState" | "onNavigate" | "onCompleteAnalysisReview" | "onSubmitRecommendation" | "onSeniorDecision" | "onReopenReturnedRecommendation">) {
  const requestSent = reviewState.request.status !== "draft" && reviewState.request.status !== "cancelled";
  return (
    <div className={styles.requirementLedger} aria-label="Verification requirements">
      <button className={styles.requirementRow} type="button" onClick={displayState === "requested" ? onOpenRequest : onOpenUpload}>
        <IconTile><Icon name="document" size="sm" /></IconTile>
        <span><strong>2027 Operating Forecast</strong><small>Income statement, cash flow, and downside assumptions</small></span>
        <span><small>Source</small><strong>{evidenceState.provenance ? evidenceProvenanceLabel(evidenceState.provenance) : requestSent ? reviewState.request.recipient : "Not supplied"}</strong></span>
        <span><small>Status</small><strong>{requirementLabel(displayState)}</strong></span>
        <span className={styles.requirementAction} data-complete={verified}>{verified ? <Icon name="checkCircle" size="sm" /> : <Icon name="chevronRight" size="sm" />}</span>
      </button>
    </div>
  );
}

function VerificationNotice({ state, evidenceState, request }: { state: VerificationDisplayState; evidenceState: EvidenceIntakeState; request: DocumentRequestRecord }) {
  const recipientName = request.recipient.split(" · ")[0];
  if (state === "verified") return <Notice tone="success" title="Analysis updated">The verified 2027 forecast resolved the requirement. Downside coverage is 1.29x, 0.09x above the policy floor.</Notice>;
  if (state === "ready-for-review") return <Notice title="Forecast ready for analyst review">The file is matched to the requirement. Confirm its approval, reconciliation, and downside assumptions before updating analysis.</Notice>;
  if (state === "received") return <Notice title="Forecast received">{evidenceState.provenance === "analyst-upload" ? "Alex Kim uploaded the file directly." : `${recipientName} supplied the file for this request.`} Extraction has not started.</Notice>;
  if (state === "processing") return <Notice title="Extracting forecast">The file remains in processing until an explicit result is recorded.</Notice>;
  if (state === "failed") return <Notice tone="warning" title="The file could not be accepted">Choose a supported file up to 25 MB, then try again.</Notice>;
  if (state === "requested") return <Notice title={`Request sent to ${recipientName}`}>Due {request.dueDate} · Automatic reminders are on. The requirement remains open until a file is uploaded and verified.</Notice>;
  if (state === "cancelled") return <Notice tone="warning" title="Request cancelled">Create a new request or upload the forecast directly to continue.</Notice>;
  return <Notice title="2027 operating forecast required">The latest approved forecast ends in December 2026. Analysis paused rather than estimating the missing period.</Notice>;
}

function uploadActionLabel(evidenceState: EvidenceIntakeState, requestStatus: DocumentRequestStatus) {
  if (evidenceState.status === "ready-for-review") return "Review uploaded file";
  if (["received", "processing", "failed"].includes(requestStatus)) return "Continue document processing";
  return "Upload file";
}

function requirementLabel(state: VerificationDisplayState) {
  if (state === "missing") return "Missing";
  if (state === "requested") return "Awaiting response";
  if (state === "received") return "Received";
  if (state === "processing") return "Processing";
  if (state === "ready-for-review") return "Ready for review";
  if (state === "failed") return "Upload failed";
  if (state === "cancelled") return "Cancelled";
  return "Verified";
}

function activityForState(state: NorthstarReviewState): ActivityLedgerItem[] {
  const evidence = state.evidenceReviewState === "verified_by_analyst"
    ? { status: "verified", fileName: state.request.fileName, provenance: state.request.provenance } as const
    : state.request.status === "ready"
      ? { status: "ready-for-review", fileName: state.request.fileName, provenance: state.request.provenance } as const
      : null;
  const items: ActivityLedgerItem[] = [
    { id: "analysis-paused", title: "Initial analysis paused", description: "Latest approved forecast ends in Dec 2026.", meta: "Today · 9:14 AM", icon: "alertCircle", tone: "warning" },
  ];
  if (state.request.sentAt) items.unshift({ id: "request-sent", title: `Forecast request sent to ${state.request.recipient.split(" · ")[0]}`, description: `Due ${state.request.dueDate} · Automatic reminders enabled.`, meta: "Just now", icon: "send", tone: "human" });
  if (state.request.fileName && state.request.provenance) items.unshift({ id: "forecast-received", title: `${state.request.fileName} uploaded`, description: `${evidenceProvenanceLabel(state.request.provenance)} · Matched to the open requirement.`, meta: "Just now", icon: "document", tone: "evidence" });
  if (state.request.status === "received") items.unshift({ id: "forecast-received-state", title: "Document received for the open request", description: `${state.request.suppliedBy} · Extraction not started.`, meta: "Just now", icon: "document", tone: "evidence" });
  if (state.request.status === "processing") items.unshift({ id: "forecast-processing", title: "Forecast extraction started", description: "The request remains in processing until a result is recorded.", meta: "Just now", icon: "refresh", tone: "info" });
  if (evidence?.status === "ready-for-review") items.unshift({ id: "forecast-ready", title: "Forecast ready for analyst review", description: "Extraction is complete; verification is still open.", meta: "Just now", icon: "fileCheck", tone: "info" });
  if (state.request.status === "failed") items.unshift({ id: "forecast-failed", title: "Forecast processing failed", description: state.request.error ?? "The document could not be processed.", meta: "Just now", icon: "alertCircle", tone: "danger" });
  if (evidence?.status === "verified") items.unshift({ id: "analysis-update", title: "Alex verified the forecast and updated downside analysis", description: "Fixed-charge coverage verified at 1.29x.", meta: "Just now", icon: "checkCircle", tone: "success" });
  if (state.analysisReviewState === "completed") items.unshift({ id: "analysis-reviewed", title: "Alex Kim completed the updated analysis review", description: "Verified the 1.29x downside result against the 1.20x policy floor.", meta: "Just now", icon: "user", tone: "human" });
  for (const recommendation of state.recommendationHistory ?? (state.recommendation ? [state.recommendation] : [])) items.unshift({ id: `recommendation-submitted-${recommendation.createdAt}`, title: "Alex Kim submitted a recommendation for senior review", description: `${recommendation.decision} · ${recommendation.amount}`, meta: "Just now", icon: "send", tone: "human", details: recommendation.rationale });
  for (const decision of state.decisionHistory ?? (state.seniorDecision ? [state.seniorDecision] : [])) items.unshift({ id: `senior-decision-${decision.createdAt}`, title: `Morgan Lee recorded a senior credit decision`, description: `${seniorDecisionLabel(decision.decision)}${decision.rationale ? ` · ${decision.rationale}` : ""}`, meta: "Just now", icon: decision.decision === "decline" ? "alertCircle" : "checkCircle", tone: decision.decision === "decline" ? "danger" : decision.decision === "return_to_analyst" ? "warning" : "success", details: decision.rationale || "Decision recorded from the reviewed case record." });
  return items;
}
