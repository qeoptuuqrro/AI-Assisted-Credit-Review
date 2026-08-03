import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { ObjectHeader } from "../../../shared/ui/ObjectHeader/ObjectHeader";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import type { PolicyRuleStatus } from "../policyRulesData";
import { leverageCeilingRule } from "../policyRulesData";
import { MeridianPolicyPreview } from "./MeridianPolicyPreview";
import styles from "./PolicyRuleDetail.module.css";

type PolicyRuleDetailProps = {
  status: PolicyRuleStatus;
  onBack: () => void;
  onToggleStatus: () => void;
  canChangeStatus?: boolean;
};

export function PolicyRuleDetail({ status, onBack, onToggleStatus, canChangeStatus = true }: PolicyRuleDetailProps) {
  return (
    <div className={styles.detailPage}>
      <ObjectHeader
        className={styles.detailHeader}
        backLabel="Assessment policies"
        onBack={onBack}
        logo={<IconTile><Icon name="scale" size="md" /></IconTile>}
        title={leverageCeilingRule.name}
        metadata={[leverageCeilingRule.scope.label, leverageCeilingRule.version]}
        status={<StatusPill tone={status === "active" ? "success" : "neutral"}>{status === "active" ? "Active" : "Paused"}</StatusPill>}
        action={(
          <Button
            variant="secondary"
            disabled={!canChangeStatus}
            title={!canChangeStatus ? "Requires policy admin permission" : undefined}
            onClick={onToggleStatus}
          >
            {status === "active" ? "Pause rule" : "Activate rule"}
          </Button>
        )}
      />

      <div className={styles.detailBody}>
        <section className={styles.ruleSummary} aria-labelledby="how-it-works-heading">
          <span className={styles.eyebrow}>Rule logic</span>
          <h2 id="how-it-works-heading">Verified debt / EBITDA must stay at or below 4.25x.</h2>
          <div className={styles.ruleFormula} aria-label="Verified debt divided by EBITDA must be at or below 4.25x">
            <span><small>Metric</small><strong>Debt / EBITDA</strong></span>
            <Icon name="arrowRight" size="sm" />
            <span><small>Facility maximum</small><strong>4.25x</strong></span>
          </div>
        </section>

        <div className={styles.guardrails}>
          <section className={styles.guardrail} aria-labelledby="evidence-gate-heading">
            <IconTile tone="warning" size="sm"><Icon name="lock" size="sm" /></IconTile>
            <div className={styles.guardrailCopy}>
              <div className={styles.guardrailHeading}>
                <h2 id="evidence-gate-heading">Evidence gate</h2>
                <StatusPill tone="warning">Pause</StatusPill>
              </div>
              <p>Classify every material obligation before applying the limit.</p>
            </div>
          </section>
          <section className={styles.guardrail} aria-labelledby="human-action-heading">
            <IconTile size="sm"><Icon name="users" size="sm" /></IconTile>
            <div className={styles.guardrailCopy}>
              <div className={styles.guardrailHeading}>
                <h2 id="human-action-heading">Required human action</h2>
                <StatusPill tone="info">Judgment</StatusPill>
              </div>
              <p>An analyst owns the recommendation, even when the ratio passes.</p>
            </div>
          </section>
        </div>

        <section className={styles.caseSection} aria-labelledby="meridian-heading">
          <header className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Verified case</span>
            <h2 id="meridian-heading">Meridian Foods example</h2>
          </header>
          <MeridianPolicyPreview ruleStatus={status} />
        </section>

        <section className={styles.assessmentDisclosure} aria-labelledby="assessment-bands-heading">
          <h2 id="assessment-bands-heading" className={styles.visuallyHidden}>Assessment bands</h2>
          <details>
            <summary>
              <span><strong>Assessment bands</strong><small>Threshold ranges and calculation detail</small></span>
              <Icon name="chevronDown" size="sm" />
            </summary>
            <ol className={styles.assessmentBands} aria-label="Leverage assessment bands">
              <li className={styles.bandLower}>
                <strong>Below 3.5x</strong>
                <span>Lower concern</span>
              </li>
              <li className={styles.bandModerate}>
                <strong>3.5x-4.25x</strong>
                <span>Moderate</span>
              </li>
              <li className={styles.bandException}>
                <strong>Above 4.25x</strong>
                <span>Policy exception</span>
              </li>
            </ol>
          </details>
        </section>
      </div>
    </div>
  );
}
