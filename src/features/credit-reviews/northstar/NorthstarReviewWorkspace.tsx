import { useEffect, useRef, useState } from "react";
import { useRouter, type AppPath } from "../../../app/router";
import { getDesignOption } from "../../design-tools/designOptions";
import { Button } from "../../../shared/ui/Button/Button";
import { CaseStatusPill, type CaseStatus } from "../../../shared/ui/CaseStatusPill/CaseStatusPill";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { DesignVariantNotice } from "../../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { FileDropzone } from "../../../shared/ui/FileDropzone/FileDropzone";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { ObjectHeader } from "../../../shared/ui/ObjectHeader/ObjectHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { Tabs } from "../../../shared/ui/Tabs/Tabs";
import { Toast } from "../../../shared/ui/Toast/Toast";
import { WorkflowSteps } from "../../../shared/ui/WorkflowSteps/WorkflowSteps";
import { companyLogoDomains } from "../companyLogos";
import { BorrowerContactSelector } from "../borrower-requests/BorrowerContactSelector";
import { contactLabel, northstarBorrowerContacts } from "../borrower-requests/borrowerContacts";
import { ReviewBookmarkButton } from "../bookmarks/ReviewBookmarkButton";
import { LearningModeSurface, LearningTarget } from "../learning/MeridianLearningMode";
import type { PlatformLearningScope } from "../learning/meridianLearningContent";
import { ReviewWorkspaceHeader } from "../workspace-header/ReviewWorkspaceHeader";
import {
  evidenceProvenanceLabel,
  evidenceRequirements,
  type EvidenceIntakeState,
  type EvidenceProvenance,
} from "../workflow/evidenceWorkflow";
import {
  createInitialNorthstarState,
  createNorthstarPreset,
  northstarReviewReducer,
  seniorDecisionLabel,
  type AnalystRecommendationRecord,
  type DemoPresetId,
  type DocumentRequestRecord,
  type DocumentRequestStatus,
  type NorthstarReviewState,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import { NORTHSTAR_STORAGE_KEY, usePersistentReviewState } from "../workflow/usePersistentReviewState";
import {
  NorthstarCaseSections,
  type NorthstarTab,
  type VerificationDisplayState,
} from "./NorthstarCaseSections";
import styles from "./NorthstarReviewWorkspace.module.css";

type RequestStage = "document" | "recipient" | "review";
type EvidenceStage = "evidence" | "received" | "processing" | "review" | "failed" | "result";

const forecastRequirement = evidenceRequirements["northstar-operating-forecast"];
const northstarTabPaths: Record<NorthstarTab, AppPath> = {
  overview: "/credit-reviews/northstar-health",
  findings: "/credit-reviews/northstar-health/findings",
  financials: "/credit-reviews/northstar-health/financials",
  sources: "/credit-reviews/northstar-health/sources",
  activity: "/credit-reviews/northstar-health/activity",
  recommendation: "/credit-reviews/northstar-health/recommendation",
};

function getActiveTab(pathname: AppPath): NorthstarTab {
  if (pathname.endsWith("/findings")) return "findings";
  if (pathname.endsWith("/financials")) return "financials";
  if (pathname.endsWith("/sources")) return "sources";
  if (pathname.endsWith("/activity")) return "activity";
  if (pathname.endsWith("/recommendation")) return "recommendation";
  return "overview";
}

function getNorthstarLearningScope(activeTab: NorthstarTab): PlatformLearningScope {
  return `northstar-${activeTab}` as PlatformLearningScope;
}

export function NorthstarReviewWorkspace() {
  const { pathname, search, navigate } = useRouter();
  const [reviewState, dispatchReview] = usePersistentReviewState(northstarReviewReducer, createInitialNorthstarState(), NORTHSTAR_STORAGE_KEY);
  const evidenceState = evidenceStateFromReview(reviewState);
  const [requestOpen, setRequestOpen] = useState(false);
  const [uploadFlowOpen, setUploadFlowOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const searchParams = new URLSearchParams(search);
  const requestedDesignOption = getDesignOption(searchParams.get("design"));
  const designOption = requestedDesignOption?.area === "case-workspace" ? requestedDesignOption : undefined;
  const legacyMode = designOption?.renderKey === "compact-blocker";
  const useLegacyFindingsState = designOption?.renderKey === "stateful-review";
  const activeTab = getActiveTab(pathname);
  const displayState = getDisplayState(reviewState);
  const verified = reviewState.evidenceReviewState === "verified_by_analyst";
  const requestSent = reviewState.request.status !== "draft" && reviewState.request.status !== "cancelled";
  const requestedPreset = searchParams.get("preset") as DemoPresetId | null;

  useEffect(() => {
    if (!requestedPreset || !["northstar-request-sent", "northstar-document-received", "northstar-analysis-updated", "northstar-senior-review"].includes(requestedPreset)) return;
    if (requestedPreset === "northstar-document-received" && reviewState.request.status === "sent") {
      dispatchReview({ type: "preview_received_response", at: "2026-08-01T14:42:00.000Z" });
    } else {
      dispatchReview({ type: "replace_state", state: createNorthstarPreset(requestedPreset) });
    }
    navigate(pathname, { replace: true });
  }, [dispatchReview, navigate, pathname, requestedPreset, reviewState.request.status]);

  useEffect(() => {
    const status = reviewState.request.status;
    if (status !== "received" && status !== "processing") return;
    const timeout = window.setTimeout(() => {
      dispatchReview({ type: status === "received" ? "start_processing" : "processing_succeeded" });
    }, status === "received" ? 240 : 1400);
    return () => window.clearTimeout(timeout);
  }, [dispatchReview, reviewState.request.status]);

  function sendRequest(request: { recipient: string; dueDate: string; message: string }) {
    setRequestOpen(false);
    dispatchReview({ type: "send_request", at: new Date().toISOString(), ...request });
    setToast({ title: "Request sent", message: `${request.recipient} will receive reminders until ${request.dueDate}.` });
  }

  function receiveFile(file: File, provenance: Exclude<EvidenceProvenance, "existing-source">) {
    dispatchReview({ type: "receive_document", fileName: forecastRequirement.fixtureFileName, provenance, suppliedBy: provenance === "borrower-upload" ? reviewState.request.recipient : "Alex Kim · Credit analyst", at: new Date().toISOString() });
    setRequestOpen(false);
    setUploadFlowOpen(true);
    setToast({ title: "Document received", message: `${file.name} satisfies the open request. Extraction and verification remain separate steps.` });
  }

  function rejectFile(message: string) {
    dispatchReview({ type: "processing_failed", message });
    setToast({ title: "File not accepted", message });
  }

  function resetFile() {
    dispatchReview({ type: "replace_document" });
  }

  function verifyForecast() {
    dispatchReview({ type: "verify_evidence" });
    setToast({ title: "Analysis updated", message: "Downside fixed-charge coverage is verified at 1.29x." });
  }

  function completeAnalysisReview() {
    dispatchReview({ type: "complete_analysis_review", at: new Date().toISOString() });
    setToast({ title: "Analysis review complete", message: "Your sign-off is recorded. Northstar is ready for an analyst recommendation." });
    navigateToTab("recommendation");
  }

  function submitRecommendation(record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) {
    dispatchReview({ type: "submit_recommendation", record: { ...record, author: "Alex Kim", createdAt: new Date().toISOString() } });
    setToast({ title: "Recommendation submitted", message: "The case is now awaiting Morgan Lee’s senior credit decision." });
  }

  function recordSeniorDecision(record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) {
    dispatchReview({ type: "record_senior_decision", record: { ...record, decisionMaker: "Morgan Lee", createdAt: new Date().toISOString() } });
    setToast({ title: "Decision recorded", message: `${seniorDecisionLabel(record.decision)}. The outcome and attribution are now preserved in Activity.` });
  }

  function reopenReturnedRecommendation() {
    dispatchReview({ type: "reopen_returned_recommendation" });
    setToast({ title: "Recommendation reopened", message: "Morgan Lee’s return rationale remains in Activity. Revise and resubmit the analyst recommendation when ready." });
  }

  function navigateToTab(tab: NorthstarTab) {
    const optionSearch = designOption && designOption.status !== "current" ? `?design=${designOption.id}` : undefined;
    navigate(northstarTabPaths[tab], optionSearch ? { search: optionSearch } : undefined);
  }

  const headerCaseStatus: CaseStatus = reviewState.seniorDecision
    ? reviewState.seniorDecision.decision === "return_to_analyst" ? "revision-requested" : reviewState.seniorDecision.decision === "decline" ? "declined" : "approved"
    : reviewState.recommendation
      ? "awaiting-decision"
      : reviewState.analysisReviewState === "completed"
        ? "ready-to-recommend"
        : verified
          ? "analyst-review"
          : "needs-verification";
  const headerStatus = <CaseStatusPill status={headerCaseStatus} />;
  const activityAction = activeTab !== "activity" || verified
    ? undefined
    : reviewState.request.status === "sent"
      ? <Button variant="secondary" onClick={() => setRequestOpen(true)}>View request</Button>
      : reviewState.request.status === "ready"
        ? <Button variant="primary" onClick={() => setUploadFlowOpen(true)}>Review forecast</Button>
        : reviewState.request.status === "received"
          ? <Button variant="primary" onClick={() => setUploadFlowOpen(true)}>Process forecast</Button>
          : reviewState.request.status === "processing"
            ? <Button variant="secondary" onClick={() => setUploadFlowOpen(true)}>View processing</Button>
            : reviewState.request.status === "failed"
              ? <Button variant="primary" onClick={() => setUploadFlowOpen(true)}>Resolve forecast</Button>
              : <Button variant="primary" onClick={() => setUploadFlowOpen(true)}>Upload forecast</Button>;
  const headerAction = legacyMode
    ? activityAction
    : activeTab === "activity"
      ? activityAction
      : activeTab === "sources" || (activeTab === "findings" && !useLegacyFindingsState)
        ? undefined
        : activeTab === "recommendation"
          ? undefined
          : reviewState.recommendation || reviewState.analysisReviewState === "completed"
            ? <Button variant="primary" onClick={() => navigateToTab("recommendation")}>{reviewState.recommendation ? "Review recommendation" : "Prepare recommendation"}</Button>
            : verified
              ? <Button variant="primary" onClick={() => navigateToTab("financials")}>Review updated analysis</Button>
              : <Button variant="primary" onClick={() => navigateToTab("sources")}>Resolve missing evidence</Button>;
  const tabItems = legacyMode
    ? [{ id: "overview" as const, label: "Overview" }, { id: "activity" as const, label: "Activity" }]
    : [
        { id: "overview" as const, label: "Overview" },
        { id: "findings" as const, label: "Findings", count: 0 },
        { id: "financials" as const, label: "Financials" },
        { id: "sources" as const, label: "Sources", count: evidenceState.fileName ? 1 : 0 },
        { id: "activity" as const, label: "Activity" },
        { id: "recommendation" as const, label: "Recommendation" },
      ];

  return (
    <LearningModeSurface scope={getNorthstarLearningScope(activeTab)}>
    <div className={styles.page}>
      <ReviewWorkspaceHeader>
        <LearningTarget topicId="case-header">
        <ObjectHeader
          backLabel="Credit reviews"
          onBack={() => navigate("/credit-reviews")}
          logo={<CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" size="lg" />}
          title="Northstar Health"
          metadata={["$15M revolving line", "3-year facility", "Alex Kim", "Due tomorrow"]}
          status={headerStatus}
          utilityAction={<ReviewBookmarkButton slug="northstar-health" company="Northstar Health" />}
          action={headerAction}
        />
        </LearningTarget>

        <LearningTarget topicId="review-navigation"><Tabs<NorthstarTab>
          ariaLabel="Northstar Health review sections"
          value={activeTab}
          onChange={navigateToTab}
          items={tabItems}
        /></LearningTarget>
      </ReviewWorkspaceHeader>

      {designOption?.status !== "current" && designOption && (
        <DesignVariantNotice
          area={designOption.areaLabel}
          variant={`${designOption.version} — ${designOption.name}`}
          onReturn={() => navigate(pathname, { replace: true })}
        />
      )}

      <NorthstarCaseSections
        activeTab={activeTab}
        legacyMode={legacyMode}
        useLegacyFindingsState={useLegacyFindingsState}
        reviewState={reviewState}
        evidenceState={evidenceState}
        displayState={displayState}
        verified={verified}
        onNavigate={navigateToTab}
        onOpenUpload={() => setUploadFlowOpen(true)}
        onOpenRequest={() => setRequestOpen(true)}
        onCompleteAnalysisReview={completeAnalysisReview}
        onSubmitRecommendation={submitRecommendation}
        onSeniorDecision={recordSeniorDecision}
        onReopenReturnedRecommendation={reopenReturnedRecommendation}
        onOpenSeniorReview={() => navigate("/credit-reviews/northstar-health/senior-decision/review")}
      />

      {requestOpen && <LearningTarget topicId="northstar-sources">
        {requestSent
          ? <RequestStatusFlow request={reviewState.request} evidenceState={evidenceState} onClose={() => setRequestOpen(false)} onReviewReceived={() => { setRequestOpen(false); setUploadFlowOpen(true); }} onBorrowerUpload={(file) => receiveFile(file, "borrower-upload")} onReject={rejectFile} onReset={resetFile} />
          : <DocumentRequestFlow evidenceState={evidenceState} onClose={() => setRequestOpen(false)} onSend={sendRequest} onBorrowerUpload={(file) => receiveFile(file, "borrower-upload")} onReject={rejectFile} onReset={resetFile} />}
      </LearningTarget>}
      {uploadFlowOpen && <LearningTarget topicId="northstar-sources"><NorthstarEvidenceFlow evidenceState={evidenceState} request={reviewState.request} onClose={() => setUploadFlowOpen(false)} onReviewAnalysis={() => { setUploadFlowOpen(false); navigateToTab("financials"); }} onUpload={(file) => receiveFile(file, "analyst-upload")} onReject={rejectFile} onReset={resetFile} onVerify={verifyForecast} /></LearningTarget>}
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
    </LearningModeSurface>
  );
}

function evidenceStateFromReview(state: NorthstarReviewState): EvidenceIntakeState {
  if (state.evidenceReviewState === "verified_by_analyst") return { status: "verified", fileName: state.request.fileName, provenance: state.request.provenance };
  if (state.request.status === "ready") return { status: "ready-for-review", fileName: state.request.fileName, provenance: state.request.provenance };
  if (state.request.status === "received" || state.request.status === "processing") return { status: "uploading", fileName: state.request.fileName, provenance: state.request.provenance };
  if (state.request.status === "failed") return { status: "failed", fileName: state.request.fileName, provenance: state.request.provenance, error: state.request.error };
  return { status: "idle" };
}

function getDisplayState(state: NorthstarReviewState): VerificationDisplayState {
  if (state.evidenceReviewState === "verified_by_analyst") return "verified";
  if (state.request.status === "ready") return "ready-for-review";
  if (state.request.status === "received") return "received";
  if (state.request.status === "processing") return "processing";
  if (state.request.status === "failed") return "failed";
  if (state.request.status === "cancelled") return "cancelled";
  return state.request.status === "sent" ? "requested" : "missing";
}

function requestStatusLabel(status: DocumentRequestStatus) {
  if (status === "draft") return "Information required";
  if (status === "sent") return "Request sent";
  if (status === "received") return "Document received";
  if (status === "processing") return "Extraction processing";
  if (status === "ready") return "Ready for verification";
  if (status === "failed") return "Processing failed";
  return "Request cancelled";
}

function contactName(label?: string) {
  return label?.split(" · ")[0] ?? "Northstar Health";
}

function requestSourceLabel(request: DocumentRequestRecord) {
  const supplier = contactName(request.suppliedBy ?? request.recipient);
  return request.provenance === "borrower-upload"
    ? `${supplier} · Secure portal`
    : `${supplier} · Analyst upload`;
}

function requestSourceSentence(request: DocumentRequestRecord) {
  const supplier = contactName(request.suppliedBy ?? request.recipient);
  return request.provenance === "borrower-upload"
    ? `Received from ${supplier} via secure document portal.`
    : `Uploaded by ${supplier}.`;
}

function formatReceivedAt(value?: string) {
  if (!value) return "Not recorded";
  const received = new Date(value);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(received);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(received);
  return `${date} at ${time}`;
}

function NorthstarEvidenceFlow({ evidenceState, request, onClose, onReviewAnalysis, onUpload, onReject, onReset, onVerify }: {
  evidenceState: EvidenceIntakeState;
  request: DocumentRequestRecord;
  onClose: () => void;
  onReviewAnalysis: () => void;
  onUpload: (file: File) => void;
  onReject: (message: string) => void;
  onReset: () => void;
  onVerify: () => void;
}) {
  const requestStatus = request.status;
  const requestError = request.error;
  const [stage, setStage] = useState<EvidenceStage>(() => stageForRequest(requestStatus, evidenceState));
  const closeRef = useRef<HTMLButtonElement>(null);
  const stages = [{ id: "evidence", label: "Evidence" }, { id: "processing", label: "Extraction" }, { id: "review", label: "Review" }, { id: "result", label: "Result" }] as const;
  const visualStage = stage === "received" || stage === "failed" ? "processing" : stage;
  const dropzoneStatus = evidenceState.status === "requested" ? "idle" : evidenceState.status;

  useDialogBehavior(closeRef, onClose);
  useEffect(() => setStage(stageForRequest(requestStatus, evidenceState)), [evidenceState.status, requestStatus]);

  return (
    <section className={styles.requestOverlay} role="dialog" aria-modal="true" aria-labelledby="northstar-evidence-title">
      <FocusedHeader closeRef={closeRef} subtitle="Forecast verification" onClose={onClose} />
      <div className={styles.requestLayout}>
        <section className={styles.requestEditor}>
          <div className={styles.requestEditorInner}>
            <WorkflowSteps ariaLabel="Forecast verification steps" items={[...stages]} value={visualStage} className={styles.requestSteps} />
            <main className={styles.requestContent}>
              {stage === "evidence" && <><div className={styles.requestTitle}><span>Evidence</span><h1 id="northstar-evidence-title">Upload the missing forecast</h1><p>Add Northstar’s board-approved 2027 forecast.</p></div><Notice title="Why it is needed">The approved package ends in Dec 2026, so FY 2027 downside capacity is still unknown.</Notice><FileDropzone status={dropzoneStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={forecastRequirement.acceptedFormats} onFileAccepted={onUpload} onFileRejected={onReject} onRemove={onReset} /></>}
              {stage === "received" && <><div className={styles.requestTitle}><span>Received</span><h1 id="northstar-evidence-title">Forecast received</h1><p>{requestSourceSentence(request)} Extraction will begin automatically.</p></div><Notice title="Matched to the open request">{evidenceState.fileName} · Received {formatReceivedAt(request.receivedAt)}</Notice></>}
              {stage === "processing" && <div className={styles.processing}><span className={styles.processingRing} /><h1 id="northstar-evidence-title">Extracting the forecast</h1><p>Checking the file and preparing the downside figures.</p></div>}
              {stage === "failed" && <><div className={styles.requestTitle}><span>File issue</span><h1 id="northstar-evidence-title">We couldn’t read this forecast</h1><p>{requestError ?? "Use the board-approved XLSX or a text-based PDF."}</p></div></>}
              {stage === "review" && <><div className={styles.requestTitle}><span>Review</span><h1 id="northstar-evidence-title">Verify before use</h1><p>Compare the extracted values with the original forecast.</p></div><Notice title="Update scope">Only the 2027 downside capacity analysis will be updated.</Notice><dl className={styles.requestReview}><div><dt>Evidence</dt><dd>{evidenceState.fileName}</dd></div><div><dt>Supplied by</dt><dd>{requestSourceLabel(request)}</dd></div><div><dt>Received</dt><dd>{formatReceivedAt(request.receivedAt)}</dd></div><div><dt>Extraction</dt><dd>Ready</dd></div><div><dt>Evidence review</dt><dd>Needs analyst verification</dd></div><div><dt>2027 downside coverage</dt><dd>1.29x</dd></div></dl><section className={styles.verificationChecklist}><header>Verification checks</header>{forecastRequirement.verificationChecks.map((check) => <span key={check}><Icon name="check" size="xs" />{check}</span>)}</section></>}
              {stage === "result" && <><div className={styles.requestTitle}><span>Result</span><h1 id="northstar-evidence-title">Downside capacity verified</h1><p>The approved forecast completes the missing 2027 analysis.</p></div><section className={styles.analysisResult} aria-label="Updated downside analysis"><header><span>Updated analysis</span><StatusPill tone="success">Analysis ready</StatusPill></header><dl><div><dt>Current coverage</dt><dd>1.36x</dd></div><div><dt>2027 downside coverage</dt><dd>1.29x</dd></div><div><dt>Bank minimum</dt><dd>1.20x</dd></div><div><dt>Remaining cushion</dt><dd>0.09x</dd></div></dl><p>Downside coverage remains above the bank minimum, with limited remaining cushion.</p></section></>}
            </main>
          </div>
        </section>
        <ForecastDocumentPreview state={evidenceState.status} request={request} />
      </div>
      <footer className={styles.requestFooter}><div className={styles.requestFooterGrid}><div className={styles.requestFooterActions}>
        {stage === "evidence" && <Button variant="secondary" onClick={onClose}>Cancel</Button>}
        {stage !== "evidence" && stage !== "result" && <Button variant="secondary" onClick={onClose}>Close</Button>}
        {stage === "failed" && <Button variant="primary" onClick={onReset}>Choose another file</Button>}
        {stage === "review" && <Button variant="primary" icon={<Icon name="fileCheck" size="xs" />} iconPosition="start" onClick={onVerify}>Verify &amp; update analysis</Button>}
        {stage === "result" && <><Button variant="secondary" onClick={onClose}>Close</Button><Button variant="primary" onClick={onReviewAnalysis}>Review updated analysis</Button></>}
      </div></div></footer>
    </section>
  );
}

function stageForRequest(status: DocumentRequestStatus, evidence: EvidenceIntakeState): EvidenceStage {
  if (evidence.status === "verified") return "result";
  if (status === "ready") return "review";
  if (status === "processing") return "processing";
  if (status === "received") return "received";
  if (status === "failed") return "failed";
  return "evidence";
}

function DocumentRequestFlow({ evidenceState, onClose, onSend, onBorrowerUpload, onReject, onReset }: {
  evidenceState: EvidenceIntakeState;
  onClose: () => void;
  onSend: (request: { recipient: string; dueDate: string; message: string }) => void;
  onBorrowerUpload: (file: File) => void;
  onReject: (message: string) => void;
  onReset: () => void;
}) {
  const [stage, setStage] = useState<RequestStage>("document");
  const [dueDate, setDueDate] = useState("Aug 2, 2026");
  const [message, setMessage] = useState("Hi Marcus — please upload Northstar's approved 2027 operating forecast, including income statement, cash flow, and downside assumptions.");
  const [selectedContactId, setSelectedContactId] = useState(northstarBorrowerContacts.find((contact) => contact.id === "marcus-reed")?.id ?? northstarBorrowerContacts[0].id);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageOrder: Array<{ id: RequestStage; label: string }> = [{ id: "document", label: "Document" }, { id: "recipient", label: "Recipient" }, { id: "review", label: "Review" }];
  const selectedContact = northstarBorrowerContacts.find((contact) => contact.id === selectedContactId) ?? northstarBorrowerContacts[0];
  useDialogBehavior(closeRef, onClose);

  function selectContact(id: string) {
    const nextContact = northstarBorrowerContacts.find((contact) => contact.id === id);
    if (!nextContact) return;
    const currentDefault = `Hi ${selectedContact.name.split(" ")[0]} — please upload Northstar's approved 2027 operating forecast, including income statement, cash flow, and downside assumptions.`;
    const nextDefault = `Hi ${nextContact.name.split(" ")[0]} — please upload Northstar's approved 2027 operating forecast, including income statement, cash flow, and downside assumptions.`;
    setMessage((current) => current === currentDefault ? nextDefault : current);
    setSelectedContactId(id);
  }

  return (
    <section className={styles.requestOverlay} role="dialog" aria-modal="true" aria-labelledby="document-request-title">
      <FocusedHeader closeRef={closeRef} subtitle="Evidence request" onClose={onClose} />
      <div className={styles.requestLayout}>
        <section className={styles.requestEditor}><div className={styles.requestEditorInner}>
          <WorkflowSteps ariaLabel="Document request steps" items={stageOrder} value={stage} className={styles.requestSteps} />
          <main className={styles.requestContent}>
            {stage === "document" && <><div className={styles.requestTitle}><span>Document</span><h1 id="document-request-title">What do you need from the borrower?</h1><p>The request stays linked to the verification requirement that created it.</p></div><Notice title="Why this is required">The current source package ends in December 2026, leaving downside analysis incomplete.</Notice><section className={styles.requestDocument}><header>Requested document</header><div><IconTile><Icon name="document" size="sm" /></IconTile><span><strong>2027 Operating Forecast</strong><small>Income statement, cash flow, and downside assumptions</small></span><Icon name="checkCircle" size="sm" /></div></section><label className={styles.requestField}><span>Due date</span><input value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></>}
            {stage === "recipient" && <><div className={styles.requestTitle}><span>Recipient</span><h1 id="document-request-title">Who should receive this request?</h1><p>Select a Northstar Health contact. Borrower-facing details stay concise; internal analysis context is not shared.</p></div><BorrowerContactSelector contacts={northstarBorrowerContacts} selectedId={selectedContactId} onSelect={selectContact} name="northstar-evidence-recipient" /><label className={styles.requestField}><span>Message <small>Optional</small></span><textarea value={message} onChange={(event) => setMessage(event.target.value)} /></label><label className={styles.reminderToggle}><input type="checkbox" defaultChecked /><span><strong>Send automatic reminders</strong><small>Three days before and on the due date</small></span></label></>}
            {stage === "review" && <><div className={styles.requestTitle}><span>Review</span><h1 id="document-request-title">Review and send</h1><p>Confirm the document, recipient, due date, and borrower-facing message.</p></div><Notice title="Tracked from request to analysis">Receipt will match the forecast to this requirement. It will not verify or complete analysis automatically.</Notice><dl className={styles.requestReview}><div><dt>Document</dt><dd>2027 Operating Forecast</dd></div><div><dt>Recipient</dt><dd>{contactLabel(selectedContact)}</dd></div><div><dt>Email</dt><dd>{selectedContact.email}</dd></div><div><dt>Due</dt><dd>{dueDate}</dd></div><div><dt>Message</dt><dd>{message || "No message added"}</dd></div></dl></>}
          </main>
        </div></section>
        <BorrowerRequestPreview evidenceState={evidenceState} dueDate={dueDate} message={message} onUpload={onBorrowerUpload} onReject={onReject} onReset={onReset} />
      </div>
      <footer className={styles.requestFooter}><div className={styles.requestFooterGrid}><div className={styles.requestFooterActions}>{stage === "document" ? <Button variant="secondary" onClick={onClose}>Cancel</Button> : <Button variant="secondary" onClick={() => setStage(stage === "review" ? "recipient" : "document")}>Back</Button>}{stage === "document" && <Button variant="primary" disabled={!dueDate.trim()} onClick={() => setStage("recipient")}>Continue</Button>}{stage === "recipient" && <Button variant="primary" onClick={() => setStage("review")}>Review request</Button>}{stage === "review" && <Button variant="primary" onClick={() => onSend({ recipient: contactLabel(selectedContact), dueDate, message: message.trim() })}>Send request</Button>}</div></div></footer>
    </section>
  );
}

function RequestStatusFlow({ request, evidenceState, onClose, onReviewReceived, onBorrowerUpload, onReject, onReset }: {
  request: DocumentRequestRecord;
  evidenceState: EvidenceIntakeState;
  onClose: () => void;
  onReviewReceived: () => void;
  onBorrowerUpload: (file: File) => void;
  onReject: (message: string) => void;
  onReset: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const recipientName = contactName(request.recipient);
  const hasReceivedDocument = ["received", "processing", "ready", "failed"].includes(request.status);
  useDialogBehavior(closeRef, onClose);

  const statusContent = request.status === "sent"
    ? <><div className={styles.requestTitle}><span>Request status</span><h1 id="request-status-title">Document requested — 2027 Operating Forecast</h1><p>The request is with {recipientName}. Delivery, reminders, and the open requirement remain connected here.</p></div><StatusPill tone="warning">Awaiting response</StatusPill><dl className={styles.requestReview}><div><dt>Document</dt><dd>2027 Operating Forecast</dd></div><div><dt>Recipient</dt><dd>{request.recipient}</dd></div><div><dt>Due</dt><dd>{request.dueDate}</dd></div><div><dt>Linked analysis</dt><dd>Downside repayment capacity</dd></div></dl><Notice title="Automatic follow-up is active">{recipientName} will receive reminders three days before and on the due date. The request remains open until a file is uploaded.</Notice></>
    : request.status === "ready"
      ? <><div className={styles.requestTitle}><span>Request status</span><h1 id="request-status-title">Forecast received</h1><p>{requestSourceSentence(request)} The file is matched to the open requirement and ready for review.</p></div><StatusPill tone="info">Awaiting analyst verification</StatusPill><dl className={styles.requestReview}><div><dt>Document</dt><dd>{request.fileName ?? "2027 Operating Forecast.xlsx"}</dd></div><div><dt>Received from</dt><dd>{requestSourceLabel(request)}</dd></div><div><dt>Received</dt><dd>{formatReceivedAt(request.receivedAt)}</dd></div><div><dt>Extraction</dt><dd>Ready</dd></div><div><dt>Linked analysis</dt><dd>Downside repayment capacity</dd></div></dl><Notice title="Receipt does not make evidence trusted">Compare the extracted values with the original forecast before the analysis can use them.</Notice></>
      : request.status === "failed"
        ? <><div className={styles.requestTitle}><span>Request status</span><h1 id="request-status-title">Forecast needs attention</h1><p>The received file remains linked to the request, but extraction could not be completed.</p></div><StatusPill tone="warning">Extraction failed</StatusPill><dl className={styles.requestReview}><div><dt>Document</dt><dd>{request.fileName ?? "2027 Operating Forecast.xlsx"}</dd></div><div><dt>Received from</dt><dd>{requestSourceLabel(request)}</dd></div><div><dt>Received</dt><dd>{formatReceivedAt(request.receivedAt)}</dd></div></dl><Notice tone="warning" title="Review the file issue">{request.error ?? "Open the document workflow to replace the file or retry processing."}</Notice></>
        : <><div className={styles.requestTitle}><span>Request status</span><h1 id="request-status-title">Forecast received</h1><p>{requestSourceSentence(request)} The system matched it to the open requirement.</p></div><StatusPill tone="info">{request.status === "processing" ? "Extracting forecast" : "Preparing extraction"}</StatusPill><dl className={styles.requestReview}><div><dt>Document</dt><dd>{request.fileName ?? "2027 Operating Forecast.xlsx"}</dd></div><div><dt>Received from</dt><dd>{requestSourceLabel(request)}</dd></div><div><dt>Received</dt><dd>{formatReceivedAt(request.receivedAt)}</dd></div><div><dt>Linked analysis</dt><dd>Downside repayment capacity</dd></div></dl><Notice title="Processing automatically">The system is checking the workbook and preparing the relevant downside values for analyst verification.</Notice></>;

  return (
    <section className={styles.requestOverlay} role="dialog" aria-modal="true" aria-labelledby="request-status-title">
      <FocusedHeader closeRef={closeRef} subtitle="Evidence request" onClose={onClose} />
      <div className={styles.requestLayout}>
        <section className={styles.requestEditor}><main className={styles.statusContent}>{statusContent}</main></section>
        {hasReceivedDocument
          ? <ForecastDocumentPreview state={evidenceState.status} request={request} />
          : <BorrowerRequestPreview evidenceState={evidenceState} dueDate={request.dueDate} message={request.message ?? ""} onUpload={onBorrowerUpload} onReject={onReject} onReset={onReset} />}
      </div>
      <footer className={styles.requestFooter}><div className={styles.statusFooterGrid}><Button variant="secondary" onClick={onClose}>{hasReceivedDocument ? "Close" : "Done"}</Button>{hasReceivedDocument && <Button variant="primary" onClick={onReviewReceived}>{request.status === "ready" ? "Review received forecast" : request.status === "failed" ? "Resolve file issue" : "View processing"}</Button>}</div></footer>
    </section>
  );
}

function FocusedHeader({ closeRef, subtitle, onClose }: { closeRef: React.RefObject<HTMLButtonElement | null>; subtitle: string; onClose: () => void }) {
  return <header className={styles.requestHeader}><div><CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" /><span><strong>Northstar Health</strong><small>{subtitle}</small></span></div><button ref={closeRef} type="button" aria-label={`Close ${subtitle.toLowerCase()}`} onClick={onClose}><Icon name="close" size="md" /></button></header>;
}

function useDialogBehavior(closeRef: React.RefObject<HTMLButtonElement | null>, onClose: () => void, locked = false) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !locked) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = closeRef.current?.closest<HTMLElement>('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => {
        if (!document.querySelector('[role="dialog"][aria-modal="true"]')) {
          const focusTarget = returnFocus?.isConnected
            ? returnFocus
            : document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
          focusTarget?.focus({ preventScroll: true });
        }
      });
    };
  }, [closeRef, locked]);
}

function ForecastDocumentPreview({ state, request }: { state: EvidenceIntakeState["status"]; request: DocumentRequestRecord }) {
  const receivedSource = request.provenance === "borrower-upload"
    ? `Received from ${contactName(request.suppliedBy ?? request.recipient)} via secure document portal`
    : `Uploaded by ${contactName(request.suppliedBy ?? request.recipient)}`;
  const previewState = state === "verified" ? "Verified" : state === "ready-for-review" ? "Extraction ready" : state === "uploading" ? "Processing" : state === "failed" ? "Needs attention" : "Expected source";
  return (
    <aside className={styles.requestPreview} aria-label="Forecast preview">
      <header className={styles.previewToolbar}><span>{request.fileName ?? "Evidence preview"}</span><span><i aria-hidden="true" /> {previewState}</span></header>
      <div className={styles.previewStage}><article className={`${styles.previewPaper} ${styles.forecastPaper}`}><header className={styles.previewBrand}><CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" /><span><strong>Northstar Health</strong><small>Board-approved operating plan</small></span></header><div className={styles.previewBody}><span className={styles.previewEyebrow}>Planning &amp; finance</span><h2>2027 Operating Forecast</h2><p>Approved July 18, 2026 · USD millions</p><table className={styles.forecastTable}><thead><tr><th>Operating case</th><th>2026A</th><th>2027 base</th><th>2027 downside</th></tr></thead><tbody><tr><th>Net revenue</th><td>$214.8</td><td>$231.6</td><td>$218.2</td></tr><tr><th>EBITDA</th><td>$28.1</td><td>$31.4</td><td>$27.6</td></tr><tr><th>Cash flow</th><td>$20.6</td><td>$23.2</td><td>$18.9</td></tr><tr><th>Fixed-charge coverage</th><td>1.36x</td><td>1.44x</td><td>1.29x</td></tr></tbody></table><section className={styles.forecastAssumptions}><span>Downside assumptions</span><p>6% volume reduction, 90 bps reimbursement compression, and delayed working-capital normalization.</p></section></div><footer className={styles.previewSecurity}><Icon name="fileCheck" size="xs" /><span><strong>{state === "verified" ? "Verified by Alex Kim" : request.receivedAt ? receivedSource : "Linked to verification requirement"}</strong><small>{state === "verified" ? `${requestSourceLabel(request)} · Evidence checks complete` : request.receivedAt ? `${formatReceivedAt(request.receivedAt)} · Awaiting analyst verification` : "Not yet verified"}</small></span></footer></article></div>
    </aside>
  );
}

function BorrowerRequestPreview({ evidenceState, dueDate, message, onUpload, onReject, onReset }: {
  evidenceState: EvidenceIntakeState;
  dueDate: string;
  message: string;
  onUpload: (file: File) => void;
  onReject: (message: string) => void;
  onReset: () => void;
}) {
  const dropzoneStatus = evidenceState.status === "requested" ? "idle" : evidenceState.status;

  return (
    <aside className={styles.requestPreview} aria-label="Borrower request preview">
      <header className={styles.previewToolbar}><span>Borrower view</span><span><i aria-hidden="true" /> Interactive preview</span></header>
      <div className={styles.previewStage}><article className={styles.previewPaper}><header className={styles.previewBrand}><CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" /><span><strong>Northstar Health</strong><small>Secure document portal</small></span></header><div className={styles.previewBody}><span className={styles.previewEyebrow}>Document request</span><h2>Document requested — 2027 Operating Forecast</h2><p>BCGX is reviewing Northstar Health’s revolving line and needs this document to complete downside analysis.</p><section className={styles.previewDocument}><span className={styles.previewFileIcon}><Icon name="document" size="sm" /></span><span><strong>2027 Operating Forecast</strong><small>Income statement, cash flow, and downside assumptions</small></span></section><dl className={styles.previewDetails}><div><dt>Requested by</dt><dd>Alex Kim · Credit analyst</dd></div><div><dt>Due</dt><dd>{dueDate || "Not set"}</dd></div><div><dt>Accepted files</dt><dd>XLSX, CSV, PDF, or DOCX · up to 25 MB</dd></div></dl>{message.trim() && <blockquote className={styles.previewMessage}>{message}</blockquote>}<FileDropzone compact status={dropzoneStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={forecastRequirement.acceptedFormats} onFileAccepted={onUpload} onFileRejected={onReject} onRemove={onReset} /></div><footer className={styles.previewSecurity}><Icon name="lock" size="xs" /><span><strong>Encrypted upload</strong><small>Only the Northstar review team can access this file.</small></span></footer></article></div>
    </aside>
  );
}
