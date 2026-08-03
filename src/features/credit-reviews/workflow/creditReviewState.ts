import {
  createEvidenceStateMap,
  evidenceIntakeReducer,
  type EvidenceIntakeAction,
  type EvidenceIntakeState,
  type EvidenceRequirementId,
} from "./evidenceWorkflow";
import type { TimelineTone } from "../../../shared/ui/Timeline/Timeline";

export type FindingId = "customer-concentration" | "declining-margins" | "increasing-leverage";

export type FindingWorkflowState =
  | "needs_verification"
  | "needs_judgment"
  | "analysis_ready"
  | "review_complete"
  | "escalated";

export type EvidenceReviewState =
  | "ready"
  | "needs_verification"
  | "verified_by_analyst"
  | "discrepancy_flagged";

export type DocumentRequestStatus =
  | "draft"
  | "sent"
  | "received"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

export type CaseAttentionState =
  | "analyst_review"
  | "awaiting_information"
  | "awaiting_senior_decision"
  | "complete";

export type JudgmentRecord = {
  findingId: FindingId;
  decision: "accept" | "revise" | "escalate";
  rationale: string;
  revisedConclusion?: string;
  revisedRisk?: "Material" | "Moderate";
  author: string;
  createdAt: string;
  reassessmentId?: string;
  supersededAt?: string;
};

export function isFindingAddressed(state: FindingWorkflowState) {
  return state === "review_complete" || state === "escalated";
}

export function currentJudgmentForFinding(judgments: JudgmentRecord[], findingId: FindingId) {
  return judgments.find((record) => record.findingId === findingId && !record.supersededAt);
}

export type SeniorDecisionRecord = {
  decision: "approve" | "approve_with_conditions" | "return_to_analyst" | "decline";
  rationale: string;
  conditions: string[];
  decisionMaker: string;
  createdAt: string;
};

export type AnalystRecommendationRecord = {
  decision: string;
  amount: string;
  rationale: string;
  conditions: string[];
  author: string;
  createdAt: string;
};

export type RecommendationDraftSection = 1 | 2 | 3 | 4 | 5;

export type AnalystRecommendationDraft = {
  decision: string;
  amount: string;
  rationale: string;
  conditions: string[];
  activeSection: RecommendationDraftSection;
  updatedAt: string;
};

export type SeniorDecisionDraft = {
  decision: SeniorDecisionRecord["decision"];
  rationale: string;
  conditions: string[];
  updatedAt: string;
};

export const meridianDefaultConditions = [
  "Quarterly customer-concentration reporting",
  "Maximum total leverage of 4.25x",
  "Minimum fixed-charge coverage of 1.20x",
  "Limits on additional funded debt",
];

const standardRecommendationRationale = "Meridian can support the requested working-capital line under the base case. Customer concentration remains meaningful, but the renewed Customer A contract reduces near-term expiration risk. Declining margins and increased leverage require covenant protection and ongoing reporting.";
const escalatedRecommendationRationale = "The analyst review is complete, but the escalated finding requires explicit senior judgment before a final credit decision. Resolved findings and their supporting evidence remain preserved in the handoff.";

export function createInitialAnalystRecommendationDraft(hasEscalation = false, updatedAt = new Date().toISOString()): AnalystRecommendationDraft {
  return {
    decision: hasEscalation ? "Escalate" : "Proceed with conditions",
    amount: "$18,000,000",
    rationale: hasEscalation ? escalatedRecommendationRationale : standardRecommendationRationale,
    conditions: [...meridianDefaultConditions],
    activeSection: 1,
    updatedAt,
  };
}

export function createInitialSeniorDecisionDraft(recommendation: AnalystRecommendationRecord, updatedAt = new Date().toISOString()): SeniorDecisionDraft {
  return {
    decision: "approve_with_conditions",
    rationale: "",
    conditions: [...recommendation.conditions],
    updatedAt,
  };
}

export type ReassessmentRecord = {
  id: string;
  findingId: FindingId;
  evidenceRequirementId: EvidenceRequirementId;
  analystContext?: string;
  verification?: {
    confirmedChecks: string[];
    verifiedBy: string;
    verifiedAt: string;
  };
  createdAt: string;
  status: "current" | "potentially_stale";
};

export type ReassessmentInput = Pick<ReassessmentRecord, "analystContext" | "verification">;

export type WorkflowActivity = {
  id: string;
  type: "ai" | "human" | "evidence" | "decision";
  title: string;
  meta: string;
  description: string;
  tone: TimelineTone;
  detail: string;
};

export type SourceReviewState = "pending" | "verified" | "flagged";

export type MeridianReviewState = {
  version: 1;
  findingStates: Record<FindingId, FindingWorkflowState>;
  evidenceStates: Record<EvidenceRequirementId, EvidenceIntakeState>;
  sourceReviewStates: Record<string, SourceReviewState>;
  reassessments: ReassessmentRecord[];
  judgments: JudgmentRecord[];
  recommendationDraft?: AnalystRecommendationDraft;
  recommendation?: AnalystRecommendationRecord;
  recommendationHistory?: AnalystRecommendationRecord[];
  seniorDecisionDraft?: SeniorDecisionDraft;
  seniorDecision?: SeniorDecisionRecord;
  decisionHistory?: SeniorDecisionRecord[];
  activity: WorkflowActivity[];
};

export type MeridianReviewAction =
  | { type: "evidence_transition"; id: EvidenceRequirementId; action: EvidenceIntakeAction; at?: string }
  | { type: "source_review_transition"; id: string; state: SourceReviewState }
  | { type: "analysis_completed"; record: ReassessmentRecord }
  | { type: "record_judgment"; record: JudgmentRecord }
  | { type: "save_recommendation_draft"; draft: AnalystRecommendationDraft }
  | { type: "submit_recommendation"; record: AnalystRecommendationRecord }
  | { type: "save_senior_decision_draft"; draft: SeniorDecisionDraft }
  | { type: "record_senior_decision"; record: SeniorDecisionRecord }
  | { type: "reopen_returned_recommendation"; at?: string }
  | { type: "add_activity"; activity: WorkflowActivity }
  | { type: "replace_state"; state: MeridianReviewState };

const evidenceFinding: Partial<Record<EvidenceRequirementId, FindingId>> = {
  "customer-renewal": "customer-concentration",
  "latest-operating-results": "declining-margins",
  "equipment-obligation-classification": "increasing-leverage",
};

const initialFindingStates: Record<FindingId, FindingWorkflowState> = {
  "customer-concentration": "needs_judgment",
  "declining-margins": "needs_judgment",
  "increasing-leverage": "needs_verification",
};

export function createInitialMeridianState(activity: WorkflowActivity[] = []): MeridianReviewState {
  return {
    version: 1,
    findingStates: { ...initialFindingStates },
    evidenceStates: createEvidenceStateMap([
      "customer-renewal",
      "latest-operating-results",
      "equipment-obligation-classification",
      "northstar-operating-forecast",
    ]),
    sourceReviewStates: {},
    reassessments: [],
    judgments: [],
    activity: [...activity],
  };
}

function prependActivity(state: MeridianReviewState, activity: WorkflowActivity) {
  if (state.activity.some((item) => item.id === activity.id)) return state.activity;
  return [activity, ...state.activity];
}

function activityMeta(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function meridianReviewReducer(state: MeridianReviewState, action: MeridianReviewAction): MeridianReviewState {
  switch (action.type) {
    case "replace_state":
      return action.state;
    case "add_activity":
      return { ...state, activity: prependActivity(state, action.activity) };
    case "source_review_transition":
      return { ...state, sourceReviewStates: { ...state.sourceReviewStates, [action.id]: action.state } };
    case "evidence_transition": { 
      const nextEvidence = evidenceIntakeReducer(state.evidenceStates[action.id], action.action);
      const findingId = evidenceFinding[action.id];
      const changedEvidence = action.action.type === "existing-source-selected" || action.action.type === "upload-started";
      const previousComplete = findingId ? isFindingAddressed(state.findingStates[findingId]) : false;
      const at = action.at ?? new Date().toISOString();
      return {
        ...state,
        evidenceStates: { ...state.evidenceStates, [action.id]: nextEvidence },
        findingStates: changedEvidence && previousComplete && findingId
          ? { ...state.findingStates, [findingId]: "needs_verification" }
          : state.findingStates,
        reassessments: changedEvidence && findingId
          ? state.reassessments.map((record) => record.findingId === findingId && record.status === "current" ? { ...record, status: "potentially_stale" as const } : record)
          : state.reassessments,
        judgments: changedEvidence && findingId
          ? state.judgments.map((record) => record.findingId === findingId && !record.supersededAt ? { ...record, supersededAt: at } : record)
          : state.judgments,
      };
    }
    case "analysis_completed": {
      const evidence = state.evidenceStates[action.record.evidenceRequirementId];
      if (evidence.status !== "verified") return state;
      const prior = state.reassessments.map((record) => record.findingId === action.record.findingId && record.status === "current" ? { ...record, status: "potentially_stale" as const } : record);
      return {
        ...state,
        findingStates: { ...state.findingStates, [action.record.findingId]: "analysis_ready" },
        reassessments: [action.record, ...prior],
        activity: prependActivity(state, {
          id: `${action.record.id}-activity`,
          type: "ai",
          title: "Scoped analysis updated",
          meta: activityMeta(action.record.createdAt),
          description: "Verified evidence changed only the affected credit logic.",
          tone: "neutral",
          detail: "The result remains an analysis artifact. Analyst judgment is still required before the finding can be completed.",
        }),
      };
    }
    case "record_judgment": {
      const record = action.record;
      const findingState = state.findingStates[record.findingId];
      const revisionComplete = record.decision !== "revise" || Boolean(record.revisedConclusion?.trim() && record.revisedRisk);
      const verificationReady = record.decision === "escalate"
        || record.findingId !== "increasing-leverage"
        || state.evidenceStates["equipment-obligation-classification"].status === "verified"
        || state.sourceReviewStates["debt-schedule"] === "verified";
      if (!record.rationale.trim() || isFindingAddressed(findingState) || !verificationReady || !revisionComplete) return state;
      if (findingState !== "needs_judgment" && findingState !== "analysis_ready" && findingState !== "needs_verification") return state;
      return {
        ...state,
        findingStates: { ...state.findingStates, [record.findingId]: record.decision === "escalate" ? "escalated" : "review_complete" },
        judgments: [record, ...state.judgments],
        activity: prependActivity(state, {
          id: `judgment-${record.findingId}-${record.createdAt}`,
          type: "human",
          title: `${record.author} recorded analyst judgment`,
          meta: activityMeta(record.createdAt),
          description: `${record.decision === "accept" ? "Accepted" : record.decision === "revise" ? "Revised" : "Escalated"} the finding conclusion.`,
          tone: "human",
          detail: record.rationale,
        }),
      };
    }
    case "save_recommendation_draft":
      return state.recommendation ? state : { ...state, recommendationDraft: action.draft };
    case "submit_recommendation": {
      const allComplete = Object.values(state.findingStates).every(isFindingAddressed);
      if (!allComplete || !action.record.rationale.trim()) return state;
      return {
        ...state,
        recommendationDraft: undefined,
        recommendation: action.record,
        recommendationHistory: [action.record, ...(state.recommendationHistory ?? [])],
        activity: prependActivity(state, {
          id: `recommendation-${action.record.createdAt}`,
          type: "decision",
          title: `${action.record.author} submitted a recommendation for senior review`,
          meta: activityMeta(action.record.createdAt),
          description: `${action.record.decision} · ${action.record.amount}`,
          tone: "human",
          detail: action.record.rationale,
        }),
      };
    }
    case "save_senior_decision_draft":
      return !state.recommendation || state.seniorDecision ? state : { ...state, seniorDecisionDraft: action.draft };
    case "record_senior_decision": {
      const record = action.record;
      const rationaleRequired = record.decision === "return_to_analyst" || record.decision === "decline";
      const conditionsRequired = record.decision === "approve_with_conditions";
      if (!state.recommendation || state.seniorDecision || (rationaleRequired && !record.rationale.trim()) || (conditionsRequired && record.conditions.length === 0)) return state;
      return {
        ...state,
        seniorDecisionDraft: undefined,
        seniorDecision: record,
        recommendationHistory: state.recommendation && !state.recommendationHistory?.some((item) => item.createdAt === state.recommendation?.createdAt)
          ? [state.recommendation, ...(state.recommendationHistory ?? [])]
          : state.recommendationHistory,
        decisionHistory: [record, ...(state.decisionHistory ?? [])],
        activity: prependActivity(state, {
          id: `senior-decision-${record.createdAt}`,
          type: "decision",
          title: `${record.decisionMaker} recorded the final credit decision`,
          meta: activityMeta(record.createdAt),
          description: seniorDecisionLabel(record.decision),
          tone: "human",
          detail: record.rationale || "Decision recorded from the reviewed case record.",
        }),
      };
    }
    case "reopen_returned_recommendation": {
      if (state.seniorDecision?.decision !== "return_to_analyst" || !state.recommendation) return state;
      const at = action.at ?? new Date().toISOString();
      const returnedRecommendation = state.recommendation;
      return {
        ...state,
        recommendationDraft: {
          decision: returnedRecommendation.decision,
          amount: returnedRecommendation.amount,
          rationale: returnedRecommendation.rationale,
          conditions: [...returnedRecommendation.conditions],
          activeSection: 1,
          updatedAt: at,
        },
        recommendation: undefined,
        seniorDecisionDraft: undefined,
        seniorDecision: undefined,
        activity: prependActivity(state, {
          id: `recommendation-reopened-${at}`,
          type: "human",
          title: "Alex Kim reopened the returned recommendation",
          meta: activityMeta(at),
          description: "The prior submission remains in history while a revised analyst recommendation is prepared.",
          tone: "human",
          detail: state.seniorDecision.rationale,
        }),
      };
    }
  }
}

export function deriveMeridianCaseAttention(state: MeridianReviewState): CaseAttentionState {
  if (state.seniorDecision?.decision === "return_to_analyst") return "analyst_review";
  if (state.seniorDecision) return "complete";
  if (state.recommendation) return "awaiting_senior_decision";
  return "analyst_review";
}

export function seniorDecisionLabel(decision: SeniorDecisionRecord["decision"]) {
  if (decision === "approve") return "Approved";
  if (decision === "approve_with_conditions") return "Approved with conditions";
  if (decision === "return_to_analyst") return "Returned to analyst";
  return "Declined";
}

export type DocumentRequestRecord = {
  id: string;
  status: DocumentRequestStatus;
  documentName: string;
  recipient: string;
  dueDate: string;
  message?: string;
  sentAt?: string;
  receivedAt?: string;
  suppliedBy?: string;
  fileName?: string;
  provenance?: "analyst-upload" | "borrower-upload";
  error?: string;
};

export type NorthstarReviewState = {
  version: 1;
  request: DocumentRequestRecord;
  evidenceReviewState: EvidenceReviewState;
  analysisUpdated: boolean;
  analysisReviewState?: "pending" | "completed";
  recommendation?: AnalystRecommendationRecord;
  recommendationHistory?: AnalystRecommendationRecord[];
  seniorDecision?: SeniorDecisionRecord;
  seniorDecisionDraft?: SeniorDecisionDraft;
  decisionHistory?: SeniorDecisionRecord[];
};

export type NorthstarReviewAction =
  | { type: "send_request"; at: string; recipient: string; dueDate: string; message: string }
  | { type: "preview_received_response"; at: string }
  | { type: "receive_document"; fileName: string; provenance: "analyst-upload" | "borrower-upload"; suppliedBy: string; at: string }
  | { type: "start_processing" }
  | { type: "processing_succeeded" }
  | { type: "processing_failed"; message: string }
  | { type: "cancel_request" }
  | { type: "retry" }
  | { type: "replace_document" }
  | { type: "verify_evidence" }
  | { type: "complete_analysis_review"; at: string }
  | { type: "submit_recommendation"; record: AnalystRecommendationRecord }
  | { type: "record_senior_decision"; record: SeniorDecisionRecord }
  | { type: "save_senior_decision_draft"; draft: SeniorDecisionDraft }
  | { type: "reopen_returned_recommendation" }
  | { type: "flag_discrepancy"; message: string }
  | { type: "replace_state"; state: NorthstarReviewState };

export function createInitialNorthstarState(): NorthstarReviewState {
  return {
    version: 1,
    request: {
      id: "northstar-forecast-2027",
      status: "draft",
      documentName: "2027 Operating Forecast",
      recipient: "Marcus Reed · VP, Finance",
      dueDate: "Aug 2, 2026",
    },
    evidenceReviewState: "ready",
    analysisUpdated: false,
    analysisReviewState: "pending",
  };
}

export function northstarReviewReducer(state: NorthstarReviewState, action: NorthstarReviewAction): NorthstarReviewState {
  switch (action.type) {
    case "replace_state":
      return action.state;
    case "send_request":
      if (state.request.status !== "draft") return state;
      return { ...state, request: { ...state.request, status: "sent", recipient: action.recipient, dueDate: action.dueDate, message: action.message, sentAt: action.at, error: undefined } };
    case "preview_received_response":
      if (state.request.status !== "sent") return state;
      return {
        ...state,
        request: {
          ...state.request,
          status: "ready",
          fileName: "2027 Operating Forecast.xlsx",
          provenance: "borrower-upload",
          suppliedBy: state.request.recipient,
          receivedAt: action.at,
          error: undefined,
        },
        evidenceReviewState: "needs_verification",
        analysisUpdated: false,
        analysisReviewState: "pending",
        recommendation: undefined,
        seniorDecision: undefined,
      };
    case "receive_document":
      if (!["draft", "sent", "failed"].includes(state.request.status)) return state;
      return {
        ...state,
        request: { ...state.request, status: "received", fileName: action.fileName, provenance: action.provenance, suppliedBy: action.suppliedBy, receivedAt: action.at, error: undefined },
        evidenceReviewState: "needs_verification",
        analysisUpdated: false,
        analysisReviewState: "pending",
        recommendation: undefined,
        seniorDecision: undefined,
      };
    case "start_processing":
      return state.request.status === "received" ? { ...state, request: { ...state.request, status: "processing", error: undefined } } : state;
    case "processing_succeeded":
      return state.request.status === "processing" ? { ...state, request: { ...state.request, status: "ready", error: undefined } } : state;
    case "processing_failed":
      return ["received", "processing"].includes(state.request.status) ? { ...state, request: { ...state.request, status: "failed", error: action.message } } : state;
    case "cancel_request":
      return ["draft", "sent"].includes(state.request.status) ? { ...state, request: { ...state.request, status: "cancelled" } } : state;
    case "retry":
      if (state.request.status !== "failed") return state;
      return { ...state, request: { ...state.request, status: state.request.fileName ? "received" : "sent", error: undefined } };
    case "replace_document":
      if (!["received", "processing", "ready", "failed"].includes(state.request.status)) return state;
      return {
        ...state,
        request: {
          ...state.request,
          status: state.request.sentAt ? "sent" : "draft",
          receivedAt: undefined,
          suppliedBy: undefined,
          fileName: undefined,
          provenance: undefined,
          error: undefined,
        },
        evidenceReviewState: "ready",
        analysisUpdated: false,
        analysisReviewState: "pending",
        recommendation: undefined,
        seniorDecision: undefined,
      };
    case "verify_evidence":
      if (state.request.status !== "ready" || state.evidenceReviewState !== "needs_verification") return state;
      return { ...state, evidenceReviewState: "verified_by_analyst", analysisUpdated: true, analysisReviewState: "pending" };
    case "complete_analysis_review":
      if (state.evidenceReviewState !== "verified_by_analyst" || !state.analysisUpdated || state.analysisReviewState === "completed") return state;
      return { ...state, analysisReviewState: "completed" };
    case "submit_recommendation":
      if (state.analysisReviewState !== "completed" || state.recommendation || !action.record.rationale.trim()) return state;
      return { ...state, recommendation: action.record, recommendationHistory: [action.record, ...(state.recommendationHistory ?? [])] };
    case "record_senior_decision": {
      const record = action.record;
      const rationaleRequired = record.decision === "return_to_analyst" || record.decision === "decline";
      const conditionsRequired = record.decision === "approve_with_conditions";
      if (!state.recommendation || state.seniorDecision || (rationaleRequired && !record.rationale.trim()) || (conditionsRequired && record.conditions.length === 0)) return state;
      return { ...state, seniorDecisionDraft: undefined, seniorDecision: record, decisionHistory: [record, ...(state.decisionHistory ?? [])] };
    }
    case "save_senior_decision_draft":
      return state.recommendation && !state.seniorDecision ? { ...state, seniorDecisionDraft: action.draft } : state;
    case "reopen_returned_recommendation":
      if (state.seniorDecision?.decision !== "return_to_analyst") return state;
      return {
        ...state,
        recommendation: undefined,
        seniorDecision: undefined,
        recommendationHistory: state.recommendation && !state.recommendationHistory?.some((record) => record.createdAt === state.recommendation?.createdAt)
          ? [state.recommendation, ...(state.recommendationHistory ?? [])]
          : state.recommendationHistory,
        decisionHistory: state.decisionHistory?.some((record) => record.createdAt === state.seniorDecision?.createdAt)
          ? state.decisionHistory
          : [state.seniorDecision, ...(state.decisionHistory ?? [])],
      };
    case "flag_discrepancy":
      if (state.request.status !== "ready") return state;
      return { ...state, evidenceReviewState: "discrepancy_flagged", request: { ...state.request, error: action.message } };
  }
}

export type DemoPresetId = "meridian-start" | "meridian-reassessment-ready" | "meridian-margin-reassessment-ready" | "meridian-recommendation-ready" | "meridian-escalation-ready" | "northstar-request-sent" | "northstar-document-received" | "northstar-analysis-updated" | "northstar-senior-review" | "senior-review-ready";

export function createMeridianPreset(id: DemoPresetId, activity: WorkflowActivity[] = []): MeridianReviewState {
  const state = createInitialMeridianState(activity);
  if (id === "meridian-start" || id === "northstar-request-sent") return state;
  const at = "2026-07-26T14:30:00.000Z";
  if (id === "meridian-reassessment-ready") {
    state.evidenceStates["customer-renewal"] = { status: "verified", fileName: "Customer A Renewal Agreement.pdf", provenance: "existing-source" };
    state.findingStates["customer-concentration"] = "analysis_ready";
    state.reassessments = [{ id: "customer-concentration-reassessment", findingId: "customer-concentration", evidenceRequirementId: "customer-renewal", createdAt: at, status: "current" }];
    return state;
  }
  if (id === "meridian-margin-reassessment-ready") {
    state.evidenceStates["latest-operating-results"] = { status: "verified", fileName: "July Operating Results.xlsx", provenance: "analyst-upload" };
    state.findingStates["declining-margins"] = "analysis_ready";
    state.reassessments = [{ id: "declining-margins-reassessment", findingId: "declining-margins", evidenceRequirementId: "latest-operating-results", createdAt: at, status: "current" }];
    return state;
  }
  const findingIds = Object.keys(state.findingStates) as FindingId[];
  for (const findingId of findingIds) {
    state.findingStates[findingId] = "review_complete";
    state.judgments.push({ findingId, decision: "accept", rationale: "Analyst reviewed the evidence, assumptions, and proposed monitoring protections.", author: "Alex Kim", createdAt: at });
  }
  if (id === "meridian-escalation-ready") {
    state.evidenceStates["equipment-obligation-classification"] = { status: "verified", fileName: "Equipment Obligation Agreement.pdf", provenance: "analyst-upload" };
    state.sourceReviewStates["debt-schedule"] = "verified";
    state.findingStates["increasing-leverage"] = "escalated";
    state.reassessments = [{ id: "increasing-leverage-reassessment", findingId: "increasing-leverage", evidenceRequirementId: "equipment-obligation-classification", createdAt: at, status: "current" }];
    state.judgments = state.judgments.map((record) => record.findingId === "increasing-leverage"
      ? { ...record, decision: "escalate", rationale: "Senior credit should confirm the narrower 0.35x covenant headroom before final approval.", reassessmentId: "increasing-leverage-reassessment" }
      : record);
    return state;
  }
  if (id === "meridian-recommendation-ready") return state;
  state.recommendation = {
    decision: "Proceed with conditions",
    amount: "$18,000,000",
    rationale: "Repayment remains supportable with concentration reporting, leverage, and coverage protections.",
    conditions: ["Quarterly customer-concentration reporting", "Maximum total leverage of 4.25x", "Minimum fixed-charge coverage of 1.20x"],
    author: "Alex Kim",
    createdAt: at,
  };
  return state;
}

export function createNorthstarPreset(id: DemoPresetId): NorthstarReviewState {
  const state = createInitialNorthstarState();
  if (id === "northstar-request-sent") state.request = { ...state.request, status: "sent", sentAt: "2026-07-26T14:30:00.000Z" };
  if (id === "northstar-document-received") {
    state.request = {
      ...state.request,
      status: "ready",
      sentAt: "2026-07-31T14:30:00.000Z",
      receivedAt: "2026-08-01T14:42:00.000Z",
      suppliedBy: state.request.recipient,
      fileName: "2027 Operating Forecast.xlsx",
      provenance: "borrower-upload",
    };
    state.evidenceReviewState = "needs_verification";
    return state;
  }
  if (id === "northstar-analysis-updated" || id === "northstar-senior-review") {
    state.request = {
      ...state.request,
      status: "ready",
      receivedAt: "2026-07-26T14:10:00.000Z",
      suppliedBy: "Sarah Lee · CFO",
      fileName: "Northstar_2027_Operating_Forecast.xlsx",
      provenance: "borrower-upload",
    };
    state.evidenceReviewState = "verified_by_analyst";
    state.analysisUpdated = true;
    state.analysisReviewState = id === "northstar-senior-review" ? "completed" : "pending";
  }
  if (id === "northstar-senior-review") {
    state.recommendation = {
      decision: "Proceed with conditions",
      amount: "$15,000,000",
      rationale: "Verified downside coverage remains 0.09x above the 1.20x policy floor. Northstar can support the requested revolving line with ongoing coverage reporting and annual forecast delivery.",
      conditions: ["Minimum fixed-charge coverage of 1.20x", "Quarterly compliance reporting", "Annual delivery of the board-approved operating forecast"],
      author: "Alex Kim",
      createdAt: "2026-07-26T14:30:00.000Z",
    };
    state.recommendationHistory = [state.recommendation];
  }
  return state;
}
