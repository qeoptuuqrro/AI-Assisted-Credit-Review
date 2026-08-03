import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { Dialog } from "../../../shared/ui/Dialog/Dialog";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { Notice } from "../../../shared/ui/Notice/Notice";
import {
  SelectMenu,
  type SelectMenuOption,
} from "../../../shared/ui/SelectMenu/SelectMenu";
import type {
  PolicyRule,
  PolicyRuleId,
  PolicyRuleMetric,
  ThresholdDirection,
} from "../policyRulesData";
import {
  createPolicyRulesRecordId,
  type PolicyRuleDraftComparator,
  type PolicyRuleDraftMetric,
  type PolicyRuleDraftRecord,
  type PolicyRuleDraftSource,
  type PolicyRuleDraftTypeId,
} from "../policyRulesState";
import styles from "./RuleBuilderDialog.module.css";

type BuilderStage = "choose" | "generating" | "configure" | "review" | "success";
type RuleTypeId = PolicyRuleDraftTypeId;
type DraftSource = PolicyRuleDraftSource;
type BuilderComparator = PolicyRuleDraftComparator;
type BuilderMetric = PolicyRuleDraftMetric;

type RuleType = {
  id: RuleTypeId;
  label: string;
  icon: IconName;
  metric: BuilderMetric;
  comparator: BuilderComparator;
  action: string;
  evidence: string;
  direction: ThresholdDirection;
};

type GeneratedDraft = {
  typeId: RuleTypeId;
  name: string;
  threshold: string;
};

type BuilderFormState = {
  prompt: string;
  selectedTypeId: RuleTypeId | null;
  name: string;
  threshold: string;
  metric: BuilderMetric | "";
  comparator: BuilderComparator | "";
  action: string;
  evidence: string;
};

const ruleTypes: RuleType[] = [
  {
    id: "financial-ceiling",
    label: "Leverage ceiling",
    icon: "trendUp",
    metric: "Verified total leverage",
    comparator: "exceeds",
    action: "Senior credit review",
    evidence: "Current debt schedule",
    direction: "maximum",
  },
  {
    id: "financial-floor",
    label: "Coverage floor",
    icon: "trendDown",
    metric: "Downside fixed-charge coverage",
    comparator: "falls below",
    action: "Analyst mitigation review",
    evidence: "Approved downside forecast",
    direction: "minimum",
  },
  {
    id: "evidence-requirement",
    label: "Evidence requirement",
    icon: "fileCheck",
    metric: "Complete forward forecast horizon",
    comparator: "falls below",
    action: "Evidence refresh",
    evidence: "Approved operating forecast",
    direction: "minimum",
  },
  {
    id: "review-trigger",
    label: "Concentration monitoring",
    icon: "users",
    metric: "Top-two customer revenue",
    comparator: "exceeds",
    action: "Analyst judgment",
    evidence: "Customer concentration report",
    direction: "maximum",
  },
];

const generationSteps = [
  "Reading policy language",
  "Structuring conditions",
  "Preparing editable draft",
] as const;

const builderSteps = ["Choose", "Configure", "Review"] as const;

const metricOptions: readonly SelectMenuOption<BuilderMetric>[] = [
  { value: "Verified total leverage", label: "Verified total leverage" },
  { value: "Downside fixed-charge coverage", label: "Downside fixed-charge coverage" },
  { value: "Complete forward forecast horizon", label: "Complete forward forecast horizon" },
  { value: "Top-two customer revenue", label: "Top-two customer revenue" },
];

const comparatorOptions: readonly SelectMenuOption<BuilderComparator>[] = [
  { value: "exceeds", label: "exceeds" },
  { value: "falls below", label: "falls below" },
  { value: "is missing", label: "is missing" },
];

const actionOptions: readonly SelectMenuOption<string>[] = [
  { value: "Analyst judgment", label: "Analyst judgment" },
  { value: "Senior credit review", label: "Senior credit review" },
  { value: "Evidence refresh", label: "Evidence refresh" },
  { value: "Analyst mitigation review", label: "Analyst mitigation review" },
];

const evidenceOptions: readonly SelectMenuOption<string>[] = [
  { value: "Current debt schedule", label: "Current debt schedule" },
  { value: "Approved downside forecast", label: "Approved downside forecast" },
  { value: "Approved operating forecast", label: "Approved operating forecast" },
  { value: "Customer concentration report", label: "Customer concentration report" },
  { value: "Executed obligation agreement", label: "Executed obligation agreement" },
];

const ruleTypeIdByPolicyRuleId: Record<PolicyRuleId, RuleTypeId> = {
  "downside-coverage-floor": "financial-floor",
  "leverage-ceiling": "financial-ceiling",
  "customer-concentration-monitoring": "review-trigger",
  "forecast-completeness-requirement": "evidence-requirement",
};

const builderMetricByPolicyMetric: Record<PolicyRuleMetric, BuilderMetric> = {
  downside_fixed_charge_coverage_ratio: "Downside fixed-charge coverage",
  total_leverage_ratio: "Verified total leverage",
  top_two_customer_revenue_percent: "Top-two customer revenue",
  forward_forecast_months: "Complete forward forecast horizon",
};

function formatRuleThreshold(rule: PolicyRule) {
  if (rule.threshold.unit === "multiple") return `${rule.threshold.value.toFixed(2)}x`;
  if (rule.threshold.unit === "percentage") return `${rule.threshold.value}%`;
  return `${rule.threshold.value} ${rule.threshold.value === 1 ? "month" : "months"}`;
}

function serializeFormState(state: BuilderFormState) {
  return JSON.stringify(state);
}

function getRevisionSeed(rule: PolicyRule): BuilderFormState {
  const typeId = ruleTypeIdByPolicyRuleId[rule.id];
  const type = ruleTypes.find((candidate) => candidate.id === typeId);
  if (!type) throw new Error(`Missing builder template for ${rule.id}`);

  return {
    prompt: "",
    selectedTypeId: typeId,
    name: rule.name,
    threshold: formatRuleThreshold(rule),
    metric: builderMetricByPolicyMetric[rule.calculation.metric],
    comparator: rule.threshold.direction === "maximum" ? "exceeds" : "falls below",
    action: type.action,
    evidence: type.evidence,
  };
}

const thresholdValidationByMetric: Record<BuilderMetric, {
  pattern: RegExp;
  error: string;
  validateValue?: (value: number) => boolean;
}> = {
  "Verified total leverage": {
    pattern: /^(\d+(?:\.\d+)?)x$/i,
    error: "Use a ratio such as 4.25x.",
    validateValue: (value) => value > 0,
  },
  "Downside fixed-charge coverage": {
    pattern: /^(\d+(?:\.\d+)?)x$/i,
    error: "Use a ratio such as 1.20x.",
    validateValue: (value) => value > 0,
  },
  "Complete forward forecast horizon": {
    pattern: /^(\d+)\s*months?$/i,
    error: "Use whole months, such as 12 months.",
    validateValue: (value) => value > 0,
  },
  "Top-two customer revenue": {
    pattern: /^(\d+(?:\.\d+)?)%$/,
    error: "Use a percentage from 0% to 100%.",
    validateValue: (value) => value >= 0 && value <= 100,
  },
};

function validateThreshold(metric: BuilderMetric | "", comparator: BuilderComparator | "", threshold: string) {
  if (comparator === "is missing") return { valid: true, error: "" };
  if (!metric || !comparator || !threshold.trim()) return { valid: false, error: "" };

  const validation = thresholdValidationByMetric[metric];
  const match = threshold.trim().match(validation.pattern);
  const numericValue = match ? Number(match[1]) : Number.NaN;
  const valid = Boolean(match)
    && Number.isFinite(numericValue)
    && (validation.validateValue?.(numericValue) ?? true);

  return { valid, error: valid ? "" : validation.error };
}

function getThresholdDirection(comparator: BuilderComparator, fallback: ThresholdDirection): ThresholdDirection {
  if (comparator === "exceeds") return "maximum";
  if (comparator === "falls below") return "minimum";
  return fallback;
}

type RuleBuilderDialogProps = {
  open: boolean;
  initialRule?: PolicyRule | null;
  onClose: () => void;
  onCreate: (rule: PolicyRuleDraftRecord) => void;
  onComplete: (name: string, mode: "create" | "revise") => void;
};

function extractThreshold(prompt: string, fallback: string) {
  const match = prompt.match(/(?:\$\s*)?\d+(?:\.\d+)?\s*(?:x|%|months?|days?|m|mm|million)?/i);
  return match?.[0].replace(/\s+/g, "") || fallback;
}

function parsePolicyPrompt(prompt: string): GeneratedDraft | null {
  const normalized = prompt.toLowerCase();
  if (/(leverage|debt\s*\/\s*ebitda|debt to ebitda)/.test(normalized)) {
    return { typeId: "financial-ceiling", name: "Leverage exception review", threshold: extractThreshold(prompt, "4.25x") };
  }
  if (/(coverage|fixed[- ]charge|debt service)/.test(normalized)) {
    return { typeId: "financial-floor", name: "Downside coverage floor", threshold: extractThreshold(prompt, "1.20x") };
  }
  if (/(forecast|financial projection|forward plan)/.test(normalized)) {
    return { typeId: "evidence-requirement", name: "Forecast completeness requirement", threshold: extractThreshold(prompt, "12 months") };
  }
  if (/(concentration|top[- ]two|customer revenue)/.test(normalized)) {
    return { typeId: "review-trigger", name: "Customer concentration monitoring", threshold: extractThreshold(prompt, "50%") };
  }
  return null;
}

export function RuleBuilderDialog({ open, initialRule = null, onClose, onCreate, onComplete }: RuleBuilderDialogProps) {
  const [stage, setStage] = useState<BuilderStage>("choose");
  const [source, setSource] = useState<DraftSource>("template");
  const [selectedTypeId, setSelectedTypeId] = useState<RuleTypeId | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [pendingGeneration, setPendingGeneration] = useState<GeneratedDraft | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState("");
  const [metric, setMetric] = useState<BuilderMetric | "">("");
  const [comparator, setComparator] = useState<BuilderComparator | "">("");
  const [action, setAction] = useState("");
  const [evidence, setEvidence] = useState("");
  const [createdName, setCreatedName] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const discardFocusRef = useRef<HTMLButtonElement>(null);
  const thresholdErrorId = useId();

  const selectedType = ruleTypes.find((type) => type.id === selectedTypeId) ?? null;
  const thresholdValidation = validateThreshold(metric, comparator, threshold);
  const revisionMode = Boolean(initialRule);
  const validConfiguration = Boolean(
    name.trim()
      && metric
      && comparator
      && thresholdValidation.valid
      && (revisionMode || (action && evidence)),
  );
  const draftSentence = validConfiguration
    ? revisionMode && initialRule
      ? `When ${metric.toLowerCase()} ${comparator}${comparator === "is missing" ? "" : ` ${threshold.trim()}`}, apply the inherited outcomes from ${initialRule.version}.`
      : `When ${metric.toLowerCase()} ${comparator}${comparator === "is missing" ? "" : ` ${threshold.trim()}`}, require ${action.toLowerCase()}.`
    : "";
  const currentFormSnapshot = serializeFormState({
    prompt,
    selectedTypeId,
    name,
    threshold,
    metric,
    comparator,
    action,
    evidence,
  });
  const isDirty = stage !== "success" && currentFormSnapshot !== initialFormSnapshot;
  const progressStep = stage === "choose" ? 0 : stage === "review" || stage === "success" ? 2 : 1;
  const showProgress = stage !== "success";

  useEffect(() => {
    if (!open) return;
    const seed: BuilderFormState = initialRule ? getRevisionSeed(initialRule) : {
      prompt: "",
      selectedTypeId: null,
      name: "",
      threshold: "",
      metric: "",
      comparator: "",
      action: "",
      evidence: "",
    };
    setStage(initialRule ? "configure" : "choose");
    setSource(initialRule ? "existing_policy" : "template");
    setSelectedTypeId(seed.selectedTypeId);
    setPrompt(seed.prompt);
    setGenerationError("");
    setPendingGeneration(null);
    setGenerationStep(0);
    setName(seed.name);
    setThreshold(seed.threshold);
    setMetric(seed.metric);
    setComparator(seed.comparator);
    setAction(seed.action);
    setEvidence(seed.evidence);
    setCreatedName("");
    setConfirmDiscard(false);
    setInitialFormSnapshot(serializeFormState(seed));
  }, [initialRule, open]);

  useEffect(() => {
    if (!open || stage !== "configure") return;
    const frame = window.requestAnimationFrame(() => nameRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, stage]);

  useEffect(() => {
    if (!open || stage !== "generating") return;
    setGenerationStep(0);
    const structureTimer = window.setTimeout(() => setGenerationStep(1), 320);
    const reviewTimer = window.setTimeout(() => setGenerationStep(2), 640);
    const completeTimer = window.setTimeout(() => {
      if (!pendingGeneration) {
        setGenerationError("We could not map this request to a supported credit policy. Add a credit metric, threshold, and review action.");
        setStage("choose");
        return;
      }

      const generatedType = ruleTypes.find((type) => type.id === pendingGeneration.typeId);
      if (!generatedType) return;
      setSelectedTypeId(generatedType.id);
      setName(pendingGeneration.name);
      setThreshold(pendingGeneration.threshold);
      setMetric(generatedType.metric);
      setComparator(generatedType.comparator);
      setAction(generatedType.action);
      setEvidence(generatedType.evidence);
      setSource("ai");
      setStage("configure");
    }, 960);

    return () => {
      window.clearTimeout(structureTimer);
      window.clearTimeout(reviewTimer);
      window.clearTimeout(completeTimer);
    };
  }, [open, pendingGeneration, stage]);

  function selectTemplate(typeId: RuleTypeId) {
    const type = ruleTypes.find((candidate) => candidate.id === typeId);
    if (!type) return;
    const seed: BuilderFormState = {
      prompt: "",
      selectedTypeId: type.id,
      name: "",
      threshold: "",
      metric: type.metric,
      comparator: type.comparator,
      action: type.action,
      evidence: type.evidence,
    };
    setSelectedTypeId(seed.selectedTypeId);
    setPrompt(seed.prompt);
    setName(seed.name);
    setThreshold(seed.threshold);
    setMetric(seed.metric);
    setComparator(seed.comparator);
    setAction(seed.action);
    setEvidence(seed.evidence);
    setSource("template");
    setGenerationError("");
    setInitialFormSnapshot(serializeFormState(seed));
    setStage("configure");
  }

  function generateFromPrompt() {
    if (!prompt.trim()) return;
    setGenerationError("");
    setPendingGeneration(parsePolicyPrompt(prompt));
    setStage("generating");
  }

  function saveDraft() {
    if (!selectedType || !validConfiguration || !comparator || !metric) return;
    const trimmedName = name.trim();
    const savedAt = new Date().toISOString();
    const commonDraft = {
      id: createPolicyRulesRecordId("draft"),
      status: "draft",
      typeId: selectedType.id,
      name: trimmedName,
      statement: draftSentence,
      metric,
      comparator,
      threshold: comparator === "is missing" ? null : threshold.trim(),
      thresholdDirection: getThresholdDirection(comparator, selectedType.direction),
      createdAt: savedAt,
      updatedAt: savedAt,
    } as const;
    const draft: PolicyRuleDraftRecord = initialRule ? {
      ...commonDraft,
      source: "existing_policy",
      sourcePrompt: null,
      baseRuleId: initialRule.id,
      baseVersion: initialRule.version,
      revisionScope: "condition",
    } : {
      ...commonDraft,
      source: source === "ai" ? "ai" : "template",
      sourcePrompt: source === "ai" ? prompt.trim() : null,
      action,
      evidence,
    };
    onCreate(draft);
    setCreatedName(trimmedName);
    setStage("success");
  }

  function requestClose() {
    if (confirmDiscard) {
      setConfirmDiscard(false);
      return;
    }
    if (stage === "success" && createdName) {
      onComplete(createdName, revisionMode ? "revise" : "create");
      return;
    }
    if (isDirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  function discardDraft() {
    setConfirmDiscard(false);
    onClose();
  }

  const title = confirmDiscard
    ? "Discard this draft?"
    : stage === "choose"
      ? "Create policy"
      : stage === "generating"
        ? "Drafting policy"
        : stage === "configure"
          ? revisionMode ? "Edit policy as draft" : source === "ai" ? "Review draft terms" : "Set policy terms"
          : stage === "review"
            ? revisionMode ? "Review draft version" : "Review policy"
            : revisionMode ? "Draft version saved" : "Draft saved";

  const footer = confirmDiscard ? (
    <>
      <Button ref={discardFocusRef} variant="quiet" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
      <Button variant="secondary" onClick={discardDraft}>Discard draft</Button>
    </>
  ) : stage === "choose" ? (
    <>
      <Button variant="quiet" onClick={requestClose}>Cancel</Button>
      <Button
        variant="primary"
        icon={<Icon name="spark" size="sm" />}
        iconPosition="start"
        disabled={!prompt.trim()}
        onClick={generateFromPrompt}
      >
        Generate draft
      </Button>
    </>
  ) : stage === "generating" ? (
    <Button variant="quiet" onClick={requestClose}>Cancel</Button>
  ) : stage === "configure" ? (
    <>
      {revisionMode ? (
        <Button variant="quiet" onClick={requestClose}>Cancel</Button>
      ) : (
        <Button variant="quiet" onClick={() => setStage("choose")}>Back</Button>
      )}
      <Button variant="primary" disabled={!validConfiguration} onClick={() => setStage("review")}>Review draft</Button>
    </>
  ) : stage === "review" ? (
    <>
      <Button variant="quiet" onClick={() => setStage("configure")}>Back</Button>
      <Button variant="primary" onClick={saveDraft}>Save draft</Button>
    </>
  ) : (
    <Button variant="primary" onClick={requestClose}>Done</Button>
  );

  return (
    <Dialog
      open={open}
      onClose={requestClose}
      title={title}
      eyebrow={confirmDiscard
        ? "Unsaved changes"
        : stage === "success"
          ? "Ready for policy owner review"
          : revisionMode && initialRule
            ? `Draft from ${initialRule.version}`
            : "New policy rule"}
      closeLabel="Close rule builder"
      size="lg"
      className={styles.builderDialog}
      initialFocusRef={confirmDiscard ? discardFocusRef : stage === "configure" ? nameRef : undefined}
      footer={footer}
    >
      {confirmDiscard ? (
        <div className={styles.discardPrompt}>
          <IconTile tone="warning"><Icon name="alertCircle" size="md" /></IconTile>
          <p>Your rule has not been saved. Discarding it removes the prompt and all draft terms.</p>
        </div>
      ) : (
        <>
          {showProgress && (
            <nav className={styles.builderProgress} aria-label="Rule creation progress">
              <ol>
                {builderSteps.map((step, index) => (
                  <li
                    key={step}
                    className={`${styles.progressStep} ${index < progressStep ? styles.progressStepDone : ""} ${index === progressStep ? styles.progressStepCurrent : ""}`}
                    aria-current={index === progressStep ? "step" : undefined}
                  >
                    <span aria-hidden="true">{index < progressStep ? <Icon name="check" size="xs" /> : index + 1}</span>
                    <small>{step}</small>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {stage === "choose" && (
            <div className={styles.builderStart}>
              <span className={styles.builderSectionLabel}>Choose a starting point</span>
              <div className={styles.ruleTypeGrid} role="group" aria-label="Policy rule templates">
                {ruleTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={styles.ruleTypeCard}
                    aria-label={type.label}
                    onClick={() => selectTemplate(type.id)}
                  >
                    <IconTile size="sm"><Icon name={type.icon} size="sm" /></IconTile>
                    <strong>{type.label}</strong>
                  </button>
                ))}
              </div>

              <div className={styles.builderDivider}><span>or start with your own policy</span></div>

              <label className={styles.promptField}>
                <span className={styles.promptLabel}>
                  <Icon name="spark" size="sm" />
                  Describe the policy in your own words
                </span>
                <textarea
                  ref={promptRef}
                  aria-label="Describe the policy in plain language"
                  value={prompt}
                  maxLength={1000}
                  rows={4}
                  placeholder="When verified leverage exceeds 4.25x, require senior credit review."
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setSelectedTypeId(null);
                    setGenerationError("");
                  }}
                />
                <span className={styles.promptMeta}>
                  <small>AI creates an editable draft. It cannot activate policy.</small>
                  <small>{1000 - prompt.length} characters remaining</small>
                </span>
              </label>
              {generationError && <p className={styles.promptError} role="alert">{generationError}</p>}
            </div>
          )}

          {stage === "generating" && (
            <div className={styles.builderGenerating} role="status" aria-live="polite">
              <IconTile tone="info"><Icon name="spark" size="md" /></IconTile>
              <div>
                <h3>Building a reviewable draft</h3>
                <p>Your policy language stays visible and editable after generation.</p>
              </div>
              <ol>
                {generationSteps.map((step, index) => (
                  <li key={step} className={index <= generationStep ? styles.generationStepActive : ""}>
                    <span>{index < generationStep ? <Icon name="check" size="xs" /> : index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {stage === "configure" && selectedType && (
            <div className={styles.builderConfiguration}>
              {source === "ai" && (
                <Notice tone="info" title="AI-generated draft" icon="spark">
                  Review every field. It stays inactive until a policy owner approves it.
                </Notice>
              )}
              <label className={styles.builderField}>
                <span>Rule name</span>
                <input ref={nameRef} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name this rule" />
              </label>

              <section className={styles.conditionEditor} aria-labelledby="policy-condition-heading">
                <div className={styles.conditionHeader}>
                  <div>
                    <strong id="policy-condition-heading">Policy condition</strong>
                    <small>Structured fields keep the rule testable.</small>
                  </div>
                  <Icon name="branch" size="sm" />
                </div>

                <div className={styles.builderField}>
                  <span>Metric</span>
                  <SelectMenu
                    label="Metric"
                    value={metric as BuilderMetric}
                    options={metricOptions}
                    onChange={setMetric}
                  />
                </div>

                <div className={styles.builderField}>
                  <span>Comparator</span>
                  <SelectMenu
                    label="Comparator"
                    value={comparator as BuilderComparator}
                    options={comparatorOptions}
                    onChange={(nextComparator) => {
                      setComparator(nextComparator);
                      if (nextComparator === "is missing") setThreshold("");
                    }}
                  />
                </div>

                {comparator !== "is missing" && (
                  <label className={`${styles.builderField} ${styles.thresholdField}`}>
                    <span>Threshold</span>
                    <span className={styles.inputStack}>
                      <input
                        value={threshold}
                        aria-label="Threshold"
                        aria-invalid={thresholdValidation.error ? "true" : undefined}
                        aria-describedby={thresholdValidation.error ? thresholdErrorId : undefined}
                        onChange={(event) => setThreshold(event.target.value)}
                        placeholder="Enter a limit"
                      />
                      {thresholdValidation.error && (
                        <small id={thresholdErrorId} className={styles.fieldError} role="alert">{thresholdValidation.error}</small>
                      )}
                    </span>
                  </label>
                )}

                {!revisionMode && (
                  <>
                    <div className={styles.builderField}>
                      <span>Required action</span>
                      <SelectMenu
                        label="Required action"
                        value={action}
                        options={actionOptions}
                        placement="up"
                        onChange={setAction}
                      />
                    </div>

                    <div className={styles.builderField}>
                      <span>Required evidence</span>
                      <SelectMenu
                        label="Required evidence"
                        value={evidence}
                        options={evidenceOptions}
                        placement="up"
                        onChange={setEvidence}
                      />
                    </div>
                  </>
                )}
              </section>

              {revisionMode && initialRule && (
                <div className={styles.inheritedPolicy}>
                  <Icon name="lock" size="sm" />
                  <div>
                    <strong>Inherited from {initialRule.version}</strong>
                    <span>{initialRule.scope.label}</span>
                    <small>Calculation method, evidence requirements, and outcomes stay unchanged. Policy owner approval is required.</small>
                  </div>
                </div>
              )}

              {!revisionMode && (
                <div className={styles.builderBoundary}>
                  <Icon name="lock" size="sm" />
                  <span><strong>Draft only</strong><small>Policy owner approval is required.</small></span>
                </div>
              )}
            </div>
          )}

          {stage === "review" && selectedType && (
            <div className={styles.ruleReview}>
              <div className={styles.reviewSentence}>
                <IconTile><Icon name={selectedType.icon} size="md" /></IconTile>
                <div><span>Draft policy statement</span><strong>{draftSentence}</strong></div>
              </div>
              <dl className={styles.reviewDetails}>
                <div><dt>Name</dt><dd>{name.trim()}</dd></div>
                {revisionMode && initialRule ? (
                  <>
                    <div><dt>Based on</dt><dd>{initialRule.version}</dd></div>
                    <div><dt>Scope</dt><dd>{initialRule.scope.label}</dd></div>
                    <div><dt>Inherited</dt><dd>Calculation, evidence, and outcomes</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>Required evidence</dt><dd>{evidence}</dd></div>
                    <div><dt>Owner</dt><dd>Unassigned</dd></div>
                    <div><dt>Effective state</dt><dd>Not effective</dd></div>
                  </>
                )}
              </dl>
              <Notice tone="warning" title={revisionMode ? "The active policy will not change" : "Saving creates a draft only"} icon="lock">
                {revisionMode
                  ? `${initialRule?.version ?? "The current version"} remains active until an authorized review approves this draft.`
                  : "A policy owner confirms scope, date, and version before activation."}
              </Notice>
            </div>
          )}

          {stage === "success" && (
            <div className={styles.builderSuccess} role="status">
              <IconTile tone="success"><Icon name="check" size="md" /></IconTile>
              <h3>{createdName}</h3>
              <p>{revisionMode
                ? `${initialRule?.version ?? "The current policy"} remains active while this draft is reviewed.`
                : "The draft is ready for policy owner review. Generated terms cannot activate themselves."}</p>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
