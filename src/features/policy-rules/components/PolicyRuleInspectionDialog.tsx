import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { Dialog } from "../../../shared/ui/Dialog/Dialog";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import type {
  PolicyAction,
  PolicyRule,
  PolicyRuleId,
  PolicyRuleStatus,
  PolicyThresholdBasis,
} from "../policyRulesData";
import styles from "./PolicyRuleInspectionDialog.module.css";

type PolicyRuleInspectionDialogProps = {
  open: boolean;
  rule: PolicyRule | null;
  status: PolicyRuleStatus;
  canEdit: boolean;
  onClose: () => void;
  onEditAsDraft: () => void;
};

type InspectorStage = "definition" | "outcomes";
type DisclosureId =
  | "record"
  | "metric"
  | "limit"
  | "evidence"
  | "within"
  | "outside"
  | "missing";

type PolicyDisclosureFieldProps = {
  label: string;
  value: ReactNode;
  valueTitle?: string;
  detail: ReactNode;
  open: boolean;
  onToggle: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
};

const shortTitleByRuleId: Record<PolicyRuleId, string> = {
  "downside-coverage-floor": "Coverage floor",
  "leverage-ceiling": "Leverage ceiling",
  "customer-concentration-monitoring": "Customer concentration",
  "forecast-completeness-requirement": "Forecast completeness",
};

const basisLabelByType: Record<PolicyThresholdBasis, string> = {
  bank_policy: "Bank policy",
  bank_monitoring_threshold: "Monitoring threshold",
  proposed_facility_covenant: "Proposed facility covenant",
};

function formatThreshold(rule: PolicyRule) {
  const { unit, value } = rule.threshold;
  if (unit === "multiple") return `${value.toFixed(2)}x`;
  if (unit === "percentage") return `${value}%`;
  return `${value} ${value === 1 ? "month" : "months"}`;
}

function formatEvidence(rule: PolicyRule) {
  const labels = rule.evidence.required.map((requirement) => requirement.label);
  if (labels.length === 0) return "No additional evidence";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

function formatEffectiveDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function PolicyDisclosureField({
  label,
  value,
  valueTitle,
  detail,
  open,
  onToggle,
  buttonRef,
}: PolicyDisclosureFieldProps) {
  const triggerId = useId();
  const panelId = useId();

  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldControl}>
        <button
          ref={buttonRef}
          id={triggerId}
          type="button"
          className={styles.disclosureButton}
          aria-label={`View ${label.toLowerCase()} details`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.fieldValue} title={valueTitle}>{value}</span>
          <Icon className={styles.disclosureChevron} name="chevronDown" size="sm" />
        </button>
        {open && (
          <div
            id={panelId}
            className={styles.disclosurePanel}
            role="region"
            aria-labelledby={triggerId}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}

function OutcomeDetail({ action }: { action: PolicyAction }) {
  return (
    <div className={styles.outcomeDetail}>
      <p>{action.description}</p>
      <span className={styles.reviewRequirement}>
        <Icon name={action.humanReviewRequired ? "user" : "checkCircle"} size="sm" />
        {action.humanReviewRequired ? "Analyst review required" : "Recorded without escalation"}
      </span>
    </div>
  );
}

export function PolicyRuleInspectionDialog({
  open,
  rule,
  status,
  canEdit,
  onClose,
  onEditAsDraft,
}: PolicyRuleInspectionDialogProps) {
  const [stage, setStage] = useState<InspectorStage>("definition");
  const [openSection, setOpenSection] = useState<DisclosureId | null>(null);
  const definitionFocusRef = useRef<HTMLButtonElement>(null);
  const outcomesFocusRef = useRef<HTMLButtonElement>(null);
  const ruleId = rule?.id;

  useEffect(() => {
    setStage("definition");
    setOpenSection(null);
  }, [open, ruleId]);

  if (!rule) return null;

  const title = shortTitleByRuleId[rule.id];
  const operator = rule.threshold.comparator === "less_than_or_equal" ? "At most" : "At least";
  const threshold = formatThreshold(rule);
  const evidence = formatEvidence(rule);

  function toggleSection(section: DisclosureId) {
    setOpenSection((current) => current === section ? null : section);
  }

  function showStage(nextStage: InspectorStage) {
    setOpenSection(null);
    setStage(nextStage);
  }

  function closeInspector() {
    setStage("definition");
    setOpenSection(null);
    onClose();
  }

  function editAsDraft() {
    setStage("definition");
    setOpenSection(null);
    onEditAsDraft();
  }

  const footer = stage === "definition" ? (
    <div className={styles.footerActions}>
      <Button
        className={styles.editDraftButton}
        variant="quiet"
        icon={<Icon name="branch" size="sm" />}
        iconPosition="start"
        disabled={!canEdit}
        title={!canEdit ? "Requires policy draft permission" : undefined}
        onClick={editAsDraft}
      >
        Edit as draft
      </Button>
      <Button className={styles.footerButton} variant="secondary" onClick={closeInspector}>
        Close
      </Button>
      <Button
        className={styles.footerButton}
        variant="primary"
        icon={<Icon name="arrowRight" size="sm" />}
        onClick={() => showStage("outcomes")}
      >
        Next
      </Button>
    </div>
  ) : (
    <div className={styles.footerActions}>
      <Button
        className={styles.footerButton}
        variant="secondary"
        icon={<Icon name="arrowLeft" size="sm" />}
        iconPosition="start"
        onClick={() => showStage("definition")}
      >
        Back
      </Button>
      <Button
        className={styles.footerButton}
        variant="primary"
        icon={<Icon name="check" size="sm" />}
        onClick={closeInspector}
      >
        Done
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={closeInspector}
      title={title}
      closeLabel="Close policy inspection"
      initialFocusRef={stage === "definition" ? definitionFocusRef : outcomesFocusRef}
      size="lg"
      footer={footer}
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.description}>{rule.summary}</p>

          <div className={styles.meta}>
            <StatusPill tone={status === "active" ? "success" : "neutral"}>
              {status === "active" ? "Active policy" : "Paused policy"}
            </StatusPill>
            <span className={styles.scope}>{rule.scope.label}</span>
            <button
              type="button"
              className={styles.recordButton}
              aria-expanded={openSection === "record"}
              aria-controls="policy-record-details"
              onClick={() => toggleSection("record")}
            >
              Policy record
              <Icon className={styles.recordChevron} name="chevronDown" size="sm" />
            </button>
          </div>

          {openSection === "record" && (
            <dl id="policy-record-details" className={styles.recordPanel}>
              <div>
                <dt>Owner</dt>
                <dd>{rule.owner}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{rule.version}</dd>
              </div>
              <div>
                <dt>Effective</dt>
                <dd>{formatEffectiveDate(rule.effectiveDate)}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className={styles.progress} aria-label={`Step ${stage === "definition" ? 1 : 2} of 2`}>
          <div className={styles.progressRail} aria-hidden="true">
            <span className={styles.progressComplete} />
            <span className={stage === "outcomes" ? styles.progressComplete : ""} />
          </div>
          <div className={styles.progressCaption}>
            <strong>{stage === "definition" ? "Rule logic" : "Outcomes"}</strong>
            <span>{stage === "definition" ? "1 of 2" : "2 of 2"}</span>
          </div>
        </div>

        {stage === "definition" ? (
          <section className={styles.stage} aria-label="Rule logic">
            <PolicyDisclosureField
              label="Metric"
              value={rule.calculation.label}
              valueTitle={rule.calculation.label}
              detail={<p>{rule.calculation.method}</p>}
              open={openSection === "metric"}
              onToggle={() => toggleSection("metric")}
              buttonRef={definitionFocusRef}
            />
            <PolicyDisclosureField
              label="Limit"
              value={(
                <span className={styles.limitSummary}>
                  <span>{operator}</span>
                  <strong>{threshold}</strong>
                </span>
              )}
              valueTitle={`${operator} ${threshold}`}
              detail={(
                <div className={styles.detailStack}>
                  <p>{rule.scope.description}</p>
                  <div className={styles.detailMeta}>
                    <span>{basisLabelByType[rule.threshold.basis]}</span>
                    <span>Inclusive threshold</span>
                  </div>
                </div>
              )}
              open={openSection === "limit"}
              onToggle={() => toggleSection("limit")}
            />
            <PolicyDisclosureField
              label="Evidence"
              value={evidence}
              valueTitle={evidence}
              detail={rule.evidence.required.length > 0 ? (
                <ul className={styles.evidenceList}>
                  {rule.evidence.required.map((requirement) => (
                    <li key={requirement.id}>
                      <Icon name="fileCheck" size="sm" />
                      <div>
                        <strong>{requirement.label}</strong>
                        <p>{requirement.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p>No additional evidence is required for this policy.</p>}
              open={openSection === "evidence"}
              onToggle={() => toggleSection("evidence")}
            />
          </section>
        ) : (
          <section className={styles.stage} aria-label="Policy outcomes">
            <PolicyDisclosureField
              label="Within limit"
              value={rule.actions.withinPolicy.label}
              valueTitle={rule.actions.withinPolicy.label}
              detail={<OutcomeDetail action={rule.actions.withinPolicy} />}
              open={openSection === "within"}
              onToggle={() => toggleSection("within")}
              buttonRef={outcomesFocusRef}
            />
            <PolicyDisclosureField
              label="Outside limit"
              value={rule.actions.outsidePolicy.label}
              valueTitle={rule.actions.outsidePolicy.label}
              detail={<OutcomeDetail action={rule.actions.outsidePolicy} />}
              open={openSection === "outside"}
              onToggle={() => toggleSection("outside")}
            />
            <PolicyDisclosureField
              label="Evidence missing"
              value={rule.actions.unresolvedEvidence.label}
              valueTitle={rule.actions.unresolvedEvidence.label}
              detail={<OutcomeDetail action={rule.actions.unresolvedEvidence} />}
              open={openSection === "missing"}
              onToggle={() => toggleSection("missing")}
            />
          </section>
        )}
      </div>
    </Dialog>
  );
}
