import { escapeHtml } from "../../../../shared/utils/html.js";

export function renderExpenseSymbols() {
  return `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="e-approve" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
        <symbol id="e-arrow" viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></symbol>
        <symbol id="e-bank" viewBox="0 0 24 24"><path d="m4 9 8-4 8 4"/><path d="M5 9h14M7 11v6M12 11v6M17 11v6M5 19h14"/></symbol>
        <symbol id="e-bell" viewBox="0 0 24 24"><path d="M18 8.5a6 6 0 0 0-12 0c0 6.8-2.5 7-2.5 7h17s-2.5-.2-2.5-7"/><path d="M14 19a2.2 2.2 0 0 1-4 0"/></symbol>
        <symbol id="e-card" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 10h16"/><path d="M7 14h4"/></symbol>
        <symbol id="e-checklist" viewBox="0 0 24 24"><path d="m5 7 .9.9L8 5.5"/><path d="M11 7h8"/><path d="m5 13 .9.9L8 11.5"/><path d="M11 13h8"/><path d="m5 19 .9.9L8 17.5"/><path d="M11 19h8"/></symbol>
        <symbol id="e-close" viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"/></symbol>
        <symbol id="e-export" viewBox="0 0 24 24"><path d="M12 4v11"/><path d="m8 11 4 4 4-4"/><path d="M5 20h14"/></symbol>
        <symbol id="e-filter" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></symbol>
        <symbol id="e-home" viewBox="0 0 24 24"><path d="m4 11 8-7 8 7"/><path d="M6.5 9.5V20h11V9.5"/></symbol>
        <symbol id="e-note" viewBox="0 0 24 24"><path d="M7 4.5h10v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2Z"/><path d="M9.5 9h5M9.5 13h5"/></symbol>
        <symbol id="e-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
        <symbol id="e-policy" viewBox="0 0 24 24"><path d="M12 4.5 18.5 7v5.4c0 4.1-2.7 6.5-6.5 7.6-3.8-1.1-6.5-3.5-6.5-7.6V7Z"/><path d="m9 12 2 2 4-5"/></symbol>
        <symbol id="e-receipt" viewBox="0 0 24 24"><path d="M7 4h10v16l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2Z"/><path d="M9.5 9h5M9.5 13h5"/></symbol>
        <symbol id="e-search" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.2"/><path d="m15.2 15.2 4 4"/></symbol>
        <symbol id="e-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2.9a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.9h5l.3-2.9a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.6c.1-.3.1-.7.1-1Z"/></symbol>
        <symbol id="e-spark" viewBox="0 0 24 24"><path d="m12 4 1.3 4.6L18 10l-4.7 1.4L12 16l-1.3-4.6L6 10l4.7-1.4Z"/><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z"/></symbol>
        <symbol id="e-upload" viewBox="0 0 24 24"><path d="M12 16V5"/><path d="m8 9 4-4 4 4"/><path d="M5 19h14"/></symbol>
        <symbol id="e-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M4 19c.5-3.4 2.3-5 5-5s4.5 1.6 5 5"/><path d="M15 11a2.6 2.6 0 1 0 0-5"/><path d="M16 14.2c2.2.4 3.5 2 4 4.8"/></symbol>
      </defs>
    </svg>
  `;
}

export function svgIcon(name) {
  return `<svg aria-hidden="true"><use href="#e-${name}"></use></svg>`;
}

export function renderExpenseRail(state, counts) {
  const nav = [
    ["home", "Overview", ""],
    ["receipt", "Reimbursements", String(counts.total), true],
    ["checklist", "Approvals", String(counts.pending)],
    ["card", "Corporate cards", ""],
    ["bank", "Payment runs", ""],
  ];
  const queues = [
    ["Pending review", counts.pending, "pending"],
    ["Needs receipt", counts.needsReceipt, "needs-receipt"],
    ["Policy flags", counts.policyFlags, "policy"],
  ];

  return `
    <aside class="expense-rail" aria-label="Expense workspace navigation">
      <div class="expense-brand">
        <span class="expense-logo">${svgIcon("receipt")}</span>
        <div>
          <strong>Expense Desk</strong>
          <span>Review queue</span>
        </div>
      </div>

      <nav class="expense-nav">
        <section>
          <p>Workspace</p>
          ${nav.map(([iconName, label, count, active]) => `
            <button class="expense-nav-item ${active ? "is-active" : ""}" type="button" data-rail-action="${escapeHtml(label)}">
              ${svgIcon(iconName)}
              <span>${escapeHtml(label)}</span>
              ${count ? `<em>${escapeHtml(count)}</em>` : ""}
            </button>
          `).join("")}
        </section>

        <section>
          <p>Queues</p>
          ${queues.map(([label, count, filter]) => `
            <button class="queue-card ${state.filter === filter ? "is-active" : ""}" type="button" data-filter="${escapeHtml(filter)}">
              <span>${escapeHtml(label)}</span>
              <strong>${count}</strong>
            </button>
          `).join("")}
        </section>
      </nav>

      <div class="expense-rail-foot">
        <div class="review-pulse">
          <span class="pulse-ring"></span>
          <div>
            <strong>${counts.policyFlags} policy flags</strong>
            <span>Review highest-value items before today&apos;s payment run.</span>
          </div>
        </div>
      </div>
    </aside>
  `;
}

export function renderExpenseHeader(state, counts) {
  return `
    <header class="expense-header">
      <div class="expense-title">
        <span class="sync-pill"><i></i>Synced 2 minutes ago</span>
        <div class="title-row">
          <h1>Reimbursements</h1>
          <span class="pro-chip">Treasury Pro</span>
        </div>
        <p>Approve employee expenses, verify receipts, and keep policy exceptions moving.</p>
      </div>
      <div class="expense-actions">
        <button class="quiet-button" type="button" data-action="settings">${svgIcon("settings")}<span>Settings</span></button>
        <button class="primary-button" type="button" data-action="open-submit">${svgIcon("plus")}<span>Submit expense</span></button>
      </div>
      ${state.settingsOpen ? renderSettingsMenu() : ""}
    </header>
    <section class="expense-tabs" aria-label="Expense views">
      <button class="${state.tab === "all" ? "is-active" : ""}" type="button" data-tab="all">All expenses <span>${counts.total}</span></button>
      <button class="${state.tab === "mine" ? "is-active" : ""}" type="button" data-tab="mine">My expenses <span>${counts.mine}</span></button>
    </section>
  `;
}

function renderSettingsMenu() {
  const rows = [
    ["Approval policy", "2-step review above $1,000"],
    ["Reimbursement account", "Operating / Payroll"],
    ["Receipt threshold", "$75 and above"],
  ];
  return `
    <section class="settings-menu" role="dialog" aria-label="Reimbursement settings">
      <strong>Reimbursement settings</strong>
      ${rows.map(([label, value]) => `
        <button type="button" data-action="settings-item">
          <span>${escapeHtml(label)}</span>
          <em>${escapeHtml(value)}</em>
        </button>
      `).join("")}
    </section>
  `;
}

export function renderExpenseFilterBar(state, counts) {
  const filters = [
    ["all", "All", counts.total],
    ["pending", "Pending Review", counts.pending],
    ["needs-receipt", "Needs Receipt", counts.needsReceipt],
    ["policy", "Policy", counts.policyFlags],
  ];
  return `
    <section class="expense-filter-bar">
      <div class="filter-chips">
        ${filters.map(([id, label, count]) => `
          <button class="filter-chip ${state.filter === id ? "is-active" : ""}" type="button" data-filter="${escapeHtml(id)}">
            ${id === "all" ? svgIcon("filter") : ""}
            <span>${escapeHtml(label)}</span>
            <em>${count}</em>
          </button>
        `).join("")}
      </div>
      <label class="expense-search">
        ${svgIcon("search")}
        <input type="search" value="${escapeHtml(state.query)}" placeholder="Search member, merchant, memo..." data-search />
      </label>
      <div class="table-tools">
        <button class="icon-button" type="button" data-action="policy-view" aria-label="Policy view">${svgIcon("policy")}</button>
        <button class="export-button" type="button" data-action="export">${svgIcon("export")}<span>Export all</span></button>
      </div>
    </section>
  `;
}
