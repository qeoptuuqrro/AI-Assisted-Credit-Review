import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { FileDropzone } from "../../../shared/ui/FileDropzone/FileDropzone";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { StatusPill, type StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { WorkflowSteps } from "../../../shared/ui/WorkflowSteps/WorkflowSteps";
import { BorrowerContactSelector } from "../borrower-requests/BorrowerContactSelector";
import { meridianBorrowerContacts } from "../borrower-requests/borrowerContacts";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import {
  evidenceProvenanceLabel,
  evidenceRequirements,
  findingRequirementIds,
  type EvidenceIntakeState,
  type EvidenceRequirement,
  type EvidenceRequestRecord,
} from "../workflow/evidenceWorkflow";
import { getSourceReviewPresentation } from "./sourceReviewData";
import {
  sources,
  type FindingDefinition,
  type FindingWorkflowState,
  type SourceReviewState,
} from "./meridianData";
import { isFindingAddressed, type JudgmentRecord, type ReassessmentInput } from "../workflow/creditReviewState";
import { companyLogoDomains } from "../companyLogos";
import {
  formatJudgmentTimestamp,
  getFindingDisplayRisk,
  getFindingStatusPresentation,
  getJudgmentPresentation,
} from "./findingJudgmentPresentation";
import { AssessmentChangeSummary } from "./AssessmentChangeSummary";
import { AssessmentInsightBrief } from "./AssessmentInsightBrief";
import { LeverageVerificationBrief } from "./LeverageVerificationBrief";
import styles from "./AssessmentFlowV2.module.css";

type AssessmentFlowV2Props = {
  finding: FindingDefinition;
  state: FindingWorkflowState;
  sourceReviewStates: Record<string, SourceReviewState>;
  evidenceState: EvidenceIntakeState;
  reassessed: boolean;
  judgment?: JudgmentRecord;
  layout?: "focused" | "insight-led";
  judgmentLayout?: "compact" | "breathable" | "editorial";
  language?: "ai-explicit" | "attributable";
  reviewPresentation?: "standard" | "decision-led" | "verification-led";
  workflowPresentation?: "standard" | "editorial";
  verificationPolicy?: "implicit" | "explicit-checklist";
  resumeEvidenceStage?: "evidence" | "review" | null;
  onEvidenceResumeHandled?: () => void;
  learningMode: boolean;
  onBack: () => void;
  onUploadEvidence: (file: File) => void;
  onRequestEvidence: (request: EvidenceRequestRecord) => void;
  onRejectEvidence: (message: string) => void;
  onUseExistingEvidence: () => void;
  onResetEvidence: () => void;
  onUpdateVerificationDraft: (draft: { confirmedChecks: string[]; analystContext?: string }) => void;
  onVerifyEvidence: () => void;
  onReassess: (input?: ReassessmentInput) => void;
  onRecordJudgment: (judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) => void;
  onOpenSource: (sourceId?: string, fromFindingId?: FindingDefinition["id"], resumeEvidenceStage?: "evidence" | "review") => void;
};

type ReassessmentStage = "evidence" | "recipient" | "request-review" | "review" | "processing" | "result";

const reassessmentTiming = {
  metricsComplete: 2100,
  comparisonComplete: 4000,
  resultReady: 5400,
  verificationEvidenceRead: 2000,
  verificationChangeValidated: 4000,
  verificationLedResultReady: 6000,
} as const;

type VerificationProcessingStage = {
  title: string;
  detail: string;
  activeLabel: string;
  icon: IconName;
};

function useContainedDialog(onClose: () => void, dismissDisabled = false, focusKey?: string) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissDisabledRef = useRef(dismissDisabled);
  const previousFocusKeyRef = useRef(focusKey);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    dismissDisabledRef.current = dismissDisabled;
  }, [dismissDisabled]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!dismissDisabledRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === dialogRef.current || !dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
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
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (previousFocusKeyRef.current === focusKey) return;
    previousFocusKeyRef.current = focusKey;
    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusKey]);

  return { dialogRef, closeRef };
}

const judgmentOptions: Array<{
  value: JudgmentRecord["decision"];
  label: string;
  description: string;
}> = [
  { value: "accept", label: "Accept", description: "Use this conclusion in the recommendation." },
  { value: "revise", label: "Revise", description: "Record an analyst-owned conclusion." },
  { value: "escalate", label: "Escalate", description: "Carry the finding forward for senior attention." },
];

const revisedRiskOptions: Array<{
  value: NonNullable<JudgmentRecord["revisedRisk"]>;
  description: string;
}> = [
  { value: "Material", description: "Requires protection or senior attention." },
  { value: "Moderate", description: "Manageable with monitoring and controls." },
];

function handleRadioArrow<T extends string>(
  event: ReactKeyboardEvent<HTMLInputElement>,
  options: ReadonlyArray<{ value: T }>,
  currentValue: T,
  onChange: (value: T) => void,
) {
  const direction = event.key === "ArrowRight" || event.key === "ArrowDown"
    ? 1
    : event.key === "ArrowLeft" || event.key === "ArrowUp"
      ? -1
      : 0;
  if (!direction) return;

  event.preventDefault();
  const currentIndex = options.findIndex((option) => option.value === currentValue);
  const nextOption = options[(currentIndex + direction + options.length) % options.length];
  const nextInput = event.currentTarget
    .closest("fieldset")
    ?.querySelector<HTMLInputElement>(`input[value="${nextOption.value}"]`);
  onChange(nextOption.value);
  nextInput?.focus();
}

const basisPresentation: Array<{ label: string; tone: StatusPillTone; icon: "checkCircle" | "document" | "calculator" }> = [
  { label: "Verified fact", tone: "success", icon: "checkCircle" },
  { label: "Source interpretation", tone: "info", icon: "document" },
  { label: "Modeled assumption", tone: "warning", icon: "calculator" },
];

type RevisionRisk = NonNullable<JudgmentRecord["revisedRisk"]>;

export function RiskDecisionCard({
  currentRisk,
  revisedRisk,
  onChange,
  layout = "breathable",
  language = "ai-explicit",
}: {
  currentRisk: RevisionRisk;
  revisedRisk: RevisionRisk;
  onChange: (risk: RevisionRisk) => void;
  layout?: "compact" | "breathable" | "editorial";
  language?: "ai-explicit" | "attributable";
}) {
  const selectedRisk = revisedRiskOptions.find((option) => option.value === revisedRisk) ?? revisedRiskOptions[0];
  const changed = currentRisk !== revisedRisk;
  const sourceLabel = language === "attributable" ? "System assessment" : "AI assessment";

  if (layout === "compact") {
    return (
      <section className={styles.riskDecisionCard} data-layout="compact" aria-labelledby="decision-context-title">
        <header>
          <span>
            <strong id="decision-context-title">Decision context</strong>
            <small>Connect the read-only assessment to your analyst-owned view.</small>
          </span>
          <small>Required</small>
        </header>
        <div className={styles.riskDecisionFlow}>
          <div className={styles.riskDecisionSource}>
            <span>{sourceLabel}</span>
            <strong data-risk={currentRisk.toLowerCase()}>{currentRisk}</strong>
            <small>Read-only</small>
          </div>
          <div className={styles.riskDecisionConnector} aria-hidden="true">
            <IconTile className={styles.riskDecisionConnectorGlyph} tone={changed ? "info" : "neutral"}>
              <Icon name="arrowRight" size="sm" />
            </IconTile>
            <small>{changed ? "Revised" : "Retained"}</small>
          </div>
          <fieldset className={styles.riskDecisionTarget}>
            <legend><span>Analyst view</span><small>Choose one</small></legend>
            <div className={styles.riskChoiceTrack}>
              {revisedRiskOptions.map((riskOption) => (
                <label key={riskOption.value} data-selected={revisedRisk === riskOption.value} data-risk={riskOption.value.toLowerCase()}>
                  <input type="radio" name="revised-risk" value={riskOption.value} checked={revisedRisk === riskOption.value} onChange={() => onChange(riskOption.value)} onKeyDown={(event) => handleRadioArrow(event, revisedRiskOptions, riskOption.value, onChange)} />
                  <span>{riskOption.value}</span>
                </label>
              ))}
            </div>
            <p className={styles.riskHint} aria-live="polite">{selectedRisk.description}</p>
          </fieldset>
        </div>
      </section>
    );
  }

  if (layout === "editorial") {
    const automaticRevision: RevisionRisk = currentRisk === "Material" ? "Moderate" : "Material";

    return (
      <section className={styles.editorialDecisionBaseline} data-decision="revise" aria-labelledby="revised-severity-title">
        <span aria-hidden="true"><Icon name="arrowRight" size="sm" /></span>
        <span>
          <small id="revised-severity-title">Revised severity</small>
          <strong>{automaticRevision} risk</strong>
        </span>
        <StatusPill tone="info">From {currentRisk}</StatusPill>
      </section>
    );
  }

  return (
    <section className={styles.riskDecisionCard} data-layout="breathable" aria-labelledby="analyst-risk-title">
      <header>
        <span>
          <strong id="analyst-risk-title">Set the analyst risk</strong>
          <small>Choose the risk view that should carry into the recommendation.</small>
        </span>
        <small>Required</small>
      </header>

      <div className={styles.breathableRiskBody}>
        <div className={styles.riskBaseline}>
          <span className={styles.riskBaselineIcon} aria-hidden="true"><Icon name="lock" size="sm" /></span>
          <span className={styles.riskBaselineCopy}>
            <small>{sourceLabel} · Read-only</small>
            <strong data-risk={currentRisk.toLowerCase()}>{currentRisk}</strong>
          </span>
          <small>Supporting context</small>
        </div>

        <div className={styles.riskOwnershipHandoff} data-changed={changed} aria-live="polite">
          <span aria-hidden="true"><Icon name="arrowRight" size="sm" /></span>
          <span>
            <strong>{changed ? "You’re changing the assessed risk" : "You’re retaining the assessed risk"}</strong>
            <small>The system assessment stays attached as read-only supporting analysis.</small>
          </span>
        </div>

        <fieldset className={styles.riskToggleField}>
          <legend><span>Your analyst view</span><small>Choose one</small></legend>
          <p>Select the risk label senior reviewers should rely on.</p>
          <div className={styles.riskToggleTrack}>
            {revisedRiskOptions.map((riskOption) => (
              <label key={riskOption.value} data-selected={revisedRisk === riskOption.value} data-risk={riskOption.value.toLowerCase()}>
                <input type="radio" name="revised-risk" value={riskOption.value} checked={revisedRisk === riskOption.value} onChange={() => onChange(riskOption.value)} onKeyDown={(event) => handleRadioArrow(event, revisedRiskOptions, riskOption.value, onChange)} />
                <span className={styles.riskToggleDot} aria-hidden="true"><i /></span>
                <span className={styles.riskToggleCopy}><strong>{riskOption.value}</strong><small>{riskOption.description}</small></span>
              </label>
            ))}
          </div>
          <p className={styles.riskSelectionSummary} aria-live="polite"><strong>{selectedRisk.value}</strong> selected · {selectedRisk.description}</p>
        </fieldset>
      </div>
    </section>
  );
}

export function AssessmentFlowV2({
  finding,
  state,
  sourceReviewStates,
  evidenceState,
  reassessed,
  judgment,
  layout = "focused",
  judgmentLayout = "breathable",
  language = "ai-explicit",
  reviewPresentation = "standard",
  workflowPresentation = "standard",
  verificationPolicy = "implicit",
  resumeEvidenceStage = null,
  onEvidenceResumeHandled,
  learningMode,
  onBack,
  onUploadEvidence,
  onRequestEvidence,
  onRejectEvidence,
  onUseExistingEvidence,
  onResetEvidence,
  onUpdateVerificationDraft,
  onVerifyEvidence,
  onReassess,
  onRecordJudgment,
  onOpenSource,
}: AssessmentFlowV2Props) {
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowInitialStage, setFlowInitialStage] = useState<"evidence" | "review">("evidence");
  const [judgmentOpen, setJudgmentOpen] = useState(false);
  const evidenceTriggerRef = useRef<HTMLElement | null>(null);
  const judgmentTriggerRef = useRef<HTMLElement | null>(null);
  const fallbackFocusRef = useRef<HTMLHeadingElement | null>(null);
  const overlayWasOpenRef = useRef(false);
  const requirement = evidenceRequirements[findingRequirementIds[finding.id]];
  const risk = getFindingDisplayRisk(finding, reassessed, judgment);
  const presentation = getFindingStatusPresentation(state, judgment);
  const judgmentPresentation = judgment ? getJudgmentPresentation(judgment) : undefined;
  const attributableLanguage = language === "attributable";
  const verificationLed = reviewPresentation === "verification-led";
  const decisionLed = reviewPresentation === "decision-led" || verificationLed;
  const assessmentLabel = judgment?.decision === "revise"
    ? "Analyst conclusion"
    : reassessed
      ? attributableLanguage ? "Updated assessment" : "Updated AI assessment"
      : attributableLanguage ? "Initial assessment" : "Initial AI assessment";
  const assessmentDescription = judgment?.decision === "revise" && judgment.revisedConclusion
    ? judgment.revisedConclusion
    : reassessed
      ? requirement.result.description
      : finding.summary;
  const assessmentBasis = reassessed ? requirement.result.updatedBasis : finding.rationale;
  const citedSources = finding.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean);
  const renewalLinked = finding.id === "customer-concentration" && ["ready-for-review", "verified"].includes(evidenceState.status);
  const existingSource = requirement.existingSource;
  const hasExistingEvidence = Boolean(existingSource);
  const evidenceReadyForReview = evidenceState.status === "ready-for-review" || evidenceState.status === "verified";
  const evidenceRequested = evidenceState.status === "requested" && Boolean(evidenceState.request);
  const matchedEvidenceSelected = evidenceState.provenance === "existing-source";
  const evidenceNoticeTitle = evidenceRequested && evidenceState.request
    ? `Evidence requested from ${evidenceState.request.recipientName}`
    : state === "needs_verification"
    ? "Verification evidence is required"
    : evidenceReadyForReview && !matchedEvidenceSelected
      ? "Evidence is ready for verification"
      : hasExistingEvidence
      ? finding.id === "customer-concentration"
        ? "New Customer A renewal found"
        : "Matched evidence received after assessment"
      : "Add new evidence to reassess";
  const evidenceActionLabel = evidenceRequested
    ? "View request"
    : state === "needs_verification"
    ? "Add required evidence"
    : evidenceReadyForReview
      ? "Review evidence"
      : hasExistingEvidence
      ? "Review renewal"
      : "Add new evidence";
  const displayedEvidenceActionLabel = workflowPresentation === "editorial" && hasExistingEvidence && !evidenceReadyForReview && !evidenceRequested
    ? "Choose evidence"
    : evidenceActionLabel;
  const riskChangedAfterEvidence = Boolean(
    reassessed
    && requirement.result.initialRisk
    && requirement.result.updatedRisk
    && requirement.result.initialRisk !== requirement.result.updatedRisk,
  );
  const interpretationTitle = reassessed
    ? riskChangedAfterEvidence
      ? `Why risk is now ${risk.toLowerCase()}`
      : `Why risk remains ${risk.toLowerCase()}`
    : `What supports the ${risk.toLowerCase()} assessment`;
  const showLeverageVerificationBrief = verificationLed
    && finding.id === "increasing-leverage"
    && state === "needs_verification"
    && !reassessed
    && !judgment;
  const leverageEvidenceStage = evidenceReadyForReview ? "review" : "evidence";
  const leverageEvidenceAction = evidenceRequested
    ? "View request"
    : evidenceReadyForReview
      ? "Review evidence"
      : "Add verification evidence";

  useEffect(() => {
    if (flowOpen || judgmentOpen) {
      overlayWasOpenRef.current = true;
      return;
    }
    if (!overlayWasOpenRef.current) return;
    overlayWasOpenRef.current = false;
    const trigger = [evidenceTriggerRef.current, judgmentTriggerRef.current]
      .find((candidate): candidate is HTMLElement => Boolean(candidate?.isConnected));
    if (trigger) trigger.focus();
    else fallbackFocusRef.current?.focus();
    evidenceTriggerRef.current = null;
    judgmentTriggerRef.current = null;
  }, [flowOpen, judgmentOpen]);

  function openEvidenceFlow(initialStage: "evidence" | "review" = "evidence", trigger?: HTMLElement | null) {
    evidenceTriggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (workflowPresentation !== "editorial" && initialStage === "review" && hasExistingEvidence && !evidenceReadyForReview) onUseExistingEvidence();
    setFlowInitialStage(verificationLed ? "evidence" : initialStage);
    setFlowOpen(true);
  }

  useEffect(() => {
    if (!resumeEvidenceStage || flowOpen) return;
    openEvidenceFlow(resumeEvidenceStage, null);
    onEvidenceResumeHandled?.();
  }, [resumeEvidenceStage]);

  function openJudgment(trigger?: HTMLElement | null) {
    judgmentTriggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setJudgmentOpen(true);
  }

  return (
    <div className={styles.page}>
      <Button className={styles.back} variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="sm" />} onClick={onBack}>All findings</Button>

      <header className={styles.header} data-presentation={reviewPresentation} {...getLearningTargetProps(learningMode, "finding-page-story")}>
        <div className={styles.headerTitle}>
          {verificationLed && <CompanyLogo className={styles.headerLogo} domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="md" />}
          <div className={styles.headerCopy}><span>{verificationLed ? "Meridian Foods · Finding review" : "Finding review"}</span><h1 ref={fallbackFocusRef} tabIndex={-1}>{finding.title}</h1><p>{finding.question}</p></div>
        </div>
        <div className={styles.status}><span data-risk={risk.toLowerCase()}>{risk} risk</span><StatusPill tone={presentation.tone}>{presentation.label}</StatusPill></div>
      </header>

      {judgment && judgmentPresentation && (
        <Notice tone={judgmentPresentation.tone} title={judgmentPresentation.title}>
          {judgment.decision === "revise"
            ? attributableLanguage
              ? "Your revised conclusion is now primary. The system assessment remains preserved as supporting context."
              : "Your revised conclusion is now primary. The AI assessment remains preserved as supporting context."
            : judgment.decision === "escalate"
              ? "Your review is recorded and this finding remains visible for senior credit judgment."
              : `${reassessed ? "The updated" : "The initial"} assessment is now accepted for use in the analyst recommendation.`}
        </Notice>
      )}

      {layout === "insight-led" && (
        <div {...getLearningTargetProps(learningMode, "finding-initial-assessment")}>
          <AssessmentInsightBrief finding={finding} requirement={requirement} mode={reassessed ? "updated" : "initial"} language={language} />
        </div>
      )}

      {reassessed && layout !== "insight-led" && (
        <AssessmentChangeSummary
          result={requirement.result}
          presentation={decisionLed ? "decision-led" : "detail-v2"}
        />
      )}

      {showLeverageVerificationBrief && (
        <div {...getLearningTargetProps(learningMode, "finding-initial-assessment")}>
          <LeverageVerificationBrief
            actionLabel={leverageEvidenceAction}
            onReviewEvidence={(trigger) => openEvidenceFlow(leverageEvidenceStage, trigger)}
          />
        </div>
      )}

      {layout !== "insight-led" && !showLeverageVerificationBrief && <section className={styles.summaryGrid} data-presentation={decisionLed ? "decision-led" : "standard"} aria-label="Assessment summary">
        <article className={styles.assessmentPanel} {...getLearningTargetProps(learningMode, "finding-initial-assessment")}>
          <span>{decisionLed ? reassessed ? "Current interpretation" : "Assessment interpretation" : assessmentLabel}</span>
          {decisionLed
            ? <h2 className={styles.assessmentReasonTitle}>{interpretationTitle}</h2>
            : <div className={styles.assessmentValue}><strong data-risk={risk.toLowerCase()}>{risk}</strong><small>risk</small></div>}
          <p>{assessmentDescription}</p>
          {!decisionLed && <dl>
            {finding.summaryFacts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd className={fact.label === "Top-two revenue" ? styles.factValueAttention : ""}>{getFactValue(finding, fact, reassessed)}</dd></div>
            ))}
          </dl>}
        </article>

        <FindingSignal finding={finding} reassessed={reassessed} presentation={reviewPresentation} />
      </section>}

      {judgment && judgmentPresentation && (
        <section className={styles.judgmentRecord} aria-label="Recorded analyst judgment">
          <IconTile tone={judgmentPresentation.tone === "warning" ? "warning" : judgmentPresentation.tone === "success" ? "success" : "info"}><Icon name={judgmentPresentation.icon} size="sm" /></IconTile>
          <div>
            <header><div><span>Analyst judgment</span><strong>{judgmentPresentation.title}</strong></div><StatusPill tone={judgmentPresentation.tone}>{judgmentPresentation.status}</StatusPill></header>
            {judgment.decision === "revise" && judgment.revisedConclusion && <p className={styles.judgmentConclusion}>{judgment.revisedConclusion}</p>}
            {(judgment.decision !== "revise" || judgment.rationale !== judgment.revisedConclusion) && <p>{judgment.rationale}</p>}
            <small>{judgment.author} · {formatJudgmentTimestamp(judgment.createdAt)}</small>
          </div>
        </section>
      )}

      {!reassessed && !judgment && !showLeverageVerificationBrief && (
        <div {...getLearningTargetProps(learningMode, "finding-evidence-update")}>
          <Notice
            title={evidenceNoticeTitle}
            action={<Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={(event) => openEvidenceFlow(evidenceReadyForReview || (workflowPresentation !== "editorial" && hasExistingEvidence && !evidenceRequested) ? "review" : "evidence", event.currentTarget)}>{displayedEvidenceActionLabel}</Button>}
          >
            {evidenceRequested && evidenceState.request
              ? `The request is due ${evidenceState.request.dueDate}. Evidence will remain unverified until a received file is reviewed by the analyst.`
              : matchedEvidenceSelected && existingSource
              ? `${existingSource.suppliedBy} supplied an executed renewal on ${existingSource.receivedAt}. ${attributableLanguage ? "The agreement was matched" : "AI found a likely match"} to this finding; analyst verification is required before applying the scoped reassessment.`
              : evidenceReadyForReview
                ? `${evidenceState.fileName ?? "The selected evidence"} is ready for provenance and material-term verification before the scoped reassessment is applied.`
              : existingSource
            ? `${existingSource.suppliedBy} supplied an executed renewal on ${existingSource.receivedAt}. ${attributableLanguage ? "The agreement was matched" : "AI found a likely match"} to this finding; analyst verification is required before applying the scoped reassessment.`
              : `No newer ${requirement.title.toLowerCase()} is attached to the case. Add a file to reassess only this finding; management context alone cannot replace evidence.`}
          </Notice>
        </div>
      )}

      {!decisionLed && (
        <section className={styles.basisDisclosure} aria-label="Assessment basis" {...getLearningTargetProps(learningMode, "finding-assessment-basis")}>
          <details>
            <summary>
              <span><strong>Assessment basis</strong><small>{assessmentBasis.length} inputs supporting the current conclusion</small></span>
              <Icon name="chevronDown" size="sm" />
            </summary>
            <div className={styles.basisLedger}>
              {assessmentBasis.map((item, index) => (
                <div key={item}>
                  <IconTile size="sm"><Icon name={basisPresentation[index]?.icon ?? "document"} size="sm" /></IconTile>
                  <span className={styles.basisCopy}>{item}</span>
                  <StatusPill tone={basisPresentation[index]?.tone ?? "neutral"}>{basisPresentation[index]?.label ?? "Assessment input"}</StatusPill>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      <section className={styles.flatSection} aria-labelledby="assessment-evidence-title" {...getLearningTargetProps(learningMode, "finding-source-set")}>
        <header><div><h2 id="assessment-evidence-title">Evidence reviewed</h2><p>{citedSources.length} sources support this assessment.</p></div><Button size="sm" variant="quiet" onClick={() => onOpenSource(undefined, finding.id)}>View source package</Button></header>
        <div className={styles.evidenceLedger}>
          {citedSources.map((source) => source && (
            <button type="button" key={source.id} aria-label={`Open ${source.name} (${source.format})`} onClick={() => onOpenSource(source.id, finding.id)}>
              <IconTile><Icon name="document" size="sm" /></IconTile>
              <span><strong>{source.name}</strong><small>{source.asOf} · {getSourceReviewPresentation(source, sourceReviewStates[source.id], renewalLinked).label}</small></span>
              <Icon name="chevronRight" size="sm" />
            </button>
          ))}
        </div>
      </section>

      {!isFindingAddressed(state) && !showLeverageVerificationBrief && (
        <footer className={styles.judgmentBar} {...getLearningTargetProps(learningMode, "finding-judgment")}>
          {reassessed ? (
          <><div><strong>Human judgment is still required</strong><span>Review the verified change, then take responsibility for the conclusion.</span></div><Button variant="primary" onClick={(event) => openJudgment(event.currentTarget)}>Record judgment</Button></>
          ) : state === "needs_verification" ? (
          <><div><strong>Resolve verification before judgment</strong><span>The open evidence requirement must be verified before this finding can be completed.</span></div><Button variant="primary" onClick={(event) => openEvidenceFlow("evidence", event.currentTarget)}>Add verification evidence</Button></>
          ) : (
          <><div><strong>Record your judgment</strong><span>Agree with the view, or add material evidence and rerun only the affected analysis.</span></div><div className={styles.actions}><Button variant="secondary" onClick={(event) => openEvidenceFlow("evidence", event.currentTarget)}>Add context or evidence</Button><Button variant="primary" onClick={(event) => openJudgment(event.currentTarget)}>Record judgment</Button></div></>
          )}
        </footer>
      )}

      {flowOpen && (
        <ReassessmentFlow
          initialStage={flowInitialStage}
          finding={finding}
          evidenceState={evidenceState}
          experience={verificationLed ? "verification-led" : "evidence-first"}
          onUploadEvidence={onUploadEvidence}
          onRequestEvidence={onRequestEvidence}
          onRejectEvidence={onRejectEvidence}
          onUseExistingEvidence={onUseExistingEvidence}
          onOpenSource={(sourceId, resumeStage) => onOpenSource(sourceId, finding.id, resumeStage)}
          onResetEvidence={onResetEvidence}
          onUpdateVerificationDraft={onUpdateVerificationDraft}
          onVerifyEvidence={onVerifyEvidence}
          onReassess={onReassess}
          language={language}
          presentation={workflowPresentation}
          verificationPolicy={verificationPolicy}
          onClose={() => setFlowOpen(false)}
          onContinueToJudgment={() => {
            const trigger = evidenceTriggerRef.current;
            evidenceTriggerRef.current = null;
            setFlowOpen(false);
            openJudgment(trigger);
          }}
        />
      )}
      {judgmentOpen && (
        <JudgmentDialog
          finding={finding}
          reassessed={reassessed}
          currentRisk={risk}
          layout={judgmentLayout}
          language={language}
          presentation={workflowPresentation}
          experience={verificationLed ? "verification-led" : "evidence-first"}
          onClose={() => setJudgmentOpen(false)}
          onSubmit={(judgment) => {
            onRecordJudgment(judgment);
            setJudgmentOpen(false);
          }}
        />
      )}
    </div>
  );
}

function getFactValue(finding: FindingDefinition, fact: FindingDefinition["summaryFacts"][number], reassessed: boolean) {
  if (!reassessed) return fact.value;
  if (fact.updatedValue) return fact.updatedValue;
  if (finding.id === "increasing-leverage" && fact.label === "Pro forma leverage") return "3.9x";
  if (finding.id === "increasing-leverage" && fact.label === "Unclassified obligation") return "$0";
  return fact.value;
}

function getEvidenceImportance(finding: FindingDefinition) {
  if (finding.id === "customer-concentration") {
    return "The analysis assumes Customer A’s contract ends in March 2027. A verified renewal can update that term only.";
  }
  if (finding.id === "declining-margins") {
    return "The analysis still uses plan-only pricing assumptions. Verified actuals can update those inputs only.";
  }
  return "The $2.1M equipment obligation is unclassified. Verified terms can determine whether it counts as funded debt.";
}

function getEditorialReviewScope(finding: FindingDefinition, fallback: string) {
  if (finding.id === "customer-concentration") return "Recalculate concentration downside using the verified contract term.";
  if (finding.id === "declining-margins") return "Recalculate margin and downside coverage using verified actuals.";
  if (finding.id === "increasing-leverage") return "Recalculate leverage using the verified obligation classification.";
  return fallback;
}

function FindingSignal({ finding, reassessed, presentation = "standard" }: {
  finding: FindingDefinition;
  reassessed: boolean;
  presentation?: NonNullable<AssessmentFlowV2Props["reviewPresentation"]>;
}) {
  const decisionLed = presentation === "decision-led" || presentation === "verification-led";

  if (finding.id === "declining-margins") {
    return (
      <article className={`${styles.signalPanel} ${styles.marginSignalPanel}`} aria-label="Operating margin pressure">
        <header className={styles.marginSignalHeader}>
          <span className={styles.marginSignalHeading}>
            <span className={styles.marginSignalIcon} aria-hidden="true"><Icon name="trendDown" size="sm" /></span>
            <span>Operating performance</span>
          </span>
          <StatusPill tone="danger">Material pressure</StatusPill>
        </header>
        <div className={styles.marginSignalBody}>
          <section className={styles.marginChangeCard} aria-label="EBITDA margin declined from 14.2 percent to 9.1 percent">
            <div className={styles.marginMetricHeader}><span>EBITDA margin</span><small>−5.1 pts</small></div>
            <div className={styles.marginValueTrack}>
              <span><small>Previous</small><strong>14.2%</strong></span>
              <span className={styles.marginValueArrow} aria-hidden="true"><Icon name="arrowRight" size="sm" /></span>
              <span><small>Current</small><strong data-negative="true">9.1%</strong></span>
            </div>
          </section>
          <section className={styles.coverageSignal} aria-label="Downside coverage 1.12 times, 0.08 times below the 1.20 times floor">
            <span>Downside coverage</span>
            <strong>1.12x</strong>
            <small><Icon name="alertCircle" size="xs" />0.08x below 1.20x floor</small>
          </section>
        </div>
        <footer className={styles.marginSignalFooter}><Icon name="alertCircle" size="xs" /><span>Lower cushion increases repayment sensitivity.</span></footer>
      </article>
    );
  }

  if (finding.id === "increasing-leverage") {
    const leverage = reassessed ? "3.9x" : "3.7x";
    const headroom = reassessed ? "0.35x" : "0.55x";

    return (
      <article
        className={`${styles.signalPanel} ${styles.leverageSignalPanel}`}
        aria-label={`Leverage is ${leverage.replace("x", " times")} with ${headroom.replace("x", " times")} of covenant headroom to a 4.25 times maximum`}
      >
        <div className={styles.leverageSignalMain}>
          <header className={styles.leverageSignalHeader}>
            <div className={styles.leveragePrimaryMetric}>
              <span>Debt / EBITDA</span>
              <strong>{leverage}</strong>
            </div>
            <div className={styles.leverageHeadroom}>
              <span>Covenant headroom</span>
              <strong>{headroom}</strong>
            </div>
          </header>
          <div
            className={styles.leverageGauge}
            role="img"
            aria-label={`${leverage.replace("x", " times")} leverage against a 4.25 times covenant maximum`}
          >
            <span className={styles.leverageGaugeTrack} aria-hidden="true">
              <span className={styles.leverageGaugeUsed} data-reassessed={reassessed} />
              <span className={styles.leverageGaugeCurrent} data-reassessed={reassessed} />
              <span className={styles.leverageGaugeMaximum} />
            </span>
          </div>
          <div className={styles.leverageGaugeLabels} aria-hidden="true">
            <span>Current position</span>
            <span>4.25x maximum</span>
          </div>
        </div>
        <div className={styles.leverageObligationRow}>
          <IconTile size="sm" tone={reassessed ? "success" : "warning"}>
            <Icon name={reassessed ? "checkCircle" : "calculator"} size="sm" />
          </IconTile>
          <span>Equipment obligation</span>
          <strong data-resolved={reassessed}>{reassessed ? "Funded debt" : "$2.1M pending"}</strong>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.portfolioPanel} aria-label="Revenue portfolio: Customer A 36 percent, Customer B 25 percent, all other customers 39 percent">
      <header><span>Revenue portfolio</span>{!decisionLed && <strong>61% top two</strong>}</header>
      <div className={styles.portfolioBody}>
        <div className={styles.donutFrame} aria-hidden="true">
          <div className={styles.donut} data-reassessed={reassessed} />
          {decisionLed && <span className={styles.donutValue}><strong>61%</strong><small>top two</small></span>}
        </div>
        <div className={styles.portfolioLegend}>
          <div><i data-customer="a" /><span><strong>36%</strong><small>Customer A</small></span></div>
          <div><i data-customer="b" /><span><strong>25%</strong><small>Customer B</small></span></div>
          <div><i data-customer="other" /><span><strong>39%</strong><small>All others</small></span></div>
        </div>
      </div>
      <footer><span>50% monitoring threshold</span><strong>11 pts above</strong></footer>
    </article>
  );
}

function ReassessmentFlow({ initialStage, finding, evidenceState, language, presentation, experience, verificationPolicy, onUploadEvidence, onRequestEvidence, onRejectEvidence, onUseExistingEvidence, onOpenSource, onResetEvidence, onUpdateVerificationDraft, onVerifyEvidence, onReassess, onClose, onContinueToJudgment }: {
  initialStage: "evidence" | "review";
  finding: FindingDefinition;
  evidenceState: EvidenceIntakeState;
  language: NonNullable<AssessmentFlowV2Props["language"]>;
  presentation: NonNullable<AssessmentFlowV2Props["workflowPresentation"]>;
  experience: "evidence-first" | "verification-led";
  verificationPolicy: NonNullable<AssessmentFlowV2Props["verificationPolicy"]>;
  onUploadEvidence: (file: File) => void;
  onRequestEvidence: (request: EvidenceRequestRecord) => void;
  onRejectEvidence: (message: string) => void;
  onUseExistingEvidence: () => void;
  onOpenSource: (sourceId?: string, resumeEvidenceStage?: "evidence" | "review") => void;
  onResetEvidence: () => void;
  onUpdateVerificationDraft: (draft: { confirmedChecks: string[]; analystContext?: string }) => void;
  onVerifyEvidence: () => void;
  onReassess: (input?: ReassessmentInput) => void;
  onClose: () => void;
  onContinueToJudgment: () => void;
}) {
  const [stage, setStage] = useState<ReassessmentStage>(experience === "verification-led" ? "evidence" : initialStage);
  const requirement = evidenceRequirements[findingRequirementIds[finding.id]];
  const previewInitialRisk = requirement.result.initialRisk ?? finding.initialRisk;
  const previewUpdatedRisk = requirement.result.updatedRisk ?? finding.initialRisk;
  const existingSource = requirement.existingSource;
  const hasExistingEvidence = Boolean(existingSource);
  const reviewingMatchedEvidence = evidenceState.provenance === "existing-source";
  const [note, setNote] = useState(evidenceState.verificationProgress?.analystContext ?? requirement.initialContext);
  const [selectedContactId, setSelectedContactId] = useState(meridianBorrowerContacts.find((contact) => contact.primary)?.id ?? meridianBorrowerContacts[0].id);
  const [requestDueDate, setRequestDueDate] = useState("Aug 5, 2026");
  const initialContact = meridianBorrowerContacts.find((contact) => contact.id === selectedContactId) ?? meridianBorrowerContacts[0];
  const initialRequestMessage = `Hi ${initialContact.name.split(" ")[0]} — please provide ${requirement.title.toLowerCase()} for Meridian Foods' credit review.`;
  const [requestMessage, setRequestMessage] = useState(initialRequestMessage);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [processingStep, setProcessingStep] = useState(0);
  const [confirmedChecks, setConfirmedChecks] = useState<string[]>(() => (
    evidenceState.verificationProgress?.confirmedChecks.filter((check) => requirement.verificationChecks.includes(check)) ?? []
  ));
  const processingTimerRefs = useRef<number[]>([]);
  const flowLayoutRef = useRef<HTMLDivElement>(null);
  const canContinue = evidenceState.status === "ready-for-review" || evidenceState.status === "verified";
  const requestIsActive = evidenceState.status === "requested" && Boolean(evidenceState.request);
  const uploadStatus = evidenceState.status === "requested" ? "idle" : evidenceState.status;
  const selectedContact = meridianBorrowerContacts.find((contact) => contact.id === selectedContactId) ?? meridianBorrowerContacts[0];
  const attributableLanguage = language === "attributable";
  const editorial = presentation === "editorial";
  const verificationLedFlow = experience === "verification-led";
  const inlineEvidenceConfirmation = editorial && verificationLedFlow;
  const renewalEvidence = finding.id === "customer-concentration";
  const explicitVerification = verificationPolicy === "explicit-checklist";
  const verificationComplete = confirmedChecks.length === requirement.verificationChecks.length;
  const canRunReassessment = canContinue && (inlineEvidenceConfirmation || !explicitVerification || verificationComplete);
  const verificationProcessingStages: VerificationProcessingStage[] = renewalEvidence
    ? [
        {
          title: "Reading the executed renewal",
          detail: "Executed Jul 18, 2026 · Term through Mar 2030",
          activeLabel: "Reading",
          icon: "document",
        },
        {
          title: "Validating the extracted change",
          detail: "Contract term · Mar 2027 → Mar 2030",
          activeLabel: "Checking",
          icon: "fileCheck",
        },
        {
          title: "Updating customer concentration",
          detail: "This finding recalculated · 61% unchanged",
          activeLabel: "Updating",
          icon: "calculator",
        },
      ]
    : [
        {
          title: "Reading the verified evidence",
          detail: evidenceState.fileName ?? existingSource?.fileName ?? "Confirmed source document",
          activeLabel: "Reading",
          icon: "document",
        },
        {
          title: "Validating the extracted change",
          detail: "Checking the confirmed facts against the source",
          activeLabel: "Checking",
          icon: "fileCheck",
        },
        {
          title: `Updating ${finding.title.toLowerCase()}`,
          detail: "Recalculating this finding only",
          activeLabel: "Updating",
          icon: "calculator",
        },
      ];
  const { dialogRef, closeRef } = useContainedDialog(onClose, stage === "processing", stage);

  useLayoutEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    if (flowLayoutRef.current) flowLayoutRef.current.scrollTop = 0;
  }, [dialogRef, stage]);

  function toggleVerificationCheck(check: string) {
    const next = confirmedChecks.includes(check)
      ? confirmedChecks.filter((item) => item !== check)
      : [...confirmedChecks, check];
    setConfirmedChecks(next);
    onUpdateVerificationDraft({ confirmedChecks: next, analystContext: note.trim() || undefined });
  }

  function updateAnalystContext(value: string) {
    setNote(value);
    onUpdateVerificationDraft({ confirmedChecks, analystContext: value.trim() || undefined });
  }

  function selectExistingEvidence() {
    setConfirmedChecks([]);
    onUseExistingEvidence();
  }

  function acceptUpload(file: File) {
    setConfirmedChecks([]);
    onUploadEvidence(file);
  }

  function replaceEvidence() {
    setConfirmedChecks([]);
    onResetEvidence();
  }

  function selectContact(id: string) {
    const nextContact = meridianBorrowerContacts.find((contact) => contact.id === id);
    if (!nextContact) return;
    const currentDefault = `Hi ${selectedContact.name.split(" ")[0]} — please provide ${requirement.title.toLowerCase()} for Meridian Foods' credit review.`;
    const nextDefault = `Hi ${nextContact.name.split(" ")[0]} — please provide ${requirement.title.toLowerCase()} for Meridian Foods' credit review.`;
    setRequestMessage((current) => current === currentDefault ? nextDefault : current);
    setSelectedContactId(id);
  }

  function sendEvidenceRequest() {
    if (!requestDueDate.trim()) return;
    onRequestEvidence({
      recipientName: selectedContact.name,
      recipientRole: selectedContact.role,
      recipientEmail: selectedContact.email,
      dueDate: requestDueDate,
      message: requestMessage.trim(),
      remindersEnabled,
      sentAt: new Date().toISOString(),
    });
    onClose();
  }

  useEffect(() => () => {
    processingTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function runReassessment() {
    const confirmationStage = inlineEvidenceConfirmation ? "evidence" : "review";
    if (stage !== confirmationStage || !canRunReassessment) return;
    const verifiedAt = new Date().toISOString();
    const verifiedChecks = inlineEvidenceConfirmation ? requirement.verificationChecks : confirmedChecks;
    setProcessingStep(0);
    setStage("processing");

    const completeReassessment = () => {
      processingTimerRefs.current = [];
      onVerifyEvidence();
      onReassess({
        analystContext: note.trim() || undefined,
        verification: explicitVerification
          ? { confirmedChecks: [...verifiedChecks], verifiedBy: "Alex Kim", verifiedAt }
          : undefined,
      });
      setStage("result");
    };

    processingTimerRefs.current = inlineEvidenceConfirmation
      ? [
          window.setTimeout(() => setProcessingStep(1), reassessmentTiming.verificationEvidenceRead),
          window.setTimeout(() => setProcessingStep(2), reassessmentTiming.verificationChangeValidated),
          window.setTimeout(completeReassessment, reassessmentTiming.verificationLedResultReady),
        ]
      : [
          window.setTimeout(() => setProcessingStep(1), reassessmentTiming.metricsComplete),
          window.setTimeout(() => setProcessingStep(2), reassessmentTiming.comparisonComplete),
          window.setTimeout(completeReassessment, reassessmentTiming.resultReady),
        ];
  }

  const requestMode = stage === "recipient" || stage === "request-review";
  const stageOrder: Array<{ id: ReassessmentStage; label: string; description?: string }> = verificationLedFlow
    ? [{ id: "evidence", label: "Evidence" }, { id: "result", label: "Updated assessment" }]
    : requestMode
      ? [{ id: "evidence", label: "Evidence", description: "Choose source" }, { id: "recipient", label: "Recipient", description: "Choose contact" }, { id: "request-review", label: "Review", description: "Confirm request" }]
      : [{ id: "evidence", label: "Evidence", description: "Choose source" }, { id: "review", label: "Review", description: "Verify scope" }, { id: "result", label: "Result", description: "Review changes" }];
  const visualStage = verificationLedFlow
    ? stage === "result" ? "result" : "evidence"
    : stage === "processing" ? "review" : stage;
  const editorialAlternativePaths = (
    <section className={styles.editorialAlternatives} aria-labelledby="evidence-alternatives-title">
      <header><strong id="evidence-alternatives-title">{requestIsActive ? "Received it another way?" : "Choose another evidence path"}</strong><small>{requestIsActive ? "Uploading a file will move this finding into analyst verification." : "Upload a file now or create a tracked borrower request."}</small></header>
      <div data-single={requestIsActive}>
        <FileDropzone status={uploadStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={requirement.acceptedFormats} onFileAccepted={acceptUpload} onFileRejected={onRejectEvidence} onRemove={replaceEvidence} />
        {!requestIsActive && <button className={styles.editorialRequestEvidence} type="button" onClick={() => setStage("recipient")}><IconTile tone="info"><Icon name="users" size="sm" /></IconTile><span><strong>Request from borrower</strong><small>Choose a recipient and due date.</small></span><Icon name="chevronRight" size="sm" /></button>}
      </div>
    </section>
  );

  return (
    <section ref={dialogRef} className={styles.flowOverlay} data-presentation={presentation} data-experience={experience} role="dialog" aria-modal="true" aria-labelledby="reassessment-flow-title" tabIndex={-1}>
      <header className={styles.flowHeader}>
        <div><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" /><span className={styles.flowIdentityDivider} aria-hidden="true" /><span><strong>Meridian Foods</strong><small>{finding.title} reassessment</small></span></div>
        <button ref={closeRef} type="button" aria-label="Close reassessment" disabled={stage === "processing"} onClick={onClose}><Icon name="close" size="sm" /></button>
      </header>

      <div ref={flowLayoutRef} className={styles.flowLayout} data-stage={stage} data-presentation={presentation}>
        {editorial ? (
          <WorkflowSteps ariaLabel="Reassessment steps" items={stageOrder} value={visualStage} className={styles.editorialSteps} />
        ) : (
          <nav className={styles.flowSteps} aria-label="Reassessment steps">
            {stageOrder.map((item, index) => {
              const activeIndex = stageOrder.findIndex((candidate) => candidate.id === visualStage);
              return <span key={item.id} data-active={item.id === visualStage} data-complete={index < activeIndex}><i>{index < activeIndex ? <Icon name="check" size="xs" /> : index + 1}</i>{item.label}</span>;
            })}
          </nav>
        )}

        <main className={styles.flowContent}>
          {stage === "evidence" && (
            editorial ? (
              inlineEvidenceConfirmation && canContinue ? (
                <>
                  <div className={styles.flowTitle}>
                    <span>Evidence</span>
                    <h1 id="reassessment-flow-title">{renewalEvidence ? "Confirm renewal evidence" : "Confirm evidence"}</h1>
                    <p>{renewalEvidence ? "Confirm the authoritative renewal and extracted contract change before updating this finding." : "Confirm the authoritative source and extracted change before updating this finding."}</p>
                  </div>

                  <section className={styles.editorialReviewRecord} aria-labelledby="confirmation-evidence-title">
                    <header>
                      <IconTile tone="success"><Icon name="fileCheck" size="sm" /></IconTile>
                      <span>
                        <strong id="confirmation-evidence-title">{evidenceState.fileName ?? existingSource?.fileName ?? "Selected evidence"}</strong>
                        <small>{reviewingMatchedEvidence && existingSource ? `Executed ${existingSource.receivedAt} · ${existingSource.suppliedBy}` : evidenceProvenanceLabel(evidenceState.provenance)}</small>
                      </span>
                      <StatusPill tone={evidenceState.status === "verified" ? "success" : "info"}>{evidenceState.status === "verified" ? "Verified" : "Ready to confirm"}</StatusPill>
                    </header>
                    <dl className={styles.editorialReviewLedger}>
                      <div><dt>Key change</dt><dd>{requirement.result.changedTitle}</dd></div>
                      <div><dt>Analysis affected</dt><dd>{finding.title} only</dd></div>
                    </dl>
                    <p className={styles.editorialConfirmationNote}><Icon name="checkCircle" size="sm" />Confirming attests that this is the authoritative {renewalEvidence ? "renewal" : "source"} and the extracted change is accurate.</p>
                    <div className={styles.editorialRecordActions} data-single={!(reviewingMatchedEvidence && existingSource)}>
                      {reviewingMatchedEvidence && existingSource && <Button className={styles.editorialRecordAction} size="sm" variant="quiet" icon={<Icon name="eye" size="xs" />} iconPosition="start" onClick={() => onOpenSource("customer-a-renewal", "evidence")}>Open document</Button>}
                      <Button className={styles.editorialRecordAction} size="sm" variant="quiet" icon={<Icon name="refresh" size="xs" />} iconPosition="start" onClick={replaceEvidence}>Use a different source</Button>
                    </div>
                  </section>
                </>
              ) : (
              <>
                <div className={styles.flowTitle}>
                  <span>Evidence</span>
                  <h1 id="reassessment-flow-title">{requestIsActive ? "Evidence request in progress" : canContinue ? "Evidence selected" : hasExistingEvidence ? "Choose evidence to verify" : "Provide evidence to verify"}</h1>
                  <p>{requestIsActive ? "Track the request or upload a received document." : canContinue ? "Review the source, then confirm what the analysis may use." : "Select a source to verify. Nothing changes until review."}</p>
                </div>

                <Notice className={styles.editorialWhy} icon="document" title="Why this matters">{getEvidenceImportance(finding)}</Notice>

                <section className={styles.editorialRequirement} aria-labelledby="evidence-requirement-title">
                  <header className={styles.editorialRequirementHeader}>
                    <span><strong id="evidence-requirement-title">{requirement.title}</strong><small>{requirement.description}</small></span>
                    <StatusPill tone={evidenceState.status === "verified" ? "success" : ["ready-for-review", "requested"].includes(evidenceState.status) ? "info" : "warning"}>{evidenceState.status === "verified" ? "Verified" : evidenceState.status === "ready-for-review" ? "Ready for review" : evidenceState.status === "requested" ? "Requested" : "Required"}</StatusPill>
                  </header>

                  {requestIsActive && evidenceState.request && (
                    <article className={styles.editorialRequestStatus}>
                      <IconTile tone="info"><Icon name="send" size="sm" /></IconTile>
                      <span><small>Open borrower request</small><strong>{evidenceState.request.recipientName}</strong><em>{evidenceState.request.recipientRole} · Due {evidenceState.request.dueDate}{evidenceState.request.remindersEnabled ? " · Reminders on" : ""}</em></span>
                      <StatusPill tone="info">Awaiting response</StatusPill>
                    </article>
                  )}

                  {existingSource && (evidenceState.status === "idle" || reviewingMatchedEvidence) && (
                    <article className={styles.editorialEvidenceRecord} data-selected={reviewingMatchedEvidence && canContinue}>
                      <button className={styles.editorialRecordSelect} type="button" aria-pressed={reviewingMatchedEvidence && canContinue} onClick={reviewingMatchedEvidence && canContinue ? undefined : selectExistingEvidence}>
                        <IconTile tone={reviewingMatchedEvidence && canContinue ? "success" : "neutral"}><Icon name={reviewingMatchedEvidence && canContinue ? "fileCheck" : "document"} size="sm" /></IconTile>
                        <span className={styles.editorialRecordCopy}>
                          <small>{reviewingMatchedEvidence && canContinue ? "Selected evidence" : "Matched document"}</small>
                          <strong>{existingSource.fileName}</strong>
                          <span>{existingSource.detail} · {existingSource.suppliedBy}</span>
                        </span>
                        <span className={styles.editorialRecordState}>{reviewingMatchedEvidence && canContinue ? <><Icon name="checkCircle" size="sm" />Selected</> : <>Select<Icon name="chevronRight" size="sm" /></>}</span>
                      </button>
                      <div className={styles.editorialRecordActions} data-single={!(reviewingMatchedEvidence && canContinue)}>
                        <Button className={styles.editorialRecordAction} size="sm" variant="quiet" icon={<Icon name="eye" size="xs" />} iconPosition="start" onClick={() => onOpenSource("customer-a-renewal", canContinue ? "review" : "evidence")}>Inspect document</Button>
                        {reviewingMatchedEvidence && canContinue && <Button className={styles.editorialRecordAction} size="sm" variant="quiet" icon={<Icon name="refresh" size="xs" />} iconPosition="start" onClick={replaceEvidence}>Change source</Button>}
                      </div>
                    </article>
                  )}

                  {!reviewingMatchedEvidence && canContinue && (
                    <div className={styles.editorialSelectedUpload}>
                      <FileDropzone status={uploadStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={requirement.acceptedFormats} onFileAccepted={acceptUpload} onFileRejected={onRejectEvidence} onRemove={replaceEvidence} />
                    </div>
                  )}

                  {!canContinue && hasExistingEvidence && !requestIsActive
                    ? <details className={styles.editorialAlternativesDisclosure}><summary><span>Need a different source?</span><Icon name="chevronDown" size="sm" /></summary>{editorialAlternativePaths}</details>
                    : !canContinue && editorialAlternativePaths}
                </section>

                <details className={styles.editorialContextDisclosure}>
                  <summary><span><strong>{requirement.analystContextLabel}</strong><small>Optional · Saved to this review</small></span><Icon name="chevronDown" size="sm" /></summary>
                  <div><label className={styles.field}><span>Context for reviewers <small>Optional</small></span><textarea value={note} placeholder={requirement.analystContextPlaceholder} onChange={(event) => updateAnalystContext(event.target.value)} /></label></div>
                </details>
              </>
              )
            ) : (
              <>
                <div className={styles.flowTitle}><span>Evidence</span><h1 id="reassessment-flow-title">{requestIsActive ? "Evidence request is active" : hasExistingEvidence ? "Choose or add evidence" : "Add evidence for reassessment"}</h1><p>{requestIsActive ? "Track the borrower request or upload a file received through another channel." : hasExistingEvidence ? "We found a likely match. Use it, upload a replacement, or ask the borrower for a new document." : "Upload a newer source or request it from a borrower contact. Context cannot replace verification."}</p></div>
                <Notice title="Why this evidence matters">{requirement.currentAssumption}</Notice>
                <section className={styles.requirementCard} aria-labelledby="evidence-requirement-title">
                  <header><span><strong id="evidence-requirement-title">{requirement.title}</strong><small>{requirement.description}</small></span><StatusPill tone={evidenceState.status === "verified" ? "success" : ["ready-for-review", "requested"].includes(evidenceState.status) ? "info" : "warning"}>{evidenceState.status === "verified" ? "Verified" : evidenceState.status === "ready-for-review" ? "Ready for review" : evidenceState.status === "requested" ? "Requested" : "Required"}</StatusPill></header>
                  {requestIsActive && evidenceState.request && <Notice title={`Requested from ${evidenceState.request.recipientName}`}>{evidenceState.request.recipientRole} · Due {evidenceState.request.dueDate}{evidenceState.request.remindersEnabled ? " · Automatic reminders on" : ""}</Notice>}
                  {requirement.existingSource && evidenceState.status === "idle" && (
                    <div className={styles.existingEvidenceRow}>
                      <button className={styles.existingEvidence} type="button" onClick={selectExistingEvidence}>
                        <IconTile><Icon name="document" size="sm" /></IconTile><span><strong>{requirement.existingSource.fileName}</strong><small>{requirement.existingSource.detail}</small><em>Likely match for the open contract assumption</em></span><span>Use this renewal</span>
                      </button>
                      <Button className={styles.viewEvidence} size="sm" variant="quiet" icon={<Icon name="document" size="xs" />} iconPosition="start" onClick={() => onOpenSource("customer-a-renewal", "evidence")}>View document</Button>
                    </div>
                  )}
                  {requirement.existingSource && evidenceState.status === "idle" && <div className={styles.orDivider}><span>or upload a different document</span></div>}
                  <FileDropzone status={uploadStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={requirement.acceptedFormats} onFileAccepted={acceptUpload} onFileRejected={onRejectEvidence} onRemove={replaceEvidence} />
                  {!requestIsActive && !canContinue && <><div className={styles.orDivider}><span>or request it from the company</span></div><button className={styles.requestEvidence} type="button" onClick={() => setStage("recipient")}><IconTile tone="info"><Icon name="users" size="sm" /></IconTile><span><strong>Request from borrower</strong><small>Select a Meridian Foods contact, due date, and reminders.</small></span><Icon name="chevronRight" size="sm" /></button></>}
                </section>
                <label className={styles.field}><span>{requirement.analystContextLabel} <small>Optional</small></span><textarea value={note} placeholder={requirement.analystContextPlaceholder} onChange={(event) => updateAnalystContext(event.target.value)} /></label>
              </>
            )
          )}

          {stage === "recipient" && (
            <>
              <div className={styles.flowTitle}><span>Recipient</span><h1 id="reassessment-flow-title">Who should receive this request?</h1><p>Select a contact at Meridian Foods. Internal assessment details will not be included in the borrower-facing message.</p></div>
              <BorrowerContactSelector contacts={meridianBorrowerContacts} selectedId={selectedContactId} onSelect={selectContact} name="meridian-evidence-recipient" />
              <label className={styles.field}><span>Due date</span><input value={requestDueDate} onChange={(event) => setRequestDueDate(event.target.value)} /></label>
              <label className={styles.field}><span>Message <small>Optional</small></span><textarea value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} /></label>
              <label className={styles.reminderToggle}><input type="checkbox" checked={remindersEnabled} onChange={(event) => setRemindersEnabled(event.target.checked)} /><span><strong>Send automatic reminders</strong><small>Three days before and on the due date</small></span></label>
            </>
          )}

          {stage === "request-review" && (
            <>
              <div className={styles.flowTitle}><span>Review</span><h1 id="reassessment-flow-title">Review and send</h1><p>Confirm the evidence requirement, borrower contact, due date, and message.</p></div>
              <Notice title="Tracked from request to reassessment">A received document will stay linked to this finding, but it will still require analyst verification.</Notice>
              <dl className={styles.reviewSummary}>
                <div><dt>Evidence</dt><dd>{requirement.title}</dd></div>
                <div><dt>Recipient</dt><dd>{selectedContact.name} · {selectedContact.role}</dd></div>
                <div><dt>Email</dt><dd>{selectedContact.email}</dd></div>
                <div><dt>Due</dt><dd>{requestDueDate}</dd></div>
                <div><dt>Reminders</dt><dd>{remindersEnabled ? "Three days before and on the due date" : "Off"}</dd></div>
                <div><dt>Message</dt><dd>{requestMessage.trim() || "No message added"}</dd></div>
              </dl>
            </>
          )}

          {stage === "review" && (
            editorial ? (
              <>
                <div className={styles.flowTitle}>
                  <span>Review</span>
                  <h1 id="reassessment-flow-title">Verify the evidence and scope</h1>
                  <p>Confirm the document and update scope. No result has been calculated.</p>
                </div>

                <section className={styles.editorialReviewRecord} aria-labelledby="review-evidence-title">
                  <header>
                    <IconTile><Icon name="document" size="sm" /></IconTile>
                    <span><small>Evidence to verify</small><strong id="review-evidence-title">{evidenceState.fileName ?? existingSource?.fileName ?? "Matched source"}</strong></span>
                    <StatusPill tone="info">Ready to verify</StatusPill>
                  </header>
                  <dl className={styles.editorialReviewLedger}>
                    <div><dt>Provenance</dt><dd>{reviewingMatchedEvidence && existingSource ? `${existingSource.suppliedBy} · Existing source` : evidenceProvenanceLabel(evidenceState.provenance)}</dd></div>
                    {reviewingMatchedEvidence && existingSource && <div><dt>Received</dt><dd>{existingSource.receivedAt} · After original assessment</dd></div>}
                    <div><dt>Current assessment</dt><dd><span data-risk={finding.initialRisk.toLowerCase()}>{finding.initialRisk} risk</span><StatusPill tone="neutral">Read-only</StatusPill></dd></div>
                    <div><dt>{requirement.analystContextLabel}</dt><dd>{note.trim() || "No additional context supplied"}</dd></div>
                  </dl>
                </section>

                <section className={styles.editorialAnalysisScope} aria-labelledby="analysis-scope-title">
                  <div className={styles.editorialPendingResult}>
                    <IconTile tone="info"><Icon name="calculator" size="sm" /></IconTile>
                    <span><small>Assessment result</small><strong>Not calculated yet</strong></span>
                    <StatusPill tone="neutral">After verification</StatusPill>
                  </div>
                  <div className={styles.editorialScopeCopy}>
                    <span>Scoped analysis</span>
                    <h2 id="analysis-scope-title">Update this assumption only</h2>
                    <p>{getEditorialReviewScope(finding, requirement.reviewScope)}</p>
                    <div><span><Icon name="checkCircle" size="sm" />This finding only</span><span><Icon name="lock" size="sm" />Final credit decision unchanged</span></div>
                  </div>
                </section>

                {explicitVerification && <fieldset className={styles.editorialVerification}>
                  <legend><span>Verify the source facts</span><small>{confirmedChecks.length} of {requirement.verificationChecks.length} verified</small></legend>
                  <p>Check each statement against the source document. All are required before analysis can update.</p>
                  <div>
                    {requirement.verificationChecks.map((check) => (
                      <label key={check} data-checked={confirmedChecks.includes(check)}>
                        <input type="checkbox" checked={confirmedChecks.includes(check)} onChange={() => toggleVerificationCheck(check)} />
                        <span>{check}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>}
              </>
            ) : (
              <>
                <div className={styles.flowTitle}><span>Review</span><h1 id="reassessment-flow-title">{reviewingMatchedEvidence ? "Review the matched renewal" : "Verify the evidence and scope"}</h1><p>{reviewingMatchedEvidence ? attributableLanguage ? "This document matches Customer A and the open contract-duration assumption. Confirm its provenance and material terms before applying the scoped reassessment." : "AI matched this document to Customer A and the open contract-duration assumption. Confirm its provenance and material terms before applying the scoped reassessment." : "The uploaded file matched this requirement. Confirming it will rerun only the affected analysis—not make the final credit decision."}</p></div>
                <section className={styles.reviewImpactPreview} aria-label="Potential scoped impact after verification">
                  <header>
                    <IconTile tone="info"><Icon name="spark" size="sm" /></IconTile>
                    <span><small>Potential scoped impact</small><strong>{requirement.result.changedTitle}</strong></span>
                    <StatusPill tone="info">Preview</StatusPill>
                  </header>
                  <div className={styles.reviewImpactTrack}>
                    <span className={styles.reviewImpactMetric}><small>Current assessment</small><strong data-risk={previewInitialRisk.toLowerCase()}>{previewInitialRisk}</strong></span>
                    <span className={styles.reviewImpactBridge}><Icon name="arrowRight" size="sm" /><small>Verify</small></span>
                    <span className={styles.reviewImpactMetric}><small>{attributableLanguage ? "Scoped analysis preview" : "Scoped AI preview"}</small><strong data-risk={previewUpdatedRisk.toLowerCase()}>{previewUpdatedRisk}</strong></span>
                  </div>
                  <p><Icon name="checkCircle" size="sm" />{requirement.reviewScope}</p>
                </section>
                <dl className={styles.reviewSummary}>
                  <div><dt>Current conclusion</dt><dd>{finding.initialRisk} risk</dd></div>
                  <div><dt>Evidence</dt><dd>{evidenceState.fileName ?? existingSource?.fileName ?? "Matched source"}</dd></div>
                  <div><dt>Provenance</dt><dd>{reviewingMatchedEvidence && existingSource ? `${existingSource.suppliedBy} · Existing source` : evidenceProvenanceLabel(evidenceState.provenance)}</dd></div>
                  {reviewingMatchedEvidence && existingSource && <div><dt>Received</dt><dd>{existingSource.receivedAt} · After the original assessment</dd></div>}
                  <div><dt>{requirement.analystContextLabel}</dt><dd>{note.trim() || "No additional context"}</dd></div>
                </dl>
                <section className={styles.verificationChecklist} aria-label="Verification checks"><header>Verification checks</header>{requirement.verificationChecks.map((check) => <span key={check}><Icon name="check" size="xs" />{check}</span>)}</section>
              </>
            )
          )}

          {stage === "processing" && (
            <div className={styles.processing} role="status" aria-live="polite">
              <span className={styles.processingMark} aria-hidden="true"><Icon name={inlineEvidenceConfirmation ? verificationProcessingStages[processingStep].icon : editorial ? "calculator" : "spark"} size="md" /></span>
              <div className={styles.flowTitle}>
                <span>{attributableLanguage ? "Automated analysis" : "AI reassessment"}</span>
                <h1 id="reassessment-flow-title">{inlineEvidenceConfirmation && finding.id === "customer-concentration" ? "Updating customer-concentration assessment" : editorial ? "Updating the scoped assessment" : attributableLanguage ? "Updating this finding" : "AI is reassessing this finding"}</h1>
                <p>{inlineEvidenceConfirmation ? `Applying the confirmed evidence to ${finding.title.toLowerCase()} only.` : "The verified evidence is being applied to the scoped calculation. Unrelated findings and the final credit decision remain unchanged."}</p>
              </div>
              {inlineEvidenceConfirmation ? (
                <div className={styles.verificationTrace} aria-label="Reassessment progress">
                  {verificationProcessingStages.map((item, index) => {
                    const itemState = processingStep > index ? "complete" : processingStep === index ? "active" : "pending";
                    return (
                      <div key={item.title} className={styles.verificationTraceItem} data-state={itemState} aria-current={itemState === "active" ? "step" : undefined}>
                        <span className={styles.verificationTraceMarker} aria-hidden="true"><Icon name={itemState === "complete" ? "check" : item.icon} size="sm" /></span>
                        <span className={styles.verificationTraceCopy}><strong>{item.title}</strong><small>{item.detail}</small></span>
                        <span className={styles.verificationTraceState}>{itemState === "complete" ? "Done" : itemState === "active" ? item.activeLabel : "Next"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.processingSteps} aria-label="Reassessment progress">
                  <span data-state="complete"><i><Icon name="check" size="xs" /></i>Evidence verified</span>
                  <span data-state={processingStep >= 1 ? "complete" : "active"}><i><Icon name={processingStep >= 1 ? "check" : "spark"} size="xs" /></i>Recomputing the affected metrics</span>
                  <span data-state={processingStep >= 2 ? "complete" : processingStep >= 1 ? "active" : "pending"}><i><Icon name={processingStep >= 2 ? "check" : "spark"} size="xs" /></i>Comparing changed and unchanged conclusions</span>
                </div>
              )}
            </div>
          )}

          {stage === "result" && (
            <>
              <div className={styles.flowTitle}><span>{verificationLedFlow ? "Updated assessment" : "Result"}</span><h1 id="reassessment-flow-title">{requirement.result.title}</h1><p>{requirement.result.description}</p></div>
              <Notice className={styles.resultBanner} tone="info" title={verificationLedFlow ? "Human judgment still required" : "What this means"}>{requirement.result.explanation}</Notice>
              <AssessmentChangeSummary result={requirement.result} context="flow" presentation={verificationLedFlow ? "verification-led" : "ledger-v1"} />
            </>
          )}
        </main>
      </div>

      <footer className={styles.flowFooter} data-presentation={presentation}>
        <div className={styles.flowFooterInner}>
          <div className={styles.flowFooterStart}>
            {stage === "evidence" && <Button size="lg" variant="secondary" onClick={onClose}>Cancel</Button>}
            {stage === "recipient" && <Button size="lg" variant="secondary" onClick={() => setStage("evidence")}>Back</Button>}
            {stage === "request-review" && <Button size="lg" variant="secondary" onClick={() => setStage("recipient")}>Back</Button>}
            {stage === "review" && <Button size="lg" variant="secondary" onClick={() => { if (reviewingMatchedEvidence) replaceEvidence(); setStage("evidence"); }}>{reviewingMatchedEvidence ? "Choose another source" : "Back"}</Button>}
            {stage === "result" && <Button size="lg" variant="secondary" onClick={onClose}>Back to finding</Button>}
          </div>
            {stage === "processing" && <span className={styles.flowStatus}><Icon name={editorial ? "calculator" : "spark"} size="xs" />{attributableLanguage ? "Analysis in progress…" : "AI reassessment in progress…"}</span>}
          <div className={styles.flowFooterEnd}>
            {stage === "evidence" && (inlineEvidenceConfirmation
              ? <Button size="lg" variant="primary" disabled={!canRunReassessment} icon={<Icon name="calculator" size="xs" />} iconPosition="start" onClick={runReassessment}>Confirm and reassess</Button>
              : <Button size="lg" variant="primary" disabled={!canContinue} icon={<Icon name="arrowRight" size="xs" />} onClick={() => setStage("review")}>Review</Button>)}
            {stage === "recipient" && <Button size="lg" variant="primary" disabled={!requestDueDate.trim()} onClick={() => setStage("request-review")}>Review request</Button>}
            {stage === "request-review" && <Button size="lg" variant="primary" onClick={sendEvidenceRequest}>Send request</Button>}
            {stage === "review" && <Button size="lg" variant="primary" disabled={!canRunReassessment} icon={<Icon name={editorial ? "calculator" : "spark"} size="xs" />} iconPosition="start" onClick={runReassessment}>{editorial ? "Verify & update analysis" : attributableLanguage ? "Verify & reassess" : "Verify & run AI reassessment"}</Button>}
            {stage === "result" && <Button size="lg" variant="primary" onClick={onContinueToJudgment}>Continue to judgment</Button>}
          </div>
        </div>
      </footer>
    </section>
  );
}

function JudgmentDialog({ finding, reassessed, currentRisk, layout, language, presentation, experience, onClose, onSubmit }: {
  finding: FindingDefinition;
  reassessed: boolean;
  currentRisk: NonNullable<JudgmentRecord["revisedRisk"]>;
  layout: "compact" | "breathable" | "editorial";
  language: NonNullable<AssessmentFlowV2Props["language"]>;
  presentation: NonNullable<AssessmentFlowV2Props["workflowPresentation"]>;
  experience: "evidence-first" | "verification-led";
  onClose: () => void;
  onSubmit: (judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) => void;
}) {
  const editorial = presentation === "editorial" || layout === "editorial";
  const [decision, setDecision] = useState<JudgmentRecord["decision"] | null>(editorial ? null : "accept");
  const [rationale, setRationale] = useState("");
  const [revisedRisk, setRevisedRisk] = useState<RevisionRisk>(currentRisk);
  const automaticRevision: RevisionRisk = currentRisk === "Material" ? "Moderate" : "Material";
  const { dialogRef, closeRef } = useContainedDialog(onClose);
  const revisionComplete = decision !== "revise" || Boolean(rationale.trim() && revisedRisk);
  const submitLabel = decision === "revise" ? "Record revision" : decision === "escalate" ? "Escalate finding" : "Record judgment";
  const selectedDecision = judgmentOptions.find((option) => option.value === decision);
  const attributableLanguage = language === "attributable";
  const contextTitle = reassessed ? "Updated analysis reviewed" : "Initial assessment reviewed";
  const contextDescription = decision === "revise"
    ? attributableLanguage ? "Your analyst view becomes primary; the system analysis stays read-only." : "Your analyst view becomes primary; the AI analysis stays read-only."
    : decision === "escalate"
      ? "This finding stays open for senior credit judgment."
      : reassessed
        ? "Verified changes remain attached to this record."
        : "The cited analysis remains attached to this record.";
  const rationaleLabel = decision === "escalate" ? "Reason for escalation" : "Reason for acceptance";
  const rationalePlaceholder = decision === "escalate"
    ? "Explain what requires senior attention..."
    : "Summarize why the assessment should carry into the recommendation...";

  function selectDecision(nextDecision: JudgmentRecord["decision"]) {
    setDecision(nextDecision);
    if (editorial && nextDecision === "revise") setRevisedRisk(automaticRevision);
  }

  function submitJudgment() {
    if (!decision) return;
    onSubmit({
      decision,
      rationale,
      revisedConclusion: decision === "revise" ? rationale : undefined,
      revisedRisk: decision === "revise" ? (editorial ? automaticRevision : revisedRisk) : undefined,
    });
  }

  return (
    <section ref={dialogRef} className={styles.flowOverlay} data-presentation={presentation} data-experience={experience} role="dialog" aria-modal="true" aria-labelledby="judgment-title" tabIndex={-1}>
      <header className={styles.flowHeader}>
        <div><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" /><span className={styles.flowIdentityDivider} aria-hidden="true" /><span><strong>Meridian Foods</strong><small>Human judgment</small></span></div>
        <button ref={closeRef} type="button" aria-label="Close judgment" onClick={onClose}><Icon name="close" size={editorial ? "sm" : "md"} /></button>
      </header>
      <main className={styles.judgmentScroll}>
        <div className={`${styles.flowContent} ${styles.judgmentContent}`} data-layout={layout} data-presentation={presentation}>
          <div className={styles.flowTitle}><span>Analyst judgment</span><h1 id="judgment-title">Record analyst judgment</h1><p>{editorial ? `Choose the accountable outcome for ${finding.title.toLowerCase()}. The system analysis remains attached as read-only support.` : `Choose an outcome for ${finding.title.toLowerCase()} and add a concise reason.`}</p></div>
          {!editorial && <div className={styles.judgmentContext} data-tone={decision === "escalate" ? "warning" : "info"} role="status">
            <Icon name={decision === "escalate" ? "alertCircle" : "checkCircle"} size="sm" />
            <span><strong>{contextTitle}</strong><small>{contextDescription}</small></span>
          </div>}
          <fieldset className={styles.judgmentOptions} data-presentation={editorial ? "editorial" : "standard"}>
            {editorial
              ? <><legend className={styles.editorialControlLegend}>Decision</legend><div className={styles.editorialControlHeader} aria-hidden="true"><span>Decision</span><small>Required</small></div></>
              : <legend><span>Decision</span></legend>}
            <div className={styles.judgmentOptionTrack}>
              {judgmentOptions.map((option) => (
                <label key={option.value} data-selected={decision === option.value}>
                  <input type="radio" name="judgment-decision" value={option.value} checked={decision === option.value} onChange={() => selectDecision(option.value)} onKeyDown={(event) => handleRadioArrow(event, judgmentOptions, option.value, selectDecision)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {editorial
              ? <p className={styles.editorialDecisionHint} aria-live="polite">{selectedDecision?.description ?? "Select how this finding should move forward."}</p>
              : selectedDecision && <p className={styles.decisionHint}>{selectedDecision.description}</p>}
          </fieldset>
          {decision === "revise" && (
            <div className={styles.revisionFields}>
              <RiskDecisionCard currentRisk={currentRisk} revisedRisk={revisedRisk} onChange={setRevisedRisk} layout={layout} language={language} />
              <label className={`${styles.field} ${editorial ? styles.editorialConclusionField : ""}`}>
                <span id="revised-conclusion-title">Analyst conclusion <small>{editorial ? "Required" : "Required · Used in recommendation"}</small></span>
                {editorial && <small className={styles.editorialConclusionHint}>State the conclusion that should carry into the recommendation.</small>}
                <textarea value={rationale} placeholder="State the conclusion senior reviewers should rely on..." onChange={(event) => setRationale(event.target.value)} />
              </label>
            </div>
          )}
          {editorial && (decision === "accept" || decision === "escalate") && (
            <div className={styles.editorialDecisionBaseline} data-decision={decision}>
              <span aria-hidden="true"><Icon name={decision === "escalate" ? "alertCircle" : "lock"} size="sm" /></span>
              <span><small>{attributableLanguage ? "System assessment" : "AI assessment"}</small><strong>{currentRisk} risk</strong></span>
              <StatusPill tone={decision === "escalate" ? "warning" : "neutral"}>{decision === "escalate" ? "Carry to senior review" : "Adopt as analyst judgment"}</StatusPill>
            </div>
          )}
          {decision && decision !== "revise" && <label className={styles.field}><span>{editorial ? rationaleLabel : "Reason for judgment"} <small>Required</small></span><textarea value={rationale} placeholder={editorial ? rationalePlaceholder : "Summarize the evidence and reasoning..."} onChange={(event) => setRationale(event.target.value)} /></label>}
          <p className={styles.judgmentAttribution}><span>Recorded by</span><strong>Alex Kim · Credit analyst</strong><small>On submission</small></p>
        </div>
      </main>
      <footer className={`${styles.flowFooter} ${styles.judgmentFooter}`} data-presentation={presentation}>
        <div className={styles.flowFooterInner}>
          <div className={styles.flowFooterStart}><Button size="lg" variant="secondary" onClick={onClose}>Cancel</Button></div>
          <div className={styles.flowFooterEnd}><Button size="lg" variant="primary" disabled={!decision || !rationale.trim() || !revisionComplete} onClick={submitJudgment}>{submitLabel}</Button></div>
        </div>
      </footer>
    </section>
  );
}
