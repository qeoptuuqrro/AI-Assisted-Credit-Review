import { describe, expect, it } from "vitest";
import {
  applyCreditReviewWorkflowState,
  getCreditActivityPresentation,
  getCreditFindingIcon,
  getCreditSourceIcon,
} from "./creditReviewPresentation";
import { reviews } from "./reviewData";
import { createInitialMeridianState, createInitialNorthstarState, createMeridianPreset, createNorthstarPreset } from "./workflow/creditReviewState";

describe("credit review presentation semantics", () => {
  it("keeps a finding icon stable across every surface", () => {
    expect(getCreditFindingIcon({ id: "customer-concentration" })).toBe("users");
    expect(getCreditFindingIcon({ id: "debt-omission" })).toBe("scale");
    expect(getCreditFindingIcon({ id: "unknown-finding" })).toBe("alertCircle");
  });

  it("uses one document glyph for every evidence category and format", () => {
    expect(getCreditSourceIcon({ type: "Financial statements" })).toBe("document");
    expect(getCreditSourceIcon({ type: "Bank data" })).toBe("document");
    expect(getCreditSourceIcon({ name: "2027 Operating Forecast" })).toBe("document");
    expect(getCreditSourceIcon({ type: "Credit documents", name: "Debt schedule" })).toBe("document");
    expect(getCreditSourceIcon({ name: "Executed credit approval" })).toBe("document");
  });

  it("keeps event ownership separate from warning outcome", () => {
    expect(getCreditActivityPresentation("ai")).toEqual({ icon: "refresh", tone: "neutral" });
    expect(getCreditActivityPresentation("human")).toEqual({ icon: "user", tone: "neutral" });
    expect(getCreditActivityPresentation("evidence", true)).toEqual({ icon: "alertCircle", tone: "warning" });
    expect(getCreditActivityPresentation("decision")).toEqual({ icon: "checkCircle", tone: "success" });
  });

  it("projects submitted recommendations into the shared queue status", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const northstar = reviews.find((review) => review.slug === "northstar-health")!;
    const meridianReady = applyCreditReviewWorkflowState(meridian, createMeridianPreset("senior-review-ready"), createInitialNorthstarState());
    const northstarReady = applyCreditReviewWorkflowState(northstar, createInitialMeridianState(), createNorthstarPreset("northstar-senior-review"));

    expect(meridianReady).toMatchObject({ status: "ready-for-decision", statusLabel: "Awaiting senior decision", aiReviewState: "review-complete" });
    expect(northstarReady).toMatchObject({ status: "ready-for-decision", statusLabel: "Awaiting senior decision", aiReviewState: "review-complete" });
  });

  it("projects final senior decisions into completed queue records", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const state = createMeridianPreset("senior-review-ready");
    state.seniorDecision = { decision: "approve_with_conditions", rationale: "Approved under the submitted protections.", conditions: state.recommendation?.conditions ?? [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:00:00.000Z" };

    expect(applyCreditReviewWorkflowState(meridian, state, createInitialNorthstarState())).toMatchObject({
      status: "completed",
      statusLabel: "Approved with conditions",
      aiReviewState: "review-complete",
    });
  });

  it("projects a returned recommendation back into analyst attention", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const northstar = reviews.find((review) => review.slug === "northstar-health")!;
    const meridianState = createMeridianPreset("senior-review-ready");
    const northstarState = createNorthstarPreset("northstar-senior-review");
    const returnedDecision = { decision: "return_to_analyst" as const, rationale: "Clarify covenant ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:00:00.000Z" };
    meridianState.seniorDecision = returnedDecision;
    northstarState.seniorDecision = returnedDecision;

    expect(applyCreditReviewWorkflowState(meridian, meridianState, createInitialNorthstarState())).toMatchObject({
      status: "needs-attention",
      statusLabel: "Returned to analyst",
      statusTone: "warning",
    });
    expect(applyCreditReviewWorkflowState(northstar, createInitialMeridianState(), northstarState)).toMatchObject({
      status: "needs-attention",
      statusLabel: "Returned to analyst",
      statusTone: "warning",
    });
  });

  it("distinguishes an active Meridian revision from a generic recommendation-ready state", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const state = createMeridianPreset("senior-review-ready");
    const priorRecommendation = state.recommendation!;
    const returnedDecision = { decision: "return_to_analyst" as const, rationale: "Clarify covenant ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:00:00.000Z" };
    state.recommendationHistory = [priorRecommendation];
    state.decisionHistory = [returnedDecision];
    state.recommendation = undefined;
    state.seniorDecision = undefined;
    state.recommendationDraft = { decision: priorRecommendation.decision, amount: priorRecommendation.amount, rationale: priorRecommendation.rationale, conditions: priorRecommendation.conditions, activeSection: 1, updatedAt: "2026-07-27T12:05:00.000Z" };

    expect(applyCreditReviewWorkflowState(meridian, state, createInitialNorthstarState())).toMatchObject({
      status: "in-review",
      statusLabel: "Revision in progress",
      statusTone: "info",
    });
  });
});
