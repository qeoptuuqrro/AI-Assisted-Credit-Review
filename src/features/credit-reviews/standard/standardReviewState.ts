import { useEffect, useReducer } from "react";
import type { AnalystRecommendationRecord, SeniorDecisionDraft, SeniorDecisionRecord } from "../workflow/creditReviewState";
import { REVIEW_WORKFLOW_STATE_EVENT, STANDARD_STORAGE_PREFIX } from "../workflow/usePersistentReviewState";

export type StandardReviewWorkflowState = {
  version: 1;
  reviewedFindingIds: string[];
  recommendationSubmitted: boolean;
  recommendation?: AnalystRecommendationRecord;
  seniorDecision?: SeniorDecisionRecord;
  seniorDecisionDraft?: SeniorDecisionDraft;
  decisionHistory?: SeniorDecisionRecord[];
};

export type StandardReviewWorkflowAction =
  | { type: "toggle_finding"; findingId: string }
  | { type: "submit_recommendation"; record: AnalystRecommendationRecord }
  | { type: "record_senior_decision"; record: SeniorDecisionRecord }
  | { type: "save_senior_decision_draft"; draft: SeniorDecisionDraft }
  | { type: "replace_state"; state: StandardReviewWorkflowState };

export { STANDARD_STORAGE_PREFIX } from "../workflow/usePersistentReviewState";

export function standardReviewStorageKey(slug: string) {
  return `${STANDARD_STORAGE_PREFIX}${slug}`;
}

export function createInitialStandardReviewState(): StandardReviewWorkflowState {
  return { version: 1, reviewedFindingIds: [], recommendationSubmitted: false };
}

export function standardReviewReducer(state: StandardReviewWorkflowState, action: StandardReviewWorkflowAction): StandardReviewWorkflowState {
  switch (action.type) {
    case "replace_state": return action.state;
    case "toggle_finding":
      return state.reviewedFindingIds.includes(action.findingId)
        ? { ...state, reviewedFindingIds: state.reviewedFindingIds.filter((id) => id !== action.findingId) }
        : { ...state, reviewedFindingIds: [...state.reviewedFindingIds, action.findingId] };
    case "submit_recommendation":
      return state.seniorDecision ? state : { ...state, recommendationSubmitted: true, recommendation: action.record };
    case "record_senior_decision":
      if (!state.recommendationSubmitted || state.seniorDecision) return state;
      return { ...state, seniorDecisionDraft: undefined, seniorDecision: action.record, decisionHistory: [action.record, ...(state.decisionHistory ?? [])] };
    case "save_senior_decision_draft":
      return state.recommendationSubmitted && !state.seniorDecision ? { ...state, seniorDecisionDraft: action.draft } : state;
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
