import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { MetricCard } from "../../../shared/ui/MetricCard/MetricCard";
import { Panel } from "../../../shared/ui/Panel/Panel";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { findings, isSourceReviewReady, sources, type FindingId, type FindingWorkflowState, type ReviewTab, type SourceReviewState } from "./meridianData";
import { OverviewObjectLed } from "./OverviewObjectLed";
import { OverviewAccountView } from "./OverviewAccountView";
import { getCreditFindingIcon } from "../creditReviewPresentation";
import { currentJudgmentForFinding, isFindingAddressed, type JudgmentRecord } from "../workflow/creditReviewState";
import { getFindingDisplayRisk, getFindingDisplaySummary, getFindingStatusPresentation } from "./findingJudgmentPresentation";
import styles from "./MeridianReviewWorkspace.module.css";

type OverviewTabProps = {
  findingStates: Record<FindingId, FindingWorkflowState>;
  judgments: JudgmentRecord[];
  reassessedFindings: Record<FindingId, boolean>;
  concentrationReassessed: boolean;
  sourceReviewStates: Record<string, SourceReviewState>;
  onOpenFinding: (id: FindingId) => void;
  onNavigate: (tab: ReviewTab) => void;
  variant?: "account-view" | "object-led" | "signature" | "card-stack";
  learningMode?: boolean;
};

export function OverviewTab({ findingStates, judgments, reassessedFindings, concentrationReassessed, sourceReviewStates, onOpenFinding, onNavigate, variant = "account-view", learningMode = false }: OverviewTabProps) {
  const unresolved = findings.filter((finding) => !isFindingAddressed(findingStates[finding.id]));
  const readySources = sources.filter((source) => isSourceReviewReady(source, sourceReviewStates[source.id])).length;
  const attentionSources = sources.length - readySources;

  if (variant === "account-view") {
    return (
      <OverviewAccountView
        findingStates={findingStates}
        judgments={judgments}
        reassessedFindings={reassessedFindings}
        concentrationReassessed={concentrationReassessed}
        sourceReviewStates={sourceReviewStates}
        onOpenFinding={onOpenFinding}
        onNavigate={onNavigate}
        learningMode={learningMode}
      />
    );
  }

  if (variant === "object-led") {
    return (
      <OverviewObjectLed
        findingStates={findingStates}
        judgments={judgments}
        reassessedFindings={reassessedFindings}
        concentrationReassessed={concentrationReassessed}
        sourceReviewStates={sourceReviewStates}
        onOpenFinding={onOpenFinding}
        onNavigate={onNavigate}
      />
    );
  }

  if (variant === "card-stack") {
    return <OverviewCardStack findingStates={findingStates} judgments={judgments} reassessedFindings={reassessedFindings} concentrationReassessed={concentrationReassessed} sourceReviewStates={sourceReviewStates} onOpenFinding={onOpenFinding} onNavigate={onNavigate} />;
  }

  return (
    <div className={styles.tabStack}>
      <section className={styles.assessmentHero} aria-labelledby="assessment-title">
        <div className={styles.assessmentProductStage}>
          <FacilityStructure />
        </div>

        <div className={styles.assessmentCopy}>
          <div className={styles.assessmentTopline}>
            <span>{unresolved.length === 0 ? "Analyst review" : "Initial AI assessment"}</span>
            <small>Updated today, 10:24 AM</small>
          </div>
          <h2 id="assessment-title">{unresolved.length === 0 ? "Ready to draft recommendation" : "Proceed with conditions"}</h2>
          <p>{unresolved.length === 0 ? "Every finding has an attributable analyst outcome and is ready for the recommendation record." : "Base-case repayment is supportable. Customer concentration, margin recovery, and leverage still require analyst judgment."}</p>
          <div className={styles.assessmentProtections}>
            <span>Proposed covenants</span>
            <strong>1.20x minimum coverage · 4.25x maximum leverage</strong>
          </div>
          <div className={styles.assessmentFooter}>
            <p className={styles.assessmentProvenance}>{readySources} of {sources.length} sources ready for decision</p>
            <Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onNavigate("activity")}>View assessment history</Button>
          </div>
        </div>
      </section>

      <dl className={styles.caseFactStrip} aria-label="Case summary">
        <div><dt>Evidence readiness</dt><dd><strong>{readySources} of {sources.length}</strong><small>{attentionSources} documents need review</small></dd></div>
        <div><dt>Relationship</dt><dd><strong>8 years</strong><small>$6.8M average collected balances</small></dd></div>
        <div><dt>Expected initial draw</dt><dd><strong>$11.7M</strong><small>65% of total commitment</small></dd></div>
      </dl>

      <section className={styles.reviewPriorities} aria-labelledby="attention-title">
        <SectionHeader
          headingId="attention-title"
          title="Review priorities"
          description={unresolved.length > 0 ? `${unresolved.length} findings require review before recommendation.` : "All findings are complete and ready for recommendation."}
          actions={<Button size="sm" variant="quiet" onClick={() => onNavigate("findings")}>View all findings</Button>}
        />
        <div className={styles.priorityList}>
          {findings.map((finding) => {
            const state = findingStates[finding.id];
            const judgment = currentJudgmentForFinding(judgments, finding.id);
            const presentation = getFindingStatusPresentation(state, judgment);
            const risk = getFindingDisplayRisk(finding, reassessedFindings[finding.id], judgment);
            return (
              <button
                type="button"
                key={finding.id}
                className={styles.priorityRow}
                onClick={() => onOpenFinding(finding.id)}
              >
                <IconTile size="sm"><Icon name={getCreditFindingIcon(finding)} size="sm" /></IconTile>
                <span className={styles.priorityCopy}><strong>{finding.title}</strong><span>{getFindingDisplaySummary(finding, reassessedFindings[finding.id], judgment)}</span></span>
                <span className={styles.priorityMeta}><small>{risk} risk</small><StatusPill tone={presentation.tone}>{presentation.label}</StatusPill></span>
                <Icon name="chevronRight" size="sm" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function OverviewCardStack({ findingStates, judgments, reassessedFindings, concentrationReassessed, sourceReviewStates, onOpenFinding, onNavigate }: Omit<OverviewTabProps, "variant">) {
  const unresolved = findings.filter((finding) => !isFindingAddressed(findingStates[finding.id]));
  const readySources = sources.filter((source) => isSourceReviewReady(source, sourceReviewStates[source.id])).length;
  const attentionSources = sources.length - readySources;

  return (
    <div className={styles.tabStack}>
      <Panel className={styles.decisionSummary}>
        <div className={styles.decisionSummaryTopline}><span>{unresolved.length === 0 ? "Analyst review" : "Initial AI assessment"}</span><span>Updated today, 10:24 AM</span></div>
        <div className={styles.decisionSummaryBody}><div><StatusPill tone={unresolved.length === 0 ? "success" : "neutral"}>{unresolved.length === 0 ? "Analyst reviewed" : "Moderate confidence"}</StatusPill><h2>{unresolved.length === 0 ? "Ready to draft recommendation" : "Proceed with conditions"}</h2><p>{unresolved.length === 0 ? "Every finding has an attributable analyst outcome and is ready for senior handoff." : "Repayment appears supportable, with customer concentration, declining margins, and increasing leverage requiring analyst judgment."}</p></div><Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onNavigate("activity")}>Review assessment history</Button></div>
      </Panel>
      <section className={styles.caseMetricGrid} aria-label="Case summary">
        <MetricCard label="Request" value="$18M" detail="3-year revolving line" />
        <MetricCard label="Evidence readiness" value={`${readySources} of ${sources.length}`} detail={`${attentionSources} documents need review`} />
        <MetricCard label="Relationship" value="8 years" detail="$6.8M average collected balances" />
      </section>
      <Panel className={styles.attentionCard}><section className={styles.sectionBlock} aria-labelledby="legacy-attention-title"><SectionHeader headingId="legacy-attention-title" title="Review priorities" description={unresolved.length > 0 ? `${unresolved.length} findings still require analyst action.` : "All findings have an attributable analyst outcome."} actions={<Button size="sm" variant="quiet" onClick={() => onNavigate("findings")}>View all findings</Button>} /><div className={styles.attentionList}>{findings.map((finding) => { const state = findingStates[finding.id]; const judgment = currentJudgmentForFinding(judgments, finding.id); const presentation = getFindingStatusPresentation(state, judgment); const risk = getFindingDisplayRisk(finding, reassessedFindings[finding.id], judgment); return <button type="button" className={styles.attentionRow} key={finding.id} onClick={() => onOpenFinding(finding.id)}><span className={`${styles.riskIndicator} ${risk === "Material" ? styles.riskMaterial : styles.riskModerate}`} aria-hidden="true" /><span className={styles.attentionCopy}><strong>{finding.title}</strong><span>{getFindingDisplaySummary(finding, reassessedFindings[finding.id], judgment)}</span></span><span className={styles.attentionMeta}><span>{risk} risk</span><StatusPill tone={presentation.tone}>{presentation.label}</StatusPill></span><Icon name="chevronRight" size="sm" /></button>; })}</div></section></Panel>
    </div>
  );
}

function FacilityStructure() {
  return (
    <aside className={styles.facilityObject} aria-label="Proposed credit structure">
      <header className={styles.facilityStructureHeader}>
        <span>Proposed structure</span>
        <small>CR-2048</small>
      </header>
      <div className={styles.facilityCommitment}>
        <span>Commitment</span>
        <strong>$18M</strong>
        <small>Working-capital revolver</small>
      </div>
      <dl className={styles.facilityStructureGrid}>
        <div><dt>Term</dt><dd>3 years</dd></div>
        <div><dt>Initial draw</dt><dd>65%</dd></div>
        <div><dt>Minimum coverage</dt><dd>1.20x</dd></div>
        <div><dt>Maximum leverage</dt><dd>4.25x</dd></div>
      </dl>
    </aside>
  );
}
