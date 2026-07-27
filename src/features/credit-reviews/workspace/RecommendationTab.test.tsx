// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecommendationTab } from "./RecommendationTab";

const findingStates = {
  "customer-concentration": "review_complete",
  "declining-margins": "review_complete",
  "increasing-leverage": "review_complete",
} as const;

const reassessedFindings = {
  "customer-concentration": false,
  "declining-margins": false,
  "increasing-leverage": false,
};

const recommendation = {
  decision: "Proceed with conditions",
  amount: "$18,000,000",
  rationale: "Repayment remains supportable with concentration reporting, leverage, and coverage protections.",
  conditions: ["Quarterly customer-concentration reporting", "Maximum total leverage of 4.25x"],
  author: "Alex Kim",
  createdAt: "2026-07-26T14:30:00.000Z",
};

afterEach(cleanup);

describe("RecommendationTab senior decision", () => {
  it("keeps a returned recommendation durable and offers an accountable revision action", () => {
    const onReopen = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        seniorVariant="command-center"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        seniorDecision={{ decision: "return_to_analyst", rationale: "Clarify reporting ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-26T16:30:00.000Z" }}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onReopenReturnedRecommendation={onReopen}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("Revision requested")).toBeTruthy();
    expect(screen.getByText("Clarify reporting ownership.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Revise recommendation" }));
    expect(onReopen).toHaveBeenCalledOnce();
  });

  it("renders the focused senior layer with supporting AI collapsed", () => {
    render(
      <RecommendationTab
        seniorVariant="focused-layer"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Review analyst recommendation" })).toBeTruthy();
    expect(screen.getByText("Final approval conditions")).toBeTruthy();
    expect(screen.getByText("Supporting AI assessment").closest("details")?.open).toBe(false);
  });

  it("shows approval conditions only for a conditional approval", () => {
    render(
      <RecommendationTab
        seniorVariant="focused-layer"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Approve" }));
    expect(screen.queryByText("Final approval conditions")).toBeNull();
    expect((screen.getByRole("button", { name: "Approve facility" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("keeps the previous dense senior view addressable as V1", () => {
    render(
      <RecommendationTab
        seniorVariant="dense-brief"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Review the same case record" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Review analyst recommendation" })).toBeNull();
  });
});

describe("RecommendationTab focused lifecycle", () => {
  it("shows an addressable prerequisite gate with a direct path back to unresolved work", () => {
    const onNavigate = vi.fn();
    render(
      <RecommendationTab
        variant="focused-lifecycle"
        routeMode="recommendation"
        findingStates={{
          "customer-concentration": "needs_judgment",
          "declining-margins": "review_complete",
          "increasing-leverage": "needs_verification",
        }}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByRole("heading", { name: "Finish the review before drafting the handoff" })).toBeTruthy();
    expect(screen.getByText("2 steps remaining")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue review" }));
    expect(onNavigate).toHaveBeenCalledWith("findings");
  });

  it("uses focused guided authorship with case context closed by default", () => {
    render(
      <RecommendationTab
        variant="focused-lifecycle"
        routeMode="recommendation"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Prepare the recommendation" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Case context" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Case context" }));
    expect(screen.getByRole("heading", { name: "Case context" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close case context" })).toBeTruthy();
  });

  it("returns a submitted recommendation as a durable record before senior review", () => {
    const onOpenSeniorReview = vi.fn();
    render(
      <RecommendationTab
        variant="focused-lifecycle"
        routeMode="recommendation"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onOpenSeniorReview={onOpenSeniorReview}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("The draft is closed. Alex Kim’s submitted recommendation is now a durable case record.")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Review analyst recommendation" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open senior review" }));
    expect(onOpenSeniorReview).toHaveBeenCalledOnce();
  });
});

describe("RecommendationTab full-screen lifecycle", () => {
  it("launches a ready recommendation from the durable case route", () => {
    const onStartRecommendation = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        routeMode="recommendation"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onStartRecommendation={onStartRecommendation}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Turn the completed review into one decision story" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start recommendation" }));
    expect(onStartRecommendation).toHaveBeenCalledOnce();
  });

  it("resumes the exact section and autosaves the next section", () => {
    const onSaveDraft = vi.fn();
    const onExitRecommendation = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        routeMode="recommendation-draft"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendationDraft={{
          decision: "Proceed with conditions",
          amount: "$18,000,000",
          rationale: "Saved rationale",
          conditions: recommendation.conditions,
          activeSection: 3,
          updatedAt: "2026-07-26T15:30:00.000Z",
        }}
        onSaveDraft={onSaveDraft}
        onSubmit={vi.fn()}
        onSeniorDecision={vi.fn()}
        onExitRecommendation={onExitRecommendation}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Explain why this posture is supportable" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSaveDraft).toHaveBeenLastCalledWith(expect.objectContaining({ activeSection: 4 }));
    fireEvent.click(screen.getByRole("button", { name: "Exit and save" }));
    expect(onExitRecommendation).toHaveBeenCalledOnce();
  });

  it("submits the completed full-screen analyst draft", () => {
    const onSubmit = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        routeMode="recommendation-draft"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendationDraft={{
          decision: "Proceed with conditions",
          amount: "$18,000,000",
          rationale: "Saved rationale",
          conditions: recommendation.conditions,
          activeSection: 4,
          updatedAt: "2026-07-26T15:30:00.000Z",
        }}
        onSaveDraft={vi.fn()}
        onSubmit={onSubmit}
        onSeniorDecision={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit for senior review" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rationale: "Saved rationale", amount: "$18,000,000" }));
  });

  it("resumes and autosaves the full-screen senior decision", () => {
    const onSaveSeniorDraft = vi.fn();
    const onExitSeniorReview = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        seniorVariant="full-screen-review"
        routeMode="senior-review"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        seniorDecisionDraft={{ decision: "approve_with_conditions", rationale: "Saved senior note", conditions: recommendation.conditions, updatedAt: "2026-07-26T16:00:00.000Z" }}
        onSubmit={vi.fn()}
        onSaveSeniorDraft={onSaveSeniorDraft}
        onSeniorDecision={vi.fn()}
        onExitSeniorReview={onExitSeniorReview}
        onNavigate={vi.fn()}
      />,
    );

    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Saved senior note");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Updated senior note" } });
    expect(onSaveSeniorDraft).toHaveBeenLastCalledWith(expect.objectContaining({ rationale: "Updated senior note" }));
    fireEvent.click(screen.getByRole("button", { name: "Exit and save" }));
    expect(onExitSeniorReview).toHaveBeenCalledOnce();
  });

  it("keeps the V4 command center accountable and validates conditional approval", () => {
    const onSaveSeniorDraft = vi.fn();
    const onSeniorDecision = vi.fn();
    render(
      <RecommendationTab
        variant="full-screen-lifecycle"
        seniorVariant="command-center"
        routeMode="senior-review"
        findingStates={findingStates}
        judgments={[]}
        reassessedFindings={reassessedFindings}
        recommendation={recommendation}
        seniorDecisionDraft={{ decision: "return_to_analyst", rationale: "", conditions: [], updatedAt: "2026-07-26T16:00:00.000Z" }}
        onSubmit={vi.fn()}
        onSaveSeniorDraft={onSaveSeniorDraft}
        onSeniorDecision={onSeniorDecision}
        onExitSeniorReview={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Finalize the credit decision" })).toBeTruthy();
    expect(screen.getByText("Supporting AI assessment").closest("details")?.open).toBe(false);
    expect((screen.getByRole("button", { name: "Return to analyst" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "Approve with conditions" }));
    expect(screen.getByRole("group", { name: "Final protections 0 selected" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "Record conditional approval" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("checkbox", { name: "Maximum total leverage of 4.25x" }));
    expect(onSaveSeniorDraft).toHaveBeenLastCalledWith(expect.objectContaining({ conditions: ["Maximum total leverage of 4.25x"] }));
    fireEvent.click(screen.getByRole("button", { name: "Record conditional approval" }));
    expect(onSeniorDecision).toHaveBeenCalledWith(expect.objectContaining({ decision: "approve_with_conditions", conditions: ["Maximum total leverage of 4.25x"] }));
  });
});
