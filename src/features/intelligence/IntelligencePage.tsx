import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppLink } from "../../app/router";
import { Button } from "../../shared/ui/Button/Button";
import { CompanyLogo } from "../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import { Popover } from "../../shared/ui/Popover/Popover";
import { StatusPill } from "../../shared/ui/StatusPill/StatusPill";
import { Toast } from "../../shared/ui/Toast/Toast";
import { CoverageChart } from "./CoverageChart";
import { companyLogoDomains } from "../credit-reviews/companyLogos";
import {
  contextCategories,
  intelligenceContexts,
  sourceDetails,
  type IntelligenceContext,
} from "./intelligenceData";
import styles from "./IntelligencePage.module.css";
import { getLearningTargetProps, LearningModeSurface, useLearningMode } from "../credit-reviews/learning/MeridianLearningMode";

type ResponseMode = "briefing" | "coverage";
type TurnStatus = "working" | "complete";

type Turn = {
  id: string;
  prompt: string;
  mode: ResponseMode;
  contextIds: string[];
  status: TurnStatus;
};

const workSteps: Record<ResponseMode, Array<{ label: string; railLabel: string; detail: string; icon: IconName }>> = {
  briefing: [
    { label: "Scoping the review", railLabel: "Scope", detail: "Meridian Foods and the selected finding", icon: "search" },
    { label: "Reading approved evidence", railLabel: "Evidence", detail: "6 sources, including the renewed customer contract", icon: "document" },
    { label: "Reconciling the assessment", railLabel: "Reconcile", detail: "Original risk, updated evidence, and open judgment", icon: "scale" },
    { label: "Preparing the briefing", railLabel: "Brief", detail: "Decision-relevant changes and suggested conditions", icon: "clipboard" },
  ],
  coverage: [
    { label: "Loading the credit model", railLabel: "Model", detail: "Actual, base, and downside cases", icon: "calculator" },
    { label: "Testing the covenant", railLabel: "Covenant", detail: "1.25× minimum fixed-charge coverage", icon: "scale" },
    { label: "Comparing projected quarters", railLabel: "Compare", detail: "Q4 2025 through Q3 2026", icon: "chart" },
    { label: "Building the decision view", railLabel: "Decision", detail: "Breach timing and distance to covenant", icon: "clipboard" },
  ],
};

const briefingPrompt = "Brief me on what changed in Meridian Foods and what still needs analyst judgment.";
const coveragePrompt = "Compare Meridian Foods’ coverage under the base and downside cases.";

export const INTELLIGENCE_WORK_TIMING = {
  stepStarts: [0, 950, 1950, 3000],
  complete: 4200,
  reducedMotionComplete: 120,
} as const;

function prefersReducedMotion() {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveMode(prompt: string): ResponseMode {
  return /chart|compare|coverage|downside|covenant|trend/i.test(prompt) ? "coverage" : "briefing";
}

function contextsFor(ids: string[]) {
  return ids
    .map((id) => intelligenceContexts.find((context) => context.id === id))
    .filter((context): context is IntelligenceContext => Boolean(context));
}

export function IntelligencePage() {
  return <LearningModeSurface scope="intelligence"><IntelligencePageContent /></LearningModeSurface>;
}

function IntelligencePageContent() {
  const { enabled } = useLearningMode();
  const [input, setInput] = useState("");
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
  const [workStep, setWorkStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [highlightedContext, setHighlightedContext] = useState(0);
  const [expandedWork, setExpandedWork] = useState<Record<string, boolean>>({});
  const [openSource, setOpenSource] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const activeTurnRef = useRef<HTMLElement>(null);
  const idCounter = useRef(0);

  const isWorking = activeTurnId !== null;
  const atQuery = input.match(/@([^@\s]*)$/)?.[1]?.toLowerCase() ?? "";
  const selectedContexts = useMemo(() => contextsFor(selectedContextIds), [selectedContextIds]);
  const visibleContexts = useMemo(() => {
    if (!atQuery) return intelligenceContexts;
    return intelligenceContexts.filter((context) => `${context.label} ${context.detail}`.toLowerCase().includes(atQuery));
  }, [atQuery]);

  useEffect(() => {
    if (!activeTurnId) return;

    const reduceMotion = prefersReducedMotion();
    setWorkStep(reduceMotion ? INTELLIGENCE_WORK_TIMING.stepStarts.length - 1 : 0);
    const progressTimers = reduceMotion
      ? []
      : INTELLIGENCE_WORK_TIMING.stepStarts.slice(1).map((delay, index) => (
        window.setTimeout(() => setWorkStep(index + 1), delay)
      ));
    const completionTimer = window.setTimeout(() => {
      setTurns((current) => current.map((turn) => turn.id === activeTurnId ? { ...turn, status: "complete" } : turn));
      setExpandedWork((current) => ({ ...current, [activeTurnId]: false }));
      setActiveTurnId(null);
    }, reduceMotion ? INTELLIGENCE_WORK_TIMING.reducedMotionComplete : INTELLIGENCE_WORK_TIMING.complete);

    return () => {
      progressTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [activeTurnId]);

  useEffect(() => {
    if (!activeTurnId || typeof activeTurnRef.current?.scrollIntoView !== "function") return;
    activeTurnRef.current.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeTurnId]);

  function runTurn(prompt: string, contextIds = selectedContextIds) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isWorking) return;

    const mode = resolveMode(cleanPrompt);
    const defaults = mode === "coverage"
      ? ["meridian-foods", "increasing-leverage"]
      : ["meridian-foods", "customer-concentration"];
    const turn: Turn = {
      id: `intelligence-turn-${++idCounter.current}`,
      prompt: cleanPrompt,
      mode,
      contextIds: contextIds.length ? contextIds : defaults,
      status: "working",
    };

    setTurns((current) => [...current, turn]);
    setActiveTurnId(turn.id);
    setWorkStep(0);
    setExpandedWork((current) => ({ ...current, [turn.id]: true }));
    setInput("");
    setSelectedContextIds([]);
    setPickerOpen(false);
    setOpenSource(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runTurn(input);
  }

  function openContextPicker() {
    if (isWorking) return;
    setInput((current) => /@[^@\s]*$/.test(current) ? current : `${current}${current && !current.endsWith(" ") ? " " : ""}@`);
    setPickerOpen(true);
    setHighlightedContext(0);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }

  function selectContext(context: IntelligenceContext) {
    setSelectedContextIds((current) => current.includes(context.id) ? current : [...current, context.id]);
    setInput((current) => current.replace(/@[^@\s]*$/, "").trimStart());
    setPickerOpen(false);
    setHighlightedContext(0);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }

  function removeContext(id: string) {
    setSelectedContextIds((current) => current.filter((contextId) => contextId !== id));
  }

  function handleInput(value: string) {
    setInput(value);
    const hasMention = /@[^@\s]*$/.test(value);
    setPickerOpen(hasMention);
    if (hasMention) setHighlightedContext(0);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (pickerOpen && visibleContexts.length) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedContext((current) => (current + 1) % visibleContexts.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedContext((current) => (current - 1 + visibleContexts.length) % visibleContexts.length);
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        selectContext(visibleContexts[highlightedContext]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setPickerOpen(false);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runTurn(input);
    }
  }

  function resetConversation() {
    setTurns([]);
    setActiveTurnId(null);
    setWorkStep(0);
    setInput("");
    setSelectedContextIds([]);
    setPickerOpen(false);
    setExpandedWork({});
    setOpenSource(null);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }

  function cancelRun() {
    if (!activeTurnId) return;
    setTurns((current) => current.filter((turn) => turn.id !== activeTurnId));
    setActiveTurnId(null);
    setWorkStep(0);
  }

  async function copyAnswer(turn: Turn) {
    const copy = turn.mode === "briefing"
      ? "Meridian Foods remains supportable with conditions. The Customer A renewal removes near-term expiration risk, while 61% top-two concentration and downside leverage still require judgment."
      : "Meridian Foods fixed-charge coverage falls below the 1.25x covenant in Q2 2026 under the downside case and reaches 1.08x in Q3 2026.";
    try {
      await navigator.clipboard?.writeText(copy);
    } catch {
      // The visible confirmation remains useful in demo contexts without clipboard permission.
    }
    setToast({ title: "Answer copied", message: "Ready to paste into a credit note." });
  }

  function recordFeedback(turnId: string, value: "up" | "down") {
    setFeedback((current) => ({ ...current, [turnId]: value }));
    setToast({
      title: "Feedback recorded",
      message: value === "up" ? "This answer was marked helpful." : "This answer was marked for improvement.",
    });
  }

  function renderContextMark(context: IntelligenceContext, placement: "chip" | "picker") {
    if (context.category === "Reviews") {
      return (
        <CompanyLogo
          className={styles.contextCompanyLogo}
          domain={companyLogoDomains[context.company]}
          name={context.company}
          size="sm"
        />
      );
    }

    if (placement === "chip") return <Icon name={context.icon} size="xs" />;
    return <span className={styles.contextIcon}><Icon name={context.icon} size="sm" /></span>;
  }

  function renderContextPicker(position: "empty" | "thread") {
    if (!pickerOpen) return null;

    return (
      <Popover
        id={`intelligence-context-picker-${position}`}
        className={`${styles.contextPopover} ${position === "thread" ? styles.contextPopoverAbove : ""}`}
        role="listbox"
        aria-label="Add intelligence context"
      >
        <div className={styles.pickerHeader}>
          <span>Add context</span>
          <kbd>↑↓ to navigate · Enter to add</kbd>
        </div>
        {visibleContexts.length ? contextCategories.map((category) => {
          const options = visibleContexts.filter((context) => context.category === category);
          if (!options.length) return null;
          return (
            <section className={styles.contextGroup} key={category} aria-label={category}>
              <p>{category}</p>
              {options.map((context) => {
                const index = visibleContexts.indexOf(context);
                const isSelected = selectedContextIds.includes(context.id);
                return (
                  <button
                    key={context.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.contextOption} ${index === highlightedContext ? styles.contextOptionHighlighted : ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlightedContext(index)}
                    onClick={() => selectContext(context)}
                  >
                    {renderContextMark(context, "picker")}
                    <span className={styles.contextOptionCopy}>
                      <strong>{context.label}</strong>
                      <small>{context.detail}</small>
                    </span>
                    {isSelected && <Icon name="check" size="xs" />}
                  </button>
                );
              })}
            </section>
          );
        }) : (
          <div className={styles.noContextResults}>
            <Icon name="search" size="sm" />
            <span>No reviews, findings, sources, or portfolio views match “{atQuery}”.</span>
          </div>
        )}
      </Popover>
    );
  }

  function renderComposer(position: "empty" | "thread") {
    const canSend = Boolean(input.trim()) && !/^@[^@\s]*$/.test(input.trim());

    return (
      <form className={`${styles.composer} ${position === "thread" ? styles.threadComposer : ""}`} onSubmit={handleSubmit}>
        <div className={styles.composerAnchor}>
          {renderContextPicker(position)}
          <div className={styles.composerSurface}>
            {selectedContexts.length > 0 && (
              <div className={styles.contextChips} aria-label="Selected context">
                {selectedContexts.map((context) => (
                  <span className={styles.contextChip} key={context.id}>
                    {renderContextMark(context, "chip")}
                    <span>{context.label}</span>
                    <button type="button" aria-label={`Remove ${context.label} context`} onClick={() => removeContext(context.id)}>
                      <Icon name="close" size="xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.composerRow}>
              <button
                className={styles.contextTrigger}
                type="button"
                aria-label="Add context with at mention"
                aria-expanded={pickerOpen}
                aria-controls={`intelligence-context-picker-${position}`}
                onClick={openContextPicker}
                disabled={isWorking}
              >
                <Icon name="atSign" size="sm" />
              </button>
              <label className={styles.visuallyHidden} htmlFor={`intelligence-composer-${position}`}>Intelligence message</label>
              <textarea
                id={`intelligence-composer-${position}`}
                ref={composerRef}
                value={input}
                rows={1}
                placeholder={isWorking ? "Analyzing your request" : "Ask a question or give an instruction"}
                disabled={isWorking}
                onChange={(event) => handleInput(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              {isWorking ? (
                <button className={styles.sendButton} type="button" aria-label="Stop generating" onClick={cancelRun}>
                  <span className={styles.stopIcon} aria-hidden="true" />
                </button>
              ) : (
                <button className={styles.sendButton} type="submit" aria-label="Send message" disabled={!canSend}>
                  <Icon name="send" size="sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={`${styles.page} ${turns.length ? styles.pageWithThread : ""}`} {...getLearningTargetProps(enabled, "intelligence-workflow")}>
      {turns.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="intelligence-title">
          <div className={styles.emptyCopy}>
            <h1 id="intelligence-title">Ask about your credit portfolio</h1>
            <p>Use <strong>@</strong> to ground the answer in a review, finding, source, or portfolio view.</p>
          </div>
          {renderComposer("empty")}
          <div className={styles.examples}>
            <p>Try one of these prompts:</p>
            <div>
              <button type="button" onClick={() => runTurn(briefingPrompt, ["meridian-foods", "customer-concentration"])}>
                <Icon name="document" size="sm" />
                Brief me on Meridian Foods
              </button>
              <button type="button" onClick={() => runTurn(coveragePrompt, ["meridian-foods", "increasing-leverage"])}>
                <Icon name="chart" size="sm" />
                Compare downside coverage
              </button>
            </div>
          </div>
          <p className={styles.guardrail}>Intelligence synthesizes approved sources. Analysts own recommendations and decisions.</p>
        </section>
      ) : (
        <>
          <header className={styles.conversationBar}>
            <button type="button" onClick={resetConversation}><Icon name="arrowLeft" size="sm" /> New analysis</button>
            <span>Credit intelligence</span>
            <button type="button" aria-label="New conversation" onClick={resetConversation}><Icon name="plus" size="sm" /></button>
          </header>

          <div className={styles.thread}>
            {turns.map((turn) => {
              const turnContexts = contextsFor(turn.contextIds);
              const steps = workSteps[turn.mode];
              const isActive = turn.id === activeTurnId;
              return (
                <article className={styles.turn} key={turn.id} ref={isActive ? activeTurnRef : undefined}>
                  <div className={styles.userMessage}>
                    {turnContexts.length > 0 && (
                      <div className={styles.messageContexts}>
                        {turnContexts.map((context) => <span key={context.id}>@{context.label}</span>)}
                      </div>
                    )}
                    <p>{turn.prompt}</p>
                  </div>

                  {turn.status === "working" ? (
                    <section className={styles.workTrace} aria-label="Intelligence work in progress">
                      <div className={styles.workHeader}>
                        <span className={styles.activityOrb} aria-hidden="true" />
                        <span
                          className={styles.workHeaderCopy}
                          key={`${turn.id}-${workStep}`}
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <strong>{steps[workStep].label}</strong>
                          <small>{steps[workStep].detail}</small>
                        </span>
                      </div>
                      <ol className={styles.workSteps} aria-label="Analysis progress">
                        {steps.map((step, index) => {
                          const state = index < workStep ? "complete" : index === workStep ? "active" : "pending";
                          return (
                            <li className={styles.workStep} data-state={state} aria-label={step.label} aria-current={state === "active" ? "step" : undefined} key={step.label}>
                              <span className={styles.workStepMark} aria-hidden="true">
                                {state === "complete" ? (
                                  <span className={styles.workStepCheck}><Icon name="check" size="xs" /></span>
                                ) : <Icon name={step.icon} size="xs" />}
                              </span>
                              <span className={styles.workStepCopy}><strong>{step.railLabel}</strong></span>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  ) : (
                    <div>
                      <span className={styles.visuallyHidden} role="status" aria-live="polite">
                        Analysis complete. Answer ready.
                      </span>
                      <button
                        type="button"
                        className={`${styles.workDisclosure} ${styles.answerReveal}`}
                        aria-expanded={Boolean(expandedWork[turn.id])}
                        onClick={() => setExpandedWork((current) => ({ ...current, [turn.id]: !current[turn.id] }))}
                      >
                        <Icon name="checkCircle" size="sm" />
                        Worked across {turn.mode === "briefing" ? "6 approved sources" : "3 model scenarios"}
                        <Icon name="chevronDown" size="sm" />
                      </button>
                      {expandedWork[turn.id] && (
                        <div className={styles.completedWork}>
                          {steps.map((step) => (
                            <span key={step.label}><Icon name="check" size="xs" /> {step.label}</span>
                          ))}
                        </div>
                      )}

                      {turn.mode === "briefing" ? (
                        <div className={styles.answer} {...getLearningTargetProps(enabled, "intelligence-answer")}>
                          <div className={`${styles.answerLead} ${styles.answerReveal} ${styles.answerRevealLead}`}>
                            <p><strong>Meridian Foods remains supportable with conditions.</strong> The renewed Customer A contract removes the near-term expiration risk that drove the original Material rating.</p>
                            <p>The underlying concentration has not changed: Customer A still represents 36% of revenue and the top two customers represent 61%. The finding should remain Moderate, with analyst judgment focused on quarterly concentration reporting and limits on additional debt.</p>
                          </div>

                          <div className={`${styles.answerArtifact} ${styles.answerReveal} ${styles.answerRevealArtifact}`}>
                            <div className={styles.riskLine}>
                              <StatusPill tone="info">Moderate risk</StatusPill>
                              <span>Analysis updated from 6 approved sources</span>
                            </div>

                            <div className={styles.findingSummary}>
                              <div>
                                <span>What changed</span>
                                <p>Customer A is contracted through March 2030; immediate revenue-loss risk decreased.</p>
                              </div>
                              <div>
                                <span>What still matters</span>
                                <p>Concentration and downside leverage remain material to repayment capacity.</p>
                              </div>
                            </div>
                          </div>

                          <div className={`${styles.answerReveal} ${styles.answerRevealSupporting}`}>
                            <div className={styles.sourceRow} aria-label="Answer sources">
                              {Object.entries(sourceDetails).map(([id, source]) => (
                                <button type="button" key={id} aria-expanded={openSource === id} onClick={() => setOpenSource((current) => current === id ? null : id)}>
                                  <Icon name="document" size="xs" /> {source.label}
                                </button>
                              ))}
                            </div>
                            {openSource && sourceDetails[openSource] && (
                              <aside className={styles.sourceExcerpt}>
                                <span><strong>{sourceDetails[openSource].label}</strong>{sourceDetails[openSource].meta}</span>
                                <p>“{sourceDetails[openSource].excerpt}”</p>
                              </aside>
                            )}
                          </div>

                          <div className={`${styles.answerReveal} ${styles.answerRevealSupporting}`}>
                            <div className={styles.answerFooter}>
                              <AppLink to="/credit-reviews/meridian-foods/findings/customer-concentration">Open concentration finding <Icon name="arrowRight" size="sm" /></AppLink>
                              <div className={styles.answerActions}>
                                <button type="button" aria-label="Copy answer" onClick={() => copyAnswer(turn)}><Icon name="copy" size="sm" /></button>
                                <button type="button" aria-label="Mark answer helpful" aria-pressed={feedback[turn.id] === "up"} onClick={() => recordFeedback(turn.id, "up")}><Icon name="thumbUp" size="sm" /></button>
                                <button type="button" aria-label="Mark answer unhelpful" aria-pressed={feedback[turn.id] === "down"} onClick={() => recordFeedback(turn.id, "down")}><Icon name="thumbDown" size="sm" /></button>
                              </div>
                            </div>

                            <div className={styles.followUps}>
                              <span>Ask a follow-up</span>
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={<Icon name="chart" size="xs" />}
                                onClick={() => runTurn("Show whether fixed-charge coverage stays above covenant in the downside case.", ["meridian-foods", "increasing-leverage"])}
                              >
                                Show downside coverage
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.answer} {...getLearningTargetProps(enabled, "intelligence-answer")}>
                          <div className={`${styles.answerLead} ${styles.answerReveal} ${styles.answerRevealLead}`}>
                            <p><strong>Coverage remains above covenant in the base case, but the downside case breaches in Q2 2026.</strong> It falls to 1.16×, then reaches 1.08× in Q3—0.17× below the 1.25× minimum.</p>
                          </div>
                          <div className={`${styles.answerArtifact} ${styles.answerReveal} ${styles.answerRevealArtifact}`}>
                            <CoverageChart />
                            <p>The most decision-relevant condition is an early-warning trigger before Q2, paired with limits on additional debt while coverage is below 1.35×.</p>
                          </div>
                          <div className={`${styles.answerReveal} ${styles.answerRevealSupporting}`}>
                            <div className={styles.answerFooter}>
                              <AppLink to="/credit-reviews/meridian-foods/financials">Open financial analysis <Icon name="arrowRight" size="sm" /></AppLink>
                              <div className={styles.answerActions}>
                                <button type="button" aria-label="Copy answer" onClick={() => copyAnswer(turn)}><Icon name="copy" size="sm" /></button>
                                <button type="button" aria-label="Mark answer helpful" aria-pressed={feedback[turn.id] === "up"} onClick={() => recordFeedback(turn.id, "up")}><Icon name="thumbUp" size="sm" /></button>
                                <button type="button" aria-label="Mark answer unhelpful" aria-pressed={feedback[turn.id] === "down"} onClick={() => recordFeedback(turn.id, "down")}><Icon name="thumbDown" size="sm" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={`${styles.assistantLabel} ${styles.answerReveal} ${styles.answerRevealSupporting}`}><span aria-hidden="true">B</span> BCGX Intelligence</div>
                    </div>
                  )}
                  {isActive && <span className={styles.visuallyHidden}>Analysis is still in progress.</span>}
                </article>
              );
            })}
            <div className={styles.threadEnd} aria-hidden="true" />
          </div>

          <div className={styles.composerDock}>{renderComposer("thread")}</div>
        </>
      )}

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
