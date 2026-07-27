// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RouterProvider } from "../../app/router";
import { OverviewPage } from "./OverviewPage";

function renderOverview(path = "/") {
  window.history.replaceState({}, "", path);
  return render(<RouterProvider><OverviewPage /></RouterProvider>);
}

describe("OverviewPage design directions", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));
  afterEach(() => cleanup());

  it("uses the current portfolio command view and exposes an inspectable workflow chart", () => {
    renderOverview();

    const summary = screen.getByRole("region", { name: "Lending operating summary" });
    expect(within(summary).getByText("Active review mix · 6 weeks")).toBeTruthy();
    expect(within(summary).getByRole("button", { name: "Meridian Foods, Needs judgment, due Today" })).toBeTruthy();
    expect(screen.queryByText("Analyst decisions are holding the review.")).toBeNull();

    fireEvent.click(within(summary).getByRole("button", { name: /^Jun 22:/ }));
    expect(within(summary).getByText("52")).toBeTruthy();
    expect(within(summary).getByText("Opening week")).toBeTruthy();
    expect(within(summary).getByText("Jun 22", { selector: "strong" })).toBeTruthy();
  });

  it("keeps the balanced V1 dashboard available from Design Options", () => {
    renderOverview("/?design=workspace-overview-v1-balanced-modules");

    expect(screen.getByLabelText("Previewing Workspace overview V1 · Balanced status dashboard")).toBeTruthy();
    expect(screen.getByText("Analyst decisions are holding the review.")).toBeTruthy();
    expect(screen.getByText("61")).toBeTruthy();
    expect(screen.queryByText("Active review mix · 6 weeks")).toBeNull();
  });

  it("offers a trend-led V3 flow chart with the same inspectable portfolio data", () => {
    renderOverview("/?design=workspace-overview-v3-trend-flow-chart");

    const summary = screen.getByRole("region", { name: "Lending operating summary" });
    const trendImage = within(summary).getByRole("img", { name: "Active review and attention trend" });
    const trendPlot = trendImage.parentElement?.parentElement;
    expect(screen.getByLabelText("Previewing Workspace overview V3 · Trend flow chart")).toBeTruthy();
    expect(within(summary).getByText("Portfolio momentum · 6 weeks")).toBeTruthy();
    expect(trendImage).toBeTruthy();

    fireEvent.click(within(summary).getByRole("button", { name: /^Jun 22:/ }));
    expect(within(summary).getAllByText("52")).toHaveLength(2);
    expect(within(summary).getByText("Opening week")).toBeTruthy();
    expect(within(summary).getByText("26 in review · 8 decision-ready")).toBeTruthy();

    fireEvent.mouseEnter(within(summary).getByRole("button", { name: /^Jul 6:/ }));
    expect(within(summary).getByText("25 in review · 9 decision-ready")).toBeTruthy();

    fireEvent.focus(within(summary).getByRole("button", { name: /^Jun 29:/ }));
    expect(within(summary).getByText("+1 vs prior week")).toBeTruthy();
    expect(within(summary).getByText("27 in review · 9 decision-ready")).toBeTruthy();

    expect(trendPlot).toBeTruthy();
    fireEvent.mouseLeave(trendPlot as HTMLElement);
    expect(within(summary).getByRole("button", { name: /^Jul 27:/ }).getAttribute("aria-pressed")).toBe("true");
    expect(within(summary).getByText("29 in review · 11 decision-ready")).toBeTruthy();
  });

  it("offers a quieter V4 momentum chart with the selected workflow mix", () => {
    renderOverview("/?design=workspace-overview-v4-momentum-mix");

    const summary = screen.getByRole("region", { name: "Lending operating summary" });
    const momentumImage = within(summary).getByRole("img", { name: "Active workload momentum" });
    const momentumPlot = momentumImage.parentElement?.parentElement;
    expect(screen.getByLabelText("Previewing Workspace overview V4 · Momentum + mix")).toBeTruthy();
    expect(within(summary).getByText("Active workload · 6 weeks")).toBeTruthy();
    expect(within(summary).getByRole("img", { name: "21 need attention, 29 in review, 11 ready for decision" })).toBeTruthy();
    expect(within(summary).queryByRole("img", { name: "Active review and attention trend" })).toBeNull();

    fireEvent.click(within(summary).getByRole("button", { name: /^Jun 22:/ }));
    expect(within(summary).getByText("52")).toBeTruthy();
    expect(within(summary).getByText("Opening week")).toBeTruthy();
    expect(within(summary).getByRole("img", { name: "18 need attention, 26 in review, 8 ready for decision" })).toBeTruthy();

    fireEvent.mouseEnter(within(summary).getByRole("button", { name: /^Jul 6:/ }));
    expect(within(summary).getByRole("img", { name: "19 need attention, 25 in review, 9 ready for decision" })).toBeTruthy();

    fireEvent.focus(within(summary).getByRole("button", { name: /^Jun 29:/ }));
    expect(within(summary).getByText("+1 vs prior week")).toBeTruthy();

    expect(momentumPlot).toBeTruthy();
    fireEvent.mouseLeave(momentumPlot as HTMLElement);
    expect(within(summary).getByRole("button", { name: /^Jul 27:/ }).getAttribute("aria-pressed")).toBe("true");
  });
});
