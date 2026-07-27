import { useEffect, useMemo, useRef, useState } from "react";
import { createAppHref, useRouter, type AppPath } from "../../app/router";
import { clearReviewDemoState } from "../credit-reviews/workflow/usePersistentReviewState";
import type { DemoPresetId } from "../credit-reviews/workflow/creditReviewState";
import { Button } from "../../shared/ui/Button/Button";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import { SearchField } from "../../shared/ui/SearchField/SearchField";
import { Tabs } from "../../shared/ui/Tabs/Tabs";
import {
  designOptionAreas,
  designOptions,
  getActiveDesignOption,
  getDesignOption,
  type ActiveDesignOptionArea,
  type DesignOption,
} from "./designOptions";
import styles from "./DesignToolsLauncher.module.css";

type NavigatorMode = "design-screens" | "design-states" | "design-roles" | "design-references";
type CopyStatus = "idle" | "copied" | "failed";

const roleViews: Array<{ id: "analyst" | "senior"; label: string; description: string; route: AppPath }> = [
  {
    id: "analyst",
    label: "Analyst workspace",
    description: "Review evidence, resolve findings, and prepare the recommendation.",
    route: "/credit-reviews",
  },
  {
    id: "senior",
    label: "Senior credit workspace",
    description: "Review submitted recommendations and record the final human decision.",
    route: "/credit-reviews/senior",
  },
];

const demoPresets: Array<{ id: DemoPresetId; label: string; description: string; route: AppPath }> = [
  { id: "meridian-start", label: "Meridian · Start", description: "Two judgment findings and one verification finding.", route: "/credit-reviews/meridian-foods/findings" },
  { id: "meridian-reassessment-ready", label: "Meridian · Analysis ready", description: "Renewal verified; Changed / Unchanged result awaits judgment.", route: "/credit-reviews/meridian-foods/findings/customer-concentration" },
  { id: "meridian-margin-reassessment-ready", label: "Meridian · Margin analysis updated", description: "July actuals added; the material margin conclusion still awaits judgment.", route: "/credit-reviews/meridian-foods/findings/declining-margins" },
  { id: "meridian-recommendation-ready", label: "Meridian · Recommendation ready", description: "All findings complete; compare the analyst recommendation directions.", route: "/credit-reviews/meridian-foods/recommendation" },
  { id: "meridian-escalation-ready", label: "Meridian · Senior attention", description: "Two findings resolved and one explicitly escalated into the recommendation handoff.", route: "/credit-reviews/meridian-foods/recommendation" },
  { id: "northstar-request-sent", label: "Northstar · Request sent", description: "Borrower request persists while awaiting a document.", route: "/credit-reviews/northstar-health" },
  { id: "senior-review-ready", label: "Meridian · Senior decision ready", description: "Alex submitted the recommendation; Morgan owns the final decision.", route: "/credit-reviews/meridian-foods/senior-decision/review" },
];

const statusOrder = { current: 0, candidate: 1, archived: 2 } as const;

function iconForArea(area: ActiveDesignOptionArea): IconName {
  if (area === "design-tools") return "branch";
  if (area === "utility-bar") return "book";
  if (area === "workspace-overview") return "home";
  if (area === "overview" || area === "credit-review-queue") return "layers";
  if (area === "reassessment") return "refresh";
  if (area === "financials") return "chart";
  if (area === "activity") return "history";
  if (area === "recommendation-decision") return "checkCircle";
  if (area === "senior-review-queue") return "clipboard";
  if (area === "senior-decision") return "shield";
  return "document";
}

function optionSearch(option: DesignOption) {
  const params = new URLSearchParams({ design: option.id });
  if (option.preset) params.set("preset", option.preset);
  return `?${params.toString()}`;
}

function statusLabel(option: DesignOption, selected: boolean) {
  if (selected) return "Here";
  if (option.status === "current") return "Current";
  if (option.status === "candidate") return "Option";
  return "Previous";
}

export function DesignToolsLauncher() {
  const [open, setOpen] = useState(false);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [navigatorMode, setNavigatorMode] = useState<NavigatorMode>("design-screens");
  const [focusedArea, setFocusedArea] = useState<ActiveDesignOptionArea | null>(null);
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const { pathname, search, navigate } = useRouter();
  const selectedDesignId = new URLSearchParams(search).get("design");
  const selectedOption = getDesignOption(selectedDesignId);
  const activeOption = getActiveDesignOption(pathname, selectedDesignId);
  const routeArea = activeOption?.area;
  const legacyMode = selectedOption?.area === "design-tools" && selectedOption.renderKey === "design-tools-stacked-accordion";
  const groupedOptions = useMemo(() => designOptionAreas.map((area) => ({
    area,
    label: designOptions.find((option) => option.area === area)?.areaLabel ?? area,
    options: designOptions.filter((option) => option.area === area),
  })), []);

  const productGroups = groupedOptions.filter((group) => group.area !== "product-reference");
  const referenceGroups = groupedOptions.filter((group) => group.area === "product-reference");

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => launcherRef.current?.focus());
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function openDesignSystem() {
    setOpen(false);
    navigate("/design-system");
  }

  function selectOption(option: DesignOption) {
    setOpen(false);
    navigate(option.route, { search: optionSearch(option) });
  }

  function selectPreset(id: DemoPresetId, route: AppPath) {
    setOpen(false);
    navigate(route, { search: `?preset=${id}` });
  }

  function resetDemoState() {
    clearReviewDemoState();
    setOpen(false);
    navigate("/credit-reviews", { replace: true });
  }

  function isSelected(option: DesignOption) {
    return activeOption?.id === option.id;
  }

  function toggleDesignTools() {
    if (open) {
      setOpen(false);
      return;
    }

    const routeGroup = groupedOptions.find((group) => group.area === routeArea);
    setNavigatorMode(routeArea === "product-reference" ? "design-references" : "design-screens");
    setFocusedArea(routeGroup && routeGroup.options.length > 1 ? routeGroup.area : null);
    setQuery("");
    setCopyStatus("idle");
    setOpen(true);
  }

  function changeNavigatorMode(mode: NavigatorMode) {
    setNavigatorMode(mode);
    setFocusedArea(null);
    setQuery("");
    setCopyStatus("idle");
  }

  function focusGroup(area: ActiveDesignOptionArea) {
    setFocusedArea(area);
    setQuery("");
    setCopyStatus("idle");
  }

  async function copyFocusedLink() {
    const group = groupedOptions.find((candidate) => candidate.area === focusedArea);
    const option = group?.options.find(isSelected)
      ?? group?.options.find((candidate) => candidate.status === "current")
      ?? group?.options[0];
    if (!option) return;

    try {
      await window.navigator.clipboard.writeText(`${window.location.origin}${createAppHref(option.route, optionSearch(option))}`);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  function renderLegacyGroup(group: (typeof groupedOptions)[number]) {
    const currentOption = group.options.find((option) => option.status === "current")
      ?? group.options.find((option) => option.status === "candidate")
      ?? group.options[0];
    const isExpanded = expandedArea === group.area;
    const isActiveArea = group.options.some(isSelected);
    const alternatives = group.options.length - 1;
    const sortedOptions = [...group.options].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return (
      <section className={`${styles.screenGroup} ${isActiveArea ? styles.screenGroupActive : ""}`} key={group.area} aria-labelledby={`design-area-${group.area}`}>
        <button
          className={styles.groupToggle}
          type="button"
          aria-expanded={isExpanded}
          aria-current={isActiveArea ? "page" : undefined}
          aria-controls={`design-options-${group.area}`}
          onClick={() => setExpandedArea((current) => current === group.area ? null : group.area)}
        >
          <span className={styles.groupIcon}><Icon name={iconForArea(group.area)} size="xs" /></span>
          <span className={styles.groupSummary}>
            <strong id={`design-area-${group.area}`}>{group.label}</strong>
            <small>{currentOption.name}</small>
          </span>
          <span className={styles.groupMeta}>
            <span>{currentOption.version}</span>
            {isActiveArea
              ? <small className={styles.activeAreaLabel}>Here</small>
              : alternatives > 0 && <small>+{alternatives}</small>}
          </span>
          <Icon className={styles.groupChevron} name="chevronDown" size="sm" />
        </button>

        <div className={styles.optionList} id={`design-options-${group.area}`} hidden={!isExpanded}>
          {sortedOptions.map((option) => {
            const selected = isSelected(option);
            return (
              <button
                className={`${styles.optionButton} ${selected ? styles.optionButtonSelected : ""}`}
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectOption(option)}
              >
                <span className={styles.optionVersion}>{option.version}</span>
                <span className={styles.optionCopy}>
                  <span className={styles.optionTitle}>
                    <strong>{option.name}</strong>
                    <small className={`${styles.optionStatus} ${option.status === "current" ? styles.optionStatusCurrent : ""}`}>
                      {statusLabel(option, selected)}
                    </small>
                  </span>
                  <small>{option.hypothesis}</small>
                </span>
                <span className={`${styles.optionAction} ${selected ? styles.optionActionSelected : ""}`}>
                  <Icon name={selected ? "check" : "arrowRight"} size="xs" />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderLegacyPopover() {
    return (
      <section className={`${styles.popover} ${styles.legacyPopover}`} role="dialog" aria-modal="false" aria-labelledby="design-tools-title">
        <header className={styles.header}>
          <div className={styles.headerLead}>
            <span className={styles.headerMark}><Icon name="branch" size="sm" /></span>
            <div>
              <span className={styles.eyebrow}>Internal workspace</span>
              <h2 id="design-tools-title">Design tools</h2>
            </div>
          </div>
          <span className={`${styles.systemBadge} ${styles.archivedBadge}`}>Archived layout</span>
        </header>

        <div className={styles.introduction}>
          <p>Explore complete screen directions without leaving the live product.</p>
          <div className={styles.summaryStats} role="group" aria-label={`${productGroups.length} production areas and ${designOptions.length} saved directions`}>
            <span><strong>{productGroups.length}</strong> production areas</span>
            <span><strong>{designOptions.length}</strong> saved directions</span>
          </div>
        </div>

        <div className={styles.screenGroups}>
          <div className={styles.groupSection}>
            <span className={styles.sectionLabel}><span>Experience tools</span><small>Workflow controls</small></span>
            <section className={styles.screenGroup} aria-labelledby="design-area-demo-states">
              <button
                className={styles.groupToggle}
                type="button"
                aria-expanded={expandedArea === "demo-states"}
                aria-controls="design-options-demo-states"
                onClick={() => setExpandedArea((current) => current === "demo-states" ? null : "demo-states")}
              >
                <span className={styles.groupIcon}><Icon name="refresh" size="xs" /></span>
                <span className={styles.groupSummary}>
                  <strong id="design-area-demo-states">Demo states</strong>
                  <small>Jump to a saved workflow moment</small>
                </span>
                <span className={styles.groupMeta}><small>{demoPresets.length + 1}</small></span>
                <Icon className={styles.groupChevron} name="chevronDown" size="sm" />
              </button>
              <div className={styles.optionList} id="design-options-demo-states" hidden={expandedArea !== "demo-states"}>
                {demoPresets.map((preset) => (
                  <button className={styles.optionButton} key={preset.id} type="button" onClick={() => selectPreset(preset.id, preset.route)}>
                    <span className={styles.optionVersion}><Icon name="refresh" size="xs" /></span>
                    <span className={styles.optionCopy}><span className={styles.optionTitle}><strong>{preset.label}</strong></span><small>{preset.description}</small></span>
                    <span className={styles.optionAction}><Icon name="arrowRight" size="xs" /></span>
                  </button>
                ))}
                <button className={styles.optionButton} type="button" onClick={resetDemoState}>
                  <span className={styles.optionVersion}><Icon name="refresh" size="xs" /></span>
                  <span className={styles.optionCopy}><span className={styles.optionTitle}><strong>Reset all workflow state</strong></span><small>Clear saved Meridian, Northstar, and standard-case session state.</small></span>
                  <span className={styles.optionAction}><Icon name="arrowRight" size="xs" /></span>
                </button>
              </div>
            </section>
          </div>
          <div className={styles.groupSection}>
            <span className={styles.sectionLabel}><span>Production screens</span><small>Live product</small></span>
            {productGroups.map(renderLegacyGroup)}
          </div>
          <div className={styles.groupSection}>
            <span className={styles.sectionLabel}><span>References</span><small>Pattern library</small></span>
            {referenceGroups.map(renderLegacyGroup)}
          </div>
        </div>

        <footer className={styles.footer}>
          <Button className={styles.openSystemButton} variant="secondary" icon={<Icon name="arrowRight" size="xs" />} onClick={openDesignSystem}>Open design system</Button>
        </footer>
      </section>
    );
  }

  function renderGroupList(groups: typeof groupedOptions) {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleGroups = groups.filter((group) => !normalizedQuery || [
      group.label,
      ...group.options.flatMap((option) => [option.name, option.version, option.hypothesis]),
    ].join(" ").toLowerCase().includes(normalizedQuery));

    if (visibleGroups.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Icon name="search" size="sm" />
          <strong>No matching directions</strong>
          <span>Try a screen name, version, or design idea.</span>
          <Button size="sm" variant="quiet" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      );
    }

    return (
      <ul className={styles.navigatorList}>
        {visibleGroups.map((group) => {
          const currentOption = group.options.find((option) => option.status === "current")
            ?? group.options.find((option) => option.status === "candidate")
            ?? group.options[0];
          const isActiveArea = group.options.some(isSelected);
          const alternatives = group.options.length - 1;
          return (
            <li key={group.area}>
              <button
                className={`${styles.navigatorRow} ${isActiveArea ? styles.navigatorRowActive : ""}`}
                type="button"
                aria-current={isActiveArea ? "page" : undefined}
                onClick={() => focusGroup(group.area)}
              >
                <span className={styles.navigatorIcon}><Icon name={iconForArea(group.area)} size="sm" /></span>
                <span className={styles.navigatorSummary}>
                  <strong>{group.label}</strong>
                  <small>{currentOption.name}</small>
                </span>
                <span className={styles.navigatorMeta}>
                  <span>{currentOption.version}</span>
                  {isActiveArea ? <small>Here</small> : alternatives > 0 ? <small>+{alternatives}</small> : null}
                </span>
                <Icon className={styles.navigatorChevron} name="chevronRight" size="sm" />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderVariantDetail() {
    const group = groupedOptions.find((candidate) => candidate.area === focusedArea);
    if (!group) return null;
    const sortedOptions = [...group.options].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return (
      <section className={styles.variantDetail} aria-labelledby="design-variant-detail-title">
        <header className={styles.variantDetailHeader}>
          <Button size="sm" variant="quiet" iconPosition="start" icon={<Icon name="arrowLeft" size="xs" />} onClick={() => { setFocusedArea(null); setCopyStatus("idle"); }}>
            {navigatorMode === "design-references" ? "All references" : "All screens"}
          </Button>
          <div>
            <h3 id="design-variant-detail-title">{group.label}</h3>
            <p>{group.options.length} saved {group.options.length === 1 ? "direction" : "directions"}. Select one to preview it in the live product.</p>
          </div>
        </header>
        <div className={styles.variantList}>
          {sortedOptions.map((option) => {
            const selected = isSelected(option);
            return (
              <button
                className={`${styles.variantRow} ${selected ? styles.variantRowSelected : ""}`}
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectOption(option)}
              >
                <span className={styles.variantVersion}>{option.version}</span>
                <span className={styles.variantCopy}>
                  <span>
                    <strong>{option.name}</strong>
                    <small className={selected ? styles.variantHere : undefined}>{statusLabel(option, selected)}</small>
                  </span>
                  <p>{option.hypothesis}</p>
                </span>
                <Icon name={selected ? "check" : "arrowRight"} size="xs" />
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderStateList() {
    const normalizedQuery = query.trim().toLowerCase();
    const visiblePresets = demoPresets.filter((preset) => !normalizedQuery || `${preset.label} ${preset.description}`.toLowerCase().includes(normalizedQuery));
    const showReset = !normalizedQuery || "reset all workflow state clear saved meridian northstar session state".includes(normalizedQuery);

    if (visiblePresets.length === 0 && !showReset) {
      return (
        <div className={styles.emptyState}>
          <Icon name="search" size="sm" />
          <strong>No matching workflow states</strong>
          <span>Try a case name or workflow moment.</span>
          <Button size="sm" variant="quiet" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      );
    }

    return (
      <ul className={styles.stateList}>
        {visiblePresets.map((preset) => (
          <li key={preset.id}>
            <button className={styles.stateRow} type="button" onClick={() => selectPreset(preset.id, preset.route)}>
              <span className={styles.stateIcon}><Icon name="refresh" size="xs" /></span>
              <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
              <Icon name="arrowRight" size="xs" />
            </button>
          </li>
        ))}
        {showReset && (
          <li className={styles.resetItem}>
            <button className={`${styles.stateRow} ${styles.resetRow}`} type="button" onClick={resetDemoState}>
              <span className={styles.stateIcon}><Icon name="refresh" size="xs" /></span>
              <span><strong>Reset all workflow state</strong><small>Clear saved Meridian, Northstar, and standard-case session state.</small></span>
              <Icon name="arrowRight" size="xs" />
            </button>
          </li>
        )}
      </ul>
    );
  }

  function renderRoleList() {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleRoles = roleViews.filter((role) => !normalizedQuery || `${role.label} ${role.description}`.toLowerCase().includes(normalizedQuery));
    const seniorRoleRoute = pathname === "/credit-reviews/senior" || pathname.includes("/senior-decision");
    const analystRoleRoute = pathname === "/credit-reviews"
      || pathname === "/"
      || pathname === "/overview"
      || pathname.startsWith("/credit-reviews/") && !seniorRoleRoute;

    if (visibleRoles.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Icon name="search" size="sm" />
          <strong>No matching role views</strong>
          <span>Try analyst or senior.</span>
          <Button size="sm" variant="quiet" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      );
    }

    return (
      <ul className={styles.stateList} aria-label="Role views">
        {visibleRoles.map((role) => {
          const selected = role.id === "senior" ? seniorRoleRoute : analystRoleRoute;
          return (
            <li key={role.id}>
              <button
                className={`${styles.stateRow} ${selected ? styles.stateRowSelected : ""}`}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => {
                  setOpen(false);
                  navigate(role.route);
                }}
              >
                <span className={styles.stateIcon}><Icon name={role.id === "senior" ? "shield" : "user"} size="xs" /></span>
                <span><strong>{role.label}</strong><small>{role.description}</small></span>
                <Icon name={selected ? "check" : "arrowRight"} size="xs" />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderNavigatorPopover() {
    const listGroups = navigatorMode === "design-references" ? referenceGroups : productGroups;
    const searchPlaceholder = navigatorMode === "design-states" ? "Search workflow states" : navigatorMode === "design-roles" ? "Search role views" : navigatorMode === "design-references" ? "Search references" : "Search screens and versions";
    const copyLabel = copyStatus === "copied" ? "Link copied" : copyStatus === "failed" ? "Copy failed" : "Copy link";

    return (
      <section className={`${styles.popover} ${styles.navigatorPopover}`} role="dialog" aria-modal="false" aria-labelledby="design-tools-title">
        <header className={`${styles.header} ${styles.navigatorHeader}`}>
          <div className={styles.headerLead}>
            <span className={styles.headerMark}><Icon name="branch" size="sm" /></span>
            <div>
              <span className={styles.eyebrow}>Internal workspace · {designOptions.length} directions</span>
              <h2 id="design-tools-title">Design tools</h2>
            </div>
          </div>
          <span className={styles.systemBadge}>Salt current</span>
        </header>

        <Tabs<NavigatorMode>
          className={styles.modeTabs}
          ariaLabel="Design tools sections"
          value={navigatorMode}
          onChange={changeNavigatorMode}
          items={[
            { id: "design-screens", label: "Screens", count: productGroups.length },
            { id: "design-states", label: "States", count: demoPresets.length + 1 },
            { id: "design-roles", label: "Roles", count: roleViews.length },
            { id: "design-references", label: "References", count: referenceGroups.length },
          ]}
        />

        {!focusedArea && (
          <div className={styles.navigatorToolbar}>
            <SearchField value={query} onChange={setQuery} placeholder={searchPlaceholder} ariaLabel={searchPlaceholder} className={styles.navigatorSearch} />
          </div>
        )}

        <div
          className={styles.navigatorBody}
          id={`${navigatorMode}-panel`}
          role="tabpanel"
          aria-labelledby={`${navigatorMode}-tab`}
          tabIndex={0}
        >
          {focusedArea
            ? renderVariantDetail()
            : navigatorMode === "design-states"
              ? renderStateList()
              : navigatorMode === "design-roles"
                ? renderRoleList()
                : renderGroupList(listGroups)}
        </div>

        <footer className={`${styles.footer} ${styles.navigatorFooter}`}>
          {focusedArea && (
            <Button size="sm" variant="quiet" iconPosition="start" icon={<Icon name={copyStatus === "copied" ? "check" : "copy"} size="xs" />} onClick={copyFocusedLink}>
              {copyLabel}
            </Button>
          )}
          <Button className={styles.openSystemButton} size="sm" variant="secondary" icon={<Icon name="arrowRight" size="xs" />} onClick={openDesignSystem}>Design system</Button>
        </footer>
      </section>
    );
  }

  return (
    <div className={styles.root} ref={rootRef}>
      {open && (legacyMode ? renderLegacyPopover() : renderNavigatorPopover())}

      <button
        ref={launcherRef}
        className={styles.launcher}
        type="button"
        aria-label={open ? "Close design tools" : "Open design tools"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleDesignTools}
      >
        <Icon name="branch" size="sm" />
        <span>Design tools</span>
      </button>
    </div>
  );
}
