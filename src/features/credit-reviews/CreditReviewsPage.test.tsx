// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "../../app/router";
import { CreditReviewsPage } from "./CreditReviewsPage";

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/credit-reviews?focus=needs-judgment");
  Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("CreditReviewsPage case-status focus", () => {
  it("shows only cases with an explicit material judgment", () => {
    render(<RouterProvider><CreditReviewsPage /></RouterProvider>);

    expect(screen.getByText("Meridian Foods")).toBeTruthy();
    expect(screen.getByText("Brightline Energy")).toBeTruthy();
    expect(screen.getByText("Cedar Ridge Packaging")).toBeTruthy();
    expect(screen.getAllByText("Needs judgment")).toHaveLength(3);
    expect(screen.queryByText("Northstar Health")).toBeNull();
    expect(screen.queryByText("Lakeview Medical")).toBeNull();
  });
});

describe("CreditReviewsPage incremental all-review queue", () => {
  it("loads ten more rows when the scroll sentinel enters view", () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/credit-reviews");

    let intersect: IntersectionObserverCallback = () => undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];

      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }

      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<RouterProvider><CreditReviewsPage /></RouterProvider>);
    fireEvent.click(screen.getByRole("tab", { name: "All reviews 68" }));

    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(15);
    expect(screen.queryByText("Bluewater Hospitality")).toBeNull();
    expect(observe).toHaveBeenCalledTimes(1);

    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByRole("status").textContent).toBe("Loading 10 more reviews");
    expect(within(table).getAllByRole("row")).toHaveLength(15);

    act(() => vi.advanceTimersByTime(500));
    expect(within(table).getAllByRole("row")).toHaveLength(25);
    expect(screen.getByText("Bluewater Hospitality")).toBeTruthy();
    expect(screen.getByText("10 more reviews loaded. Showing 24 of 68")).toBeTruthy();

    const placeholderRow = screen.getByText("Bluewater Hospitality").closest("tr");
    expect(placeholderRow?.getAttribute("tabindex")).toBeNull();
    expect(placeholderRow?.getAttribute("aria-label")).toBeNull();
    expect(disconnect).toHaveBeenCalled();
  });

  it("filters the full 68 cases before applying the visible-row limit", () => {
    window.history.replaceState({}, "", "/credit-reviews");
    render(<RouterProvider><CreditReviewsPage /></RouterProvider>);
    fireEvent.click(screen.getByRole("tab", { name: "All reviews 68" }));
    fireEvent.click(screen.getByRole("button", { name: "Completed7" }));

    expect(screen.getByText("Oakridge Services")).toBeTruthy();
    expect(screen.getByText("Alpine Pharma")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Load 10 more" })).toBeNull();
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(7);
  });
});
