import { StatusPill, type StatusPillTone } from "../StatusPill/StatusPill";

export type CaseStatus =
  | "needs-verification"
  | "analyst-review"
  | "ready-to-recommend"
  | "awaiting-decision"
  | "revision-requested"
  | "approved"
  | "declined";

export const caseStatusPresentation: Record<CaseStatus, { label: string; tone: StatusPillTone }> = {
  "needs-verification": { label: "Needs verification", tone: "danger" },
  "analyst-review": { label: "Analyst review", tone: "neutral" },
  "ready-to-recommend": { label: "Ready to recommend", tone: "info" },
  "awaiting-decision": { label: "Awaiting decision", tone: "info" },
  "revision-requested": { label: "Revision requested", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
};

type CaseStatusPillProps = {
  status: CaseStatus;
};

export function CaseStatusPill({ status }: CaseStatusPillProps) {
  const presentation = caseStatusPresentation[status];
  return <StatusPill tone={presentation.tone}>{presentation.label}</StatusPill>;
}
