import { Button } from "../../shared/ui/Button/Button";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
} from "../../shared/ui/Drawer/Drawer";
import { Icon } from "../../shared/ui/Icon/Icon";
import { StatusPill } from "../../shared/ui/StatusPill/StatusPill";
import { formatCurrency, reimbursementStatus, type Reimbursement } from "./reimbursementData";
import styles from "./ReimbursementsPage.module.css";

type ReimbursementDrawerProps = {
  reimbursement: Reimbursement | null;
  open?: boolean;
  layout?: "overlay" | "responsive";
  onClose: () => void;
  onAction: (title: string, message: string) => void;
  onExited?: () => void;
};

export function ReimbursementDrawer({
  reimbursement,
  open = Boolean(reimbursement),
  layout = "overlay",
  onClose,
  onAction,
  onExited,
}: ReimbursementDrawerProps) {
  if (!reimbursement) return null;

  const responsive = layout === "responsive";
  const status = reimbursementStatus[reimbursement.status];
  const [amount, cents] = formatCurrency.format(reimbursement.amount).split(".");
  const action = reimbursement.status === "payment-pending"
    ? { label: "Cancel payment", title: "Payment cancelled", message: `${amount}.${cents} was removed from the payment run.` }
    : reimbursement.status === "pending-review" || reimbursement.status === "action-required"
      ? { label: "Approve reimbursement", title: "Reimbursement approved", message: `${reimbursement.member}'s expense is ready for payment.` }
      : { label: "Request details", title: "Details requested", message: `${reimbursement.member} was notified to update the expense.` };

  return (
    <Drawer
      open={open}
      labelledBy="reimbursement-drawer-title"
      layout={layout}
      onClose={onClose}
      onExited={onExited}
    >
      <DrawerHeader onClose={onClose}>
        {responsive ? (
          <div className={styles.drawerTitleRow}>
            <h2 id="reimbursement-drawer-title">Reimbursement</h2>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
        ) : (
          <>
            <span className={styles.drawerEyebrow}>Reimbursement</span>
            <div className={styles.drawerTitleRow}>
              <h2 id="reimbursement-drawer-title">{reimbursement.member}</h2>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
          </>
        )}
      </DrawerHeader>

      <DrawerBody>
        <DrawerSection className={`${styles.amountSection} ${responsive ? styles.responsiveSummarySection : ""}`}>
          <p className={styles.drawerAmount}>{amount}<span>.{cents}</span></p>
          {reimbursement.rate && <p className={styles.rate}>{reimbursement.rate}</p>}
          {responsive && (
            <>
              <div className={styles.timelineSection} role="list" aria-label="Reimbursement history">
                <div className={styles.timelineItem} role="listitem">
                  <span className={styles.timelineIcon}><Icon name="document" size="sm" /></span>
                  <div>
                    <strong>Submitted</strong>
                    <p>{reimbursement.submittedAt} — by {reimbursement.submittedBy}</p>
                  </div>
                </div>
                {reimbursement.approvedBy && (
                  <div className={styles.timelineItem} role="listitem">
                    <span className={styles.timelineIcon}><Icon name="check" size="sm" /></span>
                    <div>
                      <strong>Approved</strong>
                      <p>{reimbursement.approvedAt} — by {reimbursement.approvedBy}</p>
                    </div>
                  </div>
                )}
                <div className={styles.timelineItem} role="listitem">
                  <span className={`${styles.timelineIcon} ${styles.timelineIconCurrent}`}><Icon name="clock" size="sm" /></span>
                  <div><strong>{status.label}</strong></div>
                </div>
              </div>
              <Button
                className={styles.drawerInlineAction}
                variant={reimbursement.status === "payment-pending" ? "secondary" : "primary"}
                onClick={() => onAction(action.title, action.message)}
              >
                {action.label}
              </Button>
            </>
          )}
        </DrawerSection>

        {!responsive && (
          <DrawerSection className={styles.timelineSection} aria-label="Reimbursement history">
            <div className={styles.timelineItem}>
              <span className={styles.timelineIcon}><Icon name="document" size="sm" /></span>
              <div>
                <strong>Submitted</strong>
                <p>{reimbursement.submittedAt} — by {reimbursement.submittedBy}</p>
              </div>
            </div>
            {reimbursement.approvedBy && (
              <div className={styles.timelineItem}>
                <span className={styles.timelineIcon}><Icon name="check" size="sm" /></span>
                <div>
                  <strong>Approved</strong>
                  <p>{reimbursement.approvedAt} — by {reimbursement.approvedBy}</p>
                </div>
              </div>
            )}
            <div className={styles.timelineItem}>
              <span className={`${styles.timelineIcon} ${styles.timelineIconCurrent}`}><Icon name="clock" size="sm" /></span>
              <div><strong>{status.label}</strong></div>
            </div>
          </DrawerSection>
        )}

        <DrawerSection className={styles.detailList}>
          <div><span>Date of expense</span><strong>{reimbursement.fullDate}</strong></div>
          {reimbursement.mileage && <div><span>Mileage</span><strong>{reimbursement.mileage}</strong></div>}
          <div><span>Category</span><strong>{reimbursement.category}</strong></div>
          <div><span>Receipt</span><strong>{reimbursement.receipt === "attached" ? "Attached" : "Not provided"}</strong></div>
          <div><span>Policy</span><strong>{reimbursement.policy === "in-policy" ? "Within policy" : "Needs review"}</strong></div>
        </DrawerSection>
      </DrawerBody>

      {!responsive && (
        <DrawerFooter className={styles.drawerFooter}>
          <Button
            variant={reimbursement.status === "payment-pending" ? "secondary" : "primary"}
            onClick={() => onAction(action.title, action.message)}
          >
            {action.label}
          </Button>
        </DrawerFooter>
      )}
    </Drawer>
  );
}
