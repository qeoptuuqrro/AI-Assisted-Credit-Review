import { describe, expect, it } from "vitest";
import {
  createInitialStandardReviewState,
  isStandardReviewRevisionInProgress,
  standardReviewReducer,
} from "./standardReviewState";

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

  it("reopens a returned recommendation as an unsubmitted revision without losing the senior rationale", () => {
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: recommendation });
    const returned = standardReviewReducer(submitted, { type: "record_senior_decision", record: { decision: "return_to_analyst", rationale: "Clarify covenant ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:01:00.000Z" } });
    const reopened = standardReviewReducer(returned, { type: "reopen_returned_recommendation", at: "2026-07-27T12:02:00.000Z" });

    expect(reopened.recommendationSubmitted).toBe(false);
    expect(reopened.recommendation).toBeUndefined();
    expect(reopened.recommendationDraft).toEqual({
      decision: recommendation.decision,
      amount: recommendation.amount,
      rationale: recommendation.rationale,
      conditions: recommendation.conditions,
      activeSection: 1,
      updatedAt: "2026-07-27T12:02:00.000Z",
    });
    expect(reopened.recommendationHistory).toEqual([recommendation]);
    expect(reopened.seniorDecision).toBeUndefined();
    expect(reopened.decisionHistory).toHaveLength(1);
    expect(reopened.decisionHistory?.[0]).toMatchObject({ decision: "return_to_analyst", rationale: "Clarify covenant ownership." });
    expect(isStandardReviewRevisionInProgress(reopened)).toBe(true);
  });

  it("persists an edited revision draft and preserves both analyst submissions when it is resubmitted", () => {
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: recommendation });
    const returned = standardReviewReducer(submitted, { type: "record_senior_decision", record: { decision: "return_to_analyst", rationale: "Clarify covenant ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: "2026-07-27T12:01:00.000Z" } });
    let revision = standardReviewReducer(returned, { type: "reopen_returned_recommendation", at: "2026-07-27T12:02:00.000Z" });

    revision = standardReviewReducer(revision, {
      type: "save_recommendation_draft",
      draft: {
        ...revision.recommendationDraft!,
        decision: "Approve with tighter controls",
        rationale: "Covenant ownership is now assigned to the controller.",
        conditions: ["Minimum DSCR of 1.20x", "Controller certification"],
        updatedAt: "2026-07-27T12:03:00.000Z",
      },
    });

    expect(revision.recommendationDraft).toMatchObject({
      decision: "Approve with tighter controls",
      rationale: "Covenant ownership is now assigned to the controller.",
      conditions: ["Minimum DSCR of 1.20x", "Controller certification"],
    });
    expect(revision.recommendationSubmitted).toBe(false);

    const revisedRecord = {
      decision: revision.recommendationDraft!.decision,
      amount: revision.recommendationDraft!.amount,
      rationale: revision.recommendationDraft!.rationale,
      conditions: revision.recommendationDraft!.conditions,
      author: "Alex Kim",
      createdAt: "2026-07-27T12:04:00.000Z",
    };
    const resubmitted = standardReviewReducer(revision, { type: "submit_recommendation", record: revisedRecord });

    expect(resubmitted.recommendationSubmitted).toBe(true);
    expect(resubmitted.recommendationDraft).toBeUndefined();
    expect(resubmitted.recommendation).toEqual(revisedRecord);
    expect(resubmitted.recommendationHistory).toEqual([revisedRecord, recommendation]);
    expect(resubmitted.decisionHistory?.[0].rationale).toBe("Clarify covenant ownership.");
  });
});
