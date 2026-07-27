import { Icon } from "../Icon/Icon";
import styles from "./ScenarioComparison.module.css";

export type ScenarioComparisonItem = {
  label: string;
  value: string;
  variance: string;
  outcome: string;
  tone?: "positive" | "negative" | "neutral";
};

type ScenarioComparisonProps = {
  items: ScenarioComparisonItem[];
  thresholdLabel: string;
  thresholdValue: string;
};

export function ScenarioComparison({ items, thresholdLabel, thresholdValue }: ScenarioComparisonProps) {
  return (
    <div className={styles.wrap} role="table" aria-label="Repayment scenario comparison">
      <div className={styles.header} role="row">
        <span role="columnheader">Scenario</span><span role="columnheader">Coverage</span><span role="columnheader">Vs. floor</span><span role="columnheader">Outcome</span>
      </div>
      {items.map((item) => (
        <div className={styles.row} role="row" key={item.label}>
          <span className={styles.label} role="cell"><Icon name={item.tone === "negative" ? "trendDown" : "trendUp"} size="sm" />{item.label}</span>
          <strong role="cell">{item.value}</strong>
          <span className={item.tone === "positive" ? styles.positive : item.tone === "negative" ? styles.negative : ""} role="cell">{item.variance}</span>
          <span role="cell">{item.outcome}</span>
        </div>
      ))}
      <div className={styles.floor} role="row">
        <span role="cell"><Icon name="shield" size="sm" />{thresholdLabel}</span>
        <strong role="cell">{thresholdValue}</strong>
        <span role="cell">Reference</span>
        <span role="cell">Policy minimum</span>
      </div>
    </div>
  );
}
