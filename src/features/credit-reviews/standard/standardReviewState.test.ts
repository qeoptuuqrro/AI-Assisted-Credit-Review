import { describe, expect, it } from "vitest";
import { createInitialStandardReviewState, standardReviewReducer } from "./standardReviewState";

const recommendation = {
  decision: "Approve with conditions",
  amount: "$20M term loan",
  rationale: "The submitted case supports the facility with the listed protections.",
  conditions: ["Minimum DSCR of 1.20x"],
  author: "Alex Kim",
  createdAt: "2026-07-27T12:00:00.000Z",
};

describe("standard review workflow state", () => {
  it("keeps analyst review marks durable and separate from the assessment", () => {
    let state = createInitialStandardReviewState();
    state = standardReviewReducer(state, { type: "toggle_finding", findingId: "expansion-capacity" });
    expect(state.reviewedFindingIds).toEqual(["expansion-capacity"]);
    expect(state.recommendationSubmitted).toBe(false);
  });

  it("requires a submitted analyst record before a senior outcome can be recorded", () => {
    const initial = createInitialStandardReviewState();
    const blocked = standardReviewReducer(initial, { type: "record_senior_decision", record: { decision: "approve", rationale: "", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:01:00.000Z" } });
    expect(blocked).toBe(initial);

    const submitted = standardReviewReducer(initial, { type: "submit_recommendation", record: recommendation });
    const decided = standardReviewReducer(submitted, { type: "record_senior_decision", record: { decision: "approve", rationale: "Approved on the submitted record.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:01:00.000Z" } });
    expect(decided.recommendation?.author).toBe("Alex Kim");
    expect(decided.seniorDecision?.decisionMaker).toBe("Morgan Lee");
  });
});
