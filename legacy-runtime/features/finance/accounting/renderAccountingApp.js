import { icon } from "../../../shared/ui/icons.js";
import { escapeHtml } from "../../../shared/utils/html.js";
import { renderDemoBanner, renderSidebar, renderUtilityBar } from "../../../shared/legacy/mercury/shell.js";
import { avatar, mercuryMark } from "../../../shared/legacy/mercury/brand.js";
import { accountingRows, accountingTabs, categoryOptions, filterTabs, glCodeOptions } from "./data.js";

function getRows(state) {
  if (state.activeStatus === "all") return accountingRows;
  if (state.activeStatus === "needs") return accountingRows.filter((row) => row.status === "needs" || row.status === "sync");
  return accountingRows.filter((row) => row.status === state.activeStatus);
}

function getValue(row, field, state) {
  return state.edits[row.id]?.[field] ?? row[field] ?? "";
}

function isPositive(amount) {
  return amount.startsWith("$");
}

function renderTabs(state) {
  return `
    <nav class="accounting-tabs" aria-label="Accounting status">
      ${accountingTabs.map((tab) => `
        <button class="${state.activeStatus === tab.id ? "is-active" : ""}" type="button" data-action="status-tab" data-status="${escapeHtml(tab.id)}">
          <span>${escapeHtml(tab.label)}</span>
          ${tab.badge ? `<em>${escapeHtml(tab.badge)}</em>` : ""}
        </button>
      `).join("")}
    </nav>
  `;
}

function renderDatePanel() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `
    <section class="date-panel" aria-label="Date filter">
      <label>
        <span>Show transactions for</span>
        <button type="button">All time ${icon("arrowDown")}</button>
      </label>
      <div class="date-range">
        <label><span>From</span><input value="Feb 14, 2026" aria-label="From date" /></label>
        <i aria-hidden="true">-</i>
        <label><span>To</span><input value="Today" aria-label="To date" /></label>
      </div>
      <div class="month-picker">
        <strong>2026</strong>
        <div>
          ${months.map((month) => `<button class="${month === "Feb" || month === "May" ? "is-selected" : ""}" type="button">${escapeHtml(month)}</button>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFilterPanel(state) {
  const active = state.activeFilter || "Date";
  const renderContent = () => {
    if (active === "Date") return renderDatePanel();
    if (active === "Status") {
      return `
        <section class="filter-field-panel">
          <span class="field-label">Accounting status</span>
          ${["Not reviewed", "Not synced", "Ready to export", "Sync error", "Exported"].map((item, index) => `
            <button class="${index < 2 ? "is-selected" : ""}" type="button">${escapeHtml(item)}</button>
          `).join("")}
        </section>
      `;
    }
    if (active === "Category") {
      return `
        <section class="filter-field-panel">
          <span class="field-label">Category contains</span>
          ${categoryOptions.slice(0, 6).map((item, index) => `<button class="${index === 0 ? "is-selected" : ""}" type="button">${escapeHtml(item)}</button>`).join("")}
        </section>
      `;
    }
    return `
      <section class="filter-field-panel">
        <span class="field-label">${escapeHtml(active)} filter</span>
        <label class="filter-search">${icon("search")}<input value="" placeholder="Search ${escapeHtml(active.toLowerCase())}" /></label>
        <button class="is-selected" type="button">Contains value</button>
        <button type="button">Is empty</button>
        <button type="button">Has issue</button>
      </section>
    `;
  };

  return `
    <div class="filter-popover" role="menu" aria-label="Filters">
      <header>
        <span>My Transactions</span>
        <button class="toggle-switch" type="button" aria-label="My transactions toggle"><i></i></button>
      </header>
      <div class="filter-popover-body">
        <nav aria-label="Filter groups">
          ${filterTabs.map(([label, iconName]) => `
            <button class="${active === label ? "is-active" : ""}" type="button" data-action="filter-tab" data-filter="${escapeHtml(label)}">
              ${icon(iconName)}
              <span>${escapeHtml(label)}</span>
              <b>${icon("arrowUpRight")}</b>
            </button>
          `).join("")}
        </nav>
        ${renderContent()}
      </div>
    </div>
  `;
}

function renderControls(state) {
  return `
    <div class="accounting-controls">
      <div class="control-group">
        <button class="control-button ${state.openMenu === "filters" ? "is-open" : ""}" type="button" data-action="toggle-filters">
          ${icon("customize")}
          <span>Filters</span>
        </button>
        <button class="control-button ${state.openMenu === "date" ? "is-open" : ""}" type="button" data-action="toggle-date">
          <span>Date</span>
          ${icon("arrowDown")}
        </button>
      </div>
      <div class="table-tools" aria-label="Table tools">
        <button class="tool-button is-pointed" type="button" data-action="toggle-columns" aria-label="Customize columns">${icon("customize")}</button>
        <button class="tool-button" type="button" data-action="toggle-density" aria-label="Columns">${icon("columns")}</button>
        <button class="tool-button" type="button" data-action="download-view" aria-label="Download table">${icon("download")}</button>
      </div>
      ${state.openMenu === "filters" ? renderFilterPanel(state) : ""}
      ${state.openMenu === "date" ? `<div class="date-popover">${renderDatePanel()}</div>` : ""}
      ${state.columnCoachOpen ? renderColumnCoach() : ""}
      ${state.columnPanelOpen ? renderColumnPanel() : ""}
    </div>
  `;
}

function renderColumnCoach() {
  return `
    <aside class="columns-coach" role="alert" aria-label="Customize your columns">
      <button type="button" data-action="close-column-coach" aria-label="Close">${icon("close")}</button>
      <strong>Customize your columns</strong>
      <p>Reorder and hide columns to build the view that works best for you.</p>
    </aside>
  `;
}

function renderColumnPanel() {
  const columns = ["Date", "To/From", "Amount", "Payment Method", "Category", "GL Code", "Receipt", "Notes", "Actions"];
  return `
    <aside class="column-panel" aria-label="Customize columns">
      <strong>Customize columns</strong>
      ${columns.map((column, index) => `
        <button type="button" class="${index < 7 ? "is-on" : ""}" data-action="column-toggle">
          <span>${escapeHtml(column)}</span>
          <i></i>
        </button>
      `).join("")}
    </aside>
  `;
}

function renderWarning(state) {
  if (state.warningDismissed) return "";
  return `
    <div class="accounting-warning">
      ${icon("warning")}
      <span>Your sync is almost complete! Check the Sync error tab to review items that need your attention.</span>
      <button class="inline-link" type="button" data-action="review-sync-errors">Review sync errors</button>
      <button class="warning-close" type="button" data-action="dismiss-warning" aria-label="Dismiss warning">${icon("close")}</button>
    </div>
  `;
}

function renderCombo(row, field, state, options) {
  const value = getValue(row, field, state);
  const isOpen = state.openCombo?.rowId === row.id && state.openCombo?.field === field;
  return `
    <div class="combo-wrap ${isOpen ? "is-open" : ""}">
      <button class="combo-control ${value ? "has-value" : "is-empty"}" type="button" data-action="open-combo" data-row="${escapeHtml(row.id)}" data-field="${escapeHtml(field)}" aria-label="${field}">
        <span>${value ? escapeHtml(value) : ""}</span>
        ${value ? "" : icon("arrowDown")}
      </button>
      ${value ? `<button class="combo-clear" type="button" data-action="clear-field" data-row="${escapeHtml(row.id)}" data-field="${escapeHtml(field)}" aria-label="Clear ${field}">${icon("close")}</button>` : ""}
      ${isOpen ? `
        <div class="combo-menu" role="listbox">
          <label>${icon("search")}<input value="" placeholder="Search" /></label>
          ${options.map((option) => `
            <button class="${option === value ? "is-selected" : ""}" type="button" data-action="select-combo" data-row="${escapeHtml(row.id)}" data-field="${escapeHtml(field)}" data-value="${escapeHtml(option)}">
              <span>${escapeHtml(option)}</span>
              ${option === value ? "<em>Selected</em>" : ""}
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderRow(row, state) {
  const selected = state.selectedRows.includes(row.id);
  return `
    <tr class="${selected ? "is-selected" : ""}">
      <td><button class="check-box ${selected ? "is-checked" : ""}" type="button" data-action="toggle-row" data-row="${escapeHtml(row.id)}" aria-label="Select row">${selected ? "✓" : ""}</button></td>
      <td>${escapeHtml(row.date)}</td>
      <td>
        <span class="accounting-payee">
          ${row.mark === "mark" ? mercuryMark() : avatar(row.mark, row.tone || "soft")}
          <span>${escapeHtml(row.name)}</span>
        </span>
      </td>
      <td><span class="accounting-amount ${isPositive(row.amount) ? "is-positive" : ""}">${escapeHtml(row.amount.replace("-", "−"))}</span></td>
      <td><span class="accounting-method">${icon(row.methodIcon)}${escapeHtml(row.method)}</span></td>
      <td>${renderCombo(row, "category", state, categoryOptions)}</td>
      <td>${renderCombo(row, "glCode", state, glCodeOptions)}</td>
      <td>
        <span class="row-actions">
          <button class="${row.id === "working-capital" ? "is-muted" : ""}" type="button" data-action="row-attachment" data-row="${escapeHtml(row.id)}" aria-label="Add attachment">${icon("receipt")}</button>
          <button type="button" data-action="row-note" data-row="${escapeHtml(row.id)}" aria-label="${escapeHtml(row.note)}">${icon("eyeOff")}</button>
        </span>
      </td>
    </tr>
  `;
}

function renderTable(state) {
  const rows = getRows(state);
  const allSelected = rows.length > 0 && rows.every((row) => state.selectedRows.includes(row.id));
  return `
    <div class="accounting-table-wrap">
      <table class="accounting-table">
        <colgroup>
          <col class="col-select" />
          <col class="col-date" />
          <col class="col-party" />
          <col class="col-amount" />
          <col class="col-method" />
          <col class="col-category" />
          <col class="col-gl" />
          <col class="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th><button class="check-box ${allSelected ? "is-checked" : ""}" type="button" data-action="toggle-all">${allSelected ? "✓" : ""}</button></th>
            <th><button type="button" data-action="sort-date">Date (EDT) ${icon("arrowDown")}</button></th>
            <th>To/From</th>
            <th>Amount <i class="small-info">S</i></th>
            <th>Payment Method</th>
            <th>Category</th>
            <th>GL Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => renderRow(row, state)).join("")}
        </tbody>
      </table>
      ${rows.length === 0 ? `<div class="accounting-empty">No transactions match this accounting status.</div>` : ""}
    </div>
  `;
}

function renderHeaderActions(state) {
  return `
    <div class="accounting-header-actions">
      <button class="settings-link" type="button" data-action="toggle-settings">${icon("settings")}<span>Settings</span></button>
      <button class="export-button" type="button" data-action="toggle-export">${icon("download")}<span>Export</span></button>
      ${state.settingsOpen ? `
        <div class="settings-menu">
          <button type="button" data-action="settings-item">Accounting provider</button>
          <button type="button" data-action="settings-item">Chart of accounts</button>
          <button type="button" data-action="settings-item">Sync rules</button>
        </div>
      ` : ""}
      ${state.exportOpen ? `
        <div class="export-menu">
          <button type="button" data-action="export-item">Export CSV</button>
          <button type="button" data-action="export-item">Export to QuickBooks</button>
          <button type="button" data-action="export-item">Export selected</button>
        </div>
      ` : ""}
    </div>
  `;
}

export function renderAccountingApp(state) {
  return `
    <main class="mercury-study-shell accounting-study-shell">
      ${renderDemoBanner()}
      <div class="mercury-app">
        ${renderSidebar({ active: "Accounting", showWorkflowRoutes: true })}
        <section class="mercury-main">
          ${renderUtilityBar(state)}
          <div class="accounting-page">
            <header class="accounting-title-row">
              <div>
                <h1>Accounting</h1>
                <button class="title-bookmark" type="button" data-action="bookmark-view" aria-label="Bookmark Accounting">${icon("bookmark")}</button>
              </div>
              ${renderHeaderActions(state)}
            </header>
            ${renderTabs(state)}
            ${renderControls(state)}
            ${renderWarning(state)}
            ${renderTable(state)}
          </div>
        </section>
      </div>
    </main>
  `;
}
