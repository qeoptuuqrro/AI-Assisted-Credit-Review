import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml } from "../../../../shared/utils/html.js";
import { mercuryMark } from "./brand.js";

const rows = [
  { id: "contractor", date: "May 25", avatar: "C", party: "Contractor", amount: "-$213.11", account: "Ops / Payroll", method: "Card payment", category: "Contractor Payme...", gl: "734 - Contractors" },
  { id: "working-capital", date: "May 25", mark: true, party: "Mercury Working Capital", amount: "-$2,200.00", account: "Ops / Payroll", method: "Working Capital Loan ...", methodIcon: "request", category: "", gl: "" },
  { id: "nasa", date: "May 25", avatar: "P", party: "Payment from NASA", failed: true, amount: "$419.00", account: "AR", method: "Request or Invoice Pa...", methodIcon: "send", category: "", gl: "" },
  { id: "acme", date: "May 25", avatar: "P", party: "Payment from Acme Corp", amount: "$200.00", account: "AR", method: "Request or Invoice Pa...", methodIcon: "send", category: "", gl: "" },
  { id: "to-ops", date: "May 25", mark: true, party: "To Ops / Payroll", amount: "-$55,810.16", account: "AR", method: "Transfer", methodIcon: "request", category: "", gl: "" },
  { id: "from-ar", date: "May 25", mark: true, party: "From AR", amount: "$55,810.16", account: "Ops / Payroll", method: "Transfer", methodIcon: "send", category: "", gl: "" },
  { id: "lilys", date: "May 25", avatar: "LE", party: "Lily's Eatery", amount: "$0.93", account: "Ops / Payroll", method: "Alice C. ...1234", methodIcon: "card", category: "", gl: "" },
  { id: "deli-credit", date: "May 25", avatar: "D7", party: "Deli 77", amount: "$63.53", account: "Credit account", method: "Mary M. ...0332", methodIcon: "card", category: "Business Client M...", gl: "215 - Ac..." },
  { id: "deli-ops", date: "May 25", avatar: "D7", party: "Deli 77", amount: "$214.06", account: "Ops / Payroll", method: "Jane B. ...6112", methodIcon: "card", category: "Business Client M...", gl: "215 - Ac..." },
  { id: "office-stop", date: "May 25", avatar: "OS", party: "Office Stop Co.", amount: "-$287.89", account: "Ops / Payroll", method: "Jessica A. ...9914", methodIcon: "card", category: "Office Supplies", gl: "" },
  { id: "trader-joes", date: "May 25", avatar: "TJ", party: "Trader John's", amount: "$855.81", account: "Credit account", method: "Landon S. ...0331", methodIcon: "card", category: "Lunch Perks", gl: "450 - Meals" },
  { id: "rippling", date: "May 24", avatar: "R", party: "Rippling", amount: "-$65,420.49", account: "Ops / Payroll", method: "ACH debit", methodIcon: "request", category: "Payroll", gl: "601 - Payroll" },
];

const categoryOptions = [
  "Legal Fees",
  "Travel -",
  "Accommodation",
  "Travel - Vehicles",
  "Venue Rental",
  "Employee Gifts",
  "Software",
  "Investments",
];

function categoryValue(row, state) {
  return state.transactionCategories[row.id] ?? row.category;
}

function renderAvatar(row) {
  if (row.mark) return `<span class="tx-merchant-mark">${mercuryMark()}</span>`;
  return `<span class="tx-avatar ${row.id === "trader-joes" ? "is-red" : ""}">${escapeHtml(row.avatar || "")}</span>`;
}

function renderCategory(row, state) {
  const value = categoryValue(row, state);
  return `
    <button class="tx-category-select ${value ? "has-value" : ""} ${state.categoryTarget === row.id ? "is-open" : ""}" type="button" data-tx-category="${escapeHtml(row.id)}">
      <span>${value ? escapeHtml(value) : ""}</span>
      ${value ? `<b aria-hidden="true">×</b>` : ""}
      ${icon("arrowDown")}
    </button>
  `;
}

function renderCategoryMenu(state) {
  if (!state.categoryTarget) return "";
  const width = Math.max(184, Math.min(state.categoryWidth || 184, 244));
  const left = Math.max(16, Math.min(state.categoryLeft, window.innerWidth - width - 16));
  const top = Math.max(16, Math.min(state.categoryTop, window.innerHeight - 286));
  return `
    <section class="tx-category-menu" style="left:${left}px;top:${top}px;width:${width}px" aria-label="Category options">
      ${categoryOptions.map((option) => `
        <button type="button" data-tx-category-option="${escapeHtml(option)}">
          <span>${escapeHtml(option)}</span>
        </button>
      `).join("")}
    </section>
  `;
}

function renderSelectionBar(state) {
  const count = state.selectedTransactions.size;
  return `
    <div class="tx-selection-bar ${count ? "is-visible" : ""}">
      <strong>${count} selected</strong>
      <button type="button" data-action="tx-mark-reviewed">Mark reviewed</button>
      <button type="button" data-action="tx-clear-selection">Clear</button>
    </div>
  `;
}

function renderFilterMenu(state) {
  if (!state.transactionFilterMenu) return "";
  const labels = {
    "tx-data-views": ["Data views", ["My transactions", "Monthly money in", "Monthly money out", "Operating expenses", "+ Create view"], 228],
    "tx-filters": ["Filters", ["Needs review", "Failed", "Card transactions", "Transfers"], 184],
    "tx-date": ["Date", ["Today", "This week", "This month", "Custom date range"], 188],
    "tx-keyword": ["Keyword", ["Contractor", "Payroll", "Invoice", "Credit account"], 198],
    "tx-amount": ["Amount", ["Any amount", "Money in", "Money out", "Over $1,000"], 188],
    "tx-columns": ["Columns", ["Date", "To/From", "Amount", "Account", "Category", "GL Code"], 206],
    "tx-sort": ["Sort", ["Newest first", "Oldest first", "Amount high to low", "Amount low to high"], 210],
    "tx-display": ["Display", ["Comfortable rows", "Compact rows", "Show categories", "Show GL code"], 210],
    "tx-export": ["Export all", ["CSV", "QBO", "PDF statement", "Copy table"], 184],
  };
  const [title, options, width = 188] = labels[state.transactionFilterMenu] || ["Menu", ["Option"], 188];
  const left = Math.max(16, Math.min(state.filterLeft, window.innerWidth - width - 16));
  return `
    <section class="tx-category-menu tx-filter-menu" style="left:${left}px;top:${state.filterTop}px;width:${width}px" aria-label="${escapeHtml(title)}">
      ${options.map((option) => `
        <button type="button" data-tx-filter-option="${escapeHtml(option)}">
          <span>${escapeHtml(option)}</span>
        </button>
      `).join("")}
    </section>
  `;
}

export function renderTransactionsPage(state) {
  const query = state.transactionQuery.trim().toLowerCase();
  const rowsForView = rows.filter((row) => {
    if (state.activeDataView === "Monthly money in") return row.amount.startsWith("$");
    if (state.activeDataView === "Monthly money out" || state.activeDataView === "Operating expenses") return row.amount.startsWith("-");
    if (state.activeDataView === "My transactions") return row.methodIcon === "card" || row.party === "Contractor";
    return true;
  });
  const visibleRows = query
    ? rowsForView.filter((row) => `${row.party} ${row.account} ${row.method} ${row.category} ${row.gl}`.toLowerCase().includes(query))
    : rowsForView;

  return `
    <section class="mercury-transactions-page">
      <header class="tx-page-head">
        <div class="tx-title-row">
          <h1>Transactions</h1>
          <button class="tx-pill tx-match" type="button" data-action="tx-match-receipts">${icon("invoice")}<span>Match receipts</span></button>
        </div>
        <div class="tx-control-row">
          <div class="tx-filter-group">
            <button class="tx-filter is-active ${state.transactionFilterMenu === "tx-data-views" ? "is-open" : ""}" type="button" data-action="tx-data-views">${icon("bookmark")}<span>Data views</span>${icon("arrowDown")}</button>
            <button class="tx-filter ${state.transactionFilterMenu === "tx-filters" ? "is-open" : ""}" type="button" data-action="tx-filters">${icon("customize")}<span>Filters</span></button>
            <button class="tx-filter ${state.transactionFilterMenu === "tx-date" ? "is-open" : ""}" type="button" data-action="tx-date">Date ${icon("arrowDown")}</button>
            <button class="tx-filter ${state.transactionFilterMenu === "tx-keyword" ? "is-open" : ""}" type="button" data-action="tx-keyword">Keyword ${icon("arrowDown")}</button>
            <button class="tx-filter ${state.transactionFilterMenu === "tx-amount" ? "is-open" : ""}" type="button" data-action="tx-amount">Amount ${icon("arrowDown")}</button>
          </div>
          <div class="tx-table-tools">
            <button class="tx-tool ${state.transactionFilterMenu === "tx-columns" ? "is-open" : ""}" type="button" data-action="tx-columns" aria-label="Columns">${icon("table")}</button>
            <button class="tx-tool ${state.transactionFilterMenu === "tx-sort" ? "is-open" : ""}" type="button" data-action="tx-sort" aria-label="Sort">${icon("transfer")}</button>
            <button class="tx-tool ${state.transactionFilterMenu === "tx-display" ? "is-open" : ""}" type="button" data-action="tx-display" aria-label="Display settings">${icon("customize")}</button>
            <button class="tx-export ${state.transactionFilterMenu === "tx-export" ? "is-open" : ""}" type="button" data-action="tx-export">${icon("deposit")}<span>Export all</span></button>
          </div>
        </div>
      </header>

      <section class="tx-summary-strip" aria-label="Transaction totals">
        <article><span>Net change this month</span><strong>$3,343,533.56</strong></article>
        <article><span>Money in</span><strong>$4,141,953.82</strong></article>
        <article><span>Money out</span><strong>-$798,420.26</strong></article>
      </section>

      <section class="tx-ledger-shell">
        ${renderSelectionBar(state)}
        <div class="tx-table-scroll">
          <table class="tx-ledger-table">
            <thead>
              <tr>
                <th class="tx-check"><button class="tx-checkbox ${visibleRows.length && visibleRows.every((row) => state.selectedTransactions.has(row.id)) ? "is-checked" : ""}" type="button" data-action="tx-select-all" aria-label="Select all"></button></th>
                <th class="tx-date">Date <span>↓</span></th>
                <th class="tx-party">To/From</th>
                <th class="tx-amount">Amount</th>
                <th class="tx-account">Account</th>
                <th class="tx-method"></th>
                <th class="tx-category">Category</th>
                <th class="tx-gl">GL Code</th>
                <th class="tx-note">Note</th>
              </tr>
            </thead>
            <tbody>
              ${visibleRows.map((row) => `
                <tr data-tx-row="${escapeHtml(row.id)}">
                  <td class="tx-check"><button class="tx-checkbox ${state.selectedTransactions.has(row.id) ? "is-checked" : ""}" type="button" data-tx-select="${escapeHtml(row.id)}" aria-label="Select ${escapeHtml(row.party)}"></button></td>
                  <td class="tx-date">${escapeHtml(row.date)}</td>
                  <td class="tx-party">
                    <span class="tx-party-cell">
                      ${renderAvatar(row)}
                      <span><strong>${escapeHtml(row.party)}</strong>${row.failed ? `<em>Failed</em>` : ""}</span>
                    </span>
                  </td>
                  <td class="tx-amount ${row.amount.startsWith("$") ? "is-positive" : ""}">${escapeHtml(row.amount)}</td>
                  <td class="tx-account">${escapeHtml(row.account)}</td>
                  <td class="tx-method">${row.methodIcon ? icon(row.methodIcon) : ""}<span>${escapeHtml(row.method || "")}</span></td>
                  <td class="tx-category">${renderCategory(row, state)}</td>
                  <td class="tx-gl"><button type="button" class="tx-gl-select">${escapeHtml(row.gl || "")}</button></td>
                  <td class="tx-note"><button type="button" class="tx-note-button">Add note</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${state.coachmarkOpen ? `
          <aside class="tx-coachmark">
            <button type="button" data-action="tx-close-coachmark" aria-label="Close coachmark">${icon("close")}</button>
            <strong>We categorized past transactions for you</strong>
            <p>Update or add your own categories to help improve your business insights.</p>
            <a href="#" data-action="tx-view-categories">View</a>
          </aside>
        ` : ""}
      </section>
      <button class="map-launch tx-map" type="button" data-action="tx-map" aria-label="Open guide">${icon("map")}</button>
      ${renderCategoryMenu(state)}
      ${renderFilterMenu(state)}
    </section>
  `;
}

export function getTransactionRows() {
  return rows;
}

export function renderTransactionDrawer(state) {
  if (!state.activeTransactionId) return "";
  const row = rows.find((item) => item.id === state.activeTransactionId);
  if (!row) return "";
  return `
    <div class="drawer-scrim" data-action="tx-close-detail"></div>
    <aside class="transaction-drawer" aria-label="Transaction details">
      <header>
        <span>Transaction details</span>
        <button type="button" data-action="tx-close-detail" aria-label="Close">${icon("close")}</button>
      </header>
      <div class="transaction-drawer-main">
        <div class="drawer-payee">
          ${renderAvatar(row)}
          <div>
            <h2>${escapeHtml(row.party)}</h2>
            <p>${escapeHtml(row.method || "Posted transaction")}</p>
          </div>
        </div>
        <strong class="drawer-amount ${row.amount.startsWith("$") ? "is-positive" : ""}">${escapeHtml(row.amount)}</strong>
        <dl>
          <div><dt>Date</dt><dd>${escapeHtml(row.date)}</dd></div>
          <div><dt>Account</dt><dd>${escapeHtml(row.account)}</dd></div>
          <div><dt>Category</dt><dd>${escapeHtml(categoryValue(row, state) || "Uncategorized")}</dd></div>
          <div><dt>GL Code</dt><dd>${escapeHtml(row.gl || "Not set")}</dd></div>
        </dl>
      </div>
      <footer>
        <button type="button" data-action="match receipts">Match receipt</button>
        <button class="is-primary" type="button" data-action="tx-close-detail">Done</button>
      </footer>
    </aside>
  `;
}
