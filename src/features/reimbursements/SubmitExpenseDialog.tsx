import { useRef, useState, type FormEvent } from "react";
import { Button } from "../../shared/ui/Button/Button";
import { Dialog } from "../../shared/ui/Dialog/Dialog";
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
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [receiptAttached, setReceiptAttached] = useState(false);

  function handleClose() {
    setReceiptAttached(false);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number.parseFloat(String(data.get("amount") ?? "").replace(/[^0-9.]/g, ""));
    setReceiptAttached(false);
    onSubmit({
      merchant: String(data.get("merchant") ?? "Expense"),
      amount: Number.isFinite(amount) ? amount : 0,
      category: String(data.get("category") ?? "Business Client Meals"),
      memo: String(data.get("memo") ?? ""),
      receiptAttached,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      eyebrow="New reimbursement"
      title="Submit an expense"
      closeLabel="Close submit expense"
      initialFocusRef={firstFieldRef}
      footer={<>
        <Button variant="quiet" onClick={handleClose}>Cancel</Button>
        <Button
          variant="primary"
          type="submit"
          form="submit-expense-form"
          icon={<Icon name="check" size="sm" />}
          iconPosition="start"
        >
          Submit expense
        </Button>
      </>}
    >
      <form id="submit-expense-form" className={styles.dialogForm} onSubmit={handleSubmit}>
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
      </form>
    </Dialog>
  );
}
