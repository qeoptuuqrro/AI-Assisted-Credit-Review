import { useEffect, useReducer } from "react";
import {
  policyRules,
  type PolicyRuleId,
  type PolicyRuleStatus,
  type ThresholdDirection,
} from "./policyRulesData";

export const POLICY_RULES_STORAGE_KEY = "bcgx.policy-rules.v1";
export const POLICY_RULES_SCHEMA_VERSION = 2 as const;

export type PolicyRuleDraftSource = "template" | "ai" | "existing_policy";
export type PolicyRuleNewDraftSource = Exclude<PolicyRuleDraftSource, "existing_policy">;
export type PolicyRuleDraftRevisionScope = "condition";
export type PolicyRuleDraftTypeId =
  | "financial-ceiling"
  | "financial-floor"
  | "evidence-requirement"
  | "review-trigger";
export type PolicyRuleDraftComparator = "exceeds" | "falls below" | "is missing";
export type PolicyRuleDraftMetric =
  | "Verified total leverage"
  | "Downside fixed-charge coverage"
  | "Complete forward forecast horizon"
  | "Top-two customer revenue";

type PolicyRuleDraftCondition = {
  id: string;
  status: "draft";
  typeId: PolicyRuleDraftTypeId;
  name: string;
  statement: string;
  metric: PolicyRuleDraftMetric;
  comparator: PolicyRuleDraftComparator;
  threshold: string | null;
  thresholdDirection: ThresholdDirection;
  createdAt: string;
  updatedAt: string;
};

export type PolicyRuleNewDraftRecord = PolicyRuleDraftCondition & {
  source: PolicyRuleNewDraftSource;
  sourcePrompt: string | null;
  action: string;
  evidence: string;
  baseRuleId?: never;
  baseVersion?: never;
  revisionScope?: never;
};

export type PolicyRuleConditionRevisionDraftRecord = PolicyRuleDraftCondition & {
  source: "existing_policy";
  sourcePrompt: null;
  baseRuleId: PolicyRuleId;
  baseVersion: string;
  revisionScope: PolicyRuleDraftRevisionScope;
  action?: never;
  evidence?: never;
};

export type PolicyRuleDraftRecord =
  | PolicyRuleNewDraftRecord
  | PolicyRuleConditionRevisionDraftRecord;

export type PolicyRuleAuditActor = {
  id: string;
  label: string;
};

export const prototypePolicyAdmin: PolicyRuleAuditActor = {
  id: "prototype-policy-admin",
  label: "Policy admin (prototype)",
};

export const POLICY_RULES_STATUS_MANAGE_CAPABILITY = "policy_rules.status.manage" as const;
export const POLICY_RULES_DRAFT_MANAGE_CAPABILITY = "policy_rules.draft.manage" as const;
export type PolicyRulesCapability =
  | typeof POLICY_RULES_STATUS_MANAGE_CAPABILITY
  | typeof POLICY_RULES_DRAFT_MANAGE_CAPABILITY;

export type PolicyRulesAccess = {
  actor: PolicyRuleAuditActor;
  capabilities: readonly PolicyRulesCapability[];
};

export const prototypePolicyAdminAccess: PolicyRulesAccess = {
  actor: prototypePolicyAdmin,
  capabilities: [
    POLICY_RULES_STATUS_MANAGE_CAPABILITY,
    POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
  ],
};

export const prototypePolicyViewerAccess: PolicyRulesAccess = {
  actor: { id: "prototype-policy-viewer", label: "Policy viewer (prototype)" },
  capabilities: [],
};

export function hasPolicyRulesCapability(access: PolicyRulesAccess, capability: PolicyRulesCapability) {
  return access.capabilities.includes(capability);
}

type PolicyRuleAuditBase = {
  id: string;
  actor: PolicyRuleAuditActor;
  occurredAt: string;
};

export type PolicyRuleStatusChangedAuditEntry = PolicyRuleAuditBase & {
  type: "status_changed";
  ruleId: PolicyRuleId;
  version: string;
  fromStatus: PolicyRuleStatus;
  toStatus: PolicyRuleStatus;
};

type PolicyRuleDraftCreatedAuditBase = PolicyRuleAuditBase & {
  type: "draft_created";
  ruleId: string;
  version: "Draft";
  toStatus: "draft";
};

export type PolicyRuleNewDraftCreatedAuditEntry = PolicyRuleDraftCreatedAuditBase & {
  baseRuleId: null;
  baseVersion: null;
  revisionScope: null;
};

export type PolicyRuleRevisionDraftCreatedAuditEntry = PolicyRuleDraftCreatedAuditBase & {
  baseRuleId: PolicyRuleId;
  baseVersion: string;
  revisionScope: PolicyRuleDraftRevisionScope;
};

export type PolicyRuleDraftCreatedAuditEntry =
  | PolicyRuleNewDraftCreatedAuditEntry
  | PolicyRuleRevisionDraftCreatedAuditEntry;

export type PolicyRuleAuditEntry =
  | PolicyRuleStatusChangedAuditEntry
  | PolicyRuleDraftCreatedAuditEntry;

export type PolicyRulesState = {
  schemaVersion: typeof POLICY_RULES_SCHEMA_VERSION;
  drafts: PolicyRuleDraftRecord[];
  statusOverrides: Partial<Record<PolicyRuleId, PolicyRuleStatus>>;
  auditEntries: PolicyRuleAuditEntry[];
};

export type PolicyRulesAction =
  | {
    type: "save_draft";
    draft: PolicyRuleDraftRecord;
    auditId: string;
    actor: PolicyRuleAuditActor;
    occurredAt: string;
  }
  | {
    type: "change_status";
    ruleId: PolicyRuleId;
    toStatus: PolicyRuleStatus;
    auditId: string;
    actor: PolicyRuleAuditActor;
    occurredAt: string;
  };

const policyRuleIds = new Set<PolicyRuleId>(policyRules.map((rule) => rule.id));
const draftTypeIds = new Set<PolicyRuleDraftTypeId>([
  "financial-ceiling",
  "financial-floor",
  "evidence-requirement",
  "review-trigger",
]);
const draftMetrics = new Set<PolicyRuleDraftMetric>([
  "Verified total leverage",
  "Downside fixed-charge coverage",
  "Complete forward forecast horizon",
  "Top-two customer revenue",
]);
const draftComparators = new Set<PolicyRuleDraftComparator>(["exceeds", "falls below", "is missing"]);

const draftMetricValidation: Record<PolicyRuleDraftMetric, {
  pattern: RegExp;
  validateValue?: (value: number) => boolean;
}> = {
  "Verified total leverage": {
    pattern: /^(\d+(?:\.\d+)?)x$/i,
    validateValue: (value) => value > 0,
  },
  "Downside fixed-charge coverage": {
    pattern: /^(\d+(?:\.\d+)?)x$/i,
    validateValue: (value) => value > 0,
  },
  "Complete forward forecast horizon": {
    pattern: /^(\d+)\s*months?$/i,
    validateValue: (value) => value > 0,
  },
  "Top-two customer revenue": {
    pattern: /^(\d+(?:\.\d+)?)%$/,
    validateValue: (value) => value >= 0 && value <= 100,
  },
};

const defaultThresholdDirectionByTypeId: Record<PolicyRuleDraftTypeId, ThresholdDirection> = {
  "financial-ceiling": "maximum",
  "financial-floor": "minimum",
  "evidence-requirement": "minimum",
  "review-trigger": "maximum",
};

function isValidDraftThreshold(
  metric: PolicyRuleDraftMetric,
  comparator: PolicyRuleDraftComparator,
  threshold: unknown,
) {
  if (comparator === "is missing") return threshold === null;
  if (!isNonEmptyString(threshold)) return false;

  const validation = draftMetricValidation[metric];
  const match = threshold.trim().match(validation.pattern);
  if (!match) return false;
  const numericValue = Number(match[1]);
  return Number.isFinite(numericValue) && (validation.validateValue?.(numericValue) ?? true);
}

function isValidDraftDirection(
  typeId: PolicyRuleDraftTypeId,
  comparator: PolicyRuleDraftComparator,
  direction: unknown,
) {
  const expectedDirection = comparator === "exceeds"
    ? "maximum"
    : comparator === "falls below"
      ? "minimum"
      : defaultThresholdDirectionByTypeId[typeId];
  return direction === expectedDirection;
}

export function createInitialPolicyRulesState(): PolicyRulesState {
  return {
    schemaVersion: POLICY_RULES_SCHEMA_VERSION,
    drafts: [],
    statusOverrides: {},
    auditEntries: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isPolicyRuleId(value: unknown): value is PolicyRuleId {
  return typeof value === "string" && policyRuleIds.has(value as PolicyRuleId);
}

function isPolicyRuleStatus(value: unknown): value is PolicyRuleStatus {
  return value === "active" || value === "paused";
}

function isAuditActor(value: unknown): value is PolicyRuleAuditActor {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.label);
}

function hasValidDraftCondition(value: Record<string, unknown>) {
  const typeId = value.typeId as PolicyRuleDraftTypeId;
  const metric = value.metric as PolicyRuleDraftMetric;
  const comparator = value.comparator as PolicyRuleDraftComparator;

  return isNonEmptyString(value.id)
    && value.status === "draft"
    && typeof value.typeId === "string"
    && draftTypeIds.has(typeId)
    && isNonEmptyString(value.name)
    && isNonEmptyString(value.statement)
    && typeof value.metric === "string"
    && draftMetrics.has(metric)
    && typeof value.comparator === "string"
    && draftComparators.has(comparator)
    && isValidDraftThreshold(metric, comparator, value.threshold)
    && isValidDraftDirection(typeId, comparator, value.thresholdDirection)
    && isIsoDate(value.createdAt)
    && isIsoDate(value.updatedAt);
}

function isNewDraftRecord(value: unknown): value is PolicyRuleNewDraftRecord {
  if (!isRecord(value)) return false;
  return hasValidDraftCondition(value)
    && (value.source === "template" || value.source === "ai")
    && (value.source === "ai" ? isNonEmptyString(value.sourcePrompt) : value.sourcePrompt === null)
    && isNonEmptyString(value.action)
    && isNonEmptyString(value.evidence)
    && value.baseRuleId === undefined
    && value.baseVersion === undefined
    && value.revisionScope === undefined;
}

function isConditionRevisionDraftRecord(value: unknown): value is PolicyRuleConditionRevisionDraftRecord {
  return isRecord(value)
    && hasValidDraftCondition(value)
    && value.source === "existing_policy"
    && value.sourcePrompt === null
    && isPolicyRuleId(value.baseRuleId)
    && isNonEmptyString(value.baseVersion)
    && value.revisionScope === "condition"
    && value.action === undefined
    && value.evidence === undefined;
}

function isDraftRecord(value: unknown): value is PolicyRuleDraftRecord {
  return isNewDraftRecord(value) || isConditionRevisionDraftRecord(value);
}

function parseAuditEntry(value: unknown, schemaVersion: 1 | typeof POLICY_RULES_SCHEMA_VERSION): PolicyRuleAuditEntry | null {
  if (!isRecord(value)
    || !isNonEmptyString(value.id)
    || !isAuditActor(value.actor)
    || !isIsoDate(value.occurredAt)) return null;

  if (value.type === "draft_created") {
    if (!isNonEmptyString(value.ruleId)
      || value.version !== "Draft"
      || value.toStatus !== "draft") return null;

    const base = {
      id: value.id,
      type: "draft_created" as const,
      ruleId: value.ruleId,
      version: "Draft" as const,
      toStatus: "draft" as const,
      actor: value.actor,
      occurredAt: value.occurredAt,
    };

    if (schemaVersion === 1) {
      return {
        ...base,
        baseRuleId: null,
        baseVersion: null,
        revisionScope: null,
      };
    }

    if (value.baseRuleId === null
      && value.baseVersion === null
      && value.revisionScope === null) {
      return {
        ...base,
        baseRuleId: null,
        baseVersion: null,
        revisionScope: null,
      };
    }

    if (isPolicyRuleId(value.baseRuleId)
      && isNonEmptyString(value.baseVersion)
      && value.revisionScope === "condition") {
      return {
        ...base,
        baseRuleId: value.baseRuleId,
        baseVersion: value.baseVersion,
        revisionScope: value.revisionScope,
      };
    }

    return null;
  }

  if (value.type !== "status_changed"
    || !isPolicyRuleId(value.ruleId)
    || !isNonEmptyString(value.version)
    || !isPolicyRuleStatus(value.fromStatus)
    || !isPolicyRuleStatus(value.toStatus)
    || value.fromStatus === value.toStatus) return null;

  return {
    id: value.id,
    type: "status_changed",
    ruleId: value.ruleId,
    version: value.version,
    fromStatus: value.fromStatus,
    toStatus: value.toStatus,
    actor: value.actor,
    occurredAt: value.occurredAt,
  };
}

export function parsePolicyRulesState(value: unknown): PolicyRulesState {
  if (!isRecord(value)
    || (value.schemaVersion !== 1 && value.schemaVersion !== POLICY_RULES_SCHEMA_VERSION)) {
    return createInitialPolicyRulesState();
  }

  const storedSchemaVersion = value.schemaVersion;

  const statusOverrides: PolicyRulesState["statusOverrides"] = {};
  if (isRecord(value.statusOverrides)) {
    for (const rule of policyRules) {
      const status = value.statusOverrides[rule.id];
      if (isPolicyRuleStatus(status) && status !== rule.status) statusOverrides[rule.id] = status;
    }
  }

  const drafts = Array.isArray(value.drafts)
    ? value.drafts.filter((draft): draft is PolicyRuleDraftRecord => (
      storedSchemaVersion === 1 ? isNewDraftRecord(draft) : isDraftRecord(draft)
    ))
    : [];
  const auditEntries = Array.isArray(value.auditEntries)
    ? value.auditEntries
      .map((entry) => parseAuditEntry(entry, storedSchemaVersion))
      .filter((entry): entry is PolicyRuleAuditEntry => entry !== null)
    : [];

  return {
    schemaVersion: POLICY_RULES_SCHEMA_VERSION,
    drafts,
    statusOverrides,
    auditEntries,
  };
}

export function readPolicyRulesState(): PolicyRulesState {
  try {
    const stored = window.localStorage.getItem(POLICY_RULES_STORAGE_KEY);
    return stored ? parsePolicyRulesState(JSON.parse(stored)) : createInitialPolicyRulesState();
  } catch {
    return createInitialPolicyRulesState();
  }
}

export function persistPolicyRulesState(state: PolicyRulesState) {
  try {
    window.localStorage.setItem(POLICY_RULES_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the prototype usable in memory when browser storage is unavailable.
  }
}

export function policyRulesReducer(state: PolicyRulesState, action: PolicyRulesAction): PolicyRulesState {
  if (action.type === "save_draft") {
    if (state.drafts.some((draft) => draft.id === action.draft.id)) return state;
    const draftAuditEntry: PolicyRuleDraftCreatedAuditEntry = action.draft.source === "existing_policy"
      ? {
        id: action.auditId,
        type: "draft_created",
        ruleId: action.draft.id,
        version: "Draft",
        toStatus: "draft",
        baseRuleId: action.draft.baseRuleId,
        baseVersion: action.draft.baseVersion,
        revisionScope: action.draft.revisionScope,
        actor: action.actor,
        occurredAt: action.occurredAt,
      }
      : {
        id: action.auditId,
        type: "draft_created",
        ruleId: action.draft.id,
        version: "Draft",
        toStatus: "draft",
        baseRuleId: null,
        baseVersion: null,
        revisionScope: null,
        actor: action.actor,
        occurredAt: action.occurredAt,
      };

    return {
      ...state,
      drafts: [action.draft, ...state.drafts],
      auditEntries: [
        draftAuditEntry,
        ...state.auditEntries,
      ],
    };
  }

  const rule = policyRules.find((candidate) => candidate.id === action.ruleId);
  if (!rule) return state;
  const fromStatus = state.statusOverrides[rule.id] ?? rule.status;
  if (fromStatus === action.toStatus) return state;

  const statusOverrides = { ...state.statusOverrides };
  if (action.toStatus === rule.status) delete statusOverrides[rule.id];
  else statusOverrides[rule.id] = action.toStatus;

  return {
    ...state,
    statusOverrides,
    auditEntries: [
      {
        id: action.auditId,
        type: "status_changed",
        ruleId: rule.id,
        version: rule.version,
        fromStatus,
        toStatus: action.toStatus,
        actor: action.actor,
        occurredAt: action.occurredAt,
      },
      ...state.auditEntries,
    ],
  };
}

export function usePersistentPolicyRulesState() {
  const [state, dispatch] = useReducer(policyRulesReducer, undefined, readPolicyRulesState);

  useEffect(() => {
    persistPolicyRulesState(state);
  }, [state]);

  return [state, dispatch] as const;
}

export function createPolicyRulesRecordId(prefix: "draft" | "audit") {
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}
