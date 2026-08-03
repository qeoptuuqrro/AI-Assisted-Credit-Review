import { describe, expect, it } from "vitest";
import {
  applyCreditReviewWorkflowState,
  getCreditActivityPresentation,
  getCreditFindingIcon,
  getCreditSourceIcon,
} from "./creditReviewPresentation";
import { reviews } from "./reviewData";
import { createInitialStandardReviewState, standardReviewReducer } from "./standard/standardReviewState";
import { createInitialMeridianState, createInitialNorthstarState, createMeridianPreset, createNorthstarPreset } from "./workflow/creditReviewState";

const standardRecommendation = {
  decision: "Approve with conditions",
  amount: "$20M term loan",
  rationale: "The submitted case supports the facility with the listed protections.",
  conditions: ["Minimum DSCR of 1.20x"],
  author: "Alex Kim",
  createdAt: "2026-07-27T11:00:00.000Z",
};

const returnedStandardDecision = {
  decision: "return_to_analyst" as const,
  rationale: "Clarify covenant ownership.",
  conditions: [],
  decisionMaker: "Morgan Lee",
  createdAt: "2026-07-27T12:00:00.000Z",
};

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

  it("uses the dominant next action for mixed and blocked cases", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const northstar = reviews.find((review) => review.slug === "northstar-health")!;

    expect(applyCreditReviewWorkflowState(
      meridian,
      createInitialMeridianState(),
      createInitialNorthstarState(),
    )).toMatchObject({ caseStatus: "analyst-review" });
    expect(applyCreditReviewWorkflowState(
      northstar,
      createInitialMeridianState(),
      createInitialNorthstarState(),
    )).toMatchObject({ caseStatus: "needs-verification" });
  });

  it("keeps the seeded ready-to-recommend case attributable to analyst review", () => {
    const atlas = reviews.find((review) => review.slug === "atlas-logistics")!;

    expect(atlas).toMatchObject({
      aiReviewState: "review-complete",
      caseStatus: "ready-to-recommend",
      status: "in-review",
    });
    expect(atlas.details?.findings.every((finding) => finding.status === "Complete")).toBe(true);
    expect(atlas.details?.activity.some((item) => item.tone === "human" && item.title === "Fleet-renewal finding reviewed")).toBe(true);
    expect(atlas.details?.recommendation.nextStep).toBe("Prepare and submit the analyst recommendation.");
  });

  it("projects submitted recommendations into the shared queue status", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const northstar = reviews.find((review) => review.slug === "northstar-health")!;
    const meridianReady = applyCreditReviewWorkflowState(meridian, createMeridianPreset("senior-review-ready"), createInitialNorthstarState());
    const northstarReady = applyCreditReviewWorkflowState(northstar, createInitialMeridianState(), createNorthstarPreset("northstar-senior-review"));

    expect(meridianReady).toMatchObject({ status: "ready-for-decision", caseStatus: "awaiting-decision", aiReviewState: "review-complete" });
    expect(northstarReady).toMatchObject({ status: "ready-for-decision", caseStatus: "awaiting-decision", aiReviewState: "review-complete" });
  });

  it("projects final senior decisions into completed queue records", () => {
    const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
    const state = createMeridianPreset("senior-review-ready");
    state.seniorDecision = { decision: "approve_with_conditions", rationale: "Approved under the submitted protections.", conditions: state.recommendation?.conditions ?? [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:00:00.000Z" };

    expect(applyCreditReviewWorkflowState(meridian, state, createInitialNorthstarState())).toMatchObject({
      status: "completed",
      caseStatus: "approved",
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
      caseStatus: "revision-requested",
    });
    expect(applyCreditReviewWorkflowState(northstar, createInitialMeridianState(), northstarState)).toMatchObject({
      status: "needs-attention",
      caseStatus: "revision-requested",
    });
  });

  it("projects a returned standard decision into analyst attention rather than completion", () => {
    const apex = reviews.find((review) => review.slug === "apex-manufacturing")!;
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: standardRecommendation });
    const returned = standardReviewReducer(submitted, { type: "record_senior_decision", record: returnedStandardDecision });

    expect(applyCreditReviewWorkflowState(
      apex,
      createInitialMeridianState(),
      createInitialNorthstarState(),
      { "apex-manufacturing": returned },
    )).toMatchObject({
      status: "needs-attention",
      caseStatus: "revision-requested",
      aiReviewState: "review-complete",
    });
  });

  it("projects a reopened standard recommendation as revision in progress, not resubmitted", () => {
    const apex = reviews.find((review) => review.slug === "apex-manufacturing")!;
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: standardRecommendation });
    const returned = standardReviewReducer(submitted, { type: "record_senior_decision", record: returnedStandardDecision });
    const reopened = standardReviewReducer(returned, { type: "reopen_returned_recommendation" });

    expect(reopened.recommendationSubmitted).toBe(false);
    expect(applyCreditReviewWorkflowState(
      apex,
      createInitialMeridianState(),
      createInitialNorthstarState(),
      { "apex-manufacturing": reopened },
    )).toMatchObject({
      status: "in-review",
      caseStatus: "revision-requested",
      aiReviewState: "review-complete",
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
      caseStatus: "revision-requested",
    });
  });

  it("keeps completed fixture findings out of the open-finding count", () => {
    const oakridge = reviews.find((review) => review.slug === "oakridge-services")!;
    const openFindings = oakridge.details?.findings.filter((finding) => finding.status !== "Complete") ?? [];

    expect(oakridge).toMatchObject({ status: "completed", aiReviewState: "review-complete" });
    expect(openFindings).toHaveLength(0);
  });
});
