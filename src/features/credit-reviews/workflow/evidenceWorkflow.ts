import type { FindingId, RiskLevel } from "../workspace/meridianData";

export type EvidenceRequirementId =
  | "customer-renewal"
  | "latest-operating-results"
  | "equipment-obligation-classification"
  | "northstar-operating-forecast";

export type EvidenceProvenance = "existing-source" | "analyst-upload" | "borrower-upload";
export type EvidenceIntakeStatus = "idle" | "requested" | "uploading" | "ready-for-review" | "verified" | "failed";

export type EvidenceRequestRecord = {
  recipientName: string;
  recipientRole: string;
  recipientEmail: string;
  dueDate: string;
  message: string;
  remindersEnabled: boolean;
  sentAt: string;
};

export type EvidenceIntakeState = {
  status: EvidenceIntakeStatus;
  fileName?: string;
  provenance?: EvidenceProvenance;
  error?: string;
  request?: EvidenceRequestRecord;
  verificationProgress?: {
    confirmedChecks: string[];
    analystContext?: string;
    updatedBy: string;
    updatedAt: string;
  };
};

export type EvidenceIntakeAction =
  | { type: "upload-started"; fileName: string; provenance: Exclude<EvidenceProvenance, "existing-source"> }
  | { type: "request-sent"; request: EvidenceRequestRecord }
  | { type: "existing-source-selected"; fileName: string }
  | { type: "upload-ready" }
  | { type: "verification-progress-updated"; confirmedChecks: string[]; analystContext?: string; updatedBy: string; updatedAt: string }
  | { type: "verification-complete" }
  | { type: "upload-failed"; message: string }
  | { type: "reset" };

export type EvidenceRequirement = {
  id: EvidenceRequirementId;
  findingId?: FindingId;
  title: string;
  description: string;
  fixtureFileName: string;
  acceptedFormats: string;
  currentAssumption: string;
  reviewScope: string;
  verificationChecks: string[];
  analystContextLabel: string;
  analystContextPlaceholder: string;
  initialContext: string;
  result: {
    title: string;
    description: string;
    explanation: string;
    initialRisk?: RiskLevel;
    updatedRisk?: RiskLevel;
    changedTitle: string;
    changedDescription: string;
    unchangedTitle: string;
    unchangedDescription: string;
    updatedBasis: string[];
  };
  existingSource?: {
    fileName: string;
    detail: string;
    suppliedBy: string;
    receivedAt: string;
  };
};

export const emptyEvidenceIntake: EvidenceIntakeState = { status: "idle" };

export function evidenceIntakeReducer(state: EvidenceIntakeState, action: EvidenceIntakeAction): EvidenceIntakeState {
  switch (action.type) {
    case "request-sent":
      return { status: "requested", request: action.request };
    case "upload-started":
      return { status: "uploading", fileName: action.fileName, provenance: action.provenance };
    case "existing-source-selected":
      return { status: "ready-for-review", fileName: action.fileName, provenance: "existing-source" };
    case "upload-ready":
      return state.fileName ? { ...state, status: "ready-for-review", error: undefined } : state;
    case "verification-progress-updated":
      return state.fileName && ["ready-for-review", "verified"].includes(state.status)
        ? {
            ...state,
            verificationProgress: {
              confirmedChecks: action.confirmedChecks,
              analystContext: action.analystContext,
              updatedBy: action.updatedBy,
              updatedAt: action.updatedAt,
            },
          }
        : state;
    case "verification-complete":
      return state.fileName ? { ...state, status: "verified", error: undefined } : state;
    case "upload-failed":
      return { ...state, status: "failed", error: action.message };
    case "reset":
      return emptyEvidenceIntake;
  }
}

export function evidenceProvenanceLabel(provenance: EvidenceProvenance | undefined) {
  if (provenance === "existing-source") return "Existing source";
  if (provenance === "borrower-upload") return "Borrower upload";
  if (provenance === "analyst-upload") return "Analyst upload";
  return "Not supplied";
}

export const evidenceRequirements: Record<EvidenceRequirementId, EvidenceRequirement> = {
  "customer-renewal": {
    id: "customer-renewal",
    findingId: "customer-concentration",
    title: "Renewal agreement or current customer contract",
    description: "Executed term, minimum-purchase provisions, and effective date",
    fixtureFileName: "Customer A Renewal Agreement.pdf",
    acceptedFormats: "PDF or DOCX",
    currentAssumption: "The current analysis assumes Customer A's agreement ends in March 2027 because the original source package did not include an enforceable renewal. A verified renewal can update this assumption without rerunning unrelated findings.",
    reviewScope: "Replace only the contract-duration assumption and rerun the affected concentration downside logic.",
    verificationChecks: ["Executed by both parties", "Term extends through March 2030", "Minimum-purchase provisions remain in effect"],
    analystContextLabel: "Relationship context",
    analystContextPlaceholder: "Optional context about renewal history or customer relationship...",
    initialContext: "Relationship team confirmed the renewal was executed after the original source package closed.",
    existingSource: {
      fileName: "Customer A renewal agreement",
      detail: "Executed Jul 18, 2026 · Term through Mar 2030",
      suppliedBy: "Relationship team",
      receivedAt: "Jul 18, 2026",
    },
    result: {
      title: "The near-term risk is lower",
      description: "The current contract changes the duration assumption without removing structural concentration.",
      explanation: "The renewal removes near-term Customer A loss from the downside case; 61% concentration still needs analyst judgment.",
      initialRisk: "Material",
      updatedRisk: "Moderate",
      changedTitle: "Contract term: Mar 2027 → Mar 2030",
      changedDescription: "Immediate Customer A revenue loss is no longer assumed in the downside period.",
      unchangedTitle: "61% top-two concentration",
      unchangedDescription: "The portfolio remains above the 50% monitoring threshold and still needs human interpretation.",
      updatedBasis: [
        "Customer A contributes 36% of revenue and Customer B contributes 25%.",
        "The verified renewal extends Customer A's executed contract through March 2030.",
        "The downside case no longer assumes near-term Customer A revenue loss, while structural concentration remains above the monitoring threshold.",
      ],
    },
  },
  "latest-operating-results": {
    id: "latest-operating-results",
    findingId: "declining-margins",
    title: "Latest operating results or pricing evidence",
    description: "Actual margin, realized pricing, volume, and commodity-cost performance",
    fixtureFileName: "July Operating Results.xlsx",
    acceptedFormats: "XLSX, CSV, PDF, or DOCX",
    currentAssumption: "Pricing actions recover only half of the margin decline, while downside fixed-charge coverage remains below policy.",
    reviewScope: "Update only the margin trend, pricing-execution evidence, and affected downside coverage conclusion.",
    verificationChecks: ["July actuals reconcile to the general ledger", "Realized pricing is separated from volume", "Downside coverage uses the 1.20x policy floor"],
    analystContextLabel: "Management execution context",
    analystContextPlaceholder: "Optional context about pricing timing, cost actions, or execution confidence...",
    initialContext: "Management reports that the first pricing wave is live, but only one month of actual performance is available.",
    result: {
      title: "The margin concern remains material",
      description: "The latest actuals improve evidence quality but do not yet demonstrate a durable recovery.",
      explanation: "July actuals improve evidence quality, but coverage remains below the 1.20x policy floor, so risk stays Material.",
      initialRisk: "Material",
      updatedRisk: "Material",
      changedTitle: "July actual performance added",
      changedDescription: "The assessment now uses observed pricing and commodity costs instead of plan-only assumptions.",
      unchangedTitle: "14.2% → 9.1% margin; 1.12x downside coverage",
      unchangedDescription: "Downside coverage remains below the 1.20x policy floor, so the material conclusion is retained.",
      updatedBasis: [
        "Gross margin remains 310 basis points below the prior-year period.",
        "July actuals replace part of the plan-only pricing assumption with observed execution evidence.",
        "Downside fixed-charge coverage remains 1.12x against the 1.20x policy floor.",
      ],
    },
  },
  "equipment-obligation-classification": {
    id: "equipment-obligation-classification",
    findingId: "increasing-leverage",
    title: "Equipment obligation agreement or classification evidence",
    description: "Executed agreement, payment terms, ownership rights, and policy classification",
    fixtureFileName: "Equipment Obligation Agreement.pdf",
    acceptedFormats: "PDF or DOCX",
    currentAssumption: "The $2.1M equipment obligation is treated as an operating lease pending verification.",
    reviewScope: "Resolve the obligation classification and rerun only leverage, covenant headroom, and affected downside logic.",
    verificationChecks: ["Agreement terms match the debt schedule", "Ownership and purchase rights are identified", "Classification is applied consistently with credit policy"],
    analystContextLabel: "Policy or legal context",
    analystContextPlaceholder: "Optional context from credit policy, counsel, or the relationship team...",
    initialContext: "The agreement includes a purchase option that may require funded-debt treatment under policy.",
    result: {
      title: "The equipment obligation now counts as funded debt",
      description: "Verified terms resolve the open classification and update leverage without creating a covenant breach.",
      explanation: "The purchase option raises leverage to 3.9x—still below the 4.25x maximum—so risk remains Moderate.",
      initialRisk: "Moderate",
      updatedRisk: "Moderate",
      changedTitle: "Pro forma leverage: 3.7x → 3.9x",
      changedDescription: "The $2.1M obligation is included in funded debt, leaving 0.35x of headroom to the 4.25x maximum.",
      unchangedTitle: "Moderate risk conclusion",
      unchangedDescription: "Leverage remains inside the proposed covenant, but the narrower headroom still requires analyst judgment.",
      updatedBasis: [
        "Funded debt increased by $9.4M over the last twelve months.",
        "The verified equipment agreement adds $2.1M to funded debt and updates pro forma leverage to 3.9x.",
        "The proposed 4.25x maximum leaves 0.35x of covenant headroom after reclassification.",
      ],
    },
  },
  "northstar-operating-forecast": {
    id: "northstar-operating-forecast",
    title: "2027 Operating Forecast",
    description: "Income statement, cash flow, and downside assumptions",
    fixtureFileName: "2027 Operating Forecast.xlsx",
    acceptedFormats: "XLSX, CSV, PDF, or DOCX",
    currentAssumption: "The approved source package ends in December 2026, so 2027 downside repayment capacity cannot be verified.",
    reviewScope: "Extend only the downside repayment analysis through 2027 and preserve all previously verified actuals.",
    verificationChecks: ["Board approval dated July 18, 2026", "Forecast reconciles to 2026 actuals", "Downside assumptions produce 1.29x fixed-charge coverage"],
    analystContextLabel: "Analyst context",
    analystContextPlaceholder: "Optional context about forecast approval or downside assumptions...",
    initialContext: "",
    result: {
      title: "Downside repayment capacity is verified",
      description: "The approved forecast completes the missing period without changing historical actuals.",
      explanation: "The forecast fills 2027 and shows 1.29x downside coverage, 0.09x above the 1.20x policy floor.",
      changedTitle: "2027 downside coverage: unavailable → 1.29x",
      changedDescription: "The forecast adds the missing period and shows 0.09x of headroom above the 1.20x policy floor.",
      unchangedTitle: "Current coverage: 1.36x",
      unchangedDescription: "Previously verified current-period performance remains unchanged.",
      updatedBasis: [
        "The approved 2027 forecast reconciles to previously verified 2026 actuals.",
        "The downside case now extends through 2027 and produces 1.29x fixed-charge coverage.",
        "The updated result remains 0.09x above the 1.20x policy floor.",
      ],
    },
  },
};

export const findingRequirementIds: Record<FindingId, EvidenceRequirementId> = {
  "customer-concentration": "customer-renewal",
  "declining-margins": "latest-operating-results",
  "increasing-leverage": "equipment-obligation-classification",
};

export function createEvidenceStateMap(ids: EvidenceRequirementId[]) {
  return Object.fromEntries(ids.map((id) => [id, emptyEvidenceIntake])) as Record<EvidenceRequirementId, EvidenceIntakeState>;
}
