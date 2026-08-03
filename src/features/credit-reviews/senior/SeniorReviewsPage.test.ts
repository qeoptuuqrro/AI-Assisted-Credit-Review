import { describe, expect, it } from "vitest";
import { createInitialNorthstarState, createMeridianPreset, createNorthstarPreset, meridianReviewReducer } from "../workflow/creditReviewState";
import { buildSeniorQueueItems, compactRecommendationLabel, compactRecommendationTone, getStageTabsScrollCue, matchesSeniorQueueSearch } from "./SeniorReviewsPage";

describe("senior review queue projection", () => {
  it("moves returned decisions to Waiting on analyst instead of Decided", () => {
    const meridianState = createMeridianPreset("senior-review-ready");
    meridianState.seniorDecision = {
      decision: "return_to_analyst",
      rationale: "Clarify covenant ownership.",
      conditions: [],
      decisionMaker: "Morgan Lee",
      createdAt: "2026-07-27T12:00:00.000Z",
    };

    const meridian = buildSeniorQueueItems(meridianState, createInitialNorthstarState()).find((item) => item.id === "meridian-foods");

    expect(meridian).toMatchObject({
      stage: "waiting",
      statusLabel: "Revision requested",
      recommendationTitle: "Revision requested",
      recommendationRationale: "Clarify covenant ownership.",
    });
  });

  it("uses the same waiting-stage contract for Northstar", () => {
    const northstarState = createNorthstarPreset("northstar-senior-review");
    northstarState.seniorDecision = {
      decision: "return_to_analyst",
      rationale: "Clarify forecast reporting ownership.",
      conditions: [],
      decisionMaker: "Morgan Lee",
      createdAt: "2026-07-27T12:00:00.000Z",
    };

    const northstar = buildSeniorQueueItems(createMeridianPreset("senior-review-ready"), northstarState).find((item) => item.id === "northstar-health");

    expect(northstar).toMatchObject({ stage: "waiting", statusLabel: "Revision requested" });
  });

  it("keeps the senior queue informed while the analyst revision is in progress", () => {
    let meridianState = createMeridianPreset("senior-review-ready");
    meridianState = meridianReviewReducer(meridianState, {
      type: "record_senior_decision",
      record: { decision: "return_to_analyst", rationale: "Clarify covenant ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:00:00.000Z" },
    });
    meridianState = meridianReviewReducer(meridianState, { type: "reopen_returned_recommendation", at: "2026-07-27T12:05:00.000Z" });

    const meridian = buildSeniorQueueItems(meridianState, createInitialNorthstarState()).find((item) => item.id === "meridian-foods");

    expect(meridian).toMatchObject({
      stage: "waiting",
      statusLabel: "Revision in progress",
      recommendationTitle: "Analyst revision in progress",
      recommendationRationale: "Clarify covenant ownership.",
    });
    expect(meridian?.conditions).toHaveLength(3);
  });

  it("only shows the mobile stage continuation cue while more tabs remain", () => {
    expect(getStageTabsScrollCue({ clientWidth: 358, scrollWidth: 388, scrollLeft: 0 })).toEqual({ overflow: true, atEnd: false });
    expect(getStageTabsScrollCue({ clientWidth: 358, scrollWidth: 388, scrollLeft: 30 })).toEqual({ overflow: true, atEnd: true });
    expect(getStageTabsScrollCue({ clientWidth: 968, scrollWidth: 968, scrollLeft: 0 })).toEqual({ overflow: false, atEnd: true });
  });

  it("keeps recommendation tags concise while preserving unfamiliar copy", () => {
    expect(compactRecommendationLabel("Approve with conditions")).toBe("Conditional");
    expect(compactRecommendationLabel("Approve with concentration reporting")).toBe("Monitoring");
    expect(compactRecommendationLabel("Proceed with standard protections")).toBe("Standard");
    expect(compactRecommendationLabel("Decision recorded")).toBe("Decision recorded");
    expect(compactRecommendationTone("Approve with conditions")).toBe("warning");
    expect(compactRecommendationTone("Approve with concentration reporting")).toBe("info");
    expect(compactRecommendationTone("Proceed with standard protections")).toBe("success");
    expect(compactRecommendationLabel("Approved with conditions")).toBe("Approved");
    expect(compactRecommendationTone("Approved with conditions")).toBe("success");
    expect(compactRecommendationTone("Decision recorded")).toBe("neutral");
  });

  it("keeps the hidden facility type available to queue search", () => {
    const meridian = buildSeniorQueueItems(createMeridianPreset("senior-review-ready"), createInitialNorthstarState())
      .find((item) => item.id === "meridian-foods");

    expect(meridian).toBeDefined();
    expect(matchesSeniorQueueSearch({ ...meridian!, request: "$18M" }, "revolving line")).toBe(true);
  });
});
