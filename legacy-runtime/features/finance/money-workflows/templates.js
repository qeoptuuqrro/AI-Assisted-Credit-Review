import { icon } from "../../../shared/ui/icons.js";
import { escapeHtml } from "../../../shared/utils/html.js";
import { mercuryMark } from "../../../shared/legacy/mercury/brand.js";
import { renderDemoBanner, renderHomeActionPanel, renderSidebar, renderUtilityBar } from "../../../shared/legacy/mercury/shell.js";
import { accounts, billRows, cardRows, invoiceRows, reimbursementRows, routeMeta, settingsSections, tasks, transactions } from "./data.js?v=feature-money-workflows-22";

const transactionSummaryByView = {
  "All transactions": { net: 3344768.12, moneyIn: 4141953.82, moneyOut: -797185.70, previous: -110296.80, count: 1165 },
  "My transactions": { net: 78542.91, moneyIn: 132418.73, moneyOut: -53875.82, previous: -18420.14, count: 86 },
  "Monthly money in": { net: 4141953.82, moneyIn: 4141953.82, moneyOut: 0, previous: 3281971.44, count: 347 },
  "Monthly money out": { net: -798420.26, moneyIn: 0, moneyOut: -798420.26, previous: -110296.80, count: 818 },
  "Operating expenses": { net: -126418.59, moneyIn: 0, moneyOut: -126418.59, previous: -98420.44, count: 412 },
};

const transactionCategoryOptions = [
  "Legal Fees",
  "Travel - Accommodation",
  "Travel - Vehicles",
  "Venue Rental",
  "Employee Gifts",
  "Software",
  "Investments",
];

const transactionGlOptions = [
  "734 - COGS",
  "215 - Accounts Payable",
  "404 - Incoming",
  "612 - Software",
  "650 - Meals",
  "740 - Review",
  "318 - Unbilled Receivables",
];

function amountClass(value) {
  return value.startsWith("-") ? "" : "is-positive";
}

function initialsMark(initials) {
  if (initials === "mark") return mercuryMark();
  return `<span class="mp-avatar">${initials}</span>`;
}

function statusPill(label) {
  const tone = label.toLowerCase().replaceAll(" ", "-");
  return `<span class="mp-status tone-${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

function moneyNumber(value) {
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

function formatMoney(value) {
  const absolute = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : ""}$${absolute}`;
}

function displayTotals(calculated, state) {
  const hasActiveFilters = Boolean(state.activeKeyword || state.activeAmount || state.activeStatus || state.activeSort === "Amount high to low" || state.activeSort === "Amount low to high");
  const reference = transactionSummaryByView[state.activeDataView] || transactionSummaryByView["All transactions"];
  return hasActiveFilters ? { ...reference, ...calculated, count: calculated.count || reference.count } : reference;
}

function summaryMetric(label, value, tone = "") {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong class="${tone} sensitive">${formatMoney(value)}</strong>
    </article>
  `;
}

function renderEmptyTableRow(colspan, title, body, action = "") {
  return `
    <tr class="mp-empty-row">
      <td colspan="${colspan}">
        <div class="mp-empty-state">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(body)}</span>
          ${action ? `<button type="button" data-action="${escapeHtml(action)}">${icon("plus")}<span>Create</span></button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function mercuryProPill() {
  return `<span class="mp-pro-pill">${icon("sparkle")}<span>Mercury Pro</span></span>`;
}

function pageHeader(state, actions = "", options = {}) {
  const meta = routeMeta[state.route];
  return `
    <header class="mp-page-head">
      <div>
        <div class="mp-page-title-line">
          <h1>${escapeHtml(meta.title)}</h1>
          ${options.titleBadge || ""}
          ${options.pro ? mercuryProPill() : ""}
        </div>
        ${meta.subtitle ? `<p>${escapeHtml(meta.subtitle)}</p>` : ""}
      </div>
      <div class="mp-head-actions">${actions}</div>
    </header>
  `;
}

function secondaryNav(items, active = 0, attribute = "data-tab") {
  return `
    <nav class="mp-secondary-nav" aria-label="Page sections">
      ${items.map((item, index) => `<button class="${index === active ? "is-active" : ""}" type="button" ${attribute}="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
    </nav>
  `;
}

function lineTabs(items, active = 0, attribute = "data-tab") {
  return `
    <nav class="mp-line-tabs" aria-label="Page sections">
      ${items.map((item, index) => {
        const label = Array.isArray(item) ? item[0] : item;
        const count = Array.isArray(item) ? item[1] : "";
        return `<button class="${index === active ? "is-active" : ""}" type="button" ${attribute}="${escapeHtml(label)}"><span>${escapeHtml(label)}</span>${count ? `<em>${escapeHtml(count)}</em>` : ""}</button>`;
      }).join("")}
    </nav>
  `;
}

function activeIndex(items, state, fallback = 0) {
  const index = items.indexOf(state.activeTab);
  return index === -1 ? fallback : index;
}

function toolButton(label, iconName, action, extra = "") {
  return `<button class="mp-button ${extra}" type="button" data-action="${escapeHtml(action)}">${icon(iconName)}<span>${escapeHtml(label)}</span></button>`;
}

function iconTool(label, iconName, action) {
  return `<button class="mp-icon-tool" type="button" data-action="${escapeHtml(action)}" aria-label="${escapeHtml(label)}">${icon(iconName)}</button>`;
}

function filterToolbar(state, { includeGraphs = false, includeStatus = false } = {}) {
  const openClass = (name) => state.activePopover === name ? "is-open" : "";
  const activeClass = (name, active) => [openClass(name), active ? "is-active" : ""].filter(Boolean).join(" ");
  return `
    <div class="mp-filter-toolbar">
      <div class="mp-filter-group">
        <button class="${activeClass("data-views", state.activeDataView !== "All transactions")}" type="button" data-popover="data-views">${icon("bookmark")}<span>Data views</span>${icon("arrowDown")}</button>
        <button class="${openClass("filters")}" type="button" data-popover="filters">${icon("customize")}<span>Filters</span></button>
        ${includeStatus ? `<button class="${activeClass("status", Boolean(state.activeStatus))}" type="button" data-popover="status"><span>Status</span>${icon("arrowDown")}</button>` : ""}
        <button class="${activeClass("date", state.activeSort === "Old to new" || state.activeSort === "New to old")}" type="button" data-popover="date"><span>Date</span>${icon("arrowDown")}</button>
        <button class="${activeClass("keyword", Boolean(state.activeKeyword))}" type="button" data-popover="keyword"><span>Keyword</span>${icon("arrowDown")}</button>
        <button class="${activeClass("amount", Boolean(state.activeAmount))}" type="button" data-popover="amount"><span>Amount</span>${icon("arrowDown")}</button>
      </div>
      <div class="mp-table-tools">
        ${includeGraphs ? "" : ""}
        ${iconTool("Group", "columns", "group")}
        ${iconTool("Sort", "transfer", "sort")}
        ${iconTool("Settings", "customize", "table-settings")}
        ${toolButton("Export all", "download", "export-all", "is-text")}
      </div>
    </div>
    ${renderActiveFilterChips(state)}
    ${renderPopover(state)}
  `;
}

function invoicingToolbar(state) {
  const openClass = (name) => state.activePopover === name ? "is-open" : "";
  const activeClass = (name, active) => [openClass(name), active ? "is-active" : ""].filter(Boolean).join(" ");
  return `
    <div class="mp-filter-toolbar">
      <div class="mp-filter-group">
        <button class="${openClass("filters")}" type="button" data-popover="filters">${icon("customize")}<span>Filters</span></button>
        <button class="${activeClass("status", Boolean(state.activeStatus))}" type="button" data-popover="status"><span>Status</span>${icon("arrowDown")}</button>
        <button class="${activeClass("type", Boolean(state.activeType))}" type="button" data-popover="type"><span>Type</span>${icon("arrowDown")}</button>
      </div>
      <div class="mp-table-tools">
        ${toolButton("Export all", "download", "export-all", "is-text")}
      </div>
    </div>
    ${renderActiveFilterChips(state)}
    ${renderPopover(state)}
  `;
}

function renderActiveFilterChips(state) {
  const chips = [
    state.activeDataView !== "All transactions" ? ["data-view", state.activeDataView] : null,
    state.activeKeyword ? ["keyword", `Keyword: ${state.activeKeyword}`] : null,
    state.activeAmount ? ["amount", `Amount: ${state.activeAmount}`] : null,
    state.activeStatus ? ["status", `Status: ${state.activeStatus}`] : null,
    state.activeType ? ["type", `Type: ${state.activeType}`] : null,
    state.activeSort ? ["sort", `Sort: ${state.activeSort}`] : null,
  ].filter(Boolean);

  if (!chips.length) return "";
  return `
    <div class="mp-active-chips" aria-label="Applied filters">
      ${chips.map(([kind, label]) => `
        <button type="button" data-filter-clear="${escapeHtml(kind)}">
          <span>${escapeHtml(label)}</span>${icon("close")}
        </button>
      `).join("")}
    </div>
  `;
}

function renderFilterFieldPanel(activeField) {
  const field = activeField || "Date";
  if (field === "Date") {
    return `
      <label><span>Show transactions for</span><button type="button">All time ${icon("arrowDown")}</button></label>
      <div class="mp-date-grid"><span>From</span><span>To</span><button type="button">Feb 14, 2026</button><button type="button">Today</button></div>
      <div class="mp-month-grid">${["2026", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((item) => `<button class="${item === "Feb" || item === "May" ? "is-active" : ""}" type="button">${escapeHtml(item)}</button>`).join("")}</div>
    `;
  }
  if (field === "Keyword") {
    return `
      <label class="mp-filter-search">${icon("search")}<input placeholder="Search merchants, memo, or recipient" /></label>
      <div class="mp-filter-pills">${["Contractor", "Mercury", "Transfer", "Lunch", "Invoice"].map((item) => `<button type="button" data-action="keyword-item" data-filter-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}</div>
    `;
  }
  if (field === "Amount") {
    return `
      <label><span>Minimum</span><input value="$0.00" /></label>
      <label><span>Maximum</span><input value="$5,000.00" /></label>
      <button class="mp-filter-apply" type="button" data-action="apply-amount">Apply amount filter</button>
    `;
  }
  const action = field === "Status" ? "status-filter" : "keyword-item";
  const values = field === "Status" ? ["Missing", "Matched", "Needs review", "Failed"] : ["Missing", "Matched", "Needs review", "Posted"];
  return `
    <label><span>${escapeHtml(field)}</span><button type="button">Any ${escapeHtml(field.toLowerCase())} ${icon("arrowDown")}</button></label>
    <div class="mp-filter-pills">
      ${values.map((item) => `<button type="button" data-action="${action}" data-filter-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
    </div>
  `;
}

function renderPopover(state) {
  const activePopover = state.activePopover;
  if (!activePopover) return "";
  if (state.route === "cards" && activePopover === "filters") {
    return renderCardFilterPopover(state);
  }
  const filterFields = ["Date", "Keyword", "Amount", "Method", "Category", "Merchant Type", "GL Code", "Account", "Team Member", "Department", "Card", "Status", "Policy", "Attachment"];
  const activeField = state.activeFilterField || "Date";
  const dataViews = [
    ["view-my", "My transactions"],
    ["view-money-in", "Monthly money in"],
    ["view-money-out", "Monthly money out"],
    ["view-expenses", "Operating expenses"],
  ];
  const panels = {
    "data-views": `
      ${dataViews.map(([action, label]) => `<button class="${state.activeDataView === label ? "is-selected" : ""}" type="button" data-action="${action}">${state.activeDataView === label ? icon("check") : ""}<span>${escapeHtml(label)}</span></button>`).join("")}
      <button type="button" data-action="create-view">${icon("plus")} Create view</button>
    `,
    filters: `
      <div class="mp-filter-builder">
        <nav>
          ${filterFields.map((item) => `<button class="${item === activeField ? "is-active" : ""}" type="button" data-filter-field="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </nav>
        <section>
          ${renderFilterFieldPanel(activeField)}
        </section>
      </div>
    `,
    keyword: `
      <label class="mp-popover-search">${icon("search")}<input placeholder="Search for merchants, recipients..." /></label>
      <strong>Recent</strong>
      ${["Contractor", "Lighthouse Properties #3431", "Domestic Ads", "Debug LLC", "Nutritionist", "Jordi O'Donnell", "Jean Vallee", "Catherine Ndereba"].map((item) => `<button class="${state.activeKeyword === item ? "is-selected" : ""}" type="button" data-action="keyword-item" data-filter-value="${escapeHtml(item)}">${state.activeKeyword === item ? icon("check") : ""}<span>${escapeHtml(item)}</span><em>Recipient</em></button>`).join("")}
    `,
    date: `
      <button class="${state.activeSort === "Old to new" ? "is-selected" : ""}" type="button" data-action="sort-old-new">${state.activeSort === "Old to new" ? icon("check") : ""}<span>Old to new</span></button>
      <button class="${state.activeSort === "New to old" ? "is-selected" : ""}" type="button" data-action="sort-new-old">${state.activeSort === "New to old" ? icon("check") : ""}<span>New to old</span></button>
      <button type="button" data-action="clear-sort">Clear sort</button>
    `,
    amount: `
      <label><span>Minimum</span><input value="$0.00" /></label>
      <label><span>Maximum</span><input value="$5,000.00" /></label>
      <button type="button" data-action="apply-amount">Apply amount filter</button>
    `,
    status: `
      ${["Draft", "Overdue", "Processing", "Paid", "Active", "Needs review"].map((item) => `<button class="${state.activeStatus === item ? "is-selected" : ""}" type="button" data-action="status-filter" data-filter-value="${escapeHtml(item)}">${state.activeStatus === item ? icon("check") : ""}<span>${escapeHtml(item)}</span></button>`).join("")}
    `,
    type: `
      ${["Payment link", "One time", "Monthly"].map((item) => `<button class="${state.activeType === item ? "is-selected" : ""}" type="button" data-action="type-filter" data-filter-value="${escapeHtml(item)}">${state.activeType === item ? icon("check") : ""}<span>${escapeHtml(item)}</span></button>`).join("")}
    `,
    group: `
      <strong>Group by</strong>
      ${["None", "Account", "Category", "Method", "Team member"].map((item, index) => `<button type="button" data-action="table-control">${index === 0 ? icon("check") : ""}<span>${escapeHtml(item)}</span></button>`).join("")}
    `,
    sort: `
      <strong>Sort by</strong>
      <button type="button" data-action="sort-new-old">${icon("check")} New to old</button>
      <button type="button" data-action="sort-old-new">Old to new</button>
      <button type="button" data-action="sort-amount-high">Amount high to low</button>
      <button type="button" data-action="sort-amount-low">Amount low to high</button>
    `,
    "table-settings": `
      <strong>Table settings</strong>
      ${["Date", "To/From", "Amount", "Account", "Method", "Category", "GL Code", "Attachment"].map((item) => `<button type="button" data-action="table-control">${icon("check")}<span>${escapeHtml(item)}</span></button>`).join("")}
    `,
  };
  return `
    <div class="mp-popover is-${escapeHtml(activePopover)}" data-popover-panel data-anchored="true" style="--mp-popover-left: ${Number(state.popoverLeft) || 223}px; --mp-popover-top: ${Number(state.popoverTop) || 218}px; --mp-popover-width: ${Number(state.popoverWidth) || 228}px;">
      <div class="mp-popover-views">
        ${panels[activePopover] || panels["data-views"]}
      </div>
    </div>
  `;
}

function renderCardFilterPopover(state) {
  const fields = [
    ["Type", "customize"],
    ["Status", "tag"],
    ["Cardholder", "users"],
    ["Date Created", "calendar"],
    ["Spending", "cart"],
    ["Restriction", "lock"],
  ];
  const activeField = fields.some(([label]) => label === state.activeFilterField) ? state.activeFilterField : "Type";
  const panel = activeField === "Type" ? `
    <div class="mp-card-filter-options">
      ${["Physical only", "Virtual only", "Either"].map((item) => `
        <button class="${item === "Either" ? "is-selected" : ""}" type="button" data-action="card-filter-option" data-filter-value="${escapeHtml(item)}">
          <i aria-hidden="true"></i><span>${escapeHtml(item)}</span>
        </button>
      `).join("")}
    </div>
    <div class="mp-card-filter-heading"><span>Accounts</span><button type="button" data-action="card-filter-option" data-filter-value="All accounts">Select All</button></div>
    <div class="mp-card-filter-checks">
      ${["Credit", "Debit", "Checking &bull;&bull;0297", "Ops / Payroll"].map((item, index) => `
        <button class="${index > 1 ? "is-child" : ""}" type="button" data-action="card-filter-option" data-filter-value="${escapeHtml(item)}">
          <i aria-hidden="true"></i><span>${item}</span>
        </button>
      `).join("")}
    </div>
  ` : activeField === "Status" ? `
    <div class="mp-card-filter-checks">
      ${["Active", "Suspended", "Frozen", "Pending", "Printing"].map((item) => `
        <button type="button" data-action="card-filter-option" data-filter-value="${escapeHtml(item)}">
          <i aria-hidden="true"></i><span>${escapeHtml(item)}</span>
        </button>
      `).join("")}
    </div>
  ` : activeField === "Cardholder" ? `
    <label class="mp-popover-search">${icon("search")}<input placeholder="Search cardholders" /></label>
    <div class="mp-card-filter-checks">
      ${["Jane Black", "Alice Chen", "Bruce Collins", "Carry Beck", "Dave Walker", "Jessica Awad"].map((item) => `
        <button type="button" data-action="card-filter-option" data-filter-value="${escapeHtml(item)}">
          <i aria-hidden="true"></i><span>${escapeHtml(item)}</span>
        </button>
      `).join("")}
    </div>
  ` : `
    <div class="mp-card-filter-checks">
      ${["This month", "Last 30 days", "Over $100", "Has merchant restriction"].map((item) => `
        <button type="button" data-action="card-filter-option" data-filter-value="${escapeHtml(item)}">
          <i aria-hidden="true"></i><span>${escapeHtml(item)}</span>
        </button>
      `).join("")}
    </div>
  `;
  return `
    <div class="mp-popover mp-card-filter-popover" data-popover-panel data-anchored="true" style="--mp-popover-left: ${Number(state.popoverLeft) || 336}px; --mp-popover-top: ${Number(state.popoverTop) || 506}px; --mp-popover-width: ${Number(state.popoverWidth) || 600}px;">
      <nav class="mp-card-filter-nav" aria-label="Card filter fields">
        ${fields.map(([label, iconName]) => `
          <button class="${label === activeField ? "is-active" : ""}" type="button" data-filter-field="${escapeHtml(label)}">
            ${icon(iconName)}<span>${escapeHtml(label)}</span>${label === activeField ? icon("arrowRight") : ""}
          </button>
        `).join("")}
      </nav>
      <section class="mp-card-filter-panel">
        ${panel}
      </section>
    </div>
  `;
}

function rowSelect(id, selected) {
  return `<button class="mp-checkbox ${selected ? "is-checked" : ""}" type="button" data-select="${escapeHtml(id)}" aria-checked="${selected ? "true" : "false"}">${icon("check")}</button>`;
}

function renderDrawer(state) {
  if (!state.activeDrawer) return "";
  const drawer = state.activeDrawer;
  if (drawer.kind === "invoice" || drawer.kind === "reimbursement" || drawer.kind === "card") return "";
  const title = drawer.title || drawer.name || "Details";
  const displayTitle = escapeHtml(title).replaceAll("&amp;bull;", "&bull;");
  if (drawer.kind === "transaction") {
    const rows = drawer.rows || [];
    const valueFor = (label) => rows.find(([key]) => key === label)?.[1] || "";
    return `
      <aside class="mp-detail-drawer mp-transaction-drawer" aria-label="${escapeHtml(title)}">
        <header>
          <div>
            <h2>${displayTitle}</h2>
          </div>
          <button type="button" data-action="close-drawer" aria-label="Close">${icon("close")}</button>
        </header>
        <div class="mp-drawer-body">
          ${drawer.amount ? `<strong class="mp-drawer-amount sensitive">${escapeHtml(drawer.amount)}</strong>` : ""}
          ${drawer.timeline ? `
            <div class="mp-timeline">
              ${drawer.timeline.map((item) => `<div><i></i><span>${escapeHtml(item)}</span></div>`).join("")}
            </div>
          ` : ""}
          <div class="mp-drawer-edit-stack">
            <label class="mp-field"><span>Category</span><span class="mp-drawer-input"><input value="${escapeHtml(valueFor("Category"))}" /><button type="button" data-action="view-categories" aria-label="Clear category">${icon("close")}</button></span><a href="#" data-action="view-categories">Manage categories</a></label>
            <label class="mp-field"><span>Notes</span><textarea placeholder="Add a note"></textarea></label>
            <small>Mention a teammate with @ to send.</small>
          </div>
          <dl>
            <div><dt>Account</dt><dd>${escapeHtml(valueFor("Account"))}</dd></div>
            <div><dt>Merchant</dt><dd>${escapeHtml(drawer.merchant || "Transaction")}</dd></div>
            <div><dt>Receipt</dt><dd>${escapeHtml(valueFor("Receipt"))}</dd></div>
          </dl>
          <div class="mp-drawer-icon-actions" aria-label="Transaction actions">
            <button type="button" data-action="drawer-primary" aria-label="Save changes">${icon("check")}</button>
            <button type="button" data-action="attachment" aria-label="Email receipt">${icon("feedback")}</button>
            <button type="button" data-action="copy-payment-link" aria-label="Copy transaction link">${icon("copy")}</button>
            <button type="button" data-action="more-invoice" aria-label="More actions">${icon("dotMenu")}</button>
          </div>
        </div>
      </aside>
    `;
  }
  const kicker = drawer.kicker || routeMeta[state.route].title;
  const rows = drawer.rows || [
    ["Status", drawer.status || "Ready"],
    ["Owner", drawer.owner || "Jane Black"],
    ["Amount", drawer.amount || "$0.00"],
    ["Updated", "Today"],
  ];
  return `
    <aside class="mp-detail-drawer" aria-label="${escapeHtml(title)}">
      <header>
        <div>
          <span>${escapeHtml(kicker)}</span>
          <h2>${displayTitle}</h2>
        </div>
        <button type="button" data-action="close-drawer" aria-label="Close">${icon("close")}</button>
      </header>
      <div class="mp-drawer-body">
        ${drawer.amount ? `<strong class="mp-drawer-amount sensitive">${escapeHtml(drawer.amount)}</strong>` : ""}
        ${drawer.timeline ? `
          <div class="mp-timeline">
            ${drawer.timeline.map((item) => `<div><i></i><span>${escapeHtml(item)}</span></div>`).join("")}
          </div>
        ` : ""}
        <dl>
          ${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`).join("")}
        </dl>
        <label class="mp-field"><span>Notes</span><textarea placeholder="Add a note">${drawer.note || ""}</textarea></label>
        <label class="mp-field"><span>Comment</span><input placeholder="Add a comment" /></label>
      </div>
      <footer>
        <button type="button" data-action="drawer-secondary">${escapeHtml(drawer.secondary || "Delete")}</button>
        <button class="is-primary" type="button" data-action="drawer-primary">${escapeHtml(drawer.primary || "Save")}</button>
      </footer>
    </aside>
  `;
}

function renderBulkBar(state) {
  if (state.route === "reimbursements") return renderReimbursementBulkBar(state);
  if (state.route === "transactions") return renderTransactionBulkBar(state);
  const count = state.selected.size;
  if (!count) return "";
  const label = state.route === "payments" || state.route === "billPay" ? "items" : state.route === "cards" ? "cards" : "rows";
  return `
    <div class="mp-bulk-bar">
      <strong>${count} ${label} selected</strong>
      <button type="button" data-action="bulk-category">Category</button>
      <button type="button" data-action="bulk-gl">GL Code</button>
      <span></span>
      <button type="button" data-action="bulk-export">${icon("download")}</button>
      <button type="button" data-action="bulk-note">${icon("doc")}</button>
      <button type="button" data-action="clear-selection">${icon("close")}</button>
    </div>
  `;
}

function renderBulkEditor(label, id, state) {
  const options = id === "bulk-category" ? transactionCategoryOptions : transactionGlOptions;
  return `
    <span class="mp-bulk-editor ${state.activeCombo === id ? "is-open" : ""}">
      <span>${escapeHtml(label)}</span>
      <span>
        <button class="mp-bulk-combo" type="button" data-combobox="${escapeHtml(id)}" aria-label="${escapeHtml(label)}"></button>
        <button class="mp-cell-combo-action" type="button" data-combobox="${escapeHtml(id)}" aria-label="Open combobox menu">${icon("arrowDown")}</button>
      </span>
      ${state.activeCombo === id ? `
        <div class="mp-combo-options is-bulk" role="listbox">
          ${options.map((option) => `<button type="button" role="option" data-combo-option="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></button>`).join("")}
        </div>
      ` : ""}
    </span>
  `;
}

function renderTransactionBulkBar(state) {
  const count = [...state.selected].filter((id) => id.startsWith("tx-")).length;
  return `
    <div class="mp-bulk-bar mp-transaction-bulk" role="dialog" aria-label="${count} selected">
      <div class="mp-bulk-main">
        <strong>${count} selected</strong>
        ${renderBulkEditor("Category", "bulk-category", state)}
        ${renderBulkEditor("GL Code", "bulk-gl", state)}
        <button type="button" data-action="bulk-file" aria-label="Add file">${icon("upload")}</button>
        <button type="button" data-action="bulk-note" aria-label="Add notes">${icon("doc")}</button>
        <button type="button" data-action="bulk-more" aria-label="More bulk actions">${icon("dotMenu")}</button>
      </div>
      <button class="mp-bulk-unselect" type="button" data-action="clear-selection">${icon("close")}<span>Unselect</span></button>
    </div>
  `;
}

function renderReimbursementBulkBar(state) {
  const selectedIds = [...state.selected].filter((id) => id.startsWith("reimbursement-"));
  const total = selectedIds.reduce((sum, id) => {
    const index = Number(id.replace("reimbursement-", ""));
    return sum + moneyNumber(reimbursementRows[index]?.[3] || "$0.00");
  }, 0);
  const count = selectedIds.length;
  if (!count) return "";
  return `
    <div class="mp-expense-action-bar">
      <span><strong>${count} ${count === 1 ? "request" : "requests"} selected</strong><em class="sensitive">${formatMoney(total)} total</em></span>
      <button type="button" data-action="approve-expenses">Approve</button>
    </div>
  `;
}

function renderTasks(state) {
  const completed = state.activeTab === "Completed";
  const rows = completed ? tasks.slice(0, 3).map((row) => [...row.slice(0, 3), "Completed"]) : tasks;
  return `
    ${pageHeader(state)}
    ${secondaryNav(["Incomplete", "Completed"], completed ? 1 : 0)}
    <section class="mp-table-card">
      <table class="mp-table">
        <caption>Incomplete tasks table</caption>
        <thead><tr><th>Description</th><th>Due by</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>
          ${rows.map((row, index) => `
            <tr data-row="${index}" data-kind="task">
              <td><strong>${escapeHtml(row[0])}</strong><small>${escapeHtml(row[2])}</small></td>
              <td>${escapeHtml(row[1])}</td>
              <td>${escapeHtml(row[1])}</td>
              <td>${statusPill(row[3])}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderAccounts(state) {
  const tabs = ["Mercury accounts", "Linked accounts", "Auto transfer rules"];
  const active = state.activeTab || tabs[0];
  const linkedRows = [
    ["Chase Operating", "JPMorgan Chase", "$81,420.75", "Synced 2 min ago", "Connected"],
    ["Stripe payouts", "Stripe", "$24,190.00", "Synced today", "Connected"],
    ["Brokerage reserve", "Fidelity", "$405,000.00", "Needs refresh", "Action required"],
  ];
  const ruleRows = accounts
    .filter((row) => row[4])
    .map((row) => [row[0], row[3], row[4], "Active"]);
  return `
    ${pageHeader(state, `
      ${toolButton("Feedback", "feedback", "feedback")}
      ${toolButton("Transfer funds", "transfer", "transfer")}
      ${toolButton("Add account", "plus", "add-account", "is-primary")}
    `)}
    ${secondaryNav(tabs, activeIndex(tabs, state))}
    <section class="mp-account-summary">
      <article><span>Available</span><strong class="sensitive">$5,144,707.08</strong></article>
      <article><span>Pending deposits</span><strong class="sensitive">$1,000.00</strong></article>
      <article><span>Pending transfers</span><strong class="sensitive">$71,764.10</strong></article>
    </section>
    ${active === "Linked accounts" ? `
      <section class="mp-table-card">
        <header><strong>Linked accounts</strong><button type="button" data-action="add-account">Link account</button></header>
        <table class="mp-table">
          <thead><tr><th>Account</th><th>Institution</th><th>Balance</th><th>Last sync</th><th>Status</th></tr></thead>
          <tbody>
            ${linkedRows.map((row, index) => `
              <tr data-row="${Math.min(index, accounts.length - 1)}" data-kind="account">
                <td><strong>${escapeHtml(row[0])}</strong></td>
                <td>${escapeHtml(row[1])}</td>
                <td class="sensitive">${escapeHtml(row[2])}</td>
                <td>${escapeHtml(row[3])}</td>
                <td>${statusPill(row[4])}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
    ` : active === "Auto transfer rules" ? `
      <section class="mp-table-card">
        <header><strong>Auto transfer rules</strong><button type="button" data-action="create-account">Create rule</button></header>
        <table class="mp-table">
          <thead><tr><th>Account</th><th>Rule</th><th>Trigger</th><th>Status</th></tr></thead>
          <tbody>
            ${ruleRows.length ? ruleRows.map((row, index) => `
              <tr data-row="${index}" data-kind="account">
                <td><strong>${escapeHtml(row[0])}</strong></td>
                <td>${escapeHtml(row[1])}</td>
                <td>${escapeHtml(row[2])}</td>
                <td>${statusPill(row[3])}</td>
              </tr>
            `).join("") : renderEmptyTableRow(4, "No transfer rules yet", "Create a rule to keep payroll, AP, and treasury balances in range.", "create-account")}
          </tbody>
        </table>
      </section>
    ` : `
    <section class="mp-table-card">
      <header><strong>Mercury Accounts</strong><button type="button" data-action="create-account">Create account</button></header>
      <table class="mp-table">
        <thead><tr><th>Account</th><th>Balance</th><th>Auto transfer rules</th></tr></thead>
        <tbody>
          ${accounts.map((row, index) => `
            <tr data-row="${index}" data-kind="account">
              <td><span class="mp-party">${mercuryMark()}<span><strong>${row[0]}</strong>${row[1] ? `<small>${row[1]}</small>` : ""}</span></span></td>
              <td class="sensitive">${row[2]}</td>
              <td><button class="mp-inline-action" type="button" data-action="rule">${row[3]}</button>${row[4] ? `<small>${row[4]}</small>` : ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
    `}
  `;
}

function cardholderCell(row, previousRow) {
  if (previousRow && previousRow[0] === row[0]) return "";
  return `<strong>${escapeHtml(row[0])}</strong>${row[1] ? `<small class="mp-cardholder-badge">${escapeHtml(row[1])}</small>` : ""}`;
}

function cardCellTone(row) {
  if (row[6] === "Suspended" || row[6] === "Printing") return "is-muted";
  if (row[6] === "Pending") return "is-pending";
  if (row[5].includes("Checking") || row[5].includes("Ops")) return "is-light";
  return "is-credit";
}

function renderCardRecommendation(state) {
  if (state.cardRecommendationDismissed) return "";
  return `
    <section class="mp-recommendation">
      <div>
        <span>Recommended</span>
        <div class="mp-recommendation-title">
          <strong>Require receipts for card transactions over $75</strong>
          <button class="mp-toggle ${state.receiptPolicy ? "is-on" : ""}" type="button" data-action="toggle-card-policy" aria-label="Toggle receipt policy"></button>
        </div>
        <p>Recommended because the IRS requires receipts for transactions $75 and over to be eligible for tax deductions. Change this setting at any time from your <a href="#" data-action="manage-policy">Policies page</a>.</p>
      </div>
      <div class="mp-recommendation-preview" aria-hidden="true">
        <button type="button" data-action="dismiss-card-recommendation" aria-label="Dismiss recommendation">${icon("close")}</button>
        <div class="mp-preview-select">Books and Newspaper ${icon("arrowDown")}</div>
        <div class="mp-preview-card">
          <small>Attachments <em>${icon("warning")} Receipt required</em></small>
          <span>${icon("upload")} Drag and drop here or click to upload</span>
          <i>You may upload PDF, PNG, or JPEG files.</i>
        </div>
      </div>
    </section>
  `;
}

function renderSubscriptionPromos() {
  return `
    <section class="mp-subscription-promos" aria-label="Subscription recommendations">
      <article>
        <button type="button" data-action="dismiss-card-recommendation" aria-label="Dismiss subscription recommendation">${icon("close")}</button>
        <strong>${icon("card")} Get 1.5% cashback on all your subscriptions</strong>
        <p>Create unique IO merchant cards for each service to track spending and easily manage subscriptions</p>
        <a href="#" data-action="create-merchant-card">Create Merchant Card ${icon("arrowUpRight")}</a>
      </article>
      <article>
        <button type="button" data-action="dismiss-card-recommendation" aria-label="Dismiss software stack recommendation">${icon("close")}</button>
        <strong>${icon("sparkle")} Scale faster with our curated software stack</strong>
        <p>Discover the best of startup software, as chosen by our community of Mercury founders.</p>
        <a href="#" data-action="build-software-stack">Build a Software Stack ${icon("arrowUpRight")}</a>
      </article>
    </section>
  `;
}

function renderCardPanel(state) {
  const drawer = state.activeDrawer;
  if (!drawer || drawer.kind !== "card") return "";
  const row = drawer.row || cardRows[0];
  const cardName = String(row[2]).replace(/&bull;&bull;\d+\s*/, "").trim() || `${row[0].split(" ")[0]}'s Card`;
  const lastFourMatch = String(row[2]).match(/\d{4}/);
  const lastFour = lastFourMatch ? lastFourMatch[0] : "5555";
  const isPhysical = row[4] === "Physical";
  return `
    <aside class="mp-card-detail-panel" aria-label="${escapeHtml(cardName)} details">
      <section>
        <strong>${escapeHtml(cardName)}</strong>
        <span>${escapeHtml(row[0])}</span>
      </section>
      <div class="mp-virtual-card ${cardCellTone(row)}">
        <em>IO</em>
        <i></i>
        <span>&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ${escapeHtml(lastFour)}</span>
        <small>Exp &bull;&bull;/&bull;&bull; <b>CVC &bull;&bull;&bull;</b></small>
      </div>
      <div class="mp-card-arrival">
        <p>Your ${isPhysical ? "physical" : "virtual"} card is ${isPhysical ? "on the way" : "ready to use"}.</p>
        <div>
          <span>${isPhysical ? "Once your physical card arrives in the mail, activate it to start spending in person." : "Use this merchant card for subscriptions, vendor billing, and online spend."}</span>
          <button type="button" data-action="drawer-primary">${icon("card")} ${isPhysical ? "Activate physical card" : "Copy card details"}</button>
        </div>
      </div>
      <footer>
        <button type="button" data-action="drawer-secondary">${icon("sparkle")} Freeze</button>
        <button type="button" data-action="expand-card">${icon("table")} Transactions</button>
        <button type="button" data-action="table-control">More ${icon("arrowDown")}</button>
      </footer>
    </aside>
  `;
}

function subscriptionAvatar(name) {
  return name
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderCards(state) {
  const tabs = ["Manage", "Subscriptions"];
  const active = state.activeTab || tabs[0];
  const activeCardIndex = state.activeDrawer?.kind === "card" ? state.activeDrawer.index : -1;
  const subscriptionRows = [
    ["Adyen N.V.", "$111.00", "Jane B. &bull;&bull;4928", "You"],
    ["Amazon Web Services", "$50.00", "Jane B. &bull;&bull;3054", "You"],
    ["AMC", "$142.80", "Jane B. &bull;&bull;4928", "You"],
    ["At Home Store", "$34.40", "Jane B. &bull;&bull;4928", "You"],
    ["Bridgecrest", "$95.40", "2 cards", ""],
    ["Carta", "$122.00", "3 cards", ""],
    ["Chili's", "$29.20", "John M. &bull;&bull;8813", ""],
    ["Co-Op Food", "$55.80", "Mary M. &bull;&bull;5501", ""],
    ["Cricket", "$79.80", "Jane B. &bull;&bull;5555", "You"],
    ["Department Of Education", "$101.20", "2 cards", ""],
    ["Facebook", "$97.40", "Landon S. &bull;&bull;5555", ""],
    ["Google", "$142.20", "Jane B. &bull;&bull;0330", "You"],
    ["Notion", "$184.40", "Carry B. &bull;&bull;7821", ""],
    ["Slack", "$163.60", "Mary M. &bull;&bull;0332", ""],
  ];
  return `
    ${pageHeader(state, `${toolButton("Create card", "plus", "create-card", "is-soft")}`)}
    ${active === "Manage" ? renderCardRecommendation(state) : ""}
    ${lineTabs(tabs, activeIndex(tabs, state))}
    ${active === "Subscriptions" ? renderSubscriptionPromos() : ""}
    <div class="mp-filter-toolbar mp-card-toolbar">
      <div class="mp-filter-group"><button class="${state.activePopover === "filters" ? "is-open" : ""}" type="button" data-popover="filters">${icon("filter")}<span>Add filter</span></button></div>
      <span class="mp-filter-divider" aria-hidden="true"></span>
      <span class="mp-muted">No filters applied</span>
    </div>
    ${renderPopover(state)}
    <section class="mp-table-card ${activeCardIndex >= 0 && active === "Manage" ? "has-card-panel" : ""}">
      ${active === "Subscriptions" ? `
      <table class="mp-table mp-subscriptions-table">
        <thead><tr><th>Merchant</th><th>Last 30 Day Spend</th><th>Payment Method</th><th>Actions</th></tr></thead>
        <tbody>
          ${subscriptionRows.map((row, index) => `
            <tr data-row="${Math.min(index + 1, cardRows.length - 1)}" data-kind="card">
              <td><span class="mp-merchant-cell"><span class="mp-merchant-avatar">${escapeHtml(subscriptionAvatar(row[0]))}</span><strong>${escapeHtml(row[0])}</strong></span></td>
              <td class="sensitive">${escapeHtml(row[1])}</td>
              <td><span class="mp-subscription-method"><span class="mp-card-cell ${row[2].includes("cards") ? "is-credit" : "is-light"}"><i></i><span>${row[2]}</span></span>${row[3] ? `<small>${escapeHtml(row[3])}</small>` : ""}</span></td>
              <td><span class="mp-subscription-actions"><button type="button" data-action="subscription-open" aria-label="Open subscription">${icon("arrowUpRight")}</button><button type="button" data-action="subscription-block" aria-label="Mute subscription">${icon("close")}</button></span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ` : `
      <table class="mp-table">
        <thead><tr><th>Cardholder</th><th>Card</th><th>Spent this month</th><th>Type</th><th>Account</th><th></th></tr></thead>
        <tbody>
          ${cardRows.map((row, index) => `
            <tr class="${index === activeCardIndex ? "is-active" : ""}" data-row="${index}" data-kind="card">
              <td>${cardholderCell(row, cardRows[index - 1])}</td>
              <td><span class="mp-card-cell ${cardCellTone(row)}"><i></i><span>${row[2]}</span></span>${row[6] !== "Active" ? statusPill(row[6]) : ""}</td>
              <td class="sensitive">${row[3]}</td>
              <td>${row[4]}</td>
              <td>${row[5]}</td>
              <td><span class="mp-row-caret" aria-hidden="true"></span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${renderCardPanel(state)}
      `}
    </section>
  `;
}

function methodCell(method) {
  const iconName = method.includes("Transfer") ? "transfer" : method.includes("Card") || method.includes("&bull;&bull;") ? "card" : method.includes("Invoice") || method.includes("ACH") || method.includes("Wire") ? "send" : "receipt";
  return `<span class="mp-method">${icon(iconName)}<span>${method}</span></span>`;
}

function renderGraphStrip(totals, state) {
  return `
    <section class="mp-graph-strip" aria-label="Transaction graphs">
      <button class="mp-graph-toggle" type="button" data-action="toggle-graphs" aria-label="Hide graphs" data-tooltip="Hide graphs">${icon("arrowDown")}</button>
      <div class="mp-graph-summary">
        <article class="is-large">
          <span>Net change this month</span>
          <strong class="${totals.net >= 0 ? "is-positive" : ""} sensitive">${formatMoney(totals.net)}</strong>
          <small>vs. ${formatMoney(totals.previous)} last month</small>
        </article>
        <article>
          <span><i class="mp-legend-dot is-in"></i>Money in</span>
          <strong class="is-positive sensitive">${formatMoney(totals.moneyIn)}</strong>
        </article>
        <article>
          <span><i class="mp-legend-dot is-out"></i>Money out</span>
          <strong class="sensitive">${formatMoney(totals.moneyOut)}</strong>
        </article>
      </div>
      <div class="mp-chart-divider" aria-hidden="true"></div>
      <div class="mp-trend-chart" aria-label="Monthly cash trend">
        <svg viewBox="0 0 420 204" role="img" aria-label="Money in and money out over May">
          <defs>
            <linearGradient id="mpMoneyInFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="var(--mp-chart-green-fill-strong)" />
              <stop offset="1" stop-color="var(--mp-chart-green-fill-soft)" />
            </linearGradient>
          </defs>
          <g class="mp-chart-grid">
            <path d="M42 24H394M42 106H394M42 188H394" />
            <path d="M78 14V188M174 14V188M270 14V188M366 14V188" />
          </g>
          <path class="mp-chart-area" d="M74 178 C110 178 124 178 150 177 C168 176 184 176 196 176 C202 134 206 126 214 126 C232 126 252 126 266 124 C276 119 276 34 286 31 C316 30 350 28 366 26 C380 24 390 19 394 17 L394 188 L74 188 Z" />
          <path class="mp-chart-line is-in" d="M74 178 C110 178 124 178 150 177 C168 176 184 176 196 176 C202 134 206 126 214 126 C232 126 252 126 266 124 C276 119 276 34 286 31 C316 30 350 28 366 26 C380 24 390 19 394 17" />
          <path class="mp-chart-line is-out" d="M74 179 C124 179 148 177 188 176 C220 174 246 171 268 166 C294 165 322 164 346 159 C372 157 384 151 394 148" />
          <g class="mp-axis-x">
            <text x="74" y="202">May 3</text>
            <text x="172" y="202">May 10</text>
            <text x="268" y="202">May 17</text>
            <text x="364" y="202">May 24</text>
          </g>
          <g class="mp-axis-y">
            <text x="4" y="106">$2.3M</text>
            <text x="4" y="24">$4.5M</text>
          </g>
        </svg>
      </div>
      <div class="mp-chart-divider" aria-hidden="true"></div>
      <div class="mp-bar-chart" aria-label="Top transaction groups">
        <button type="button" data-action="table-control">To/From ${icon("arrowDown")}</button>
        <svg viewBox="0 0 314 164" role="img" aria-label="Top transaction groups by amount">
          <g class="mp-chart-grid">
            <path d="M44 36H300M44 102H300" />
          </g>
          <g class="mp-bars">
            <rect x="58" y="36" width="13" height="118" />
            <rect x="108" y="78" width="13" height="76" />
            <rect x="158" y="132" width="13" height="22" />
            <rect x="208" y="126" width="13" height="28" />
            <rect x="258" y="128" width="13" height="26" />
          </g>
          <g class="mp-axis-y">
            <text x="0" y="40">$2.6M</text>
            <text x="0" y="106">$1.3M</text>
          </g>
          <g class="mp-axis-x">
            <text x="44" y="162">GenPr...</text>
            <text x="94" y="162">Ventu...</text>
            <text x="154" y="162">AR</text>
            <text x="198" y="162">Google</text>
            <text x="246" y="162">Milgr...</text>
          </g>
        </svg>
      </div>
    </section>
  `;
}

function renderTransactionSummary(totals) {
  return `
    <section class="mp-transaction-summary" aria-label="Transaction totals">
      <button class="mp-summary-toggle" type="button" data-action="toggle-graphs">
        <span class="mp-summary-icon" aria-hidden="true">${icon("graph")}</span>
        <span class="mp-summary-metrics">
          ${summaryMetric("Net change this month", totals.net, totals.net >= 0 ? "is-positive" : "")}
          ${summaryMetric("Money in", totals.moneyIn, "is-positive")}
          ${summaryMetric("Money out", totals.moneyOut)}
        </span>
      </button>
    </section>
  `;
}

function transactionHeader(label, action, iconName = "") {
  return `
    <button class="mp-table-sort" type="button" data-action="${escapeHtml(action)}">
      <span>${escapeHtml(label)}</span>
      ${iconName ? icon(iconName) : ""}
      <em>Click to sort</em>
    </button>
  `;
}

function renderTransactionsPage(state) {
  let rowsForView = transactions.map((row, index) => ({ row, index })).filter(({ row }) => {
    if (state.activeDataView === "Monthly money in") return !row[3].startsWith("-");
    if (state.activeDataView === "Monthly money out" || state.activeDataView === "Operating expenses") return row[3].startsWith("-");
    if (state.activeDataView === "My transactions") return row[5].includes("Alice") || row[1] === "Contractor";
    return true;
  });
  if (state.activeKeyword) {
    const keyword = state.activeKeyword.toLowerCase();
    rowsForView = rowsForView.filter(({ row }) => row.join(" ").replaceAll("&bull;", " ").toLowerCase().includes(keyword));
  }
  if (state.activeAmount) {
    rowsForView = rowsForView.filter(({ row }) => Math.abs(moneyNumber(row[3])) <= 5000);
  }
  if (state.activeStatus) {
    const status = state.activeStatus.toLowerCase();
    rowsForView = rowsForView.filter(({ row }) => {
      if (status === "needs review") return ["missing", "requested", "failed"].includes(row[8].toLowerCase());
      return row[8].toLowerCase() === status;
    });
  }
  if (state.activeSort === "Old to new") {
    rowsForView = [...rowsForView].reverse();
  }
  if (state.activeSort === "Amount high to low") {
    rowsForView = [...rowsForView].sort((a, b) => Math.abs(moneyNumber(b.row[3])) - Math.abs(moneyNumber(a.row[3])));
  }
  if (state.activeSort === "Amount low to high") {
    rowsForView = [...rowsForView].sort((a, b) => Math.abs(moneyNumber(a.row[3])) - Math.abs(moneyNumber(b.row[3])));
  }
  if (state.activeSort === "To/From A to Z") {
    rowsForView = [...rowsForView].sort((a, b) => a.row[1].localeCompare(b.row[1]));
  }
  if (state.activeSort === "Account A to Z") {
    rowsForView = [...rowsForView].sort((a, b) => a.row[4].localeCompare(b.row[4]));
  }
  const calculatedTotals = rowsForView.reduce((sum, { row }) => {
    const value = moneyNumber(row[3]);
    return {
      net: sum.net + value,
      moneyIn: sum.moneyIn + (value > 0 ? value : 0),
      moneyOut: sum.moneyOut + (value < 0 ? value : 0),
      count: sum.count + 1,
    };
  }, { net: 0, moneyIn: 0, moneyOut: 0, count: 0 });
  const totals = displayTotals(calculatedTotals, state);
  return `
    ${pageHeader(state, `${toolButton("Match receipts", "receipt", "match-receipts")}`)}
    ${filterToolbar(state, { includeGraphs: true })}
    ${state.showGraphs ? renderGraphStrip(totals, state) : renderTransactionSummary(totals)}
    <section class="mp-table-card mp-transaction-card">
      <table class="mp-table">
        <caption>Transactions table</caption>
        <thead><tr><th>${rowSelect("all", rowsForView.length > 0 && rowsForView.every(({ index }) => state.selected.has(`tx-${index}`)))}</th><th>${transactionHeader("Date", "sort-new-old", "arrowDown")}</th><th>${transactionHeader("To/From", "sort-party")}</th><th>${transactionHeader("Amount", "sort-amount-high")}</th><th>${transactionHeader("Account", "sort-account")}</th><th>Method</th><th>Category</th><th>GL Code</th><th>Attachment</th></tr></thead>
        <tbody>
          ${rowsForView.length ? rowsForView.map(({ row, index }) => `
            <tr class="${state.activeCombo?.endsWith(`-${index}`) ? "is-editing" : ""}" data-row="${index}" data-kind="transaction">
              <td>${rowSelect(`tx-${index}`, state.selected.has(`tx-${index}`))}</td>
              <td>${row[0]}</td>
              <td><span class="mp-party">${initialsMark(row[2])}<span><strong>${row[1]} ${row[8] === "Failed" ? statusPill("Failed") : ""}</strong></span></span></td>
              <td class="mp-amount ${amountClass(row[3])} sensitive">${row[3]}</td>
              <td>${row[4]}</td>
              <td>${methodCell(row[5])}</td>
              <td>${renderCombobox(row[6] || "Category", index, "category", state)}</td>
              <td>${renderCombobox(row[7] || "GL Code", index, "gl", state)}</td>
              <td><button class="mp-icon-tool" type="button" data-action="attachment" aria-label="Add attachment">${icon("upload")}</button></td>
            </tr>
          `).join("") : renderEmptyTableRow(9, "No transactions match", "Clear a filter or choose another data view to bring rows back.")}
        </tbody>
      </table>
      <footer class="mp-table-footer"><span>${totals.count.toLocaleString("en-US")} Transactions</span><button type="button" disabled>${icon("arrowDown")}</button><button type="button" data-action="table-control">${icon("arrowDown")}</button></footer>
    </section>
    ${state.coachmarkOpen ? renderCoachmark() : ""}
  `;
}

function renderCombobox(value, index, kind, state) {
  const id = `${kind}-${index}`;
  const emptyLabel = kind === "category" ? "Category" : "GL Code";
  const isEmpty = value === emptyLabel;
  const options = kind === "category" ? transactionCategoryOptions : transactionGlOptions;
  return `
    <span class="mp-combo-wrap mp-cell-editor ${state.activeCombo === id ? "is-open" : ""}">
      <span class="mp-cell-editor-label">${escapeHtml(emptyLabel)}</span>
      <span class="mp-cell-editor-control">
        <button class="mp-combobox ${isEmpty ? "is-empty" : ""}" type="button" data-combobox="${id}" role="combobox" aria-expanded="${state.activeCombo === id ? "true" : "false"}" aria-label="${escapeHtml(emptyLabel)}"><span>${isEmpty ? "" : escapeHtml(value)}</span></button>
        <button class="mp-cell-combo-action" type="button" ${isEmpty ? `data-combobox="${id}" aria-label="Open combobox menu"` : `data-combo-clear="${id}" aria-label="Clear combobox selection"`}>${isEmpty ? icon("arrowDown") : icon("close")}</button>
      </span>
      ${state.activeCombo === id ? `
        <div class="mp-combo-options" role="listbox">
          ${options.map((option) => `<button type="button" role="option" data-combo-option="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></button>`).join("")}
          ${kind === "category" ? `<button type="button" role="option" data-action="create-category">${icon("plus")}<span>Create new category</span></button>` : ""}
        </div>
      ` : ""}
    </span>
  `;
}

function renderCoachmark() {
  return `
    <aside class="mp-coachmark">
      <button type="button" data-action="dismiss-coachmark">${icon("close")}</button>
      <strong>We categorized past transactions for you</strong>
      <p>Update or add your own categories to help improve your business insights.</p>
      <a href="#" data-action="view-categories">View</a>
    </aside>
  `;
}

function renderBillPayLike(state, mode) {
  const isBill = mode === "billPay";
  const titleActions = isBill
    ? `${toolButton("Feedback", "feedback", "feedback")}${toolButton("Send money", "send", "send")}${toolButton("Upload bill", "upload", "upload bill", "is-primary")}`
    : `${toolButton("Send money", "send", "send")}${toolButton("Upload bill", "upload", "upload bill", "is-soft")}`;
  const billTabs = ["Inbox", "Needs Approval", "Scheduled", "Paid"];
  const paymentTabs = [["Inbox", "New"], ["Needs Approval", "6"], ["Scheduled", "7"], ["Paid", ""]];
  const activeSection = state.activeSection || "Bill Pay";
  const activeBillTab = billTabs.includes(state.activeTab) ? state.activeTab : "Inbox";
  const billRowsByTab = {
    Inbox: billRows,
    "Needs Approval": billRows.slice(0, 2).map((row) => [row[0], "Needs approval", row[2], row[3], row[4], row[5], "Approve"]),
    Scheduled: [
      ["Jun 2", "Scheduled", "Design Systems LLC", "$4,800.00", "INV-447", "May 24", "View"],
      ["Jun 6", "Scheduled", "Atlas Payroll Tax", "$2,120.00", "TAX-06", "May 23", "View"],
    ],
    Paid: [
      ["May 18", "Paid", "Aperture Legal", "$1,850.00", "INV-104", "May 18", "Receipt"],
      ["May 12", "Paid", "Studio Freight", "$940.75", "INV-811", "May 12", "Receipt"],
    ],
  };
  const recipientRows = [
    ["Jason Green", "ACH", "$6,042.95", "May 24", "Ready"],
    ["Debug LLC", "Wire", "$220.00", "May 25", "Needs review"],
    ["Tax Bureau Inc", "ACH", "$11,600.00", "May 25", "Ready"],
  ];
  const taxRows = [
    ["Federal payroll tax", "EFTPS", "$2,120.00", "Jun 6", "Scheduled"],
    ["State withholding", "ACH", "$810.40", "Jun 12", "Draft"],
  ];
  const authorizationRows = [
    ["Ramp clearing", "ACH debit", "$15,000.00 daily cap", "Active"],
    ["Payroll provider", "ACH debit", "$80,000.00 monthly cap", "Active"],
  ];

  function renderPaymentsSection() {
    if (activeSection === "Recipients") {
      return `
        <section class="mp-table-card">
          <header><strong>Recipients</strong><button type="button" data-action="send">Add recipient</button></header>
          <table class="mp-table">
            <thead><tr><th>Recipient</th><th>Method</th><th>Last paid</th><th>Updated</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${recipientRows.map((row, index) => `
                <tr data-row="${Math.min(index, billRows.length - 1)}" data-kind="bill">
                  <td><strong>${escapeHtml(row[0])}</strong></td>
                  <td>${escapeHtml(row[1])}</td>
                  <td class="sensitive">${escapeHtml(row[2])}</td>
                  <td>${escapeHtml(row[3])}</td>
                  <td>${statusPill(row[4])}</td>
                  <td><button class="mp-inline-action" type="button" data-action="send">Pay</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      `;
    }
    if (activeSection === "Taxes") {
      return `
        <section class="mp-table-card">
          <header><strong>Tax payments</strong><button type="button" data-action="send">Schedule tax payment</button></header>
          <table class="mp-table">
            <thead><tr><th>Payment</th><th>Method</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              ${taxRows.map((row, index) => `
                <tr data-row="${Math.min(index, billRows.length - 1)}" data-kind="bill">
                  <td><strong>${escapeHtml(row[0])}</strong></td>
                  <td>${escapeHtml(row[1])}</td>
                  <td class="sensitive">${escapeHtml(row[2])}</td>
                  <td>${escapeHtml(row[3])}</td>
                  <td>${statusPill(row[4])}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      `;
    }
    if (activeSection === "Wire Drawdowns") {
      return `
        <section class="mp-table-card">
          <header><strong>Wire drawdowns</strong><button type="button" data-action="send">Create drawdown</button></header>
          <table class="mp-table">
            <thead><tr><th>Drawdown</th><th>Recipient</th><th>Limit</th><th>Status</th></tr></thead>
            <tbody>
              ${renderEmptyTableRow(4, "No wire drawdowns", "Create a drawdown when a vendor needs to pull funds by wire.", "send")}
            </tbody>
          </table>
        </section>
      `;
    }
    if (activeSection === "ACH Authorizations") {
      return `
        <section class="mp-table-card">
          <header><strong>ACH authorizations</strong><button type="button" data-action="send">New authorization</button></header>
          <table class="mp-table">
            <thead><tr><th>Vendor</th><th>Type</th><th>Limit</th><th>Status</th></tr></thead>
            <tbody>
              ${authorizationRows.map((row, index) => `
                <tr data-row="${Math.min(index, billRows.length - 1)}" data-kind="bill">
                  <td><strong>${escapeHtml(row[0])}</strong></td>
                  <td>${escapeHtml(row[1])}</td>
                  <td class="sensitive">${escapeHtml(row[2])}</td>
                  <td>${statusPill(row[3])}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
      `;
    }
    let activeRows = billRowsByTab[activeBillTab] || billRows;
    if (state.activeStatus) {
      activeRows = activeRows.filter((row) => row[1].toLowerCase() === state.activeStatus.toLowerCase());
    }
    return `
      ${isBill ? secondaryNav(billTabs, billTabs.indexOf(activeBillTab)) : `
        <div class="mp-payments-route-bar">
          ${lineTabs(paymentTabs, billTabs.indexOf(activeBillTab))}
          <div class="mp-forwarding-email">${icon("invoice")}<span>my-company-name@ap.mercury.com</span><button type="button" data-action="settings" aria-label="Payment forwarding settings">${icon("settings")}</button></div>
        </div>
      `}
      ${isBill ? `<div class="mp-forwarding-email">my-company-name@ap.mercury.com</div>` : ""}
      <div class="mp-filter-toolbar mp-payment-toolbar">
        <div class="mp-filter-group"><button type="button" data-popover="status"><span>Status</span>${icon("arrowDown")}</button></div>
        <div class="mp-table-tools">${toolButton("Export all", "download", "export-all", "is-text")}</div>
      </div>
      ${renderPopover(state)}
      <section class="mp-table-card mp-payment-ledger-card">
        <table class="mp-table">
          <thead><tr><th>${rowSelect("all", activeRows.length > 0 && activeRows.every((_, index) => state.selected.has(`bill-${index}`)))}</th><th>Due date</th><th>Status</th><th>Recipient</th><th>Amount</th><th>Invoice no.</th><th>Last updated ${icon("arrowDown")}</th></tr></thead>
          <tbody>
            ${activeRows.length ? activeRows.map((row, index) => `
              <tr data-row="${Math.min(index, billRows.length - 1)}" data-kind="bill">
                <td>${rowSelect(`bill-${index}`, state.selected.has(`bill-${index}`))}</td>
                <td>${row[0]}</td>
                <td>${statusPill(row[1])}</td>
                <td><span class="mp-party"><span class="mp-avatar">${icon(row[2].includes("Nano") ? "upload" : "invoice")}</span><span><strong>${row[2]}</strong></span></span></td>
                <td class="sensitive">${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
              </tr>
            `).join("") : renderEmptyTableRow(7, "Nothing here yet", "Bills move into this tab as the workflow changes.")}
          </tbody>
        </table>
      </section>
    `;
  }

  return `
    ${pageHeader(state, titleActions, isBill ? {} : { titleBadge: toolButton("Feedback", "feedback", "feedback", "is-title-badge") })}
    ${isBill ? `
      <section class="mp-account-summary">
        <article><span>Total outstanding</span><strong class="sensitive">$22,272.18</strong><small>7 bills</small></article>
        <article><span>Overdue</span><strong class="sensitive">$13,110.00</strong><small>3 bills</small></article>
        <article><span>Due in next 7 days</span><strong class="sensitive">$0.00</strong><small>0 bills</small></article>
      </section>
    ` : ""}
    ${renderPaymentsSection()}
  `;
}

function dashValue(value) {
  return !value || value === "-" ? "&mdash;" : escapeHtml(value);
}

function detailList(items) {
  return `
    <dl class="mp-side-detail-list">
      ${items.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`).join("")}
    </dl>
  `;
}

function renderInvoicePanel(state) {
  const drawer = state.activeDrawer;
  if (!drawer || drawer.kind !== "invoice") return "";
  const row = drawer.row || invoiceRows[0];
  const invoiceNo = row[3] === "-" ? "Payment link" : row[3];
  const paymentSlug = String(invoiceNo).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "payment-link";
  return `
    <aside class="mp-side-panel mp-invoice-panel" aria-label="Invoice details">
      <section class="mp-side-panel-head">
        <h2>Invoice to ${escapeHtml(row[0])}</h2>
        <button type="button" data-action="close-drawer" aria-label="Close invoice details">${icon("close")}</button>
      </section>
      <section class="mp-side-panel-section">
        ${statusPill(row[7])}
        <strong class="mp-side-amount sensitive">${escapeHtml(row[2])}</strong>
        <div class="mp-side-timeline">
          <article>
            <i></i>
            <div><strong>Sent to ${escapeHtml(row[0])}</strong><span>Sent to ${escapeHtml(row[1])}</span><em>${escapeHtml(row[4])} - CREATED BY JANE B.</em></div>
          </article>
          <article>
            <i></i>
            <div><strong>+ 3 more events</strong><span>Reminder sent to 1 email</span><em>${escapeHtml(row[4])} - SENT AUTOMATICALLY</em></div>
          </article>
          <article>
            <i></i>
            <div><strong>To AR</strong><span>Using virtual account number</span></div>
          </article>
        </div>
        <div class="mp-side-actions">
          <button type="button" data-action="edit-invoice">Edit</button>
          <button type="button" data-action="remind-invoice">Remind</button>
          <button type="button" data-action="more-invoice">More ${icon("arrowDown")}</button>
        </div>
      </section>
      <section class="mp-side-panel-section">
        ${detailList([
          ["Due date", dashValue(row[6])],
          ["Invoice date", dashValue(row[4])],
          ["Invoice no.", dashValue(invoiceNo)],
          ["Automated reminders", "On"],
          ["Recurring", escapeHtml(row[5])],
        ])}
      </section>
      <section class="mp-side-panel-section mp-side-panel-bottom">
        <div class="mp-copy-field">
          <span>Invoice payment link</span>
          <button type="button" data-action="copy-payment-link">https://demo.mercury.com/pay/slug-${escapeHtml(paymentSlug)} ${icon("copy")}</button>
        </div>
        <div class="mp-file-row">
          <span>Invoice documents</span>
          <a href="#" data-action="view-invoice">View invoice</a>
          <strong>Invoice-${escapeHtml(invoiceNo)}.pdf</strong>
        </div>
        <div class="mp-file-row">
          <span>Attachments</span>
          <button type="button" data-action="upload-attachment">Upload attachment</button>
        </div>
        <label class="mp-side-note"><span>Internal note</span><textarea placeholder="Internal note"></textarea></label>
      </section>
    </aside>
  `;
}

function renderInvoicing(state) {
  const active = state.activeTab || "Invoicing";
  const invoiceRowsForTab = invoiceRows.map((row, index) => ({ row, index })).filter(({ row }) => {
    if (active === "Recurring Series" && row[5] !== "Monthly") return false;
    if (state.activeStatus && row[7] !== state.activeStatus) return false;
    if (state.activeType && row[5] !== state.activeType) return false;
    return true;
  });
  const customerRows = invoiceRows.slice(0, 8).map((row) => [row[0], row[1], row[2], row[7]]);
  const catalogRows = [
    ["Design retainer", "$2,500.00", "Monthly", "Active"],
    ["Implementation sprint", "$5,000.00", "One time", "Active"],
    ["Advisory hour", "$750.00", "One time", "Draft"],
  ];
  return `
    ${pageHeader(state, `${toolButton("Invoice settings", "settings", "invoice-settings", "is-text")}${toolButton("Request money", "plus", "request-money", "is-soft")}`, { pro: true })}
    <section class="mp-kpi-strip" aria-label="Invoice summary">
      <button class="mp-kpi-card" type="button" data-action="clear-invoice-summary"><strong class="sensitive">$79.3K</strong><span>Total open <em class="mp-info-dot" aria-label="More information">i</em></span><small>10 Invoices <i></i> 1 Payment link</small></button>
      <button class="mp-kpi-card is-warning" type="button" data-action="status-filter" data-filter-value="Overdue"><strong class="sensitive">$39K</strong><span>Overdue</span><small>3 Invoices</small></button>
      <button class="mp-kpi-card" type="button" data-action="status-filter" data-filter-value="Paid"><strong class="sensitive">$75K</strong><span>Paid</span><small>18 Invoices <i></i> 1 Payment link</small></button>
    </section>
    ${invoicingToolbar(state)}
    <section class="mp-table-card mp-ledger-card ${state.activeDrawer?.kind === "invoice" ? "has-side-panel" : ""}">
      ${active === "Customers" ? `
      <table class="mp-table mp-customer-table">
        <thead><tr><th>Customer</th><th>Email</th><th>Last invoice</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${customerRows.map((row, index) => `
            <tr data-row="${index}" data-kind="invoice">
              <td><strong>${escapeHtml(row[0])}</strong></td>
              <td>${escapeHtml(row[1])}</td>
              <td class="sensitive">${escapeHtml(row[2])}</td>
              <td>${statusPill(row[3])}</td>
              <td><button class="mp-inline-action" type="button" data-action="request-money">Request</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ` : active === "Catalog" ? `
      <table class="mp-table mp-catalog-table">
        <thead><tr><th>Item</th><th>Default price</th><th>Billing</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${catalogRows.map((row, index) => `
            <tr data-row="${index}" data-kind="invoice">
              <td><strong>${escapeHtml(row[0])}</strong></td>
              <td class="sensitive">${escapeHtml(row[1])}</td>
              <td>${escapeHtml(row[2])}</td>
              <td>${statusPill(row[3])}</td>
              <td><button class="mp-inline-action" type="button" data-action="invoice-settings">Edit</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ` : `
      <table class="mp-table mp-invoices-table">
        <caption>Invoices table</caption>
        <thead><tr><th>${rowSelect("all", invoiceRowsForTab.length > 0 && invoiceRowsForTab.every(({ index }) => state.selected.has(`invoice-${index}`)))}</th><th>Due date</th><th>Status <span class="mp-sort-arrow" aria-hidden="true">&uarr;</span></th><th>Customer</th><th>Amount</th><th>Invoice no.</th><th>Invoice date</th><th>Type</th></tr></thead>
        <tbody>
          ${invoiceRowsForTab.length ? invoiceRowsForTab.map(({ row, index }) => `
            <tr class="${state.activeDrawer?.kind === "invoice" && state.activeDrawer.index === index ? "is-active" : ""}" data-row="${index}" data-kind="invoice">
              <td>${rowSelect(`invoice-${index}`, state.selected.has(`invoice-${index}`))}</td>
              <td><strong>${dashValue(row[6])}</strong>${row[8] ? `<small>${escapeHtml(row[8])}</small>` : ""}</td>
              <td>${statusPill(row[7])}</td>
              <td><strong>${escapeHtml(row[0])}</strong><small>${escapeHtml(row[1])}</small></td>
              <td class="mp-amount sensitive">${escapeHtml(row[2])}</td>
              <td>${dashValue(row[3])}</td>
              <td>${dashValue(row[4])}</td>
              <td>${escapeHtml(row[5])}</td>
            </tr>
          `).join("") : renderEmptyTableRow(8, "No invoices match", "Clear the status filter or switch tabs to see more invoices.")}
        </tbody>
      </table>
      ${renderInvoicePanel(state)}
      `}
    </section>
  `;
}

function receiptCell(value) {
  if (!value || value === "-") return `<span class="mp-muted-mark">&mdash;</span>`;
  return `<span class="mp-icon-cell" title="Receipt attached">${icon("receipt")}</span>`;
}

function policyCell(value) {
  const clean = String(value || "");
  if (clean.toLowerCase().includes("out of policy")) return `<span class="mp-icon-cell is-warning" title="${escapeHtml(clean)}">${icon("warning")}</span>`;
  return `<span class="mp-icon-cell is-success" title="${escapeHtml(clean || "Within policy")}">${icon("check")}</span>`;
}

function renderReimbursementPanel(state) {
  const drawer = state.activeDrawer;
  if (!drawer || drawer.kind !== "reimbursement") return "";
  const row = drawer.row || reimbursementRows[0];
  const isPaymentPending = row[2] === "Payment Pending";
  return `
    <aside class="mp-side-panel mp-reimbursement-panel" aria-label="Reimbursement details">
      <section class="mp-side-panel-head">
        <h2>Reimbursement ${statusPill(row[2])}</h2>
        <button type="button" data-action="close-drawer" aria-label="Close reimbursement details">${icon("close")}</button>
      </section>
      <section class="mp-side-panel-section">
        <strong class="mp-side-amount sensitive">${escapeHtml(row[3])}</strong>
        <span class="mp-side-rate">${row[4] === "Travel - Vehicles" ? "$0.67/mile" : "Expense reimbursement"}</span>
        <div class="mp-side-timeline is-muted">
          <article><i></i><div><strong>Submitted</strong><span>${escapeHtml(row[0])} at 8:00pm - by ${escapeHtml(row[1])}</span></div></article>
          <article><i></i><div><strong>${isPaymentPending ? "Approved" : "Review"}</strong><span>${isPaymentPending ? "May 23rd at 8:00pm - by Landon Shepherd" : "Waiting for admin review"}</span></div></article>
          <article><i></i><div><strong>${escapeHtml(row[2])}</strong><span>${escapeHtml(row[6])}</span></div></article>
        </div>
        <button class="mp-danger-action" type="button" data-action="${isPaymentPending ? "cancel-reimbursement-payment" : "approve-expenses"}">${isPaymentPending ? "Cancel payment" : "Approve expense"}</button>
      </section>
      <section class="mp-side-panel-section">
        ${detailList([
          ["Date of expense", row[0] === "May 24" ? "May 23, 2026" : escapeHtml(row[0])],
          ["Mileage", row[4] === "Travel - Vehicles" ? "75 miles" : "&mdash;"],
          ["Category", escapeHtml(row[4])],
          ["Receipt", row[5] === "Attached" ? "Attached" : "&mdash;"],
        ])}
      </section>
    </aside>
  `;
}

function renderReimbursements(state) {
  const views = ["All expenses", "My expenses"];
  const activeView = state.expenseView || "All expenses";
  const activeFilter = state.expenseFilter || "All";
  let rows = reimbursementRows.map((row, index) => ({ row, index }));
  if (activeView === "My expenses") rows = rows.filter(({ row }) => row[1] === "Jane Black");
  if (activeFilter === "Pending Review") rows = rows.filter(({ row }) => row[2] === "Pending Review" || row[6].toLowerCase().includes("needs"));
  return `
    ${pageHeader(state, `${toolButton("Settings", "settings", "expense-settings", "is-text")}${toolButton("Submit expense", "plus", "submit-expense", "is-soft")}`, { pro: true })}
    <nav class="mp-count-tabs" aria-label="Reimbursement views">
      <button class="${activeView === "All expenses" ? "is-active" : ""}" type="button" data-expense-view="All expenses"><span>All expenses</span><em>5</em></button>
      <button class="${activeView === "My expenses" ? "is-active" : ""}" type="button" data-expense-view="My expenses"><span>My expenses</span><em>1</em></button>
    </nav>
    <div class="mp-filter-toolbar mp-expense-toolbar">
      <div class="mp-filter-group">
        <button class="${activeFilter === "All" ? "is-active" : ""}" type="button" data-expense-filter="All">All</button>
        <button class="${activeFilter === "Pending Review" ? "is-active" : ""}" type="button" data-expense-filter="Pending Review">Pending Review</button>
        <button type="button" data-popover="filters">${icon("customize")}<span>Add filter</span></button>
      </div>
      <div class="mp-table-tools">
        <button class="mp-icon-tool is-disabled" type="button" aria-label="Previous page">&lsaquo;</button>
        <button class="mp-icon-tool is-disabled" type="button" aria-label="Next page">&rsaquo;</button>
        ${toolButton("Export all", "download", "export-all", "is-text")}
      </div>
    </div>
    ${renderPopover(state)}
    <section class="mp-table-card mp-ledger-card ${state.activeDrawer?.kind === "reimbursement" ? "has-side-panel" : ""}">
      <table class="mp-table mp-expenses-table">
        <caption>All Expenses</caption>
        <thead><tr><th>${rowSelect("all", rows.length > 0 && rows.every(({ index }) => state.selected.has(`reimbursement-${index}`)))}</th><th>Date <em class="mp-info-dot" aria-label="Date details">i</em></th><th>Team Member</th><th>Status</th><th>Amount</th><th>Category</th><th>Receipt</th><th>Policy</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(({ row, index }) => `
            <tr class="${state.activeDrawer?.kind === "reimbursement" && state.activeDrawer.index === index ? "is-active" : ""}" data-row="${index}" data-kind="reimbursement">
              <td>${rowSelect(`reimbursement-${index}`, state.selected.has(`reimbursement-${index}`))}</td>
              <td>${escapeHtml(row[0])}</td>
              <td>${escapeHtml(row[1])}</td>
              <td>${statusPill(row[2])}</td>
              <td class="mp-amount sensitive">${escapeHtml(row[3])}</td>
              <td>${escapeHtml(row[4])}</td>
              <td>${receiptCell(row[5])}</td>
              <td>${policyCell(row[6])}</td>
            </tr>
          `).join("") : renderEmptyTableRow(8, "No expenses match", "Try All expenses or remove the pending review filter.")}
        </tbody>
      </table>
      ${renderReimbursementPanel(state)}
    </section>
  `;
}

function renderSettings(state) {
  const nav = [
    ["Team", "Users", "Departments", "Advisors"],
    ["Security & Controls", "Spend Policies", "Approval Rules", "Controls", "Vault", "Account Security"],
    ["Company", "Company Profile", "Plan & Billing", "Categories", "Integrations", "API", "Tokens", "Webhooks"],
    ["Personal", "My Profile", "Notifications", "Security"],
    ["Explore", "Perks", "Referrals"],
  ];
  return `
    <div class="mp-settings-layout">
      <aside class="mp-settings-nav">
        <button type="button" data-route="home">${icon("home")}Dashboard</button>
        ${nav.map((section) => `
          <section>
            <strong>${section[0]}</strong>
            ${section.slice(1).map((item) => `<button class="${item === "Company Profile" ? "is-active" : ""}" type="button" data-action="settings-nav">${escapeHtml(item)}</button>`).join("")}
          </section>
        `).join("")}
      </aside>
      <section class="mp-settings-main">
        ${pageHeader(state)}
        <div class="mp-settings-list">
          ${settingsSections.map(([label, value, help], index) => `
            <article data-row="${index}" data-kind="setting">
              <div>
                <span>${escapeHtml(label)}</span>
                <strong>${value}</strong>
                <p>${escapeHtml(help)}</p>
              </div>
              <button type="button" data-action="edit-setting">Edit</button>
            </article>
          `).join("")}
        </div>
        <footer class="mp-legal-links"><a href="#">Terms and Conditions</a><a href="#">Legal</a></footer>
      </section>
    </div>
  `;
}

function renderIssueCardOverlay() {
  return `
    <section class="mp-issue-card-flow" aria-label="Create a card">
      <div class="mp-issue-form">
        <header>
          ${mercuryMark()}<span>Mercury Demo</span>
        </header>
        <h2>Create a card</h2>
        <section class="mp-issue-section">
          <span>Basics</span>
          <label><small>Cardholder</small><button type="button">Jane Black (you) ${icon("arrowDown")}</button></label>
          <label><small>Card nickname</small><input placeholder="e.g. Lunch Card" /></label>
        </section>
        <section class="mp-issue-section">
          <span>Type</span>
          <div>
            <small>Credit or Debit</small>
            <div class="mp-issue-choice-row">
              <button class="is-selected" type="button" data-action="card-filter-option" data-filter-value="Credit"><i></i>Credit</button>
              <button type="button" data-action="card-filter-option" data-filter-value="Debit"><i></i>Debit</button>
            </div>
          </div>
          <div>
            <small>Virtual or Physical</small>
            <div class="mp-issue-choice-row">
              <button class="is-selected" type="button" data-action="card-filter-option" data-filter-value="Virtual"><i></i>Virtual</button>
              <button type="button" data-action="card-filter-option" data-filter-value="Physical"><i></i>Physical</button>
            </div>
          </div>
        </section>
        <section class="mp-issue-section">
          <span>Spend controls</span>
          <label><small>Control</small><button type="button">None ${icon("arrowDown")}</button></label>
        </section>
        <section class="mp-issue-section">
          <span>Limits</span>
          <label><small>Limit type</small><button type="button">Daily ${icon("arrowDown")}</button></label>
          <label><small>Daily spending limit</small><input value="$ 1,000" /></label>
        </section>
        <section class="mp-issue-section">
          <span>Expiration</span>
          <label class="mp-issue-check"><i></i><strong>Set a custom card expiration date</strong><em>Default is 5 years, or set it to expire sooner</em></label>
        </section>
      </div>
      <aside class="mp-issue-preview">
        <button type="button" data-action="close-action" aria-label="Close create card">${icon("close")}</button>
        <div class="mp-issue-card-art">
          <em>IO</em>
          <span>Jane Black</span>
          <small>Mercury Demo</small>
        </div>
        <dl>
          <div><dt>Type</dt><dd>Virtual Credit</dd></div>
          <div><dt>Daily spending limit</dt><dd>$1,000</dd></div>
          <div><dt>Expiration date</dt><dd>May 31, 2031</dd></div>
        </dl>
      </aside>
      <footer>
        <button type="button" data-action="drawer-primary">Create card</button>
      </footer>
    </section>
  `;
}

function routeBody(state) {
  if (state.route === "tasks") return renderTasks(state);
  if (state.route === "accounts") return renderAccounts(state);
  if (state.route === "cards") return renderCards(state);
  if (state.route === "payments") return renderBillPayLike(state, "payments");
  if (state.route === "invoicing") return renderInvoicing(state);
  if (state.route === "billPay") return renderBillPayLike(state, "billPay");
  if (state.route === "reimbursements") return renderReimbursements(state);
  if (state.route === "settings") return renderSettings(state);
  return renderTransactionsPage(state);
}

export function renderMercuryPage(state) {
  const meta = routeMeta[state.route] || routeMeta.tasks;
  return `
    <main class="mercury-study-shell mp-shell ${state.privateMode ? "is-private" : ""}">
      ${renderDemoBanner(state)}
      <div class="mercury-app ${state.route === "settings" ? "mp-settings-app" : ""}">
        ${state.route === "settings" ? "" : renderSidebar({ active: meta.active, state })}
        <section class="mercury-main ${state.route === "settings" ? "mp-settings-shell" : ""}">
          ${renderUtilityBar(state)}
          <div class="mercury-workspace-page route-${state.route}">
            ${routeBody(state)}
          </div>
        </section>
      </div>
      ${state.activeAction === "create-card" ? renderIssueCardOverlay() : renderHomeActionPanel(state)}
      ${renderDrawer(state)}
      ${renderBulkBar(state)}
    </main>
  `;
}
