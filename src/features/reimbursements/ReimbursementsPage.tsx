import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "../../app/router";
import { getDesignOption } from "../design-tools/designOptions";
import { Button } from "../../shared/ui/Button/Button";
import { FilterChip } from "../../shared/ui/FilterChip/FilterChip";
import { Icon } from "../../shared/ui/Icon/Icon";
import { Popover } from "../../shared/ui/Popover/Popover";
import { StatusPill } from "../../shared/ui/StatusPill/StatusPill";
import { Tabs } from "../../shared/ui/Tabs/Tabs";
import { Text } from "../../shared/ui/Text/Text";
import { Toast } from "../../shared/ui/Toast/Toast";
import { ReimbursementDrawer } from "./ReimbursementDrawer";
import { SubmitExpenseDialog, type SubmittedExpense } from "./SubmitExpenseDialog";
import {
  categoryOptions,
  formatCurrency,
  initialReimbursements,
  reimbursementStatus,
  type Reimbursement,
} from "./reimbursementData";
import styles from "./ReimbursementsPage.module.css";
import { getLearningTargetProps, LearningModeSurface, useLearningMode } from "../credit-reviews/learning/MeridianLearningMode";

type ExpenseScope = "all-expenses" | "my-expenses";
type QuickFilter = "all" | "pending-review";
type ToastState = { title: string; message: string } | null;

export function ReimbursementsPage() {
  return <LearningModeSurface scope="reimbursements"><ReimbursementsPageContent /></LearningModeSurface>;
}

function ReimbursementsPageContent() {
  const { search } = useRouter();
  const { enabled } = useLearningMode();
  const selectedDesign = getDesignOption(new URLSearchParams(search).get("design"));
  const responsiveDrawerV2 = selectedDesign?.renderKey === "reimbursements-responsive-drawer";
  const [rows, setRows] = useState(initialReimbursements);
  const [scope, setScope] = useState<ExpenseScope>("all-expenses");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("All categories");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [activeRow, setActiveRow] = useState<Reimbursement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !settingsOpen) return;
    function closeOnOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (filterOpen && !filterRef.current?.contains(target)) setFilterOpen(false);
      if (settingsOpen && !settingsRef.current?.contains(target)) setSettingsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setFilterOpen(false);
      setSettingsOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [filterOpen, settingsOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveRow(null);
  }, [responsiveDrawerV2]);

  const pendingReviewCount = rows.filter((row) => row.status === "pending-review").length;
  const myExpenseCount = rows.filter((row) => row.isMine).length;
  const visibleRows = useMemo(() => rows.filter((row) => {
    const inScope = scope === "all-expenses" || row.isMine;
    const inQuickFilter = quickFilter === "all" || row.status === "pending-review";
    const inCategory = category === "All categories" || row.category === category;
    return inScope && inQuickFilter && inCategory;
  }), [category, quickFilter, rows, scope]);

  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));
  const selectedRows = rows.filter((row) => selected.has(row.id));
  const selectedTotal = selectedRows.reduce((sum, row) => sum + row.amount, 0);

  function changeScope(nextScope: ExpenseScope) {
    setScope(nextScope);
    setSelected(new Set());
    setDrawerOpen(false);
    setActiveRow(null);
  }

  function changeQuickFilter(nextFilter: QuickFilter) {
    setQuickFilter(nextFilter);
    setSelected(new Set());
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisibleRows() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleRows.forEach((row) => next.delete(row.id));
      else visibleRows.forEach((row) => next.add(row.id));
      return next;
    });
  }

  function activateRow(event: ReactKeyboardEvent<HTMLTableRowElement>, row: Reimbursement) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setDrawerOpen(true);
    setActiveRow(row);
  }

  function openDrawer(row: Reimbursement) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    if (!responsiveDrawerV2) setActiveRow(null);
  }

  function completeDrawerAction(title: string, message: string) {
    closeDrawer();
    setToast({ title, message });
  }

  function applyBulkStatus(status: "payment-pending" | "declined") {
    const count = selected.size;
    setRows((current) => current.map((row) => selected.has(row.id) ? { ...row, status } : row));
    setSelected(new Set());
    setToast({
      title: status === "payment-pending" ? "Reimbursements approved" : "Reimbursements declined",
      message: `${count} ${count === 1 ? "request was" : "requests were"} updated.`,
    });
  }

  function exportRows() {
    const header = ["Date", "Team member", "Status", "Amount", "Category", "Receipt", "Policy"];
    const records = visibleRows.map((row) => [
      row.fullDate,
      row.member,
      reimbursementStatus[row.status].label,
      row.amount.toFixed(2),
      row.category,
      row.receipt,
      row.policy,
    ]);
    const csv = [header, ...records]
      .map((record) => record.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "reimbursements.csv";
    link.click();
    URL.revokeObjectURL(url);
    setToast({ title: "Export ready", message: `${visibleRows.length} reimbursements were exported.` });
  }

  function addExpense(expense: SubmittedExpense) {
    const newRow: Reimbursement = {
      id: `expense-${Date.now()}`,
      date: "Today",
      fullDate: "Jul 26, 2026",
      member: "Junha Kim",
      status: "pending-review",
      amount: expense.amount,
      category: expense.category,
      receipt: expense.receiptAttached ? "attached" : "missing",
      policy: "in-policy",
      submittedBy: "Junha Kim",
      submittedAt: "Just now",
      isMine: true,
    };
    setRows((current) => [newRow, ...current]);
    setSubmitOpen(false);
    setScope("all-expenses");
    setQuickFilter("all");
    setCategory("All categories");
    setToast({ title: "Expense submitted", message: `${expense.merchant} was added for review.` });
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Text as="h1" variant="pageTitle">Reimbursements</Text>
        <div className={styles.pageActions}>
          <div className={styles.settingsControl} ref={settingsRef}>
            <Button
              variant="quiet"
              aria-expanded={settingsOpen}
              aria-controls="reimbursement-settings"
              onClick={() => {
                setSettingsOpen((value) => !value);
                setFilterOpen(false);
              }}
            >
              Settings
            </Button>
            {settingsOpen && (
              <Popover id="reimbursement-settings" className={styles.settingsPopover} role="dialog" aria-label="Reimbursement settings">
                <strong>Reimbursement settings</strong>
                <button type="button" onClick={() => setToast({ title: "Approval policy", message: "Two-step review is enabled above $1,000." })}>
                  <span>Approval policy</span><small>Two-step review above $1,000</small>
                </button>
                <button type="button" onClick={() => setToast({ title: "Funding account", message: "Reimbursements use Ops / Payroll." })}>
                  <span>Funding account</span><small>Ops / Payroll</small>
                </button>
                <button type="button" onClick={() => setToast({ title: "Receipt policy", message: "Receipts are required above $75." })}>
                  <span>Receipt requirement</span><small>$75 and above</small>
                </button>
              </Popover>
            )}
          </div>
          <Button variant="soft" icon={<Icon name="plus" size="sm" />} iconPosition="start" onClick={() => setSubmitOpen(true)}>
            Submit expense
          </Button>
        </div>
      </header>

      <Tabs
        ariaLabel="Reimbursement views"
        value={scope}
        onChange={changeScope}
        items={[
          { id: "all-expenses", label: "All expenses", count: pendingReviewCount },
          { id: "my-expenses", label: "My expenses", count: myExpenseCount },
        ]}
      />

      <section
        id={`${scope}-panel`}
        role="tabpanel"
        aria-label={scope === "all-expenses" ? "All expenses" : "My expenses"}
        className={styles.tablePanel}
        {...getLearningTargetProps(enabled, "reimbursements-ledger")}
      >
        <div className={styles.toolbar} {...getLearningTargetProps(enabled, "reimbursements-filters")}>
          <div className={styles.filterGroup}>
            <FilterChip pressed={quickFilter === "all"} onClick={() => changeQuickFilter("all")}>All</FilterChip>
            <FilterChip pressed={quickFilter === "pending-review"} onClick={() => changeQuickFilter("pending-review")}>
              Pending Review
            </FilterChip>
            <div className={styles.filterControl} ref={filterRef}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Icon name="filter" size="sm" />}
                iconPosition="start"
                aria-expanded={filterOpen}
                aria-controls="expense-category-filter"
                onClick={() => {
                  setFilterOpen((value) => !value);
                  setSettingsOpen(false);
                }}
              >
                {category === "All categories" ? "Add filter" : category}
              </Button>
              {filterOpen && (
                <Popover id="expense-category-filter" className={styles.categoryPopover} role="menu" aria-label="Filter by category">
                  <span className={styles.popoverLabel}>Category</span>
                  {categoryOptions.map((option) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={category === option}
                      key={option}
                      onClick={() => {
                        setCategory(option);
                        setSelected(new Set());
                        setFilterOpen(false);
                      }}
                    >
                      <span>{option}</span>
                      {category === option && <Icon name="check" size="sm" />}
                    </button>
                  ))}
                </Popover>
              )}
            </div>
          </div>

          <div className={styles.tableTools}>
            <button type="button" className={styles.iconButton} aria-label="Previous page" disabled><Icon name="arrowLeft" size="sm" /></button>
            <button type="button" className={styles.iconButton} aria-label="Next page" disabled><Icon name="arrowRight" size="sm" /></button>
            <Button variant="quiet" size="sm" icon={<Icon name="send" size="sm" />} iconPosition="start" onClick={exportRows}>
              Export all
            </Button>
          </div>
        </div>

        <div className={`${styles.detailLayout} ${responsiveDrawerV2 && activeRow ? styles.detailLayoutOpen : ""}`}>
          <div className={styles.tableScroller}>
          <table className={styles.table} aria-label={scope === "all-expenses" ? "All expenses" : "My expenses"}>
            <caption>{scope === "all-expenses" ? "All expenses" : "My expenses"}</caption>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    aria-label="Select all visible reimbursements"
                    checked={allVisibleSelected}
                    onChange={toggleVisibleRows}
                  />
                </th>
                <th scope="col">Date</th>
                <th scope="col">Team Member</th>
                <th scope="col">Status</th>
                <th scope="col" className={styles.amountColumn}>Amount</th>
                <th scope="col">Category</th>
                <th scope="col" className={styles.centerColumn}>Receipt</th>
                <th scope="col" className={styles.centerColumn}>Policy</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const status = reimbursementStatus[row.status];
                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    aria-selected={selected.has(row.id)}
                    aria-current={activeRow?.id === row.id ? "true" : undefined}
                    className={activeRow?.id === row.id ? styles.activeRow : ""}
                    onKeyDown={(event) => activateRow(event, row)}
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("input, button, a")) return;
                      openDrawer(row);
                    }}
                  >
                    <td className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.member} reimbursement`}
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                    <td>{row.date}</td>
                    <td>{row.member}</td>
                    <td><StatusPill tone={status.tone}>{status.label}</StatusPill></td>
                    <td className={styles.amountColumn}>{formatCurrency.format(row.amount)}</td>
                    <td>{row.category}</td>
                    <td
                      className={styles.centerColumn}
                      aria-label={row.receipt === "attached" ? "Receipt attached" : "No receipt"}
                    >
                      {row.receipt === "attached" ? (
                        <Icon name="document" size="sm" />
                      ) : <span aria-hidden="true">—</span>}
                    </td>
                    <td
                      className={`${styles.centerColumn} ${row.policy === "flagged" ? styles.policyFlagged : styles.policyPass}`}
                      aria-label={row.policy === "flagged" ? "Policy review needed" : "Within policy"}
                    >
                      <Icon name={row.policy === "flagged" ? "alertCircle" : "check"} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visibleRows.length && (
            <div className={styles.emptyState}>
              <Icon name="search" size="md" />
              <strong>No reimbursements match this view</strong>
              <button type="button" onClick={() => { setQuickFilter("all"); setCategory("All categories"); }}>Clear filters</button>
            </div>
          )}
          </div>

          {responsiveDrawerV2 && (
            <div {...getLearningTargetProps(enabled, "reimbursements-drawer")}>
              <ReimbursementDrawer
                reimbursement={activeRow}
                open={drawerOpen}
                layout="responsive"
                onClose={closeDrawer}
                onExited={() => setActiveRow(null)}
                onAction={completeDrawerAction}
              />
            </div>
          )}
        </div>
      </section>

      {selected.size > 0 && (
        <div className={styles.bulkBar} role="region" aria-label={`${selected.size} reimbursements selected`}>
          <div>
            <strong>{selected.size} {selected.size === 1 ? "request" : "requests"} selected</strong>
            <span>{formatCurrency.format(selectedTotal)} total</span>
          </div>
          <Button variant="quiet" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button variant="secondary" size="sm" onClick={() => applyBulkStatus("declined")}>Decline</Button>
          <Button variant="primary" size="sm" icon={<Icon name="check" size="sm" />} iconPosition="start" onClick={() => applyBulkStatus("payment-pending")}>
            Approve
          </Button>
        </div>
      )}

      {!responsiveDrawerV2 && (
        <div {...getLearningTargetProps(enabled, "reimbursements-drawer")}>
          <ReimbursementDrawer
            reimbursement={activeRow}
            open={drawerOpen}
            onClose={closeDrawer}
            onAction={completeDrawerAction}
          />
        </div>
      )}
      <SubmitExpenseDialog open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmit={addExpense} />
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
