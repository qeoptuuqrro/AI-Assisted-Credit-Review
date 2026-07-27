import { useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { DocumentRow } from "../../../shared/ui/DocumentRow/DocumentRow";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { Panel } from "../../../shared/ui/Panel/Panel";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { CreditFindingsWorkspace, type CreditFindingGroup } from "../findings/CreditFindingsWorkspace";
import { findings, sources, type FindingDefinition, type FindingId, type FindingWorkflowState, type SourceReviewState } from "./meridianData";
import { getSourceReviewPresentation } from "./sourceReviewData";
import { AssessmentFlowV2 } from "./AssessmentFlowV2";
import { evidenceRequirements, findingRequirementIds, type EvidenceIntakeState, type EvidenceRequestRecord, type EvidenceRequirementId } from "../workflow/evidenceWorkflow";
import { currentJudgmentForFinding, isFindingAddressed, type JudgmentRecord } from "../workflow/creditReviewState";
import { getCreditFindingIcon, getCreditSourceIcon } from "../creditReviewPresentation";
import { getFindingDisplayRisk, getFindingDisplaySummary, getFindingScanSummary, getFindingStatusPresentation } from "./findingJudgmentPresentation";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import styles from "./MeridianReviewWorkspace.module.css";

type FindingsTabProps = {
  variant?: "inline-dossier" | "focused-reassessment" | "insight-led-reassessment" | "breathable-judgment-reassessment" | "attributable-analysis-reassessment" | "attributable-insight-brief";
  activeFindingId: FindingId | null;
  findingStates: Record<FindingId, FindingWorkflowState>;
  sourceReviewStates: Record<string, SourceReviewState>;
  evidenceStates: Record<EvidenceRequirementId, EvidenceIntakeState>;
  reassessedFindings: Record<FindingId, boolean>;
  judgments: JudgmentRecord[];
  learningMode: boolean;
  renewalLinked: boolean;
  concentrationReassessed: boolean;
  onOpenFinding: (id: FindingId) => void;
  onBack: () => void;
  onLinkRenewal: () => void;
  onUploadEvidence: (id: FindingId, file: File) => void;
  onRequestEvidence: (id: FindingId, request: EvidenceRequestRecord) => void;
  onRejectEvidence: (id: FindingId, message: string) => void;
  onUseExistingEvidence: (id: FindingId) => void;
  onResetEvidence: (id: FindingId) => void;
  onVerifyEvidence: (id: FindingId) => void;
  onReassess: (id: FindingId) => void;
  onRecordJudgment: (id: FindingId, judgment: Omit<JudgmentRecord, "findingId" | "createdAt" | "author" | "reassessmentId">) => void;
  onOpenSource: (sourceId?: string, fromFindingId?: FindingId) => void;
};

type FindingStage = "assessment" | "evidence" | "judgment";

const findingStages = [
  { id: "assessment", label: "Assessment" },
  { id: "evidence", label: "Evidence" },
  { id: "judgment", label: "Judgment" },
] satisfies Array<{ id: FindingStage; label: string }>;

export function FindingsTab(props: FindingsTabProps) {
  if (props.activeFindingId) {
    const finding = findings.find((item) => item.id === props.activeFindingId);
    if (finding && props.variant === "inline-dossier") return <FindingInvestigationV1 key={finding.id} finding={finding} {...props} />;
    if (finding) {
      return (
        <AssessmentFlowV2
          key={finding.id}
          finding={finding}
          state={props.findingStates[finding.id]}
          sourceReviewStates={props.sourceReviewStates}
          evidenceState={props.evidenceStates[findingRequirementIds[finding.id]]}
          reassessed={props.reassessedFindings[finding.id]}
          judgment={currentJudgmentForFinding(props.judgments, finding.id)}
          layout={props.variant === "insight-led-reassessment" || props.variant === "attributable-insight-brief" ? "insight-led" : "focused"}
          judgmentLayout={props.variant === "breathable-judgment-reassessment" || props.variant === "attributable-analysis-reassessment" || props.variant === "attributable-insight-brief" ? "breathable" : "compact"}
          language={props.variant === "attributable-analysis-reassessment" || props.variant === "attributable-insight-brief" ? "attributable" : "ai-explicit"}
          learningMode={props.learningMode}
          onBack={props.onBack}
          onUploadEvidence={(file) => props.onUploadEvidence(finding.id, file)}
          onRequestEvidence={(request) => props.onRequestEvidence(finding.id, request)}
          onRejectEvidence={(message) => props.onRejectEvidence(finding.id, message)}
          onUseExistingEvidence={() => props.onUseExistingEvidence(finding.id)}
          onResetEvidence={() => props.onResetEvidence(finding.id)}
          onVerifyEvidence={() => props.onVerifyEvidence(finding.id)}
          onReassess={() => props.onReassess(finding.id)}
          onRecordJudgment={(judgment) => props.onRecordJudgment(finding.id, judgment)}
          onOpenSource={props.onOpenSource}
        />
      );
    }
  }

  return <FindingsOverview {...props} />;
}

function FindingsOverview(props: FindingsTabProps) {
  const learn = (topicId: "findings-overview-story" | "findings-ledger" | "findings-preview") => getLearningTargetProps(props.learningMode, topicId);
  const unresolved = findings.filter((finding) => !isFindingAddressed(props.findingStates[finding.id]));
  const complete = findings.filter((finding) => isFindingAddressed(props.findingStates[finding.id]));
  const [selectedId, setSelectedId] = useState<FindingId>(unresolved[0]?.id ?? complete[0]?.id ?? findings[0].id);
  const selectedFinding = findings.find((finding) => finding.id === selectedId) ?? findings[0];
  const selectedState = props.findingStates[selectedFinding.id];
  const selectedJudgment = currentJudgmentForFinding(props.judgments, selectedFinding.id);
  const selectedPresentation = getFindingStatusPresentation(selectedState, selectedJudgment);
  const selectedRisk = getFindingDisplayRisk(selectedFinding, props.reassessedFindings[selectedFinding.id], selectedJudgment);
  const selectedSummary = getFindingDisplaySummary(selectedFinding, props.reassessedFindings[selectedFinding.id], selectedJudgment);
  const groups: CreditFindingGroup[] = [
    { title: "Open findings", items: unresolved.map((finding) => toWorkspaceItem(finding, props)) },
    ...(complete.length > 0 ? [{ title: "Addressed findings", items: complete.map((finding) => toWorkspaceItem(finding, props)) }] : []),
  ];

  return (
    <div className={styles.tabStack}>
      <div {...learn("findings-overview-story")}><SectionHeader title="Review findings" description="Select a finding to inspect the key evidence before recording your judgment." /></div>
      <div {...learn("findings-ledger")}>
        <CreditFindingsWorkspace groups={groups} selectedId={selectedId} onSelect={(id) => setSelectedId(id as FindingId)} previewLabel={`${selectedFinding.title} preview`}>
        <div className={styles.findingPreview} {...learn("findings-preview")}>
          <div className={styles.findingPreviewTopline}>
            <span className={selectedRisk === "Material" ? styles.riskMaterialText : styles.riskModerateText}>{selectedRisk} risk</span>
            <StatusPill tone={selectedPresentation.tone}>{selectedPresentation.label}</StatusPill>
          </div>
          <div className={styles.findingPreviewHeading}>
            <div>
              <h2>{selectedFinding.title}</h2>
              <p>{selectedSummary}</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => props.onOpenFinding(selectedFinding.id)}>
              {isFindingAddressed(selectedState) ? "View judgment" : "Review finding"}
            </Button>
          </div>
          <FindingEvidenceArtifact findingId={selectedFinding.id} reassessed={props.reassessedFindings[selectedFinding.id]} compact />
          <div className={styles.findingPreviewReason}>
            <span>Why it matters</span>
            <p>{selectedFinding.whyItMatters}</p>
          </div>
          <footer>
            <Button
              className={styles.findingPreviewSourceButton}
              size="sm"
              variant="quiet"
              iconPosition="start"
              icon={<Icon name="document" size="sm" />}
              onClick={() => props.onOpenSource(selectedFinding.sourceIds[0], selectedFinding.id)}
            >
              View {selectedFinding.sourceIds.length} sources
            </Button>
          </footer>
        </div>
        </CreditFindingsWorkspace>
      </div>
    </div>
  );
}

function toWorkspaceItem(finding: FindingDefinition, props: Pick<FindingsTabProps, "findingStates" | "reassessedFindings" | "judgments">) {
  const judgment = currentJudgmentForFinding(props.judgments, finding.id);
  const risk = getFindingDisplayRisk(finding, props.reassessedFindings[finding.id], judgment);
  const presentation = getFindingStatusPresentation(props.findingStates[finding.id], judgment);
  return {
    id: finding.id,
    title: finding.title,
    summary: getFindingScanSummary(finding, props.reassessedFindings[finding.id]),
    icon: getCreditFindingIcon(finding),
    risk: { label: `${risk} risk`, level: risk.toLowerCase() as "material" | "moderate" },
    status: presentation,
  };
}

function FindingEvidenceArtifact({ findingId, reassessed = false, compact = false }: { findingId: FindingId; reassessed?: boolean; compact?: boolean }) {
  if (findingId === "customer-concentration") {
    return (
      <section className={`${styles.findingArtifact} ${compact ? styles.findingArtifactCompact : ""}`} aria-label="Revenue concentration: Customer A 36 percent, Customer B 25 percent, all other customers 39 percent">
        <header><span>Revenue concentration</span><strong>61% in top two</strong></header>
        <div className={styles.concentrationScale}>
          <div className={styles.concentrationBar} aria-hidden="true">
            <span data-customer="a" style={{ flexBasis: "36%" }} />
            <span data-customer="b" style={{ flexBasis: "25%" }} />
            <span data-customer="other" style={{ flexBasis: "39%" }} />
          </div>
          <span className={styles.concentrationThreshold} style={{ left: "50%" }}>50% monitoring threshold</span>
        </div>
        <dl className={styles.artifactLegend}>
          <div><dt><i data-customer="a" />Customer A</dt><dd>36%</dd></div>
          <div><dt><i data-customer="b" />Customer B</dt><dd>25%</dd></div>
          <div><dt><i data-customer="other" />All others</dt><dd>39%</dd></div>
        </dl>
      </section>
    );
  }

  const isMargin = findingId === "declining-margins";
  return (
    <section className={`${styles.findingArtifact} ${styles.trendArtifact} ${compact ? styles.findingArtifactCompact : ""}`} aria-label={isMargin ? "EBITDA margin declined from 14.2 percent to 9.1 percent" : `Debt to EBITDA increased from 2.6 times to ${reassessed ? "3.9" : "3.7"} times against a proposed maximum of 4.25 times`}>
      <header>
        <span>{isMargin ? "EBITDA margin" : "Debt / EBITDA"}</span>
        <strong>{isMargin ? "9.1%" : reassessed ? "3.9x" : "3.7x"}</strong>
      </header>
      <svg viewBox="0 0 240 92" role="img" aria-hidden="true">
        {!isMargin && <><line x1="8" y1="13" x2="232" y2="13" className={styles.artifactThresholdLine} /><text x="232" y="9" textAnchor="end">4.25x proposed maximum</text></>}
        <line x1="8" y1="70" x2="232" y2="70" className={styles.artifactGridLine} />
        <path d={isMargin ? "M8 20 L64 31 L120 44 L176 57 L232 66" : reassessed ? "M8 64 L64 55 L120 45 L176 33 L232 21" : "M8 64 L64 55 L120 45 L176 35 L232 25"} className={styles.artifactTrendLine} />
        {[8, 64, 120, 176, 232].map((x, index) => <circle key={x} cx={x} cy={isMargin ? [20, 31, 44, 57, 66][index] : reassessed ? [64, 55, 45, 33, 21][index] : [64, 55, 45, 35, 25][index]} r="2.5" className={styles.artifactTrendDot} />)}
        <text x="8" y="88">Q4 '24</text>
        <text x="232" y="88" textAnchor="end">Q2 '26</text>
      </svg>
      <footer><span>{isMargin ? "14.2% in Q4 '24" : "2.6x in Q4 '24"}</span><strong>{isMargin ? "−5.1 pts" : reassessed ? "+1.3x" : "+1.1x"}</strong></footer>
    </section>
  );
}

function FindingInvestigationV1({ finding, findingStates, sourceReviewStates = {}, renewalLinked, reassessedFindings, judgments, onBack, onLinkRenewal, onReassess, onRecordJudgment, onOpenSource }: FindingsTabProps & { finding: FindingDefinition }) {
  const [challenging, setChallenging] = useState(false);
  const [activeStage, setActiveStage] = useState<FindingStage>("assessment");
  const [note, setNote] = useState(finding.id === "customer-concentration" ? "Customer A executed a three-year renewal that is not included in the original source set." : "Relationship and operating context reviewed; retain this risk in the recommendation.");
  const state = findingStates[finding.id];
  const judgment = currentJudgmentForFinding(judgments, finding.id);
  const presentation = getFindingStatusPresentation(state, judgment);
  const reassessed = reassessedFindings[finding.id];
  const risk = getFindingDisplayRisk(finding, reassessed, judgment);
  const findingSources = finding.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean);

  function navigateToStage(stage: FindingStage) {
    setActiveStage(stage);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById(`${finding.id}-${stage}`)?.scrollIntoView({ behavior, block: "start" });
  }

  function beginChallenge() {
    setChallenging(true);
    setActiveStage("judgment");
  }

  return (
    <div className={styles.investigation}>
      <Button className={styles.inlineBack} variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="sm" />} onClick={onBack}>All findings</Button>
      <header className={styles.investigationHeader}>
        <div>
          <span>Finding review</span>
          <h2>{finding.title}</h2>
          <p>{finding.question}</p>
        </div>
        <div className={styles.investigationStatus}>
          <span className={risk === "Material" ? styles.riskMaterialText : styles.riskModerateText}>{risk} risk</span>
          <StatusPill tone={presentation.tone}>{presentation.label}</StatusPill>
        </div>
      </header>

      <nav className={styles.reviewNavigation} aria-label={`${finding.title} review sections`}>
        {findingStages.map((stage) => (
          <button
            type="button"
            key={stage.id}
            aria-pressed={(isFindingAddressed(state) ? "judgment" : activeStage) === stage.id}
            onClick={() => navigateToStage(stage.id)}
          >
            {stage.label}
          </button>
        ))}
      </nav>

      <div className={styles.investigationMain}>
        {reassessed && (
          <Panel className={styles.changeRecordPanel}>
            <header className={styles.changeRecordHeader}>
              <div><span>Assessment revised</span><h3>New evidence reduced the near-term risk</h3></div>
              <StatusPill tone="info">Change recorded</StatusPill>
            </header>
            <div className={styles.changeRecordSummary}>
              <div><span>Original</span><strong>Material risk</strong></div>
              <Icon name="arrowRight" size="sm" />
              <div><span>Revised</span><strong>Moderate risk</strong></div>
              <div><span>New evidence</span><strong>Renewal through Mar 2030</strong></div>
            </div>
            <div className={styles.changeRecordDetails}>
              <div><span>Changed</span><strong>Near-term expiration risk</strong><p>Customer A is contracted for three more years, so immediate revenue loss is no longer assumed.</p></div>
              <div><span>Unchanged</span><strong>Structural concentration</strong><p>Customer A remains 36% of revenue and the top two customers remain 61%; monitoring is still required.</p></div>
            </div>
            <footer><Icon name="checkCircle" size="sm" /> {isFindingAddressed(state) ? "Evidence added and analyst judgment recorded by Alex Kim" : "Evidence added by Alex Kim · Revised conclusion pending analyst acceptance"}</footer>
          </Panel>
        )}

        <Panel className={styles.findingDossier}>
          <section id={`${finding.id}-assessment`} className={styles.findingReviewSection}>
            <SectionHeader eyebrow={reassessed ? "Original assessment · preserved" : "Initial assessment"} title={finding.summary} description={finding.whyItMatters} />
            <FindingEvidenceArtifact findingId={finding.id} reassessed={reassessed} />

            <section className={styles.basisSection} aria-labelledby={`${finding.id}-basis-title`}>
              <SectionHeader headingId={`${finding.id}-basis-title`} title="Basis for assessment" description="The observations and assumptions behind this credit conclusion." />
              <div className={styles.basisLedger}>
                {finding.rationale.map((item, index) => (
                  <div key={item}>
                    <span>{item}</span>
                    <small>{index === 0 ? "Verified source" : index === 1 ? "Source interpretation" : "Modeled assumption"}</small>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.reviewContext}>
              <section>
                <SectionHeader title={finding.id === "customer-concentration" ? "Evidence gap" : finding.id === "increasing-leverage" ? "Evidence to verify" : "Key assumptions"} />
                <div className={styles.assumptionList}>{(finding.id === "customer-concentration" ? ["The original assessment relies on the March 2027 contract date.", "No renewal was available in the original source set."] : finding.assumptions).map((item) => <div key={item}><Icon name={finding.id === "declining-margins" ? "calculator" : "alertCircle"} size="sm" /><span>{item}</span></div>)}</div>
              </section>
              <section className={styles.conclusionChange}>
                <span>What could change the conclusion</span>
                <p>{finding.uncertainty}</p>
              </section>
            </div>
          </section>

          <section id={`${finding.id}-evidence`} className={styles.findingReviewSection}>
            <SectionHeader title="Evidence used" description={`${findingSources.length} sources cited in this finding.`} actions={<Button size="sm" variant="quiet" onClick={() => onOpenSource()}>View all sources</Button>} />
            <div className={styles.evidenceDocumentList}>
              {findingSources.map((source) => source && <DocumentRow key={source.id} name={source.name} meta={`${source.asOf} · ${getSourceReviewPresentation(source, sourceReviewStates[source.id], renewalLinked).label}`} icon={getCreditSourceIcon(source)} onOpen={() => onOpenSource(source.id)} />)}
            </div>
            <p className={styles.evidenceSummary}>{findingSources.length} citations resolve to source documents. {finding.id === "customer-concentration" ? "Contract duration remains the open evidence question." : finding.id === "increasing-leverage" ? "Equipment classification must be verified before completion." : "Pricing execution remains the key forward-looking assumption."}</p>
          </section>
        </Panel>

        <Panel id={`${finding.id}-judgment`} className={styles.investigationActions}>
            {isFindingAddressed(state) ? (
              <div className={styles.completedNotice}><Icon name={judgment?.decision === "escalate" ? "alertCircle" : "checkCircle"} size="sm" /><span><strong>{presentation.label}</strong><span>The analyst conclusion and supporting evidence are preserved in Activity.</span></span></div>
            ) : reassessed ? (
              <>
                <div><strong>Updated assessment is ready</strong><span>Accept the Moderate risk and carry monitoring conditions into the recommendation.</span></div>
                <Button variant="primary" onClick={() => onRecordJudgment(finding.id, { decision: "accept", rationale: "I reviewed the revised analysis, verified the material evidence change, and accept the conclusion for recommendation." })}>Continue to judgment</Button>
              </>
            ) : challenging ? (
              <div className={styles.challengeForm}>
                <label htmlFor={`${finding.id}-challenge`}>{finding.challengePrompt}</label>
                <textarea id={`${finding.id}-challenge`} value={note} onChange={(event) => setNote(event.target.value)} />
                {finding.id === "customer-concentration" && (
                  <div className={`${styles.linkedEvidence} ${renewalLinked ? styles.evidenceLinked : ""}`}>
                    <Icon name={renewalLinked ? "checkCircle" : "document"} size="sm" />
                    <span><strong>Customer A renewal agreement</strong><span>Executed Jul 18, 2026 · Extends term through Mar 2030</span></span>
                    {renewalLinked ? <StatusPill tone="success">Linked</StatusPill> : <Button size="sm" variant="secondary" onClick={onLinkRenewal}>Link evidence</Button>}
                  </div>
                )}
                <div className={styles.challengeActions}>
                  <Button variant="quiet" onClick={() => setChallenging(false)}>Cancel</Button>
                  {finding.id === "customer-concentration"
                    ? <Button variant="primary" disabled={!renewalLinked || !note.trim()} icon={<Icon name="refresh" size="xs" />} iconPosition="start" onClick={() => onReassess(finding.id)}>Reassess with evidence</Button>
                    : <Button variant="primary" disabled={!note.trim()} onClick={() => onRecordJudgment(finding.id, { decision: "revise", rationale: note, revisedConclusion: note, revisedRisk: risk })}>Save judgment</Button>}
                </div>
              </div>
            ) : (
              <>
                <div><strong>Record your judgment</strong><span>Agree with the assessment, or add context and evidence that changes it.</span></div>
                <div className={styles.actionButtons}>
                  <Button variant="secondary" onClick={beginChallenge}>Add context or evidence</Button>
                  <Button variant="primary" onClick={() => onRecordJudgment(finding.id, { decision: "accept", rationale: "I reviewed the cited evidence and assumptions and accept the initial conclusion." })}>Record judgment</Button>
                </div>
              </>
            )}
        </Panel>
      </div>
    </div>
  );
}
