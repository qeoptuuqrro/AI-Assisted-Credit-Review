export type PolicyRuleId =
  | "downside-coverage-floor"
  | "leverage-ceiling"
  | "customer-concentration-monitoring"
  | "forecast-completeness-requirement";

export type PolicyRuleStatus = "active" | "paused";
export type PolicyRuleMetric =
  | "downside_fixed_charge_coverage_ratio"
  | "total_leverage_ratio"
  | "top_two_customer_revenue_percent"
  | "forward_forecast_months";
export type PolicyValueUnit = "multiple" | "percentage" | "months";
export type ThresholdDirection = "maximum" | "minimum";
export type ThresholdComparator = "less_than_or_equal" | "greater_than_or_equal";
export type PolicyThresholdBasis = "bank_policy" | "bank_monitoring_threshold" | "proposed_facility_covenant";

type BankControlled = {
  controlledBy: "bank";
};

export type PolicyCalculationDefinition = BankControlled & {
  metric: PolicyRuleMetric;
  label: string;
  method: string;
};

export type PolicyThreshold = BankControlled & {
  direction: ThresholdDirection;
  comparator: ThresholdComparator;
  value: number;
  displayValue: string;
  unit: PolicyValueUnit;
  basis: PolicyThresholdBasis;
};

export type PolicyRuleScope = {
  type: "portfolio" | "facility";
  id: string;
  label: string;
  status: "effective" | "proposed";
  description: string;
};

export type PolicyEvidenceRequirement = {
  id: string;
  label: string;
  description: string;
};

export type PolicyEvidenceDefinition = BankControlled & {
  required: readonly PolicyEvidenceRequirement[];
};

export type PolicyAction = {
  id: string;
  label: string;
  description: string;
  humanReviewRequired: boolean;
};

export type PolicyActionDefinition = BankControlled & {
  withinPolicy: PolicyAction;
  outsidePolicy: PolicyAction;
  unresolvedEvidence: PolicyAction;
};

export type PolicyRule = BankControlled & {
  id: PolicyRuleId;
  name: string;
  summary: string;
  status: PolicyRuleStatus;
  owner: string;
  version: string;
  effectiveDate: string;
  scope: PolicyRuleScope;
  calculation: PolicyCalculationDefinition;
  threshold: PolicyThreshold;
  evidence: PolicyEvidenceDefinition;
  actions: PolicyActionDefinition;
};

const thresholdComparatorByDirection = {
  maximum: "less_than_or_equal",
  minimum: "greater_than_or_equal",
} as const satisfies Record<ThresholdDirection, ThresholdComparator>;

export function getThresholdComparator<Direction extends ThresholdDirection>(
  direction: Direction,
): (typeof thresholdComparatorByDirection)[Direction] {
  return thresholdComparatorByDirection[direction];
}

export const policyRules = [
  {
    id: "downside-coverage-floor",
    name: "Downside coverage floor",
    summary: "Requires downside fixed-charge coverage to meet the bank-approved minimum.",
    status: "active",
    controlledBy: "bank",
    owner: "Commercial Credit Policy",
    version: "CR-4.3",
    effectiveDate: "2026-07-01",
    scope: {
      type: "portfolio",
      id: "commercial-credit",
      label: "Commercial credit portfolio",
      status: "effective",
      description: "Applies to commercial facilities subject to downside repayment analysis.",
    },
    calculation: {
      controlledBy: "bank",
      metric: "downside_fixed_charge_coverage_ratio",
      label: "Downside fixed-charge coverage",
      method: "The bank calculation service divides approved downside cash flow by scheduled fixed charges.",
    },
    threshold: {
      controlledBy: "bank",
      direction: "minimum",
      comparator: getThresholdComparator("minimum"),
      value: 1.2,
      displayValue: "1.20x",
      unit: "multiple",
      basis: "bank_policy",
    },
    evidence: {
      controlledBy: "bank",
      required: [
        {
          id: "approved-downside-forecast",
          label: "Approved downside forecast",
          description: "Forecast cash flow with approved downside assumptions and attribution.",
        },
        {
          id: "scheduled-fixed-charges",
          label: "Scheduled fixed charges",
          description: "Principal, interest, lease, and other required financing payments.",
        },
      ],
    },
    actions: {
      controlledBy: "bank",
      withinPolicy: {
        id: "continue-to-coverage-judgment",
        label: "Continue to analyst judgment",
        description: "Carry the verified downside result into the analyst recommendation.",
        humanReviewRequired: true,
      },
      outsidePolicy: {
        id: "escalate-coverage-shortfall",
        label: "Escalate coverage shortfall",
        description: "Require documented mitigants or a senior-credit policy exception.",
        humanReviewRequired: true,
      },
      unresolvedEvidence: {
        id: "request-coverage-evidence",
        label: "Request coverage evidence",
        description: "Hold the evaluation until downside cash flow and fixed charges are verified.",
        humanReviewRequired: true,
      },
    },
  },
  {
    id: "leverage-ceiling",
    name: "Leverage ceiling",
    summary: "Compares verified Meridian leverage with the proposed maximum for this facility.",
    status: "active",
    controlledBy: "bank",
    owner: "Commercial Credit Policy",
    version: "MER-2026.07",
    effectiveDate: "2026-07-21",
    scope: {
      type: "facility",
      id: "meridian-foods-proposed-facility",
      label: "Meridian Foods proposed facility",
      status: "proposed",
      description: "Uses the proposed leverage covenant for Meridian's requested facility; it is not an enterprise-wide maximum.",
    },
    calculation: {
      controlledBy: "bank",
      metric: "total_leverage_ratio",
      label: "Verified total debt / EBITDA",
      method: "The bank calculation service classifies funded debt and applies approved EBITDA adjustments.",
    },
    threshold: {
      controlledBy: "bank",
      direction: "maximum",
      comparator: getThresholdComparator("maximum"),
      value: 4.25,
      displayValue: "4.25x proposed facility maximum",
      unit: "multiple",
      basis: "proposed_facility_covenant",
    },
    evidence: {
      controlledBy: "bank",
      required: [
        {
          id: "current-debt-schedule",
          label: "Current debt schedule",
          description: "Outstanding funded debt, maturities, leases, and other financing obligations.",
        },
        {
          id: "verified-ebitda",
          label: "Verified trailing EBITDA",
          description: "Approved financial statements and documented normalization adjustments.",
        },
      ],
    },
    actions: {
      controlledBy: "bank",
      withinPolicy: {
        id: "continue-to-leverage-judgment",
        label: "Continue to analyst judgment",
        description: "Preserve the facility comparison and require the analyst to own the recommendation.",
        humanReviewRequired: true,
      },
      outsidePolicy: {
        id: "escalate-leverage-exception",
        label: "Escalate proposed covenant exception",
        description: "Route the facility variance and supporting evidence to senior credit for decision.",
        humanReviewRequired: true,
      },
      unresolvedEvidence: {
        id: "request-leverage-evidence",
        label: "Request classification evidence",
        description: "Do not evaluate the facility maximum until every material obligation is classified.",
        humanReviewRequired: true,
      },
    },
  },
  {
    id: "customer-concentration-monitoring",
    name: "Customer concentration monitoring",
    summary: "Flags top-two customer revenue concentration above the bank's monitoring threshold.",
    status: "active",
    controlledBy: "bank",
    owner: "Portfolio Risk Policy",
    version: "PR-3.1",
    effectiveDate: "2026-04-01",
    scope: {
      type: "portfolio",
      id: "commercial-credit",
      label: "Commercial credit portfolio",
      status: "effective",
      description: "Applies to borrowers evaluated with customer-level revenue reporting.",
    },
    calculation: {
      controlledBy: "bank",
      metric: "top_two_customer_revenue_percent",
      label: "Top-two customer revenue",
      method: "The bank calculation service sums the two largest verified customer revenue shares.",
    },
    threshold: {
      controlledBy: "bank",
      direction: "maximum",
      comparator: getThresholdComparator("maximum"),
      value: 50,
      displayValue: "50% monitoring threshold",
      unit: "percentage",
      basis: "bank_monitoring_threshold",
    },
    evidence: {
      controlledBy: "bank",
      required: [
        {
          id: "customer-concentration-report",
          label: "Customer concentration report",
          description: "Current customer-level revenue with totals reconciled to approved financial statements.",
        },
      ],
    },
    actions: {
      controlledBy: "bank",
      withinPolicy: {
        id: "retain-standard-monitoring",
        label: "Retain standard monitoring",
        description: "Keep the verified concentration result in the review record.",
        humanReviewRequired: false,
      },
      outsidePolicy: {
        id: "open-concentration-monitoring",
        label: "Open concentration monitoring",
        description: "Require analyst judgment on contract durability, mitigants, and recommendation terms.",
        humanReviewRequired: true,
      },
      unresolvedEvidence: {
        id: "request-concentration-report",
        label: "Request concentration evidence",
        description: "Do not calculate concentration from incomplete customer-level revenue.",
        humanReviewRequired: true,
      },
    },
  },
  {
    id: "forecast-completeness-requirement",
    name: "Forecast completeness requirement",
    summary: "Requires a complete forward forecast before downside repayment analysis can proceed.",
    status: "active",
    controlledBy: "bank",
    owner: "Commercial Credit Policy",
    version: "CR-5.2",
    effectiveDate: "2026-07-01",
    scope: {
      type: "portfolio",
      id: "commercial-credit",
      label: "Commercial credit portfolio",
      status: "effective",
      description: "Applies when a review depends on forward repayment capacity.",
    },
    calculation: {
      controlledBy: "bank",
      metric: "forward_forecast_months",
      label: "Complete forward forecast horizon",
      method: "The bank calculation service counts reconciled monthly forecast periods after the latest actuals.",
    },
    threshold: {
      controlledBy: "bank",
      direction: "minimum",
      comparator: getThresholdComparator("minimum"),
      value: 12,
      displayValue: "12 months",
      unit: "months",
      basis: "bank_policy",
    },
    evidence: {
      controlledBy: "bank",
      required: [
        {
          id: "approved-operating-forecast",
          label: "Approved operating forecast",
          description: "Income statement, cash flow, and downside assumptions reconciled to latest actuals.",
        },
      ],
    },
    actions: {
      controlledBy: "bank",
      withinPolicy: {
        id: "allow-downside-analysis",
        label: "Allow downside analysis",
        description: "Make the complete forecast available to bank calculations and analyst review.",
        humanReviewRequired: false,
      },
      outsidePolicy: {
        id: "block-incomplete-forecast",
        label: "Require complete forecast",
        description: "Stop dependent calculations until the full forecast horizon is verified.",
        humanReviewRequired: true,
      },
      unresolvedEvidence: {
        id: "request-operating-forecast",
        label: "Request operating forecast",
        description: "Do not infer forward repayment capacity from missing forecast periods.",
        humanReviewRequired: true,
      },
    },
  },
] as const satisfies readonly [PolicyRule, PolicyRule, PolicyRule, PolicyRule];

export const downsideCoverageFloorRule = policyRules[0];
export const leverageCeilingRule = policyRules[1];
export const customerConcentrationMonitoringRule = policyRules[2];
export const forecastCompletenessRequirementRule = policyRules[3];

export type CalculationValue = {
  value: number;
  displayValue: string;
};

export type CalculationEvidence = {
  id: string;
  label: string;
  verifiedAt: string;
};

export type CalculationAdjustment = {
  id: string;
  label: string;
  amountUsd: number;
  displayAmount: string;
  treatment: string;
  evidenceId: string;
};

type CalculationOutputBase = {
  id: string;
  caseId: string;
  metric: PolicyRuleMetric;
  calculatedBy: "bank_calculation_service";
};

export type VerifiedCalculationOutput = CalculationOutputBase & {
  state: "verified";
  result: CalculationValue;
  priorResult?: CalculationValue;
  evidence: readonly CalculationEvidence[];
  adjustments: readonly CalculationAdjustment[];
  verifiedAt: string;
};

export type UnresolvedCalculationEvidence = {
  requirementId: string;
  label: string;
  reason: string;
};

export type UnresolvedCalculationOutput = CalculationOutputBase & {
  state: "unresolved";
  lastCalculatedResult?: CalculationValue;
  unresolvedEvidence: readonly UnresolvedCalculationEvidence[];
};

export type CalculationOutput = VerifiedCalculationOutput | UnresolvedCalculationOutput;

type PolicyEvaluationBase = {
  ruleId: PolicyRuleId;
  calculationId: string;
  evaluatedBy: "bank_policy_engine";
  threshold: PolicyThreshold;
};

export type EvaluatedPolicyResult = PolicyEvaluationBase & {
  state: "evaluated";
  policyOutcome: "within_policy" | "outside_policy";
  observed: CalculationValue;
  policyMargin: number;
  action: PolicyAction;
};

export type EvidenceRequiredPolicyResult = PolicyEvaluationBase & {
  state: "evidence_required";
  policyOutcome: "not_evaluated";
  missingEvidence: readonly UnresolvedCalculationEvidence[];
  action: PolicyAction;
};

export type PolicyEvaluation = EvaluatedPolicyResult | EvidenceRequiredPolicyResult;

export function assertValidCalculationValue(observedValue: number) {
  if (!Number.isFinite(observedValue)) {
    throw new RangeError("Verified policy calculation values must be finite numbers.");
  }

  if (observedValue < 0) {
    throw new RangeError("Verified policy calculation values cannot be negative.");
  }
}

export function isValueWithinPolicy(threshold: PolicyThreshold, observedValue: number) {
  assertValidCalculationValue(observedValue);

  return threshold.comparator === "less_than_or_equal"
    ? observedValue <= threshold.value
    : observedValue >= threshold.value;
}

function roundPolicyMargin(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function evaluatePolicyRule(rule: PolicyRule, calculation: CalculationOutput): PolicyEvaluation {
  if (rule.calculation.metric !== calculation.metric) {
    throw new Error(`Calculation metric ${calculation.metric} does not match policy rule ${rule.id}.`);
  }

  if (calculation.state === "unresolved") {
    return {
      state: "evidence_required",
      policyOutcome: "not_evaluated",
      ruleId: rule.id,
      calculationId: calculation.id,
      evaluatedBy: "bank_policy_engine",
      threshold: rule.threshold,
      missingEvidence: calculation.unresolvedEvidence,
      action: rule.actions.unresolvedEvidence,
    };
  }

  const withinPolicy = isValueWithinPolicy(rule.threshold, calculation.result.value);
  const rawMargin = rule.threshold.direction === "maximum"
    ? rule.threshold.value - calculation.result.value
    : calculation.result.value - rule.threshold.value;

  return {
    state: "evaluated",
    policyOutcome: withinPolicy ? "within_policy" : "outside_policy",
    ruleId: rule.id,
    calculationId: calculation.id,
    evaluatedBy: "bank_policy_engine",
    threshold: rule.threshold,
    observed: calculation.result,
    policyMargin: roundPolicyMargin(rawMargin),
    action: withinPolicy ? rule.actions.withinPolicy : rule.actions.outsidePolicy,
  };
}

export const meridianPendingLeverageCalculation: UnresolvedCalculationOutput = {
  id: "meridian-leverage-pending",
  caseId: "meridian-foods",
  metric: "total_leverage_ratio",
  calculatedBy: "bank_calculation_service",
  state: "unresolved",
  lastCalculatedResult: {
    value: 3.7,
    displayValue: "3.7x",
  },
  unresolvedEvidence: [
    {
      requirementId: "current-debt-schedule",
      label: "$2.1M equipment obligation classification",
      reason: "The executed agreement must confirm whether the obligation counts as funded debt.",
    },
  ],
};

export const meridianLeverageCalculation: VerifiedCalculationOutput = {
  id: "meridian-leverage-verified",
  caseId: "meridian-foods",
  metric: "total_leverage_ratio",
  calculatedBy: "bank_calculation_service",
  state: "verified",
  priorResult: {
    value: 3.7,
    displayValue: "3.7x",
  },
  result: {
    value: 3.9,
    displayValue: "3.9x",
  },
  adjustments: [
    {
      id: "equipment-obligation",
      label: "Equipment obligation",
      amountUsd: 2_100_000,
      displayAmount: "$2.1M",
      treatment: "Included in funded debt",
      evidenceId: "equipment-obligation-agreement",
    },
  ],
  evidence: [
    {
      id: "equipment-obligation-agreement",
      label: "Equipment Obligation Agreement",
      verifiedAt: "2026-07-24T14:32:00.000Z",
    },
  ],
  verifiedAt: "2026-07-24T14:32:00.000Z",
};

export const meridianLeverageEvaluation = evaluatePolicyRule(
  leverageCeilingRule,
  meridianLeverageCalculation,
);

export type PolicyCaseOutcome = {
  caseId: string;
  borrowerName: string;
  calculation: CalculationOutput;
  evaluation: PolicyEvaluation;
  aiExplanation: {
    author: "AI";
    status: "draft_only";
    canChangePolicyResult: false;
    evidenceIds: readonly string[];
    summary: string;
  };
  risk: {
    status: "draft_only";
    prior: "Moderate" | "Material";
    current: "Moderate" | "Material";
    changed: boolean;
    displayValue: string;
  };
  humanReview: {
    status: "required";
    recommendationOwner: "Analyst";
    finalDecisionOwner: "Senior credit";
    message: string;
  };
};

export const meridianLeverageOutcome: PolicyCaseOutcome = {
  caseId: "meridian-foods",
  borrowerName: "Meridian Foods",
  calculation: meridianLeverageCalculation,
  evaluation: meridianLeverageEvaluation,
  aiExplanation: {
    author: "AI",
    status: "draft_only",
    canChangePolicyResult: false,
    evidenceIds: ["equipment-obligation-agreement"],
    summary: "Verified equipment terms add the $2.1M obligation to funded debt, moving leverage from 3.7x to 3.9x. The result remains below the 4.25x proposed maximum for the Meridian facility, so the Moderate risk rating is unchanged.",
  },
  risk: {
    status: "draft_only",
    prior: "Moderate",
    current: "Moderate",
    changed: false,
    displayValue: "Moderate unchanged",
  },
  humanReview: {
    status: "required",
    recommendationOwner: "Analyst",
    finalDecisionOwner: "Senior credit",
    message: "Human review is required. The analyst owns the recommendation; senior credit owns the final decision.",
  },
};
