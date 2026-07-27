import { escapeHtml } from "../../../../shared/utils/html.js";
import { checkbox, statusPill, tag } from "../../../../shared/ui/primitives.js";
import { categoryPalette, statusMeta } from "../data.js";
import { svgIcon } from "./shell.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(value) {
  return money.format(value);
}

export function renderSummaryStrip(rows, counts) {
  const pendingTotal = rows
    .filter((row) => row.status === "pending" || row.status === "action" || row.status === "details")
    .reduce((sum, row) => sum + row.amount, 0);
  const paymentTotal = rows
    .filter((row) => row.status === "payment" || row.status === "approved")
    .reduce((sum, row) => sum + row.amount, 0);
  const approvalRate = counts.total ? Math.round(((counts.payment + counts.approved) / counts.total) * 100) : 0;

  return `
    <section class="expense-summary" aria-label="Reimbursement summary">
      <article class="expense-metric metric-review">
        <span>Needs decision</span>
        <strong>${counts.pending + counts.action + counts.details}</strong>
        <small>${formatMoney(pendingTotal)} awaiting review</small>
        <div class="metric-spark" aria-hidden="true"><i style="height:38%"></i><i style="height:64%"></i><i style="height:46%"></i><i style="height:82%"></i><i style="height:58%"></i></div>
      </article>
      <article class="expense-metric metric-pay">
        <span>Payment queue</span>
        <strong>${formatMoney(paymentTotal)}</strong>
        <small>${counts.payment} requests in next run</small>
        <div class="mini-route" aria-hidden="true"><i></i><i></i><i></i></div>
      </article>
      <article class="expense-metric metric-policy">
        <span>Policy attention</span>
        <strong>${counts.policyFlags}</strong>
        <small>${counts.needsReceipt} receipt gaps</small>
        <div class="policy-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      </article>
      <article class="expense-metric metric-automation">
        <span>Auto checks</span>
        <strong>${approvalRate}%</strong>
        <small>Matched to receipt or policy</small>
        <div class="ring-chart" style="--value:${approvalRate}%" aria-hidden="true"><span></span></div>
      </article>
    </section>
  `;
}

export function renderExpenseTable(rows, state, visibleRows) {
  const selectedCount = state.selected.size;
  const selectedTotal = rows.filter((row) => state.selected.has(row.id)).reduce((sum, row) => sum + row.amount, 0);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => state.selected.has(row.id));

  return `
    <section class="expense-table-shell">
      <div class="selection-bar ${selectedCount ? "is-visible" : ""}">
        <strong>${selectedCount} ${selectedCount === 1 ? "request" : "requests"} selected</strong>
        <span>${formatMoney(selectedTotal)} total</span>
        <button class="bulk-button" type="button" data-action="bulk-request">Request details</button>
        <button class="bulk-button danger" type="button" data-action="bulk-decline">Decline</button>
        <button class="bulk-button approve" type="button" data-action="bulk-approve">${svgIcon("approve")}Approve</button>
      </div>

      <div class="table-context">
        <div>
          <strong>${visibleRows.length} requests</strong>
          <span>Sorted by newest submitted expense</span>
        </div>
        <div class="table-legend">
          <span><i class="dot receipt-ok"></i>Receipt verified</span>
          <span><i class="dot policy-flag"></i>Policy review</span>
        </div>
      </div>

      <div class="expense-table-scroll">
        <table class="expense-table">
          <thead>
            <tr>
              <th class="select-col">${checkbox({ checked: allVisibleSelected, label: "Select visible expenses", attrs: 'data-action="select-visible"' })}</th>
              <th class="date-col">Date</th>
              <th>Team Member</th>
              <th class="status-col">Status</th>
              <th class="amount-col">Amount</th>
              <th class="merchant-col">Merchant</th>
              <th class="category-col">Category</th>
              <th class="receipt-col">Receipt</th>
              <th class="policy-col">Policy</th>
            </tr>
          </thead>
          <tbody>
            ${visibleRows.map((row) => renderExpenseRow(row, state)).join("")}
          </tbody>
        </table>
        ${visibleRows.length ? "" : `<div class="expense-empty">No reimbursements match this view.</div>`}
      </div>
    </section>
  `;
}

function renderExpenseRow(row, state) {
  const selected = state.selected.has(row.id);
  const active = state.detailId === row.id;
  return `
    <tr class="${active ? "is-active" : ""}" data-row="${escapeHtml(row.id)}">
      <td class="select-col">
        ${checkbox({ checked: selected, label: `Select ${row.member} expense`, attrs: `data-select="${escapeHtml(row.id)}"` })}
      </td>
      <td class="date-col">
        <span class="date-stack"><strong>${escapeHtml(row.date)}</strong><small>${escapeHtml(row.submittedAt)}</small></span>
      </td>
      <td>
        <div class="member-cell">
          <span class="member-avatar">${escapeHtml(row.initials)}</span>
          <span><strong>${escapeHtml(row.member)}</strong><small>${escapeHtml(row.role)}</small></span>
        </div>
      </td>
      <td class="status-col">${renderStatus(row.status)}</td>
      <td class="amount-col"><strong>${formatMoney(row.amount)}</strong></td>
      <td class="merchant-col">
        <span class="merchant-stack"><strong>${escapeHtml(row.merchant)}</strong><small>${escapeHtml(row.memo)}</small></span>
      </td>
      <td class="category-col">${renderCategory(row.category)}</td>
      <td class="receipt-col">${renderReceipt(row.receipt)}</td>
      <td class="policy-col">${renderPolicy(row.policy, row.policyNote)}</td>
    </tr>
  `;
}

export function renderStatus(status) {
  const meta = statusMeta[status] || statusMeta.pending;
  return statusPill(meta.label, meta.tone);
}

function renderCategory(category) {
  const tone = categoryPalette[category] || "slate";
  return tag(category, tone);
}

function renderReceipt(receipt) {
  const labels = {
    attached: ["Attached", "ok"],
    missing: ["Missing", "missing"],
    "not-required": ["Not required", "neutral"],
  };
  const [label, tone] = labels[receipt] || labels.attached;
  return `<span class="receipt-state tone-${tone}"><i></i>${escapeHtml(label)}</span>`;
}

function renderPolicy(policy, note) {
  const labels = {
    inside: ["Inside policy", "ok"],
    "needs-review": ["Needs review", "review"],
    flagged: ["Flagged", "flagged"],
  };
  const [label, tone] = labels[policy] || labels.inside;
  return `<span class="policy-state tone-${tone}" title="${escapeHtml(note)}">${escapeHtml(label)}</span>`;
}
