import { Icon } from "../../../shared/ui/Icon/Icon";
import type { EvidenceRequirement } from "../workflow/evidenceWorkflow";
import type { FindingDefinition, FindingId } from "./meridianData";
import styles from "./AssessmentInsightBrief.module.css";

type InsightSignal = {
  label: string;
  value: string;
  detail: string;
};

const findingSignals: Record<FindingId, InsightSignal[]> = {
  "customer-concentration": [
    { label: "New evidence", value: "Executed renewal", detail: "Verified through Mar 2030" },
    { label: "Key signal", value: "Mar 2027 → Mar 2030", detail: "Customer A contract term" },
    { label: "Residual exposure", value: "61%", detail: "Top-two revenue concentration" },
  ],
  "declining-margins": [
    { label: "New evidence", value: "July actuals", detail: "Pricing and commodity costs" },
    { label: "Key signal", value: "14.2% → 9.1%", detail: "EBITDA margin" },
    { label: "Policy gap", value: "1.12x vs 1.20x", detail: "Downside coverage vs floor" },
  ],
  "increasing-leverage": [
    { label: "New evidence", value: "Executed agreement", detail: "Equipment obligation" },
    { label: "Key signal", value: "3.7x → 3.9x", detail: "Pro forma leverage" },
    { label: "Remaining headroom", value: "0.35x", detail: "To 4.25x maximum" },
  ],
};

type AssessmentInsightBriefProps = {
  finding: FindingDefinition;
  requirement: EvidenceRequirement;
  mode: "initial" | "updated";
  language?: "ai-explicit" | "attributable";
};

export function AssessmentInsightBrief({ finding, requirement, mode, language = "ai-explicit" }: AssessmentInsightBriefProps) {
  const { result } = requirement;
  const isUpdated = mode === "updated";
  const attributableLanguage = language === "attributable";
  const riskChanged = Boolean(result.initialRisk && result.updatedRisk && result.initialRisk !== result.updatedRisk);
  const currentRisk = isUpdated ? result.updatedRisk ?? finding.initialRisk : finding.initialRisk;
  const titleId = isUpdated ? "updated-assessment-title" : "initial-assessment-title";
  const signals = isUpdated
    ? findingSignals[finding.id]
    : finding.summaryFacts.map((fact) => ({ label: fact.label, value: fact.value, detail: "" }));

  return (
    <section className={styles.brief} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span><Icon name={isUpdated ? "refresh" : "spark"} size="xs" />{isUpdated ? attributableLanguage ? "Updated assessment" : "Updated analysis" : attributableLanguage ? "Initial assessment" : "Initial analysis"}</span>
        </div>

        <div className={styles.lead}>
          <div className={styles.leadCopy}>
            <h2 id={titleId}>{isUpdated ? result.title : finding.summary}</h2>
            {isUpdated && <p>{result.description}</p>}
          </div>
          <div className={styles.riskState} data-risk={currentRisk.toLowerCase()}>
            <span>{attributableLanguage ? "System conclusion" : "AI conclusion"}</span>
            <div className={styles.riskValue}>
              {isUpdated && riskChanged && <><strong data-previous="true">{result.initialRisk}</strong><Icon name="arrowRight" size="xs" /></>}
              <strong>{currentRisk}</strong>
            </div>
            <small>{isUpdated ? riskChanged ? "Changed after verification" : "Unchanged after verification" : "Before new evidence"}</small>
          </div>
        </div>
      </header>

      <div className={styles.signalGrid} aria-label="Key reassessment signals">
        {signals.map((signal) => (
          <div key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            {signal.detail && <small>{signal.detail}</small>}
          </div>
        ))}
      </div>

      <div className={styles.insightLedger} data-mode={mode}>
        {isUpdated ? (
          <>
            <div><Icon name="refresh" size="sm" /><span><small>Evidence changed</small><strong>{result.changedTitle}</strong></span></div>
            <div><Icon name="checkCircle" size="sm" /><span><small>Still true</small><strong>{result.unchangedTitle}</strong></span></div>
          </>
        ) : (
          <div><Icon name="document" size="sm" /><span><small>Open evidence</small><strong>{requirement.title}</strong></span></div>
        )}
      </div>
    </section>
  );
}
