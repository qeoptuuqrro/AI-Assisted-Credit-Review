import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon, type IconName } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { WorkflowSteps } from "../../../shared/ui/WorkflowSteps/WorkflowSteps";
import { LearningModeSurface, getLearningTargetProps, useLearningMode } from "../learning/MeridianLearningMode";
import { seniorDecisionLabel, type AnalystRecommendationRecord, type SeniorDecisionDraft, type SeniorDecisionRecord } from "../workflow/creditReviewState";
import styles from "./SeniorReviewPackage.module.css";

export type SeniorReviewPackageFinding = {
  id: string;
  title: string;
  detail: string;
  status: string;
  risk: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  icon?: IconName;
};

export type SeniorReviewDecisionSignal = {
  label: string;
  value: string;
  detail: string;
  detailTone?: "neutral" | "positive" | "negative";
  policyComparison?: {
    actual: number;
    boundary: number;
    domain: readonly [minimum: number, maximum: number];
    direction: "minimum" | "maximum";
    boundaryLabel: string;
    varianceLabel: string;
  };
};

export type SeniorReviewPackageProps = {
  company: string;
  logoDomain?: string;
  request: string;
  facilityType: string;
  decisionQuestion?: string;
  reviewSummary?: string;
  recommendation: AnalystRecommendationRecord;
  findings: SeniorReviewPackageFinding[];
  decisionSignals: SeniorReviewDecisionSignal[];
  sourcesCount: number;
  decisionMaker?: string;
  existingDecision?: SeniorDecisionRecord;
  draft?: SeniorDecisionDraft;
  learningMode?: boolean;
  learningControl?: ReactNode;
  onDraftChange?: (draft: SeniorDecisionDraft) => void;
  onExit: () => void;
  onOpenRecord?: (tab: "overview" | "findings" | "sources" | "activity") => void;
  onSubmit: (record: Omit<SeniorDecisionRecord, "decisionMaker" | "createdAt">) => void;
};

const decisionOptions: Array<{
  value: SeniorDecisionRecord["decision"];
  label: string;
  accessibleLabel: string;
  description: string;
  icon: IconName;
}> = [
  { value: "approve", label: "Approve", accessibleLabel: "Approve", description: "Approve the request without conditions.", icon: "checkCircle" },
  { value: "approve_with_conditions", label: "Approve with conditions", accessibleLabel: "Approve with conditions", description: "Approve with the selected conditions.", icon: "shield" },
  { value: "return_to_analyst", label: "Return to analyst", accessibleLabel: "Return to analyst", description: "Send revision instructions to the analyst.", icon: "arrowLeft" },
  { value: "decline", label: "Decline", accessibleLabel: "Decline", description: "Do not extend the requested facility.", icon: "close" },
];

export function SeniorReviewPackage(props: SeniorReviewPackageProps) {
  return (
    <LearningModeSurface scope="senior-decision" className={styles.v6LearningSurface}>
      <SeniorDecisionWorkspaceV6 {...props} />
    </LearningModeSurface>
  );
}

export function SeniorDecisionWorkspaceV5(props: SeniorReviewPackageProps) {
  return <SeniorDecisionWorkspace {...props} version="v5" />;
}

export function SeniorDecisionWorkspaceV6(props: SeniorReviewPackageProps) {
  return <SeniorDecisionWorkspace {...props} version="v6" />;
}

function SeniorDecisionWorkspace({
  version,
  company,
  logoDomain,
  request,
  facilityType,
  decisionQuestion,
  reviewSummary,
  recommendation,
  findings,
  decisionSignals,
  sourcesCount,
  decisionMaker = "Morgan Lee",
  existingDecision,
  draft,
  learningMode = false,
  learningControl,
  onDraftChange,
  onExit,
  onOpenRecord,
  onSubmit,
}: SeniorReviewPackageProps & { version: "v5" | "v6" }) {
  const learningContext = useLearningMode();
  const learningEnabled = learningMode || learningContext.enabled;
  const initial = draft ?? {
    decision: recommendation.conditions.length > 0 ? "approve_with_conditions" as const : "approve" as const,
    rationale: "",
    conditions: recommendation.conditions,
    updatedAt: new Date().toISOString(),
  };
  // A new V6 decision must be chosen explicitly; an existing draft remains resumable.
  const initialDecision = version === "v6" && !draft ? undefined : initial.decision;
  const [decision, setDecision] = useState<SeniorDecisionRecord["decision"] | undefined>(initialDecision);
  const [rationale, setRationale] = useState(initial.rationale);
  const [conditions, setConditions] = useState(initial.conditions);
  const [activeStage, setActiveStage] = useState<"recommendation" | "decision">(existingDecision ? "decision" : "recommendation");
  const decisionOptionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const decisionFormRef = useRef<HTMLFormElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const hasMountedRef = useRef(false);
  const rationaleRequired = decision === "return_to_analyst" || decision === "decline";
  const conditionsRequired = decision === "approve_with_conditions";
  const canSubmit = Boolean(decision) && (!rationaleRequired || Boolean(rationale.trim())) && (!conditionsRequired || conditions.length > 0);
  const selectedOption = decisionOptions.find((option) => option.value === decision);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 0;
    stageHeadingRef.current?.focus({ preventScroll: true });
  }, [activeStage, existingDecision]);

  function updateDraft(next: Partial<SeniorDecisionDraft>) {
    const nextDecision = next.decision ?? decision;
    if (!nextDecision) return;
    onDraftChange?.({ decision: nextDecision, rationale, conditions, ...next, updatedAt: new Date().toISOString() });
  }

  function selectDecision(value: SeniorDecisionRecord["decision"]) {
    setDecision(value);
    updateDraft({ decision: value });
  }

  function handleDecisionKey(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      selectDecision(decisionOptions[index].value);
      return;
    }
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + decisionOptions.length) % decisionOptions.length;
    selectDecision(decisionOptions[nextIndex].value);
    decisionOptionRefs.current[nextIndex]?.focus();
  }

  function toggleCondition(condition: string) {
    const next = conditions.includes(condition)
      ? conditions.filter((item) => item !== condition)
      : [...conditions, condition];
    setConditions(next);
    updateDraft({ conditions: next });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !decision) return;
    onSubmit({ decision, rationale, conditions: conditionsRequired ? conditions : [] });
  }

  const actionLabel = decision === "approve"
    ? "Approve"
    : decision === "approve_with_conditions"
      ? "Approve with conditions"
      : decision === "return_to_analyst"
        ? "Return to analyst"
        : decision === "decline"
          ? "Decline"
          : "Record decision";

  if (version === "v6") {
    return (
      <div ref={scrollAreaRef} className={styles.v6Page} role="region" aria-label="Senior review content">
        <header className={styles.v6Topbar}>
          <div className={styles.v6TopbarInner}>
            <div className={styles.v6Identity}>
              <CompanyLogo domain={logoDomain} name={company} size="sm" />
              <span className={styles.v6IdentityDivider} aria-hidden="true" />
              <strong>{company}</strong>
            </div>
            <div className={styles.v6TopbarActions}>
              {learningControl}
              <button className={styles.closeButton} type="button" aria-label="Close senior review" onClick={onExit}>
                <Icon name="close" size="sm" />
              </button>
            </div>
          </div>
        </header>

        <div className={styles.v6ScrollArea}>
          <div className={styles.v6Frame}>
            <aside className={styles.v6Rail}>
              <WorkflowSteps
                ariaLabel="Senior decision sections"
                items={[
                  { id: "recommendation", label: "Review" },
                  { id: "decision", label: existingDecision ? "Decision record" : "Decision" },
                ]}
                value={activeStage}
                onChange={setActiveStage}
                className={styles.v6Steps}
              />
            </aside>

            <div className={styles.v6Content}>
              <div key={activeStage} className={styles.v6Stage}>
                {activeStage === "recommendation" && (
                  <div className={styles.v6ReviewStage}>
                    <header className={styles.v6Brief} aria-labelledby="senior-analyst-recommendation-v6" {...getLearningTargetProps(learningEnabled, "senior-recommendation")}>
                      <div className={styles.v6RecommendationLead}>
                        <IconTile tone="success"><Icon name="checkCircle" size="sm" /></IconTile>
                        <span>
                          <small className={styles.eyebrow}>Analyst recommendation</small>
                          <h1 ref={stageHeadingRef} tabIndex={-1} id="senior-analyst-recommendation-v6">{recommendation.decision}</h1>
                        </span>
                      </div>
                      <p className={styles.v6LeadRationale}>{reviewSummary ?? recommendation.rationale}</p>
                      <p className={styles.byline}>Prepared by {recommendation.author} · {formatDate(recommendation.createdAt)}</p>
                    </header>

                    {decisionQuestion && (
                      <section className={styles.v6DecisionQuestion} aria-label="Decision to make">
                        <Icon name="scale" size="sm" />
                        <span><small>Decision to make</small><strong>{decisionQuestion}</strong></span>
                      </section>
                    )}

                    <section className={styles.v6CreditSnapshot} aria-label="Decision snapshot" {...getLearningTargetProps(learningEnabled, "senior-decision-story")}>
                      <div className={styles.v6SnapshotHeader}>
                        <div className={styles.v6FacilitySnapshot}>
                          <span>Facility request</span>
                          <strong>{request}</strong>
                          <small>{facilityType}</small>
                        </div>
                      </div>
                      {decisionSignals.length > 0 && (
                        <dl className={styles.v6DecisionSignals} aria-label="Decision signals">
                          {decisionSignals.slice(0, 3).map((signal) => (
                            <div key={signal.label}>
                              <dt>{signal.label}</dt>
                              <dd>{signal.value}</dd>
                              {signal.policyComparison && (
                                <div
                                  className={styles.v6PolicyTrack}
                                  role="img"
                                  aria-label={`${signal.label}: ${signal.value}; ${signal.policyComparison.boundaryLabel}; ${signal.policyComparison.varianceLabel}`}
                                  style={{
                                    "--senior-policy-actual": `${getPolicyPosition(signal.policyComparison.actual, signal.policyComparison.domain)}%`,
                                    "--senior-policy-boundary": `${getPolicyPosition(signal.policyComparison.boundary, signal.policyComparison.domain)}%`,
                                  } as CSSProperties}
                                >
                                  <span aria-hidden="true"><i /><b /></span>
                                </div>
                              )}
                              <small data-tone={signal.detailTone ?? "neutral"}>{signal.detail}</small>
                            </div>
                          ))}
                        </dl>
                      )}
                    </section>

                    <div className={styles.v6ReviewDetails}>
                      {recommendation.conditions.length > 0 && (
                        <section className={styles.conditionsReview} aria-labelledby="senior-proposed-conditions-v6">
                          <header><h2 id="senior-proposed-conditions-v6">Conditions for approval</h2><small>{recommendation.conditions.length} proposed</small></header>
                          <div>
                            {recommendation.conditions.map((condition) => <p key={condition}>{condition}</p>)}
                          </div>
                        </section>
                      )}

                      <section className={styles.factors} aria-labelledby="senior-material-factors-v6" {...getLearningTargetProps(learningEnabled, "senior-findings")}>
                        <header><h2 id="senior-material-factors-v6">Material factors</h2><small>{findings.length} reviewed</small></header>
                        {findings.length > 0 ? (
                          <div className={styles.factorList}>
                            {findings.map((finding) => (
                              <details className={styles.factorRow} key={finding.id}>
                                <summary>
                                  <span><strong>{finding.title}</strong><small>{finding.status} · {finding.risk} risk</small></span>
                                  <Icon name="chevronDown" size="xs" />
                                </summary>
                                <p>{finding.detail}</p>
                              </details>
                            ))}
                          </div>
                        ) : <p className={styles.emptyFactors}>No material findings remain open in the submitted record.</p>}
                      </section>
                    </div>
                  </div>
                )}

                {activeStage === "decision" && (
                  existingDecision ? <RecordedDecisionV6 decision={existingDecision} recommendation={recommendation} request={request} facilityType={facilityType} headingRef={stageHeadingRef} /> : (
                    <form ref={decisionFormRef} className={styles.v6DecisionForm} onSubmit={submit} {...getLearningTargetProps(learningEnabled, "senior-final-action")}>
                    <header className={styles.v6DecisionIntro}>
                      <span className={styles.eyebrow}>Senior decision</span>
                      <h1 ref={stageHeadingRef} tabIndex={-1}>Record the outcome</h1>
                      <p className={styles.v6DecisionOwnerLine}><Icon name="lock" size="sm" /> {decisionMaker} records the final decision.</p>
                    </header>

                      <section className={styles.v6DecisionReference} aria-label="Analyst recommendation summary">
                        <IconTile tone="success" size="sm"><Icon name="checkCircle" size="sm" /></IconTile>
                        <span><small>Analyst recommendation</small><strong>{recommendation.decision}</strong></span>
                        <strong>{recommendation.amount}</strong>
                      </section>

                      <fieldset className={styles.v6Options}>
                        <legend className={styles.v6OptionsLegend}>Decision</legend>
                        <div className={styles.v6OptionsHeader} aria-hidden="true"><span>Decision</span><small>Required</small></div>
                        <div className={styles.v6OptionTrack}>
                          {decisionOptions.map((option, index) => (
                            <label key={option.value} data-selected={decision === option.value}>
                              <input
                                type="radio"
                                name={`${company}-senior-decision`}
                                aria-label={option.accessibleLabel}
                                checked={decision === option.value}
                                ref={(node) => { decisionOptionRefs.current[index] = node; }}
                                onChange={() => selectDecision(option.value)}
                                onKeyDown={(event) => handleDecisionKey(event, index)}
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                        <p className={styles.v6OptionDescription} aria-live="polite">{selectedOption?.description ?? "Choose an outcome to continue."}</p>
                      </fieldset>

                      {conditionsRequired && (
                        <fieldset className={styles.conditions}>
                          <legend>Approval conditions <small>{conditions.length} selected</small></legend>
                          <div>
                            {recommendation.conditions.map((condition) => (
                              <label key={condition} data-selected={conditions.includes(condition)}>
                                <input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                                <span>{condition}</span>
                              </label>
                            ))}
                          </div>
                          {conditions.length === 0 && <small role="alert">Select at least one condition.</small>}
                        </fieldset>
                      )}

                      <label className={styles.rationale}>
                        <span>{decision === "return_to_analyst" ? "Revision instructions" : decision === "decline" ? "Decline rationale" : "Decision note"}<small>{rationaleRequired ? "Required" : "Optional"}</small></span>
                        <textarea
                          value={rationale}
                          required={rationaleRequired}
                          aria-required={rationaleRequired}
                          onChange={(event) => { setRationale(event.target.value); updateDraft({ rationale: event.target.value }); }}
                          placeholder={decision === "return_to_analyst" ? "What should the analyst revise?" : decision === "decline" ? "Why should the request be declined?" : "Add rationale, monitoring expectations, or exceptions for the record."}
                        />
                      </label>
                    </form>
                  )
                )}
              </div>

              {onOpenRecord && activeStage === "recommendation" && (
                <section className={styles.recordNavigation} aria-labelledby="senior-case-record-v6">
                  <div>
                    <strong id="senior-case-record-v6">Full case record</strong>
                    <small>Review evidence, findings, and activity.</small>
                  </div>
                  <Button className={styles.recordNavigationAction} variant="quiet" size="sm" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onOpenRecord("overview")}>Open case overview</Button>
                </section>
              )}
            </div>
          </div>
        </div>

        <footer className={styles.v6Footer}>
          <div className={styles.v6FooterInner}>
            <div className={styles.v6FooterBar}>
              <div>
                {existingDecision
                  ? activeStage === "recommendation"
                    ? null
                    : onOpenRecord
                      ? <Button type="button" size="lg" variant="secondary" icon={<Icon name="arrowRight" size="sm" />} onClick={() => onOpenRecord("overview")}>Open case overview</Button>
                      : null
                  : activeStage === "recommendation"
                    ? <Button type="button" size="lg" variant="secondary" onClick={onExit}>Cancel</Button>
                    : <Button type="button" size="lg" variant="secondary" onClick={() => setActiveStage("recommendation")}>Back</Button>}
              </div>
              <div>
                {existingDecision
                  ? activeStage === "recommendation"
                    ? <Button type="button" size="lg" variant="primary" onClick={() => setActiveStage("decision")}>View decision record</Button>
                    : <Button type="button" size="lg" variant="secondary" onClick={onExit}>Back to senior reviews</Button>
                  : activeStage === "recommendation"
                    ? <Button type="button" size="lg" variant="primary" onClick={() => setActiveStage("decision")}>Continue to decision</Button>
                    : <Button type="button" size="lg" variant="primary" disabled={!canSubmit} onClick={() => decisionFormRef.current?.requestSubmit()}>{actionLabel}</Button>}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <CompanyLogo domain={logoDomain} name={company} size="sm" />
          <span className={styles.identityDivider} aria-hidden="true" />
          <strong>{company}</strong>
        </div>
        <div className={styles.topbarActions}>
          {learningControl}
          <button className={styles.closeButton} type="button" aria-label="Close senior review" onClick={onExit}>
            <Icon name="close" size="sm" />
          </button>
        </div>
      </header>

      <div ref={scrollAreaRef} className={styles.scrollArea} role="region" aria-label="Senior review content">
        <div className={styles.frame}>
          <aside className={styles.rail}>
            <WorkflowSteps
              ariaLabel="Senior decision sections"
              items={[
                { id: "recommendation", label: "Recommendation" },
                { id: "decision", label: existingDecision ? "Decision record" : "Decision" },
              ]}
              value={activeStage}
              onChange={existingDecision ? undefined : setActiveStage}
            />
          </aside>

          <div className={styles.content}>
            <div key={activeStage} className={styles.stage}>
              {activeStage === "recommendation" && !existingDecision && (
                <div className={styles.reviewStage}>
                  <header className={styles.brief} aria-labelledby="senior-analyst-recommendation" {...getLearningTargetProps(learningEnabled, "senior-recommendation")}>
                    <span className={styles.eyebrow}>Analyst recommendation</span>
                    <h1 ref={stageHeadingRef} tabIndex={-1} id="senior-analyst-recommendation">{recommendation.decision}</h1>
                    {decisionQuestion && <p className={styles.decisionQuestion}><span>Decision to make</span>{decisionQuestion}</p>}
                    <p className={styles.leadRationale}>{reviewSummary ?? recommendation.rationale}</p>
                    <p className={styles.byline}>Prepared by {recommendation.author} · {formatDate(recommendation.createdAt)}</p>
                  </header>

                  <section className={styles.creditSnapshot} aria-label="Decision snapshot" {...getLearningTargetProps(learningEnabled, "senior-decision-story")}>
                    <div className={styles.facilitySnapshot}>
                      <span>Facility request</span>
                      <strong>{request}</strong>
                      <small>{facilityType}</small>
                    </div>
                    <div className={styles.reviewProfile}>
                      <span className={styles.profileHeading}><Icon name="checkCircle" size="sm" /> Review record</span>
                      <strong>{findings.length} {findings.length === 1 ? "finding" : "findings"} reviewed</strong>
                      <small>{sourcesCount} {sourcesCount === 1 ? "source" : "sources"} reviewed</small>
                    </div>
                    {decisionSignals.length > 0 && (
                      <dl className={styles.decisionSignals} aria-label="Decision signals">
                        {decisionSignals.slice(0, 3).map((signal) => (
                          <div key={signal.label}>
                            <dt>{signal.label}</dt>
                            <dd>{signal.value}</dd>
                            <small>{signal.detail}</small>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>

                  {recommendation.conditions.length > 0 && (
                    <section className={styles.conditionsReview} aria-labelledby="senior-proposed-conditions">
                      <header><h2 id="senior-proposed-conditions">Conditions for approval</h2><small>{recommendation.conditions.length} proposed</small></header>
                      <div>
                        {recommendation.conditions.map((condition) => <p key={condition}>{condition}</p>)}
                      </div>
                    </section>
                  )}

                  <section className={styles.factors} aria-labelledby="senior-material-factors" {...getLearningTargetProps(learningEnabled, "senior-findings")}>
                    <header><h2 id="senior-material-factors">Material factors</h2><small>{findings.length} reviewed</small></header>
                    {findings.length > 0 ? (
                      <div className={styles.factorList}>
                        {findings.map((finding) => (
                          <details className={styles.factorRow} key={finding.id}>
                            <summary>
                              <span><strong>{finding.title}</strong><small>{finding.status}</small></span>
                              <span className={styles.riskLabel}>{finding.risk} risk</span>
                              <Icon name="chevronDown" size="xs" />
                            </summary>
                            <p>{finding.detail}</p>
                          </details>
                        ))}
                      </div>
                    ) : <p className={styles.emptyFactors}>No material findings remain open in the submitted record.</p>}
                  </section>

                </div>
              )}

              {activeStage === "decision" && (
                existingDecision ? <RecordedDecision decision={existingDecision} recommendation={recommendation} headingRef={stageHeadingRef} /> : (
                  <form ref={decisionFormRef} className={styles.decisionForm} onSubmit={submit} {...getLearningTargetProps(learningEnabled, "senior-final-action")}>
                    <header className={styles.decisionIntro}>
                      <span className={styles.eyebrow}>Senior decision</span>
                      <h1 ref={stageHeadingRef} tabIndex={-1}>Record the outcome</h1>
                    </header>

                    <dl className={styles.decisionReference} aria-label="Analyst recommendation summary">
                      <div><dt>Recommendation</dt><dd>{recommendation.decision}</dd></div>
                      <div><dt>Request</dt><dd>{recommendation.amount}</dd></div>
                    </dl>

                    <fieldset className={styles.options}>
                      <legend>Decision</legend>
                      <div>
                        {decisionOptions.map((option, index) => (
                          <label key={option.value} data-selected={decision === option.value}>
                            <input
                              type="radio"
                              name={`${company}-senior-decision`}
                              aria-label={option.accessibleLabel}
                              checked={decision === option.value}
                              ref={(node) => { decisionOptionRefs.current[index] = node; }}
                              onChange={() => selectDecision(option.value)}
                              onKeyDown={(event) => handleDecisionKey(event, index)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className={styles.visuallyHidden} aria-live="polite">{selectedOption?.description ?? "Choose an outcome to continue."}</p>
                    </fieldset>

                    {conditionsRequired && (
                      <fieldset className={styles.conditions}>
                        <legend>Approval conditions <small>{conditions.length} selected</small></legend>
                        <div>
                          {recommendation.conditions.map((condition) => (
                            <label key={condition} data-selected={conditions.includes(condition)}>
                              <input type="checkbox" checked={conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                              <span>{condition}</span>
                            </label>
                          ))}
                        </div>
                        {conditions.length === 0 && <small role="alert">Select at least one condition.</small>}
                      </fieldset>
                    )}

                    <label className={styles.rationale}>
                      <span>{decision === "return_to_analyst" ? "Revision instructions" : decision === "decline" ? "Decline rationale" : "Decision note"}<small>{rationaleRequired ? "Required" : "Optional"}</small></span>
                      <textarea
                        value={rationale}
                        required={rationaleRequired}
                        aria-required={rationaleRequired}
                        onChange={(event) => { setRationale(event.target.value); updateDraft({ rationale: event.target.value }); }}
                        placeholder={decision === "return_to_analyst" ? "What should the analyst revise?" : decision === "decline" ? "Why should the request be declined?" : "Add rationale, monitoring expectations, or exceptions for the record."}
                      />
                    </label>

                    <p className={styles.decisionOwner}>Decision owner · {decisionMaker}</p>
                  </form>
                )
              )}
            </div>

            {onOpenRecord && (
              <section className={styles.recordNavigation} aria-labelledby="senior-case-record">
                <strong id="senior-case-record">Case record</strong>
                <Button className={styles.recordNavigationAction} variant="quiet" size="sm" icon={<Icon name="arrowRight" size="xs" />} onClick={() => onOpenRecord("overview")}>Open overview</Button>
              </section>
            )}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            {existingDecision
              ? null
              : activeStage === "recommendation"
                ? <Button type="button" size="lg" variant="secondary" onClick={onExit}>Cancel</Button>
                : <Button type="button" size="lg" variant="secondary" onClick={() => setActiveStage("recommendation")}>Back</Button>}
          </div>
          <div>
            {existingDecision
              ? <Button type="button" size="lg" variant="secondary" onClick={onExit}>Back to senior reviews</Button>
              : activeStage === "recommendation"
                ? <Button type="button" size="lg" variant="primary" onClick={() => setActiveStage("decision")}>Continue to decision</Button>
                : <Button type="button" size="lg" variant="primary" disabled={!canSubmit} onClick={() => decisionFormRef.current?.requestSubmit()}>{actionLabel}</Button>}
          </div>
        </div>
      </footer>
    </div>
  );
}

function RecordedDecisionV6({
  decision,
  recommendation,
  request,
  facilityType,
  headingRef,
}: {
  decision: SeniorDecisionRecord;
  recommendation: AnalystRecommendationRecord;
  request: string;
  facilityType: string;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const returned = decision.decision === "return_to_analyst";
  const declined = decision.decision === "decline";
  const outcomeLabel = returned ? "Revision requested" : seniorDecisionLabel(decision.decision);
  const outcomeTone = returned ? "warning" : declined ? "danger" : "success";
  const outcomeIcon = returned ? "arrowLeft" : declined ? "close" : "checkCircle";
  const note = decision.rationale.trim()
    ? decision.rationale
    : returned
      ? "No revision instructions recorded."
      : "No additional senior note recorded.";

  return (
    <article className={styles.v6RecordedDecision} aria-labelledby="senior-decision-record-v6">
      <header className={styles.v6RecordedHeader}>
        <div className={styles.v6RecordedOutcome}>
          <IconTile tone={outcomeTone} shape="circle" size="sm"><Icon name={outcomeIcon} size="sm" /></IconTile>
          <div>
            <span className={styles.eyebrow}>Decision record</span>
            <h1 ref={headingRef} tabIndex={-1} id="senior-decision-record-v6">{outcomeLabel}</h1>
            <p>{returned ? "Returned to the analyst for revision." : "Final senior credit disposition."}</p>
          </div>
        </div>
      </header>

      <dl className={styles.v6RecordedMeta} aria-label="Recorded decision details">
        <div>
          <dt>Facility request</dt>
          <dd>{request}</dd>
        </div>
        <div>
          <dt>Facility type</dt>
          <dd>{facilityType}</dd>
        </div>
        <div>
          <dt>{returned ? "Waiting on" : "Recorded by"}</dt>
          <dd>{returned ? recommendation.author : decision.decisionMaker}</dd>
          <small>{formatDateTime(decision.createdAt)}</small>
        </div>
      </dl>

      <section className={styles.v6RecordedSection}>
        <header>
          <h2>{returned ? "Revision instructions" : "Senior decision note"}</h2>
          <small>{returned ? "Required record" : "Human-authored record"}</small>
        </header>
        <p>{note}</p>
      </section>

      <section className={styles.v6RecordedSection}>
        <header>
          <h2>Analyst recommendation considered</h2>
          <small>Submitted {formatDate(recommendation.createdAt)}</small>
        </header>
        <div className={styles.v6RecommendationRecord}>
          <div>
            <strong>{recommendation.decision}</strong>
            <span>{recommendation.amount}</span>
          </div>
          <p>{recommendation.rationale}</p>
          <small>Prepared by {recommendation.author}</small>
        </div>
      </section>

      {decision.conditions.length > 0 && !returned && (
        <section className={`${styles.v6RecordedSection} ${styles.v6RecordedConditions}`}>
          <header>
            <h2>Final conditions</h2>
            <small>{decision.conditions.length} recorded</small>
          </header>
          <div>{decision.conditions.map((condition) => <p key={condition}>{condition}</p>)}</div>
        </section>
      )}

    </article>
  );
}

function RecordedDecision({ decision, recommendation, headingRef }: { decision: SeniorDecisionRecord; recommendation: AnalystRecommendationRecord; headingRef: Ref<HTMLHeadingElement> }) {
  const returned = decision.decision === "return_to_analyst";

  return (
    <article className={styles.recordedDecision}>
      <header>
        <span className={styles.eyebrow}>Decision recorded</span>
        <h1 ref={headingRef} tabIndex={-1}>{returned ? `Returned to ${recommendation.author}` : seniorDecisionLabel(decision.decision)}</h1>
        <p>{decision.decisionMaker} · {formatDateTime(decision.createdAt)}</p>
      </header>
      {decision.rationale && (
        <section>
          <h2>{returned ? "Revision instructions" : "Decision rationale"}</h2>
          <p>{decision.rationale}</p>
        </section>
      )}
      {decision.conditions.length > 0 && (
        <section className={styles.recordedConditions}>
          <h2>Final conditions</h2>
          <div>{decision.conditions.map((condition) => <p key={condition}>{condition}</p>)}</div>
        </section>
      )}
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function getPolicyPosition(value: number, domain: readonly [minimum: number, maximum: number]) {
  const [minimum, maximum] = domain;
  if (maximum <= minimum) return 0;
  return Math.min(100, Math.max(0, ((value - minimum) / (maximum - minimum)) * 100));
}
