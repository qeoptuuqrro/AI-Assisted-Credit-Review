import { renderDetailPanel, renderSubmitDialog, renderToast } from "./components/panels.js";
import { renderExpenseFilterBar, renderExpenseHeader, renderExpenseRail, renderExpenseSymbols } from "./components/shell.js";
import { renderExpenseTable, renderSummaryStrip } from "./components/table.js";

export function getCounts(rows) {
  return rows.reduce((counts, row) => {
    counts.total += 1;
    counts[row.status] = (counts[row.status] || 0) + 1;
    if (row.member === "Jane Smith") counts.mine += 1;
    if (row.receipt === "missing") counts.needsReceipt += 1;
    if (row.policy === "flagged" || row.policy === "needs-review") counts.policyFlags += 1;
    return counts;
  }, {
    total: 0,
    mine: 0,
    pending: 0,
    payment: 0,
    declined: 0,
    details: 0,
    action: 0,
    approved: 0,
    needsReceipt: 0,
    policyFlags: 0,
  });
}

export function getVisibleRows(rows, state) {
  const query = state.query.trim().toLowerCase();
  return rows.filter((row) => {
    const inTab = state.tab === "all" || row.member === "Jane Smith";
    const inFilter =
      state.filter === "all" ||
      (state.filter === "pending" && (row.status === "pending" || row.status === "action" || row.status === "details")) ||
      (state.filter === "needs-receipt" && row.receipt === "missing") ||
      (state.filter === "policy" && (row.policy === "flagged" || row.policy === "needs-review"));
    const haystack = `${row.member} ${row.role} ${row.merchant} ${row.memo} ${row.category} ${row.status}`.toLowerCase();
    return inTab && inFilter && (!query || haystack.includes(query));
  });
}

export function renderReimbursementsApp(rows, state) {
  const counts = getCounts(rows);
  const visibleRows = getVisibleRows(rows, state);
  const activeRow = rows.find((row) => row.id === state.detailId);

  return `
    ${renderExpenseSymbols()}
    <div class="reimbursements-app">
      ${renderExpenseRail(state, counts)}
      <main class="expense-main">
        ${renderExpenseHeader(state, counts)}
        ${renderExpenseFilterBar(state, counts)}
        ${renderSummaryStrip(rows, counts)}
        ${renderExpenseTable(rows, state, visibleRows)}
      </main>
      ${renderDetailPanel(activeRow)}
      ${renderSubmitDialog(state)}
      ${renderToast(state)}
    </div>
  `;
}
