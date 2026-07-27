import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../shared/ui/Button/Button";
import { Icon } from "../../shared/ui/Icon/Icon";
import styles from "./ReimbursementsPage.module.css";

export type SubmittedExpense = {
  merchant: string;
  amount: number;
  category: string;
  memo: string;
  receiptAttached: boolean;
};

type SubmitExpenseDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: SubmittedExpense) => void;
};

export function SubmitExpenseDialog({ open, onClose, onSubmit }: SubmitExpenseDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [receiptAttached, setReceiptAttached] = useState(false);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => firstFieldRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) setReceiptAttached(false);
  }, [open]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number.parseFloat(String(data.get("amount") ?? "").replace(/[^0-9.]/g, ""));
    onSubmit({
      merchant: String(data.get("merchant") ?? "Expense"),
      amount: Number.isFinite(amount) ? amount : 0,
      category: String(data.get("category") ?? "Business Client Meals"),
      memo: String(data.get("memo") ?? ""),
      receiptAttached,
    });
  }

  return createPortal(
    <div className={styles.dialogLayer}>
      <button className={styles.dialogBackdrop} type="button" aria-label="Close submit expense" onClick={onClose} />
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-expense-title"
      >
        <header className={styles.dialogHeader}>
          <div>
            <span>New reimbursement</span>
            <h2 id="submit-expense-title">Submit an expense</h2>
          </div>
          <button type="button" aria-label="Close submit expense" onClick={onClose}><Icon name="close" size="sm" /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <label className={styles.formField}>
              <span>Merchant</span>
              <input ref={firstFieldRef} name="merchant" defaultValue="Hudson Table" required />
            </label>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Amount</span>
                <input name="amount" inputMode="decimal" defaultValue="$148.90" required />
              </label>
              <label className={styles.formField}>
                <span>Category</span>
                <select name="category" defaultValue="Business Client Meals">
                  <option>Business Client Meals</option>
                  <option>Travel - Vehicles</option>
                  <option>Travel - Flights</option>
                  <option>Travel - Accommodation</option>
                </select>
              </label>
            </div>
            <label className={styles.formField}>
              <span>Memo</span>
              <textarea name="memo" defaultValue="Prep meal for sponsor diligence session" />
            </label>
            <button
              type="button"
              className={`${styles.uploadControl} ${receiptAttached ? styles.uploadReady : ""}`}
              onClick={() => setReceiptAttached((value) => !value)}
            >
              <Icon name={receiptAttached ? "checkCircle" : "document"} size="md" />
              <span>
                <strong>{receiptAttached ? "Receipt ready" : "Drop receipt or upload"}</strong>
                <small>{receiptAttached ? "receipt-hudson-table.pdf" : "PDF, PNG, JPG up to 10MB"}</small>
              </span>
            </button>
          </div>

          <footer className={styles.dialogFooter}>
            <Button variant="quiet" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" icon={<Icon name="check" size="sm" />} iconPosition="start">
              Submit expense
            </Button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
