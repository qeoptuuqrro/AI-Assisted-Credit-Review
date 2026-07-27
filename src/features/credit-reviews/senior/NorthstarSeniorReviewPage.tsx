import { useEffect } from "react";
import { useRouter } from "../../../app/router";
import { companyLogoDomains } from "../companyLogos";
import { createInitialNorthstarState, createNorthstarPreset, northstarReviewReducer, type AnalystRecommendationRecord, type SeniorDecisionDraft, type SeniorDecisionRecord } from "../workflow/creditReviewState";
import { NORTHSTAR_STORAGE_KEY, usePersistentReviewState } from "../workflow/usePersistentReviewState";
import { SeniorReviewPackage } from "./SeniorReviewPackage";

export function NorthstarSeniorReviewPage() {
  const { navigate, search } = useRouter();
  const [state, dispatch] = usePersistentReviewState(northstarReviewReducer, createInitialNorthstarState(), NORTHSTAR_STORAGE_KEY);
  const requestedPreset = new URLSearchParams(search).get("preset");
  useEffect(() => {
    if (requestedPreset === "northstar-senior-review") {
      dispatch({ type: "replace_state", state: createNorthstarPreset("northstar-senior-review") });
      navigate("/credit-reviews/northstar-health/senior-decision/review", { replace: true });
      return;
    }
    if (!state.recommendation) navigate("/credit-reviews/northstar-health/recommendation", { replace: true });
  }, [dispatch, navigate, requestedPreset, state.recommendation]);
  const recommendation: AnalystRecommendationRecord = state.recommendation ?? createNorthstarPreset("northstar-senior-review").recommendation!;
  return <SeniorReviewPackage
    company="Northstar Health"
    logoDomain={companyLogoDomains["Northstar Health"]}
    request="$15M revolving line"
    facilityType="3-year revolving line"
    recommendation={recommendation}
    findings={[{ id: "forecast", title: "Downside coverage", detail: "Verified 1.29x fixed-charge coverage remains above the 1.20x policy floor.", risk: "Moderate", status: "Verified", tone: "info", icon: "calculator" }]}
    sourcesCount={state.request.fileName ? 1 : 0}
    draft={state.seniorDecisionDraft}
    existingDecision={state.seniorDecision}
    onDraftChange={(draft: SeniorDecisionDraft) => dispatch({ type: "save_senior_decision_draft", draft })}
    onExit={() => navigate("/credit-reviews/northstar-health/recommendation")}
    onOpenRecord={(tab) => navigate(`/credit-reviews/northstar-health/${tab}`)}
    onSubmit={(record) => {
      dispatch({ type: "record_senior_decision", record: { ...record, decisionMaker: "Morgan Lee", createdAt: new Date().toISOString() } });
      navigate("/credit-reviews/northstar-health/recommendation");
    }}
  />;
}
