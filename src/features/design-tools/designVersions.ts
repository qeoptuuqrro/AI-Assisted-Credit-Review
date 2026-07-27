export type DesignVersionStatus = "current" | "candidate" | "archived";
export type DesignComponentId = "drawer" | "design-tools-launcher";

export type DesignComponentVersion = {
  id: string;
  component: DesignComponentId;
  componentLabel: string;
  version: `V${number}`;
  name: string;
  status: DesignVersionStatus;
  summary: string;
  decisionDocument: string;
};

export const designComponentVersions = [
  {
    id: "drawer-overlay-v1",
    component: "drawer",
    componentLabel: "Drawer",
    version: "V1",
    name: "Overlay preview",
    status: "archived",
    summary: "The preserved compact 392px overlay that keeps the queue at full width while covering its right edge.",
    decisionDocument: "docs/design-decisions/drawer-overlay-v1.md",
  },
  {
    id: "drawer-responsive-rail-v2",
    component: "drawer",
    componentLabel: "Drawer",
    version: "V2",
    name: "Responsive detail rail",
    status: "current",
    summary: "The current Credit Reviews rail: 544px priority queue, 32px gutter, 392px detail panel, and viewport-capped internal overflow.",
    decisionDocument: "docs/design-decisions/drawer-responsive-rail-v2.md",
  },
  {
    id: "design-tools-stacked-accordion-v1",
    component: "design-tools-launcher",
    componentLabel: "Design tools launcher",
    version: "V1",
    name: "Stacked accordion",
    status: "archived",
    summary: "The preserved single-rail inventory with expandable workflow states, production screens, references, and inline versions.",
    decisionDocument: "docs/design-decisions/design-tools-stacked-accordion-v1.md",
  },
  {
    id: "design-tools-compact-navigator-v2",
    component: "design-tools-launcher",
    componentLabel: "Design tools launcher",
    version: "V2",
    name: "Compact navigator",
    status: "current",
    summary: "A fixed-height, route-aware navigator with dedicated modes, collection search, version drill-in, deep links, and contained scrolling.",
    decisionDocument: "docs/design-decisions/design-tools-compact-navigator-v2.md",
  },
] as const satisfies readonly DesignComponentVersion[];

export function getVersionsByStatus(status: DesignVersionStatus) {
  return designComponentVersions.filter((version) => version.status === status);
}
