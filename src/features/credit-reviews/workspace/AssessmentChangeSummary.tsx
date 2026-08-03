import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import type { EvidenceRequirement } from "../workflow/evidenceWorkflow";
import styles from "./AssessmentChangeSummary.module.css";

type AssessmentChangeSummaryProps = {
  result: EvidenceRequirement["result"];
  context?: "finding" | "flow";
  presentation?: "ledger-v1" | "detail-v2" | "decision-led" | "verification-led";
};

export function AssessmentChangeSummary({
  result,
  context = "finding",
  presentation = context === "finding" ? "detail-v2" : "ledger-v1",
}: AssessmentChangeSummaryProps) {
  const hasRiskComparison = Boolean(result.initialRisk && result.updatedRisk);
  const riskChanged = hasRiskComparison && result.initialRisk !== result.updatedRisk;
  const verificationLed = presentation === "verification-led";
  const riskDescription = riskChanged
    ? "The verified evidence changed the risk band."
    : "The evidence changed; the risk band did not.";

  return (
    <section
      className={styles.summary}
      data-context={context}
      data-presentation={presentation}
      aria-label={context === "finding" ? "Assessment updated" : "Assessment change summary"}
    >
      {context === "flow" ? (
        <div className={styles.flowLedger}>
          {hasRiskComparison && result.initialRisk && result.updatedRisk && (
            <article className={styles.flowLedgerRow}>
              <IconTile size="sm" shape="circle"><Icon name="shield" size="sm" /></IconTile>
              <div className={styles.flowLedgerCopy}>
                <span className={styles.flowLedgerLabel}>{verificationLed ? "Suggested risk" : "Risk assessment"}</span>
                {riskChanged ? (
                  <strong className={styles.flowRiskValue}>
                    <span data-risk={result.initialRisk.toLowerCase()}>{result.initialRisk}</span>
                    <Icon name="arrowRight" size="sm" />
                    <span data-risk={result.updatedRisk.toLowerCase()}>{result.updatedRisk}</span>
                  </strong>
                ) : (
                  <strong className={styles.flowRiskValue}>
                    <span data-risk={result.updatedRisk.toLowerCase()}>{result.updatedRisk}</span>
                    <small>Unchanged</small>
                  </strong>
                )}
                <p>{riskDescription}</p>
              </div>
            </article>
          )}

          <article className={styles.flowLedgerRow}>
            <IconTile size="sm" shape="circle" tone="info"><Icon name="refresh" size="sm" /></IconTile>
            <div className={styles.flowLedgerCopy}>
              <span className={styles.flowLedgerLabel}>{verificationLed ? "Changed" : "What changed"}</span>
              <strong>{result.changedTitle}</strong>
              <p>{result.changedDescription}</p>
            </div>
          </article>

          <article className={styles.flowLedgerRow}>
            <IconTile size="sm" shape="circle" tone="success"><Icon name="checkCircle" size="sm" /></IconTile>
            <div className={styles.flowLedgerCopy}>
              <span className={styles.flowLedgerLabel}>{verificationLed ? "Unchanged" : "What stayed the same"}</span>
              <strong>{result.unchangedTitle}</strong>
              <p>{result.unchangedDescription}</p>
            </div>
          </article>
        </div>
      ) : (
        <div className={styles.comparisonGrid} data-has-risk={hasRiskComparison}>
          {hasRiskComparison && result.initialRisk && result.updatedRisk && (
            <article className={`${styles.comparisonItem} ${styles.riskItem}`}>
              <div className={styles.itemHeading}>
                <IconTile size="sm" shape="circle"><Icon name="shield" size="sm" /></IconTile>
                <span>Risk assessment</span>
              </div>
              <div className={`${styles.riskTransition} ${!riskChanged ? styles.riskUnchanged : ""}`}>
                {riskChanged ? (
                  <>
                    <span><small>Before</small><strong data-risk={result.initialRisk.toLowerCase()}>{result.initialRisk}</strong></span>
                    <Icon name="arrowRight" size="sm" />
                    <span><small>Now</small><strong data-risk={result.updatedRisk.toLowerCase()}>{result.updatedRisk}</strong></span>
                  </>
                ) : (
                  <span><small>Current conclusion</small><strong data-risk={result.updatedRisk.toLowerCase()}>{result.updatedRisk}</strong></span>
                )}
              </div>
              <p className={styles.riskDescription}>{riskDescription}</p>
            </article>
          )}

          <article className={styles.comparisonItem}>
            <div className={styles.itemHeading}>
              <IconTile size="sm" shape="circle" tone="info"><Icon name="refresh" size="sm" /></IconTile>
              <span>What changed</span>
            </div>
            <strong>{result.changedTitle}</strong>
            <p>{result.changedDescription}</p>
          </article>

          <article className={styles.comparisonItem}>
            <div className={styles.itemHeading}>
              <IconTile size="sm" shape="circle" tone="success"><Icon name="checkCircle" size="sm" /></IconTile>
              <span>What stayed the same</span>
            </div>
            <strong>{result.unchangedTitle}</strong>
            <p>{result.unchangedDescription}</p>
          </article>
        </div>
      )}
    </section>
  );
}
