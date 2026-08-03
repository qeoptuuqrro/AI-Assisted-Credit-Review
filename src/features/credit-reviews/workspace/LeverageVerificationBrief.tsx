import type { HTMLAttributes } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Panel } from "../../../shared/ui/Panel/Panel";
import styles from "./LeverageVerificationBrief.module.css";

type LeverageVerificationBriefProps = {
  actionLabel?: "Add verification evidence" | "Review evidence" | "View request";
  onReviewEvidence: (trigger: HTMLButtonElement) => void;
  learningTargetProps?: HTMLAttributes<HTMLElement>;
};

export function LeverageVerificationBrief({
  actionLabel = "Add verification evidence",
  onReviewEvidence,
  learningTargetProps,
}: LeverageVerificationBriefProps) {
  const {
    className: learningClassName = "",
    "aria-label": learningAriaLabel,
    ...learningProps
  } = learningTargetProps ?? {};

  return (
    <section
      {...learningProps}
      className={`${styles.brief} ${learningClassName}`.trim()}
      aria-label={learningAriaLabel ?? "Leverage capacity and required verification"}
    >
      <Panel
        className={`${styles.panel} ${styles.capacityPanel}`}
        elevation="flat"
        role="group"
        aria-labelledby="leverage-capacity-title"
      >
        <header className={styles.panelHeader}>
          <IconTile size="sm" tone="info">
            <Icon name="chart" size="sm" />
          </IconTile>
          <h2 id="leverage-capacity-title">Current leverage position</h2>
        </header>

        <div className={styles.metricBlock}>
          <div className={styles.metricLine}>
            <strong className={styles.metricValue}>3.7x</strong>
            <span className={styles.metricLabel}>Debt / EBITDA</span>
          </div>
          <p className={styles.metricTranslation}>
            About <strong>$3.70 of debt</strong> for every <strong>$1 of EBITDA</strong>, a measure of operating earnings.
          </p>
          <div className={styles.capacitySummary}>
            <span><strong>0.55x</strong> below the proposed 4.25x maximum</span>
          </div>
        </div>

        <div className={styles.gaugeFrame}>
          <div
            className={styles.capacityGauge}
            role="img"
            aria-label="Current leverage is 3.7 times debt to EBITDA, 0.55 times below the proposed 4.25 times maximum."
          >
            <span className={styles.gaugeTrack} aria-hidden="true">
              <span className={styles.gaugeUsed} />
              <span className={styles.gaugeCurrent} />
              <span className={styles.gaugeMaximum} />
            </span>
          </div>
          <div className={styles.gaugeLabels} aria-hidden="true">
            <span>Current 3.7x</span>
            <span>Maximum 4.25x</span>
          </div>
        </div>
      </Panel>

      <Panel
        className={`${styles.panel} ${styles.evidencePanel}`}
        elevation="flat"
        role="group"
        aria-labelledby="leverage-evidence-title"
      >
        <header className={styles.panelHeader}>
          <IconTile size="sm" tone="warning">
            <Icon name="fileCheck" size="sm" />
          </IconTile>
          <h2 id="leverage-evidence-title">Required evidence</h2>
        </header>

        <div className={styles.evidenceMetric}>
          <strong>$2.1M</strong>
          <span>equipment obligation</span>
        </div>

        <p className={styles.evidenceCopy}>
          This amount is not yet included in the debt calculation. Review the agreement to confirm whether it should count as debt.
        </p>

        <div className={styles.gateRow}>
          <Icon name="lock" size="sm" />
          <span>Needed before reassessment and judgment</span>
        </div>

        <div className={styles.actionRow}>
          <Button
            variant="primary"
            icon={<Icon name="arrowRight" size="sm" />}
            onClick={(event) => onReviewEvidence(event.currentTarget)}
          >
            {actionLabel}
          </Button>
        </div>
      </Panel>
    </section>
  );
}
