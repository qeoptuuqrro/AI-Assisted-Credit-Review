import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { FileDropzone } from "../../../shared/ui/FileDropzone/FileDropzone";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { StatusPill, type StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { BorrowerContactSelector } from "../borrower-requests/BorrowerContactSelector";
import { meridianBorrowerContacts } from "../borrower-requests/borrowerContacts";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import {
  evidenceProvenanceLabel,
  evidenceRequirements,
  findingRequirementIds,
  type EvidenceIntakeState,
  type EvidenceRequestRecord,
} from "../workflow/evidenceWorkflow";
import { getSourceReviewPresentation } from "./sourceReviewData";
import {
  sources,
  type FindingDefinition,
  type FindingWorkflowState,
  type SourceReviewState,
} from "./meridianData";
import { isFindingAddressed, type JudgmentRecord } from "../workflow/creditReviewState";
import { companyLogoDomains } from "../companyLogos";
import {
  formatJudgmentTimestamp,
  getFindingDisplayRisk,
  getFindingStatusPresentation,
  getJudgmentPresentation,
} from "./findingJudgmentPresentation";
import { AssessmentChangeSummary } from "./AssessmentChangeSummary";
import { AssessmentInsightBrief } from "./AssessmentInsightBrief";
import styles from "./AssessmentFlowV2.module.css";

type AssessmentFlowV2Props = {
  finding: FindingDefinition;
  state: FindingWorkflowState;
  sourceReviewStates: Record<string, SourceReviewState>;
  evidenceState: EvidenceIntakeState;
  reassessed: boolean;
  judgment?: JudgmentRecord;
  layout?: "focused" | "insight-led";
  judgmentLayout?: "compact" | "breathable";
  language?: "ai-explicit" | "attributable";
  learningMode: boolean;
  onBack: () => void;
  onUploadEvidence: (file: File) => void;
  onRequestEvidence: (request: EvidenceRequestRecord) => void;
  onRejectEvidence: (message: string) => void;
  onUseExistingEvidence: () => void;
  onResetEvidence: () => void;
  onVerifyEvidence: () => void;
  onReassess: () => void;
  onRecordJudgment: (judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) => void;
  onOpenSource: (sourceId?: string) => void;
};

type ReassessmentStage = "evidence" | "recipient" | "request-review" | "review" | "processing" | "result";

const reassessmentTiming = {
  metricsComplete: 2100,
  comparisonComplete: 4000,
  resultReady: 5400,
} as const;

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
  layout?: "compact" | "breathable";
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
                  <input type="radio" name="revised-risk" value={riskOption.value} checked={revisedRisk === riskOption.value} onChange={() => onChange(riskOption.value)} />
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
                <input type="radio" name="revised-risk" value={riskOption.value} checked={revisedRisk === riskOption.value} onChange={() => onChange(riskOption.value)} />
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
  learningMode,
  onBack,
  onUploadEvidence,
  onRequestEvidence,
  onRejectEvidence,
  onUseExistingEvidence,
  onResetEvidence,
  onVerifyEvidence,
  onReassess,
  onRecordJudgment,
  onOpenSource,
}: AssessmentFlowV2Props) {
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowInitialStage, setFlowInitialStage] = useState<"evidence" | "review">("evidence");
  const [judgmentOpen, setJudgmentOpen] = useState(false);
  const requirement = evidenceRequirements[findingRequirementIds[finding.id]];
  const risk = getFindingDisplayRisk(finding, reassessed, judgment);
  const presentation = getFindingStatusPresentation(state, judgment);
  const judgmentPresentation = judgment ? getJudgmentPresentation(judgment) : undefined;
  const attributableLanguage = language === "attributable";
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

  function openEvidenceFlow(initialStage: "evidence" | "review" = "evidence") {
    if (initialStage === "review" && hasExistingEvidence && !evidenceReadyForReview) onUseExistingEvidence();
    setFlowInitialStage(initialStage);
    setFlowOpen(true);
  }

  return (
    <div className={styles.page}>
      <Button className={styles.back} variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="sm" />} onClick={onBack}>All findings</Button>

      <header className={styles.header} {...getLearningTargetProps(learningMode, "finding-page-story")}>
        <div><span>Finding review</span><h1>{finding.title}</h1><p>{finding.question}</p></div>
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

      {reassessed && layout !== "insight-led" && <AssessmentChangeSummary result={requirement.result} presentation="detail-v2" />}

      {layout !== "insight-led" && <section className={styles.summaryGrid} aria-label="Assessment summary">
        <article className={styles.assessmentPanel} {...getLearningTargetProps(learningMode, "finding-initial-assessment")}>
          <span>{assessmentLabel}</span>
          <div className={styles.assessmentValue}><strong data-risk={risk.toLowerCase()}>{risk}</strong><small>risk</small></div>
          <p>{assessmentDescription}</p>
          <dl>
            {finding.summaryFacts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd className={fact.label === "Top-two revenue" ? styles.factValueAttention : ""}>{getFactValue(finding, fact, reassessed)}</dd></div>
            ))}
          </dl>
        </article>

        <FindingSignal finding={finding} reassessed={reassessed} />
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

      {!reassessed && !judgment && (
        <div {...getLearningTargetProps(learningMode, "finding-evidence-update")}>
          <Notice
            title={evidenceNoticeTitle}
            action={<Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => openEvidenceFlow(evidenceReadyForReview || (hasExistingEvidence && !evidenceRequested) ? "review" : "evidence")}>{evidenceActionLabel}</Button>}
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

      <section className={styles.flatSection} aria-labelledby="assessment-evidence-title" {...getLearningTargetProps(learningMode, "finding-source-set")}>
        <header><div><h2 id="assessment-evidence-title">Evidence reviewed</h2><p>{citedSources.length} sources support this assessment.</p></div><Button size="sm" variant="quiet" onClick={() => onOpenSource()}>View source package</Button></header>
        <div className={styles.evidenceLedger}>
          {citedSources.map((source) => source && (
            <button type="button" key={source.id} aria-label={`Open ${source.name} (${source.format})`} onClick={() => onOpenSource(source.id)}>
              <IconTile><Icon name="document" size="sm" /></IconTile>
              <span><strong>{source.name}</strong><small>{source.asOf} · {getSourceReviewPresentation(source, sourceReviewStates[source.id], renewalLinked).label}</small></span>
              <Icon name="chevronRight" size="sm" />
            </button>
          ))}
        </div>
      </section>

      {!isFindingAddressed(state) && (
        <footer className={styles.judgmentBar} {...getLearningTargetProps(learningMode, "finding-judgment")}>
          {reassessed ? (
          <><div><strong>Human judgment is still required</strong><span>Review the verified change, then take responsibility for the conclusion.</span></div><Button variant="primary" onClick={() => setJudgmentOpen(true)}>Record judgment</Button></>
          ) : state === "needs_verification" ? (
          <><div><strong>Resolve verification before judgment</strong><span>The open evidence requirement must be verified before this finding can be completed.</span></div><Button variant="primary" onClick={() => openEvidenceFlow()}>Add verification evidence</Button></>
          ) : (
          <><div><strong>Record your judgment</strong><span>Agree with the view, or add material evidence and rerun only the affected analysis.</span></div><div className={styles.actions}><Button variant="secondary" onClick={() => openEvidenceFlow()}>Add context or evidence</Button><Button variant="primary" onClick={() => setJudgmentOpen(true)}>Record judgment</Button></div></>
          )}
        </footer>
      )}

      {flowOpen && (
        <ReassessmentFlow
          initialStage={flowInitialStage}
          finding={finding}
          evidenceState={evidenceState}
          onUploadEvidence={onUploadEvidence}
          onRequestEvidence={onRequestEvidence}
          onRejectEvidence={onRejectEvidence}
          onUseExistingEvidence={onUseExistingEvidence}
          onOpenSource={onOpenSource}
          onResetEvidence={onResetEvidence}
          onVerifyEvidence={onVerifyEvidence}
          onReassess={onReassess}
          language={language}
          onClose={() => setFlowOpen(false)}
          onContinueToJudgment={() => {
            setFlowOpen(false);
            setJudgmentOpen(true);
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

function FindingSignal({ finding, reassessed }: { finding: FindingDefinition; reassessed: boolean }) {
  if (finding.id === "declining-margins") {
    return (
      <article className={styles.signalPanel}>
        <header><span>Operating pressure</span><strong>Material</strong></header>
        <div className={styles.signalComparison}>
          <div><span>EBITDA margin</span><strong>14.2%</strong><Icon name="arrowRight" size="xs" /><strong data-negative="true">9.1%</strong></div>
          <div><span>Downside coverage</span><strong data-negative="true">1.12x</strong><small>vs 1.20x floor</small></div>
        </div>
        <footer><span>{finding.whyItMatters}</span></footer>
      </article>
    );
  }

  if (finding.id === "increasing-leverage") {
    return (
      <article className={styles.signalPanel}>
        <header><span>Debt / EBITDA</span><strong>{reassessed ? "3.9x" : "3.7x"}</strong></header>
        <div className={styles.signalComparison}>
          <div><span>Equipment obligation</span><strong>{reassessed ? "Funded debt" : "$2.1M pending"}</strong></div>
          <div><span>Covenant headroom</span><strong>{reassessed ? "0.35x" : "0.55x"}</strong><small>to 4.25x maximum</small></div>
        </div>
        <footer><span>{finding.whyItMatters}</span></footer>
      </article>
    );
  }

  return (
    <article className={styles.portfolioPanel} aria-label="Revenue portfolio: Customer A 36 percent, Customer B 25 percent, all other customers 39 percent">
      <header><span>Revenue portfolio</span><strong>61% top two</strong></header>
      <div className={styles.portfolioBody}>
        <div className={styles.donut} data-reassessed={reassessed} aria-hidden="true" />
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

function ReassessmentFlow({ initialStage, finding, evidenceState, language, onUploadEvidence, onRequestEvidence, onRejectEvidence, onUseExistingEvidence, onOpenSource, onResetEvidence, onVerifyEvidence, onReassess, onClose, onContinueToJudgment }: {
  initialStage: "evidence" | "review";
  finding: FindingDefinition;
  evidenceState: EvidenceIntakeState;
  language: NonNullable<AssessmentFlowV2Props["language"]>;
  onUploadEvidence: (file: File) => void;
  onRequestEvidence: (request: EvidenceRequestRecord) => void;
  onRejectEvidence: (message: string) => void;
  onUseExistingEvidence: () => void;
  onOpenSource: (sourceId?: string) => void;
  onResetEvidence: () => void;
  onVerifyEvidence: () => void;
  onReassess: () => void;
  onClose: () => void;
  onContinueToJudgment: () => void;
}) {
  const [stage, setStage] = useState<ReassessmentStage>(initialStage);
  const requirement = evidenceRequirements[findingRequirementIds[finding.id]];
  const previewInitialRisk = requirement.result.initialRisk ?? finding.initialRisk;
  const previewUpdatedRisk = requirement.result.updatedRisk ?? finding.initialRisk;
  const existingSource = requirement.existingSource;
  const hasExistingEvidence = Boolean(existingSource);
  const reviewingMatchedEvidence = evidenceState.provenance === "existing-source";
  const [note, setNote] = useState(requirement.initialContext);
  const [selectedContactId, setSelectedContactId] = useState(meridianBorrowerContacts.find((contact) => contact.primary)?.id ?? meridianBorrowerContacts[0].id);
  const [requestDueDate, setRequestDueDate] = useState("Aug 5, 2026");
  const initialContact = meridianBorrowerContacts.find((contact) => contact.id === selectedContactId) ?? meridianBorrowerContacts[0];
  const initialRequestMessage = `Hi ${initialContact.name.split(" ")[0]} — please provide ${requirement.title.toLowerCase()} for Meridian Foods' credit review.`;
  const [requestMessage, setRequestMessage] = useState(initialRequestMessage);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [processingStep, setProcessingStep] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const processingTimerRefs = useRef<number[]>([]);
  const canContinue = evidenceState.status === "ready-for-review" || evidenceState.status === "verified";
  const requestIsActive = evidenceState.status === "requested" && Boolean(evidenceState.request);
  const uploadStatus = evidenceState.status === "requested" ? "idle" : evidenceState.status;
  const selectedContact = meridianBorrowerContacts.find((contact) => contact.id === selectedContactId) ?? meridianBorrowerContacts[0];
  const attributableLanguage = language === "attributable";

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

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, stage]);

  useEffect(() => () => {
    processingTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function runReassessment() {
    if (stage !== "review") return;
    onVerifyEvidence();
    setProcessingStep(0);
    setStage("processing");
    processingTimerRefs.current = [
      window.setTimeout(() => setProcessingStep(1), reassessmentTiming.metricsComplete),
      window.setTimeout(() => setProcessingStep(2), reassessmentTiming.comparisonComplete),
      window.setTimeout(() => {
        processingTimerRefs.current = [];
        onReassess();
        setStage("result");
      }, reassessmentTiming.resultReady),
    ];
  }

  const requestMode = stage === "recipient" || stage === "request-review";
  const stageOrder: Array<{ id: ReassessmentStage; label: string }> = requestMode
    ? [{ id: "evidence", label: "Evidence" }, { id: "recipient", label: "Recipient" }, { id: "request-review", label: "Review" }]
    : [{ id: "evidence", label: "Evidence" }, { id: "review", label: "Review" }, { id: "result", label: "Result" }];
  const visualStage = stage === "processing" ? "review" : stage;

  return (
    <section className={styles.flowOverlay} role="dialog" aria-modal="true" aria-labelledby="reassessment-flow-title">
      <header className={styles.flowHeader}>
        <div><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" /><span><strong>Meridian Foods</strong><small>{finding.title} reassessment</small></span></div>
        <button ref={closeRef} type="button" aria-label="Close reassessment" onClick={onClose}><Icon name="close" size="sm" /></button>
      </header>

      <div className={styles.flowLayout} data-stage={stage}>
        <nav className={styles.flowSteps} aria-label="Reassessment steps">
          {stageOrder.map((item, index) => {
            const activeIndex = stageOrder.findIndex((candidate) => candidate.id === visualStage);
            return <span key={item.id} data-active={item.id === visualStage} data-complete={index < activeIndex}><i>{index < activeIndex ? <Icon name="check" size="xs" /> : index + 1}</i>{item.label}</span>;
          })}
        </nav>

        <main className={styles.flowContent}>
          {stage === "evidence" && (
            <>
              <div className={styles.flowTitle}><span>Evidence</span><h1 id="reassessment-flow-title">{requestIsActive ? "Evidence request is active" : hasExistingEvidence ? "Choose or add evidence" : "Add evidence for reassessment"}</h1><p>{requestIsActive ? "Track the borrower request or upload a file received through another channel." : hasExistingEvidence ? "We found a likely match. Use it, upload a replacement, or ask the borrower for a new document." : "Upload a newer source or request it from a borrower contact. Context cannot replace verification."}</p></div>
              <Notice title="Why this evidence matters">{requirement.currentAssumption}</Notice>
              <section className={styles.requirementCard} aria-labelledby="evidence-requirement-title">
                <header><span><strong id="evidence-requirement-title">{requirement.title}</strong><small>{requirement.description}</small></span><StatusPill tone={evidenceState.status === "verified" ? "success" : ["ready-for-review", "requested"].includes(evidenceState.status) ? "info" : "warning"}>{evidenceState.status === "verified" ? "Verified" : evidenceState.status === "ready-for-review" ? "Ready for review" : evidenceState.status === "requested" ? "Requested" : "Required"}</StatusPill></header>
                {requestIsActive && evidenceState.request && <Notice title={`Requested from ${evidenceState.request.recipientName}`}>{evidenceState.request.recipientRole} · Due {evidenceState.request.dueDate}{evidenceState.request.remindersEnabled ? " · Automatic reminders on" : ""}</Notice>}
                {requirement.existingSource && evidenceState.status === "idle" && (
                  <div className={styles.existingEvidenceRow}>
                    <button className={styles.existingEvidence} type="button" onClick={onUseExistingEvidence}>
                      <IconTile><Icon name="document" size="sm" /></IconTile><span><strong>{requirement.existingSource.fileName}</strong><small>{requirement.existingSource.detail}</small><em>Likely match for the open contract assumption</em></span><span>Use this renewal</span>
                    </button>
                    <Button className={styles.viewEvidence} size="sm" variant="quiet" icon={<Icon name="document" size="xs" />} iconPosition="start" onClick={() => onOpenSource("customer-a-renewal")}>View document</Button>
                  </div>
                )}
                {requirement.existingSource && evidenceState.status === "idle" && <div className={styles.orDivider}><span>or upload a different document</span></div>}
                <FileDropzone status={uploadStatus} fileName={evidenceState.fileName} error={evidenceState.error} acceptedFormats={requirement.acceptedFormats} onFileAccepted={onUploadEvidence} onFileRejected={onRejectEvidence} onRemove={onResetEvidence} />
                {!requestIsActive && !canContinue && <><div className={styles.orDivider}><span>or request it from the company</span></div><button className={styles.requestEvidence} type="button" onClick={() => setStage("recipient")}><IconTile tone="info"><Icon name="users" size="sm" /></IconTile><span><strong>Request from borrower</strong><small>Select a Meridian Foods contact, due date, and reminders.</small></span><Icon name="chevronRight" size="sm" /></button></>}
              </section>
              <label className={styles.field}><span>{requirement.analystContextLabel} <small>Optional</small></span><textarea value={note} placeholder={requirement.analystContextPlaceholder} onChange={(event) => setNote(event.target.value)} /></label>
            </>
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
          )}

          {stage === "processing" && (
            <div className={styles.processing} role="status" aria-live="polite">
              <span className={styles.processingMark} aria-hidden="true"><Icon name="spark" size="md" /></span>
              <div className={styles.flowTitle}><span>{attributableLanguage ? "Automated analysis" : "AI reassessment"}</span><h1 id="reassessment-flow-title">{attributableLanguage ? "Updating this finding" : "AI is reassessing this finding"}</h1><p>The verified evidence is being applied in the background to the scoped calculation. Unrelated findings and the final credit decision remain unchanged.</p></div>
              <div className={styles.processingSteps} aria-label="Reassessment progress">
                <span data-state="complete"><i><Icon name="check" size="xs" /></i>Evidence verified</span>
                <span data-state={processingStep >= 1 ? "complete" : "active"}><i><Icon name={processingStep >= 1 ? "check" : "spark"} size="xs" /></i>Recomputing the affected metrics</span>
                <span data-state={processingStep >= 2 ? "complete" : processingStep >= 1 ? "active" : "pending"}><i><Icon name={processingStep >= 2 ? "check" : "spark"} size="xs" /></i>Comparing changed and unchanged conclusions</span>
              </div>
            </div>
          )}

          {stage === "result" && (
            <>
              <div className={styles.flowTitle}><span>Result</span><h1 id="reassessment-flow-title">{requirement.result.title}</h1><p>{requirement.result.description}</p></div>
              <div className={styles.resultInterpretation}><span>In plain language</span><p>{requirement.result.explanation}</p></div>
              <AssessmentChangeSummary result={requirement.result} context="flow" presentation="ledger-v1" />
            </>
          )}
        </main>
      </div>

      <footer className={styles.flowFooter}>
        <div className={styles.flowFooterInner}>
          <div className={styles.flowFooterStart}>
            {stage === "evidence" && <Button variant="secondary" onClick={onClose}>Cancel</Button>}
            {stage === "recipient" && <Button variant="secondary" onClick={() => setStage("evidence")}>Back</Button>}
            {stage === "request-review" && <Button variant="secondary" onClick={() => setStage("recipient")}>Back</Button>}
            {stage === "review" && <Button variant="secondary" onClick={() => { if (reviewingMatchedEvidence) onResetEvidence(); setStage("evidence"); }}>{reviewingMatchedEvidence ? "Choose another file" : "Back"}</Button>}
            {stage === "result" && <Button variant="secondary" onClick={onClose}>Back to finding</Button>}
          </div>
          {stage === "processing" && <span className={styles.flowStatus}><Icon name="spark" size="xs" />{attributableLanguage ? "Analysis in progress…" : "AI reassessment in progress…"}</span>}
          <div className={styles.flowFooterEnd}>
            {stage === "evidence" && <Button variant="primary" disabled={!canContinue} icon={<Icon name="arrowRight" size="xs" />} onClick={() => setStage("review")}>Review</Button>}
            {stage === "recipient" && <Button variant="primary" disabled={!requestDueDate.trim()} onClick={() => setStage("request-review")}>Review request</Button>}
            {stage === "request-review" && <Button variant="primary" onClick={sendEvidenceRequest}>Send request</Button>}
            {stage === "review" && <Button variant="primary" disabled={!canContinue} icon={<Icon name="spark" size="xs" />} iconPosition="start" onClick={runReassessment}>{attributableLanguage ? "Verify & reassess" : "Verify & run AI reassessment"}</Button>}
            {stage === "result" && <Button variant="primary" onClick={onContinueToJudgment}>Continue to judgment</Button>}
          </div>
        </div>
      </footer>
    </section>
  );
}

function JudgmentDialog({ finding, reassessed, currentRisk, layout, language, onClose, onSubmit }: {
  finding: FindingDefinition;
  reassessed: boolean;
  currentRisk: NonNullable<JudgmentRecord["revisedRisk"]>;
  layout: "compact" | "breathable";
  language: NonNullable<AssessmentFlowV2Props["language"]>;
  onClose: () => void;
  onSubmit: (judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) => void;
}) {
  const [decision, setDecision] = useState<JudgmentRecord["decision"]>("accept");
  const [rationale, setRationale] = useState("");
  const [revisedRisk, setRevisedRisk] = useState<RevisionRisk>(currentRisk);
  const closeRef = useRef<HTMLButtonElement>(null);
  const revisionComplete = decision !== "revise" || Boolean(rationale.trim() && revisedRisk);
  const submitLabel = decision === "revise" ? "Record revision" : decision === "escalate" ? "Escalate finding" : "Record judgment";
  const selectedDecision = judgmentOptions.find((option) => option.value === decision) ?? judgmentOptions[0];
  const attributableLanguage = language === "attributable";
  const contextTitle = reassessed ? "Updated analysis reviewed" : "Initial assessment reviewed";
  const contextDescription = decision === "revise"
    ? attributableLanguage ? "Your analyst view becomes primary; the system analysis stays read-only." : "Your analyst view becomes primary; the AI analysis stays read-only."
    : decision === "escalate"
      ? "This finding stays open for senior credit judgment."
      : reassessed
        ? "Verified changes remain attached to this record."
        : "The cited analysis remains attached to this record.";

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <section className={styles.flowOverlay} role="dialog" aria-modal="true" aria-labelledby="judgment-title">
      <header className={styles.flowHeader}>
        <div><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" /><span><strong>Meridian Foods</strong><small>Human judgment</small></span></div>
        <button ref={closeRef} type="button" aria-label="Close judgment" onClick={onClose}><Icon name="close" size="md" /></button>
      </header>
      <main className={styles.judgmentScroll}>
        <div className={`${styles.flowContent} ${styles.judgmentContent}`} data-layout={layout}>
          <div className={styles.flowTitle}><span>Analyst judgment</span><h1 id="judgment-title">Record analyst judgment</h1><p>Choose an outcome for {finding.title.toLowerCase()} and add a concise reason.</p></div>
          <div className={styles.judgmentContext} data-tone={decision === "escalate" ? "warning" : "info"} role="status">
            <Icon name={decision === "escalate" ? "alertCircle" : "checkCircle"} size="sm" />
            <span><strong>{contextTitle}</strong><small>{contextDescription}</small></span>
          </div>
          <fieldset className={styles.judgmentOptions}>
            <legend>Decision</legend>
            <div className={styles.judgmentOptionTrack}>
              {judgmentOptions.map((option) => (
                <label key={option.value} data-selected={decision === option.value}>
                  <input type="radio" name="judgment-decision" value={option.value} checked={decision === option.value} onChange={() => setDecision(option.value)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <p className={styles.decisionHint}>{selectedDecision.description}</p>
          </fieldset>
          {decision === "revise" && (
            <section className={styles.revisionFields} aria-labelledby="revised-conclusion-title">
              <RiskDecisionCard currentRisk={currentRisk} revisedRisk={revisedRisk} onChange={setRevisedRisk} layout={layout} language={language} />
              <label className={styles.field}><span id="revised-conclusion-title">Analyst conclusion <small>Required · Used in recommendation</small></span><textarea value={rationale} placeholder="State the conclusion senior reviewers should rely on..." onChange={(event) => setRationale(event.target.value)} /></label>
            </section>
          )}
          {decision !== "revise" && <label className={styles.field}><span>Reason for judgment <small>Required</small></span><textarea value={rationale} placeholder="Summarize the evidence and reasoning..." onChange={(event) => setRationale(event.target.value)} /></label>}
          <p className={styles.judgmentAttribution}><span>Recorded by</span><strong>Alex Kim · Credit analyst</strong><small>On submission</small></p>
        </div>
      </main>
      <footer className={`${styles.flowFooter} ${styles.judgmentFooter}`}>
        <div className={styles.flowFooterInner}>
          <div className={styles.flowFooterStart}><Button variant="secondary" onClick={onClose}>Cancel</Button></div>
          <div className={styles.flowFooterEnd}><Button variant="primary" disabled={!rationale.trim() || !revisionComplete} onClick={() => onSubmit({ decision, rationale, revisedConclusion: decision === "revise" ? rationale : undefined, revisedRisk: decision === "revise" ? revisedRisk : undefined })}>{submitLabel}</Button></div>
        </div>
      </footer>
    </section>
  );
}
