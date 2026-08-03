import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import type { PolicyRuleId } from "../policyRulesData";
import styles from "./AssessmentPoliciesOverview.module.css";

export type AssessmentPolicySummary = {
  id: PolicyRuleId;
  titleLines: readonly [firstLine: string, secondLine: string];
  icon: IconName;
};

type AssessmentPolicyCardProps = {
  policy: AssessmentPolicySummary;
  onOpenDetail: (ruleId: PolicyRuleId) => void;
};

export function AssessmentPolicyCard({ policy, onOpenDetail }: AssessmentPolicyCardProps) {
  const accessibleName = policy.titleLines.join(" ");

  return (
    <li>
      <button
        type="button"
        className={styles.policyCard}
        aria-label={`Open ${accessibleName}`}
        onClick={() => onOpenDetail(policy.id)}
      >
        <IconTile className={styles.policyIcon}>
          <Icon name={policy.icon} size="md" />
        </IconTile>
        <h2 aria-label={accessibleName}>
          {policy.titleLines.map((line) => <span key={line}>{line}</span>)}
        </h2>
        <Icon name="chevronRight" size="sm" />
      </button>
    </li>
  );
}
