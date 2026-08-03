import { useEffect, useReducer } from "react";
import type { AnalystRecommendationDraft, AnalystRecommendationRecord, SeniorDecisionDraft, SeniorDecisionRecord } from "../workflow/creditReviewState";
import { REVIEW_WORKFLOW_STATE_EVENT, STANDARD_STORAGE_PREFIX } from "../workflow/usePersistentReviewState";

export type StandardReviewWorkflowState = {
  version: 1;
  reviewedFindingIds: string[];
  recommendationSubmitted: boolean;
  recommendationDraft?: AnalystRecommendationDraft;
  recommendation?: AnalystRecommendationRecord;
  recommendationHistory?: AnalystRecommendationRecord[];
  seniorDecision?: SeniorDecisionRecord;
  seniorDecisionDraft?: SeniorDecisionDraft;
  decisionHistory?: SeniorDecisionRecord[];
};

export type StandardReviewWorkflowAction =
  | { type: "toggle_finding"; findingId: string }
  | { type: "save_recommendation_draft"; draft: AnalystRecommendationDraft }
  | { type: "submit_recommendation"; record: AnalystRecommendationRecord }
  | { type: "record_senior_decision"; record: SeniorDecisionRecord }
  | { type: "save_senior_decision_draft"; draft: SeniorDecisionDraft }
  | { type: "reopen_returned_recommendation"; at?: string }
  | { type: "replace_state"; state: StandardReviewWorkflowState };

export { STANDARD_STORAGE_PREFIX } from "../workflow/usePersistentReviewState";

export function standardReviewStorageKey(slug: string) {
  return `${STANDARD_STORAGE_PREFIX}${slug}`;
}

export function createInitialStandardReviewState(): StandardReviewWorkflowState {
  return { version: 1, reviewedFindingIds: [], recommendationSubmitted: false };
}

export function isStandardReviewRevisionInProgress(state: StandardReviewWorkflowState) {
  return !state.seniorDecision
    && !state.recommendationSubmitted
    && !state.recommendation
    && Boolean(state.decisionHistory?.some((record) => record.decision === "return_to_analyst"));
}

export function standardReviewReducer(state: StandardReviewWorkflowState, action: StandardReviewWorkflowAction): StandardReviewWorkflowState {
  switch (action.type) {
    case "replace_state": return action.state;
    case "toggle_finding":
      return state.reviewedFindingIds.includes(action.findingId)
        ? { ...state, reviewedFindingIds: state.reviewedFindingIds.filter((id) => id !== action.findingId) }
        : { ...state, reviewedFindingIds: [...state.reviewedFindingIds, action.findingId] };
    case "save_recommendation_draft":
      return state.recommendationSubmitted || state.seniorDecision
        ? state
        : { ...state, recommendationDraft: action.draft };
    case "submit_recommendation": {
      if (state.seniorDecision || !action.record.decision.trim() || !action.record.rationale.trim()) return state;
      const recommendationHistory = state.recommendationHistory?.some((record) => record.createdAt === action.record.createdAt)
        ? state.recommendationHistory
        : [action.record, ...(state.recommendationHistory ?? [])];
      return {
        ...state,
        recommendationSubmitted: true,
        recommendationDraft: undefined,
        recommendation: action.record,
        recommendationHistory,
      };
    }
    case "record_senior_decision":
      if (!state.recommendationSubmitted || state.seniorDecision) return state;
      return {
        ...state,
        seniorDecisionDraft: undefined,
        seniorDecision: action.record,
        recommendationHistory: state.recommendation && !state.recommendationHistory?.some((record) => record.createdAt === state.recommendation?.createdAt)
          ? [state.recommendation, ...(state.recommendationHistory ?? [])]
          : state.recommendationHistory,
        decisionHistory: state.decisionHistory?.some((record) => record.createdAt === action.record.createdAt)
          ? state.decisionHistory
          : [action.record, ...(state.decisionHistory ?? [])],
      };
    case "save_senior_decision_draft":
      return state.recommendationSubmitted && !state.seniorDecision ? { ...state, seniorDecisionDraft: action.draft } : state;
    case "reopen_returned_recommendation":
      if (state.seniorDecision?.decision !== "return_to_analyst" || !state.recommendation) return state;
      return {
        ...state,
        recommendationSubmitted: false,
        recommendationDraft: {
          decision: state.recommendation.decision,
          amount: state.recommendation.amount,
          rationale: state.recommendation.rationale,
          conditions: [...state.recommendation.conditions],
          activeSection: 1,
          updatedAt: action.at ?? new Date().toISOString(),
        },
        recommendationHistory: state.recommendationHistory?.some((record) => record.createdAt === state.recommendation?.createdAt)
          ? state.recommendationHistory
          : [state.recommendation, ...(state.recommendationHistory ?? [])],
        recommendation: undefined,
        seniorDecision: undefined,
        seniorDecisionDraft: undefined,
        decisionHistory: state.decisionHistory?.some((record) => record.createdAt === state.seniorDecision?.createdAt)
          ? state.decisionHistory
          : [state.seniorDecision, ...(state.decisionHistory ?? [])],
      };
  }
}

function readState(storageKey: string) {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as StandardReviewWorkflowState : createInitialStandardReviewState();
  } catch {
    return createInitialStandardReviewState();
  }
}

export function usePersistentStandardReviewState(slug: string) {
  const storageKey = standardReviewStorageKey(slug);
  const [state, dispatch] = useReducer(standardReviewReducer, storageKey, readState);
  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(REVIEW_WORKFLOW_STATE_EVENT, { detail: { storageKey } }));
  }, [state, storageKey]);
  return [state, dispatch] as const;
}

export function readPersistedStandardReviewState(slug: string) {
  return readState(standardReviewStorageKey(slug));
}
