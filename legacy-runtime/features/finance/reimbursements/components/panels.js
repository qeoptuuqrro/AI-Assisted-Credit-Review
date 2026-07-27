import { escapeHtml } from "../../../../shared/utils/html.js";
import { formatMoney, renderStatus } from "./table.js";
import { svgIcon } from "./shell.js";

export function renderDetailPanel(row) {
  if (!row) return "";
  return `
    <aside class="expense-detail is-open" aria-label="Expense detail">
      <header class="detail-header">
        <div>
          <span>Expense request</span>
          <h2>${escapeHtml(row.merchant)}</h2>
        </div>
        <button class="icon-button" type="button" data-action="close-detail" aria-label="Close details">${svgIcon("close")}</button>
      </header>

      <div class="detail-scroll">
        <section class="receipt-preview">
          <div class="receipt-paper">
            <span>${escapeHtml(row.merchant)}</span>
            <strong>${formatMoney(row.amount)}</strong>
            <small>${escapeHtml(row.date)} · ${escapeHtml(row.category)}</small>
            <i></i>
            <em>${row.receipt === "missing" ? "Receipt needed" : "Receipt image verified"}</em>
          </div>
          <button type="button" data-action="view-receipt">${svgIcon("receipt")}View receipt</button>
        </section>

        <section class="detail-card">
          <div class="detail-row"><span>Status</span>${renderStatus(row.status)}</div>
          <div class="detail-row"><span>Submitted by</span><strong>${escapeHtml(row.member)}</strong></div>
          <div class="detail-row"><span>Reviewer</span><strong>${escapeHtml(row.reviewer)}</strong></div>
          <div class="detail-row"><span>Source</span><strong>${escapeHtml(row.source)}</strong></div>
        </section>

        <section class="detail-card">
          <h3>Policy review</h3>
          <p>${escapeHtml(row.policyNote)}</p>
          <div class="policy-meter" aria-label="Policy confidence">
            <span style="width:${row.policy === "inside" ? "86" : row.policy === "needs-review" ? "58" : "34"}%"></span>
          </div>
          <div class="detail-row"><span>Category</span><strong>${escapeHtml(row.category)}</strong></div>
          <div class="detail-row"><span>Receipt</span><strong>${escapeHtml(row.receipt.replace("-", " "))}</strong></div>
        </section>

        <section class="detail-card note-card">
          <h3>Reviewer note</h3>
          <textarea aria-label="Reviewer note" placeholder="Add context for finance or the team member...">${row.status === "details" ? "Please attach the itemized receipt before the next payment run." : ""}</textarea>
        </section>
      </div>

      <footer class="detail-actions">
        <button class="quiet-button danger" type="button" data-action="decline-detail">Decline</button>
        <button class="quiet-button" type="button" data-action="request-detail">Request details</button>
        <button class="primary-button" type="button" data-action="approve-detail">${svgIcon("approve")}Approve</button>
      </footer>
    </aside>
  `;
}

export function renderSubmitDialog(state) {
  if (!state.submitOpen) return "";
  return `
    <div class="modal-scrim" data-action="close-submit"></div>
    <section class="submit-dialog" role="dialog" aria-label="Submit expense">
      <header>
        <div>
          <span>${svgIcon("upload")}New reimbursement</span>
          <h2>Submit an expense</h2>
        </div>
        <button class="icon-button" type="button" data-action="close-submit" aria-label="Close submit expense">${svgIcon("close")}</button>
      </header>
      <div class="submit-body">
        <label>
          <span>Merchant</span>
          <input type="text" value="Hudson Table" data-submit-field="merchant" />
        </label>
        <div class="submit-grid">
          <label>
            <span>Amount</span>
            <input type="text" value="$148.90" data-submit-field="amount" />
          </label>
          <label>
            <span>Category</span>
            <select data-submit-field="category">
              <option>Meals</option>
              <option>Travel</option>
              <option>Ground</option>
              <option>Software</option>
              <option>Office</option>
            </select>
          </label>
        </div>
        <label>
          <span>Memo</span>
          <textarea data-submit-field="memo">Prep meal for sponsor diligence session</textarea>
        </label>
        <button class="upload-drop" type="button" data-action="upload-receipt">
          ${svgIcon("receipt")}
          <span><strong>Drop receipt or upload</strong><small>PDF, PNG, JPG up to 10MB</small></span>
        </button>
      </div>
      <footer>
        <button class="quiet-button" type="button" data-action="close-submit">Cancel</button>
        <button class="primary-button" type="button" data-action="submit-expense">${svgIcon("approve")}Submit expense</button>
      </footer>
    </section>
  `;
}

export function renderToast(state) {
  if (!state.toast) return `<div class="expense-toast" aria-live="polite"></div>`;
  return `
    <div class="expense-toast is-visible" aria-live="polite">
      <strong>${escapeHtml(state.toast.title)}</strong>
      <span>${escapeHtml(state.toast.message)}</span>
    </div>
  `;
}
