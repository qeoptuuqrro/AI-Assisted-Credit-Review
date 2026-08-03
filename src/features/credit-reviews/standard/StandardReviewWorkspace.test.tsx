// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "../../../app/router";
import { ReviewBookmarksProvider } from "../bookmarks/ReviewBookmarks";
import { StandardReviewWorkspace } from "./StandardReviewWorkspace";
import { standardReviewStorageKey, type StandardReviewWorkflowState } from "./standardReviewState";

const apexRecommendation = {
  decision: "Approve with conditions",
  amount: "$20M term loan",
  rationale: "Contracted backlog, manageable leverage, and resilient downside coverage support the expansion request.",
  conditions: ["Maximum total leverage of 3.70x", "Minimum DSCR of 1.20x", "Construction draw controls and 10% contingency"],
  author: "Alex Kim",
  createdAt: "2026-07-27T12:00:00.000Z",
};

const returnedDecision = {
  decision: "return_to_analyst" as const,
  rationale: "Clarify covenant ownership before resubmitting.",
  conditions: [],
  decisionMaker: "Morgan Lee",
  createdAt: "2026-07-27T12:01:00.000Z",
};

function returnedState(): StandardReviewWorkflowState {
  return {
    version: 1,
    reviewedFindingIds: [],
    recommendationSubmitted: true,
    recommendation: apexRecommendation,
    recommendationHistory: [apexRecommendation],
    seniorDecision: returnedDecision,
    decisionHistory: [returnedDecision],
  };
}

function renderWorkspace(path = "/credit-reviews/apex-manufacturing") {
  window.history.replaceState({}, "", path);
  return render(
    <RouterProvider>
      <ReviewBookmarksProvider>
        <StandardReviewWorkspace />
      </ReviewBookmarksProvider>
    </RouterProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/credit-reviews/apex-manufacturing");
  Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("standard review Overview", () => {
  it("turns Apex metrics into policy headroom and opens the focused decision", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { name: "Policy headroom" })).toBeTruthy();
    expect(screen.getByText("Capacity remains inside policy")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Pro forma leverage: 3\.1x.*0\.6x below maximum.*3\.70x policy maximum/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Downside DSCR: 1\.34x.*0\.14x above minimum.*1\.20x policy minimum/i })).toBeTruthy();
    expect(screen.getByText("$68M")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Decision metrics" })).toBeNull();
    expect(screen.getByRole("tab", { name: /^Findings\s*0$/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Review open finding" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Review decision" }));
    expect(window.location.pathname).toBe("/credit-reviews/apex-manufacturing/senior-decision/review");
  });

  it("routes a returned case from Overview to analyst revision instead of the senior decision", () => {
    window.sessionStorage.setItem(standardReviewStorageKey("apex-manufacturing"), JSON.stringify(returnedState()));
    renderWorkspace();

    expect(screen.getAllByText("Revision requested").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "View decision record" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Revise recommendation" }));
    expect(window.location.pathname).toBe("/credit-reviews/apex-manufacturing/recommendation");
  });

  it("preserves the returned record while the analyst edits and resubmits a prefilled revision", async () => {
    window.sessionStorage.setItem(standardReviewStorageKey("apex-manufacturing"), JSON.stringify(returnedState()));
    renderWorkspace("/credit-reviews/apex-manufacturing/recommendation");

    expect(screen.getAllByText("Returned to analyst").length).toBeGreaterThan(0);
    expect(screen.getByText(/Clarify covenant ownership before resubmitting\./)).toBeTruthy();
    expect(screen.queryByText("Decision recorded")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Revise recommendation" }));

    expect(screen.getAllByText("Revision in progress").length).toBeGreaterThan(0);
    const posture = screen.getByRole("textbox", { name: /Recommendation posture/i }) as HTMLInputElement;
    const rationale = screen.getByRole("textbox", { name: /Analyst rationale/i }) as HTMLTextAreaElement;
    const leverageCondition = screen.getByRole("checkbox", { name: "Maximum total leverage of 3.70x" }) as HTMLInputElement;
    expect(posture.value).toBe(apexRecommendation.decision);
    expect(rationale.value).toBe(apexRecommendation.rationale);
    expect(leverageCondition.checked).toBe(true);

    fireEvent.change(posture, { target: { value: "Approve with tighter controls" } });
    fireEvent.change(rationale, { target: { value: "Covenant ownership is assigned to the controller and documented in the reporting package." } });
    fireEvent.click(leverageCondition);

    expect(screen.getByRole("button", { name: "Submit revised recommendation" })).toBeTruthy();
    expect(screen.queryByText("Awaiting senior decision")).toBeNull();
    await waitFor(() => {
      const persisted = JSON.parse(window.sessionStorage.getItem(standardReviewStorageKey("apex-manufacturing")) ?? "null") as StandardReviewWorkflowState | null;
      expect(persisted?.recommendationSubmitted).toBe(false);
      expect(persisted?.recommendation).toBeUndefined();
      expect(persisted?.recommendationDraft).toMatchObject({
        decision: "Approve with tighter controls",
        rationale: "Covenant ownership is assigned to the controller and documented in the reporting package.",
        conditions: ["Minimum DSCR of 1.20x", "Construction draw controls and 10% contingency"],
      });
      expect(persisted?.recommendationHistory).toEqual([apexRecommendation]);
      expect(persisted?.seniorDecision).toBeUndefined();
      expect(persisted?.decisionHistory?.[0]).toMatchObject({
        decision: "return_to_analyst",
        rationale: "Clarify covenant ownership before resubmitting.",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit revised recommendation" }));
    await waitFor(() => {
      const persisted = JSON.parse(window.sessionStorage.getItem(standardReviewStorageKey("apex-manufacturing")) ?? "null") as StandardReviewWorkflowState | null;
      expect(persisted?.recommendationSubmitted).toBe(true);
      expect(persisted?.recommendationDraft).toBeUndefined();
      expect(persisted?.recommendation).toMatchObject({
        decision: "Approve with tighter controls",
        rationale: "Covenant ownership is assigned to the controller and documented in the reporting package.",
        conditions: ["Minimum DSCR of 1.20x", "Construction draw controls and 10% contingency"],
      });
      expect(persisted?.recommendationHistory).toHaveLength(2);
      expect(persisted?.recommendationHistory?.[1]).toEqual(apexRecommendation);
      expect(persisted?.decisionHistory?.[0].rationale).toBe(returnedDecision.rationale);
    });
  });

  it("keeps the senior return rationale in Activity after the recommendation is reopened", () => {
    const state = returnedState();
    state.recommendationSubmitted = false;
    state.recommendationDraft = {
      decision: apexRecommendation.decision,
      amount: apexRecommendation.amount,
      rationale: apexRecommendation.rationale,
      conditions: apexRecommendation.conditions,
      activeSection: 1,
      updatedAt: "2026-07-27T12:02:00.000Z",
    };
    state.recommendation = undefined;
    state.seniorDecision = undefined;
    window.sessionStorage.setItem(standardReviewStorageKey("apex-manufacturing"), JSON.stringify(state));
    renderWorkspace("/credit-reviews/apex-manufacturing/activity");

    expect(screen.getByText(/Returned to analyst · Clarify covenant ownership before resubmitting\./)).toBeTruthy();
    expect(screen.getByText("Morgan Lee returned the recommendation to the analyst")).toBeTruthy();
  });

  it("places immutable completed findings in Addressed without a review toggle", () => {
    renderWorkspace("/credit-reviews/apex-manufacturing/findings");

    expect(screen.getByRole("region", { name: "Addressed findings" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Open findings" })).toBeNull();
    expect(screen.getAllByText("Complete").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Mark reviewed" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove review mark" })).toBeNull();
  });

  it("does not describe immutable completed findings as requiring review in the archived layout", () => {
    renderWorkspace("/credit-reviews/apex-manufacturing/findings?design=standard-findings-v1-layout-lab");

    expect(screen.queryByText("Requires review")).toBeNull();
    expect(screen.getByText("0 open")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Mark reviewed" })).toBeNull();
  });
});
