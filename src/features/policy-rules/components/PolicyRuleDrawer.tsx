import { AppLink } from "../../../app/router";
import { Button } from "../../../shared/ui/Button/Button";
import { CompanyLogo } from "../../../shared/ui/CompanyLogo/CompanyLogo";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection } from "../../../shared/ui/Drawer/Drawer";
import { Icon } from "../../../shared/ui/Icon/Icon";
import { IconTile } from "../../../shared/ui/IconTile/IconTile";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { companyLogoDomains } from "../../credit-reviews/companyLogos";
import type { PolicyRuleStatus } from "../policyRulesData";
import { leverageCeilingRule, meridianLeverageOutcome } from "../policyRulesData";
import styles from "./PolicyRuleDrawer.module.css";

type PolicyRuleDrawerProps = {
  open: boolean;
  status: PolicyRuleStatus;
  onClose: () => void;
  onToggleStatus: () => void;
  canChangeStatus?: boolean;
};

/**
 * Quick inspection surface for the overview. The full route remains available
 * for policy owners who need the complete audit detail.
 */
export function PolicyRuleDrawer({
  open,
  status,
  onClose,
  onToggleStatus,
  canChangeStatus = true,
}: PolicyRuleDrawerProps) {
  const { calculation, evaluation, risk } = meridianLeverageOutcome;
  if (calculation.state !== "verified" || evaluation.state !== "evaluated") return null;
  const adjustment = calculation.adjustments[0];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      labelledBy="leverage-policy-drawer-title"
      className={styles.drawer}
    >
      <DrawerHeader onClose={onClose}>
        <span className={styles.eyebrow}>Assessment policy</span>
        <div className={styles.identity}>
          <CompanyLogo domain={companyLogoDomains["Meridian Foods"]} name="Meridian Foods" size="md" />
          <div>
            <h2 id="leverage-policy-drawer-title">{leverageCeilingRule.name}</h2>
            <p>Meridian Foods · Proposed facility</p>
          </div>
        </div>
        <div className={styles.meta}>
          <StatusPill tone={status === "active" ? "success" : "neutral"}>
            {status === "active" ? "Active" : "Paused"}
          </StatusPill>
          <span>{leverageCeilingRule.version}</span>
        </div>
      </DrawerHeader>

      <DrawerBody>
        <DrawerSection className={styles.ruleSection} aria-labelledby="policy-rule-summary">
          <span className={styles.sectionLabel}>Rule</span>
          <h3 id="policy-rule-summary">Verified debt / EBITDA stays at or below 4.25x.</h3>
          <div className={styles.ruleLine} aria-label="Debt divided by EBITDA must be less than or equal to 4.25x">
            <span>Debt / EBITDA</span>
            <Icon name="arrowRight" size="sm" />
            <strong>4.25x max</strong>
          </div>
        </DrawerSection>

        <DrawerSection aria-labelledby="policy-case-summary">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>Verified case</span>
              <h3 id="policy-case-summary">Meridian Foods</h3>
            </div>
            <StatusPill tone="warning">{risk.current}</StatusPill>
          </div>
          <dl className={styles.metrics}>
            <div>
              <dt>Current leverage</dt>
              <dd>{calculation.result.displayValue}</dd>
            </div>
            <div>
              <dt>Headroom</dt>
              <dd>{evaluation.policyMargin.toFixed(2)}x</dd>
            </div>
          </dl>
          <p className={styles.helper}>Within the proposed maximum, pending one debt-classification check.</p>
        </DrawerSection>

        <DrawerSection aria-labelledby="policy-gate-summary">
          <div className={styles.gateRow}>
            <IconTile tone="warning" size="sm"><Icon name="lock" size="sm" /></IconTile>
            <div>
              <h3 id="policy-gate-summary">Evidence gate</h3>
              <p>{adjustment ? `${adjustment.displayAmount} equipment obligation needs a debt treatment.` : "Material debt treatment needs verification."}</p>
              <AppLink className={styles.gateLink} to="/credit-reviews/meridian-foods/findings/increasing-leverage">
                Open leverage finding <Icon name="arrowRight" size="sm" />
              </AppLink>
            </div>
          </div>
        </DrawerSection>
      </DrawerBody>

      <DrawerFooter className={styles.footer}>
        <AppLink className={styles.findingLink} to="/policy-rules/leverage-ceiling">
          View full policy <Icon name="chevronRight" size="sm" />
        </AppLink>
        <Button
          size="sm"
          variant="secondary"
          disabled={!canChangeStatus}
          title={!canChangeStatus ? "Requires policy admin permission" : undefined}
          onClick={onToggleStatus}
        >
          {status === "active" ? "Pause rule" : "Activate rule"}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}
