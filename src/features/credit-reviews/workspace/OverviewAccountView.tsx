import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import {
  financialSeries,
  findings,
  isSourceReviewReady,
  sources,
  type FindingId,
  type FindingWorkflowState,
  type ReviewTab,
  type SourceReviewState,
} from "./meridianData";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import type { MeridianLearningTopicId } from "../learning/meridianLearningContent";
import { getCreditFindingIcon } from "../creditReviewPresentation";
import { currentJudgmentForFinding, isFindingAddressed, type JudgmentRecord } from "../workflow/creditReviewState";
import { getFindingDisplayRisk, getFindingStatusPresentation } from "./findingJudgmentPresentation";
import styles from "./OverviewAccountView.module.css";

type OverviewAccountViewProps = {
  findingStates: Record<FindingId, FindingWorkflowState>;
  judgments: JudgmentRecord[];
  reassessedFindings: Record<FindingId, boolean>;
  concentrationReassessed: boolean;
  sourceReviewStates: Record<string, SourceReviewState>;
  onOpenFinding: (id: FindingId) => void;
  onNavigate: (tab: ReviewTab) => void;
  learningMode?: boolean;
};

function prioritySignal(id: FindingId, reassessed: boolean) {
  if (id === "customer-concentration") return { value: "61%", label: "Top-two revenue" };
  if (id === "declining-margins") return { value: "9.1%", label: "EBITDA margin" };
  return { value: reassessed ? "3.9x" : "3.7x", label: "Debt / EBITDA" };
}

const chartWidth = 600;
const chartHeight = 250;
const plotLeft = 42;
const plotRight = 580;
const plotTop = 20;
const plotBottom = 208;
const chartMin = 1;
const chartMax = 1.8;

function chartX(index: number) {
  return plotLeft + ((plotRight - plotLeft) * index) / (financialSeries.coverage.points.length - 1);
}

function chartY(value: number) {
  return plotTop + ((chartMax - value) / (chartMax - chartMin)) * (plotBottom - plotTop);
}

function linePath(points: Array<[number, number]>) {
  return points.map(([index, value], pointIndex) => `${pointIndex === 0 ? "M" : "L"}${chartX(index)} ${chartY(value)}`).join(" ");
}

const actualCoverage = financialSeries.coverage.points.slice(0, 7).map((value, index) => [index, value] as [number, number]);
const baseCoverage = financialSeries.coverage.points.slice(6).map((value, index) => [index + 6, value] as [number, number]);
const downsideCoverage = [1.41, 1.28, 1.16, 1.12, 1.24].map((value, index) => [index + 6, value] as [number, number]);
const baseAreaPath = `${linePath(baseCoverage)} L${chartX(10)} ${plotBottom} L${chartX(6)} ${plotBottom} Z`;

export function OverviewAccountView({
  findingStates,
  judgments,
  reassessedFindings,
  concentrationReassessed,
  sourceReviewStates,
  onOpenFinding,
  onNavigate,
  learningMode = false,
}: OverviewAccountViewProps) {
  const unresolved = findings.filter((finding) => !isFindingAddressed(findingStates[finding.id]));
  const readySources = sources.filter((source) => isSourceReviewReady(source, sourceReviewStates[source.id])).length;
  const learn = (topicId: MeridianLearningTopicId) => getLearningTargetProps(learningMode, topicId);

  return (
    <div className={styles.stack}>
      <section className={styles.hero} aria-labelledby="account-overview-title">
        <div className={styles.accountSummary} {...learn("initial-assessment")}>
          <span className={styles.eyebrow}>{unresolved.length === 0 ? "Analyst review" : "Initial AI assessment"}</span>
          <h2 id="account-overview-title">{unresolved.length === 0 ? "Ready to draft recommendation" : "Proceed with conditions"}</h2>

          <div className={styles.requestAmount} {...learn("facility-request")}>
            <strong>$18M</strong>
            <span>Working-capital revolver</span>
          </div>

          <dl className={styles.accountFacts}>
            <div {...learn("facility-term")}><dt>Term</dt><dd>3 years</dd></div>
            <div {...learn("initial-use")}><dt>Initial use</dt><dd>$11.7M</dd></div>
            <div {...learn("pro-forma-leverage")}><dt>Pro forma leverage</dt><dd>{reassessedFindings["increasing-leverage"] ? "3.9x" : "3.7x"}</dd></div>
          </dl>

          <footer className={styles.summaryFooter} {...learn("source-readiness")}>
            <span><strong>{readySources} of {sources.length}</strong> sources ready</span>
            <Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onNavigate("activity")}>History</Button>
          </footer>
        </div>

        <div className={styles.chartPanel} {...learn("coverage-chart")}>
          <header className={styles.chartHeader} {...learn("fixed-charge-coverage")}>
            <div>
              <span>Fixed-charge coverage</span>
              <strong>1.41x</strong>
              <small>Current</small>
            </div>
            <Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onNavigate("financials")}>Financials</Button>
          </header>

          <CoverageChart />

          <div className={styles.chartLegend} aria-label="Chart legend">
            <span data-series="actual"><i />Actual</span>
            <span data-series="base"><i />Base case</span>
            <span data-series="downside"><i />Downside</span>
            <span data-series="covenant"><i />1.20x minimum</span>
          </div>
        </div>
      </section>

      <section className={styles.priorities} aria-labelledby="account-priorities-title" {...learn("review-priorities")}>
        <SectionHeader
          headingId="account-priorities-title"
          title="Review priorities"
          actions={<Button size="sm" variant="quiet" onClick={() => onNavigate("findings")}>{unresolved.length} open · View all</Button>}
        />

        <div className={styles.priorityLedger} role="table" aria-label="Review priorities">
          <div className={styles.priorityHeader} role="row">
            <span className={styles.priorityItemHeader} role="columnheader">Review item</span>
            <span role="columnheader">Key signal</span>
            <span role="columnheader">Risk</span>
            <span role="columnheader">Status</span>
            <span aria-hidden="true" />
          </div>

          <div role="rowgroup">
            {findings.map((finding) => {
              const state = findingStates[finding.id];
              const judgment = currentJudgmentForFinding(judgments, finding.id);
              const presentation = getFindingStatusPresentation(state, judgment);
              const risk = getFindingDisplayRisk(finding, reassessedFindings[finding.id], judgment);
              const signal = prioritySignal(finding.id, reassessedFindings[finding.id]);

              return (
                <button
                  type="button"
                  role="row"
                  className={styles.priorityRow}
                  key={finding.id}
                  {...learn(finding.id)}
                  onClick={() => onOpenFinding(finding.id)}
                >
                  <IconTile className={styles.priorityIcon} size="sm"><Icon name={getCreditFindingIcon(finding)} size="sm" /></IconTile>
                  <span className={styles.priorityTitle} role="cell"><strong>{finding.title}</strong></span>
                  <span className={styles.prioritySignal} role="cell"><strong>{signal.value}</strong><small>{signal.label}</small></span>
                  <span className={styles.priorityRisk} role="cell" data-risk={risk.toLowerCase()}>{risk}</span>
                  <span className={styles.priorityStatus} role="cell"><StatusPill tone={presentation.tone}>{presentation.label}</StatusPill></span>
                  <Icon name="chevronRight" size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function CoverageChart() {
  const covenantY = chartY(1.2);

  return (
    <div className={styles.chartCanvas}>
      <svg
        className={styles.coverageChart}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Fixed-charge coverage declined from 1.72 times to 1.41 times. The base case remains above the 1.20 times minimum while the downside reaches 1.12 times."
      >
        {[1.8, 1.6, 1.4, 1.2].map((value) => (
          <g key={value}>
            <line className={styles.gridLine} x1={plotLeft} x2={plotRight} y1={chartY(value)} y2={chartY(value)} />
            <text className={styles.axisLabel} x="0" y={chartY(value) + 4}>{value.toFixed(1)}x</text>
          </g>
        ))}

        <line className={styles.covenantLine} x1={plotLeft} x2={plotRight} y1={covenantY} y2={covenantY} />
        <path className={styles.baseArea} d={baseAreaPath} />
        <path className={styles.actualLine} d={linePath(actualCoverage)} />
        <path className={styles.baseLine} d={linePath(baseCoverage)} />
        <path className={styles.downsideLine} d={linePath(downsideCoverage)} />

        <circle className={styles.currentPoint} cx={chartX(6)} cy={chartY(1.41)} r="4" />
        <circle className={styles.downsidePoint} cx={chartX(9)} cy={chartY(1.12)} r="4" />
        <text className={styles.pointLabel} x={chartX(6) - 5} y={chartY(1.41) - 12} textAnchor="end">1.41x</text>
        <text className={styles.downsideLabel} x={chartX(9)} y={chartY(1.12) + 22} textAnchor="middle">1.12x</text>

        <text className={styles.periodLabel} x={chartX(0)} y="238" textAnchor="start">Q4 ’24</text>
        <text className={styles.periodLabel} x={chartX(6)} y="238" textAnchor="middle">Q2 ’26</text>
        <text className={styles.periodLabel} x={chartX(10)} y="238" textAnchor="end">Q2 ’27F</text>
      </svg>
    </div>
  );
}
