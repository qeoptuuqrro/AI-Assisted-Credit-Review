// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppUtilityActionsProvider } from "../../../app/AppUtilityActions";
import { RouterProvider } from "../../../app/router";
import { ReviewBookmarksProvider } from "../bookmarks/ReviewBookmarks";
import { createMeridianPreset } from "../workflow/creditReviewState";
import { MERIDIAN_STORAGE_KEY } from "../workflow/usePersistentReviewState";
import { baseActivity, sources } from "./meridianData";
import { MeridianReviewWorkspace } from "./MeridianReviewWorkspace";

function renderWorkspace(path: string, withUtilityBar = true) {
  window.history.replaceState({}, "", path);
  const utilityTarget = withUtilityBar ? document.createElement("div") : null;
  if (utilityTarget) {
    utilityTarget.dataset.testUtilityTarget = "true";
    document.body.append(utilityTarget);
  }

  return render(
    <RouterProvider>
      <ReviewBookmarksProvider>
        <AppUtilityActionsProvider target={utilityTarget}>
          <MeridianReviewWorkspace />
        </AppUtilityActionsProvider>
      </ReviewBookmarksProvider>
    </RouterProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  document.querySelectorAll("[data-test-utility-target]").forEach((node) => node.remove());
});

describe("MeridianReviewWorkspace Learning Mode", () => {
  it("explains Financials, intercepts workflow interaction, and restores it when disabled", () => {
    renderWorkspace("/credit-reviews/meridian-foods/financials");

    fireEvent.click(screen.getByRole("button", { name: "Learn this page" }));
    expect(screen.getByRole("heading", { name: "How to read the financial assessment" })).toBeTruthy();

    const leverage = screen.getByRole("button", { name: /Debt \/ EBITDA/ });
    expect(leverage.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(leverage);
    expect(screen.getByRole("heading", { name: "Why these three financial signals are primary" })).toBeTruthy();
    expect(leverage.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Learning on" }));
    fireEvent.click(leverage);
    expect(leverage.getAttribute("aria-pressed")).toBe("true");
  });

  it("places the same Learning control inside focused source review", () => {
    renderWorkspace(`/credit-reviews/meridian-foods/sources?source=${sources[0].id}`, false);

    fireEvent.click(screen.getByRole("button", { name: "Learn this page" }));
    expect(screen.getByRole("heading", { name: "What this focused source review is doing" })).toBeTruthy();

    fireEvent.click(screen.getByRole("heading", { name: "Extracted values" }));
    expect(screen.getByRole("heading", { name: "How extracted values should be reviewed" })).toBeTruthy();
  });

  it("keeps full-screen recommendation authorship inspectable without changing the draft", () => {
    window.sessionStorage.setItem(MERIDIAN_STORAGE_KEY, JSON.stringify(createMeridianPreset("meridian-recommendation-ready", baseActivity)));
    renderWorkspace("/credit-reviews/meridian-foods/recommendation/draft", false);

    fireEvent.click(screen.getByRole("button", { name: "Learn this page" }));
    expect(screen.getByRole("heading", { name: "What the recommendation stage does" })).toBeTruthy();

    const proceed = screen.getByRole("radio", { name: /ProceedApprove without additional conditions/ }) as HTMLInputElement;
    expect(proceed.checked).toBe(false);
    fireEvent.click(proceed);
    expect(screen.getByRole("heading", { name: "What the analyst is responsible for authoring" })).toBeTruthy();
    expect(proceed.checked).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Learning on" }));
    fireEvent.click(proceed);
    expect(proceed.checked).toBe(true);
  });

  it("covers the immersive senior decision and preserves human-owned controls while learning", () => {
    window.sessionStorage.setItem(MERIDIAN_STORAGE_KEY, JSON.stringify(createMeridianPreset("senior-review-ready", baseActivity)));
    renderWorkspace("/credit-reviews/meridian-foods/senior-decision/review", false);

    fireEvent.click(screen.getByRole("button", { name: "Learn this page" }));
    expect(screen.getByRole("heading", { name: "What the senior decision workspace is for" })).toBeTruthy();

    const returnToAnalyst = screen.getByRole("radio", { name: /Return to analyst/ }) as HTMLInputElement;
    expect(returnToAnalyst.checked).toBe(false);
    fireEvent.click(returnToAnalyst);
    expect(screen.getByRole("heading", { name: "What each senior outcome records" })).toBeTruthy();
    expect(returnToAnalyst.checked).toBe(false);
  });
});
