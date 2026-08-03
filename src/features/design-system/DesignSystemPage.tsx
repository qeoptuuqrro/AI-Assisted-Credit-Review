import { Children, isValidElement, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { companyLogoDomains } from "../credit-reviews/companyLogos";
import { ActivityLedger } from "../../shared/ui/ActivityLedger/ActivityLedger";
import { Button } from "../../shared/ui/Button/Button";
import { CaseStatusPill } from "../../shared/ui/CaseStatusPill/CaseStatusPill";
import { CompanyLogo } from "../../shared/ui/CompanyLogo/CompanyLogo";
import { DataCell } from "../../shared/ui/DataCell/DataCell";
import { DocumentRow } from "../../shared/ui/DocumentRow/DocumentRow";
import { DocumentViewer } from "../../shared/ui/DocumentViewer/DocumentViewer";
import { Dialog } from "../../shared/ui/Dialog/Dialog";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../shared/ui/Drawer/Drawer";
import { FileDropzone } from "../../shared/ui/FileDropzone/FileDropzone";
import { FilterChip } from "../../shared/ui/FilterChip/FilterChip";
import { Icon, type IconName } from "../../shared/ui/Icon/Icon";
import { IconTile } from "../../shared/ui/IconTile/IconTile";
import { KeyValueGrid } from "../../shared/ui/KeyValueGrid/KeyValueGrid";
import { MetricCard } from "../../shared/ui/MetricCard/MetricCard";
import { Notice } from "../../shared/ui/Notice/Notice";
import { ObjectHeader } from "../../shared/ui/ObjectHeader/ObjectHeader";
import { Panel } from "../../shared/ui/Panel/Panel";
import { Popover } from "../../shared/ui/Popover/Popover";
import { ScenarioComparison } from "../../shared/ui/ScenarioComparison/ScenarioComparison";
import { SearchField } from "../../shared/ui/SearchField/SearchField";
import { SelectMenu, type SelectMenuOption } from "../../shared/ui/SelectMenu/SelectMenu";
import { SectionHeader } from "../../shared/ui/SectionHeader/SectionHeader";
import { StatusPill } from "../../shared/ui/StatusPill/StatusPill";
import { Tabs } from "../../shared/ui/Tabs/Tabs";
import { Text } from "../../shared/ui/Text/Text";
import { Timeline } from "../../shared/ui/Timeline/Timeline";
import { Toast } from "../../shared/ui/Toast/Toast";
import { WorkflowSteps } from "../../shared/ui/WorkflowSteps/WorkflowSteps";
import { AINativeView } from "./AINativeView";
import styles from "./DesignSystemPage.module.css";

type SystemSection = "foundations" | "components" | "patterns" | "templates" | "ai-native";
type ComponentStatus = "Ready" | "In progress" | "Planned";
type WorkspaceMode = "preview" | "inspect";
type DialogExampleSize = "sm" | "md" | "lg";
type InspectableProperty = "height" | "iconSize" | "padding" | "gap" | "borderRadius" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "color" | "background" | "border" | "opacity";
type InspectableTokenMap = Partial<Record<InspectableProperty, string>>;

type SpecimenBoardProps = {
  title: string;
  description: string;
  category: string;
  status: ComponentStatus;
  wide?: boolean;
  children: ReactNode;
};

type InspectorSelection = {
  label: string;
  width: number;
  height: number;
  iconSize: string;
  display: string;
  padding: string;
  gap: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  background: string;
  border: string;
  opacity: string;
  tokenMap: InspectableTokenMap;
};

const componentCategories = [
  { label: "All", count: 29 },
  { label: "Foundations", count: 4 },
  { label: "Actions", count: 4 },
  { label: "Navigation", count: 4 },
  { label: "Data display", count: 4 },
  { label: "Status & feedback", count: 4 },
  { label: "Evidence & audit", count: 5 },
  { label: "Surfaces", count: 4 },
] as const;

const selectMenuExampleOptions: readonly SelectMenuOption<string>[] = [
  { value: "analyst", label: "Analyst judgment" },
  { value: "senior", label: "Senior credit review" },
  { value: "evidence", label: "Evidence refresh" },
];

type ComponentCategory = (typeof componentCategories)[number]["label"];
const productionComponentCount = componentCategories[0].count;

const sections: Array<{ id: SystemSection; label: string; count: number }> = [
  { id: "foundations", label: "Foundations", count: 5 },
  { id: "components", label: "Components", count: 29 },
  { id: "patterns", label: "Patterns", count: 3 },
  { id: "templates", label: "Templates", count: 3 },
  { id: "ai-native", label: "AI native", count: 3 },
];

const specimenIcons: IconName[] = [
  "home",
  "layers",
  "search",
  "book",
  "bell",
  "filter",
  "check",
  "plus",
  "arrowLeft",
  "arrowRight",
  "arrowDown",
  "chevronDown",
  "chevronRight",
  "externalLink",
  "document",
  "close",
  "button",
  "tag",
  "panel",
  "spark",
  "branch",
  "history",
  "alertCircle",
  "checkCircle",
  "chart",
  "link",
  "refresh",
  "more",
  "lock",
  "trendDown",
  "trendUp",
  "clock",
];

const colorTokens = [
  ["Canvas", "--salt-color-canvas"],
  ["Surface", "--salt-color-surface"],
  ["Strong text", "--salt-color-text-strong"],
  ["Muted text", "--salt-color-text-muted"],
  ["Border", "--salt-color-border"],
  ["Focus", "--salt-color-focus"],
  ["Success", "--salt-color-success-surface"],
  ["Warning", "--salt-color-warning-surface"],
] as const;

const spacingTokens = [
  ["4", "--salt-space-1"],
  ["8", "--salt-space-2"],
  ["12", "--salt-space-3"],
  ["16", "--salt-space-4"],
  ["24", "--salt-space-6"],
  ["32", "--salt-space-8"],
] as const;

export function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState<SystemSection>("components");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("preview");
  const [selection, setSelection] = useState<InspectorSelection | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || workspaceMode !== "inspect") return;
      if (selection) setSelection(null);
      else setWorkspaceMode("preview");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selection, workspaceMode]);

  function selectSection(section: SystemSection) {
    setActiveSection(section);
    setWorkspaceMode("preview");
    setSelection(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function selectMode(mode: WorkspaceMode) {
    setWorkspaceMode(mode);
    if (mode === "preview") setSelection(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Salt design system</h1>
          <p>A visual workspace for understanding, comparing, and refining the product language.</p>
        </div>
        {activeSection === "components" && (
          <div className={styles.headerActions}>
            <div className={styles.modeControl} role="group" aria-label="Component canvas mode">
              <button type="button" className={workspaceMode === "preview" ? styles.modeActive : ""} aria-pressed={workspaceMode === "preview"} onClick={() => selectMode("preview")}>
                <Icon name="eye" size="sm" /> Preview
              </button>
              <button type="button" className={workspaceMode === "inspect" ? styles.modeActive : ""} aria-pressed={workspaceMode === "inspect"} onClick={() => selectMode("inspect")}>
                <Icon name="cursor" size="sm" /> Inspect
              </button>
            </div>
          </div>
        )}
      </header>

      <div className={styles.sectionTabs} role="tablist" aria-label="Design system sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={activeSection === section.id ? styles.sectionTabActive : ""}
            onClick={() => selectSection(section.id)}
          >
            {section.label} <span>{section.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.workspace}>
        {activeSection === "components" && <ComponentsView inspectMode={workspaceMode === "inspect"} onSelect={setSelection} />}
        {activeSection === "foundations" && <FoundationsView />}
        {activeSection === "patterns" && <PatternsView />}
        {activeSection === "templates" && <TemplatesView />}
        {activeSection === "ai-native" && <AINativeView />}
      </div>
      {workspaceMode === "inspect" && selection && <InspectorPanel selection={selection} onClose={() => setSelection(null)} />}
    </div>
  );
}

function Inspectable({ enabled, label, tokenMap, block = false, children, onSelect }: {
  enabled: boolean;
  label: string;
  tokenMap: InspectableTokenMap;
  block?: boolean;
  children: ReactNode;
  onSelect: (selection: InspectorSelection) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<{ width: number; height: number } | null>(null);

  function targetElement() {
    return wrapperRef.current?.firstElementChild as HTMLElement | null;
  }

  function measure() {
    if (!enabled) return;
    const target = targetElement();
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    setMeasurement({ width: Math.round(bounds.width), height: Math.round(bounds.height) });
  }

  function inspect(event: MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    event.preventDefault();
    event.stopPropagation();
    const target = targetElement();
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    const computed = window.getComputedStyle(target);
    const iconBounds = target.querySelector("svg")?.getBoundingClientRect();
    onSelect({
      label,
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      iconSize: iconBounds ? `${Math.round(iconBounds.width)} × ${Math.round(iconBounds.height)}px` : "—",
      display: computed.display,
      padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
      gap: computed.gap === "normal" ? "—" : computed.gap,
      borderRadius: computed.borderRadius,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      color: computed.color,
      background: computed.backgroundColor,
      border: `${computed.borderWidth} ${computed.borderStyle} ${computed.borderColor}`,
      opacity: computed.opacity,
      tokenMap,
    });
  }

  return (
    <div
      ref={wrapperRef}
      className={`${styles.inspectable} ${block ? styles.inspectableBlock : ""} ${enabled ? styles.inspectableEnabled : ""}`}
      onMouseEnter={measure}
      onMouseLeave={() => setMeasurement(null)}
      onClickCapture={inspect}
      data-inspectable={enabled ? label : undefined}
    >
      {children}
      {enabled && measurement && <span className={styles.measurementLabel}>{measurement.width} × {measurement.height}</span>}
    </div>
  );
}

function InspectorPanel({ selection, onClose }: { selection: InspectorSelection; onClose: () => void }) {
  return (
    <aside className={styles.inspectorPanel} aria-label={`${selection.label} properties`}>
      <header>
        <div><span>Salt component</span><h2>{selection.label}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close inspector"><Icon name="close" size="sm" /></button>
      </header>
      <InspectorSection title="Dimensions" rows={[["Width", `${selection.width}px`], ["Height", `${selection.height}px`, selection.tokenMap.height], ["Icon", selection.iconSize, selection.tokenMap.iconSize]]} />
      <InspectorSection title="Layout" rows={[["Display", selection.display], ["Padding", selection.padding, selection.tokenMap.padding], ["Gap", selection.gap, selection.tokenMap.gap]]} />
      <InspectorSection title="Typography" rows={[["Font", selection.fontFamily, selection.tokenMap.fontFamily], ["Size", selection.fontSize, selection.tokenMap.fontSize], ["Line height", selection.lineHeight, selection.tokenMap.lineHeight], ["Weight", selection.fontWeight, selection.tokenMap.fontWeight]]} />
      <InspectorSection title="Appearance" rows={[["Text", selection.color, selection.tokenMap.color], ["Background", selection.background, selection.tokenMap.background], ["Border", selection.border, selection.tokenMap.border], ["Radius", selection.borderRadius, selection.tokenMap.borderRadius], ["Opacity", selection.opacity, selection.tokenMap.opacity]]} />
      <footer><span>Esc</span> Close selection</footer>
    </aside>
  );
}

function InspectorSection({ title, rows }: { title: string; rows: Array<[string, string, string?]> }) {
  return (
    <section className={styles.inspectorSection}>
      <h3>{title}</h3>
      <dl>{rows.map(([label, value, token]) => <div key={label}><dt>{label}</dt><dd title={value}><span>{value}</span>{token && <code>{token}</code>}</dd></div>)}</dl>
    </section>
  );
}

function SectionIntroduction({ eyebrow, title, description, stacked = false }: { eyebrow: string; title: string; description: string; stacked?: boolean }) {
  return (
    <div className={`${styles.sectionIntroduction} ${stacked ? styles.sectionIntroductionStacked : ""}`}>
      <span>{eyebrow}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function ComponentGallery({ category, query, inspectMode, children }: { category: ComponentCategory; query: string; inspectMode: boolean; children: ReactNode }) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleBoards = Children.toArray(children).filter((child) => {
    if (!isValidElement<SpecimenBoardProps>(child) || child.type !== SpecimenBoard) return false;
    const matchesCategory = category === "All" || child.props.category === category;
    const searchableCopy = `${child.props.title} ${child.props.description} ${child.props.category}`.toLocaleLowerCase();
    return matchesCategory && (!normalizedQuery || searchableCopy.includes(normalizedQuery));
  });

  const visibleFamilies = componentCategories
    .slice(1)
    .filter((family) => category === "All" || family.label === category)
    .map((family) => ({
      ...family,
      boards: visibleBoards.filter((child) => isValidElement<SpecimenBoardProps>(child) && child.props.category === family.label),
    }))
    .filter((family) => family.boards.length > 0);

  if (!visibleBoards.length) {
    return (
      <div className={styles.componentEmpty} role="status">
        <Icon name="search" size="md" />
        <strong>No matching components</strong>
        <span>Try a broader search or another component family.</span>
      </div>
    );
  }

  return (
    <div className={`${styles.componentGallery} ${inspectMode ? styles.componentGalleryInspect : ""}`}>
      {visibleFamilies.map((family) => (
        <section className={styles.componentFamily} key={family.label} aria-labelledby={`component-family-${family.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`}>
          <header className={styles.componentFamilyHeader}>
            <h3 id={`component-family-${family.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`}>{family.label}</h3>
            <span>{family.boards.length} {family.boards.length === 1 ? "component" : "components"}</span>
          </header>
          <div className={styles.galleryGrid}>{family.boards}</div>
        </section>
      ))}
    </div>
  );
}

function SpecimenBoard({
  title,
  description,
  category,
  status,
  wide = false,
  children,
}: SpecimenBoardProps) {
  return (
    <section className={`${styles.specimenBoard} ${wide ? styles.boardWide : ""}`}>
      <header className={styles.boardHeader}>
        <div>
          <span>{category}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <StatusLabel status={status} />
      </header>
      <div className={styles.specimenFrame}>{children}</div>
    </section>
  );
}

function StatusLabel({ status }: { status: ComponentStatus }) {
  const statusClass = status === "Ready" ? styles.statusReady : status === "In progress" ? styles.statusProgress : styles.statusPlanned;
  return <span className={`${styles.statusLabel} ${statusClass}`}>{status}</span>;
}

function buttonTokenMap(variant: "primary" | "secondary" | "soft" | "quiet", state: "default" | "hover", size: "sm" | "md" | "lg" = "sm"): InspectableTokenMap {
  const shared: InspectableTokenMap = {
    height: `--salt-button-height-${size}`,
    padding: `--salt-button-padding-${size}`,
    gap: "--salt-button-gap",
    borderRadius: "--salt-button-radius",
    fontFamily: "--salt-button-font-family",
    fontSize: "--salt-button-font-size",
    fontWeight: "--salt-button-font-weight",
    lineHeight: "--salt-button-line-height",
  };

  if (variant === "primary") return {
    ...shared,
    color: "--salt-button-primary-text",
    background: state === "hover" ? "--salt-button-primary-background-hover" : "--salt-button-primary-background",
    border: "--salt-button-border-transparent",
  };
  if (variant === "secondary") return {
    ...shared,
    color: "--salt-button-secondary-text",
    background: state === "hover" ? "--salt-button-secondary-background-hover" : "--salt-button-secondary-background",
    border: "--salt-button-border-secondary",
  };
  if (variant === "soft") return {
    ...shared,
    color: "--salt-button-soft-text",
    background: state === "hover" ? "--salt-button-soft-background-hover" : "--salt-button-soft-background",
    border: "--salt-button-border-transparent",
  };
  return {
    ...shared,
    color: "--salt-button-quiet-text",
    background: state === "hover" ? "--salt-button-quiet-background-hover" : "--salt-button-quiet-background",
    border: "--salt-button-border-transparent",
  };
}

function statusPillTokenMap(tone: "neutral" | "info" | "success" | "warning" | "danger"): InspectableTokenMap {
  return {
    height: "--salt-status-pill-height",
    padding: "--salt-status-pill-padding",
    borderRadius: "--salt-status-pill-radius",
    fontSize: "--salt-status-pill-font-size",
    fontWeight: "--salt-status-pill-font-weight",
    lineHeight: "--salt-status-pill-line-height",
    color: `--salt-status-pill-${tone}-text`,
    background: `--salt-status-pill-${tone}-background`,
  };
}

function companyLogoTokenMap(size: "sm" | "md" | "lg"): InspectableTokenMap {
  return {
    height: `--salt-company-logo-size-${size}`,
    borderRadius: "--salt-company-logo-radius",
    background: "--salt-company-logo-fallback-background",
    border: "--salt-company-logo-border",
    color: "--salt-company-logo-fallback-color",
  };
}

function textTokenMap(variant: "pageTitle" | "sectionTitle" | "body"): InspectableTokenMap {
  if (variant === "pageTitle") return { fontFamily: "--salt-type-page-title-family", fontSize: "--salt-type-page-title-size", fontWeight: "--salt-type-page-title-weight", lineHeight: "--salt-type-page-title-line", color: "--salt-color-text-strong" };
  if (variant === "sectionTitle") return { fontFamily: "--salt-type-section-title-family", fontSize: "--salt-type-section-title-size", fontWeight: "--salt-type-section-title-weight", lineHeight: "--salt-type-section-title-line", color: "--salt-color-text-strong" };
  return { fontFamily: "--salt-type-family-text", fontSize: "--salt-type-table-cell-size", fontWeight: "--salt-type-table-cell-weight", lineHeight: "--salt-type-table-cell-line", color: "--salt-color-text" };
}

function dataCellTokenMap(): InspectableTokenMap {
  return { gap: "--salt-data-cell-gap", fontSize: "--salt-data-cell-primary-size", fontWeight: "--salt-data-cell-primary-weight", lineHeight: "--salt-data-cell-primary-line", color: "--salt-data-cell-primary-color" };
}

function documentRowTokenMap(): InspectableTokenMap {
  return {
    height: "--salt-document-row-height",
    padding: "--salt-document-row-padding-block",
    gap: "--salt-document-row-gap",
    borderRadius: "--salt-document-row-radius",
    fontSize: "--salt-document-row-name-size",
    fontWeight: "--salt-document-row-name-weight",
    lineHeight: "--salt-document-row-name-line",
    color: "--salt-document-row-name-color",
    background: "--salt-document-row-background-hover",
  };
}

function fileDropzoneTokenMap(compact = false): InspectableTokenMap {
  return {
    height: compact ? "--salt-file-dropzone-compact-min-height" : "--salt-file-dropzone-min-height",
    padding: "--salt-file-dropzone-padding",
    gap: "--salt-file-dropzone-gap",
    borderRadius: "--salt-file-dropzone-radius",
    background: "--salt-file-dropzone-background",
    border: "--salt-file-dropzone-border",
  };
}

function searchFieldTokenMap(): InspectableTokenMap {
  return { height: "--salt-search-field-height", padding: "--salt-search-field-padding", gap: "--salt-search-field-gap", borderRadius: "--salt-search-field-radius", color: "--salt-search-field-text", background: "--salt-search-field-background", border: "--salt-search-field-border" };
}

function panelTokenMap(): InspectableTokenMap {
  return {
    padding: "--salt-panel-padding",
    borderRadius: "--salt-panel-radius",
    background: "--salt-panel-background",
    border: "--salt-panel-border",
  };
}

function metricCardTokenMap(compact = false): InspectableTokenMap {
  return {
    height: compact ? "--salt-metric-card-min-height-compact" : "--salt-metric-card-min-height",
    padding: compact ? "--salt-metric-card-padding-compact" : "--salt-metric-card-padding",
    borderRadius: "--salt-panel-radius",
    fontFamily: "--salt-type-family-display",
    fontSize: "--salt-metric-card-value-size",
    lineHeight: "--salt-metric-card-value-line",
    color: "--salt-color-text-strong",
    background: "--salt-panel-background",
    border: "--salt-panel-border",
  };
}

function filterChipTokenMap(selected = false): InspectableTokenMap {
  return {
    height: "--salt-filter-chip-height",
    padding: "--salt-filter-chip-padding",
    gap: "--salt-filter-chip-gap",
    borderRadius: "--salt-filter-chip-radius",
    fontFamily: "--salt-filter-chip-font-family",
    fontSize: "--salt-filter-chip-font-size",
    fontWeight: "--salt-filter-chip-font-weight",
    lineHeight: "--salt-filter-chip-line-height",
    color: "--salt-filter-chip-text",
    background: selected ? "--salt-filter-chip-background-selected" : "--salt-filter-chip-background",
    border: "--salt-filter-chip-border",
  };
}

function ComponentsView({ inspectMode, onSelect }: { inspectMode: boolean; onSelect: (selection: InspectorSelection) => void }) {
  const [componentQuery, setComponentQuery] = useState("");
  const [componentCategory, setComponentCategory] = useState<ComponentCategory>("All");
  const [searchExample, setSearchExample] = useState("");
  const [selectMenuExample, setSelectMenuExample] = useState("senior");
  const [dialogExampleOpen, setDialogExampleOpen] = useState(false);
  const [dialogExampleSize, setDialogExampleSize] = useState<DialogExampleSize>("md");
  const [drawerExampleOpen, setDrawerExampleOpen] = useState(false);
  const [documentExample, setDocumentExample] = useState<"financials" | "agreement" | null>(null);
  const [tabExample, setTabExample] = useState<"overview" | "findings" | "sources">("overview");
  const [workflowStepExample, setWorkflowStepExample] = useState<"assessment" | "evidence" | "judgment">("evidence");
  const [timelineExample, setTimelineExample] = useState<string | null>("analysis");
  const [activityExample, setActivityExample] = useState<string | null>("verification");
  const [popoverExampleOpen, setPopoverExampleOpen] = useState(true);
  const [toastExampleOpen, setToastExampleOpen] = useState(false);
  return (
    <>
      <SectionIntroduction
        eyebrow="Shared UI"
        title="Components"
        description="Production components, supported states, and usage guidance in one reference workspace."
        stacked
      />

      <div className={styles.catalogToolbar}>
        <div className={styles.catalogTopline}>
          <div className={styles.catalogSummary}>
            <strong>{productionComponentCount} production components</strong>
            <span>Seven families with live variants, states, and token inspection.</span>
          </div>
          <SearchField
            className={styles.catalogSearch}
            value={componentQuery}
            onChange={setComponentQuery}
            placeholder="Search components"
            ariaLabel="Search component library"
          />
        </div>
        <div className={styles.catalogFilters} role="group" aria-label="Filter components by family">
          {componentCategories.map((category) => (
            <FilterChip
              key={category.label}
              count={category.count}
              pressed={componentCategory === category.label}
              onClick={() => setComponentCategory(category.label)}
            >
              {category.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <ComponentGallery category={componentCategory} query={componentQuery} inspectMode={inspectMode}>
        <SpecimenBoard
          title="Text"
          description="Semantic typography roles keep page titles, section headings, and body copy consistent without page-local type rules."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.textComponentCanvas}>
            <Inspectable enabled={inspectMode} label="Text / Page title" tokenMap={textTokenMap("pageTitle")} onSelect={onSelect}><Text as="h3" variant="pageTitle">Credit Reviews</Text></Inspectable>
            <Inspectable enabled={inspectMode} label="Text / Section title" tokenMap={textTokenMap("sectionTitle")} onSelect={onSelect}><Text as="h3" variant="sectionTitle">Needs my attention</Text></Inspectable>
            <Inspectable enabled={inspectMode} label="Text / Body" tokenMap={textTokenMap("body")} onSelect={onSelect}><Text as="p" variant="body">Meridian Foods</Text></Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Button"
          description="Actions use one typography contract while hierarchy comes from surface, border, and emphasis."
          category="Actions"
          status="Ready"
        >
          <ButtonMatrix inspectMode={inspectMode} onSelect={onSelect} />
        </SpecimenBoard>

        <SpecimenBoard
          title="Tabs"
          description="Durable page sections use restrained underline navigation, count badges, and keyboard roving behavior."
          category="Navigation"
          status="Ready"
        >
          <div className={styles.tabsCanvas}>
            <Tabs
              ariaLabel="Credit review sections"
              value={tabExample}
              onChange={setTabExample}
              items={[
                { id: "overview", label: "Overview" },
                { id: "findings", label: "Findings", count: 3 },
                { id: "sources", label: "Sources", count: 12 },
              ]}
            />
            <p>Selected section: <strong>{tabExample}</strong></p>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Workflow steps"
          description="A quiet process rail for focused review flows. It preserves sequence and context without turning each stage into a card."
          category="Navigation"
          status="Ready"
        >
          <div className={styles.workflowStepsCanvas}>
            <WorkflowSteps
              ariaLabel="Finding review stages"
              value={workflowStepExample}
              onChange={setWorkflowStepExample}
              items={[
                { id: "assessment", label: "Assessment", description: "Understand the finding" },
                { id: "evidence", label: "Evidence", description: "Verify the source set" },
                { id: "judgment", label: "Judgment", description: "Own the conclusion" },
              ]}
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Section header"
          description="A restrained title, optional context, and one compact action cluster for every major section."
          category="Navigation"
          status="Ready"
        >
          <div className={styles.sectionHeaderCanvas}>
            <SectionHeader
              eyebrow="Initial assessment"
              title="Proceed with conditions"
              description="Three findings require analyst judgment before this review can move forward."
              actions={<Button size="sm" variant="quiet">View activity</Button>}
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Object header"
          description="A consistent case-level entrance: quiet back navigation, object identity and metadata, workflow state near the object, and one compact primary action at the opposite edge."
          category="Navigation"
          status="Ready"
        >
          <div className={styles.objectHeaderCanvas}>
            <Inspectable
              enabled={inspectMode}
              label="Object header / Case workspace"
              tokenMap={{
                gap: "--salt-object-header-back-to-identity-gap",
                color: "--salt-color-text-strong",
                iconSize: "--salt-object-header-back-icon-size",
              }}
              block
              onSelect={onSelect}
            >
              <ObjectHeader
                backLabel="Credit reviews"
                onBack={() => undefined}
                logo={<CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" size="lg" />}
                title="Northstar Health"
                metadata={["$15M revolving line", "3-year facility", "Alex Kim", "Due tomorrow"]}
                status={<CaseStatusPill status="needs-verification" />}
                action={<Button variant="primary">Request forecast</Button>}
              />
            </Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Key-value grid"
          description="Flat definition-list geometry for request facts, evidence metadata, and decision structure."
          category="Data display"
          status="Ready"
        >
          <div className={styles.keyValueCanvas}>
            <KeyValueGrid columns={2} items={[
              { label: "Request", value: "$18M", detail: "Working-capital line" },
              { label: "Structure", value: "3 years", detail: "Revolving facility" },
              { label: "Owner", value: "Alex Kim" },
              { label: "Due", value: "Today" },
            ]} />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Metric card"
          description="One decision-relevant value in default or compact density, with shared elevation and semantic comparison treatment."
          category="Data display"
          status="Ready"
        >
          <div className={styles.metricCardCanvas}>
            <Inspectable enabled={inspectMode} label="Metric card / Default" tokenMap={metricCardTokenMap()} block onSelect={onSelect}>
              <MetricCard label="Fixed-charge coverage" value="1.41x" detail="0.21x above covenant floor" accessory={<StatusPill tone="success">Base case</StatusPill>} />
            </Inspectable>
            <Inspectable enabled={inspectMode} label="Metric card / Compact flat" tokenMap={metricCardTokenMap(true)} block onSelect={onSelect}>
              <MetricCard label="Downside case" value="1.12x" detail="0.08x below floor" detailTone="negative" density="compact" elevation="flat" />
            </Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Scenario comparison"
          description="A flat, policy-aware comparison table for base, downside, and threshold outcomes without card-per-scenario decoration."
          category="Data display"
          status="Ready"
        >
          <div className={styles.scenarioCanvas}>
            <ScenarioComparison
              items={[
                { label: "Base case", value: "1.41x", variance: "+0.21x", outcome: "Pass", tone: "positive" },
                { label: "Downside", value: "1.12x", variance: "−0.08x", outcome: "Shortfall", tone: "negative" },
              ]}
              thresholdLabel="Minimum coverage"
              thresholdValue="1.20x"
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Timeline"
          description="Attributable system, human, and evidence events stay compact until the user asks for the change detail."
          category="Evidence & audit"
          status="Ready"
        >
          <div className={styles.timelineCanvas}>
            <Timeline
              expandedId={timelineExample}
              onToggle={(id) => setTimelineExample((current) => current === id ? null : id)}
              items={[
                { id: "analysis", title: "Automated analysis completed initial review", meta: "10:24 AM", tone: "ai", description: "Three findings require analyst review.", details: "Customer concentration was classified as material using the contract expiration date available in the original source set." },
                { id: "challenge", title: "Alex challenged a contract assumption", meta: "10:41 AM", tone: "human", description: "A renewal agreement was linked for reassessment." },
              ]}
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Activity ledger"
          description="The current scan-first audit pattern: aligned events and timestamps, with optional whole-row disclosure for supporting detail."
          category="Evidence & audit"
          status="Ready"
        >
          <div className={styles.activityLedgerCanvas}>
            <ActivityLedger
              expandedId={activityExample}
              onToggle={(id) => setActivityExample((current) => current === id ? null : id)}
              items={[
                { id: "verification", title: "Alex Kim verified the operating forecast", meta: "Today · 10:41 AM", description: "Downside coverage updated to 1.29x.", details: "The file matched the open requirement and the affected analysis was recalculated.", icon: "fileCheck", tone: "human" },
                { id: "analysis", title: "Analysis updated", meta: "Today · 10:43 AM", description: "No exception requires additional judgment.", icon: "refresh", tone: "info" },
              ]}
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Toast"
          description="Compact, nonblocking feedback confirms consequential workflow actions without interrupting the case."
          category="Status & feedback"
          status="Ready"
        >
          <div className={styles.toastCanvas}>
            <Button variant="secondary" onClick={() => setToastExampleOpen(true)}>Show confirmation</Button>
            <p>Use after evidence links, reassessment, and recommendation submission.</p>
          </div>
          {toastExampleOpen && <Toast title="Evidence linked" message="Customer A renewal agreement is ready for reassessment." onClose={() => setToastExampleOpen(false)} />}
        </SpecimenBoard>

        <SpecimenBoard
          title="Notice"
          description="A low-contrast contextual message for requirements, scoped workflow consequences, and completed evidence changes. It does not compete with the primary action."
          category="Status & feedback"
          status="Ready"
        >
          <div className={styles.noticeCanvas}>
            <Notice title="2027 operating forecast required" action={<Button size="sm" variant="quiet">Request document</Button>}>The approved source package ends in December 2026, so downside analysis is paused.</Notice>
            <Notice tone="success" title="Assessment updated">New evidence reduced the near-term risk from Material to Moderate. Human judgment is still required.</Notice>
            <Notice tone="warning" title="Policy exception remains">Downside coverage is below the proposed floor and requires explicit analyst judgment.</Notice>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Search field"
          description="A compact collection search with a persistent label, optional clear action, and tokenized focus state."
          category="Actions"
          status="Ready"
        >
          <div className={styles.searchFieldCanvas}>
            <Inspectable enabled={inspectMode} label="Search field / Default" tokenMap={searchFieldTokenMap()} onSelect={onSelect}><SearchField value={searchExample} onChange={setSearchExample} placeholder="Search reviews" ariaLabel="Search component example" /></Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Select menu"
          description="A browser-consistent single-select field with an anchored option surface and complete keyboard behavior."
          category="Actions"
          status="Ready"
        >
          <div className={styles.selectMenuCanvas}>
            <SelectMenu
              label="Required action example"
              value={selectMenuExample}
              options={selectMenuExampleOptions}
              onChange={setSelectMenuExample}
            />
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Popover"
          description="One compact floating surface for menus and pickers. The owning feature supplies anchoring, focus, dismissal, and selection logic."
          category="Surfaces"
          status="Ready"
        >
          <div className={styles.popoverCanvas}>
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={popoverExampleOpen}
              aria-controls="design-system-popover"
              onClick={() => setPopoverExampleOpen((current) => !current)}
            >
              Add filter
            </Button>
            {popoverExampleOpen && (
              <Popover id="design-system-popover" role="menu" aria-label="Review filter example" className={styles.popoverExample}>
                <button type="button" role="menuitem"><Icon name="user" size="sm" /><span><strong>Owner</strong><small>Anyone</small></span></button>
                <button type="button" role="menuitem"><Icon name="calendar" size="sm" /><span><strong>Due date</strong><small>Any time</small></span></button>
                <button type="button" role="menuitem"><Icon name="building" size="sm" /><span><strong>Facility type</strong><small>All types</small></span></button>
              </Popover>
            )}
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Filter chip"
          description="A compact facet control that filters a collection without changing application mode."
          category="Actions"
          status="Ready"
        >
          <div className={styles.filterChipCanvas}>
            <Inspectable enabled={inspectMode} label="Filter chip / Default" tokenMap={filterChipTokenMap()} onSelect={onSelect}>
              <FilterChip count={2}>Needs attention</FilterChip>
            </Inspectable>
            <Inspectable enabled={inspectMode} label="Filter chip / Selected" tokenMap={filterChipTokenMap(true)} onSelect={onSelect}>
              <FilterChip pressed count={1}>In review</FilterChip>
            </Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Status pill"
          description="The low-domain semantic primitive for compact labels. Tone communicates meaning while the visible text remains the primary signal."
          category="Status & feedback"
          status="Ready"
        >
          <div className={styles.statusPillCanvas}>
            {([
              ["neutral", "Neutral", "Draft"],
              ["info", "Info", "Ready"],
              ["success", "Success", "Verified"],
              ["warning", "Warning", "Needs review"],
              ["danger", "Danger", "Blocked"],
            ] as const).map(([tone, label, example]) => (
              <div key={tone}>
                <span>{label}</span>
                <Inspectable enabled={inspectMode} label={`Status pill / ${label}`} tokenMap={statusPillTokenMap(tone)} onSelect={onSelect}>
                  <StatusPill tone={tone}>{example}</StatusPill>
                </Inspectable>
              </div>
            ))}
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Case status"
          description="One dominant-next-action lifecycle shared by queues, case headers, previews, and bookmarks. System events remain secondary metadata."
          category="Status & feedback"
          status="Ready"
        >
          <div className={styles.badgeCanvas}>
            <div><span>Blocked by evidence</span><Inspectable enabled={inspectMode} label="Case status / Needs verification" tokenMap={statusPillTokenMap("danger")} onSelect={onSelect}><CaseStatusPill status="needs-verification" /></Inspectable></div>
            <div><span>Material choice is unresolved</span><Inspectable enabled={inspectMode} label="Case status / Needs judgment" tokenMap={statusPillTokenMap("warning")} onSelect={onSelect}><CaseStatusPill status="needs-judgment" /></Inspectable></div>
            <div><span>Analysis needs confirmation</span><Inspectable enabled={inspectMode} label="Case status / Analyst review" tokenMap={statusPillTokenMap("neutral")} onSelect={onSelect}><CaseStatusPill status="analyst-review" /></Inspectable></div>
            <div><span>Analyst can author handoff</span><Inspectable enabled={inspectMode} label="Case status / Ready to recommend" tokenMap={statusPillTokenMap("info")} onSelect={onSelect}><CaseStatusPill status="ready-to-recommend" /></Inspectable></div>
            <div><span>Senior credit owns action</span><Inspectable enabled={inspectMode} label="Case status / Awaiting decision" tokenMap={statusPillTokenMap("info")} onSelect={onSelect}><CaseStatusPill status="awaiting-decision" /></Inspectable></div>
            <div><span>Analyst must revise</span><Inspectable enabled={inspectMode} label="Case status / Revision requested" tokenMap={statusPillTokenMap("warning")} onSelect={onSelect}><CaseStatusPill status="revision-requested" /></Inspectable></div>
            <div><span>Final approval</span><Inspectable enabled={inspectMode} label="Case status / Approved" tokenMap={statusPillTokenMap("success")} onSelect={onSelect}><CaseStatusPill status="approved" /></Inspectable></div>
            <div><span>Final decline</span><Inspectable enabled={inspectMode} label="Case status / Declined" tokenMap={statusPillTokenMap("danger")} onSelect={onSelect}><CaseStatusPill status="declined" /></Inspectable></div>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Data cell"
          description="The atomic content unit for ledgers and queue rows. Primary, secondary, content, and end-aligned variants share one spacing contract."
          category="Data display"
          status="Ready"
        >
          <div className={styles.dataCellCanvas}>
            <Inspectable enabled={inspectMode} label="Data cell / Primary + secondary" tokenMap={dataCellTokenMap()} block onSelect={onSelect}><div className={styles.dataCellSpecimen}><DataCell primary="Meridian Foods" secondary="$18M working-capital line" /></div></Inspectable>
            <Inspectable enabled={inspectMode} label="Data cell / Status content" tokenMap={dataCellTokenMap()} block onSelect={onSelect}><div className={styles.dataCellSpecimen}><DataCell><CaseStatusPill status="analyst-review" /></DataCell></div></Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Icon"
          description="A restrained line-icon vocabulary sized for dense financial workflows."
          category="Foundations"
          status="In progress"
        >
          <div className={styles.iconCanvas}>
            {specimenIcons.map((name) => (
              <Inspectable key={name} enabled={inspectMode} label={`Icon / ${name}`} tokenMap={{ color: "--salt-color-text", padding: "--salt-space-2", gap: "--salt-space-1" }} block onSelect={onSelect}>
                <div title={name}><Icon name={name} /><span>{name}</span></div>
              </Inspectable>
            ))}
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Icon tile"
          description="A restrained semantic container for leading glyphs in compact financial objects and driver rows."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.iconTileCanvas}>
            <span><IconTile><Icon name="chart" size="sm" /></IconTile><small>Neutral</small></span>
            <span><IconTile tone="info" shape="circle"><Icon name="refresh" size="sm" /></IconTile><small>Info circle</small></span>
            <span><IconTile tone="warning"><Icon name="alertCircle" size="sm" /></IconTile><small>Warning</small></span>
            <span><IconTile tone="danger"><Icon name="trendDown" size="sm" /></IconTile><small>Danger</small></span>
            <span><IconTile tone="success"><Icon name="check" size="sm" /></IconTile><small>Success</small></span>
            <span><IconTile size="sm" shape="circle"><Icon name="document" size="xs" /></IconTile><small>Small circle</small></span>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Company logo"
          description="Rounded borrower identity marks use product-owned or Brandfetch assets, with a stable initials fallback and three shared sizes."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.companyLogoCanvas}>
            <div>
              <Inspectable enabled={inspectMode} label="Company logo / Small" tokenMap={companyLogoTokenMap("sm")} onSelect={onSelect}>
                <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="sm" />
              </Inspectable>
              <span><strong>Small</strong><small>Queue rows</small></span>
            </div>
            <div>
              <Inspectable enabled={inspectMode} label="Company logo / Medium" tokenMap={companyLogoTokenMap("md")} onSelect={onSelect}>
                <CompanyLogo domain={companyLogoDomains["Northstar Health"]} name="Northstar Health" size="md" />
              </Inspectable>
              <span><strong>Medium</strong><small>Cards and previews</small></span>
            </div>
            <div>
              <Inspectable enabled={inspectMode} label="Company logo / Large" tokenMap={companyLogoTokenMap("lg")} onSelect={onSelect}>
                <CompanyLogo domain={companyLogoDomains["Brightline Energy"]} name="Brightline Energy" size="lg" />
              </Inspectable>
              <span><strong>Large</strong><small>Object headers</small></span>
            </div>
            <div>
              <Inspectable enabled={inspectMode} label="Company logo / Fallback" tokenMap={companyLogoTokenMap("md")} onSelect={onSelect}>
                <CompanyLogo name="Meridian Capital" size="md" />
              </Inspectable>
              <span><strong>Fallback</strong><small>Initials remain stable</small></span>
            </div>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Document row"
          description="A compact evidence trigger for reviewed source files. The row stays low emphasis; the parent owns preview or navigation behavior."
          category="Evidence & audit"
          status="Ready"
        >
          <div className={styles.documentRowCanvas}>
            <Inspectable enabled={inspectMode} label="Document row / Default" tokenMap={documentRowTokenMap()} block onSelect={onSelect}>
              <DocumentRow
                name="Q2 2026 Financials"
                meta="PDF · Reviewed Jun 30, 2026"
                selected={documentExample === "financials"}
                onOpen={() => setDocumentExample("financials")}
              />
            </Inspectable>
            <Inspectable enabled={inspectMode} label="Document row / Selected" tokenMap={documentRowTokenMap()} block onSelect={onSelect}>
              <DocumentRow
                name="Credit agreement"
                meta="PDF · Reviewed Jun 24, 2026"
                selected={documentExample === "agreement"}
                onOpen={() => setDocumentExample("agreement")}
              />
            </Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Document viewer"
          description="A focus-contained attachment preview for read-only evidence inspection without replacing the current workflow context."
          category="Evidence & audit"
          status="Ready"
        >
          <div className={styles.documentViewerCanvas}>
            <div>
              <span>Evidence preview</span>
              <strong>Readable source context</strong>
              <p>The viewer owns focus, document framing, dismissal, and return to the exact source trigger.</p>
            </div>
            <Button variant="secondary" onClick={() => setDocumentExample("financials")}>Open document viewer</Button>
          </div>
          <DocumentViewer
            open={Boolean(documentExample)}
            onClose={() => setDocumentExample(null)}
            title={documentExample === "agreement" ? "Credit agreement" : "Q2 2026 Financials"}
            meta={documentExample === "agreement" ? "PDF · Reviewed Jun 24, 2026" : "PDF · Reviewed Jun 30, 2026"}
          >
            <p>{documentExample === "agreement" ? "Facility terms, covenants, and reporting requirements for the request." : "Current financial statements covering revenue, margins, and leverage."}</p>
            <p>The viewer preserves the page and drawer beneath it while the user inspects the evidence.</p>
          </DocumentViewer>
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="File dropzone"
          description="Evidence intake stays distinct from verification. Idle, uploading, ready, verified, and failed states share one restrained input contract."
          category="Evidence & audit"
          status="Ready"
        >
          <div className={styles.fileDropzoneCanvas}>
            <div className={styles.fileDropzonePrimary}>
              <span>Idle</span>
              <Inspectable enabled={inspectMode} label="File dropzone / Idle" tokenMap={fileDropzoneTokenMap()} block onSelect={onSelect}>
                <FileDropzone status="idle" onFileAccepted={() => undefined} />
              </Inspectable>
            </div>
            <div className={styles.fileDropzoneStates}>
              <div>
                <span>Uploading</span>
                <Inspectable enabled={inspectMode} label="File dropzone / Uploading" tokenMap={fileDropzoneTokenMap(true)} block onSelect={onSelect}>
                  <FileDropzone status="uploading" fileName="2027 Operating Forecast.xlsx" compact onFileAccepted={() => undefined} />
                </Inspectable>
              </div>
              <div>
                <span>Ready for review</span>
                <Inspectable enabled={inspectMode} label="File dropzone / Ready for review" tokenMap={fileDropzoneTokenMap(true)} block onSelect={onSelect}>
                  <FileDropzone status="ready-for-review" fileName="2027 Operating Forecast.xlsx" compact onFileAccepted={() => undefined} onRemove={() => undefined} />
                </Inspectable>
              </div>
              <div>
                <span>Verified</span>
                <Inspectable enabled={inspectMode} label="File dropzone / Verified" tokenMap={fileDropzoneTokenMap(true)} block onSelect={onSelect}>
                  <FileDropzone status="verified" fileName="2027 Operating Forecast.xlsx" compact onFileAccepted={() => undefined} />
                </Inspectable>
              </div>
              <div>
                <span>Failed</span>
                <Inspectable enabled={inspectMode} label="File dropzone / Failed" tokenMap={fileDropzoneTokenMap(true)} block onSelect={onSelect}>
                  <FileDropzone status="failed" error="Upload failed. Choose the file again." compact onFileAccepted={() => undefined} />
                </Inspectable>
              </div>
            </div>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Panel"
          description="A compositional surface for findings, evidence, and review-oriented content."
          category="Surfaces"
          status="Ready"
        >
          <div className={styles.panelCanvas}>
            <Inspectable enabled={inspectMode} label="Panel / Finding" tokenMap={panelTokenMap()} block onSelect={onSelect}><Panel className={styles.findingPanel}>
              <div className={styles.findingTopline}>
                <StatusPill tone="warning">Needs judgment</StatusPill>
                <span>3 approved sources</span>
              </div>
              <div>
                <h4>Customer concentration</h4>
                <p>Two customers represent 61% of revenue. The renewal evidence needs analyst verification.</p>
              </div>
              <div className={styles.findingFooter}>
                <span>Automated assessment</span>
                <Button size="sm" variant="quiet" icon={<Icon name="arrowRight" size="xs" />}>Review finding</Button>
              </div>
            </Panel></Inspectable>

            <Inspectable enabled={inspectMode} label="Panel / Summary" tokenMap={{ ...panelTokenMap(), background: "--salt-color-inverse-surface", color: "--salt-color-inverse-text" }} block onSelect={onSelect}><Panel className={styles.summaryPanel}>
              <span>Initial assessment</span>
              <strong>Proceed with conditions</strong>
              <p>Repayment appears supportable, with three findings requiring human judgment.</p>
            </Panel></Inspectable>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Drawer"
          description="Current Salt design: Overlay preview V1. A compact right-side panel that preserves list context while the shell owns close, scroll containment, section rhythm, and responsive behavior."
          category="Surfaces"
          status="Ready"
        >
          <div className={styles.drawerCanvas}>
            <div>
              <span>Compact detail preview</span>
              <strong>392px responsive detail shell</strong>
              <p>Use for a concise object summary. Keep editing and full workflow content on the destination page.</p>
            </div>
            <Button variant="secondary" onClick={() => setDrawerExampleOpen(true)}>Open drawer</Button>
          </div>
          <Drawer open={drawerExampleOpen} onClose={() => setDrawerExampleOpen(false)} labelledBy="drawer-specimen-title">
            <DrawerHeader onClose={() => setDrawerExampleOpen(false)}>
              <span className={styles.drawerExampleEyebrow}>Credit review</span>
              <h2 id="drawer-specimen-title" className={styles.drawerExampleTitle}>Meridian Foods</h2>
              <p className={styles.drawerExampleMeta}>Revolving line</p>
              <CaseStatusPill status="needs-judgment" />
            </DrawerHeader>
            <DrawerBody>
              <DrawerSection className={styles.drawerExampleSection}>
                <strong>$18M</strong>
                <span>Working-capital line</span>
              </DrawerSection>
              <DrawerSection className={styles.drawerExampleSection}>
                <small>Initial assessment</small>
                <strong>Proceed with conditions</strong>
                <p>Three findings require human interpretation before the review can move forward.</p>
              </DrawerSection>
            </DrawerBody>
            <DrawerFooter className={styles.drawerExampleFooter}>
              <Button variant="primary">Review 3 findings</Button>
            </DrawerFooter>
          </Drawer>
        </SpecimenBoard>

        <SpecimenBoard
          title="Dialog"
          description="A bounded modal task surface with a labelled header, scroll-contained body, explicit footer actions, Escape dismissal, focus containment, and focus return."
          category="Surfaces"
          status="Ready"
        >
          <div className={styles.dialogCanvas}>
            <div>
              <span>Focused modal task</span>
              <strong>Small, medium, and large widths</strong>
              <p>Use for bounded creation and confirmation work that must temporarily contain focus.</p>
            </div>
            <div className={styles.dialogLauncher}>
              <div className={styles.dialogSizeControl} role="group" aria-label="Dialog example size">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={dialogExampleSize === size ? styles.dialogSizeActive : ""}
                    aria-pressed={dialogExampleSize === size}
                    onClick={() => setDialogExampleSize(size)}
                  >
                    {size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
                  </button>
                ))}
              </div>
              <Button variant="secondary" onClick={() => setDialogExampleOpen(true)}>Open dialog</Button>
            </div>
          </div>
          <Dialog
            open={dialogExampleOpen}
            onClose={() => setDialogExampleOpen(false)}
            eyebrow="Policy rules"
            title="Confirm policy change"
            size={dialogExampleSize}
            footer={<>
              <Button variant="quiet" onClick={() => setDialogExampleOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setDialogExampleOpen(false)}>Confirm change</Button>
            </>}
          >
            <div className={styles.dialogExampleBody}>
              <strong>Pause Leverage ceiling?</strong>
              <p>New Meridian evaluations will stop until an authorized policy owner reactivates the rule.</p>
            </div>
          </Dialog>
        </SpecimenBoard>
      </ComponentGallery>
    </>
  );
}

function SaltTokenCanvas() {
  const layers = [
    { label: "Primitive", example: "Space / 3", token: "--salt-space-3", value: "12px" },
    { label: "Semantic", example: "Action text", token: "--salt-type-action-size", value: "15px" },
    { label: "Component", example: "Button padding", token: "--salt-button-padding-sm", value: "12px" },
  ];

  return (
    <div className={styles.saltTokenCanvas}>
      {layers.map((layer, index) => (
        <div className={styles.saltTokenLayer} key={layer.label}>
          <span>{index + 1}</span>
          <div><small>{layer.label}</small><strong>{layer.example}</strong></div>
          <code>{layer.token}</code>
          <em>{layer.value}</em>
        </div>
      ))}
      <p>Primitive values describe the scale. Semantic tokens describe intent. Component tokens define the stable contract that Buttons, StatusPills, and Panels consume.</p>
    </div>
  );
}

function ButtonMatrix({ inspectMode, onSelect }: { inspectMode: boolean; onSelect: (selection: InspectorSelection) => void }) {
  const rows: Array<{ label: string; variant: "primary" | "secondary" | "soft" | "quiet" }> = [
    { label: "Primary", variant: "primary" },
    { label: "Secondary", variant: "secondary" },
    { label: "Soft", variant: "soft" },
    { label: "Quiet", variant: "quiet" },
  ];

  return (
    <div className={styles.matrixScroller}>
      <div className={styles.buttonMatrix}>
        <span />
        <span className={styles.matrixHeader}>Default</span>
        <span className={styles.matrixHeader}>Hover</span>
        <span className={styles.matrixHeader}>Focus</span>
        <span className={styles.matrixHeader}>Disabled</span>

        {rows.map((row) => (
          <ButtonMatrixRow key={row.variant} label={row.label} variant={row.variant} inspectMode={inspectMode} onSelect={onSelect} />
        ))}
      </div>
      <div className={styles.buttonSizeStrip} role="group" aria-label="Button sizes">
        <span>Sizes</span>
        {(["sm", "md", "lg"] as const).map((size) => (
          <Inspectable key={size} enabled={inspectMode} label={`Button / ${size.toUpperCase()}`} tokenMap={buttonTokenMap("secondary", "default", size)} onSelect={onSelect}>
            <Button size={size} variant="secondary">{size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}</Button>
          </Inspectable>
        ))}
      </div>
    </div>
  );
}

function ButtonMatrixRow({ label, variant, inspectMode, onSelect }: { label: string; variant: "primary" | "secondary" | "soft" | "quiet"; inspectMode: boolean; onSelect: (selection: InspectorSelection) => void }) {
  const buttonLabel = variant === "primary" ? "Continue review" : variant === "secondary" ? "Add evidence" : variant === "soft" ? "Save draft" : "View source";
  const hoverClass = variant === "primary" ? styles.primaryHover : variant === "secondary" ? styles.secondaryHover : variant === "soft" ? styles.softHover : styles.quietHover;
  const defaultTokens = buttonTokenMap(variant, "default");
  const hoverTokens = buttonTokenMap(variant, "hover");

  return (
    <>
      <span className={styles.matrixRowLabel}>{label}</span>
      <div><Inspectable enabled={inspectMode} label={`Button / ${label} / Default`} tokenMap={defaultTokens} onSelect={onSelect}><Button size="sm" variant={variant}>{buttonLabel}</Button></Inspectable></div>
      <div><Inspectable enabled={inspectMode} label={`Button / ${label} / Hover`} tokenMap={hoverTokens} onSelect={onSelect}><Button size="sm" variant={variant} className={hoverClass}>{buttonLabel}</Button></Inspectable></div>
      <div><Inspectable enabled={inspectMode} label={`Button / ${label} / Focus`} tokenMap={defaultTokens} onSelect={onSelect}><Button size="sm" variant={variant} className={styles.forcedFocus}>{buttonLabel}</Button></Inspectable></div>
      <div><Inspectable enabled={inspectMode} label={`Button / ${label} / Disabled`} tokenMap={{ ...defaultTokens, opacity: "--salt-button-disabled-opacity" }} onSelect={onSelect}><Button size="sm" variant={variant} disabled>{buttonLabel}</Button></Inspectable></div>
    </>
  );
}

function FoundationsView() {
  return (
    <>
      <SectionIntroduction
        eyebrow="System language"
        title="Foundations"
        description="Measured visual decisions that every product component inherits before local styling begins."
      />

      <div className={styles.galleryGrid}>
        <SpecimenBoard
          wide
          title="Salt token architecture"
          description="A named contract connecting measured interface values to reusable product decisions."
          category="System"
          status="Ready"
        >
          <SaltTokenCanvas />
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Typography"
          description="Observed interaction roles mapped to semantic product tokens."
          category="Foundations"
          status="Ready"
        >
          <TypographyCanvas />
        </SpecimenBoard>

        <SpecimenBoard
          wide
          title="Semantic color"
          description="A quiet neutral system with color reserved for state and action."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.colorCanvas}>
            {colorTokens.map(([label, token]) => (
              <div key={token}>
                <span className={styles.colorSwatch} style={{ background: `var(${token})` }} />
                <strong>{label}</strong>
                <code>{token}</code>
              </div>
            ))}
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Spacing"
          description="A compact 4px rhythm for dense product interfaces."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.spacingCanvas}>
            {spacingTokens.map(([label, token]) => (
              <div key={token}>
                <code>{label}px</code>
                <span style={{ width: `var(${token})` }} />
                <small>{token}</small>
              </div>
            ))}
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Shape and elevation"
          description="Restrained radii and shadows preserve hierarchy without card noise."
          category="Foundations"
          status="Ready"
        >
          <div className={styles.shapeCanvas}>
            <div className={styles.shapeSmall}><span>4px</span></div>
            <div className={styles.shapeMedium}><span>8px</span></div>
            <div className={styles.shapeLarge}><span>12px</span></div>
            <div className={styles.shapeRaised}><span>Raised</span></div>
          </div>
        </SpecimenBoard>
      </div>
    </>
  );
}

function TypographyCanvas() {
  return (
    <div className={styles.typographyCanvas}>
      <div className={styles.typeSample}>
        <span>Page title</span>
        <strong className={styles.typePageTitle}>Credit reviews</strong>
        <code>Arcadia Display · 28 / 36 · 380</code>
      </div>
      <div className={styles.typeSample}>
        <span>Action and filter label</span>
        <div className={styles.controlSamples}>
          <Button size="sm" icon={<Icon name="plus" size="xs" />} iconPosition="start">Submit expense</Button>
          <span className={styles.filterChipSample}>Pending Review</span>
        </div>
        <code>Arcadia Text · 15 / 24 · 400</code>
      </div>
      <div className={styles.typeSample}>
        <span>Section tab and count</span>
        <div><span className={styles.tabSample}>All expenses <span>5</span></span></div>
        <code>14 / 20 · 400 &nbsp;·&nbsp; Count 12 / 20 · +0.2px</code>
      </div>
    </div>
  );
}

function PatternsView() {
  return (
    <>
      <SectionIntroduction
        eyebrow="Product language"
        title="Lending patterns"
        description="Compositions that combine shared components with commercial-credit meaning."
      />

      <div className={styles.patternGrid}>
        <SpecimenBoard
          title="Finding summary"
          description="A decision-oriented finding with clear source and ownership signals."
          category="Review"
          status="In progress"
        >
          <div className={styles.patternCanvas}>
            <div className={styles.patternTopline}><StatusPill tone="warning">Moderate risk</StatusPill><span>Automated analysis</span></div>
            <h4>Customer concentration</h4>
            <p>Top two customers represent 61% of revenue.</p>
            <div className={styles.sourceLine}><Icon name="book" size="sm" /><span>3 supporting sources</span><Icon name="chevronRight" size="sm" /></div>
          </div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Risk transition"
          description="Transparent reassessment after the analyst adds correcting evidence."
          category="Reassessment"
          status="In progress"
        >
          <div className={styles.transitionCanvas}>
            <div><span>Previous</span><StatusPill tone="danger">Material risk</StatusPill></div>
            <Icon name="arrowRight" />
            <div><span>Updated</span><StatusPill tone="warning">Moderate risk</StatusPill></div>
          </div>
          <div className={styles.changeNote}><Icon name="check" size="sm" /> Contract renewed for three years</div>
        </SpecimenBoard>

        <SpecimenBoard
          title="Evidence row"
          description="Source identity, freshness, and review status in one compact row."
          category="Evidence"
          status="Planned"
        >
          <div className={styles.evidenceCanvas}>
            <span className={styles.documentGlyph}><Icon name="book" /></span>
            <span><strong>Customer A renewal</strong><small>Signed contract · Jul 18, 2026</small></span>
            <StatusPill tone="success">Verified</StatusPill>
          </div>
        </SpecimenBoard>
      </div>
    </>
  );
}

function TemplatesView() {
  const templates = [
    { title: "Credit Reviews", description: "Contained operational queue", type: "queue" },
    { title: "Credit Review", description: "Request, repayment, risk, and protection", type: "review" },
    { title: "Finding Investigation", description: "Reasoning and evidence comparison", type: "investigation" },
  ] as const;

  return (
    <>
      <SectionIntroduction
        eyebrow="Page composition"
        title="Templates"
        description="Reusable page structures that keep the lending workflow coherent as the product grows."
      />

      <div className={styles.templateGrid}>
        {templates.map((template) => (
          <section className={styles.templateBoard} key={template.title}>
            <div className={styles.templatePreview} data-template={template.type}>
              <div className={styles.previewHeader}><span /><span /></div>
              <div className={styles.previewTabs}><span /><span /><span /></div>
              <div className={styles.previewBody}>
                <span /><span /><span /><span />
              </div>
            </div>
            <div>
              <span>Template</span>
              <h3>{template.title}</h3>
              <p>{template.description}</p>
            </div>
            <StatusLabel status={template.type === "queue" ? "In progress" : "Planned"} />
          </section>
        ))}
      </div>
    </>
  );
}
