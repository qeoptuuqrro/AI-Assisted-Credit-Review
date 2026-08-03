// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    expect(screen.getByRole("heading", { name: "How to read the financial assessment" })).toBeTruthy();

    const leverage = screen.getByRole("button", { name: /Debt \/ EBITDA/ });
    expect(leverage.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(leverage);
    expect(screen.getByRole("heading", { name: "Why these three financial signals are primary" })).toBeTruthy();
    expect(leverage.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    fireEvent.click(leverage);
    expect(leverage.getAttribute("aria-pressed")).toBe("true");
  }, 15000);

  it("places the same Learning control inside focused source review", () => {
    renderWorkspace(`/credit-reviews/meridian-foods/sources?source=${sources[0].id}`, false);

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    expect(screen.getByRole("heading", { name: "What this focused source review is doing" })).toBeTruthy();

    fireEvent.click(screen.getByRole("heading", { name: "Extracted values" }));
    expect(screen.getByRole("heading", { name: "How extracted values should be reviewed" })).toBeTruthy();
  });

  it("keeps full-screen recommendation authorship inspectable without changing the draft", () => {
    window.sessionStorage.setItem(MERIDIAN_STORAGE_KEY, JSON.stringify(createMeridianPreset("meridian-recommendation-ready", baseActivity)));
    renderWorkspace("/credit-reviews/meridian-foods/recommendation/draft", false);

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    expect(screen.getByRole("heading", { name: "What the recommendation stage does" })).toBeTruthy();

    const proceed = screen.getByRole("radio", { name: /ProceedApprove without additional conditions/ }) as HTMLInputElement;
    expect(proceed.checked).toBe(false);
    fireEvent.click(proceed);
    expect(screen.getByRole("heading", { name: "What the analyst is responsible for authoring" })).toBeTruthy();
    expect(proceed.checked).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    fireEvent.click(proceed);
    expect(proceed.checked).toBe(true);
  });

  it("covers the immersive senior decision and preserves human-owned controls while learning", () => {
    window.sessionStorage.setItem(MERIDIAN_STORAGE_KEY, JSON.stringify(createMeridianPreset("senior-review-ready", baseActivity)));
    renderWorkspace("/credit-reviews/meridian-foods/senior-decision/review", false);

    fireEvent.click(screen.getByRole("button", { name: "Learning mode" }));
    expect(screen.getByRole("heading", { name: "What the senior decision workspace is for" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));

    const returnToAnalyst = screen.getByRole("radio", { name: /Return to analyst/ }) as HTMLInputElement;
    expect(returnToAnalyst.checked).toBe(false);
    fireEvent.click(returnToAnalyst);
    expect(screen.getByRole("heading", { name: "What each senior outcome records" })).toBeTruthy();
    expect(returnToAnalyst.checked).toBe(false);
  });
});

describe("MeridianReviewWorkspace reassessment design routing", () => {
  it("treats a finding source as inspection and returns to V9 evidence confirmation", async () => {
    renderWorkspace("/credit-reviews/meridian-foods/findings/customer-concentration", false);

    fireEvent.click(screen.getByRole("button", { name: "Choose evidence" }));
    fireEvent.click(screen.getByRole("button", { name: /Customer A renewal agreement.*Select/ }));
    fireEvent.click(screen.getByRole("button", { name: "Open document" }));

    expect(screen.getByRole("heading", { name: "Review Customer A renewal agreement" })).toBeTruthy();
    expect(screen.getByText("Evidence for Customer concentration")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What to confirm" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Previous evidence" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Contract term only" })).toBeTruthy();
    expect(screen.getByText("Nothing is verified on this page.", { exact: false })).toBeTruthy();
    expect(screen.queryByText("Compared with")).toBeNull();
    expect(screen.queryByRole("button", { name: "Current evidence" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Return to evidence" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Confirm renewal evidence" })).toBeTruthy();
    });
    const dialog = screen.getByRole("dialog", { name: "Confirm renewal evidence" });
    const steps = within(dialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(steps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(steps).queryByRole("button", { name: "Review" })).toBeNull();
    expect(within(dialog).queryByRole("checkbox")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Confirm and reassess" })).toBeTruthy();
    expect(window.location.pathname).toBe("/credit-reviews/meridian-foods/findings/customer-concentration");
    expect(window.location.search).toBe("");
  }, 15000);

  it("returns ordinary source browsing to the finding without reopening reassessment", async () => {
    const design = "reassessment-v8-evidence-first-decision-review";
    renderWorkspace(`/credit-reviews/meridian-foods/findings/customer-concentration?design=${design}`, false);

    fireEvent.click(screen.getByRole("button", { name: "View source package" }));

    expect(screen.getByRole("heading", { name: "Review Customer concentration report" })).toBeTruthy();
    expect(window.location.search).toContain("fromFinding=customer-concentration");
    expect(window.location.search).toContain(`design=${design}`);
    expect(window.location.search).not.toContain("resumeEvidence");

    fireEvent.click(screen.getByRole("button", { name: "Close evidence and return to finding" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Customer concentration" })).toBeTruthy();
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(window.location.pathname).toBe("/credit-reviews/meridian-foods/findings/customer-concentration");
    expect(window.location.search).toBe(`?design=${design}`);
  }, 15000);

  it("uses the current V9 capacity-first brief on the leverage finding route", () => {
    renderWorkspace("/credit-reviews/meridian-foods/findings/increasing-leverage", false);

    expect(screen.getByRole("region", { name: "Leverage capacity and required verification" })).toBeTruthy();
    expect(screen.queryByText("Verification evidence is required")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add verification evidence" }));

    const dialog = screen.getByRole("dialog", { name: "Provide evidence to verify" });
    expect(dialog.getAttribute("data-presentation")).toBe("editorial");
    expect(screen.queryByLabelText(/^Previewing Finding review/)).toBeNull();
    const steps = within(dialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(steps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(steps).queryByRole("button", { name: "Review" })).toBeNull();
    expect(within(dialog).queryByRole("checkbox")).toBeNull();
  });

  it("keeps the archived V8 evidence-first review addressable by design query", () => {
    renderWorkspace(
      "/credit-reviews/meridian-foods/findings/customer-concentration?design=reassessment-v8-evidence-first-decision-review",
      false,
    );

    expect(screen.getByLabelText("Previewing Finding review V8 — Evidence-first decision review")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Choose evidence" }));

    const dialog = screen.getByRole("dialog", { name: "Choose evidence to verify" });
    expect(dialog.getAttribute("data-presentation")).toBe("editorial");
  });

  it("keeps the archived V7 reassessment addressable by design query", () => {
    renderWorkspace(
      "/credit-reviews/meridian-foods/findings/customer-concentration?design=reassessment-v7-attributable-decision-review",
      false,
    );

    expect(screen.getByLabelText("Previewing Finding review V7 — Structured decision review")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Review renewal" }));

    const dialog = screen.getByRole("dialog", { name: "Review the matched renewal" });
    expect(dialog.getAttribute("data-presentation")).toBe("standard");
    expect(screen.getByRole("button", { name: "Verify & reassess" })).toBeTruthy();
  });
});
