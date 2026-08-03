import { AppLink } from "../../../app/router";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { companyLogoDomains } from "../../credit-reviews/companyLogos";
import { meridianLeverageOutcome, type PolicyRuleStatus } from "../policyRulesData";
import styles from "./PolicyRuleDetail.module.css";

type MeridianPolicyPreviewProps = {
  ruleStatus: PolicyRuleStatus;
};

export function MeridianPolicyPreview({ ruleStatus }: MeridianPolicyPreviewProps) {
  const { calculation, evaluation, risk } = meridianLeverageOutcome;
  if (calculation.state !== "verified" || evaluation.state !== "evaluated") return null;

  const adjustment = calculation.adjustments[0];

  return (
    <div className={styles.example} aria-label="Meridian Foods leverage example">
      <header className={styles.exampleHeader}>
        <div className={styles.exampleIdentity}>
          <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="md" />
          <div>
            <span>Verified case result</span>
            <h3>Meridian Foods</h3>
          </div>
        </div>
        <StatusPill tone={ruleStatus === "active" ? "success" : "neutral"}>
          {ruleStatus === "active" ? "Within proposed max" : "Preview only"}
        </StatusPill>
      </header>

      <dl className={styles.exampleMetrics}>
        <div>
          <dt>Verified leverage</dt>
          <dd>{calculation.result.displayValue}</dd>
        </div>
        <div>
          <dt>Facility maximum</dt>
          <dd>{evaluation.threshold.value.toFixed(2)}x max</dd>
        </div>
        <div>
          <dt>Assessment</dt>
          <dd className={styles.exampleAssessment}>{risk.current}</dd>
        </div>
        <div>
          <dt>Remaining cushion</dt>
          <dd>{evaluation.policyMargin.toFixed(2)}x cushion</dd>
        </div>
      </dl>

      {adjustment && (
        <div className={styles.exampleEvidence}>
          <IconTile size="sm"><Icon name="fileCheck" size="sm" /></IconTile>
          <span><strong>{adjustment.displayAmount} equipment obligation</strong> {adjustment.treatment.toLowerCase()}.</span>
          <AppLink to="/credit-reviews/meridian-foods/findings/increasing-leverage" aria-label="Open the leverage finding">
            <Icon name="arrowRight" size="sm" />
          </AppLink>
        </div>
      )}
    </div>
  );
}
