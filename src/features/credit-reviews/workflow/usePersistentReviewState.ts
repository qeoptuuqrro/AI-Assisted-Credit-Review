import { useEffect, useReducer, useState, type Reducer } from "react";

export const MERIDIAN_STORAGE_KEY = "bcgx.credit-review.meridian.v1";
export const NORTHSTAR_STORAGE_KEY = "bcgx.credit-review.northstar.v1";
export const REVIEW_WORKFLOW_STATE_EVENT = "bcgx:credit-review-workflow-state";
export const STANDARD_STORAGE_PREFIX = "bcgx.credit-review.standard.v1.";

export function readPersistedReviewState<State>(storageKey: string, fallback: State): State {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as State : fallback;
  } catch {
    return fallback;
  }
}

export function usePersistentReviewState<State, Action>(reducer: Reducer<State, Action>, fallback: State, storageKey: string) {
  const [state, dispatch] = useReducer(reducer, fallback, (initial) => readPersistedReviewState(storageKey, initial));

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(REVIEW_WORKFLOW_STATE_EVENT, { detail: { storageKey } }));
  }, [state, storageKey]);

  return [state, dispatch] as const;
}

export function useReviewWorkflowRevision(storageKeys: string[] = [MERIDIAN_STORAGE_KEY, NORTHSTAR_STORAGE_KEY]) {
  const [revision, setRevision] = useState(0);
  const storageKeySignature = storageKeys.join("|");

  useEffect(() => {
    const allowedKeys = new Set(storageKeySignature.split("|").filter(Boolean));
    const handleWorkflowState = (event: Event) => {
      const storageKey = (event as CustomEvent<{ storageKey?: string }>).detail?.storageKey;
      if (storageKey && allowedKeys.has(storageKey)) setRevision((current) => current + 1);
    };
    window.addEventListener(REVIEW_WORKFLOW_STATE_EVENT, handleWorkflowState);
    return () => window.removeEventListener(REVIEW_WORKFLOW_STATE_EVENT, handleWorkflowState);
  }, [storageKeySignature]);

  return revision;
}

export function clearReviewDemoState() {
  window.sessionStorage.removeItem(MERIDIAN_STORAGE_KEY);
  window.sessionStorage.removeItem(NORTHSTAR_STORAGE_KEY);
  for (const key of Object.keys(window.sessionStorage)) {
    if (key.startsWith(STANDARD_STORAGE_PREFIX)) window.sessionStorage.removeItem(key);
  }
}
