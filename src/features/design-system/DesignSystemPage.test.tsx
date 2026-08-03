// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignSystemPage } from "./DesignSystemPage";

const productionComponents = [
  "Text",
  "Button",
  "Tabs",
  "Workflow steps",
  "Section header",
  "Object header",
  "Key-value grid",
  "Metric card",
  "Scenario comparison",
  "Timeline",
  "Activity ledger",
  "Toast",
  "Notice",
  "Search field",
  "Select menu",
  "Popover",
  "Filter chip",
  "Status pill",
  "Case status",
  "Data cell",
  "Icon",
  "Icon tile",
  "Company logo",
  "Document row",
  "Document viewer",
  "File dropzone",
  "Panel",
  "Drawer",
  "Dialog",
] as const;

const componentFamilies = [
  ["All", 29],
  ["Foundations", 4],
  ["Actions", 4],
  ["Navigation", 4],
  ["Data display", 4],
  ["Status & feedback", 4],
  ["Evidence & audit", 5],
  ["Surfaces", 4],
] as const;

function renderDesignSystem() {
  return render(<DesignSystemPage />);
}

function getSpecimenBoard(title: string) {
  const heading = screen.getByRole("heading", { level: 3, name: title });
  const board = heading.closest("section");
  if (!board) throw new Error(`Specimen board not found for ${title}`);
  return board;
}

beforeEach(() => {
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  window.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("DesignSystemPage component gallery", () => {
  it("presents the AI-native operating system as an interactive design-system section", () => {
    renderDesignSystem();

    fireEvent.click(screen.getByRole("tab", { name: /^AI native\s*4$/ }));

    expect(screen.getByRole("heading", { level: 2, name: "I built the system that governs how AI builds the product." })).toBeInTheDocument();
    expect(screen.getByText("29", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(8);

    const designSystemLayer = screen.getByRole("button", { name: /02\s*Design system\s*Visual language/i });
    fireEvent.click(designSystemLayer);

    expect(designSystemLayer).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 4, name: "Design system" })).toBeInTheDocument();
    expect(screen.getByText("29 production components", { selector: "li" })).toBeInTheDocument();
  });

  it("documents the complete 29-component production inventory", () => {
    renderDesignSystem();

    expect(screen.getByText("29 production components")).toBeInTheDocument();
    expect(screen.getByText("Seven families with live variants, states, and token inspection.")).toBeInTheDocument();

    const filters = screen.getByRole("group", { name: "Filter components by family" });
    componentFamilies.forEach(([family, count]) => {
      expect(within(filters).getByRole("button", { name: new RegExp(`^${family}\\s*${count}$`) })).toBeInTheDocument();
    });

    const renderedHeadings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    productionComponents.forEach((component) => expect(renderedHeadings).toContain(component));
  });

  it("searches the catalog and composes search with family filters", () => {
    renderDesignSystem();

    const search = screen.getByRole("textbox", { name: "Search component library" });
    fireEvent.change(search, { target: { value: "company logo" } });

    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Foundations",
      "Company logo",
    ]);
    expect(screen.getByRole("heading", { level: 3, name: "Company logo" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Status pill" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    const filters = screen.getByRole("group", { name: "Filter components by family" });
    const allFilter = within(filters).getByRole("button", { name: /^All\s*29$/ });
    const evidenceFilter = within(filters).getByRole("button", { name: /^Evidence & audit\s*5$/ });
    fireEvent.click(evidenceFilter);

    expect(evidenceFilter).toHaveAttribute("aria-pressed", "true");
    expect(allFilter).toHaveAttribute("aria-pressed", "false");
    ["Timeline", "Activity ledger", "Document row", "Document viewer", "File dropzone"].forEach((component) => {
      expect(screen.getByRole("heading", { level: 3, name: component })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);

    fireEvent.change(search, { target: { value: "company logo" } });
    expect(screen.getByRole("status")).toHaveTextContent("No matching components");
    expect(screen.getByText("Try a broader search or another component family.")).toBeInTheDocument();
  });

  it("shows the CompanyLogo and StatusPill variants and opens the DocumentViewer specimen", () => {
    renderDesignSystem();

    const companyLogo = getSpecimenBoard("Company logo");
    ["Small", "Medium", "Large", "Fallback"].forEach((variant) => {
      expect(within(companyLogo).getByText(variant)).toBeInTheDocument();
    });
    expect(companyLogo.querySelectorAll("img")).toHaveLength(3);
    expect(within(companyLogo).getByText("Initials remain stable")).toBeInTheDocument();

    const statusPill = getSpecimenBoard("Status pill");
    ["Neutral", "Info", "Success", "Warning", "Danger"].forEach((tone) => {
      expect(within(statusPill).getByText(tone)).toBeInTheDocument();
    });
    ["Draft", "Verified", "Needs review", "Blocked"].forEach((example) => {
      expect(within(statusPill).getByText(example)).toBeInTheDocument();
    });

    const documentViewer = getSpecimenBoard("Document viewer");
    const openViewer = within(documentViewer).getByRole("button", { name: "Open document viewer" });
    openViewer.focus();
    fireEvent.click(openViewer);

    const viewer = screen.getByRole("dialog", { name: "Q2 2026 Financials" });
    expect(within(viewer).getByText("PDF · Reviewed Jun 30, 2026")).toBeInTheDocument();
    expect(within(viewer).getByRole("article", { name: "Q2 2026 Financials preview" })).toBeInTheDocument();
    fireEvent.click(within(viewer).getByRole("button", { name: "Close document preview" }));

    expect(screen.queryByRole("dialog", { name: "Q2 2026 Financials" })).not.toBeInTheDocument();
    expect(openViewer).toHaveFocus();
  });

  it("previews all Dialog sizes and applies the selected size to the modal", () => {
    renderDesignSystem();

    const dialogBoard = getSpecimenBoard("Dialog");
    const sizes = within(dialogBoard).getByRole("group", { name: "Dialog example size" });
    const medium = within(sizes).getByRole("button", { name: "Medium" });
    const large = within(sizes).getByRole("button", { name: "Large" });

    expect(medium).toHaveAttribute("aria-pressed", "true");
    expect(large).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(large);
    expect(large).toHaveAttribute("aria-pressed", "true");
    expect(medium).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(within(dialogBoard).getByRole("button", { name: "Open dialog" }));
    const dialog = screen.getByRole("dialog", { name: "Confirm policy change" });
    expect(dialog.className.split(/\s+/).some((className) => className === "lg" || className.startsWith("_lg_"))).toBe(true);
    expect(within(dialog).getByText("Pause Leverage ceiling?")).toBeInTheDocument();
  });
});
