import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { FilterChip } from "../../../shared/ui/FilterChip/FilterChip";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { SearchField } from "../../../shared/ui/SearchField/SearchField";
import { SectionHeader } from "../../../shared/ui/SectionHeader/SectionHeader";
import { SourceDocumentPreview, SourceReviewActions, SourceReviewDetail } from "./SourceReviewDetail";
import { getSourceReviewPresentation } from "./sourceReviewData";
import { isSourceReviewReady, sources, type FindingId, type SourceRecord, type SourceReviewState } from "./meridianData";
import { getCreditSourceIcon } from "../creditReviewPresentation";
import { companyLogoDomains } from "../companyLogos";
import { getLearningTargetProps } from "../learning/MeridianLearningMode";
import styles from "./SourcesTab.module.css";

type SourcesTabProps = {
  renewalLinked: boolean;
  onLinkRenewal: () => void;
  selectedId: string | null;
  returnFindingId: FindingId | null;
  resumeEvidenceStage?: "evidence" | "review" | null;
  reviewStates: Record<string, SourceReviewState>;
  onReviewStateChange: (id: string, state: SourceReviewState) => void;
  onSelectSource: (id: string) => void;
  onCloseSource: () => void;
  learningMode?: boolean;
  learningControl?: ReactNode;
};

type SourceScope = "all" | "attention" | "ready";

export function SourcesTab({ renewalLinked, onLinkRenewal, selectedId, returnFindingId, resumeEvidenceStage = null, reviewStates, onReviewStateChange, onSelectSource, onCloseSource, learningMode = false, learningControl }: SourcesTabProps) {
  const learn = (topicId: "source-review-story") => getLearningTargetProps(learningMode, topicId);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SourceScope>("all");
  const [sourceBrowserOpen, setSourceBrowserOpen] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const visibleSources = useMemo(() => sources.filter((source) => `${source.name} ${source.type} ${source.summary}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const attentionSources = visibleSources.filter((source) => !isSourceReviewReady(source, reviewStates[source.id]));
  const currentSources = visibleSources.filter((source) => isSourceReviewReady(source, reviewStates[source.id]));
  const unresolvedCount = sources.filter((source) => !isSourceReviewReady(source, reviewStates[source.id])).length;
  const selected = sources.find((source) => source.id === selectedId) ?? sources[0];
  const selectedIndex = sources.findIndex((source) => source.id === selected.id);
  const contextualInspection = Boolean(returnFindingId);

  if (!selectedId) {
    return (
      <SourceIndex
        query={query}
        scope={scope}
        reviewStates={reviewStates}
        renewalLinked={renewalLinked}
        unresolvedCount={unresolvedCount}
        visibleSources={visibleSources}
        onQueryChange={setQuery}
        onScopeChange={setScope}
        onSelectSource={onSelectSource}
        learningMode={learningMode}
      />
    );
  }

  function selectSource(source: SourceRecord) {
    onSelectSource(source.id);
    setSourceBrowserOpen(false);
  }

  function moveSource(offset: number) {
    onSelectSource(sources[(selectedIndex + offset + sources.length) % sources.length].id);
  }

  function toggleFlag() {
    onReviewStateChange(selected.id, reviewStates[selected.id] === "flagged" ? "pending" : "flagged");
  }

  function completeReview() {
    onReviewStateChange(selected.id, "verified");
    if (selected.id === "customer-a-renewal" && !renewalLinked) onLinkRenewal();
  }

  function handleRailKeyDown(event: KeyboardEvent<HTMLButtonElement>, source: SourceRecord) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = visibleSources.findIndex((item) => item.id === source.id);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? visibleSources.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + visibleSources.length) % visibleSources.length;
    rowRefs.current.get(visibleSources[nextIndex]?.id)?.focus();
  }

  return (
    <div className={styles.workspace}>
      <section className={styles.workflowPane} aria-label="Evidence review workflow">
        <header className={styles.focusedHeader} {...learn("source-review-story")}>
          <div className={styles.productIdentity}>
            <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" />
            <span><strong>Meridian Foods</strong><small>{contextualInspection ? "Credit review · Document inspection" : "Credit review · Evidence"}</small></span>
          </div>
          <div className={styles.focusedHeaderActions}>
            {learningControl}
            <button type="button" className={styles.closeAction} onClick={onCloseSource} aria-label={returnFindingId ? "Close evidence and return to finding" : "Close evidence review"}>
              <Icon name="close" size="md" />
            </button>
          </div>
        </header>

        {sourceBrowserOpen ? (
          <div className={styles.sourceBrowser}>
            <header className={styles.sourceBrowserHeader}>
              <Button className={styles.backToReview} variant="quiet" size="sm" iconPosition="start" icon={<Icon name="arrowLeft" size="sm" />} onClick={() => setSourceBrowserOpen(false)}>Back to review</Button>
              <div><h1>Review sources</h1><p>{unresolvedCount} require review · {sources.length} sources in this credit file</p></div>
            </header>
            <div className={styles.sourceSearchFrame}>
              <SearchField className={styles.sourceSearch} value={query} onChange={setQuery} placeholder="Search sources" ariaLabel="Search review sources" />
            </div>
            <div className={styles.sourceBrowserScroll}>
              <SourceGroup label="Needs review" sources={attentionSources} selectedId={selected.id} reviewStates={reviewStates} renewalLinked={renewalLinked} rowRefs={rowRefs} onSelect={selectSource} onKeyDown={handleRailKeyDown} />
              <SourceGroup label="Ready for decision" sources={currentSources} selectedId={selected.id} reviewStates={reviewStates} renewalLinked={renewalLinked} rowRefs={rowRefs} onSelect={selectSource} onKeyDown={handleRailKeyDown} />
              {visibleSources.length === 0 && <div className={styles.empty}><Icon name="search" size="sm" /><strong>No sources found</strong><span>Try another name or source type.</span></div>}
            </div>
          </div>
        ) : (
          <div className={styles.reviewWorkflow}>
            <div className={styles.workflowScroll}>
              <SourceReviewDetail
                source={selected}
                reviewState={reviewStates[selected.id] ?? "pending"}
                renewalLinked={renewalLinked}
                sourceIndex={selectedIndex}
                sourceCount={sources.length}
                unresolvedCount={unresolvedCount}
                contextFindingId={returnFindingId}
                resumeEvidenceStage={resumeEvidenceStage}
                onBrowseSources={() => setSourceBrowserOpen(true)}
                onSelectSource={onSelectSource}
                onPrevious={() => moveSource(-1)}
                onNext={() => moveSource(1)}
                learningMode={learningMode}
              />
            </div>
            <SourceReviewActions
              source={selected}
              reviewState={reviewStates[selected.id] ?? "pending"}
              renewalLinked={renewalLinked}
              contextFindingId={returnFindingId}
              resumeEvidenceStage={resumeEvidenceStage}
              onFlag={toggleFlag}
              onComplete={completeReview}
              onReturn={onCloseSource}
              learningMode={learningMode}
            />
          </div>
        )}
      </section>

      <SourceDocumentPreview
        key={selected.id}
        source={selected}
        sourceIndex={selectedIndex}
        sourceCount={sources.length}
        onPrevious={() => moveSource(-1)}
        onNext={() => moveSource(1)}
        learningMode={learningMode}
      />
    </div>
  );
}

function SourceIndex({
  query,
  scope,
  reviewStates,
  renewalLinked,
  unresolvedCount,
  visibleSources,
  onQueryChange,
  onScopeChange,
  onSelectSource,
  learningMode,
}: {
  query: string;
  scope: SourceScope;
  reviewStates: Record<string, SourceReviewState>;
  renewalLinked: boolean;
  unresolvedCount: number;
  visibleSources: SourceRecord[];
  onQueryChange: (value: string) => void;
  onScopeChange: (scope: SourceScope) => void;
  onSelectSource: (id: string) => void;
  learningMode: boolean;
}) {
  const learn = (topicId: "sources-story" | "sources-readiness" | "sources-ledger") => getLearningTargetProps(learningMode, topicId);
  const readyCount = sources.length - unresolvedCount;
  const listedSources = visibleSources.filter((source) => {
    if (scope === "attention") return !isSourceReviewReady(source, reviewStates[source.id]);
    if (scope === "ready") return isSourceReviewReady(source, reviewStates[source.id]);
    return true;
  });

  return (
    <section className={styles.sourceIndex} aria-labelledby="source-package-title">
      <div {...learn("sources-story")}><SectionHeader
        headingId="source-package-title"
        title="Source package"
        description={`${sources.length} documents supporting this credit review.`}
      /></div>

      <div className={styles.indexToolbar} {...learn("sources-readiness")}>
        <div className={styles.indexScopes} aria-label="Filter sources by review state">
          <FilterChip pressed={scope === "all"} count={sources.length} onClick={() => onScopeChange("all")}>All</FilterChip>
          <FilterChip pressed={scope === "attention"} count={unresolvedCount} onClick={() => onScopeChange("attention")}>Needs review</FilterChip>
          <FilterChip pressed={scope === "ready"} count={readyCount} onClick={() => onScopeChange("ready")}>Ready</FilterChip>
        </div>
        <SearchField className={styles.indexSearch} value={query} onChange={onQueryChange} placeholder="Search sources" ariaLabel="Search all sources" />
      </div>

      <div className={styles.indexLedger} role="table" aria-label="Credit review sources" {...learn("sources-ledger")}>
        <div className={styles.indexLedgerHeader} role="row">
          <span role="columnheader">Source</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">As of</span>
          <span role="columnheader">Used in</span>
          <span role="columnheader">Review state</span>
          <span aria-hidden="true" />
        </div>

        <div role="rowgroup">
          {listedSources.map((source) => {
            const presentation = getSourceReviewPresentation(source, reviewStates[source.id], renewalLinked);
            return (
              <button type="button" role="row" className={styles.indexRow} key={source.id} aria-label={`${source.name}, ${source.format}, ${source.type}, ${presentation.label}`} onClick={() => onSelectSource(source.id)}>
                <span className={styles.indexDocument} role="cell">
                  <IconTile size="sm"><Icon name={getCreditSourceIcon(source)} size="sm" /></IconTile>
                  <span><strong>{source.name}</strong><small>Last checked {source.reviewed}</small></span>
                </span>
                <span className={styles.indexType} role="cell">{source.type}</span>
                <span className={styles.indexDate} role="cell">{source.asOf}</span>
                <span className={styles.indexUsage} role="cell">{source.usedIn.length === 0 ? "Not linked" : `${source.usedIn.length} finding${source.usedIn.length === 1 ? "" : "s"}`}</span>
                <span className={styles.sourceState} role="cell" data-tone={presentation.tone}><i aria-hidden="true" />{presentation.label}</span>
                <Icon name="chevronRight" size="sm" />
              </button>
            );
          })}
        </div>

        {listedSources.length === 0 && <div className={styles.empty}><Icon name="search" size="sm" /><strong>No sources found</strong><span>Try another name, type, or review state.</span></div>}
      </div>
    </section>
  );
}

function SourceGroup({ label, sources: groupSources, selectedId, reviewStates, renewalLinked, rowRefs, onSelect, onKeyDown }: {
  label: string;
  sources: SourceRecord[];
  selectedId: string;
  reviewStates: Record<string, SourceReviewState>;
  renewalLinked: boolean;
  rowRefs: RefObject<Map<string, HTMLButtonElement>>;
  onSelect: (source: SourceRecord) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, source: SourceRecord) => void;
}) {
  if (groupSources.length === 0) return null;
  return (
    <section className={styles.sourceGroup} aria-labelledby={`source-group-${label.replaceAll(" ", "-").toLowerCase()}`}>
      <header><h2 id={`source-group-${label.replaceAll(" ", "-").toLowerCase()}`}>{label}</h2><span>{groupSources.length}</span></header>
      <div className={styles.sourceList}>
        {groupSources.map((source) => {
          const presentation = getSourceReviewPresentation(source, reviewStates[source.id], renewalLinked);
          return (
            <button
              ref={(node) => { if (node) rowRefs.current?.set(source.id, node); else rowRefs.current?.delete(source.id); }}
              type="button"
              key={source.id}
              className={styles.sourceRow}
              aria-current={selectedId === source.id ? "true" : undefined}
              onClick={() => onSelect(source)}
              onKeyDown={(event) => onKeyDown(event, source)}
            >
              <IconTile size="sm"><Icon name={getCreditSourceIcon(source)} size="sm" /></IconTile>
              <span className={styles.sourceCopy}><strong>{source.name}</strong><small>{source.type} · {source.asOf}</small></span>
              <span className={styles.sourceState} data-tone={presentation.tone}><i aria-hidden="true" />{presentation.label}</span>
              <Icon name="chevronRight" size="sm" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
