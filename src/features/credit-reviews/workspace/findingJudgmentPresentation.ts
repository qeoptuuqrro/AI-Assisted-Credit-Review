import type { IconName } from "../../../shared/ui/Icon/Icon";
import type { StatusPillTone } from "../../../shared/ui/StatusPill/StatusPill";
import { evidenceRequirements, findingRequirementIds } from "../workflow/evidenceWorkflow";
import type { FindingWorkflowState, JudgmentRecord } from "../workflow/creditReviewState";
import type { FindingDefinition, RiskLevel } from "./meridianData";

type FindingStatusPresentation = {
  label: string;
  tone: StatusPillTone;
};

const workflowPresentation: Record<FindingWorkflowState, FindingStatusPresentation> = {
  needs_judgment: { label: "Needs judgment", tone: "warning" },
  needs_verification: { label: "Needs verification", tone: "danger" },
  analysis_ready: { label: "Analysis ready", tone: "info" },
  review_complete: { label: "Review complete", tone: "success" },
  escalated: { label: "Escalated", tone: "warning" },
};

export function getFindingStatusPresentation(state: FindingWorkflowState, judgment?: JudgmentRecord): FindingStatusPresentation {
  if (state === "escalated" || judgment?.decision === "escalate") return { label: "Escalated to senior", tone: "warning" };
  if (state === "review_complete" && judgment?.decision === "revise") return { label: "Revised by analyst", tone: "info" };
  if (state === "review_complete" && judgment?.decision === "accept") return { label: "Accepted by analyst", tone: "success" };
  return workflowPresentation[state];
}

export function getFindingDisplayRisk(finding: FindingDefinition, reassessed: boolean, judgment?: JudgmentRecord): RiskLevel {
  if (judgment?.decision === "revise" && judgment.revisedRisk) return judgment.revisedRisk;
  if (reassessed) return evidenceRequirements[findingRequirementIds[finding.id]].result.updatedRisk ?? finding.updatedRisk ?? finding.initialRisk;
  return finding.initialRisk;
}

export function getFindingDisplaySummary(finding: FindingDefinition, reassessed: boolean, judgment?: JudgmentRecord) {
  if (judgment?.decision === "revise" && judgment.revisedConclusion) return judgment.revisedConclusion;
  if (!reassessed) return finding.summary;
  if (finding.id === "customer-concentration") return "The renewed contract lowers near-term expiration risk; 61% top-two concentration remains.";
  if (finding.id === "declining-margins") return "July actuals improve evidence quality, but 1.12x downside coverage remains below policy.";
  return "The equipment obligation is funded debt; leverage is 3.9x with 0.35x of covenant headroom.";
}

export function getFindingScanSummary(finding: FindingDefinition, reassessed: boolean) {
  if (!reassessed) return finding.scanSummary;
  if (finding.id === "customer-concentration") return "61% concentration · Renewal through Mar 2030";
  if (finding.id === "declining-margins") return "9.1% margin · 1.12x downside coverage";
  return "3.9x leverage · 0.35x covenant headroom";
}

export function getJudgmentPresentation(judgment: JudgmentRecord) {
  if (judgment.decision === "revise") {
    return { title: "Revised by analyst", status: "Analyst revision", tone: "info" as const, icon: "refresh" as IconName };
  }
  if (judgment.decision === "escalate") {
    return { title: "Escalated to senior review", status: "Escalated", tone: "warning" as const, icon: "alertCircle" as IconName };
  }
  return { title: "Accepted by analyst", status: "Accepted", tone: "success" as const, icon: "checkCircle" as IconName };
}

export function formatJudgmentTimestamp(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "Recorded" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
