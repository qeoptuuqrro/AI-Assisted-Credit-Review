import { Button } from "../../../shared/ui/Button/Button";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { Text } from "../../../shared/ui/Text/Text";
import type { PolicyRule, PolicyRuleId } from "../policyRulesData";
import { AssessmentPolicyCard, type AssessmentPolicySummary } from "./AssessmentPolicyCard";
import styles from "./AssessmentPoliciesOverview.module.css";

type AssessmentPoliciesOverviewProps = {
  rules: readonly PolicyRule[];
  canCreate: boolean;
  onCreate: () => void;
  onOpenDetail: (ruleId: PolicyRuleId) => void;
};

const policyPresentation: Record<PolicyRuleId, Pick<
  AssessmentPolicySummary,
  "titleLines" | "icon"
>> = {
  "downside-coverage-floor": {
    titleLines: ["Coverage", "floor"],
    icon: "calculator",
  },
  "leverage-ceiling": {
    titleLines: ["Leverage", "ceiling"],
    icon: "scale",
  },
  "customer-concentration-monitoring": {
    titleLines: ["Customer", "concentration"],
    icon: "users",
  },
  "forecast-completeness-requirement": {
    titleLines: ["Forecast", "completeness"],
    icon: "fileCheck",
  },
};

export function AssessmentPoliciesOverview({ rules, canCreate, onCreate, onOpenDetail }: AssessmentPoliciesOverviewProps) {
  const policies = rules.map<AssessmentPolicySummary>((rule) => ({
    id: rule.id,
    ...policyPresentation[rule.id],
  }));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <Text as="h1" variant="pageTitle">Assessment policies</Text>
          <Text as="p" variant="bodySecondary">
            Bank-defined thresholds, evidence requirements, and review actions.
          </Text>
        </div>
        <Button
          variant="soft"
          icon={<Icon name="plus" size="sm" />}
          iconPosition="start"
          disabled={!canCreate}
          title={!canCreate ? "Requires policy draft permission" : undefined}
          onClick={onCreate}
        >
          Create policy
        </Button>
      </header>

      <section className={styles.policySection} aria-labelledby="active-assessment-policies">
        <h2 id="active-assessment-policies" className={styles.visuallyHidden}>Active assessment policies</h2>
        <ul className={styles.policyGrid}>
          {policies.map((policy) => (
            <AssessmentPolicyCard
              key={policy.id}
              policy={policy}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
