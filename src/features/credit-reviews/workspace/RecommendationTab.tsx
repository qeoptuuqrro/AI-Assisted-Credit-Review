import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile, type IconTone } from "../../../shared/ui/IconTile/IconTile";
import { KeyValueGrid } from "../../../shared/ui/KeyValueGrid/KeyValueGrid";
import { Notice } from "../../../shared/ui/Notice/Notice";
import { Panel } from "../../../shared/ui/Panel/Panel";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { WorkflowSteps } from "../../../shared/ui/WorkflowSteps/WorkflowSteps";
import { findings, type FindingId, type FindingWorkflowState, type ReviewTab } from "./meridianData";
import {
  currentJudgmentForFinding,
  createInitialAnalystRecommendationDraft,
  createInitialSeniorDecisionDraft,
  isFindingAddressed,
  meridianDefaultConditions,
  seniorDecisionLabel,
  type AnalystRecommendationDraft,
  type AnalystRecommendationRecord,
  type JudgmentRecord,
  type RecommendationDraftSection,
  type SeniorDecisionDraft,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import { companyLogoDomains } from "../companyLogos";
import { getCreditFindingIcon } from "../creditReviewPresentation";
import { getFindingDisplayRisk, getFindingDisplaySummary, getFindingScanSummary, getFindingStatusPresentation } from "./findingJudgmentPresentation";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import { SeniorDecisionWorkspaceV5, SeniorDecisionWorkspaceV6, type SeniorReviewDecisionSignal } from "../senior/SeniorReviewPackage";
import styles from "./MeridianReviewWorkspace.module.css";

type RecommendationVariant = "credit-memo" | "open-canvas" | "icon-led" | "focused-lifecycle" | "full-screen-lifecycle";
type SeniorDecisionVariant = "dense-brief" | "focused-layer" | "full-screen-review" | "command-center" | "unified-brief" | "aligned-workflow";
type RecommendationRouteMode = "recommendation" | "recommendation-draft" | "senior-decision" | "senior-review";

type RecommendationTabProps = {
  variant?: RecommendationVariant;
  seniorVariant?: SeniorDecisionVariant;
  findingStates: Record<FindingId, FindingWorkflowState>;
  judgments: JudgmentRecord[];
  reassessedFindings: Record<FindingId, boolean>;
  recommendationDraft?: AnalystRecommendationDraft;
  recommendation?: AnalystRecommendationRecord;
  seniorDecisionDraft?: SeniorDecisionDraft;
  seniorDecision?: SeniorDecisionRecord;
  routeMode?: RecommendationRouteMode;
  onSaveDraft?: (draft: AnalystRecommendationDraft) => void;
  onSubmit: (record: Omit<AnalystRecommendationRecord, "author" | "createdAt">) => void;
  onSaveSeniorDraft?: (draft: SeniorDecisionDraft) => void;
  onSeniorDecision: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onStartRecommendation?: () => void;
  onExitRecommendation?: () => void;
  onOpenSeniorReview?: () => void;
  onExitSeniorReview?: () => void;
  onReopenReturnedRecommendation?: () => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode?: boolean;
  learningControl?: ReactNode;
};

const availableConditions = meridianDefaultConditions;

function getMeridianDecisionSignals(reassessedFindings: Record<FindingId, boolean>): SeniorReviewDecisionSignal[] {
  return [
    { label: "Top-two revenue", value: "61%", detail: "11 pts over threshold" },
    {
      label: "Pro forma leverage",
      value: reassessedFindings["increasing-leverage"] ? "3.9x" : "3.7x",
      detail: reassessedFindings["increasing-leverage"] ? "0.35x headroom" : "Before classification",
    },
    { label: "Fixed-charge coverage", value: "1.41x", detail: "0.21x headroom" },
  ];
}

const meridianSeniorReviewSummary = "The renewed Customer A contract lowers near-term expiration risk; margin pressure and leverage still require reporting and covenant protection.";

const recommendationOptions: Array<{
  value: string;
  label: string;
  description: string;
  icon: IconName;
  tone: IconTone;
}> = [
  { value: "Proceed with conditions", label: "Proceed with conditions", description: "Approve subject to the protections below", icon: "shield", tone: "info" },
  { value: "Proceed", label: "Proceed", description: "Approve without additional conditions", icon: "checkCircle", tone: "success" },
  { value: "Decline", label: "Decline", description: "Do not extend the requested facility", icon: "close", tone: "danger" },
  { value: "Escalate", label: "Escalate", description: "Request additional senior judgment", icon: "alertCircle", tone: "warning" },
];

const seniorDecisionOptions: Array<{
  value: SeniorDecisionRecord["decision"];
  label: string;
  description: string;
  icon: IconName;
  tone: IconTone;
}> = [
  { value: "approve", label: "Approve", description: "Accept the analyst recommendation as submitted", icon: "checkCircle", tone: "success" },
  { value: "approve_with_conditions", label: "Approve with conditions", description: "Approve and record the final protections", icon: "shield", tone: "info" },
  { value: "return_to_analyst", label: "Return to analyst", description: "Request a revised recommendation", icon: "arrowLeft", tone: "warning" },
  { value: "decline", label: "Decline", description: "Do not extend the requested facility", icon: "close", tone: "danger" },
];

const commandDecisionOptions: Array<{
  value: SeniorDecisionRecord["decision"];
  label: string;
  description: string;
  icon: IconName;
  tone: IconTone;
}> = [
  { value: "approve", label: "Approve", description: "Accept as submitted", icon: "checkCircle", tone: "success" },
  { value: "approve_with_conditions", label: "Approve with conditions", description: "Set the final protections", icon: "shield", tone: "info" },
  { value: "return_to_analyst", label: "Return to analyst", description: "Ask Alex for a revision", icon: "arrowLeft", tone: "warning" },
  { value: "decline", label: "Decline", description: "Do not extend the facility", icon: "close", tone: "danger" },
];

type FindingOutcome = {
  finding: (typeof findings)[number];
  state: FindingWorkflowState;
  judgment?: JudgmentRecord;
  presentation: ReturnType<typeof getFindingStatusPresentation>;
  risk: ReturnType<typeof getFindingDisplayRisk>;
  detail: string;
  scanDetail: string;
  shortStatus: string;
  icon: IconName;
  tone: IconTone;
};

export function RecommendationTab({ variant = "credit-memo", seniorVariant = "focused-layer", findingStates, judgments, reassessedFindings, recommendationDraft, recommendation, seniorDecisionDraft, seniorDecision, routeMode = "senior-decision", onSaveDraft, onSubmit, onSaveSeniorDraft, onSeniorDecision, onStartRecommendation, onExitRecommendation, onOpenSeniorReview, onExitSeniorReview, onReopenReturnedRecommendation, onNavigate, learningMode = false, learningControl }: RecommendationTabProps) {
  const outcomes: FindingOutcome[] = findings.map((finding) => {
    const state = findingStates[finding.id];
    const judgment = currentJudgmentForFinding(judgments, finding.id);
    const presentation = getFindingStatusPresentation(state, judgment);
    const risk = getFindingDisplayRisk(finding, reassessedFindings[finding.id], judgment);
    const detail = getFindingDisplaySummary(finding, reassessedFindings[finding.id], judgment);
    const scanDetail = getFindingScanSummary(finding, reassessedFindings[finding.id]);
    const shortStatus = judgment?.decision === "escalate" ? "Escalated" : judgment?.decision === "revise" ? "Revised" : "Accepted";
    const tone: IconTone = judgment?.decision === "escalate"
      ? "warning"
      : judgment?.decision === "revise"
        ? "info"
        : "success";
    return { finding, state, judgment, presentation, risk, detail, scanDetail, shortStatus, icon: getCreditFindingIcon(finding), tone };
  });
  const escalatedCount = outcomes.filter((outcome) => outcome.state === "escalated").length;
  const reviewReady = outcomes.every((outcome) => isFindingAddressed(outcome.state));
  const hasEscalation = escalatedCount > 0;
  const initialRecommendationDraft = recommendationDraft ?? createInitialAnalystRecommendationDraft(hasEscalation);
  const [decision, setDecision] = useState(initialRecommendationDraft.decision);
  const [amount, setAmount] = useState(initialRecommendationDraft.amount);
  const [rationale, setRationale] = useState(initialRecommendationDraft.rationale);
  const [conditions, setConditions] = useState<string[]>(initialRecommendationDraft.conditions);
  const [activeSection, setActiveSection] = useState<RecommendationDraftSection>(initialRecommendationDraft.activeSection);
  const persistsRecommendationDraft = variant === "full-screen-lifecycle" && routeMode === "recommendation-draft";

  useEffect(() => {
    if (!persistsRecommendationDraft || recommendationDraft || !onSaveDraft) return;
    onSaveDraft({ decision, amount, rationale, conditions, activeSection, updatedAt: new Date().toISOString() });
  }, [activeSection, amount, conditions, decision, onSaveDraft, persistsRecommendationDraft, rationale, recommendationDraft]);

  function persistRecommendationDraft(next: Partial<AnalystRecommendationDraft>) {
    if (!persistsRecommendationDraft || !onSaveDraft) return;
    onSaveDraft({ decision, amount, rationale, conditions, activeSection, ...next, updatedAt: new Date().toISOString() });
  }

  function updateDecision(value: string) {
    setDecision(value);
    persistRecommendationDraft({ decision: value });
  }

  function updateAmount(value: string) {
    setAmount(value);
    persistRecommendationDraft({ amount: value });
  }

  function updateRationale(value: string) {
    setRationale(value);
    persistRecommendationDraft({ rationale: value });
  }

  function updateActiveSection(value: RecommendationDraftSection) {
    setActiveSection(value);
    persistRecommendationDraft({ activeSection: value });
  }

  function toggleCondition(condition: string) {
    const next = conditions.includes(condition) ? conditions.filter((item) => item !== condition) : [...conditions, condition];
    setConditions(next);
    persistRecommendationDraft({ conditions: next });
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      decision,
      amount,
      rationale,
      conditions: decision === "Proceed with conditions" ? conditions : [],
    });
  }

  if (seniorDecision && recommendation && (seniorVariant === "unified-brief" || seniorVariant === "aligned-workflow") && routeMode === "senior-review") {
    const SeniorWorkspace = seniorVariant === "aligned-workflow" ? SeniorDecisionWorkspaceV6 : SeniorDecisionWorkspaceV5;
    return (
      <SeniorWorkspace
        company="Meridian Foods"
        logoDomain={companyLogoDomains["Meridian Foods"]}
        request="$18M working-capital line"
        facilityType="3-year revolver"
        decisionQuestion="Should Meridian Foods receive the $18M working-capital line?"
        reviewSummary={meridianSeniorReviewSummary}
        recommendation={recommendation}
        findings={outcomes.map((outcome) => ({
          id: outcome.finding.id,
          title: outcome.finding.title,
          detail: outcome.scanDetail,
          risk: outcome.risk,
          status: outcome.shortStatus,
          tone: outcome.presentation.tone,
          icon: outcome.icon,
        }))}
        decisionSignals={getMeridianDecisionSignals(reassessedFindings)}
        sourcesCount={12}
        existingDecision={seniorDecision}
        draft={seniorDecisionDraft}
        learningMode={learningMode}
        learningControl={learningControl}
        onDraftChange={onSaveSeniorDraft}
        onExit={onExitSeniorReview ?? (() => undefined)}
        onOpenRecord={onNavigate}
        onSubmit={onSeniorDecision}
      />
    );
  }

  if (seniorDecision && recommendation) {
    const returnedToAnalyst = seniorDecision.decision === "return_to_analyst";
    return (
      <div className={styles.submittedState} {...getLearningTargetProps(learningMode, "senior-decision-story")}>
        <span className={styles.submittedIcon}><Icon name={returnedToAnalyst ? "arrowLeft" : "checkCircle"} /></span>
        <StatusPill tone={returnedToAnalyst ? "warning" : "success"}>{returnedToAnalyst ? "Revision requested" : "Decision recorded"}</StatusPill>
        <h2>{seniorDecisionLabel(seniorDecision.decision)}</h2>
        <p>{returnedToAnalyst ? "Morgan Lee returned the recommendation with an attributable revision request. The submitted analyst record remains preserved." : "Morgan Lee’s decision is preserved separately from Alex Kim’s recommendation and the read-only AI assessment."}</p>
        <Panel className={styles.submittedSummary}>
          <KeyValueGrid columns={3} items={[
            { label: "Final decision", value: seniorDecisionLabel(seniorDecision.decision) },
            { label: "Decision maker", value: seniorDecision.decisionMaker },
            { label: "Recorded", value: new Date(seniorDecision.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) },
          ]} />
        </Panel>
        <div className={styles.finalDecisionDetails}>
          <Panel className={styles.decisionRationale}><span>Senior rationale</span><p>{seniorDecision.rationale || "The decision follows the submitted analyst recommendation and reviewed case record."}</p></Panel>
          {seniorDecision.conditions.length > 0 && <Panel className={styles.finalDecisionConditions}><span>Final approval conditions</span><ul>{seniorDecision.conditions.map((condition) => <li key={condition}><Icon name="check" size="xs" /> {condition}</li>)}</ul></Panel>}
        </div>
        <section className={styles.finalDecisionSource} aria-label="Original analyst recommendation" {...getLearningTargetProps(learningMode, "senior-recommendation")}>
          <span>Original analyst record</span>
          <strong>{recommendation.decision} · {recommendation.amount}</strong>
          <p>{recommendation.rationale}</p>
        </section>
        <div className={styles.submittedActions}>
          <Button variant="secondary" onClick={() => onNavigate("activity")}>View decision history</Button>
          {returnedToAnalyst && <Button variant="primary" onClick={onReopenReturnedRecommendation}>Revise recommendation</Button>}
        </div>
      </div>
    );
  }

  if (recommendation) {
    if ((seniorVariant === "unified-brief" || seniorVariant === "aligned-workflow") && routeMode === "senior-review") {
      const SeniorWorkspace = seniorVariant === "aligned-workflow" ? SeniorDecisionWorkspaceV6 : SeniorDecisionWorkspaceV5;
      return (
        <SeniorWorkspace
          company="Meridian Foods"
          logoDomain={companyLogoDomains["Meridian Foods"]}
          request="$18M working-capital line"
          facilityType="3-year revolver"
          decisionQuestion="Should Meridian Foods receive the $18M working-capital line?"
          reviewSummary={meridianSeniorReviewSummary}
          recommendation={recommendation}
          findings={outcomes.map((outcome) => ({
            id: outcome.finding.id,
            title: outcome.finding.title,
            detail: outcome.scanDetail,
            risk: outcome.risk,
            status: outcome.shortStatus,
            tone: outcome.presentation.tone,
            icon: outcome.icon,
          }))}
          decisionSignals={getMeridianDecisionSignals(reassessedFindings)}
          sourcesCount={12}
          draft={seniorDecisionDraft}
          learningMode={learningMode}
          learningControl={learningControl}
          onDraftChange={onSaveSeniorDraft}
          onExit={onExitSeniorReview ?? (() => undefined)}
          onOpenRecord={onNavigate}
          onSubmit={onSeniorDecision}
        />
      );
    }
    if (seniorVariant === "command-center" && routeMode === "senior-review") {
      return (
        <CommandCenterSeniorDecisionWorkspace
          recommendation={recommendation}
          outcomes={outcomes}
          draft={seniorDecisionDraft}
          onDraftChange={onSaveSeniorDraft}
          onExit={onExitSeniorReview}
          onSubmit={onSeniorDecision}
          onNavigate={onNavigate}
          learningMode={learningMode}
          learningControl={learningControl}
        />
      );
    }
    if (seniorVariant === "full-screen-review" && routeMode === "senior-review") {
      return (
        <FocusedSeniorDecisionWorkspace
          recommendation={recommendation}
          outcomes={outcomes}
          draft={seniorDecisionDraft}
          onDraftChange={onSaveSeniorDraft}
          onExit={onExitSeniorReview}
          onSubmit={onSeniorDecision}
          onNavigate={onNavigate}
          fullScreen
          learningMode={learningMode}
          learningControl={learningControl}
        />
      );
    }
    if ((seniorVariant === "full-screen-review" && routeMode !== "senior-review") || (seniorVariant === "command-center" && routeMode !== "senior-review") || ((seniorVariant === "unified-brief" || seniorVariant === "aligned-workflow") && routeMode !== "senior-review") || (variant === "focused-lifecycle" && routeMode === "recommendation")) {
      return (
        <SubmittedRecommendationRecord
          recommendation={recommendation}
          outcomes={outcomes}
          seniorDraft={seniorDecisionDraft}
          onOpenSeniorReview={onOpenSeniorReview}
          onNavigate={onNavigate}
          learningMode={learningMode}
        />
      );
    }
    return seniorVariant === "dense-brief"
      ? <DenseSeniorDecisionWorkspace variant={variant} recommendation={recommendation} outcomes={outcomes} onSubmit={onSeniorDecision} onNavigate={onNavigate} learningMode={learningMode} />
      : <FocusedSeniorDecisionWorkspace recommendation={recommendation} outcomes={outcomes} onSubmit={onSeniorDecision} onNavigate={onNavigate} learningMode={learningMode} />;
  }

  const draftProps: DraftRecommendationProps = {
    decision,
    amount,
    rationale,
    conditions,
    setDecision: updateDecision,
    setAmount: updateAmount,
    setRationale: updateRationale,
    toggleCondition,
    activeSection,
    setActiveSection: updateActiveSection,
    onSubmit: submitDraft,
    onNavigate,
    outcomes,
    escalatedCount,
    learningMode,
    learningControl,
  };

  if (variant === "full-screen-lifecycle") {
    if (!reviewReady) return <RecommendationPrerequisiteGate outcomes={outcomes} onNavigate={onNavigate} learningMode={learningMode} />;
    return routeMode === "recommendation-draft"
      ? <FullScreenRecommendationLifecycle {...draftProps} draft={recommendationDraft} onExit={onExitRecommendation} />
      : <RecommendationLaunchPanel draft={recommendationDraft} outcomes={outcomes} escalatedCount={escalatedCount} onStart={onStartRecommendation} onNavigate={onNavigate} learningMode={learningMode} />;
  }

  if (variant === "focused-lifecycle") {
    return reviewReady
      ? <FocusedRecommendationLifecycle {...draftProps} />
      : <RecommendationPrerequisiteGate outcomes={outcomes} onNavigate={onNavigate} learningMode={learningMode} />;
  }

  if (variant === "open-canvas") {
    return <GuidedRecommendationCanvas {...draftProps} />;
  }

  if (variant === "icon-led") {
    return <ReviewLedRecommendation {...draftProps} />;
  }

  return (
    <div className={styles.recommendationLayout}>
      <div className={styles.recommendationMain}>
        <SectionHeader title="Analyst recommendation" description="Turn the completed review into a human-owned recommendation for the senior credit officer." />

        <Panel className={styles.recommendationCard}>
          <form className={styles.recommendationForm} onSubmit={submitDraft}>
          <fieldset>
            <legend>Recommendation</legend>
            <div className={styles.recommendationOptions}>
              {recommendationOptions.map((option) => (
                <label key={option.value} className={decision === option.value ? styles.optionSelected : ""}>
                  <input type="radio" name="recommendation" value={option.value} checked={decision === option.value} onChange={() => setDecision(option.value)} />
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.formFieldRow}>
            <label><span>Recommended amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
            <label><span>Facility term</span><input value="3 years" readOnly /></label>
          </div>

          <label className={styles.textareaField}>
            <span>Analyst rationale</span>
            <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
            <small>This language belongs to the analyst and is included in the decision record.</small>
          </label>

          {decision === "Proceed with conditions" && (
            <fieldset>
              <legend>Recommended conditions</legend>
              <div className={styles.conditionList}>
                {availableConditions.map((condition) => (
                  <label key={condition}>
                    <input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className={styles.recommendationFooter}>
            <span><Icon name="lock" size="sm" /> Submission creates an attributable decision-history event.</span>
            <Button type="submit" variant="primary" disabled={!rationale.trim() || !amount.trim()}>Submit for senior review</Button>
          </div>
          </form>
        </Panel>
      </div>

      <aside className={styles.recommendationRail}>
        <Panel className={styles.decisionRecordCard}>
          <header className={styles.decisionRecordHeader}>
            <div><span>Decision record</span><h2>{hasEscalation ? "Ready with senior attention" : "Ready for handoff"}</h2></div>
            <StatusPill tone={hasEscalation ? "warning" : "success"}>{hasEscalation ? "Senior attention" : "Review complete"}</StatusPill>
          </header>

          <section className={styles.assessmentReferencePanel}>
            <span>AI assessment · Read only</span>
            <h3>Proceed with conditions</h3>
            <p>Repayment appears supportable, with concentration, margin, and leverage protections.</p>
            <button type="button" onClick={() => onNavigate("findings")}>Review finding outcomes <Icon name="arrowRight" size="sm" /></button>
          </section>

          <section className={styles.decisionOutcomeSection}>
            <SectionHeader title="Review outcomes" />
            <div className={styles.outcomeList}>
              {outcomes.map((outcome) => (
                <div key={outcome.finding.id}>
                  <span><strong>{outcome.finding.title}</strong><small>{outcome.risk} risk · {outcome.scanDetail}</small></span>
                  <StatusPill tone={outcome.presentation.tone}>{outcome.shortStatus}</StatusPill>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.decisionHandoff}>
            <KeyValueGrid columns={2} items={[
              { label: "Prepared by", value: "Alex Kim" },
              { label: "Next reviewer", value: "Senior credit" },
              { label: "Sources", value: "12 reviewed" },
              { label: "Findings", value: hasEscalation ? `${outcomes.length - escalatedCount} resolved · ${escalatedCount} escalated` : `${outcomes.length} resolved` },
            ]} />
          </section>
        </Panel>
      </aside>
    </div>
  );
}

type DraftRecommendationProps = {
  decision: string;
  amount: string;
  rationale: string;
  conditions: string[];
  setDecision: (value: string) => void;
  setAmount: (value: string) => void;
  setRationale: (value: string) => void;
  toggleCondition: (condition: string) => void;
  activeSection: RecommendationDraftSection;
  setActiveSection: (value: RecommendationDraftSection) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (tab: ReviewTab) => void;
  outcomes: FindingOutcome[];
  escalatedCount: number;
  learningMode: boolean;
  learningControl?: ReactNode;
  onCancel?: () => void;
};

function RecommendationIdentity({ status, tone }: { status: string; tone: "success" | "warning" | "info" }) {
  return (
    <header className={styles.recommendationFocusedTopbar}>
      <div className={styles.recommendationFocusedIdentity}>
        <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" />
        <span><strong>Meridian Foods</strong><small>$18M working-capital line · 3-year revolver</small></span>
      </div>
      <StatusPill tone={tone}>{status}</StatusPill>
    </header>
  );
}

function RecommendationPrerequisiteGate({ outcomes, onNavigate, learningMode }: { outcomes: FindingOutcome[]; onNavigate: (tab: ReviewTab) => void; learningMode: boolean }) {
  const blockers = outcomes.filter((outcome) => !isFindingAddressed(outcome.state));

  return (
    <div className={styles.recommendationGate} {...getLearningTargetProps(learningMode, "recommendation-story")}>
      <RecommendationIdentity status={`${blockers.length} ${blockers.length === 1 ? "step" : "steps"} remaining`} tone="warning" />
      <main className={styles.recommendationGateBody}>
        <div className={styles.recommendationGateIntro}>
          <span>Recommendation locked</span>
          <h1>Finish the review before drafting the handoff</h1>
          <p>Each material finding needs an analyst disposition or an explicit escalation. The recommendation will unlock as soon as the case record is ready.</p>
        </div>

        <section className={styles.recommendationGateChecklist} aria-labelledby="recommendation-prerequisites-title" {...getLearningTargetProps(learningMode, "recommendation-readiness")}>
          <header>
            <div><span>Readiness checklist</span><h2 id="recommendation-prerequisites-title">What still needs attention</h2></div>
            <StatusPill tone="warning">{blockers.length} open</StatusPill>
          </header>
          <div>
            {outcomes.map((outcome) => {
              const ready = isFindingAddressed(outcome.state);
              return (
                <article key={outcome.finding.id} data-ready={ready || undefined}>
                  <IconTile size="sm" tone={ready ? "success" : outcome.tone} shape="circle">
                    <Icon name={ready ? "checkCircle" : outcome.icon} size="sm" />
                  </IconTile>
                  <span><strong>{outcome.finding.title}</strong><small>{ready ? outcome.shortStatus : outcome.scanDetail}</small></span>
                  <StatusPill tone={ready ? "success" : outcome.presentation.tone}>{ready ? "Ready" : outcome.presentation.label}</StatusPill>
                </article>
              );
            })}
          </div>
        </section>

        <footer className={styles.recommendationGateActions}>
          <div><strong>Next step</strong><span>Open Findings and complete the first unresolved analyst task.</span></div>
          <div>
            <Button variant="secondary" onClick={() => onNavigate("overview")}>Back to overview</Button>
            <Button variant="primary" onClick={() => onNavigate("findings")}>Continue review</Button>
          </div>
        </footer>
      </main>
    </div>
  );
}

function formatDraftTimestamp(updatedAt?: string) {
  if (!updatedAt) return "Saving in this session";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Saved in this session";
  return `Saved ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function RecommendationLaunchPanel({ draft, outcomes, escalatedCount, onStart, onNavigate, learningMode }: {
  draft?: AnalystRecommendationDraft;
  outcomes: FindingOutcome[];
  escalatedCount: number;
  onStart?: () => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode: boolean;
}) {
  const activeSectionLabel = ["Recommendation", "Structure", "Rationale", "Protections", "Review"][(draft?.activeSection ?? 1) - 1];

  return (
    <div className={styles.recommendationLaunch}>
      <header className={styles.recommendationLaunchHeader} {...getLearningTargetProps(learningMode, "recommendation-story")}>
        <div>
          <span>Analyst recommendation</span>
          <h2>{draft ? "Continue your recommendation" : "Turn the completed review into one decision story"}</h2>
          <p>The focused task saves your work as you go. Exiting returns here; submitting closes the draft and creates the senior-facing case record.</p>
        </div>
        <StatusPill tone={escalatedCount > 0 ? "warning" : "success"}>{escalatedCount > 0 ? "Senior attention" : "Ready to draft"}</StatusPill>
      </header>

      <section className={styles.recommendationLaunchCard} aria-labelledby="recommendation-launch-title" {...getLearningTargetProps(learningMode, "recommendation-readiness")}>
        <div className={styles.recommendationLaunchSummary}>
          <IconTile tone={draft ? "info" : "success"}><Icon name={draft ? "document" : "checkCircle"} /></IconTile>
          <div>
            <span>{draft ? "Draft in progress" : "Review complete"}</span>
            <h3 id="recommendation-launch-title">{draft ? `Section ${draft.activeSection} of 5 · ${activeSectionLabel}` : "Ready for Alex Kim to author"}</h3>
            <p>{draft ? formatDraftTimestamp(draft.updatedAt) : `${outcomes.length - escalatedCount} findings resolved${escalatedCount > 0 ? ` · ${escalatedCount} escalated` : ""} · 12 sources reviewed`}</p>
          </div>
        </div>

        <div className={styles.recommendationLaunchSteps} aria-label="What happens next">
          <div><span>1</span><p><strong>Author in focus</strong><small>Choose the posture, structure, rationale, and protections.</small></p></div>
          <div><span>2</span><p><strong>Exit or resume</strong><small>The latest field and section remain available in this session.</small></p></div>
          <div><span>3</span><p><strong>Submit the record</strong><small>Senior credit receives a durable, attributable recommendation.</small></p></div>
        </div>

        <footer className={styles.recommendationLaunchActions}>
          <Button variant="quiet" onClick={() => onNavigate("findings")}>Review finding outcomes</Button>
          <Button variant="primary" onClick={onStart}>{draft ? "Resume recommendation" : "Start recommendation"}</Button>
        </footer>
      </section>
    </div>
  );
}

function FullScreenRecommendationLifecycle(props: DraftRecommendationProps & { draft?: AnalystRecommendationDraft; onExit?: () => void }) {
  const [contextOpen, setContextOpen] = useState(false);
  const { draft, outcomes, activeSection, onExit, learningMode, learningControl } = props;

  return (
    <div className={styles.recommendationFullScreenWorkspace}>
      <header className={styles.recommendationTaskbar}>
        <div className={styles.recommendationTaskbarInner}>
          <div className={styles.recommendationTaskLead}>
            <div className={styles.recommendationTaskIdentity}>
              <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" />
              <span className={styles.recommendationTaskDivider} aria-hidden="true" />
              <span><strong>Meridian Foods</strong></span>
            </div>
          </div>
          <div className={styles.recommendationTaskActions}>
            {learningControl}
            <Button className={styles.recommendationExitButton} variant="quiet" size="sm" aria-label="Exit and save" title="Exit and save" icon={<Icon name="close" size="sm" />} onClick={onExit}><span className={styles.visuallyHidden}>Exit and save</span></Button>
          </div>
        </div>
      </header>

      <div className={styles.recommendationTaskScroll}>
        <main className={styles.recommendationFullScreenCanvas} aria-label={`Recommendation section ${activeSection} of 5`}>
          <EditorialRecommendationCanvas {...props} onCancel={onExit} />
        </main>
      </div>

      {contextOpen && (
        <aside className={styles.recommendationFullScreenContext} aria-labelledby="full-screen-case-context-title" {...getLearningTargetProps(learningMode, "recommendation-context")}>
          <header><div><span>Supporting record</span><h2 id="full-screen-case-context-title">Case context</h2><p>Read-only outcomes remain close without reopening the full case.</p></div><Button variant="quiet" size="sm" aria-label="Close case context" onClick={() => setContextOpen(false)}><Icon name="close" size="sm" /></Button></header>
          <div>
            {outcomes.map((outcome) => (
              <article key={outcome.finding.id}>
                <IconTile size="sm" tone={outcome.tone}><Icon name={outcome.icon} size="sm" /></IconTile>
                <span><strong>{outcome.finding.title}</strong><small>{outcome.risk} risk · {outcome.shortStatus}</small><p>{outcome.detail}</p></span>
              </article>
            ))}
          </div>
          <footer>12 reviewed sources and all analyst judgments remain in the case record.</footer>
        </aside>
      )}
    </div>
  );
}

function EditorialRecommendationCanvas({
  decision,
  amount,
  rationale,
  conditions,
  setDecision,
  setAmount,
  setRationale,
  toggleCondition,
  onSubmit,
  onNavigate,
  outcomes,
  activeSection,
  setActiveSection,
  learningMode,
  onCancel,
}: DraftRecommendationProps) {
  const sections: Array<{ id: RecommendationDraftSection; label: string }> = [
    { id: 1, label: "Recommendation" },
    { id: 2, label: "Structure" },
    { id: 3, label: "Rationale" },
    { id: 4, label: "Protections" },
    { id: 5, label: "Review" },
  ];
  const selectedOption = recommendationOptions.find((option) => option.value === decision) ?? recommendationOptions[0];
  const selectedConditions = decision === "Proceed with conditions" ? conditions : [];
  const readyToReview = Boolean(rationale.trim() && amount.trim() && (decision !== "Proceed with conditions" || conditions.length > 0));

  return (
    <form className={styles.editorialRecommendation} onSubmit={activeSection === 5 ? onSubmit : (event) => event.preventDefault()}>
      <div className={styles.editorialRecommendationWorkspace}>
        <aside className={styles.editorialRecommendationRail}>
          <div {...getLearningTargetProps(learningMode, "recommendation-sections")}>
            <WorkflowSteps
              ariaLabel="Recommendation sections"
              items={sections}
              value={activeSection}
              onChange={setActiveSection}
              className={styles.editorialRecommendationSteps}
            />
          </div>

        </aside>

        <div className={styles.editorialRecommendationEditor} {...getLearningTargetProps(learningMode, "recommendation-authoring")}>
          <div key={activeSection} className={styles.editorialRecommendationStage}>
          {activeSection === 1 && (
            <section className={styles.editorialRecommendationSection} aria-labelledby="editorial-recommendation-title">
              <header className={styles.editorialRecommendationHeader} {...getLearningTargetProps(learningMode, "recommendation-story")}>
                <span>Recommendation</span>
                <h1 id="editorial-recommendation-title">Choose the credit posture</h1>
                <p>Set the recommendation senior credit will review.</p>
              </header>

              <fieldset className={styles.editorialPosturePicker}>
                <legend className={styles.visuallyHidden}>Recommendation</legend>
                {recommendationOptions.map((option) => (
                  <label key={option.value} data-selected={decision === option.value}>
                    <input className={styles.visuallyHidden} type="radio" name="analyst-recommendation" value={option.value} checked={decision === option.value} onChange={() => setDecision(option.value)} />
                    <Icon name={option.icon} size="sm" />
                    <span>{option.label}</span>
                    <span className={styles.visuallyHidden}>{option.description}</span>
                  </label>
                ))}
              </fieldset>

              <div className={styles.editorialSelectionNote} aria-live="polite">
                <Icon name={selectedOption.icon} size="sm" />
                <span>{selectedOption.description}</span>
              </div>
            </section>
          )}

          {activeSection === 2 && (
            <section className={styles.editorialRecommendationSection} aria-labelledby="editorial-structure-title">
              <header className={styles.editorialRecommendationHeader}>
                <span>Structure</span>
                <h1 id="editorial-structure-title">Set the facility</h1>
                <p>Confirm the amount and term that will travel with the recommendation.</p>
              </header>
              <div className={styles.editorialTermFields}>
                <label><span>Recommended amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                <label><span>Facility term</span><input value="3 years" readOnly /></label>
              </div>
            </section>
          )}

          {activeSection === 3 && (
            <section className={styles.editorialRecommendationSection} aria-labelledby="editorial-rationale-title">
              <header className={styles.editorialRecommendationHeader}>
                <span>Rationale</span>
                <h1 id="editorial-rationale-title">Write the credit rationale</h1>
                <p>Give senior credit the judgment behind the posture, not a recap of every finding.</p>
              </header>
              <label className={styles.editorialRationaleField}>
                <span>Analyst rationale</span>
                <textarea value={rationale} placeholder="Summarize the credit case for senior review…" onChange={(event) => setRationale(event.target.value)} />
                <small>Human-authored · Included in the decision record</small>
              </label>
            </section>
          )}

          {activeSection === 4 && (
            <section className={styles.editorialRecommendationSection} aria-labelledby="editorial-protections-title">
              <header className={styles.editorialRecommendationHeader}>
                <span>Protections</span>
                <h1 id="editorial-protections-title">Choose the protections</h1>
                <p>Only selected conditions will appear in the senior handoff.</p>
              </header>
              {decision === "Proceed with conditions" ? (
                <fieldset className={styles.editorialConditionList}>
                  <legend className={styles.visuallyHidden}>Recommended conditions</legend>
                  {availableConditions.map((condition) => (
                    <label key={condition} data-selected={conditions.includes(condition)}>
                      <input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                      <span>{condition}</span>
                      {conditions.includes(condition) && <Icon name="check" size="sm" />}
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className={styles.editorialSelectionNote}>
                  <Icon name="checkCircle" size="sm" />
                  <span>No additional conditions will be included.</span>
                </div>
              )}
            </section>
          )}

          {activeSection === 5 && (
            <section className={`${styles.editorialRecommendationSection} ${styles.editorialRecommendationReview}`} aria-labelledby="editorial-review-title">
              <header className={styles.editorialRecommendationHeader}>
                <span>Review</span>
                <h1 id="editorial-review-title">Ready for senior credit</h1>
                <p>Confirm the recommendation record before it becomes read-only.</p>
              </header>

              <section className={styles.editorialReviewPosture} aria-label="Recommendation summary">
                <span className={styles.editorialReviewPostureIcon}><Icon name={selectedOption.icon} size="md" /></span>
                <div><small>Recommendation</small><h2>{decision}</h2><p>{selectedOption.description}</p></div>
                <Button type="button" size="sm" variant="quiet" onClick={() => setActiveSection(1)}>Edit</Button>
              </section>

              <div className={styles.editorialReviewDetails}>
                <section aria-labelledby="editorial-review-structure-title">
                  <header><h2 id="editorial-review-structure-title">Facility</h2><Button type="button" size="sm" variant="quiet" onClick={() => setActiveSection(2)}>Edit</Button></header>
                  <dl>
                    <div><dt>Amount</dt><dd>{amount}</dd></div>
                    <div><dt>Term</dt><dd>3 years</dd></div>
                    <div><dt>Type</dt><dd>Revolver</dd></div>
                  </dl>
                </section>

                <section aria-labelledby="editorial-review-rationale-title">
                  <header><h2 id="editorial-review-rationale-title">Rationale</h2><Button type="button" size="sm" variant="quiet" onClick={() => setActiveSection(3)}>Edit</Button></header>
                  <p>{rationale}</p>
                </section>

                <section aria-labelledby="editorial-review-protections-title">
                  <header><h2 id="editorial-review-protections-title">Protections</h2><Button type="button" size="sm" variant="quiet" onClick={() => setActiveSection(4)}>Edit</Button></header>
                  {selectedConditions.length > 0 ? (
                    <ul>{selectedConditions.map((condition) => <li key={condition}><Icon name="check" size="xs" /><span>{condition}</span></li>)}</ul>
                  ) : <p>No additional protections.</p>}
                </section>
              </div>
            </section>
          )}
          </div>

          <footer className={styles.editorialRecommendationFooter}>
            <div>
              {activeSection > 1 ? <Button type="button" size="lg" variant="secondary" onClick={() => setActiveSection((activeSection - 1) as RecommendationDraftSection)}>Back</Button> : <Button type="button" size="lg" variant="secondary" onClick={onCancel}>Cancel</Button>}
            </div>
            <div>
              {activeSection < 5
                ? <Button type="button" size="lg" variant="primary" disabled={activeSection === 4 && !readyToReview} onClick={() => setActiveSection((activeSection + 1) as RecommendationDraftSection)}>{activeSection === 4 ? "Review recommendation" : "Continue"}</Button>
                : <Button type="submit" size="lg" variant="primary" disabled={!readyToReview}>Submit for senior review</Button>}
            </div>
          </footer>
        </div>
      </div>
    </form>
  );
}

function FocusedRecommendationLifecycle(props: DraftRecommendationProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const { outcomes, escalatedCount, onNavigate, learningMode } = props;

  return (
    <div className={styles.recommendationFocusedWorkspace}>
      <RecommendationIdentity status={escalatedCount > 0 ? "Senior attention" : "Draft in progress"} tone={escalatedCount > 0 ? "warning" : "info"} />
      <div className={styles.recommendationFocusedActions}>
        <Button variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="xs" />} onClick={() => onNavigate("overview")}>Back to case</Button>
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={contextOpen}
          aria-controls="recommendation-case-context"
          icon={<Icon name={contextOpen ? "close" : "document"} size="xs" />}
          onClick={() => setContextOpen((current) => !current)}
        >
          {contextOpen ? "Close context" : "Case context"}
        </Button>
      </div>

      <div className={styles.recommendationFocusedStage} data-context-open={contextOpen || undefined}>
        <main className={styles.recommendationFocusedCanvas}>
          <GuidedRecommendationCanvas {...props} />
        </main>

        {contextOpen && (
          <aside id="recommendation-case-context" className={styles.recommendationContextPanel} aria-labelledby="recommendation-context-title" {...getLearningTargetProps(learningMode, "recommendation-context")}>
            <header>
              <div><span>Supporting record</span><h2 id="recommendation-context-title">Case context</h2><p>Keep the decision signals close without reopening the full review.</p></div>
              <Button variant="quiet" size="sm" aria-label="Close case context" onClick={() => setContextOpen(false)}><Icon name="close" size="sm" /></Button>
            </header>
            <div className={styles.recommendationContextOutcomes}>
              {outcomes.map((outcome) => (
                <article key={outcome.finding.id}>
                  <IconTile size="sm" tone={outcome.tone}><Icon name={outcome.icon} size="sm" /></IconTile>
                  <span><strong>{outcome.finding.title}</strong><small>{outcome.risk} risk · {outcome.shortStatus}</small><p>{outcome.detail}</p></span>
                </article>
              ))}
            </div>
            <footer>
              <span>12 sources remain preserved in the case record.</span>
              <div><Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Findings</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("sources")}>Sources</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("activity")}>Activity</Button></div>
            </footer>
          </aside>
        )}
      </div>
    </div>
  );
}

function SubmittedRecommendationRecord({ recommendation, outcomes, seniorDraft, onOpenSeniorReview, onNavigate, learningMode }: {
  recommendation: AnalystRecommendationRecord;
  outcomes: FindingOutcome[];
  seniorDraft?: SeniorDecisionDraft;
  onOpenSeniorReview?: () => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode: boolean;
}) {
  return (
    <div className={styles.submittedRecommendationRecord}>
      <header className={styles.submittedRecommendationHeader} {...getLearningTargetProps(learningMode, "recommendation-story")}>
        <div><span>Analyst recommendation</span><h2>{recommendation.decision}</h2><p>The draft is closed. Alex Kim’s submitted recommendation is now a durable case record.</p></div>
        <StatusPill tone="info">Submitted</StatusPill>
      </header>

      <KeyValueGrid className={styles.submittedRecommendationFacts} columns={4} items={[
        { label: "Recommended amount", value: recommendation.amount },
        { label: "Prepared by", value: recommendation.author },
        { label: "Submitted", value: new Date(recommendation.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) },
        { label: "Next actor", value: "Senior credit" },
      ]} />

      <div className={styles.submittedRecommendationBody}>
        <section aria-labelledby="submitted-rationale-title">
          <span>Analyst rationale</span>
          <h3 id="submitted-rationale-title">Why this posture is supportable</h3>
          <p>{recommendation.rationale}</p>
        </section>
        <section aria-labelledby="submitted-conditions-title">
          <span>Proposed protections</span>
          <h3 id="submitted-conditions-title">{recommendation.conditions.length > 0 ? `${recommendation.conditions.length} conditions included` : "No additional conditions"}</h3>
          {recommendation.conditions.length > 0
            ? <ul>{recommendation.conditions.map((condition) => <li key={condition}><Icon name="check" size="xs" /> {condition}</li>)}</ul>
            : <p>The analyst submitted this posture without additional covenant or reporting conditions.</p>}
        </section>
      </div>

      <section className={styles.submittedRecommendationOutcomes} aria-label="Finding outcomes included in the recommendation" {...getLearningTargetProps(learningMode, "recommendation-context")}>
        {outcomes.map((outcome) => (
          <article key={outcome.finding.id}>
            <IconTile size="sm" tone={outcome.tone}><Icon name={outcome.icon} size="sm" /></IconTile>
            <span><strong>{outcome.finding.title}</strong><small>{outcome.risk} risk · {outcome.shortStatus}</small></span>
          </article>
        ))}
      </section>

      <footer className={styles.submittedRecommendationActions}>
        <div><span>Next step</span><strong>Senior credit reviews this record and makes the final decision.</strong></div>
        <div>
          <Button variant="secondary" onClick={() => onNavigate("activity")}>View activity</Button>
          <Button variant="primary" onClick={onOpenSeniorReview}>{seniorDraft ? "Resume senior review" : "Open senior review"}</Button>
        </div>
      </footer>
    </div>
  );
}

function GuidedRecommendationCanvas({
  decision,
  amount,
  rationale,
  conditions,
  setDecision,
  setAmount,
  setRationale,
  toggleCondition,
  onSubmit,
  onNavigate,
  outcomes,
  escalatedCount,
  activeSection,
  setActiveSection,
  learningMode,
}: DraftRecommendationProps) {
  const sections: Array<{ id: RecommendationDraftSection; label: string; detail: string }> = [
    { id: 1, label: "Recommendation", detail: "Choose the posture" },
    { id: 2, label: "Structure", detail: "Confirm amount and term" },
    { id: 3, label: "Rationale", detail: "State the credit case" },
    { id: 4, label: "Protections", detail: "Set conditions" },
  ];

  return (
    <form className={styles.guidedRecommendation} onSubmit={onSubmit}>
      <header className={styles.guidedRecommendationHeader} {...getLearningTargetProps(learningMode, "recommendation-story")}>
        <div>
          <span>Final analyst step</span>
          <h2>Prepare the recommendation</h2>
          <p>{escalatedCount > 0 ? "The analyst review is recorded, with senior attention preserved. Turn the case record into one accountable handoff." : "The review is complete. Turn the resolved case record into one accountable handoff for senior credit."}</p>
        </div>
        <StatusPill tone={escalatedCount > 0 ? "warning" : "success"}>{escalatedCount > 0 ? "Senior attention" : "Ready to draft"}</StatusPill>
      </header>

      <section className={styles.guidedReadinessStrip} aria-label="Recommendation readiness" {...getLearningTargetProps(learningMode, "recommendation-readiness")}>
        <div><IconTile size="sm" tone={escalatedCount > 0 ? "warning" : "success"} shape="circle"><Icon name={escalatedCount > 0 ? "alertCircle" : "checkCircle"} size="sm" /></IconTile><span><small>Review</small><strong>{escalatedCount > 0 ? `${outcomes.length - escalatedCount} resolved · ${escalatedCount} escalated` : `${outcomes.length} findings resolved`}</strong></span></div>
        <div><IconTile size="sm" tone="neutral" shape="circle"><Icon name="document" size="sm" /></IconTile><span><small>Evidence</small><strong>12 sources reviewed</strong></span></div>
        <div><IconTile size="sm" tone="info" shape="circle"><Icon name="send" size="sm" /></IconTile><span><small>Handoff</small><strong>Senior credit next</strong></span></div>
        <Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Review findings</Button>
      </section>

      <div className={styles.guidedRecommendationWorkspace}>
        <ol className={styles.guidedSectionRail} aria-label="Recommendation sections" {...getLearningTargetProps(learningMode, "recommendation-sections")}>
          {sections.map((section) => (
            <li key={section.id} data-active={activeSection === section.id}>
              <button type="button" aria-current={activeSection === section.id ? "step" : undefined} onClick={() => setActiveSection(section.id)}>
                <span>{section.id}</span><div><strong>{section.label}</strong><small>{section.detail}</small></div>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.guidedRecommendationForm} {...getLearningTargetProps(learningMode, "recommendation-authoring")}>
          {activeSection === 1 && <section aria-labelledby="guided-recommendation-title">
            <header><span>01 · Recommendation</span><h3 id="guided-recommendation-title">What should senior credit consider?</h3><p>Select the analyst posture that best reflects the completed review.</p></header>
            <fieldset className={styles.guidedDecisionOptions}>
              <legend className={styles.visuallyHidden}>Recommendation</legend>
              {recommendationOptions.map((option) => (
                <label key={option.value} data-selected={decision === option.value}>
                  <input type="radio" name="guided-recommendation" value={option.value} checked={decision === option.value} onChange={() => setDecision(option.value)} />
                  <IconTile size="sm" tone={decision === option.value ? "info" : "neutral"}><Icon name={option.icon} size="sm" /></IconTile>
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  {decision === option.value && <Icon name="check" size="sm" />}
                </label>
              ))}
            </fieldset>
          </section>}

          {activeSection === 2 && <section aria-labelledby="guided-structure-title">
            <header><span>02 · Structure</span><h3 id="guided-structure-title">Confirm the recommended facility</h3><p>Keep the approved request visible without turning it into another dashboard.</p></header>
            <div className={styles.guidedTermFields}>
              <label><span>Recommended amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
              <label><span>Facility term</span><input value="3 years" readOnly /></label>
            </div>
          </section>}

          {activeSection === 3 && <section aria-labelledby="guided-rationale-title">
            <header><span>03 · Rationale</span><h3 id="guided-rationale-title">Explain why this posture is supportable</h3><p>Write for the senior reviewer. The language becomes part of the attributable decision record.</p></header>
            <label className={styles.guidedRationaleField}>
              <span>Analyst rationale</span>
              <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
              <small>Prepared by Alex Kim · Human-authored</small>
            </label>
          </section>}

          {activeSection === 4 && <section aria-labelledby="guided-protections-title">
              <header><span>04 · Protections</span><h3 id="guided-protections-title">Choose the controls that travel with the recommendation</h3><p>Only selected conditions will be included in the senior handoff.</p></header>
              {decision === "Proceed with conditions" ? <fieldset className={styles.guidedConditionList}>
                <legend className={styles.visuallyHidden}>Recommended conditions</legend>
                {availableConditions.map((condition) => (
                  <label key={condition} data-selected={conditions.includes(condition)}>
                    <input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                    <span>{condition}</span>
                    {conditions.includes(condition) && <Icon name="check" size="sm" />}
                  </label>
                ))}
              </fieldset> : <div className={styles.guidedNoConditions}><IconTile tone="neutral"><Icon name="checkCircle" /></IconTile><span><strong>No additional conditions</strong><p>The selected posture will be submitted without covenant or reporting conditions.</p></span></div>}
            </section>}

          <footer className={styles.guidedRecommendationFooter}>
            <span><Icon name="lock" size="sm" /> Submission records Alex Kim as the recommendation owner.</span>
            <div>
              {activeSection > 1 && <Button type="button" variant="secondary" onClick={() => setActiveSection((activeSection - 1) as RecommendationDraftSection)}>Back</Button>}
              {activeSection < 4
                ? <Button type="button" variant="primary" onClick={() => setActiveSection((activeSection + 1) as RecommendationDraftSection)}>Continue</Button>
                : <Button type="submit" variant="primary" disabled={!rationale.trim() || !amount.trim()}>Submit for senior review</Button>}
            </div>
          </footer>
        </div>
      </div>
    </form>
  );
}

function ReviewLedRecommendation({
  decision,
  amount,
  rationale,
  conditions,
  setDecision,
  setAmount,
  setRationale,
  toggleCondition,
  onSubmit,
  onNavigate,
  outcomes,
  escalatedCount,
}: DraftRecommendationProps) {
  const selectedOption = recommendationOptions.find((option) => option.value === decision) ?? recommendationOptions[0];

  return (
    <div className={styles.reviewLedRecommendation}>
      <header className={styles.reviewLedHeader}>
        <div><span>Recommendation brief</span><h2>Build the senior decision story</h2><p>Keep the evidence narrative open while one contained action surface owns the analyst recommendation.</p></div>
        <StatusPill tone={escalatedCount > 0 ? "warning" : "success"}>{escalatedCount > 0 ? "Senior attention" : "Review complete"}</StatusPill>
      </header>

      <div className={styles.reviewLedLayout}>
        <main className={styles.reviewBrief}>
          <section className={styles.reviewBriefHero}>
            <div className={styles.reviewBriefPosture}>
              <span>Current analyst posture</span>
              <IconTile tone="info"><Icon name={selectedOption.icon} /></IconTile>
              <h3>{selectedOption.label}</h3>
              <p>{selectedOption.description}. Repayment appears supportable under the base case, with explicit protection for the remaining concentration, margin, and leverage risks.</p>
            </div>
            <KeyValueGrid columns={2} items={[
              { label: "Recommended amount", value: amount },
              { label: "Facility term", value: "3 years" },
              { label: "Prepared by", value: "Alex Kim" },
              { label: "Next reviewer", value: "Senior credit" },
            ]} />
          </section>

          <section className={styles.reviewSignalSection}>
            <SectionHeader title="What drives the recommendation" description="The three decision signals senior credit needs, without repeating the full finding dossiers." />
            <div className={styles.reviewSignalList}>
              {outcomes.map((outcome) => (
                <article key={outcome.finding.id}>
                  <IconTile size="sm"><Icon name={outcome.icon} size="sm" /></IconTile>
                  <span><small>{outcome.finding.title}</small><strong>{outcome.presentation.label} · {outcome.risk} risk</strong><p>{outcome.detail}</p></span>
                  <Icon name="chevronRight" size="sm" />
                </article>
              ))}
            </div>
          </section>

          <section className={styles.reviewBriefLinks} aria-label="Supporting case record">
            <div><span>Supporting record</span><p>{escalatedCount > 0 ? `${outcomes.length - escalatedCount} findings are resolved and ${escalatedCount} remains explicit for senior judgment.` : `All ${outcomes.length} findings are resolved.`} Twelve sources are preserved in the case history.</p></div>
            <div><Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Findings</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("sources")}>Sources</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("activity")}>Activity</Button></div>
          </section>
        </main>

        <aside className={styles.reviewComposer}>
          <Panel className={styles.reviewComposerPanel}>
            <form onSubmit={onSubmit}>
              <header><span>Analyst action</span><h3>Finalize recommendation</h3><p>This is Alex Kim’s recommendation—not an automated credit decision.</p></header>

              <fieldset className={styles.composerDecisionOptions}>
                <legend>Recommendation</legend>
                {recommendationOptions.map((option) => (
                  <label key={option.value} data-selected={decision === option.value}>
                    <input type="radio" name="review-led-recommendation" value={option.value} checked={decision === option.value} onChange={() => setDecision(option.value)} />
                    <IconTile size="sm" tone={decision === option.value ? "info" : "neutral"}><Icon name={option.icon} size="sm" /></IconTile>
                    <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  </label>
                ))}
              </fieldset>

              <label className={styles.composerAmountField}><span>Recommended amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>

              <label className={styles.composerRationaleField}>
                <span>Analyst rationale</span>
                <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} />
              </label>

              {decision === "Proceed with conditions" && (
                <fieldset className={styles.composerConditions}>
                  <legend>Recommended conditions <small>{conditions.length} selected</small></legend>
                  {availableConditions.map((condition) => (
                    <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span>{condition}</span></label>
                  ))}
                </fieldset>
              )}

              <div className={styles.composerSubmit}>
                <Button type="submit" variant="primary" disabled={!rationale.trim() || !amount.trim()}>Submit for senior review</Button>
                <small><Icon name="lock" size="xs" /> Creates an attributable decision-history event.</small>
              </div>
            </form>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function CommandCenterSeniorDecisionWorkspace({ recommendation, outcomes, draft, onDraftChange, onExit, onSubmit, onNavigate, learningMode, learningControl }: {
  recommendation: AnalystRecommendationRecord;
  outcomes: FindingOutcome[];
  draft?: SeniorDecisionDraft;
  onDraftChange?: (draft: SeniorDecisionDraft) => void;
  onExit?: () => void;
  onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode: boolean;
  learningControl?: ReactNode;
}) {
  const initialDraft = draft ?? createInitialSeniorDecisionDraft(recommendation);
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"]>(initialDraft.decision);
  const [rationale, setRationale] = useState(initialDraft.rationale);
  const [conditions, setConditions] = useState<string[]>(initialDraft.conditions);
  const escalatedOutcomes = outcomes.filter((outcome) => outcome.state === "escalated");
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  const actionLabel = decision === "approve"
    ? "Record approval"
    : decision === "approve_with_conditions"
      ? "Record conditional approval"
      : decision === "return_to_analyst"
        ? "Return to analyst"
        : "Record decline";

  useEffect(() => {
    if (draft || !onDraftChange) return;
    onDraftChange({ decision, rationale, conditions, updatedAt: new Date().toISOString() });
  }, [conditions, decision, draft, onDraftChange, rationale]);

  function persistCommandDraft(next: Partial<SeniorDecisionDraft>) {
    if (!onDraftChange) return;
    onDraftChange({ decision, rationale, conditions, ...next, updatedAt: new Date().toISOString() });
  }

  function updateDecision(value: SeniorDecisionRecord["decision"]) {
    setDecision(value);
    persistCommandDraft({ decision: value });
  }

  function updateRationale(value: string) {
    setRationale(value);
    persistCommandDraft({ rationale: value });
  }

  function toggleCondition(condition: string) {
    const next = conditions.includes(condition) ? conditions.filter((item) => item !== condition) : [...conditions, condition];
    setConditions(next);
    persistCommandDraft({ conditions: next });
  }

  function submitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] });
  }

  return (
    <div className={styles.seniorCommandWorkspace}>
      <header className={styles.seniorCommandTopbar}>
        <Button variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="xs" />} onClick={onExit}>Exit and save</Button>
        <div className={styles.seniorCommandIdentity}>
          <IconTile size="sm" tone="neutral"><Icon name="shield" size="sm" /></IconTile>
          <span><strong>Meridian Foods</strong><small>$18M working-capital line · 3-year revolver</small></span>
        </div>
        <div className={styles.seniorCommandStatus}><span><Icon name="checkCircle" size="xs" /> {formatDraftTimestamp(draft?.updatedAt)}</span>{learningControl}<StatusPill tone="warning">Decision required</StatusPill></div>
      </header>

      <div className={styles.seniorCommandFrame}>
        <header className={styles.seniorCommandHeading} {...getLearningTargetProps(learningMode, "senior-decision-story")}>
          <div><span>Senior credit decision</span><h1>Finalize the credit decision</h1><p>Review Alex Kim’s recommendation, confirm the protections that matter, and record Morgan Lee’s decision.</p></div>
          <div className={styles.seniorCommandAmount}><span>Requested facility</span><strong>$18M</strong><small>3-year revolver</small></div>
        </header>

        <div className={styles.seniorCommandLayout}>
          <main className={styles.seniorCommandBrief}>
            <section className={styles.seniorCommandRecommendation} aria-labelledby="senior-command-recommendation-title" {...getLearningTargetProps(learningMode, "senior-recommendation")}>
              <header>
                <div><span>Analyst recommendation</span><h2 id="senior-command-recommendation-title">{recommendation.decision}</h2></div>
                <StatusPill tone="info">Submitted</StatusPill>
              </header>
              <p>{recommendation.rationale}</p>
              <dl className={styles.seniorCommandFacts}>
                <div><dt>Prepared by</dt><dd>{recommendation.author}</dd></div>
                <div><dt>Submitted</dt><dd>{new Date(recommendation.createdAt).toLocaleDateString()}</dd></div>
                <div><dt>Proposed protections</dt><dd>{recommendation.conditions.length || "None"}</dd></div>
              </dl>
            </section>

            {escalatedOutcomes.length > 0 && (
              <div className={styles.seniorCommandAttention} role="status">
                <IconTile size="sm" tone="warning"><Icon name="alertCircle" size="sm" /></IconTile>
                <span><strong>{escalatedOutcomes.length} finding{escalatedOutcomes.length === 1 ? "" : "s"} needs explicit judgment</strong><small>{escalatedOutcomes.map((outcome) => outcome.finding.title).join(", ")}</small></span>
              </div>
            )}

            <section className={styles.seniorCommandOutcomes} aria-labelledby="senior-command-outcomes-title" {...getLearningTargetProps(learningMode, "senior-findings")}>
              <header><div><span>Decision context</span><h2 id="senior-command-outcomes-title">Finding outcomes</h2></div><small>{outcomes.length} findings · analyst-owned</small></header>
              <div className={styles.seniorCommandLedger}>
                {outcomes.map((outcome) => (
                  <article key={outcome.finding.id} data-attention={outcome.state === "escalated" || undefined}>
                    <IconTile size="sm" tone={outcome.tone}><Icon name={outcome.icon} size="sm" /></IconTile>
                    <div><strong>{outcome.finding.title}</strong><p>{outcome.scanDetail}</p></div>
                    <div className={styles.seniorCommandOutcomeMeta}><span>{outcome.risk} risk</span><StatusPill tone={outcome.presentation.tone}>{outcome.shortStatus}</StatusPill></div>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.seniorCommandRecord} aria-label="Supporting case record">
              <div><span>Supporting record</span><strong>{recommendation.conditions.length} protections proposed · 12 sources reviewed</strong></div>
              <nav aria-label="Supporting record links"><Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Findings <Icon name="chevronRight" size="xs" /></Button><Button variant="quiet" size="sm" onClick={() => onNavigate("sources")}>Sources <Icon name="chevronRight" size="xs" /></Button><Button variant="quiet" size="sm" onClick={() => onNavigate("activity")}>Activity <Icon name="chevronRight" size="xs" /></Button></nav>
            </section>

            <details className={styles.seniorCommandAiSupport}>
              <summary><IconTile size="sm" tone="neutral"><Icon name="spark" size="sm" /></IconTile><span><strong>Supporting AI assessment</strong><small>Read-only context · never the decision</small></span><Icon name="chevronDown" size="sm" /></summary>
              <div><p>Repayment appears supportable under the base case, with concentration reporting, leverage, and fixed-charge coverage protections.</p><small>AI summarized the reviewed record. It cannot change the analyst recommendation or submit the final decision.</small></div>
            </details>
          </main>

          <aside className={styles.seniorCommandComposer} aria-labelledby="senior-command-form-title" {...getLearningTargetProps(learningMode, "senior-final-action")}>
            <form onSubmit={submitDecision}>
              <header><span>Your decision</span><h2 id="senior-command-form-title">Record final outcome</h2><p>This action is attributed to Morgan Lee.</p></header>
              <fieldset className={styles.seniorCommandOptions}><legend>Choose one outcome</legend>{commandDecisionOptions.map((option) => (
                <label key={option.value} data-selected={decision === option.value}>
                  <input type="radio" name="command-senior-decision" aria-label={option.label} checked={decision === option.value} onChange={() => updateDecision(option.value)} />
                  <IconTile size="sm" tone={decision === option.value ? option.tone : "neutral"}><Icon name={option.icon} size="sm" /></IconTile>
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                </label>
              ))}</fieldset>

              {conditionsRequired && <fieldset className={styles.seniorCommandConditions}>
                <legend>Final protections <small>{conditions.length} selected</small></legend>
                <p>These will be included in the recorded approval.</p>
                <div>{availableConditions.map((condition) => <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span>{condition}</span></label>)}</div>
                {conditions.length === 0 && <small role="alert">Select at least one protection.</small>}
              </fieldset>}

              <label className={styles.seniorCommandRationale}><span>Decision note <small>{rationaleRequired ? "Required" : "Optional"}</small></span><textarea value={rationale} placeholder={decision === "return_to_analyst" ? "Explain what Alex should revise…" : decision === "decline" ? "Record the reason for declining…" : "Add context for the decision…"} onChange={(event) => updateRationale(event.target.value)} /></label>
              <footer><dl><div><dt>Decision maker</dt><dd>Morgan Lee</dd></div><div><dt>Record</dt><dd>Immutable on submission</dd></div></dl><Button type="submit" variant="primary" disabled={!canSubmit}>{actionLabel}</Button><small><Icon name="lock" size="xs" /> AI cannot submit this decision.</small></footer>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FocusedSeniorDecisionWorkspace({ recommendation, outcomes, draft, onDraftChange, onExit, onSubmit, onNavigate, fullScreen = false, learningMode = false, learningControl }: {
  recommendation: AnalystRecommendationRecord;
  outcomes: FindingOutcome[];
  draft?: SeniorDecisionDraft;
  onDraftChange?: (draft: SeniorDecisionDraft) => void;
  onExit?: () => void;
  onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onNavigate: (tab: ReviewTab) => void;
  fullScreen?: boolean;
  learningMode?: boolean;
  learningControl?: ReactNode;
}) {
  const initialDraft = draft ?? createInitialSeniorDecisionDraft(recommendation);
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"]>(initialDraft.decision);
  const [rationale, setRationale] = useState(initialDraft.rationale);
  const [conditions, setConditions] = useState<string[]>(initialDraft.conditions);
  const escalatedOutcomes = outcomes.filter((outcome) => outcome.state === "escalated");
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  const actionLabel = decision === "approve"
    ? "Approve facility"
    : decision === "approve_with_conditions"
      ? "Approve with conditions"
      : decision === "return_to_analyst"
        ? "Return to Alex Kim"
        : "Decline request";

  useEffect(() => {
    if (!fullScreen || draft || !onDraftChange) return;
    onDraftChange({ decision, rationale, conditions, updatedAt: new Date().toISOString() });
  }, [conditions, decision, draft, fullScreen, onDraftChange, rationale]);

  function persistSeniorDraft(next: Partial<SeniorDecisionDraft>) {
    if (!fullScreen || !onDraftChange) return;
    onDraftChange({ decision, rationale, conditions, ...next, updatedAt: new Date().toISOString() });
  }

  function updateDecision(value: SeniorDecisionRecord["decision"]) {
    setDecision(value);
    persistSeniorDraft({ decision: value });
  }

  function updateRationale(value: string) {
    setRationale(value);
    persistSeniorDraft({ rationale: value });
  }

  function toggleCondition(condition: string) {
    const next = conditions.includes(condition) ? conditions.filter((item) => item !== condition) : [...conditions, condition];
    setConditions(next);
    persistSeniorDraft({ conditions: next });
  }

  function submitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] });
  }

  return (
    <div className={`${styles.seniorFocusedWorkspace} ${fullScreen ? styles.seniorFullScreenWorkspace : ""}`}>
      <header className={styles.seniorFocusedTopbar}>
        <Button variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="xs" />} onClick={fullScreen ? onExit : () => onNavigate("overview")}>{fullScreen ? "Exit and save" : "Back to case"}</Button>
        <div className={styles.seniorFocusedIdentity}>
          <IconTile size="sm" tone="neutral"><Icon name="shield" size="sm" /></IconTile>
          <span><strong>Meridian Foods</strong><small>$18M working-capital line · 3-year revolver</small></span>
        </div>
        <div className={styles.seniorTaskStatus}>{fullScreen && <span><Icon name="checkCircle" size="xs" /> {formatDraftTimestamp(draft?.updatedAt)}</span>}{learningControl}<StatusPill tone="warning">Decision required</StatusPill></div>
      </header>

      <section className={styles.seniorFocusedIntro} aria-labelledby="senior-focused-title" {...getLearningTargetProps(learningMode, "senior-decision-story")}>
        <span>Senior credit decision</span>
        <h1 id="senior-focused-title">Review analyst recommendation</h1>
        <p>Alex Kim completed the review and submitted a recommendation. Morgan Lee now owns the final credit decision.</p>
      </section>

      <div className={styles.seniorFocusedLayout}>
        <main className={styles.seniorFocusedBrief}>
          <section className={styles.seniorRecommendationHero} aria-labelledby="senior-recommendation-title" {...getLearningTargetProps(learningMode, "senior-recommendation")}>
            <div className={styles.seniorRecommendationTitle}>
              <span>Alex Kim recommends</span>
              <div><h2 id="senior-recommendation-title">{recommendation.decision}</h2><StatusPill tone="info">Submitted</StatusPill></div>
            </div>
            <p>{recommendation.rationale}</p>
            <KeyValueGrid className={styles.seniorRecommendationFacts} columns={4} items={[
              { label: "Requested amount", value: "$18,000,000" },
              { label: "Facility", value: "3-year revolver" },
              { label: "Prepared by", value: recommendation.author },
              { label: "Submitted", value: new Date(recommendation.createdAt).toLocaleDateString() },
            ]} />
          </section>

          {escalatedOutcomes.length > 0 && (
            <Notice tone="warning" title={`${escalatedOutcomes.length} ${escalatedOutcomes.length === 1 ? "finding needs" : "findings need"} explicit judgment`}>
              {escalatedOutcomes.map((outcome) => outcome.finding.title).join(", ")} remains visible for senior attention; the analyst did not silently resolve it.
            </Notice>
          )}

          <section className={styles.seniorOutcomeSection} aria-labelledby="senior-outcomes-title" {...getLearningTargetProps(learningMode, "senior-findings")}>
            <SectionHeader headingId="senior-outcomes-title" title="Finding outcomes" description="Review the analyst-owned conclusions without reopening every evidence dossier." />
            <div className={styles.seniorOutcomeLedger}>
              {outcomes.map((outcome) => (
                <article key={outcome.finding.id} data-attention={outcome.state === "escalated" || undefined}>
                  <IconTile size="sm" tone={outcome.tone}><Icon name={outcome.icon} size="sm" /></IconTile>
                  <span><strong>{outcome.finding.title}</strong><small>{outcome.scanDetail} · {outcome.risk} risk</small></span>
                  <StatusPill tone={outcome.presentation.tone}>{outcome.shortStatus}</StatusPill>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.seniorSupportingRecord} aria-label="Supporting case record">
            <div><span>Supporting record</span><strong>{recommendation.conditions.length} protections proposed · 12 sources reviewed</strong><p>Open the underlying case only when you need to verify a conclusion or source.</p></div>
            <div><Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Findings</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("sources")}>Sources</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("activity")}>Activity</Button></div>
          </section>

          <details className={styles.seniorAiSupport}>
            <summary>
              <IconTile size="sm" tone="neutral"><Icon name="spark" size="sm" /></IconTile>
              <span><strong>Supporting AI assessment</strong><small>Read-only · Supporting context, not the decision</small></span>
              <Icon name="chevronDown" size="sm" />
            </summary>
            <div><p>Repayment appears supportable under the base case, with concentration reporting, leverage, and fixed-charge coverage protections.</p><small>AI summarized the reviewed record. It cannot change the analyst recommendation or submit the final decision.</small></div>
          </details>
        </main>

        <aside className={styles.seniorDecisionComposer} aria-labelledby="senior-decision-form-title" {...getLearningTargetProps(learningMode, "senior-final-action")}>
          <form onSubmit={submitDecision}>
            <header className={styles.seniorDecisionComposerHeader}>
              <span>Human-owned action</span>
              <h2 id="senior-decision-form-title">Make final decision</h2>
              <p>Select an outcome, confirm any final protections, and record the decision.</p>
            </header>

            <fieldset className={styles.seniorFocusedOptions}>
              <legend>Decision</legend>
              {seniorDecisionOptions.map((option) => (
                <label key={option.value} data-selected={decision === option.value}>
                  <input type="radio" name="focused-senior-decision" aria-label={option.label} checked={decision === option.value} onChange={() => updateDecision(option.value)} />
                  <IconTile size="sm" tone={decision === option.value ? option.tone : "neutral"}><Icon name={option.icon} size="sm" /></IconTile>
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                </label>
              ))}
            </fieldset>

            {conditionsRequired && (
              <fieldset className={styles.seniorFocusedConditions}>
                <legend>Final approval conditions</legend>
                <p>These covenants and reporting requirements will be included in the recorded approval. Alex proposed {recommendation.conditions.length}.</p>
                <div>
                  {availableConditions.map((condition) => (
                    <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span>{condition}</span></label>
                  ))}
                </div>
                {conditions.length === 0 && <small role="alert">Select at least one condition to approve with conditions.</small>}
              </fieldset>
            )}

            <label className={styles.seniorFocusedRationale}>
              <span>Decision note <small>{rationaleRequired ? "Required" : "Optional"}</small></span>
              <textarea value={rationale} placeholder={decision === "return_to_analyst" ? "Explain what Alex needs to revise..." : decision === "decline" ? "Record the reason for declining..." : "Record residual concerns or decision reasoning..."} onChange={(event) => updateRationale(event.target.value)} />
            </label>

            <footer className={styles.seniorDecisionComposerFooter}>
              <dl><div><dt>Decision maker</dt><dd>Morgan Lee</dd></div><div><dt>Record</dt><dd>Immutable on submission</dd></div></dl>
              <Button type="submit" variant="primary" disabled={!canSubmit}>{actionLabel}</Button>
              <small><Icon name="lock" size="xs" /> AI cannot submit this decision.</small>
            </footer>
          </form>
        </aside>
      </div>
    </div>
  );
}

function DenseSeniorDecisionWorkspace({ variant, recommendation, outcomes, onSubmit, onNavigate, learningMode = false }: {
  variant: RecommendationVariant;
  recommendation: AnalystRecommendationRecord;
  outcomes: FindingOutcome[];
  onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode?: boolean;
}) {
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"]>("approve_with_conditions");
  const [rationale, setRationale] = useState("");
  const [conditions, setConditions] = useState<string[]>(recommendation.conditions);
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  const variantClass = variant === "open-canvas" ? styles.recommendationOpenCanvas : variant === "icon-led" ? styles.recommendationIconLed : "";

  function toggleCondition(condition: string) {
    setConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition]);
  }

  return (
    <div className={`${styles.seniorWorkspace} ${variantClass}`}>
      <header className={styles.seniorHeader} {...getLearningTargetProps(learningMode, "senior-decision-story")}>
        <div><span>Senior credit decision</span><h1>Review the same case record</h1><p>AI summarizes the record. Morgan Lee owns the final credit decision.</p></div>
        <StatusPill tone="warning">Decision required</StatusPill>
      </header>

      <div className={styles.seniorLayout}>
        <main className={styles.seniorRecord}>
          <Panel className={styles.decisionBrief} {...getLearningTargetProps(learningMode, "senior-recommendation")}>
            <SectionHeader title="Decision brief" description="Original request, human recommendation, material evidence changes, and residual risks." />
            <KeyValueGrid columns={3} items={[
              { label: "Original request", value: "$18M · 3-year revolver" },
              { label: "Analyst recommendation", value: recommendation.decision },
              { label: "Prepared by", value: `${recommendation.author} · ${new Date(recommendation.createdAt).toLocaleDateString()}` },
            ]} />
            <section className={styles.recordSection}><span>Analyst rationale</span><p>{recommendation.rationale}</p></section>
            <section className={styles.recordSection}><span>AI assessment · Read only</span><p>Proceed with conditions. Repayment appears supportable, with concentration, margin, and leverage protections.</p></section>
            <div className={styles.decisionSignals}>
              {outcomes.map((outcome) => (
                <section key={outcome.finding.id}>
                  <span>{outcome.presentation.label}</span>
                  <strong>{outcome.finding.title} · {outcome.risk} risk</strong>
                  <p>{outcome.detail}</p>
                </section>
              ))}
            </div>
            <section className={styles.recordSection}><span>Proposed conditions</span><ul>{recommendation.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul></section>
            <div className={styles.recordLinks}><Button variant="quiet" size="sm" onClick={() => onNavigate("findings")}>Review findings</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("sources")}>Supporting sources</Button><Button variant="quiet" size="sm" onClick={() => onNavigate("activity")}>Activity history</Button></div>
          </Panel>
        </main>

        <aside className={styles.seniorActionCard} {...getLearningTargetProps(learningMode, "senior-final-action")}>
          <header><span>Human-owned action</span><h2>Record final decision</h2><p>Submission creates an immutable, attributable record.</p></header>
          <fieldset className={styles.seniorOptions}>
            <legend>Decision</legend>
            {seniorDecisionOptions.map((option) => <label key={option.value} data-selected={decision === option.value}><input type="radio" name="senior-decision" checked={decision === option.value} onChange={() => setDecision(option.value)} />{variant === "icon-led" && <IconTile size="sm" tone={decision === option.value ? "info" : "neutral"}><Icon name={option.icon} size="sm" /></IconTile>}<span>{option.label}</span></label>)}
          </fieldset>

          {conditionsRequired && <fieldset className={styles.seniorConditions}><legend>Approval conditions <small>At least one required</small></legend>{availableConditions.map((condition) => <label key={condition}><input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span>{condition}</span></label>)}</fieldset>}

          <label className={styles.textareaField}><span>Senior rationale {rationaleRequired ? "· Required" : "· Optional"}</span><textarea value={rationale} placeholder="Record decision reasoning, residual concerns, or return instructions..." onChange={(event) => setRationale(event.target.value)} /></label>
          <dl className={styles.seniorAttribution}><div><dt>Decision maker</dt><dd>Morgan Lee · Senior credit officer</dd></div><div><dt>Recorded</dt><dd>On submission</dd></div></dl>
          <Button variant="primary" disabled={!canSubmit} onClick={() => onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] })}>Record final decision</Button>
          <small className={styles.aiBoundary}><Icon name="lock" size="xs" /> AI cannot submit this decision.</small>
        </aside>
      </div>
    </div>
  );
}
