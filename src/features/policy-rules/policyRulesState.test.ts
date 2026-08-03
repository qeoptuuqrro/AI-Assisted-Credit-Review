// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
  POLICY_RULES_SCHEMA_VERSION,
  POLICY_RULES_STATUS_MANAGE_CAPABILITY,
  POLICY_RULES_STORAGE_KEY,
  createInitialPolicyRulesState,
  hasPolicyRulesCapability,
  parsePolicyRulesState,
  persistPolicyRulesState,
  policyRulesReducer,
  prototypePolicyAdmin,
  prototypePolicyAdminAccess,
  prototypePolicyViewerAccess,
  readPolicyRulesState,
  type PolicyRuleConditionRevisionDraftRecord,
  type PolicyRuleNewDraftRecord,
} from "./policyRulesState";

const draft: PolicyRuleNewDraftRecord = {
  id: "draft-1",
  status: "draft",
  source: "ai",
  sourcePrompt: "When verified leverage exceeds 4.25x, require senior credit review.",
  typeId: "financial-ceiling",
  name: "Leverage exception review",
  statement: "When verified total leverage exceeds 4.25x, require senior credit review.",
  metric: "Verified total leverage",
  comparator: "exceeds",
  threshold: "4.25x",
  thresholdDirection: "maximum",
  action: "Senior credit review",
  evidence: "Current debt schedule",
  createdAt: "2026-08-02T14:00:00.000Z",
  updatedAt: "2026-08-02T14:00:00.000Z",
};

const templateDraft: PolicyRuleNewDraftRecord = {
  ...draft,
  id: "draft-template-1",
  source: "template",
  sourcePrompt: null,
  name: "Template leverage review",
};

const revisionDraft: PolicyRuleConditionRevisionDraftRecord = {
  id: "draft-revision-1",
  status: "draft",
  source: "existing_policy",
  sourcePrompt: null,
  typeId: "financial-ceiling",
  name: "Leverage ceiling revision",
  statement: "When verified total leverage exceeds 4.10x, require the inherited policy actions.",
  metric: "Verified total leverage",
  comparator: "exceeds",
  threshold: "4.10x",
  thresholdDirection: "maximum",
  baseRuleId: "leverage-ceiling",
  baseVersion: "MER-2026.07",
  revisionScope: "condition",
  createdAt: "2026-08-02T14:15:00.000Z",
  updatedAt: "2026-08-02T14:15:00.000Z",
};

afterEach(() => {
  window.localStorage.clear();
});

describe("Policy Rules persistence", () => {
  it("grants draft management only to the prototype policy admin", () => {
    expect(prototypePolicyAdminAccess.capabilities).toEqual([
      POLICY_RULES_STATUS_MANAGE_CAPABILITY,
      POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
    ]);
    expect(hasPolicyRulesCapability(
      prototypePolicyAdminAccess,
      POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
    )).toBe(true);
    expect(hasPolicyRulesCapability(
      prototypePolicyViewerAccess,
      POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
    )).toBe(false);
  });

  it("falls back for corrupt or stale storage and filters invalid records", () => {
    window.localStorage.setItem(POLICY_RULES_STORAGE_KEY, "not-json");
    expect(readPolicyRulesState()).toEqual(createInitialPolicyRulesState());

    expect(parsePolicyRulesState({ schemaVersion: 0, drafts: [draft] })).toEqual(createInitialPolicyRulesState());

    const parsed = parsePolicyRulesState({
      schemaVersion: POLICY_RULES_SCHEMA_VERSION,
      drafts: [
        draft,
        revisionDraft,
        { ...draft, id: "invalid-draft", comparator: "approximately" },
        { ...draft, id: "invalid-threshold", threshold: "banana" },
        { ...draft, id: "invalid-unit", metric: "Top-two customer revenue", threshold: "4.25x" },
        { ...draft, id: "invalid-direction", comparator: "falls below", thresholdDirection: "maximum" },
        { ...draft, id: "invalid-missing-direction", typeId: "evidence-requirement", comparator: "is missing", threshold: null, thresholdDirection: "maximum" },
        { ...draft, id: "invalid-source-prompt", source: "template", sourcePrompt: draft.sourcePrompt },
        { ...revisionDraft, id: "invalid-base-rule", baseRuleId: "unknown-rule" },
        { ...revisionDraft, id: "invalid-base-version", baseVersion: "" },
        { ...revisionDraft, id: "invalid-revision-scope", revisionScope: "full" },
        { ...revisionDraft, id: "invalid-revision-action", action: "Senior credit review" },
      ],
      statusOverrides: {
        "leverage-ceiling": "paused",
        "forecast-completeness-requirement": "paused",
        "unknown-rule": "active",
      },
      auditEntries: [{ id: "invalid-audit" }],
    });

    expect(parsed.drafts).toEqual([draft, revisionDraft]);
    expect(parsed.statusOverrides).toEqual({
      "leverage-ceiling": "paused",
      "forecast-completeness-requirement": "paused",
    });
    expect(parsed.auditEntries).toEqual([]);
  });

  it("migrates valid v1 template and AI drafts without dropping their audit history", () => {
    const migrated = parsePolicyRulesState({
      schemaVersion: 1,
      drafts: [draft, templateDraft],
      statusOverrides: { "leverage-ceiling": "paused" },
      auditEntries: [{
        id: "audit-v1-draft",
        type: "draft_created",
        ruleId: draft.id,
        version: "Draft",
        toStatus: "draft",
        actor: prototypePolicyAdmin,
        occurredAt: draft.createdAt,
      }],
    });

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.drafts).toEqual([draft, templateDraft]);
    expect(migrated.statusOverrides).toEqual({ "leverage-ceiling": "paused" });
    expect(migrated.auditEntries).toEqual([{
      id: "audit-v1-draft",
      type: "draft_created",
      ruleId: draft.id,
      version: "Draft",
      toStatus: "draft",
      baseRuleId: null,
      baseVersion: null,
      revisionScope: null,
      actor: prototypePolicyAdmin,
      occurredAt: draft.createdAt,
    }]);
  });

  it("saves a structured draft and its attribution in one reducer transition", () => {
    const next = policyRulesReducer(createInitialPolicyRulesState(), {
      type: "save_draft",
      draft,
      auditId: "audit-draft-1",
      actor: prototypePolicyAdmin,
      occurredAt: draft.createdAt,
    });

    expect(next.drafts).toEqual([draft]);
    expect(next.auditEntries).toEqual([{
      id: "audit-draft-1",
      type: "draft_created",
      ruleId: "draft-1",
      version: "Draft",
      toStatus: "draft",
      baseRuleId: null,
      baseVersion: null,
      revisionScope: null,
      actor: prototypePolicyAdmin,
      occurredAt: draft.createdAt,
    }]);

    persistPolicyRulesState(next);
    expect(readPolicyRulesState()).toEqual(next);
  });

  it("saves a condition-only revision with its base rule and version in the audit entry", () => {
    const next = policyRulesReducer(createInitialPolicyRulesState(), {
      type: "save_draft",
      draft: revisionDraft,
      auditId: "audit-revision-1",
      actor: prototypePolicyAdmin,
      occurredAt: revisionDraft.createdAt,
    });

    expect(next.drafts).toEqual([revisionDraft]);
    expect(next.auditEntries).toEqual([{
      id: "audit-revision-1",
      type: "draft_created",
      ruleId: revisionDraft.id,
      version: "Draft",
      toStatus: "draft",
      baseRuleId: "leverage-ceiling",
      baseVersion: "MER-2026.07",
      revisionScope: "condition",
      actor: prototypePolicyAdmin,
      occurredAt: revisionDraft.createdAt,
    }]);

    persistPolicyRulesState(next);
    expect(readPolicyRulesState()).toEqual(next);
  });

  it("changes status and appends an attributable audit entry atomically", () => {
    const paused = policyRulesReducer(createInitialPolicyRulesState(), {
      type: "change_status",
      ruleId: "leverage-ceiling",
      toStatus: "paused",
      auditId: "audit-pause-1",
      actor: prototypePolicyAdmin,
      occurredAt: "2026-08-02T14:05:00.000Z",
    });

    expect(paused.statusOverrides).toEqual({ "leverage-ceiling": "paused" });
    expect(paused.auditEntries[0]).toEqual({
      id: "audit-pause-1",
      type: "status_changed",
      ruleId: "leverage-ceiling",
      version: "MER-2026.07",
      fromStatus: "active",
      toStatus: "paused",
      actor: prototypePolicyAdmin,
      occurredAt: "2026-08-02T14:05:00.000Z",
    });

    const active = policyRulesReducer(paused, {
      type: "change_status",
      ruleId: "leverage-ceiling",
      toStatus: "active",
      auditId: "audit-activate-1",
      actor: prototypePolicyAdmin,
      occurredAt: "2026-08-02T14:10:00.000Z",
    });

    expect(active.statusOverrides).toEqual({});
    expect(active.auditEntries).toHaveLength(2);
    expect(active.auditEntries[0]).toMatchObject({
      id: "audit-activate-1",
      fromStatus: "paused",
      toStatus: "active",
    });
  });
});
