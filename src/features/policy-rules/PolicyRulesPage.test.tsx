// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "../../app/router";
import { PolicyRulesPage } from "./PolicyRulesPage";
import { policyRules, type PolicyRuleId } from "./policyRulesData";
import {
  POLICY_RULES_STORAGE_KEY,
  prototypePolicyViewerAccess,
  type PolicyRulesAccess,
} from "./policyRulesState";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/policy-rules");
  window.scrollTo = vi.fn();
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  window.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  window.localStorage.clear();
  document.body.style.overflow = "";
});

function renderPolicyRules(access?: PolicyRulesAccess) {
  return render(<RouterProvider><PolicyRulesPage access={access} /></RouterProvider>);
}

function openRuleBuilder() {
  fireEvent.click(screen.getByRole("button", { name: "Create policy" }));
}

function selectBuilderOption(label: string, option: string) {
  const combobox = screen.getByRole("combobox", { name: label });
  fireEvent.click(combobox);
  const listbox = screen.getByRole("listbox", { name: `${label} options` });
  fireEvent.click(within(listbox).getByRole("option", { name: option }));
}

function renderLeverageDetail(access?: PolicyRulesAccess) {
  window.history.replaceState({}, "", "/policy-rules/leverage-ceiling");
  return renderPolicyRules(access);
}

const policyInspectionCases = [
  { id: "downside-coverage-floor", buttonName: "Open Coverage floor", title: "Coverage floor" },
  { id: "leverage-ceiling", buttonName: "Open Leverage ceiling", title: "Leverage ceiling" },
  { id: "customer-concentration-monitoring", buttonName: "Open Customer concentration", title: "Customer concentration" },
  { id: "forecast-completeness-requirement", buttonName: "Open Forecast completeness", title: "Forecast completeness" },
] as const satisfies readonly { id: PolicyRuleId; buttonName: string; title: string }[];

const policyRevisionCases = [
  {
    buttonName: "Open Coverage floor",
    name: "Downside coverage floor",
    metric: "Downside fixed-charge coverage",
    comparator: "falls below",
    threshold: "1.20x",
    version: "CR-4.3",
  },
  {
    buttonName: "Open Leverage ceiling",
    name: "Leverage ceiling",
    metric: "Verified total leverage",
    comparator: "exceeds",
    threshold: "4.25x",
    version: "MER-2026.07",
  },
  {
    buttonName: "Open Customer concentration",
    name: "Customer concentration monitoring",
    metric: "Top-two customer revenue",
    comparator: "exceeds",
    threshold: "50%",
    version: "PR-3.1",
  },
  {
    buttonName: "Open Forecast completeness",
    name: "Forecast completeness requirement",
    metric: "Complete forward forecast horizon",
    comparator: "falls below",
    threshold: "12 months",
    version: "CR-5.2",
  },
] as const;

function getCompactThreshold(rule: (typeof policyRules)[number]) {
  if (rule.threshold.unit === "months") return `${rule.threshold.value} months`;
  return rule.threshold.displayValue.split(" ")[0];
}

describe("Policy Rules", () => {
  it("renders four scannable policy buttons without card-level rule detail", () => {
    renderPolicyRules();

    expect(screen.getByRole("heading", { name: "Assessment policies" })).toBeInTheDocument();
    expect(screen.getByText("Bank-defined thresholds, evidence requirements, and review actions.")).toBeInTheDocument();
    policyInspectionCases.forEach(({ buttonName }) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeInTheDocument();
    });

    expect(screen.queryByText("Downside coverage must remain at or above 1.20x.")).not.toBeInTheDocument();
    expect(screen.queryByText("Verified leverage must remain at or below 4.25x.")).not.toBeInTheDocument();
    expect(screen.queryByText("Top-two customer revenue above 50% requires review.")).not.toBeInTheDocument();
    expect(screen.queryByText("The approved forecast must cover the facility period.")).not.toBeInTheDocument();
    expect(screen.queryByText("Outcome")).not.toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();

    expect(screen.queryByText("Templates")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Rule library" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search policy rules" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Active" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paused" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^(Pause|Activate) / })).not.toBeInTheDocument();
  });

  it("opens a compact template chooser with an explicit AI drafting action", () => {
    renderPolicyRules();
    openRuleBuilder();

    expect(screen.getByRole("heading", { name: "Create policy" })).toBeInTheDocument();
    const progress = screen.getByRole("navigation", { name: "Rule creation progress" });
    expect(within(progress).getByText("Choose").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Leverage ceiling" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coverage floor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Concentration monitoring" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evidence requirement" })).toBeInTheDocument();
    expect(screen.getByText("Describe the policy in your own words")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate draft" })).toBeDisabled();
    expect(screen.getByText("1000 characters remaining")).toBeInTheDocument();
  });

  it("opens every policy on a collapsed definition step with scope as the primary context", async () => {
    renderPolicyRules();

    for (const [index, inspection] of policyInspectionCases.entries()) {
      const trigger = screen.getByRole("button", { name: inspection.buttonName });
      const rule = policyRules.find((candidate) => candidate.id === inspection.id);
      expect(rule).toBeDefined();
      if (!rule) throw new Error(`Missing policy fixture: ${inspection.id}`);

      trigger.focus();
      fireEvent.click(trigger);

      const dialog = screen.getByRole("dialog", { name: inspection.title });
      expect(within(dialog).getByText(rule.scope.label)).toBeInTheDocument();
      expect(within(dialog).queryByText(rule.version)).not.toBeInTheDocument();
      expect(within(dialog).getByLabelText("Step 1 of 2")).toBeInTheDocument();
      expect(within(dialog).getByRole("region", { name: "Rule logic" })).toBeInTheDocument();
      expect(within(dialog).getByText("Metric")).toBeInTheDocument();
      expect(within(dialog).getByText(rule.calculation.label)).toBeInTheDocument();
      expect(within(dialog).getByText("Limit")).toBeInTheDocument();
      expect(within(dialog).getByText(rule.threshold.direction === "minimum" ? "At least" : "At most")).toBeInTheDocument();
      expect(within(dialog).getByText(getCompactThreshold(rule))).toBeInTheDocument();
      expect(within(dialog).getByText("Evidence")).toBeInTheDocument();
      expect(within(dialog).getByText(rule.evidence.required.map((item) => item.label).join(" and "))).toBeInTheDocument();

      const disclosureButtons = [
        within(dialog).getByRole("button", { name: "View metric details" }),
        within(dialog).getByRole("button", { name: "View limit details" }),
        within(dialog).getByRole("button", { name: "View evidence details" }),
      ];
      disclosureButtons.forEach((button) => expect(button).toHaveAttribute("aria-expanded", "false"));
      expect(within(dialog).queryByRole("combobox")).not.toBeInTheDocument();
      expect(within(dialog).queryByRole("listbox")).not.toBeInTheDocument();
      expect(within(dialog).queryByText(rule.actions.outsidePolicy.label)).not.toBeInTheDocument();

      if (index === 0) {
        fireEvent.keyDown(document, { key: "Escape" });
      } else {
        fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
      }
      await waitFor(() => expect(screen.queryByRole("dialog", { name: inspection.title })).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    }
  });

  it("keeps one definition disclosure open and reveals record metadata on demand", () => {
    renderPolicyRules();
    fireEvent.click(screen.getByRole("button", { name: "Open Leverage ceiling" }));

    const rule = policyRules.find((candidate) => candidate.id === "leverage-ceiling");
    if (!rule) throw new Error("Missing leverage policy fixture");
    const dialog = screen.getByRole("dialog", { name: "Leverage ceiling" });
    const metricButton = within(dialog).getByRole("button", { name: "View metric details" });
    const limitButton = within(dialog).getByRole("button", { name: "View limit details" });
    const recordButton = within(dialog).getByRole("button", { name: "Policy record" });

    fireEvent.click(metricButton);
    expect(metricButton).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByText(rule.calculation.method)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("region")).toHaveLength(2);

    fireEvent.click(limitButton);
    expect(metricButton).toHaveAttribute("aria-expanded", "false");
    expect(limitButton).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).queryByText(rule.calculation.method)).not.toBeInTheDocument();
    expect(within(dialog).getByText(rule.scope.description)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("region")).toHaveLength(2);

    fireEvent.click(recordButton);
    expect(limitButton).toHaveAttribute("aria-expanded", "false");
    expect(recordButton).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).queryByText(rule.scope.description)).not.toBeInTheDocument();
    expect(within(dialog).getByText("Owner")).toBeInTheDocument();
    expect(within(dialog).getByText(rule.owner)).toBeInTheDocument();
    expect(within(dialog).getByText("Version")).toBeInTheDocument();
    expect(within(dialog).getByText(rule.version)).toBeInTheDocument();
    expect(within(dialog).getByText("Effective")).toBeInTheDocument();
    expect(within(dialog).getByText("Jul 21, 2026")).toBeInTheDocument();
  });

  it("opens every active policy as a correctly mapped condition-only draft", async () => {
    renderPolicyRules();

    for (const revision of policyRevisionCases) {
      fireEvent.click(screen.getByRole("button", { name: revision.buttonName }));
      const inspector = screen.getByRole("dialog");
      fireEvent.click(within(inspector).getByRole("button", { name: "Edit as draft" }));

      expect(screen.getByRole("heading", { name: "Edit policy as draft" })).toBeInTheDocument();
      expect(screen.getByText(`Draft from ${revision.version}`)).toBeInTheDocument();
      expect(screen.getByLabelText("Rule name")).toHaveValue(revision.name);
      expect(screen.getByRole("combobox", { name: "Metric" })).toHaveTextContent(revision.metric);
      expect(screen.getByRole("combobox", { name: "Comparator" })).toHaveTextContent(revision.comparator);
      expect(screen.getByLabelText("Threshold")).toHaveValue(revision.threshold);
      expect(screen.queryByRole("combobox", { name: "Required action" })).not.toBeInTheDocument();
      expect(screen.queryByRole("combobox", { name: "Required evidence" })).not.toBeInTheDocument();
      expect(screen.getByText(/calculation method, evidence requirements, and outcomes stay unchanged/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.queryByRole("heading", { name: "Discard this draft?" })).not.toBeInTheDocument();
    }
  });

  it("requires draft permission for both create and edit entry points", () => {
    renderPolicyRules(prototypePolicyViewerAccess);

    const createButton = screen.getByRole("button", { name: "Create policy" });
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveAttribute("title", "Requires policy draft permission");

    fireEvent.click(screen.getByRole("button", { name: "Open Leverage ceiling" }));
    const editButton = within(screen.getByRole("dialog", { name: "Leverage ceiling" }))
      .getByRole("button", { name: "Edit as draft" });
    expect(editButton).toBeDisabled();
    expect(editButton).toHaveAttribute("title", "Requires policy draft permission");
  });

  it("guards changed revisions but closes an untouched revision without interruption", () => {
    renderPolicyRules();
    fireEvent.click(screen.getByRole("button", { name: "Open Leverage ceiling" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Leverage ceiling" }))
      .getByRole("button", { name: "Edit as draft" }));

    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "4.10x" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("heading", { name: "Discard this draft?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByLabelText("Threshold")).toHaveValue("4.10x");
  });

  it("saves a linked revision draft without changing the active policy", async () => {
    renderPolicyRules();
    fireEvent.click(screen.getByRole("button", { name: "Open Leverage ceiling" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Leverage ceiling" }))
      .getByRole("button", { name: "Edit as draft" }));

    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "4.10x" } });
    fireEvent.click(screen.getByRole("button", { name: "Review draft" }));
    expect(screen.getByText(/MER-2026\.07 remains active until an authorized review approves this draft/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null");
      expect(stored?.drafts[0]).toMatchObject({
        source: "existing_policy",
        baseRuleId: "leverage-ceiling",
        baseVersion: "MER-2026.07",
        revisionScope: "condition",
        threshold: "4.10x",
      });
      expect(stored?.drafts[0]).not.toHaveProperty("action");
      expect(stored?.drafts[0]).not.toHaveProperty("evidence");
      expect(stored?.auditEntries[0]).toMatchObject({
        type: "draft_created",
        baseRuleId: "leverage-ceiling",
        baseVersion: "MER-2026.07",
        revisionScope: "condition",
      });
      expect(stored?.statusOverrides).toEqual({});
    });

    expect(screen.getByText("Draft version saved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open Leverage ceiling" }));
    expect(within(screen.getByRole("dialog", { name: "Leverage ceiling" })).getByText("4.25x")).toBeInTheDocument();
  });

  it("moves through outcomes, returns to a reset definition, and resets after close", async () => {
    renderPolicyRules();
    const trigger = screen.getByRole("button", { name: "Open Leverage ceiling" });
    trigger.focus();
    fireEvent.click(trigger);

    let dialog = screen.getByRole("dialog", { name: "Leverage ceiling" });
    fireEvent.click(within(dialog).getByRole("button", { name: "View evidence details" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Next" }));

    expect(within(dialog).getByLabelText("Step 2 of 2")).toBeInTheDocument();
    expect(within(dialog).getByRole("region", { name: "Policy outcomes" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "View metric details" })).not.toBeInTheDocument();
    const outcomeButtons = [
      within(dialog).getByRole("button", { name: "View within limit details" }),
      within(dialog).getByRole("button", { name: "View outside limit details" }),
      within(dialog).getByRole("button", { name: "View evidence missing details" }),
    ];
    outcomeButtons.forEach((button) => expect(button).toHaveAttribute("aria-expanded", "false"));
    expect(within(dialog).getByText("Within limit")).toBeInTheDocument();
    expect(within(dialog).getByText("Outside limit")).toBeInTheDocument();
    expect(within(dialog).getByText("Evidence missing")).toBeInTheDocument();

    fireEvent.click(outcomeButtons[1]);
    expect(outcomeButtons[1]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(within(dialog).getByRole("button", { name: "Back" }));

    expect(within(dialog).getByLabelText("Step 1 of 2")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "View metric details" })).toHaveAttribute("aria-expanded", "false");
    expect(within(dialog).getByRole("button", { name: "View limit details" })).toHaveAttribute("aria-expanded", "false");
    expect(within(dialog).getByRole("button", { name: "View evidence details" })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(within(dialog).getByRole("button", { name: "Next" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "View evidence missing details" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Leverage ceiling" })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    dialog = screen.getByRole("dialog", { name: "Leverage ceiling" });
    expect(within(dialog).getByLabelText("Step 1 of 2")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "View metric details" })).toHaveAttribute("aria-expanded", "false");
    expect(within(dialog).getByRole("button", { name: "View limit details" })).toHaveAttribute("aria-expanded", "false");
    expect(within(dialog).getByRole("button", { name: "View evidence details" })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(within(dialog).getByRole("button", { name: "View metric details" }));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Leverage ceiling" })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("pauses and reactivates a bank-owned rule with confirmation", () => {
    renderLeverageDetail();

    fireEvent.click(screen.getByRole("button", { name: "Pause rule" }));
    let confirmation = screen.getByRole("dialog", { name: "Pause Leverage ceiling?" });
    expect(screen.getAllByRole("button", { name: "Pause rule" })).toHaveLength(2);
    fireEvent.click(within(confirmation).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Pause Leverage ceiling?" })).not.toBeInTheDocument();
    expect(screen.queryByText("Rule paused")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause rule" }));
    confirmation = screen.getByRole("dialog", { name: "Pause Leverage ceiling?" });
    fireEvent.click(within(confirmation).getByRole("button", { name: "Pause rule" }));
    expect(screen.getByRole("button", { name: "Activate rule" })).toBeInTheDocument();
    expect(screen.getByText("Rule paused")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Activate rule" }));
    confirmation = screen.getByRole("dialog", { name: "Activate Leverage ceiling?" });
    fireEvent.click(within(confirmation).getByRole("button", { name: "Activate rule" }));
    expect(screen.getByRole("button", { name: "Pause rule" })).toBeInTheDocument();
    expect(screen.getByText("Rule activated")).toBeInTheDocument();
  });

  it("disables status mutations for a policy viewer capability", () => {
    renderLeverageDetail(prototypePolicyViewerAccess);

    const pauseButton = screen.getByRole("button", { name: "Pause rule" });
    expect(pauseButton).toBeDisabled();
    expect(pauseButton).toHaveAttribute("title", "Requires policy admin permission");

    fireEvent.click(pauseButton);
    expect(screen.queryByRole("dialog", { name: "Pause Leverage ceiling?" })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null")).toMatchObject({
      statusOverrides: {},
      auditEntries: [],
    });

    expect(screen.getByRole("button", { name: "Pause rule" })).toBeDisabled();
  });

  it("persists a complete structured draft across a page remount", async () => {
    const firstRender = renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));
    fireEvent.change(screen.getByLabelText("Rule name"), { target: { value: "Persisted leverage review" } });
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "4.10x" } });
    fireEvent.click(screen.getByRole("button", { name: "Review draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null");
      expect(Object.keys(stored).sort()).toEqual(["auditEntries", "drafts", "schemaVersion", "statusOverrides"]);
      expect(stored?.drafts).toHaveLength(1);
      expect(stored?.drafts[0]).toMatchObject({
        name: "Persisted leverage review",
        source: "template",
        typeId: "financial-ceiling",
        metric: "Verified total leverage",
        comparator: "exceeds",
        threshold: "4.10x",
        action: "Senior credit review",
        evidence: "Current debt schedule",
        status: "draft",
      });
      expect(stored?.auditEntries[0]).toMatchObject({ type: "draft_created", toStatus: "draft" });
    });

    firstRender.unmount();
    renderPolicyRules();
    policyInspectionCases.forEach(({ buttonName }) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeInTheDocument();
    });
    expect(screen.queryByText("Persisted leverage review")).not.toBeInTheDocument();
  });

  it("persists a confirmed status transition and its audit entry across a page remount", async () => {
    const firstRender = renderLeverageDetail();
    fireEvent.click(screen.getByRole("button", { name: "Pause rule" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Pause Leverage ceiling?" })).getByRole("button", { name: "Pause rule" }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null");
      expect(stored?.statusOverrides).toEqual({ "leverage-ceiling": "paused" });
      expect(stored?.auditEntries[0]).toMatchObject({
        type: "status_changed",
        ruleId: "leverage-ceiling",
        version: "MER-2026.07",
        fromStatus: "active",
        toStatus: "paused",
        actor: { id: "prototype-policy-admin", label: "Policy admin (prototype)" },
      });
    });

    firstRender.unmount();
    window.history.replaceState({}, "", "/policy-rules/leverage-ceiling");
    renderPolicyRules();
    expect(screen.getByRole("button", { name: "Activate rule" })).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.queryByText("Rule paused")).not.toBeInTheDocument();
  });

  it("opens a template directly into aligned editable terms, then saves a draft", () => {
    renderPolicyRules();
    openRuleBuilder();

    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));

    const reviewButton = screen.getByRole("button", { name: "Review draft" }) as HTMLButtonElement;
    const configureProgress = screen.getByRole("navigation", { name: "Rule creation progress" });
    expect(within(configureProgress).getByText("Configure").closest("li")).toHaveAttribute("aria-current", "step");
    expect(reviewButton.disabled).toBe(true);
    expect(screen.getByRole("heading", { name: "Set policy terms" })).toBeInTheDocument();
    expect(screen.getByText("Policy condition")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Metric" })).toHaveTextContent("Verified total leverage");
    expect(screen.getByRole("combobox", { name: "Comparator" })).toHaveTextContent("exceeds");
    expect(screen.getByRole("combobox", { name: "Required action" })).toHaveTextContent("Senior credit review");
    expect(screen.getByRole("combobox", { name: "Required evidence" })).toHaveTextContent("Current debt schedule");
    const nameInput = screen.getByLabelText("Rule name");
    nameInput.focus();
    fireEvent.change(nameInput, { target: { value: "Sponsor leverage review" } });
    expect(nameInput).toHaveFocus();
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "4.00x" } });
    expect(reviewButton.disabled).toBe(false);
    fireEvent.click(reviewButton);

    expect(screen.getByRole("heading", { name: "Review policy" })).toBeInTheDocument();
    const reviewProgress = screen.getByRole("navigation", { name: "Rule creation progress" });
    expect(within(reviewProgress).getByText("Review").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/saving creates a draft only/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(screen.getByRole("heading", { name: "Draft saved" })).toBeInTheDocument();
    expect(screen.getByText(/Generated terms cannot activate themselves/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.getByText("Policy draft saved")).toBeInTheDocument();
    expect(screen.queryByText("Sponsor leverage review")).not.toBeInTheDocument();
  });

  it("uses an anchored Mercury-style listbox and lets Escape close only the menu", () => {
    renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));

    const metric = screen.getByRole("combobox", { name: "Metric" });
    metric.focus();
    fireEvent.click(metric);

    expect(metric).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Metric options" });
    expect(within(listbox).getAllByRole("option")).toHaveLength(4);
    expect(within(listbox).getByRole("option", { name: "Verified total leverage" }))
      .toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(metric, { key: "Escape" });
    expect(screen.queryByRole("listbox", { name: "Metric options" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Set policy terms" })).toBeInTheDocument();
    expect(metric).toHaveFocus();

    fireEvent.keyDown(metric, { key: "ArrowDown" });
    fireEvent.keyDown(metric, { key: "ArrowDown" });
    fireEvent.keyDown(metric, { key: "Enter" });
    expect(metric).toHaveTextContent("Downside fixed-charge coverage");
    expect(metric).toHaveAttribute("aria-expanded", "false");
  });

  it("turns supported plain-language policy into an editable draft before review", () => {
    vi.useFakeTimers();
    renderPolicyRules();
    openRuleBuilder();

    const prompt = screen.getByLabelText("Describe the policy in plain language");
    fireEvent.change(prompt, {
      target: { value: "When verified leverage exceeds 4.25x, require senior credit review." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByRole("heading", { name: "Drafting policy" })).toBeInTheDocument();
    expect(screen.getByText("Reading policy language")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("heading", { name: "Review draft terms" })).toBeInTheDocument();
    expect(screen.getByText("AI-generated draft")).toBeInTheDocument();
    expect(screen.getByLabelText("Rule name")).toHaveValue("Leverage exception review");
    expect(screen.getByLabelText("Threshold")).toHaveValue("4.25x");
  });

  it("derives the saved threshold direction from the edited comparator", () => {
    renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));

    fireEvent.change(screen.getByLabelText("Rule name"), { target: { value: "Leverage review floor" } });
    selectBuilderOption("Comparator", "falls below");
    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "4.00x" } });
    fireEvent.click(screen.getByRole("button", { name: "Review draft" }));
    expect(screen.getByText(/verified total leverage falls below 4\.00x/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    const stored = JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null");
    expect(stored?.drafts[0]).toMatchObject({
      name: "Leverage review floor",
      comparator: "falls below",
      thresholdDirection: "minimum",
    });
    expect(screen.queryByText("Leverage review floor")).not.toBeInTheDocument();
  });

  it("rejects malformed and metric-incompatible thresholds with an inline error", () => {
    renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));

    fireEvent.change(screen.getByLabelText("Rule name"), { target: { value: "Invalid threshold draft" } });
    const threshold = screen.getByLabelText("Threshold");
    const reviewButton = screen.getByRole("button", { name: "Review draft" }) as HTMLButtonElement;
    fireEvent.change(threshold, { target: { value: "banana" } });

    expect(threshold).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Use a ratio such as 4.25x.");
    expect(reviewButton.disabled).toBe(true);

    fireEvent.change(threshold, { target: { value: "50%" } });
    expect(reviewButton.disabled).toBe(true);
    selectBuilderOption("Metric", "Top-two customer revenue");
    expect(threshold).not.toHaveAttribute("aria-invalid");
    expect(reviewButton.disabled).toBe(false);
  });

  it("models missing-input rules without a numeric threshold", () => {
    renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Evidence requirement" }));

    fireEvent.change(screen.getByLabelText("Rule name"), { target: { value: "Forecast evidence gate" } });
    selectBuilderOption("Comparator", "is missing");

    expect(screen.queryByLabelText("Threshold")).not.toBeInTheDocument();
    const reviewButton = screen.getByRole("button", { name: "Review draft" }) as HTMLButtonElement;
    expect(reviewButton.disabled).toBe(false);
    fireEvent.click(reviewButton);
    expect(screen.getByText("When complete forward forecast horizon is missing, require evidence refresh.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    const stored = JSON.parse(window.localStorage.getItem(POLICY_RULES_STORAGE_KEY) ?? "null");
    expect(stored?.drafts[0]).toMatchObject({
      name: "Forecast evidence gate",
      comparator: "is missing",
      threshold: null,
    });
    expect(screen.queryByText("Forecast evidence gate")).not.toBeInTheDocument();
  });

  it("keeps an unsupported prompt recoverable instead of inventing a rule", () => {
    vi.useFakeTimers();
    renderPolicyRules();
    openRuleBuilder();

    const prompt = screen.getByLabelText("Describe the policy in plain language");
    fireEvent.change(prompt, { target: { value: "Every Friday, transfer $100 to savings." } });
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not map this request/i);
    expect(prompt).toHaveValue("Every Friday, transfer $100 to savings.");
    expect(screen.queryByRole("heading", { name: "Review draft terms" })).not.toBeInTheDocument();
  });

  it("asks before discarding a dirty draft", () => {
    renderPolicyRules();
    openRuleBuilder();
    const prompt = screen.getByLabelText("Describe the policy in plain language");
    prompt.focus();
    fireEvent.change(prompt, {
      target: { value: "Leverage must remain below 4.25x." },
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Close rule builder" }).at(-1) as HTMLButtonElement);
    expect(screen.getByRole("heading", { name: "Discard this draft?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByLabelText("Describe the policy in plain language")).toHaveValue("Leverage must remain below 4.25x.");
  });

  it("closes an untouched template without a discard interruption", () => {
    renderPolicyRules();
    openRuleBuilder();
    fireEvent.click(screen.getByRole("button", { name: "Leverage ceiling" }));
    fireEvent.click(screen.getByRole("button", { name: "Close rule builder" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never discards a dirty draft through Escape alone", () => {
    renderPolicyRules();
    openRuleBuilder();
    const prompt = screen.getByLabelText("Describe the policy in plain language");
    prompt.focus();
    fireEvent.change(prompt, {
      target: { value: "Leverage must remain below 4.25x." },
    });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("heading", { name: "Discard this draft?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep editing" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("heading", { name: "Create policy" })).toBeInTheDocument();
    expect(screen.getByLabelText("Describe the policy in plain language")).toHaveValue("Leverage must remain below 4.25x.");
    expect(screen.getByRole("button", { name: "Close rule builder" })).toHaveFocus();
  });

  it("recaptures focus when it is moved outside the open builder", () => {
    renderPolicyRules();
    openRuleBuilder();

    const trigger = screen.getByRole("button", { name: "Create policy" });
    trigger.focus();

    expect(screen.getByRole("button", { name: "Close rule builder" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement | null);
  });

  it("closes on Escape and returns focus to the create trigger", async () => {
    renderPolicyRules();
    const trigger = screen.getByRole("button", { name: "Create policy" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
