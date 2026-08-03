import { describe, expect, it } from "vitest";
import {
  createInitialMeridianState,
  createInitialAnalystRecommendationDraft,
  createInitialSeniorDecisionDraft,
  createInitialNorthstarState,
  createMeridianPreset,
  deriveMeridianCaseAttention,
  meridianReviewReducer,
  northstarReviewReducer,
  type DocumentRequestStatus,
} from "./creditReviewState";

const at = "2026-07-26T15:00:00.000Z";

describe("Meridian review reducer", () => {
  it("starts with two judgment findings and one verification finding", () => {
    const state = createInitialMeridianState();
    expect(state.findingStates).toEqual({
      "customer-concentration": "needs_judgment",
      "declining-margins": "needs_judgment",
      "increasing-leverage": "needs_verification",
    });
  });

  it("forbids reassessment until evidence is verified", () => {
    const initial = createInitialMeridianState();
    const next = meridianReviewReducer(initial, {
      type: "analysis_completed",
      record: { id: "reassessment-1", findingId: "customer-concentration", evidenceRequirementId: "customer-renewal", createdAt: at, status: "current" },
    });
    expect(next).toBe(initial);
  });

  it("keeps AI reassessment separate from human completion", () => {
    let state = createInitialMeridianState();
    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "existing-source-selected", fileName: "Customer A Renewal Agreement.pdf" } });
    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "verification-complete" } });
    state = meridianReviewReducer(state, {
      type: "analysis_completed",
      record: { id: "reassessment-1", findingId: "customer-concentration", evidenceRequirementId: "customer-renewal", createdAt: at, status: "current" },
    });

    expect(state.findingStates["customer-concentration"]).toBe("analysis_ready");
    expect(state.judgments).toHaveLength(0);
    expect(state.activity[0].detail).toContain("Analyst judgment is still required");
  });

  it("persists analyst context and verification attribution on the reassessment record", () => {
    const confirmedChecks = [
      "Executed by both parties",
      "Term extends through March 2030",
      "Minimum-purchase provisions remain in effect",
    ];
    let state = createInitialMeridianState();
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: { type: "existing-source-selected", fileName: "Customer A Renewal Agreement.pdf" },
    });
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: {
        type: "verification-progress-updated",
        confirmedChecks,
        updatedBy: "Alex Kim",
        updatedAt: at,
      },
    });
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: { type: "verification-complete" },
    });
    state = meridianReviewReducer(state, {
      type: "analysis_completed",
      record: {
        id: "reassessment-with-context",
        findingId: "customer-concentration",
        evidenceRequirementId: "customer-renewal",
        analystContext: "Relationship history supports confidence in the executed renewal.",
        verification: {
          confirmedChecks,
          verifiedBy: "Alex Kim",
          verifiedAt: at,
        },
        createdAt: at,
        status: "current",
      },
    });

    expect(state.evidenceStates["customer-renewal"].verificationProgress).toEqual({
      confirmedChecks,
      analystContext: undefined,
      updatedBy: "Alex Kim",
      updatedAt: at,
    });
    expect(state.reassessments[0]).toMatchObject({
      id: "reassessment-with-context",
      analystContext: "Relationship history supports confidence in the executed renewal.",
      verification: {
        confirmedChecks,
        verifiedBy: "Alex Kim",
        verifiedAt: at,
      },
      status: "current",
    });
  });

  it("persists the verification draft and preserves it when evidence is verified", () => {
    const verificationDraft = {
      confirmedChecks: ["Executed by both parties"],
      analystContext: "The relationship team reconfirmed the signed renewal.",
      updatedBy: "Alex Kim",
      updatedAt: at,
    };
    let state = createInitialMeridianState();
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: { type: "existing-source-selected", fileName: "Customer A Renewal Agreement.pdf" },
    });
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: { type: "verification-progress-updated", ...verificationDraft },
    });

    expect(state.evidenceStates["customer-renewal"].verificationProgress).toEqual(verificationDraft);

    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "customer-renewal",
      action: { type: "verification-complete" },
    });

    expect(state.evidenceStates["customer-renewal"]).toMatchObject({
      status: "verified",
      verificationProgress: verificationDraft,
    });
  });

  it("replaces matched-source provenance when the analyst supplies a different document", () => {
    let state = createInitialMeridianState();
    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "existing-source-selected", fileName: "Customer A Renewal Agreement.pdf" } });
    expect(state.evidenceStates["customer-renewal"].provenance).toBe("existing-source");

    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "upload-started", fileName: "Customer A Amendment.pdf", provenance: "analyst-upload" } });
    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "upload-ready" } });

    expect(state.evidenceStates["customer-renewal"]).toMatchObject({
      status: "ready-for-review",
      fileName: "Customer A Amendment.pdf",
      provenance: "analyst-upload",
    });
  });

  it("keeps a borrower request linked to its evidence requirement", () => {
    const state = meridianReviewReducer(createInitialMeridianState(), {
      type: "evidence_transition",
      id: "equipment-obligation-classification",
      action: {
        type: "request-sent",
        request: {
          recipientName: "Maya Patel",
          recipientRole: "CFO",
          recipientEmail: "maya.patel@meridianfoods.com",
          dueDate: "Aug 5, 2026",
          message: "Please provide the equipment obligation agreement.",
          remindersEnabled: true,
          sentAt: at,
        },
      },
    });

    expect(state.evidenceStates["equipment-obligation-classification"]).toMatchObject({
      status: "requested",
      request: { recipientName: "Maya Patel", dueDate: "Aug 5, 2026" },
    });
    expect(state.findingStates["increasing-leverage"]).toBe("needs_verification");
  });

  it("only a valid attributable judgment completes a finding", () => {
    const initial = createInitialMeridianState();
    const invalid = meridianReviewReducer(initial, {
      type: "record_judgment",
      record: { findingId: "declining-margins", decision: "accept", rationale: "", author: "Alex Kim", createdAt: at },
    });
    expect(invalid).toBe(initial);

    const complete = meridianReviewReducer(initial, {
      type: "record_judgment",
      record: { findingId: "declining-margins", decision: "accept", rationale: "I reviewed the 14.2% to 9.1% trend and 1.12x downside coverage.", author: "Alex Kim", createdAt: at },
    });
    expect(complete.findingStates["declining-margins"]).toBe("review_complete");
    expect(complete.judgments[0].author).toBe("Alex Kim");
    expect(complete.activity[0].type).toBe("human");
  });

  it("requires a revised conclusion and risk for an analyst revision", () => {
    const initial = createInitialMeridianState();
    const incomplete = meridianReviewReducer(initial, {
      type: "record_judgment",
      record: { findingId: "declining-margins", decision: "revise", rationale: "The latest pricing evidence changes my view.", author: "Alex Kim", createdAt: at },
    });
    expect(incomplete).toBe(initial);

    const revised = meridianReviewReducer(initial, {
      type: "record_judgment",
      record: {
        findingId: "declining-margins",
        decision: "revise",
        rationale: "The latest pricing evidence supports a lower risk conclusion.",
        revisedConclusion: "Pricing execution is improving and warrants a Moderate risk conclusion with monthly monitoring.",
        revisedRisk: "Moderate",
        author: "Alex Kim",
        createdAt: at,
      },
    });
    expect(revised.findingStates["declining-margins"]).toBe("review_complete");
    expect(revised.judgments[0]).toMatchObject({ decision: "revise", revisedRisk: "Moderate" });
  });

  it("keeps an escalated finding visible while allowing recommendation handoff", () => {
    let state = createMeridianPreset("senior-review-ready");
    state = {
      ...state,
      recommendation: undefined,
      findingStates: { ...state.findingStates, "increasing-leverage": "analysis_ready" },
      sourceReviewStates: { ...state.sourceReviewStates, "debt-schedule": "verified" },
      judgments: state.judgments.filter((record) => record.findingId !== "increasing-leverage"),
    };
    state = meridianReviewReducer(state, {
      type: "record_judgment",
      record: { findingId: "increasing-leverage", decision: "escalate", rationale: "Senior credit should confirm the narrower covenant headroom.", author: "Alex Kim", createdAt: at },
    });
    expect(state.findingStates["increasing-leverage"]).toBe("escalated");

    const recommended = meridianReviewReducer(state, {
      type: "submit_recommendation",
      record: { decision: "Escalate", amount: "$18,000,000", rationale: "Leverage requires senior judgment.", conditions: [], author: "Alex Kim", createdAt: at },
    });
    expect(recommended.recommendation?.decision).toBe("Escalate");
  });

  it("provides a deterministic escalation-ready demo state", () => {
    const state = createMeridianPreset("meridian-escalation-ready");
    expect(state.findingStates).toMatchObject({
      "customer-concentration": "review_complete",
      "declining-margins": "review_complete",
      "increasing-leverage": "escalated",
    });
    expect(state.reassessments[0]).toMatchObject({ findingId: "increasing-leverage", status: "current" });
    expect(state.judgments.find((record) => record.findingId === "increasing-leverage")).toMatchObject({ decision: "escalate", reassessmentId: "increasing-leverage-reassessment" });
    expect(state.recommendation).toBeUndefined();
  });

  it("reopens an escalated finding when newer evidence supersedes the judgment", () => {
    let state = createMeridianPreset("senior-review-ready");
    state = {
      ...state,
      recommendation: undefined,
      findingStates: { ...state.findingStates, "increasing-leverage": "analysis_ready" },
      sourceReviewStates: { ...state.sourceReviewStates, "debt-schedule": "verified" },
      judgments: state.judgments.filter((record) => record.findingId !== "increasing-leverage"),
    };
    state = meridianReviewReducer(state, {
      type: "record_judgment",
      record: { findingId: "increasing-leverage", decision: "escalate", rationale: "Senior credit should confirm the narrower covenant headroom.", author: "Alex Kim", createdAt: at },
    });
    state = meridianReviewReducer(state, {
      type: "evidence_transition",
      id: "equipment-obligation-classification",
      action: { type: "upload-started", fileName: "Equipment Obligation Amendment.pdf", provenance: "analyst-upload" },
      at: "2026-07-26T16:00:00.000Z",
    });

    expect(state.findingStates["increasing-leverage"]).toBe("needs_verification");
    expect(state.judgments.find((record) => record.findingId === "increasing-leverage")?.supersededAt).toBe("2026-07-26T16:00:00.000Z");
  });

  it("reopens completed work when newer evidence makes analysis stale without deleting history", () => {
    let state = createMeridianPreset("meridian-reassessment-ready");
    state = meridianReviewReducer(state, {
      type: "record_judgment",
      record: { findingId: "customer-concentration", decision: "accept", rationale: "Accepted after reviewing the renewal.", author: "Alex Kim", createdAt: at, reassessmentId: state.reassessments[0].id },
    });
    state = meridianReviewReducer(state, { type: "evidence_transition", id: "customer-renewal", action: { type: "upload-started", fileName: "Customer A Amendment.pdf", provenance: "analyst-upload" }, at: "2026-07-26T16:00:00.000Z" });

    expect(state.findingStates["customer-concentration"]).toBe("needs_verification");
    expect(state.reassessments[0].status).toBe("potentially_stale");
    expect(state.judgments).toHaveLength(1);
    expect(state.judgments[0].supersededAt).toBeTruthy();
  });

  it("provides a reproducible declining-margin reassessment state for design comparison", () => {
    const state = createMeridianPreset("meridian-margin-reassessment-ready");

    expect(state.findingStates["declining-margins"]).toBe("analysis_ready");
    expect(state.evidenceStates["latest-operating-results"]).toMatchObject({ status: "verified", provenance: "analyst-upload" });
    expect(state.reassessments).toEqual([
      expect.objectContaining({ findingId: "declining-margins", evidenceRequirementId: "latest-operating-results", status: "current" }),
    ]);
  });

  it("requires the analyst recommendation before an immutable senior decision", () => {
    const initial = createInitialMeridianState();
    const forbidden = meridianReviewReducer(initial, {
      type: "record_senior_decision",
      record: { decision: "approve", rationale: "", conditions: [], decisionMaker: "Morgan Lee", createdAt: at },
    });
    expect(forbidden).toBe(initial);

    const ready = createMeridianPreset("senior-review-ready");
    const conditionalWithoutConditions = meridianReviewReducer(ready, {
      type: "record_senior_decision",
      record: { decision: "approve_with_conditions", rationale: "", conditions: [], decisionMaker: "Morgan Lee", createdAt: at },
    });
    expect(conditionalWithoutConditions).toBe(ready);

    const decided = meridianReviewReducer(ready, {
      type: "record_senior_decision",
      record: { decision: "approve_with_conditions", rationale: "Monitoring protects the residual downside.", conditions: ready.recommendation?.conditions ?? [], decisionMaker: "Morgan Lee", createdAt: at },
    });
    expect(decided.seniorDecision?.decisionMaker).toBe("Morgan Lee");
    expect(decided.activity[0].title).toContain("final credit decision");
  });

  it("persists the exact analyst draft section and clears the draft on submission", () => {
    let state = createMeridianPreset("meridian-recommendation-ready");
    const draft = {
      ...createInitialAnalystRecommendationDraft(false, at),
      rationale: "A saved analyst rationale.",
      activeSection: 3 as const,
    };

    state = meridianReviewReducer(state, { type: "save_recommendation_draft", draft });
    expect(state.recommendationDraft).toMatchObject({ activeSection: 3, rationale: "A saved analyst rationale." });

    state = meridianReviewReducer(state, {
      type: "submit_recommendation",
      record: { decision: draft.decision, amount: draft.amount, rationale: draft.rationale, conditions: draft.conditions, author: "Alex Kim", createdAt: at },
    });
    expect(state.recommendationDraft).toBeUndefined();
    expect(state.recommendation?.author).toBe("Alex Kim");
  });

  it("persists a senior draft and clears it when the decision is recorded", () => {
    let state = createMeridianPreset("senior-review-ready");
    const draft = {
      ...createInitialSeniorDecisionDraft(state.recommendation!, at),
      rationale: "Residual leverage remains acceptable with reporting.",
    };

    state = meridianReviewReducer(state, { type: "save_senior_decision_draft", draft });
    expect(state.seniorDecisionDraft).toEqual(draft);

    state = meridianReviewReducer(state, {
      type: "record_senior_decision",
      record: { ...draft, decisionMaker: "Morgan Lee", createdAt: at },
    });
    expect(state.seniorDecisionDraft).toBeUndefined();
    expect(state.seniorDecision?.decisionMaker).toBe("Morgan Lee");
  });

  it("returns a senior revision request to an editable analyst draft without losing history", () => {
    let state = createMeridianPreset("senior-review-ready");
    const submittedRecommendation = state.recommendation!;
    state = meridianReviewReducer(state, {
      type: "record_senior_decision",
      record: {
        decision: "return_to_analyst",
        rationale: "Clarify who owns the customer-concentration reporting covenant.",
        conditions: [],
        decisionMaker: "Morgan Lee",
        createdAt: at,
      },
    });

    expect(deriveMeridianCaseAttention(state)).toBe("analyst_review");
    expect(state.recommendationHistory?.[0]).toEqual(submittedRecommendation);
    expect(state.decisionHistory?.[0].decision).toBe("return_to_analyst");

    state = meridianReviewReducer(state, { type: "reopen_returned_recommendation", at: "2026-07-26T16:00:00.000Z" });

    expect(state.recommendation).toBeUndefined();
    expect(state.seniorDecision).toBeUndefined();
    expect(state.recommendationDraft).toMatchObject({
      decision: submittedRecommendation.decision,
      amount: submittedRecommendation.amount,
      rationale: submittedRecommendation.rationale,
      conditions: submittedRecommendation.conditions,
      activeSection: 1,
    });
    expect(state.recommendationHistory).toHaveLength(1);
    expect(state.decisionHistory).toHaveLength(1);
    expect(state.activity[0].title).toContain("reopened the returned recommendation");
  });
});

describe("Northstar request reducer", () => {
  it("does not advance while no explicit transition occurs", () => {
    const initial = createInitialNorthstarState();
    expect(initial.request.status).toBe("draft");
    expect(northstarReviewReducer(initial, { type: "start_processing" })).toBe(initial);
  });

  it("moves through every explicit request state and keeps verification separate", () => {
    let state = createInitialNorthstarState();
    state = northstarReviewReducer(state, { type: "send_request", at, recipient: "Sarah Lee · CFO", dueDate: "Aug 2, 2026", message: "Please upload the approved forecast." });
    expect(state.request.status).toBe("sent");
    expect(state.request).toMatchObject({ recipient: "Sarah Lee · CFO", dueDate: "Aug 2, 2026", message: "Please upload the approved forecast." });
    state = northstarReviewReducer(state, { type: "receive_document", fileName: "2027 Operating Forecast.xlsx", provenance: "borrower-upload", suppliedBy: "Sarah Lee · CFO", at });
    expect(state.request.status).toBe("received");
    state = northstarReviewReducer(state, { type: "start_processing" });
    expect(state.request.status).toBe("processing");
    state = northstarReviewReducer(state, { type: "processing_succeeded" });
    expect(state.request.status).toBe("ready");
    expect(state.evidenceReviewState).toBe("needs_verification");
    expect(state.analysisUpdated).toBe(false);
    state = northstarReviewReducer(state, { type: "verify_evidence" });
    expect(state.evidenceReviewState).toBe("verified_by_analyst");
    expect(state.analysisUpdated).toBe(true);
  });

  it("advances a sent prototype request to an attributable received response", () => {
    let state = createInitialNorthstarState();
    state = northstarReviewReducer(state, { type: "send_request", at, recipient: "Marcus Reed · VP, Finance", dueDate: "Aug 2, 2026", message: "Please upload the approved forecast." });
    state = northstarReviewReducer(state, { type: "preview_received_response", at: "2026-08-01T14:42:00.000Z" });

    expect(state.request).toMatchObject({
      status: "ready",
      fileName: "2027 Operating Forecast.xlsx",
      provenance: "borrower-upload",
      suppliedBy: "Marcus Reed · VP, Finance",
      receivedAt: "2026-08-01T14:42:00.000Z",
    });
    expect(state.evidenceReviewState).toBe("needs_verification");
    expect(state.analysisUpdated).toBe(false);
  });

  it.each([
    "Missing required forecast tabs",
    "Duplicate of an existing upload",
    "Contradictory downside assumptions",
    "Unreadable scanned document",
    "Extraction service failed",
  ])("keeps a recoverable failed state for %s", (message) => {
    let state = createInitialNorthstarState();
    state = northstarReviewReducer(state, { type: "receive_document", fileName: "2027 Operating Forecast.xlsx", provenance: "analyst-upload", suppliedBy: "Alex Kim", at });
    state = northstarReviewReducer(state, { type: "start_processing" });
    state = northstarReviewReducer(state, { type: "processing_failed", message });
    expect(state.request.status).toBe("failed");
    expect(state.request.error).toBe(message);
    state = northstarReviewReducer(state, { type: "retry" });
    expect(state.request.status).toBe("received");
  });

  it("replaces an unreadable file while preserving the borrower request", () => {
    let state = createInitialNorthstarState();
    state = northstarReviewReducer(state, { type: "send_request", at, recipient: "Sarah Lee · CFO", dueDate: "Aug 2, 2026", message: "Please upload the approved forecast." });
    state = northstarReviewReducer(state, { type: "receive_document", fileName: "Unreadable scan.pdf", provenance: "borrower-upload", suppliedBy: "Sarah Lee · CFO", at });
    state = northstarReviewReducer(state, { type: "start_processing" });
    state = northstarReviewReducer(state, { type: "processing_failed", message: "The file could not be read." });
    state = northstarReviewReducer(state, { type: "replace_document" });

    expect(state.request).toMatchObject({
      status: "sent",
      recipient: "Sarah Lee · CFO",
      dueDate: "Aug 2, 2026",
      message: "Please upload the approved forecast.",
      sentAt: at,
    });
    expect(state.request.fileName).toBeUndefined();
    expect(state.request.error).toBeUndefined();
    expect(state.evidenceReviewState).toBe("ready");
  });

  it("supports cancellation without conflating it with completion", () => {
    let state = createInitialNorthstarState();
    state = northstarReviewReducer(state, { type: "send_request", at, recipient: "Sarah Lee · CFO", dueDate: "Aug 2, 2026", message: "Please upload the approved forecast." });
    state = northstarReviewReducer(state, { type: "cancel_request" });
    expect(state.request.status satisfies DocumentRequestStatus).toBe("cancelled");
    expect(state.analysisUpdated).toBe(false);
  });

  it("keeps analyst review, recommendation submission, and senior decision as separate guarded events", () => {
    let state = createInitialNorthstarState();
    const recommendation = { decision: "Proceed with conditions", amount: "$15,000,000", rationale: "Verified downside coverage remains above policy.", conditions: ["Minimum FCCR of 1.20x"], author: "Alex Kim", createdAt: at };
    const decision = { decision: "approve_with_conditions" as const, rationale: "", conditions: recommendation.conditions, decisionMaker: "Morgan Lee", createdAt: at };

    expect(northstarReviewReducer(state, { type: "complete_analysis_review", at })).toBe(state);
    expect(northstarReviewReducer(state, { type: "submit_recommendation", record: recommendation })).toBe(state);
    expect(northstarReviewReducer(state, { type: "record_senior_decision", record: decision })).toBe(state);

    state = northstarReviewReducer(state, { type: "receive_document", fileName: "2027 Operating Forecast.xlsx", provenance: "analyst-upload", suppliedBy: "Alex Kim", at });
    state = northstarReviewReducer(state, { type: "start_processing" });
    state = northstarReviewReducer(state, { type: "processing_succeeded" });
    state = northstarReviewReducer(state, { type: "verify_evidence" });
    expect(state.analysisReviewState).toBe("pending");

    state = northstarReviewReducer(state, { type: "complete_analysis_review", at });
    expect(state.analysisReviewState).toBe("completed");
    expect(state.recommendation).toBeUndefined();

    state = northstarReviewReducer(state, { type: "submit_recommendation", record: recommendation });
    expect(state.recommendation?.author).toBe("Alex Kim");
    expect(state.recommendationHistory).toHaveLength(1);
    expect(state.seniorDecision).toBeUndefined();

    state = northstarReviewReducer(state, { type: "record_senior_decision", record: decision });
    expect(state.seniorDecision?.decisionMaker).toBe("Morgan Lee");
    expect(state.decisionHistory).toHaveLength(1);
  });

  it("reopens a returned recommendation without deleting the senior rationale", () => {
    let state = createInitialNorthstarState();
    state = { ...state, request: { ...state.request, status: "ready" }, evidenceReviewState: "verified_by_analyst", analysisUpdated: true, analysisReviewState: "completed", recommendation: { decision: "Proceed with conditions", amount: "$15,000,000", rationale: "Coverage remains above policy.", conditions: ["Minimum FCCR of 1.20x"], author: "Alex Kim", createdAt: at } };
    state = northstarReviewReducer(state, { type: "record_senior_decision", record: { decision: "return_to_analyst", rationale: "Clarify reporting ownership.", conditions: [], decisionMaker: "Morgan Lee", createdAt: at } });
    state = northstarReviewReducer(state, { type: "reopen_returned_recommendation" });

    expect(state.recommendation).toBeUndefined();
    expect(state.seniorDecision).toBeUndefined();
    expect(state.decisionHistory?.[0].rationale).toBe("Clarify reporting ownership.");
    expect(state.analysisReviewState).toBe("completed");
  });
});
