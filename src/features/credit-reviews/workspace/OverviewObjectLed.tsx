import type { CSSProperties } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import {
  findings,
  isSourceReviewReady,
  sources,
  type FindingId,
  type FindingWorkflowState,
  type ReviewTab,
  type SourceReviewState,
} from "./meridianData";
import { currentJudgmentForFinding, isFindingAddressed, type JudgmentRecord } from "../workflow/creditReviewState";
import { getFindingDisplayRisk, getFindingDisplaySummary, getFindingStatusPresentation } from "./findingJudgmentPresentation";
import { companyLogoDomains } from "../companyLogos";
import styles from "./OverviewObjectLed.module.css";

type OverviewObjectLedProps = {
  findingStates: Record<FindingId, FindingWorkflowState>;
  judgments: JudgmentRecord[];
  reassessedFindings: Record<FindingId, boolean>;
  concentrationReassessed: boolean;
  sourceReviewStates: Record<string, SourceReviewState>;
  onOpenFinding: (id: FindingId) => void;
  onNavigate: (tab: ReviewTab) => void;
};

const signalCopy: Record<FindingId, { value: string; detail: string }> = {
  "customer-concentration": { value: "61%", detail: "from top two customers" },
  "declining-margins": { value: "9.1%", detail: "from 14.2% in 2024" },
  "increasing-leverage": { value: "3.7x", detail: "vs. 4.25x maximum" },
};

export function OverviewObjectLed({
  findingStates,
  judgments,
  reassessedFindings,
  concentrationReassessed,
  sourceReviewStates,
  onOpenFinding,
  onNavigate,
}: OverviewObjectLedProps) {
  const unresolved = findings.filter((finding) => !isFindingAddressed(findingStates[finding.id]));
  const reviewReady = unresolved.length === 0;
  const leverageReassessed = reassessedFindings["increasing-leverage"];
  const readySources = sources.filter((source) => isSourceReviewReady(source, sourceReviewStates[source.id])).length;
  const attentionSources = sources.length - readySources;

  return (
    <div className={styles.stack}>
      <section className={styles.hero} aria-labelledby="object-led-assessment-title">
        <div className={styles.objectStage}>
          <FacilityObject leverageReassessed={leverageReassessed} />
          <p className={styles.relationshipContext}>8-year relationship <span>·</span> $6.8M average collected balances</p>
        </div>

        <div className={styles.decisionColumn}>
          <header className={styles.decisionTopline}>
            <span>{reviewReady ? "Analyst review" : "Initial AI assessment"}</span>
            <small>Updated today, 10:24 AM</small>
          </header>

          <h2 id="object-led-assessment-title">{reviewReady ? "Ready to draft recommendation" : "Proceed with conditions"}</h2>
          <p className={styles.decisionSummary}>{reviewReady ? "Every finding has an attributable analyst outcome and is ready for senior handoff." : `Repayment clears the base case, with ${unresolved.length} ${unresolved.length === 1 ? "finding" : "findings"} requiring analyst review.`}</p>

          <div className={styles.signalList} aria-label={reviewReady ? "Recorded review outcomes" : "Reasons for the initial assessment"}>
            {findings.map((finding) => {
              const signal = finding.id === "increasing-leverage" && leverageReassessed
                ? { value: "3.9x", detail: "with 0.35x covenant headroom" }
                : signalCopy[finding.id];
              return (
              <button
                type="button"
                className={styles.signalRow}
                key={finding.id}
                onClick={() => onOpenFinding(finding.id)}
              >
                <span className={styles.signalCopy}>
                  <span>{finding.title}</span>
                  <span><strong>{signal.value}</strong> {signal.detail}</span>
                </span>
                <FindingVisual id={finding.id} variant="signal" />
                <Icon name="chevronRight" size="xs" />
              </button>
              );
            })}
          </div>

          <footer className={styles.decisionFooter}>
            <div>
              <strong>{readySources} of {sources.length} sources ready</strong>
              <span>{attentionSources} require verification before decision.</span>
            </div>
            <Button
              size="sm"
              variant="quiet"
              icon={<Icon name="arrowRight" size="xs" />}
              onClick={() => onNavigate("activity")}
            >
              Assessment history
            </Button>
          </footer>
        </div>
      </section>

      <section className={styles.priorities} aria-labelledby="object-led-priorities-title">
        <SectionHeader
          headingId="object-led-priorities-title"
          title="Review priorities"
          description={unresolved.length > 0
            ? `${unresolved.length} findings still separate the base case from a final recommendation.`
            : "All findings are complete and ready for recommendation."}
          actions={<Button size="sm" variant="quiet" onClick={() => onNavigate("findings")}>View all findings</Button>}
        />

        <div className={styles.priorityList}>
          {findings.map((finding) => {
            const state = findingStates[finding.id];
            const judgment = currentJudgmentForFinding(judgments, finding.id);
            const presentation = getFindingStatusPresentation(state, judgment);
            const risk = getFindingDisplayRisk(finding, reassessedFindings[finding.id] || (finding.id === "customer-concentration" && concentrationReassessed), judgment);

            return (
              <button
                type="button"
                className={styles.priorityRow}
                key={finding.id}
                onClick={() => onOpenFinding(finding.id)}
              >
                <FindingVisual id={finding.id} variant="priority" />
                <span className={styles.priorityCopy}>
                  <small>{risk} risk</small>
                  <strong>{finding.title}</strong>
                  <span>{getFindingDisplaySummary(finding, reassessedFindings[finding.id], judgment)}</span>
                </span>
                <StatusPill tone={presentation.tone}>{presentation.label}</StatusPill>
                <Icon name="chevronRight" size="sm" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FacilityObject({ leverageReassessed }: { leverageReassessed: boolean }) {
  return (
    <article className={styles.facilityObject} aria-label="Proposed $18 million working-capital facility">
      <header className={styles.facilityHeader}>
        <span><CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" /> Meridian Foods</span>
        <small>CR-2048</small>
      </header>

      <div className={styles.facilityCommitment}>
        <span>Working-capital revolver</span>
        <strong>$18M</strong>
        <small>Total commitment</small>
      </div>

      <section className={styles.facilityDraw} aria-label="$11.7 million proposed initial draw, 65 percent of commitment">
        <div><span>Proposed initial use</span><strong>$11.7M</strong></div>
        <div className={styles.utilizationTrack} role="img" aria-label="65 percent utilized"><span /></div>
        <div className={styles.utilizationLabels}><span>65% drawn</span><span>$18M limit</span></div>
      </section>

      <section className={styles.facilityTerm} aria-label="Three-year term from 2026 to 2029">
        <div><span>Close</span><strong>2026</strong></div>
        <span className={styles.termRail} aria-hidden="true"><i /><i /></span>
        <div><span>Maturity</span><strong>2029</strong></div>
      </section>

      <dl className={styles.guardrailList}>
        <Guardrail
          label="Coverage"
          current="1.41x"
          threshold="1.20x minimum"
          currentPosition="67%"
          thresholdPosition="30%"
          tone="positive"
        />
        <Guardrail
          label="Leverage"
          current={leverageReassessed ? "3.9x" : "3.7x"}
          threshold="4.25x maximum"
          currentPosition={leverageReassessed ? "78%" : "74%"}
          thresholdPosition="85%"
          tone="warning"
        />
      </dl>
    </article>
  );
}

function Guardrail({
  label,
  current,
  threshold,
  currentPosition,
  thresholdPosition,
  tone,
}: {
  label: string;
  current: string;
  threshold: string;
  currentPosition: string;
  thresholdPosition: string;
  tone: "positive" | "warning";
}) {
  const positions = {
    "--current-position": currentPosition,
    "--threshold-position": thresholdPosition,
  } as CSSProperties;

  return (
    <div className={styles.guardrail} data-tone={tone}>
      <dt>{label}</dt>
      <dd><strong>{current}</strong><span>{threshold}</span></dd>
      <span className={styles.guardrailTrack} style={positions} aria-hidden="true"><i /><b /></span>
    </div>
  );
}

function FindingVisual({ id, variant }: { id: FindingId; variant: "signal" | "priority" }) {
  return (
    <span className={styles.findingVisual} data-finding={id} data-variant={variant} aria-hidden="true">
      {id === "customer-concentration" && (
        <span className={styles.concentrationVisual}>
          <span className={styles.segmentA} />
          <span className={styles.segmentB} />
          <span className={styles.segmentOther} />
          <i />
        </span>
      )}

      {id === "declining-margins" && (
        <svg className={styles.marginVisual} viewBox="0 0 156 32" preserveAspectRatio="none">
          <path d="M2 5 C24 6, 34 8, 52 11 S82 18, 98 20 S127 26, 154 28" />
          <circle cx="2" cy="5" r="2" />
          <circle cx="154" cy="28" r="2" />
        </svg>
      )}

      {id === "increasing-leverage" && (
        <span className={styles.leverageVisual}>
          <span><i /></span>
          <b />
        </span>
      )}
    </span>
  );
}
