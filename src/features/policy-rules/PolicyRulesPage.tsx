import { useState } from "react";
import { useRouter } from "../../app/router";
import { Button } from "../../shared/ui/Button/Button";
import { Dialog } from "../../shared/ui/Dialog/Dialog";
import { Icon } from "../../shared/ui/Icon/Icon";
import { IconTile } from "../../shared/ui/IconTile/IconTile";
import { Toast } from "../../shared/ui/Toast/Toast";
import { AssessmentPoliciesOverview } from "./components/AssessmentPoliciesOverview";
import { PolicyRuleDetail } from "./components/PolicyRuleDetail";
import { PolicyRuleInspectionDialog } from "./components/PolicyRuleInspectionDialog";
import { RuleBuilderDialog } from "./components/RuleBuilderDialog";
import { leverageCeilingRule, policyRules, type PolicyRuleId, type PolicyRuleStatus } from "./policyRulesData";
import {
  createPolicyRulesRecordId,
  hasPolicyRulesCapability,
  POLICY_RULES_DRAFT_MANAGE_CAPABILITY,
  POLICY_RULES_STATUS_MANAGE_CAPABILITY,
  prototypePolicyAdminAccess,
  usePersistentPolicyRulesState,
  type PolicyRulesAccess,
} from "./policyRulesState";
import styles from "./PolicyRulesPage.module.css";

type ToastState = { title: string; message: string } | null;
type PendingStatusChange = {
  ruleId: PolicyRuleId;
  name: string;
  version: string;
  scopeLabel: string;
  fromStatus: PolicyRuleStatus;
  toStatus: PolicyRuleStatus;
};

type PolicyRulesPageProps = {
  access?: PolicyRulesAccess;
};

export function PolicyRulesPage({ access = prototypePolicyAdminAccess }: PolicyRulesPageProps) {
  const { pathname, navigate } = useRouter();
  const [policyState, dispatchPolicy] = usePersistentPolicyRulesState();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderRuleId, setBuilderRuleId] = useState<PolicyRuleId | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<PolicyRuleId | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const canChangeStatus = hasPolicyRulesCapability(access, POLICY_RULES_STATUS_MANAGE_CAPABILITY);
  const canManageDrafts = hasPolicyRulesCapability(access, POLICY_RULES_DRAFT_MANAGE_CAPABILITY);

  function requestRuleStatusChange(id: string) {
    if (!canChangeStatus) {
      setToast({
        title: "Permission required",
        message: "Only an authorized policy admin can change rule status.",
      });
      return;
    }
    const rule = policyRules.find((candidate) => candidate.id === id);
    if (!rule) return;
    const fromStatus = policyState.statusOverrides[rule.id] ?? rule.status;
    setPendingStatusChange({
      ruleId: rule.id,
      name: rule.name,
      version: rule.version,
      scopeLabel: rule.scope.label,
      fromStatus,
      toStatus: fromStatus === "active" ? "paused" : "active",
    });
  }

  function confirmRuleStatusChange() {
    if (!pendingStatusChange || !canChangeStatus) {
      if (pendingStatusChange && !canChangeStatus) {
        setToast({
          title: "Permission required",
          message: "Only an authorized policy admin can change rule status.",
        });
      }
      setPendingStatusChange(null);
      return;
    }
    const occurredAt = new Date().toISOString();
    dispatchPolicy({
      type: "change_status",
      ruleId: pendingStatusChange.ruleId,
      toStatus: pendingStatusChange.toStatus,
      auditId: createPolicyRulesRecordId("audit"),
      actor: access.actor,
      occurredAt,
    });
    setToast({
      title: pendingStatusChange.toStatus === "active" ? "Rule activated" : "Rule paused",
      message: `${pendingStatusChange.name} is now ${pendingStatusChange.toStatus}.`,
    });
    setPendingStatusChange(null);
  }

  const leverageStatus = policyState.statusOverrides[leverageCeilingRule.id] ?? leverageCeilingRule.status;
  const selectedRule = policyRules.find((rule) => rule.id === selectedRuleId) ?? null;
  const selectedRuleStatus: PolicyRuleStatus = selectedRule
    ? policyState.statusOverrides[selectedRule.id] ?? selectedRule.status
    : "active";
  const builderRule = policyRules.find((rule) => rule.id === builderRuleId) ?? null;

  function openNewPolicyBuilder() {
    if (!canManageDrafts) {
      setToast({ title: "Permission required", message: "Only an authorized policy admin can create policy drafts." });
      return;
    }
    setBuilderRuleId(null);
    setBuilderOpen(true);
  }

  function editSelectedPolicyAsDraft() {
    if (!selectedRule) return;
    if (!canManageDrafts) {
      setToast({ title: "Permission required", message: "Only an authorized policy admin can edit policy drafts." });
      return;
    }
    setBuilderRuleId(selectedRule.id);
    setSelectedRuleId(null);
    setBuilderOpen(true);
  }

  return (
    <>
      {pathname === "/policy-rules/leverage-ceiling" ? (
        <PolicyRuleDetail
          status={leverageStatus}
          onBack={() => navigate("/policy-rules")}
          onToggleStatus={() => requestRuleStatusChange("leverage-ceiling")}
          canChangeStatus={canChangeStatus}
        />
      ) : (
        <AssessmentPoliciesOverview
          rules={policyRules}
          canCreate={canManageDrafts}
          onCreate={openNewPolicyBuilder}
          onOpenDetail={setSelectedRuleId}
        />
      )}

      {pathname === "/policy-rules" && (
        <PolicyRuleInspectionDialog
          open={Boolean(selectedRule)}
          rule={selectedRule}
          status={selectedRuleStatus}
          canEdit={canManageDrafts}
          onClose={() => setSelectedRuleId(null)}
          onEditAsDraft={editSelectedPolicyAsDraft}
        />
      )}

      <RuleBuilderDialog
        open={builderOpen}
        initialRule={builderRule}
        onClose={() => {
          setBuilderOpen(false);
          setBuilderRuleId(null);
        }}
        onCreate={(draft) => {
          const occurredAt = new Date().toISOString();
          dispatchPolicy({
            type: "save_draft",
            draft,
            auditId: createPolicyRulesRecordId("audit"),
            actor: access.actor,
            occurredAt,
          });
        }}
        onComplete={(name, mode) => {
          setBuilderOpen(false);
          setBuilderRuleId(null);
          setToast({
            title: mode === "revise" ? "Draft version saved" : "Policy draft saved",
            message: mode === "revise"
              ? `${name} is linked to the current policy and ready for review.`
              : `${name} is ready for policy owner review.`,
          });
        }}
      />

      <Dialog
        open={Boolean(pendingStatusChange)}
        onClose={() => setPendingStatusChange(null)}
        eyebrow="Confirm policy change"
        title={pendingStatusChange
          ? `${pendingStatusChange.toStatus === "paused" ? "Pause" : "Activate"} ${pendingStatusChange.name}?`
          : "Confirm policy change"}
        closeLabel="Cancel status change"
        size="sm"
        footer={pendingStatusChange ? (
          <>
            <Button variant="quiet" onClick={() => setPendingStatusChange(null)}>Cancel</Button>
            <Button
              variant={pendingStatusChange.toStatus === "active" ? "primary" : "secondary"}
              disabled={!canChangeStatus}
              title={!canChangeStatus ? "Requires policy admin permission" : undefined}
              onClick={confirmRuleStatusChange}
            >
              {pendingStatusChange.toStatus === "active" ? "Activate rule" : "Pause rule"}
            </Button>
          </>
        ) : undefined}
      >
        {pendingStatusChange && (
          <div className={styles.statusConfirmation}>
            <IconTile tone={pendingStatusChange.toStatus === "paused" ? "warning" : "info"}>
              <Icon name={pendingStatusChange.toStatus === "paused" ? "alertCircle" : "checkCircle"} size="md" />
            </IconTile>
            <div>
              <strong>
                {pendingStatusChange.toStatus === "paused"
                  ? "Stop applying this rule to new evaluations"
                  : "Apply this rule to new evaluations"}
              </strong>
              <p>
                {pendingStatusChange.version} will be {pendingStatusChange.toStatus === "paused" ? "paused for" : "active for"} {pendingStatusChange.scopeLabel}.
                Existing case records will not change.
              </p>
              <small>
                Current status: {pendingStatusChange.fromStatus}. The prototype records {access.actor.label}, version, prior status, and time in the rule audit history.
              </small>
            </div>
          </div>
        )}
      </Dialog>

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </>
  );
}
