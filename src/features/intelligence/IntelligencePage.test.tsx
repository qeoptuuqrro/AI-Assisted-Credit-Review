// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "../../app/router";
import { INTELLIGENCE_WORK_TIMING, IntelligencePage } from "./IntelligencePage";

function setReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" && matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

function renderIntelligence() {
  window.history.replaceState({}, "", "/intelligence");
  return render(<RouterProvider><IntelligencePage /></RouterProvider>);
}

function currentStep(label: string) {
  const progress = screen.getByRole("list", { name: "Analysis progress" });
  const item = within(progress).getByRole("listitem", { name: label });
  expect(item?.getAttribute("aria-current")).toBe("step");
}

describe("IntelligencePage", () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setReducedMotion(false);
    scrollIntoViewMock = vi.fn();
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoViewMock,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses canonical company logos for review context and semantic icons elsewhere", () => {
    renderIntelligence();

    fireEvent.click(screen.getByRole("button", { name: "Add context with at mention" }));
    const picker = screen.getByRole("listbox", { name: "Add intelligence context" });
    const meridian = within(picker).getByText("Meridian Foods", { selector: "strong" }).closest("button");
    const northstar = within(picker).getByText("Northstar Health", { selector: "strong" }).closest("button");
    const finding = within(picker).getByText("Customer concentration", { selector: "strong" }).closest("button");

    expect(meridian).toBeTruthy();
    expect(northstar).toBeTruthy();
    expect(finding).toBeTruthy();

    expect(meridian?.querySelector("img")?.getAttribute("src")).toContain("/arc.net/");
    expect(northstar?.querySelector("img")?.getAttribute("src")).toContain("/linear.app/");
    expect(within(meridian as HTMLButtonElement).getByText("MF")).toBeTruthy();
    expect(within(northstar as HTMLButtonElement).getByText("NH")).toBeTruthy();
    expect(finding?.querySelector("img")).toBeNull();
    expect(finding?.querySelector("svg")).toBeTruthy();

    fireEvent.click(meridian as HTMLButtonElement);
    const selectedContext = screen.getByLabelText("Selected context");
    expect(selectedContext.querySelector("img")?.getAttribute("src")).toContain("/arc.net/");
  }, 10_000);

  it("keeps each analysis stage readable before revealing the answer", () => {
    vi.useFakeTimers();
    renderIntelligence();

    fireEvent.click(screen.getByRole("button", { name: "Brief me on Meridian Foods" }));
    currentStep("Scoping the review");

    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.stepStarts[1] - 1));
    currentStep("Scoping the review");
    act(() => vi.advanceTimersByTime(1));
    currentStep("Reading approved evidence");

    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.stepStarts[2] - INTELLIGENCE_WORK_TIMING.stepStarts[1]));
    currentStep("Reconciling the assessment");
    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.stepStarts[3] - INTELLIGENCE_WORK_TIMING.stepStarts[2]));
    currentStep("Preparing the briefing");

    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.complete - INTELLIGENCE_WORK_TIMING.stepStarts[3] - 1));
    expect(screen.queryByText(/remains supportable with conditions/i)).toBeNull();
    expect(screen.queryByText("Analysis complete. Answer ready.")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText(/remains supportable with conditions/i)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Analysis complete. Answer ready.");
  });

  it("cancels the active run and clears its pending completion", () => {
    vi.useFakeTimers();
    renderIntelligence();

    fireEvent.click(screen.getByRole("button", { name: "Brief me on Meridian Foods" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.complete));

    expect(screen.getByRole("heading", { name: "Ask about your credit portfolio" })).toBeTruthy();
    expect(screen.queryByText(/remains supportable with conditions/i)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("focuses each new turn without scrolling again when its answer completes", () => {
    vi.useFakeTimers();
    renderIntelligence();

    fireEvent.click(screen.getByRole("button", { name: "Brief me on Meridian Foods" }));
    const firstArticle = screen
      .getByText("Brief me on what changed in Meridian Foods and what still needs analyst judgment.")
      .closest("article");
    expect(scrollIntoViewMock).toHaveBeenCalledOnce();
    expect(scrollIntoViewMock.mock.contexts[0]).toBe(firstArticle);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });

    scrollIntoViewMock.mockClear();
    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.complete));
    expect(scrollIntoViewMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Show downside coverage" }));
    const latestArticle = screen
      .getByText("Show whether fixed-charge coverage stays above covenant in the downside case.")
      .closest("article");
    expect(scrollIntoViewMock).toHaveBeenCalledOnce();
    expect(scrollIntoViewMock.mock.contexts[0]).toBe(latestArticle);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });

    scrollIntoViewMock.mockClear();
    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.complete));
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it("shortens the wait and scripted scroll for reduced-motion users", () => {
    vi.useFakeTimers();
    setReducedMotion(true);
    renderIntelligence();

    fireEvent.click(screen.getByRole("button", { name: "Brief me on Meridian Foods" }));
    const activeArticle = screen
      .getByText("Brief me on what changed in Meridian Foods and what still needs analyst judgment.")
      .closest("article");
    expect(scrollIntoViewMock.mock.contexts[0]).toBe(activeArticle);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
    currentStep("Preparing the briefing");
    scrollIntoViewMock.mockClear();
    act(() => vi.advanceTimersByTime(INTELLIGENCE_WORK_TIMING.reducedMotionComplete - 1));
    expect(screen.queryByText(/remains supportable with conditions/i)).toBeNull();
    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByText(/remains supportable with conditions/i)).toBeTruthy();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
