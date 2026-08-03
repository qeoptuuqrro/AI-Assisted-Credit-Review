import { describe, expect, it } from "vitest";
import {
  evaluatePolicyRule,
  getThresholdComparator,
  isValueWithinPolicy,
  leverageCeilingRule,
  meridianLeverageCalculation,
  meridianLeverageOutcome,
  meridianPendingLeverageCalculation,
  policyRules,
} from "./policyRulesData";

describe("Policy Rules domain model", () => {
  it("maps maximum and minimum thresholds to the bank-controlled comparators", () => {
    expect(policyRules).toHaveLength(4);
    expect(policyRules.map((rule) => rule.name)).toEqual([
      "Downside coverage floor",
      "Leverage ceiling",
      "Customer concentration monitoring",
      "Forecast completeness requirement",
    ]);
    expect(policyRules.map((rule) => rule.id)).toEqual([
      "downside-coverage-floor",
      "leverage-ceiling",
      "customer-concentration-monitoring",
      "forecast-completeness-requirement",
    ]);
    expect(policyRules.map((rule) => rule.calculation.metric)).toEqual([
      "downside_fixed_charge_coverage_ratio",
      "total_leverage_ratio",
      "top_two_customer_revenue_percent",
      "forward_forecast_months",
    ]);
    expect(policyRules.map((rule) => [rule.threshold.direction, rule.threshold.comparator])).toEqual([
      ["minimum", "greater_than_or_equal"],
      ["maximum", "less_than_or_equal"],
      ["maximum", "less_than_or_equal"],
      ["minimum", "greater_than_or_equal"],
    ]);
    expect(getThresholdComparator("maximum")).toBe("less_than_or_equal");
    expect(getThresholdComparator("minimum")).toBe("greater_than_or_equal");
    expect(isValueWithinPolicy(leverageCeilingRule.threshold, 4.25)).toBe(true);
    expect(isValueWithinPolicy(leverageCeilingRule.threshold, 4.26)).toBe(false);

    expect(policyRules.every((rule) => (
      rule.controlledBy === "bank"
      && rule.calculation.controlledBy === "bank"
      && rule.threshold.controlledBy === "bank"
      && rule.evidence.controlledBy === "bank"
      && rule.actions.controlledBy === "bank"
    ))).toBe(true);
    expect(policyRules.every((rule) => (
      rule.owner.length > 0
      && rule.version.length > 0
      && rule.effectiveDate.length > 0
      && rule.scope.label.length > 0
    ))).toBe(true);
    expect(leverageCeilingRule).toMatchObject({
      owner: "Commercial Credit Policy",
      scope: {
        type: "facility",
        id: "meridian-foods-proposed-facility",
        status: "proposed",
      },
      threshold: {
        basis: "proposed_facility_covenant",
        value: 4.25,
        displayValue: "4.25x proposed facility maximum",
      },
    });
  });

  it("withholds policy evaluation while material evidence is unresolved", () => {
    const evaluation = evaluatePolicyRule(
      leverageCeilingRule,
      meridianPendingLeverageCalculation,
    );

    expect(meridianPendingLeverageCalculation).toMatchObject({
      state: "unresolved",
      lastCalculatedResult: { value: 3.7, displayValue: "3.7x" },
      unresolvedEvidence: [
        {
          label: "$2.1M equipment obligation classification",
        },
      ],
    });
    expect(evaluation).toMatchObject({
      state: "evidence_required",
      policyOutcome: "not_evaluated",
      ruleId: "leverage-ceiling",
      missingEvidence: [
        {
          requirementId: "current-debt-schedule",
        },
      ],
      action: {
        id: "request-leverage-evidence",
        humanReviewRequired: true,
      },
    });
    expect(evaluation).not.toHaveProperty("observed");
    expect(evaluation).not.toHaveProperty("policyMargin");
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
    ["negative ratio", -0.1],
  ])("rejects a verified %s calculation instead of producing a policy outcome", (_label, value) => {
    const invalidCalculation = {
      ...meridianLeverageCalculation,
      id: "meridian-leverage-invalid",
      result: {
        value,
        displayValue: String(value),
      },
    };

    expect(() => evaluatePolicyRule(leverageCeilingRule, invalidCalculation)).toThrow(RangeError);
  });

  it("keeps the exact Meridian calculation, policy result, AI explanation, and human ownership separate", () => {
    expect(meridianLeverageCalculation).toMatchObject({
      state: "verified",
      priorResult: { value: 3.7, displayValue: "3.7x" },
      result: { value: 3.9, displayValue: "3.9x" },
      adjustments: [
        {
          label: "Equipment obligation",
          amountUsd: 2_100_000,
          displayAmount: "$2.1M",
          treatment: "Included in funded debt",
        },
      ],
    });
    expect(meridianLeverageCalculation).not.toHaveProperty("threshold");
    expect(meridianLeverageCalculation).not.toHaveProperty("policyOutcome");

    expect(meridianLeverageOutcome.evaluation).toMatchObject({
      state: "evaluated",
      policyOutcome: "within_policy",
      observed: { value: 3.9, displayValue: "3.9x" },
      threshold: {
        direction: "maximum",
        value: 4.25,
        displayValue: "4.25x proposed facility maximum",
        basis: "proposed_facility_covenant",
      },
      policyMargin: 0.35,
      action: {
        label: "Continue to analyst judgment",
        humanReviewRequired: true,
      },
    });
    expect(meridianLeverageOutcome.aiExplanation).toMatchObject({
      author: "AI",
      status: "draft_only",
      canChangePolicyResult: false,
      evidenceIds: ["equipment-obligation-agreement"],
    });
    expect(meridianLeverageOutcome.aiExplanation.summary).toContain("3.7x to 3.9x");
    expect(meridianLeverageOutcome.aiExplanation.summary).toContain("$2.1M obligation");
    expect(meridianLeverageOutcome.aiExplanation.summary).toContain("4.25x proposed maximum for the Meridian facility");
    expect(meridianLeverageOutcome.evaluation.evaluatedBy).toBe("bank_policy_engine");
    expect(meridianLeverageOutcome.risk).toEqual({
      status: "draft_only",
      prior: "Moderate",
      current: "Moderate",
      changed: false,
      displayValue: "Moderate unchanged",
    });
    expect(meridianLeverageOutcome.humanReview).toEqual({
      status: "required",
      recommendationOwner: "Analyst",
      finalDecisionOwner: "Senior credit",
      message: "Human review is required. The analyst owns the recommendation; senior credit owns the final decision.",
    });
  });
});
