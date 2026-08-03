import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "../../app/router";
import { getDesignOption } from "../design-tools/designOptions";
import { DataCell } from "../../shared/ui/DataCell/DataCell";
import { Button } from "../../shared/ui/Button/Button";
import { CompanyLogo } from "../../shared/ui/CompanyLogo/CompanyLogo";
import { CaseStatusPill, caseStatusPresentation } from "../../shared/ui/CaseStatusPill/CaseStatusPill";
import { DesignVariantNotice } from "../../shared/ui/DesignVariantNotice/DesignVariantNotice";
import { Icon } from "../../shared/ui/Icon/Icon";
import { FilterChip } from "../../shared/ui/FilterChip/FilterChip";
import { SearchField } from "../../shared/ui/SearchField/SearchField";
import { Text } from "../../shared/ui/Text/Text";
import { CreditReviewDrawer } from "./CreditReviewDrawer";
import { companyLogoDomains, type ReviewCompanyName } from "./companyLogos";
import { applyCreditReviewWorkflowState } from "./creditReviewPresentation";
import {
  getPrimaryReviewSection,
  getStandardReviewPath,
  isStandardReview,
  reviews,
  standardReviewSlugs,
  type CreditReview,
  type ReviewScope,
  type ReviewStatus,
} from "./reviewData";
import styles from "./CreditReviewsPage.module.css";
import { createInitialMeridianState, createInitialNorthstarState } from "./workflow/creditReviewState";
import { MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, readPersistedReviewState, useReviewWorkflowRevision } from "./workflow/usePersistentReviewState";
import { getLearningTargetProps, LearningModeSurface, useLearningMode } from "./learning/MeridianLearningMode";
import { readPersistedStandardReviewState, standardReviewStorageKey } from "./standard/standardReviewState";

type FilterSection = "owner" | "due" | "facility";
type QueueFocus = "analyst-review" | "needs-verification" | "awaiting-decision";

const queueFocusLabels: Record<QueueFocus, string> = {
  "analyst-review": "Analyst review",
  "needs-verification": "Needs verification",
  "awaiting-decision": "Awaiting decision",
};

function matchesQueueFocus(review: CreditReview, focus: QueueFocus | null) {
  if (focus) return review.caseStatus === focus;
  return true;
}

const statusFilters: Array<{ id: ReviewStatus; label: string; count: number }> = [
  { id: "needs-attention", label: "Needs attention", count: 21 },
  { id: "in-review", label: "In review", count: 29 },
  { id: "ready-for-decision", label: "Ready for decision", count: 11 },
  { id: "completed", label: "Completed", count: 7 },
];

const myReviewGroups: Array<{ id: Exclude<ReviewStatus, "completed">; label: string; count: number }> = [
  { id: "needs-attention", label: "Needs my attention", count: 5 },
  { id: "in-review", label: "In progress", count: 4 },
  { id: "ready-for-decision", label: "Awaiting decision", count: 3 },
];

export function CreditReviewsPage() {
  return <LearningModeSurface scope="queue"><CreditReviewsPageContent /></LearningModeSurface>;
}

function CreditReviewsPageContent() {
  const { navigate, search } = useRouter();
  const { enabled } = useLearningMode();
  const searchParams = new URLSearchParams(search);
  const selectedDesign = getDesignOption(searchParams.get("design"));
  const requestedFocus = searchParams.get("focus");
  const queueFocus = requestedFocus && requestedFocus in queueFocusLabels ? requestedFocus as QueueFocus : null;
  const responsiveDrawer = selectedDesign?.renderKey !== "credit-review-overlay-drawer";
  const legacyDrawerContent = selectedDesign?.renderKey === "credit-review-responsive-drawer" || selectedDesign?.renderKey === "credit-review-overlay-drawer";
  const [scope, setScope] = useState<ReviewScope>("mine");
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [owner, setOwner] = useState("all");
  const [due, setDue] = useState("all");
  const [facilityType, setFacilityType] = useState("all");
  const [myQuery, setMyQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSection, setFilterSection] = useState<FilterSection>("owner");
  const [selectedReview, setSelectedReview] = useState<CreditReview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const workflowRevision = useReviewWorkflowRevision([MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY, ...standardReviewSlugs.map(standardReviewStorageKey)]);
  const workflowProjection = useMemo(() => {
    const meridianState = readPersistedReviewState(MERIDIAN_STORAGE_KEY, createInitialMeridianState());
    const northstarState = readPersistedReviewState(NORTHSTAR_STORAGE_KEY, createInitialNorthstarState());
    const standardStates = Object.fromEntries(standardReviewSlugs.map((slug) => [slug, readPersistedStandardReviewState(slug)]));
    return {
      meridianState,
      northstarState,
      reviews: reviews.map((review) => applyCreditReviewWorkflowState(review, meridianState, northstarState, standardStates)),
    };
  }, [workflowRevision]);
  const liveReviews = workflowProjection.reviews;

  useEffect(() => {
    if (!filtersOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) setFiltersOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setFiltersOpen(false);
      window.requestAnimationFrame(() => filterTriggerRef.current?.focus({ preventScroll: true }));
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setSelectedReview(null);
  }, [legacyDrawerContent, responsiveDrawer]);

  const filteredReviews = useMemo(() => liveReviews.filter((review) => {
    return (!status || review.status === status)
      && matchesQueueFocus(review, queueFocus)
      && (owner === "all" || review.owner === owner)
      && (due === "all" || review.dueGroup === due)
      && (facilityType === "all" || review.facilityType === facilityType);
  }), [due, facilityType, liveReviews, owner, queueFocus, status]);

  const filteredMyReviews = useMemo(() => liveReviews.filter((review) => {
    const searchable = `${review.company} ${review.request} ${caseStatusPresentation[review.caseStatus].label}`.toLowerCase();
    return review.owner === "Alex Kim"
      && matchesQueueFocus(review, queueFocus)
      && (!myQuery || searchable.includes(myQuery.toLowerCase()))
      && (due === "all" || review.dueGroup === due)
      && (facilityType === "all" || review.facilityType === facilityType);
  }), [due, facilityType, liveReviews, myQuery, queueFocus]);

  const activeFilterCount = [owner, due, facilityType].filter((value) => value !== "all").length;
  const activeFilterSummary = [
    owner !== "all" ? owner : null,
    due === "urgent" ? "Today or tomorrow" : due === "this-week" ? "This week" : null,
    facilityType !== "all" ? facilityType : null,
  ].filter(Boolean).join(" · ");
  const myActiveFilterCount = [due, facilityType].filter((value) => value !== "all").length;
  const selectScope = (nextScope: ReviewScope) => {
    setScope(nextScope);
    setFiltersOpen(false);
    setDrawerOpen(false);
    setSelectedReview(null);
  };

  const openReview = (review: CreditReview) => {
    setFiltersOpen(false);
    setSelectedReview(review);
    setDrawerOpen(true);
  };

  const closeReview = () => {
    setDrawerOpen(false);
    if (!responsiveDrawer) setSelectedReview(null);
  };

  const activateReviewWithKeyboard = (event: ReactKeyboardEvent, review: CreditReview) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openReview(review);
  };

  const openFinding = (findingId: string) => {
    if (!selectedReview) return;
    if (selectedReview.company === "Meridian Foods") {
      if (findingId === "customer-concentration") navigate("/credit-reviews/meridian-foods/findings/customer-concentration");
      if (findingId === "declining-margins") navigate("/credit-reviews/meridian-foods/findings/declining-margins");
      if (findingId === "increasing-leverage") navigate("/credit-reviews/meridian-foods/findings/increasing-leverage");
      return;
    }
    if (isStandardReview(selectedReview)) {
      navigate(getStandardReviewPath(selectedReview.slug, "findings"), { search: `?finding=${encodeURIComponent(findingId)}` });
    }
  };

  const openFullReview = () => {
    if (!selectedReview) return;
    if (selectedReview.company === "Meridian Foods") {
      navigate("/credit-reviews/meridian-foods/findings");
      return;
    }
    if (selectedReview.company === "Northstar Health") {
      navigate("/credit-reviews/northstar-health");
      return;
    }
    if (isStandardReview(selectedReview)) {
      navigate(getStandardReviewPath(
        selectedReview.slug,
        selectedReview.aiReviewState === "review-complete" ? undefined : getPrimaryReviewSection(selectedReview.aiReviewState),
      ));
    }
  };

  return (
    <div className={styles.page}>
      {selectedDesign?.area === "credit-review-queue" && selectedDesign.status !== "current" && (
        <DesignVariantNotice
          area={selectedDesign.areaLabel}
          variant={`${selectedDesign.version} — ${selectedDesign.name}`}
          onReturn={() => navigate("/credit-reviews", { replace: true })}
        />
      )}
      <header className={styles.pageHeader} {...getLearningTargetProps(enabled, "queue-overview")}>
        <Text as="h1" variant="pageTitle">Credit Reviews</Text>
      </header>

      <div className={styles.scopeTabs} role="tablist" aria-label="Review scope">
        <button type="button" role="tab" id="my-reviews-tab" aria-controls="my-reviews-panel" aria-selected={scope === "mine"} className={scope === "mine" ? styles.scopeActive : ""} onClick={() => selectScope("mine")}>My reviews <span>12</span></button>
        <button type="button" role="tab" id="all-reviews-tab" aria-controls="all-reviews-panel" aria-selected={scope === "all"} className={scope === "all" ? styles.scopeActive : ""} onClick={() => selectScope("all")}>All reviews <span>68</span></button>
      </div>

      <div className={`${styles.reviewLayout} ${responsiveDrawer && selectedReview ? styles.reviewLayoutOpen : ""}`}>
        <div className={styles.reviewQueue}>
          {scope === "mine" ? (
            <div className={styles.myReviewsPanel} role="tabpanel" id="my-reviews-panel" aria-labelledby="my-reviews-tab">
          <div className={styles.myQueueToolbar} ref={filterMenuRef} {...getLearningTargetProps(enabled, "queue-filters")}>
            <SearchField className={styles.mySearchField} value={myQuery} onChange={setMyQuery} placeholder="Search reviews" ariaLabel="Search my reviews" />
            <div className={styles.myQueueToolbarActions}>
              {queueFocus && <FilterChip pressed onClick={() => navigate("/credit-reviews", { replace: true })}>{queueFocusLabels[queueFocus]} ×</FilterChip>}
              <Button ref={filterTriggerRef} size="sm" variant="secondary" icon={<Icon name="filter" size="sm" />} aria-expanded={filtersOpen} aria-haspopup="menu" onClick={() => { if (filterSection === "owner") setFilterSection("due"); setFiltersOpen((current) => !current); }}>Filter{myActiveFilterCount > 0 ? ` (${myActiveFilterCount})` : ""}</Button>
            </div>
            {filtersOpen && (
              <div className={`${styles.filterPopover} ${styles.myFilterPopover}`} role="menu" aria-label="My review filters">
                <div className={styles.filterSections} role="tablist" aria-label="Filter categories">
                  <FilterSectionButton id="due" label="Due date" icon="calendar" active={filterSection === "due"} onClick={setFilterSection} />
                  <FilterSectionButton id="facility" label="Facility type" icon="building" active={filterSection === "facility"} onClick={setFilterSection} />
                </div>
                <div className={styles.filterPanel} role="tabpanel" aria-label={filterSection === "due" ? "Due date" : "Facility type"}>
                  {filterSection === "due" && <FilterOptions title="Show reviews due" value={due} onChange={setDue} options={[{ value: "all", label: "Any time" }, { value: "urgent", label: "Today or tomorrow" }, { value: "this-week", label: "This week" }]} />}
                  {filterSection === "facility" && <FilterOptions title="Show facility type" value={facilityType} onChange={setFacilityType} options={[{ value: "all", label: "All facility types" }, { value: "Revolving line", label: "Revolving line" }, { value: "Term loan", label: "Term loan" }]} />}
                  <button type="button" className={styles.clearFilters} disabled={myActiveFilterCount === 0} onClick={() => { setDue("all"); setFacilityType("all"); }}>Clear all filters</button>
                </div>
              </div>
            )}
          </div>

          {filteredMyReviews.length > 0 ? myReviewGroups.map((group) => {
            const groupReviews = filteredMyReviews.filter((review) => review.status === group.id);
            if (groupReviews.length === 0) return null;
            return (
              <section className={styles.reviewGroup} key={group.id} aria-labelledby={`${group.id}-heading`}>
                <div className={styles.reviewGroupHeader}>
                  <Text as="h2" variant="sectionTitle" id={`${group.id}-heading`}>{group.label}</Text>
                  <span aria-label={`${groupReviews.length} ${groupReviews.length === 1 ? "review" : "reviews"}`}>{groupReviews.length}</span>
                </div>
                <div className={styles.myQueueHeader} aria-hidden="true"><span>Company</span><span>Request</span><span>Review status</span><span>Owner</span><span>Due</span></div>
                <div className={styles.myReviewList} role="list">
                  {groupReviews.map((review) => (
                    <div role="listitem" key={review.company}>
                      <div
                        className={`${styles.myReviewRow} ${selectedReview?.company === review.company ? styles.reviewRowSelected : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${review.company} credit review preview`}
                        aria-pressed={selectedReview?.company === review.company}
                        onClick={() => openReview(review)}
                        onKeyDown={(event) => activateReviewWithKeyboard(event, review)}
                      >
                        <ReviewCompanyIdentity review={review} />
                        <DataCell className={styles.requestCell} primary={review.request} />
                        <DataCell className={styles.statusCell}><CaseStatusPill status={review.caseStatus} /></DataCell>
                        <DataCell className={styles.ownerReviewCell}><span className={styles.ownerCell}><span aria-hidden="true">{review.owner.split(" ").map((part) => part[0]).join("")}</span>{review.owner}</span></DataCell>
                        <DataCell align="end" className={styles.dueCell}><span className={`${styles.dueContent} ${review.dueGroup === "urgent" ? styles.dueUrgent : ""}`}>{review.due}<Icon name="chevronRight" size="sm" /></span></DataCell>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }) : <div className={styles.emptyState}><span><Icon name="search" /></span><strong>No reviews found</strong><p>Adjust your search or filters to return to your review queue.</p></div>}
            </div>
          ) : (
          <div className={styles.allReviewsPanel} role="tabpanel" id="all-reviews-panel" aria-labelledby="all-reviews-tab" {...getLearningTargetProps(enabled, "queue-filters")}>
          <div className={styles.statusBar} aria-label="Review status filters">
            {queueFocus && <FilterChip pressed onClick={() => navigate("/credit-reviews", { replace: true })}>{queueFocusLabels[queueFocus]} ×</FilterChip>}
            <FilterChip count={68} pressed={status === null} onClick={() => setStatus(null)}>All</FilterChip>
            {statusFilters.map((filter) => (
              <FilterChip key={filter.id} count={filter.count} pressed={status === filter.id} onClick={() => setStatus((current) => current === filter.id ? null : filter.id)}>{filter.label}</FilterChip>
            ))}
          </div>

          <div className={styles.filterBar} aria-label="Review filters" ref={filterMenuRef}>
            <button ref={filterTriggerRef} type="button" className={`${styles.addFilterButton} ${filtersOpen ? styles.addFilterButtonOpen : ""}`} aria-expanded={filtersOpen} aria-haspopup="menu" onClick={() => setFiltersOpen((current) => !current)}>
              <Icon name="filter" size="sm" />
              Add filter
            </button>
            <div className={styles.filterSummary} aria-live="polite">
              {activeFilterCount === 0 ? "No filters applied" : <><span>{activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} applied</span><span className={styles.filterSummaryDetail}>· {activeFilterSummary}</span></>}
            </div>
            {activeFilterCount > 0 && <button type="button" className={styles.clearSummary} onClick={() => { setOwner("all"); setDue("all"); setFacilityType("all"); }}>Clear</button>}

            {filtersOpen && (
              <div className={styles.filterPopover} role="menu" aria-label="Credit review filters">
                <div className={styles.filterSections} role="tablist" aria-label="Filter categories">
                  <FilterSectionButton id="owner" label="Owner" icon="user" active={filterSection === "owner"} onClick={setFilterSection} />
                  <FilterSectionButton id="due" label="Due date" icon="calendar" active={filterSection === "due"} onClick={setFilterSection} />
                  <FilterSectionButton id="facility" label="Facility type" icon="building" active={filterSection === "facility"} onClick={setFilterSection} />
                </div>
                <div className={styles.filterPanel} role="tabpanel" aria-label={filterSection === "owner" ? "Owner" : filterSection === "due" ? "Due date" : "Facility type"}>
                  {filterSection === "owner" && <FilterOptions title="Show reviews owned by" value={owner} onChange={setOwner} options={[{ value: "all", label: "All owners" }, { value: "Alex Kim", label: "Alex Kim" }, { value: "Jordan Lee", label: "Jordan Lee" }]} />}
                  {filterSection === "due" && <FilterOptions title="Show reviews due" value={due} onChange={setDue} options={[{ value: "all", label: "Any time" }, { value: "urgent", label: "Today or tomorrow" }, { value: "this-week", label: "This week" }]} />}
                  {filterSection === "facility" && <FilterOptions title="Show facility type" value={facilityType} onChange={setFacilityType} options={[{ value: "all", label: "All facility types" }, { value: "Revolving line", label: "Revolving line" }, { value: "Term loan", label: "Term loan" }]} />}
                  <button type="button" className={styles.clearFilters} disabled={activeFilterCount === 0} onClick={() => { setOwner("all"); setDue("all"); setFacilityType("all"); }}>Clear all filters</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.tableScroller}>
            <table className={styles.reviewTable}>
              <thead><tr><th>Company</th><th>Request</th><th>Review status</th><th>Owner</th><th>Due</th></tr></thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr
                    key={review.company}
                    className={selectedReview?.company === review.company ? styles.reviewRowSelected : ""}
                    tabIndex={0}
                    aria-label={`Open ${review.company} credit review preview`}
                    aria-selected={selectedReview?.company === review.company}
                    onClick={() => openReview(review)}
                    onKeyDown={(event) => activateReviewWithKeyboard(event, review)}
                  >
                    <td><ReviewCompanyIdentity review={review} /></td>
                    <td><DataCell primary={review.request} /></td>
                    <td><DataCell><CaseStatusPill status={review.caseStatus} /></DataCell></td>
                    <td><DataCell><span className={styles.ownerCell}><span aria-hidden="true">{review.owner.split(" ").map((part) => part[0]).join("")}</span>{review.owner}</span></DataCell></td>
                    <td><DataCell align="end"><span className={review.dueGroup === "urgent" ? styles.dueUrgent : ""}>{review.due}</span></DataCell></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReviews.length === 0 && <div className={styles.emptyState}><span><Icon name="filter" /></span><strong>No reviews match these filters</strong><p>Adjust the status or filters to return to the review queue.</p></div>}
          </div>
            </div>
          )}
        </div>

        {responsiveDrawer && selectedReview && (
          <div className={styles.drawerRail} {...getLearningTargetProps(enabled, "queue-preview")}><CreditReviewDrawer
            review={selectedReview}
            open={drawerOpen}
            layout="responsive"
            presentation={legacyDrawerContent ? "legacy" : "outcome"}
            meridianState={workflowProjection.meridianState}
            onClose={closeReview}
            onExited={() => setSelectedReview(null)}
            onOpenFinding={openFinding}
            onOpenFullReview={openFullReview}
          /></div>
        )}
      </div>

      {!responsiveDrawer && selectedReview && (
          <div {...getLearningTargetProps(enabled, "queue-preview")}><CreditReviewDrawer
            review={selectedReview}
            open={drawerOpen}
            presentation="legacy"
            meridianState={workflowProjection.meridianState}
            onClose={closeReview}
            onOpenFinding={openFinding}
            onOpenFullReview={openFullReview}
          /></div>
        )}
    </div>
  );
}

function ReviewCompanyIdentity({ review }: { review: Pick<CreditReview, "company"> }) {
  return (
    <div className={styles.companyIdentity}>
      <CompanyLogo domain={companyLogoDomains[review.company]} name={review.company} />
      <DataCell primary={review.company} />
    </div>
  );
}

function FilterSectionButton({ id, label, icon, active, onClick }: { id: FilterSection; label: string; icon: "user" | "calendar" | "building"; active: boolean; onClick: (id: FilterSection) => void }) {
  return (
    <button type="button" role="tab" aria-selected={active} className={active ? styles.filterSectionActive : ""} onClick={() => onClick(id)}>
      <Icon name={icon} size="sm" />
      <span>{label}</span>
      <Icon name="chevronRight" size="sm" />
    </button>
  );
}

function FilterOptions({ title, value, options, onChange }: { title: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <fieldset className={styles.filterOptions}>
      <legend>{title}</legend>
      {options.map((option) => (
        <label key={option.value}>
          <input type="radio" name={title} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
