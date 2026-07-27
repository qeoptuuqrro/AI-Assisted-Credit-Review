import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter, type AppPath } from "../../../app/router";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { SearchField } from "../../../shared/ui/SearchField/SearchField";
import { StatusPill, type StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { Text } from "../../../shared/ui/Text/Text";
import { companyLogoDomains } from "../companyLogos";
import { getStandardReviewPath, isStandardReview, reviews, type CreditReview } from "../reviewData";
import {
  createInitialMeridianState,
  createInitialNorthstarState,
  createMeridianPreset,
  createNorthstarPreset,
  meridianReviewReducer,
  northstarReviewReducer,
  seniorDecisionLabel,
  type AnalystRecommendationRecord,
  type MeridianReviewState,
  type NorthstarReviewState,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import {
  MERIDIAN_STORAGE_KEY,
  NORTHSTAR_STORAGE_KEY,
  usePersistentReviewState,
  useReviewWorkflowRevision,
} from "../workflow/usePersistentReviewState";
import styles from "./SeniorReviewsPage.module.css";
import { LearningModeSurface, LearningTarget } from "../learning/MeridianLearningMode";
import { readPersistedStandardReviewState, standardReviewStorageKey } from "../standard/standardReviewState";
import { standardReviewSlugs } from "../reviewData";

type SeniorQueueStage = "ready" | "waiting" | "decided";

type SeniorQueueItem = {
  id: string;
  company: CreditReview["company"];
  request: string;
  facilityType: string;
  stage: SeniorQueueStage;
  statusLabel: string;
  statusTone: StatusPillTone;
  submittedBy: string;
  submittedAt: string;
  recommendationTitle: string;
  recommendationRationale: string;
  conditions: string[];
  decisionQuestion: string;
  facts: Array<{ label: string; value: string }>;
  findingSummary: string;
  route: AppPath;
};

const stageTabs: Array<{ id: SeniorQueueStage; label: string }> = [
  { id: "ready", label: "Needs review" },
  { id: "waiting", label: "Waiting on analyst" },
  { id: "decided", label: "Decided" },
];

export function SeniorReviewsPage() {
  return <LearningModeSurface scope="senior-queue"><SeniorReviewsPageContent /></LearningModeSurface>;
}

function SeniorReviewsPageContent() {
  const { navigate, pathname, search } = useRouter();
  const [meridianState, dispatchMeridian] = usePersistentReviewState(meridianReviewReducer, createInitialMeridianState(), MERIDIAN_STORAGE_KEY);
  const [northstarState, dispatchNorthstar] = usePersistentReviewState(northstarReviewReducer, createInitialNorthstarState(), NORTHSTAR_STORAGE_KEY);
  useReviewWorkflowRevision([MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, ...standardReviewSlugs.map(standardReviewStorageKey)]);
  const [stage, setStage] = useState<SeniorQueueStage>("ready");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageTabsOverflow, setStageTabsOverflow] = useState(false);
  const [stageTabsAtEnd, setStageTabsAtEnd] = useState(false);
  const stageTabsRef = useRef<HTMLDivElement>(null);
  const requestedPreset = new URLSearchParams(search).get("preset");

  useEffect(() => {
    const element = stageTabsRef.current;
    if (!element) return;

    const updateOverflow = () => {
      const cue = getStageTabsScrollCue({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, scrollLeft: element.scrollLeft });
      setStageTabsOverflow(cue.overflow);
      setStageTabsAtEnd(cue.atEnd);
    };

    updateOverflow();
    element.addEventListener("scroll", updateOverflow, { passive: true });
    window.addEventListener("resize", updateOverflow);

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateOverflow);
    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", updateOverflow);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (requestedPreset !== "senior-review-ready") return;
    dispatchMeridian({ type: "replace_state", state: createMeridianPreset("senior-review-ready") });
    dispatchNorthstar({ type: "replace_state", state: createNorthstarPreset("northstar-senior-review") });
    navigate(pathname, { replace: true });
  }, [dispatchMeridian, dispatchNorthstar, navigate, pathname, requestedPreset]);

  const items = useMemo(() => buildSeniorQueueItems(meridianState, northstarState), [meridianState, northstarState]);
  const counts = useMemo(() => Object.fromEntries(stageTabs.map((tab) => [tab.id, items.filter((item) => item.stage === tab.id).length])) as Record<SeniorQueueStage, number>, [items]);
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => item.stage === stage && (!normalizedQuery || `${item.company} ${item.request} ${item.recommendationTitle} ${item.submittedBy}`.toLowerCase().includes(normalizedQuery)));
  }, [items, query, stage]);
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0] ?? null;

  function selectItem(item: SeniorQueueItem) {
    setSelectedId(item.id);
  }

  function selectItemWithKeyboard(event: ReactKeyboardEvent, item: SeniorQueueItem) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectItem(item);
  }

  return (
    <div className={styles.page}>
      <LearningTarget topicId="senior-queue-overview"><header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Senior credit</span>
          <Text as="h1" variant="pageTitle">Decision reviews</Text>
          <p>Review analyst submissions, resolve the material decision points, and preserve an attributable final outcome.</p>
        </div>
        <div className={styles.headerSummary} aria-label={`${counts.ready} recommendations need review`}>
          <span><Icon name="shield" size="sm" /></span>
          <div><strong>{counts.ready}</strong><small>Need review</small></div>
        </div>
      </header></LearningTarget>

      <LearningTarget topicId="senior-queue-filters"><div className={styles.stageTabsFrame} data-overflow={stageTabsOverflow ? "true" : "false"} data-at-end={stageTabsAtEnd ? "true" : "false"}>
        <div ref={stageTabsRef} className={styles.stageTabs} role="tablist" aria-label="Senior review stage">
          {stageTabs.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={stage === tab.id}
              className={stage === tab.id ? styles.stageTabActive : ""}
              key={tab.id}
              onClick={() => { setStage(tab.id); setSelectedId(null); }}
            >
              {tab.label}<span>{counts[tab.id]}</span>
            </button>
          ))}
        </div>
      </div></LearningTarget>

      <LearningTarget topicId="senior-queue-filters"><div className={styles.toolbar}>
        <SearchField className={styles.search} value={query} onChange={setQuery} placeholder="Search submissions" ariaLabel="Search senior review submissions" />
        <span><Icon name="lock" size="xs" /> Decisions remain human-owned</span>
      </div></LearningTarget>

      <div className={`${styles.workspace} ${selected ? styles.workspaceOpen : ""}`}>
        <section className={styles.queue} aria-label={`${stageTabs.find((tab) => tab.id === stage)?.label} applications`}>
          <div className={styles.queueHeader} aria-hidden="true">
            <span>Company</span><span>Recommendation</span><span>Exposure</span><span>Submitted by</span><span>Status</span>
          </div>
          <div className={styles.queueList} role="list">
            {visibleItems.map((item) => (
              <div
                className={`${styles.queueRow} ${selected?.id === item.id ? styles.queueRowSelected : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected?.id === item.id}
                key={item.id}
                onClick={() => selectItem(item)}
                onKeyDown={(event) => selectItemWithKeyboard(event, item)}
              >
                <span className={styles.companyCell}>
                  <CompanyLogo domain={companyLogoDomains[item.company]} name={item.company} />
                  <span><strong>{item.company}</strong><small>{item.facilityType}</small></span>
                </span>
                <span className={styles.recommendationCell}><strong>{item.recommendationTitle}</strong><small>{item.submittedAt}</small></span>
                <span className={styles.requestCell}>{item.request}</span>
                <span className={styles.ownerCell}><span aria-hidden="true">{initials(item.submittedBy)}</span>{item.submittedBy}</span>
                <span className={styles.statusCell}><StatusPill tone={item.statusTone}>{item.statusLabel}</StatusPill><Icon name="chevronRight" size="sm" /></span>
              </div>
            ))}
          </div>
          {visibleItems.length === 0 && (
            <div className={styles.emptyState}>
              <span><Icon name={query ? "search" : "checkCircle"} /></span>
              <strong>{query ? "No submissions match this search" : "No reviews in this stage"}</strong>
              <p>{query ? "Try a company, analyst, amount, or recommendation." : "Cases move here automatically as analysts submit recommendations and senior decisions are recorded."}</p>
            </div>
          )}
        </section>

        {selected && <LearningTarget topicId="senior-queue-preview"><SeniorReviewRail item={selected} onOpen={() => navigate(selected.route)} onClose={() => setSelectedId(null)} /></LearningTarget>}
      </div>
    </div>
  );
}

function SeniorReviewRail({ item, onOpen, onClose }: { item: SeniorQueueItem; onOpen: () => void; onClose: () => void }) {
  return (
    <aside className={styles.reviewRail} aria-label={`${item.company} senior review preview`}>
      <header className={styles.railHeader}>
        <div className={styles.railIdentity}>
          <CompanyLogo domain={companyLogoDomains[item.company]} name={item.company} size="md" />
          <div><strong>{item.company}</strong><span>{item.facilityType}</span></div>
        </div>
        <button type="button" aria-label="Close senior review preview" onClick={onClose}><Icon name="close" size="sm" /></button>
      </header>

      <div className={styles.facilityObject}>
        <span className={styles.facilityObjectTopline}><Icon name="shield" size="sm" /> Credit decision</span>
        <strong>{item.request}</strong>
        <span>{item.recommendationTitle}</span>
        <div aria-hidden="true"><i /><i /><i /><i /></div>
      </div>

      <div className={styles.railStatus}>
        <StatusPill tone={item.statusTone}>{item.statusLabel}</StatusPill>
        <span>{item.submittedAt}</span>
      </div>

      <section className={styles.questionSection}>
        <span>Decision question</span>
        <p>{item.decisionQuestion}</p>
      </section>

      <section className={styles.handoffSection}>
        <span>Analyst handoff</span>
        <h2>{item.recommendationTitle}</h2>
        <p>{item.recommendationRationale}</p>
        <small><Icon name="user" size="xs" /> Submitted by {item.submittedBy}</small>
      </section>

      <dl className={styles.factGrid}>
        {item.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>

      <section className={styles.attentionSection}>
        <span>Decision focus</span>
        <p>{item.findingSummary}</p>
        {item.conditions.slice(0, 3).map((condition) => <div key={condition}><Icon name="check" size="xs" /><span>{condition}</span></div>)}
      </section>

      <footer className={styles.railFooter}>
        <Button variant="primary" icon={<Icon name="arrowRight" size="xs" />} onClick={onOpen}>{item.stage === "ready" ? "Open senior review" : item.stage === "decided" ? "View decision record" : "View analyst case"}</Button>
        <small><Icon name="lock" size="xs" /> The final decision is attributed to the senior reviewer.</small>
      </footer>
    </aside>
  );
}

export function buildSeniorQueueItems(meridianState: MeridianReviewState, northstarState: NorthstarReviewState): SeniorQueueItem[] {
  const meridian = reviews.find((review) => review.slug === "meridian-foods");
  const northstar = reviews.find((review) => review.slug === "northstar-health");
  const items: SeniorQueueItem[] = [];

  if (meridian) items.push(workflowItem(meridian, meridianState.recommendation, meridianState.seniorDecision, {
    decisionQuestion: "Should Meridian receive an $18M working-capital line under the proposed covenant and monitoring package?",
    findingSummary: "Confirm that renewed customer evidence, margin pressure, and narrower leverage headroom are adequately addressed by the submitted protections.",
    facts: [
      { label: "Findings reviewed", value: `${meridianState.judgments.length} of 3` },
      { label: "Facility", value: "3-year revolver" },
      { label: "Decision owner", value: "Morgan Lee" },
    ],
    route: "/credit-reviews/meridian-foods/senior-decision/review",
  }, meridianState.decisionHistory?.find((decision) => decision.decision === "return_to_analyst"), meridianState.recommendationHistory?.[0]));

  if (northstar) items.push(workflowItem(northstar, northstarState.recommendation, northstarState.seniorDecision, {
    decisionQuestion: "Does the verified 2027 forecast support Northstar's requested revolving line through the downside case?",
    findingSummary: "Confirm that the verified 1.29x downside fixed-charge coverage and reporting package are sufficient for the final decision.",
    facts: [
      { label: "Downside FCCR", value: northstarState.analysisUpdated ? "1.29x" : "Pending" },
      { label: "Policy floor", value: "1.20x" },
      { label: "Decision owner", value: "Morgan Lee" },
    ],
    route: "/credit-reviews/northstar-health/senior-decision/review",
  }, northstarState.decisionHistory?.find((decision) => decision.decision === "return_to_analyst"), northstarState.recommendationHistory?.[0]));

  for (const review of reviews.filter((candidate) => isStandardReview(candidate))) {
    if (!isStandardReview(review)) continue;
    const standardState = readPersistedStandardReviewState(review.slug);
    const workflowReady = standardState.recommendationSubmitted || standardState.recommendation || standardState.reviewedFindingIds.length >= review.details.findings.length;
    if (review.status !== "ready-for-decision" && review.status !== "completed" && !workflowReady) continue;
    const decided = Boolean(standardState.seniorDecision) || review.status === "completed";
    const submitted = standardState.recommendation ?? (review.status === "ready-for-decision" || review.status === "completed" ? {
      decision: review.details.recommendation.title,
      amount: review.request,
      rationale: review.details.recommendation.rationale,
      conditions: review.details.recommendation.conditions,
      author: review.owner,
      createdAt: new Date().toISOString(),
    } : undefined);
    items.push({
      id: review.slug,
      company: review.company,
      request: review.request,
      facilityType: review.facilityType,
      stage: decided ? "decided" : "ready",
      statusLabel: decided ? "Approved with conditions" : "Decision ready",
      statusTone: decided ? "success" : "warning",
      submittedBy: review.owner,
      submittedAt: decided ? "Decided Jul 25" : `Due ${review.due}`,
      recommendationTitle: standardState.seniorDecision ? seniorDecisionLabel(standardState.seniorDecision.decision) : submitted?.decision ?? review.details.recommendation.title,
      recommendationRationale: standardState.seniorDecision?.rationale || submitted?.rationale || review.details.recommendation.rationale,
      conditions: standardState.seniorDecision?.conditions.length ? standardState.seniorDecision.conditions : submitted?.conditions ?? review.details.recommendation.conditions,
      decisionQuestion: review.details.decisionQuestion,
      facts: [
        { label: "Findings", value: `${review.details.findings.length} reviewed` },
        { label: "Term", value: review.details.term },
        { label: "Decision owner", value: "Morgan Lee" },
      ],
      findingSummary: review.details.findings.map((finding) => finding.description).join(" "),
      route: `/credit-reviews/${review.slug}/senior-decision/review`,
    });
  }

  return items;
}

function workflowItem(
  review: CreditReview,
  recommendation: AnalystRecommendationRecord | undefined,
  decision: SeniorDecisionRecord | undefined,
  context: Pick<SeniorQueueItem, "decisionQuestion" | "findingSummary" | "facts" | "route">,
  returnedDecision?: SeniorDecisionRecord,
  priorRecommendation?: AnalystRecommendationRecord,
): SeniorQueueItem {
  const returned = decision?.decision === "return_to_analyst";
  const revisionInProgress = !decision && !recommendation && returnedDecision?.decision === "return_to_analyst";
  const stage: SeniorQueueStage = returned ? "waiting" : decision ? "decided" : recommendation ? "ready" : "waiting";
  const fallbackTitle = stage === "waiting" ? "Recommendation not submitted" : "Proceed with conditions";
  return {
    id: review.slug,
    company: review.company,
    request: review.request,
    facilityType: review.facilityType,
    stage,
    statusLabel: returned ? "Revision requested" : revisionInProgress ? "Revision in progress" : decision ? seniorDecisionLabel(decision.decision) : recommendation ? "Decision ready" : "Awaiting analyst",
    statusTone: returned || revisionInProgress ? "warning" : decision ? decisionTone(decision) : recommendation ? "warning" : "neutral",
    submittedBy: recommendation?.author ?? priorRecommendation?.author ?? review.owner,
    submittedAt: returned ? `Returned ${formatRecordDate(decision.createdAt)}` : revisionInProgress ? `Returned ${formatRecordDate(returnedDecision.createdAt)}` : decision ? `Decided ${formatRecordDate(decision.createdAt)}` : recommendation ? `Submitted ${formatRecordDate(recommendation.createdAt)}` : `Due ${review.due}`,
    recommendationTitle: returned ? "Revision requested" : revisionInProgress ? "Analyst revision in progress" : decision ? seniorDecisionLabel(decision.decision) : recommendation?.decision ?? fallbackTitle,
    recommendationRationale: decision?.rationale || recommendation?.rationale || (revisionInProgress ? returnedDecision.rationale : undefined) || "The analyst workflow is still in progress. Senior credit can monitor the case but cannot make a decision until an attributable recommendation is submitted.",
    conditions: decision?.conditions.length ? decision.conditions : recommendation?.conditions ?? priorRecommendation?.conditions ?? [],
    ...context,
  };
}

function decisionTone(decision: SeniorDecisionRecord): StatusPillTone {
  if (decision.decision === "decline") return "danger";
  if (decision.decision === "return_to_analyst") return "warning";
  return "success";
}

function formatRecordDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

export function getStageTabsScrollCue({ scrollWidth, clientWidth, scrollLeft }: { scrollWidth: number; clientWidth: number; scrollLeft: number }) {
  return {
    overflow: scrollWidth > clientWidth + 1,
    atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
  };
}
