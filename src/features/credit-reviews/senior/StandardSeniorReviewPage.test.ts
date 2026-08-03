import { describe, expect, it } from "vitest";
import { createInitialStandardReviewState, standardReviewReducer } from "../standard/standardReviewState";
import { shouldSeedCompletedStandardDecision } from "./StandardSeniorReviewPage";

const recommendation = {
  decision: "Approved",
  amount: "$6M revolving line",
  rationale: "Recurring service revenue supports the line.",
  conditions: ["Minimum FCCR of 1.20x"],
  author: "Jordan Lee",
  createdAt: "2026-07-25T15:00:00.000Z",
};

describe("completed standard decision seeding", () => {
  it("seeds the canonical completed fixture only before workflow history exists", () => {
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: recommendation });

    expect(shouldSeedCompletedStandardDecision("completed", submitted)).toBe(true);
    expect(shouldSeedCompletedStandardDecision("ready-for-decision", submitted)).toBe(false);
  });

  it("does not auto-approve a completed case after a return and resubmission", () => {
    const submitted = standardReviewReducer(createInitialStandardReviewState(), { type: "submit_recommendation", record: recommendation });
    const returned = standardReviewReducer(submitted, {
      type: "record_senior_decision",
      record: {
        decision: "return_to_analyst",
        rationale: "Clarify monitoring ownership.",
        conditions: [],
        decisionMaker: "Morgan Lee",
        createdAt: "2026-07-25T15:15:00.000Z",
      },
    });
    const reopened = standardReviewReducer(returned, { type: "reopen_returned_recommendation" });
    const resubmitted = standardReviewReducer(reopened, { type: "submit_recommendation", record: recommendation });

    expect(resubmitted.decisionHistory).toHaveLength(1);
    expect(shouldSeedCompletedStandardDecision("completed", resubmitted)).toBe(false);
  });
});
