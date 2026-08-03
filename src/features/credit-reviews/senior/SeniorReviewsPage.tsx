import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "../../../app/router";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { DataCell } from "../../../shared/ui/DataCell/DataCell";
import { DesignVariantNotice } from "../../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../../shared/ui/Drawer/Drawer";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { KeyValueGrid } from "../../../shared/ui/KeyValueGrid/KeyValueGrid";
import { SearchField } from "../../../shared/ui/SearchField/SearchField";
import { StatusPill, type StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { Tabs } from "../../../shared/ui/Tabs/Tabs";
import { Text } from "../../../shared/ui/Text/Text";
import { getDesignOption } from "../../design-tools/designOptions";
import { companyLogoDomains } from "../companyLogos";
import { standardReviewSlugs } from "../reviewData";
import {
  createInitialMeridianState,
  createInitialNorthstarState,
  createMeridianPreset,
  createNorthstarPreset,
  meridianReviewReducer,
  northstarReviewReducer,
} from "../workflow/creditReviewState";
import {
  MERIDIAN_STORAGE_KEY,
  NORTHSTAR_STORAGE_KEY,
  usePersistentReviewState,
  useReviewWorkflowRevision,
} from "../workflow/usePersistentReviewState";
import styles from "./SeniorReviewsPage.module.css";
import v2Styles from "./SeniorReviewsPageV2.module.css";
import { LearningModeSurface, LearningTarget } from "../learning/MeridianLearningMode";
import { standardReviewStorageKey } from "../standard/standardReviewState";
import {
  buildSeniorQueueItems,
  getStageTabsScrollCue,
  seniorQueueStageTabs as stageTabs,
  type SeniorQueueItem,
  type SeniorQueueStage,
} from "./seniorQueueModel";

export { buildSeniorQueueItems, getStageTabsScrollCue } from "./seniorQueueModel";

export function SeniorReviewsPage() {
  return <LearningModeSurface scope="senior-queue"><SeniorReviewsPageContent /></LearningModeSurface>;
}

function SeniorReviewsPageContent() {
  const { navigate, pathname, search } = useRouter();
  const [meridianState, dispatchMeridian] = usePersistentReviewState(meridianReviewReducer, createInitialMeridianState(), MERIDIAN_STORAGE_KEY);
  const [northstarState, dispatchNorthstar] = usePersistentReviewState(northstarReviewReducer, createInitialNorthstarState(), NORTHSTAR_STORAGE_KEY);
  const workflowRevision = useReviewWorkflowRevision([MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, ...standardReviewSlugs.map(standardReviewStorageKey)]);
  const searchParams = new URLSearchParams(search);
  const selectedDesign = getDesignOption(searchParams.get("design"));
  const showLegacyV1 = selectedDesign?.renderKey === "senior-review-submission-queue";
  const [stage, setStage] = useState<SeniorQueueStage>("ready");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [legacyPreviewDismissed, setLegacyPreviewDismissed] = useState(false);
  const [stageTabsOverflow, setStageTabsOverflow] = useState(false);
  const [stageTabsAtEnd, setStageTabsAtEnd] = useState(false);
  const stageTabsRef = useRef<HTMLDivElement>(null);
  const requestedPreset = searchParams.get("preset");

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
    const nextSearch = new URLSearchParams(search);
    nextSearch.delete("preset");
    const serializedSearch = nextSearch.toString();
    navigate(pathname, { search: serializedSearch ? `?${serializedSearch}` : "", replace: true });
  }, [dispatchMeridian, dispatchNorthstar, navigate, pathname, requestedPreset, search]);

  useEffect(() => {
    setSelectedId(null);
    setPreviewOpen(false);
    setLegacyPreviewDismissed(false);
  }, [showLegacyV1]);

  const items = useMemo(() => buildSeniorQueueItems(meridianState, northstarState), [meridianState, northstarState, workflowRevision]);
  const counts = useMemo(() => Object.fromEntries(stageTabs.map((tab) => [tab.id, items.filter((item) => item.stage === tab.id).length])) as Record<SeniorQueueStage, number>, [items]);
  const visibleItems = useMemo(() => {
    return items.filter((item) => item.stage === stage && matchesSeniorQueueSearch(item, query));
  }, [items, query, stage]);
  const explicitSelection = visibleItems.find((item) => item.id === selectedId) ?? null;
  const legacySelection = legacyPreviewDismissed ? null : explicitSelection ?? visibleItems[0] ?? null;

  useEffect(() => {
    if (showLegacyV1 || !selectedId || explicitSelection) return;
    setPreviewOpen(false);
    setSelectedId(null);
  }, [explicitSelection, selectedId, showLegacyV1]);

  function selectItem(item: SeniorQueueItem) {
    setSelectedId(item.id);
    setLegacyPreviewDismissed(false);
    setPreviewOpen(true);
  }

  function changeStage(nextStage: SeniorQueueStage) {
    setStage(nextStage);
    setSelectedId(null);
    setPreviewOpen(false);
    setLegacyPreviewDismissed(false);
  }

  function selectItemWithKeyboard(event: ReactKeyboardEvent, item: SeniorQueueItem) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectItem(item);
  }

  if (!showLegacyV1) {
    return (
      <SeniorReviewQueueV2
        stage={stage}
        counts={counts}
        query={query}
        visibleItems={visibleItems}
        selected={explicitSelection}
        previewOpen={previewOpen && Boolean(explicitSelection)}
        onStageChange={changeStage}
        onQueryChange={setQuery}
        onSelect={selectItem}
        onClosePreview={() => setPreviewOpen(false)}
        onPreviewExited={() => setSelectedId(null)}
        onOpenReview={(item) => navigate(item.route)}
      />
    );
  }

  return (
    <div className={styles.page}>
      {selectedDesign && (
        <DesignVariantNotice
          area={selectedDesign.areaLabel}
          variant={`${selectedDesign.version} — ${selectedDesign.name}`}
          onReturn={() => navigate(pathname, { replace: true })}
        />
      )}
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
              onClick={() => changeStage(tab.id)}
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

      <div className={`${styles.workspace} ${legacySelection ? styles.workspaceOpen : ""}`}>
        <section className={styles.queue} aria-label={`${stageTabs.find((tab) => tab.id === stage)?.label} applications`}>
          <div className={styles.queueHeader} aria-hidden="true">
            <span>Company</span><span>Recommendation</span><span>Exposure</span><span>Submitted by</span><span>Status</span>
          </div>
          <div className={styles.queueList} role="list">
            {visibleItems.map((item) => (
              <div
                className={`${styles.queueRow} ${legacySelection?.id === item.id ? styles.queueRowSelected : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={legacySelection?.id === item.id}
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

        {legacySelection && <LearningTarget topicId="senior-queue-preview"><SeniorReviewRail item={legacySelection} onOpen={() => navigate(legacySelection.route)} onClose={() => { setLegacyPreviewDismissed(true); setSelectedId(null); }} /></LearningTarget>}
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

type SeniorReviewQueueV2Props = {
  stage: SeniorQueueStage;
  counts: Record<SeniorQueueStage, number>;
  query: string;
  visibleItems: SeniorQueueItem[];
  selected: SeniorQueueItem | null;
  previewOpen: boolean;
  onStageChange: (stage: SeniorQueueStage) => void;
  onQueryChange: (query: string) => void;
  onSelect: (item: SeniorQueueItem) => void;
  onClosePreview: () => void;
  onPreviewExited: () => void;
  onOpenReview: (item: SeniorQueueItem) => void;
};

function SeniorReviewQueueV2({
  stage,
  counts,
  query,
  visibleItems,
  selected,
  previewOpen,
  onStageChange,
  onQueryChange,
  onSelect,
  onClosePreview,
  onPreviewExited,
  onOpenReview,
}: SeniorReviewQueueV2Props) {
  const stageLabel = stageTabs.find((tab) => tab.id === stage)?.label ?? "Senior reviews";

  return (
    <div className={v2Styles.page}>
      <LearningTarget topicId="senior-queue-overview">
        <header className={v2Styles.pageHeader}>
          <Text as="h1" variant="pageTitle">Senior reviews</Text>
          <p>Submitted recommendations ready for senior decision.</p>
        </header>
      </LearningTarget>

      <LearningTarget topicId="senior-queue-filters">
        <Tabs<SeniorQueueStage>
          className={v2Styles.tabs}
          ariaLabel="Senior review stage"
          value={stage}
          onChange={onStageChange}
          items={stageTabs.map((tab) => ({ ...tab, count: counts[tab.id] }))}
        />
      </LearningTarget>

      <LearningTarget topicId="senior-queue-filters">
        <div className={v2Styles.toolbar}>
          <SearchField
            className={v2Styles.search}
            value={query}
            onChange={onQueryChange}
            placeholder="Search reviews"
            ariaLabel="Search senior reviews"
          />
        </div>
      </LearningTarget>

      <div className={`${v2Styles.workspace} ${selected ? v2Styles.workspaceOpen : ""}`}>
        <section
          className={v2Styles.queue}
          id={`${stage}-panel`}
          role="tabpanel"
          aria-labelledby={`${stage}-tab`}
          aria-label={`${stageLabel} applications`}
        >
          <div className={v2Styles.queueHeader} aria-hidden="true">
            <span>Company</span>
            <span>Recommendation</span>
            <span>Exposure</span>
            <span>Analyst</span>
            <span>Timing</span>
          </div>

          {visibleItems.length > 0 ? (
            <ul className={v2Styles.queueList} aria-label={`${stageLabel} review list`}>
              {visibleItems.map((item) => (
                <li className={v2Styles.queueItem} key={item.id}>
                  <button
                    type="button"
                    className={`${v2Styles.queueRow} ${selected?.id === item.id ? v2Styles.queueRowSelected : ""}`}
                    aria-pressed={selected?.id === item.id}
                    onClick={() => onSelect(item)}
                    >
                      <span className={v2Styles.companyCell}>
                        <CompanyLogo domain={companyLogoDomains[item.company]} name={item.company} />
                        <DataCell className={v2Styles.companyCopy} primary={item.company} />
                      </span>
                      <DataCell className={v2Styles.requestCopy}>
                        <span className={v2Styles.recommendationTag} aria-label={item.recommendationTitle} title={item.recommendationTitle}>
                          <StatusPill tone={compactRecommendationTone(item.recommendationTitle)}>{compactRecommendationLabel(item.recommendationTitle)}</StatusPill>
                        </span>
                        <span className={v2Styles.requestSecondary}>{item.request}</span>
                      </DataCell>
                    <DataCell className={v2Styles.exposureCell} primary={item.request} />
                    <DataCell className={v2Styles.analystCell} primary={item.submittedBy} />
                    <span className={v2Styles.submittedCell}>
                      <span>{compactQueueDate(item.submittedAt)}</span>
                      <Icon name="chevronRight" size="sm" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={v2Styles.emptyState}>
              <span><Icon name={query ? "search" : "checkCircle"} /></span>
              <strong>{query ? "No reviews match this search" : "No reviews in this stage"}</strong>
              <p>{query ? "Try a company, analyst, amount, or recommendation." : "Submitted recommendations will appear here automatically."}</p>
            </div>
          )}
        </section>

        {selected && (
          <LearningTarget topicId="senior-queue-preview">
            <SeniorReviewPreviewV2
              item={selected}
              open={previewOpen}
              onClose={onClosePreview}
              onExited={onPreviewExited}
              onOpen={() => onOpenReview(selected)}
            />
          </LearningTarget>
        )}
      </div>
    </div>
  );
}

function SeniorReviewPreviewV2({
  item,
  open,
  onClose,
  onExited,
  onOpen,
}: {
  item: SeniorQueueItem;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
  onOpen: () => void;
}) {
  const titleId = `senior-preview-${item.id}`;
  const sectionLabel = item.stage === "ready" ? "Analyst recommendation" : item.stage === "waiting" ? "Review status" : "Recorded decision";
  const actionLabel = item.stage === "ready" ? "Review decision" : item.stage === "waiting" ? "View case" : "View decision";

  return (
    <Drawer
      className={v2Styles.previewDrawer}
      layout="responsive"
      open={open}
      onClose={onClose}
      onExited={onExited}
      labelledBy={titleId}
    >
      <DrawerHeader onClose={onClose}>
        <div className={v2Styles.previewIdentity}>
          <CompanyLogo domain={companyLogoDomains[item.company]} name={item.company} size="md" />
          <div>
            <strong id={titleId}>{item.company}</strong>
            <span>{item.request}</span>
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody className={v2Styles.previewBody}>
        <div className={v2Styles.previewStatus}>
          <StatusPill tone={item.statusTone}>{item.statusLabel}</StatusPill>
          <span>{item.submittedAt}</span>
        </div>

        {item.stage === "ready" && (
          <DrawerSection className={v2Styles.decisionSection}>
            <h2 className={v2Styles.sectionLabel}>Decision to make</h2>
            <p>{item.decisionQuestion}</p>
          </DrawerSection>
        )}

        <DrawerSection className={v2Styles.recommendationSection}>
          <span className={v2Styles.sectionLabel}>{sectionLabel}</span>
          <h2>{item.recommendationTitle}</h2>
          <p>{item.recommendationRationale}</p>
          <KeyValueGrid className={v2Styles.previewFacts} columns={2} items={item.facts.slice(0, 2)} />
        </DrawerSection>
      </DrawerBody>

      <DrawerFooter className={v2Styles.previewFooter}>
        <Button variant={item.stage === "ready" ? "primary" : "secondary"} onClick={onOpen}>{actionLabel}</Button>
      </DrawerFooter>
    </Drawer>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

function compactQueueDate(value: string) {
  return value.replace(/^Submitted\s+/, "");
}

export function matchesSeniorQueueSearch(item: SeniorQueueItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [item.company, item.facilityType, item.request, item.recommendationTitle, item.submittedBy]
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

const compactRecommendationPresentations: Record<string, { label: string; tone: StatusPillTone }> = {
  "Approve with conditions": { label: "Conditional", tone: "warning" },
  "Approve with concentration reporting": { label: "Monitoring", tone: "info" },
  "Approve with standard conditions": { label: "Standard", tone: "success" },
  "Proceed with conditions": { label: "Conditional", tone: "warning" },
  "Proceed with standard protections": { label: "Standard", tone: "success" },
  "Analyst revision in progress": { label: "Revision", tone: "warning" },
  "Recommendation not submitted": { label: "Awaiting", tone: "neutral" },
  "Revision requested": { label: "Revision", tone: "warning" },
  "Returned to analyst": { label: "Revision", tone: "warning" },
  "Approved with conditions": { label: "Approved", tone: "success" },
  Approved: { label: "Approved", tone: "success" },
  Declined: { label: "Declined", tone: "danger" },
};

export function compactRecommendationLabel(value: string) {
  return compactRecommendationPresentations[value]?.label ?? value;
}

export function compactRecommendationTone(value: string): StatusPillTone {
  return compactRecommendationPresentations[value]?.tone ?? "neutral";
}
