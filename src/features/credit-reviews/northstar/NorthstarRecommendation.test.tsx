// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialNorthstarState, type NorthstarReviewState } from "../workflow/creditReviewState";
import { NorthstarRecommendation } from "./NorthstarRecommendation";

afterEach(cleanup);

describe("NorthstarRecommendation", () => {
  it("presents the ready draft as one owned recommendation surface", () => {
    const reviewState: NorthstarReviewState = {
      ...createInitialNorthstarState(),
      request: { ...createInitialNorthstarState().request, status: "ready" as const },
      evidenceReviewState: "verified_by_analyst" as const,
      analysisUpdated: true,
      analysisReviewState: "completed" as const,
    };

    render(
      <NorthstarRecommendation
        reviewState={reviewState}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onReopenReturnedRecommendation={vi.fn()}
        onOpenSeniorReview={vi.fn()}
      />,
    );

    expect(screen.getByText("2 of 3 complete")).toBeTruthy();
    expect(screen.queryByText("AI-assisted draft · Analyst editable")).toBeNull();
    expect(screen.getByRole("region", { name: "Handoff readiness" })).toBeTruthy();

    const recommendation = screen.getByRole("region", { name: "Proceed with conditions" });
    expect(within(recommendation).getByText("Draft recommendation · Analyst editable")).toBeTruthy();
    const action = within(recommendation).getByRole("button", { name: "Prepare recommendation" });
    expect(action.closest("footer")).toBeTruthy();

    fireEvent.click(action);
    expect(screen.getByRole("complementary", { name: "Submit recommendation" })).toBeTruthy();
  });

  it("keeps final senior-decision copy and conditions attributable", () => {
    const initial = createInitialNorthstarState();
    const reviewState: NorthstarReviewState = {
      ...initial,
      request: { ...initial.request, status: "ready" as const },
      evidenceReviewState: "verified_by_analyst" as const,
      analysisUpdated: true,
      analysisReviewState: "completed" as const,
      recommendation: {
        decision: "Proceed with conditions",
        amount: "$15,000,000",
        rationale: "Analyst rationale should stay with the submitted recommendation.",
        conditions: ["Quarterly compliance reporting"],
        author: "Alex Kim",
        createdAt: "2026-08-01T12:00:00.000Z",
      },
      seniorDecision: {
        decision: "approve",
        rationale: "",
        conditions: [],
        decisionMaker: "Morgan Lee",
        createdAt: "2026-08-01T13:00:00.000Z",
      },
    };

    render(
      <NorthstarRecommendation
        reviewState={reviewState}
        onNavigate={vi.fn()}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onReopenReturnedRecommendation={vi.fn()}
        onOpenSeniorReview={vi.fn()}
      />,
    );

    const recommendation = screen.getByRole("region", { name: "Approved" });
    expect(within(recommendation).getByText("No additional senior rationale was recorded.")).toBeTruthy();
    expect(within(recommendation).getByText("No additional conditions recorded.")).toBeTruthy();
    expect(within(recommendation).queryByText("Analyst rationale should stay with the submitted recommendation.")).toBeNull();
    expect(within(recommendation).queryByText("Quarterly compliance reporting")).toBeNull();
  });
});
