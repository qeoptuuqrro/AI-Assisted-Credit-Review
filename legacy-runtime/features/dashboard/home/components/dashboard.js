import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml, money } from "../../../../shared/utils/html.js";
import { avatar, googleMark, mercuryMark } from "../../../../shared/legacy/mercury/brand.js";
import { MERCURY_BALANCE_HOVER_POINTS, renderMercuryBalanceChart, renderMercuryBalanceTable } from "../../../../shared/legacy/mercury/balanceChart.js";

const accounts = [
  { id: "credit", name: "Credit Card", value: "$12,505.87", route: "cards" },
  { id: "treasury", name: "Treasury", value: "$200,000.00", route: "accounts" },
  { id: "ops", name: "Ops / Payroll", value: "$2,023,267.12", route: "accounts" },
  { id: "ap", name: "AP", value: "$226,767.82", route: "accounts" },
  { id: "ar", name: "AR", value: "$0.00", route: "accounts" },
];

const disputes = [
  ["Dispute request received", "$3,444.23 at 3 merchants", "102 transactions", "18%"],
  ["Card dispute under review", "$831.09 at Office Stop Co.", "87 transactions", "31%"],
  ["Evidence requested", "$519.40 at travel merchants", "64 transactions", "46%"],
  ["Merchant response pending", "$242.18 at 2 merchants", "39 transactions", "52%"],
  ["Resolved in your favor", "$1,028.00 at software merchants", "27 transactions", "64%"],
  ["Provisional credit issued", "$390.45 at 3 merchants", "18 transactions", "70%"],
  ["Follow-up required", "$144.70 at dining merchants", "14 transactions", "76%"],
  ["Chargeback in progress", "$782.22 at 4 merchants", "9 transactions", "82%"],
  ["Final review", "$98.16 at courier merchants", "5 transactions", "88%"],
];

const monthSummaries = [
  {
    label: "March 2026",
    moneyIn: "$1,261,408.73",
    moneyOut: "-$392,114.28",
    inAverage: "$48.4K",
    outAverage: "-$139K",
  },
  {
    label: "April 2026",
    moneyIn: "$1,536,882.20",
    moneyOut: "-$428,901.62",
    inAverage: "$51.2K",
    outAverage: "-$148K",
  },
  {
    label: "May 2026",
    moneyIn: "$1,748,974.49",
    moneyOut: "-$446,620.93",
    inAverage: "$53.6K",
    outAverage: "-$155K",
  },
];

function renderModuleTitle(label, action) {
  return `
    <h2>
      <button class="module-title-action" type="button" data-action="${escapeHtml(action)}">${escapeHtml(label)}</button>
    </h2>
  `;
}

function renderHomeCardMenu(state, menuId, items) {
  if (state.activeMenu !== menuId) return "";

  return `
    <span class="mercury-menu home-card-menu" role="menu" aria-label="${escapeHtml(menuId.replaceAll("-", " "))}">
      ${items.map(({ action, iconName, label }) => `
        <button type="button" data-action="${escapeHtml(action)}" role="menuitem">
          ${icon(iconName)}
          <span>${escapeHtml(label)}</span>
        </button>
      `).join("")}
    </span>
  `;
}

function renderBalanceChart(state) {
  if (state.balanceMode === "table") {
    return renderMercuryBalanceTable({
      rows: [
        { label: "Total current", value: "$5,144,707.08" },
        { label: "Total available", value: "$5,144,707.08" },
        { label: "Pending transfers", value: "$71,764.10", indented: true },
        { label: "Pending deposits", value: "$1,000.00" },
      ],
      footer: "Your Mercury balance is a bird's eye view of funds across all your Mercury accounts, including posted activity and money movement still in flight.",
    });
  }

  return renderMercuryBalanceChart({
    activeIndex: state.activeBalancePoint,
    points: MERCURY_BALANCE_HOVER_POINTS,
  });
}

function activeMercuryBalancePoint(state) {
  return Number.isInteger(state.activeBalancePoint) ? MERCURY_BALANCE_HOVER_POINTS[state.activeBalancePoint] : null;
}

function renderBalanceDelta(point) {
  const tone = point?.tone === "down" ? "down" : "up";
  const arrow = tone === "down" ? "&searr;" : "&nearr;";
  return `<span class="trend-${tone}">${arrow} ${escapeHtml(point?.delta || "")}</span>`;
}

export function renderBalanceCard(state) {
  const balanceRange = state.balanceRange || "Last 30 days";
  const balanceRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "Last 365 days", "Week to date", "Month to date", "Quarter to date", "Year to date"];
  const activePoint = activeMercuryBalancePoint(state);

  return `
    <article class="mercury-card balance-card ${state.balanceMode === "table" ? "is-table" : ""}">
      <div class="balance-top">
        <div>
          <span class="balance-label-row">
            <span class="card-label">Mercury balance</span>
            <button class="verified-dot" type="button" data-tooltip="Your Mercury balance includes all posted and in-flight account activity." aria-label="Verified balance">${icon("shieldCheck")}</button>
          </span>
          <strong>${activePoint ? money(activePoint.valueMain, activePoint.valueCents) : money("$5,216,471", ".18")}</strong>
        </div>
        <div class="view-toggle" aria-label="Graph or table">
          <button class="${state.balanceMode !== "table" ? "is-active" : ""}" type="button" data-action="balance-graph" data-tooltip="Balance graph" aria-label="Balance graph">${icon("graph")}</button>
          <button class="${state.balanceMode === "table" ? "is-active" : ""}" type="button" data-action="balance-table" data-tooltip="Balance table" aria-label="Balance table">${icon("table")}</button>
        </div>
      </div>
      ${state.balanceMode === "table" ? "" : `
        <div class="balance-meta">
          <span class="balance-date-anchor">
            ${activePoint ? `<span class="balance-hover-date">${escapeHtml(activePoint.date)}</span>` : `<button type="button" data-action="date-range" aria-expanded="${state.activeMenu === "balance-date"}">${escapeHtml(balanceRange)} ${icon("arrowDown")}</button>`}
            ${state.activeMenu === "balance-date" ? `
              <span class="mercury-menu balance-date-menu" role="menu" aria-label="Balance range">
                ${balanceRanges.map((range) => `
                  <button class="${range === balanceRange ? "is-selected" : ""}" type="button" data-action="range-option" data-range-label="${escapeHtml(range)}" role="menuitem">${escapeHtml(range)}${range === balanceRange ? icon("check") : ""}</button>
                `).join("")}
              </span>
            ` : ""}
          </span>
          <div>
            ${activePoint ? renderBalanceDelta(activePoint) : `
              <span class="trend-up">&nearr; $1.8M</span>
              <span class="trend-down">&searr; -$486K</span>
            `}
          </div>
        </div>
      `}
      ${renderBalanceChart(state)}
    </article>
  `;
}

export function renderAccountsCard(state) {
  return `
    <article class="mercury-card accounts-card">
      <div class="module-head">
        ${renderModuleTitle("Accounts", "view-accounts")}
        <div>
          <button class="round-icon" type="button" data-action="add-account" data-tooltip="Add account" aria-label="Add account">${icon("plus")}</button>
          <span class="menu-anchor">
            <button class="round-icon is-plain" type="button" data-action="account-menu" data-tooltip="Account options" aria-label="Account options" aria-expanded="${state.activeMenu === "account-menu"}">${icon("dotMenu")}</button>
            ${renderHomeCardMenu(state, "account-menu", [
              { action: "view-accounts", iconName: "account", label: "View all accounts" },
              { action: "add-account", iconName: "plus", label: "Add account" },
              { action: "download-statements", iconName: "download", label: "Download statements" },
              { action: "manage-bookmarks", iconName: "bookmark", label: "Manage bookmarks" },
            ])}
          </span>
        </div>
      </div>
      <div class="account-list">
        ${accounts.map(({ id, name, route, value }) => `
          <button class="account-row" type="button" data-action="account-row" data-route="${escapeHtml(route)}" data-account-id="${escapeHtml(id)}">
            ${mercuryMark()}
            <span>${escapeHtml(name)}</span>
            <strong>${escapeHtml(value)}</strong>
          </button>
        `).join("")}
        <button class="account-row view-all" type="button" data-action="view-accounts">
          <em>+2</em>
          <span>View all accounts</span>
        </button>
      </div>
    </article>
  `;
}

export function renderDisputeCard(state) {
  const index = state.disputeIndex || 0;
  const [title, value, openCount] = disputes[index] || disputes[0];

  return `
    <article class="mercury-card dispute-card">
      <div class="module-head">
        ${renderModuleTitle("Disputes", "view-disputes")}
        <div class="pager">
          <button ${index === 0 ? "disabled" : ""} type="button" data-action="dispute-prev" aria-label="Previous dispute">&lsaquo;</button>
          <span>${index + 1}/9</span>
          <button ${index === disputes.length - 1 ? "disabled" : ""} type="button" data-action="dispute-next" aria-label="Next dispute">&rsaquo;</button>
          <span class="menu-anchor">
            <button class="round-icon is-plain" type="button" data-action="dispute-menu" aria-label="Dispute options" aria-expanded="${state.activeMenu === "dispute-menu"}">${icon("dotMenu")}</button>
            ${renderHomeCardMenu(state, "dispute-menu", [
              { action: "view-disputes", iconName: "transfer", label: "View disputed transactions" },
              { action: "download-disputes", iconName: "download", label: "Download dispute report" },
              { action: "dismiss-dispute-card", iconName: "eyeOff", label: "Hide this card" },
            ])}
          </span>
        </div>
      </div>
      <button class="dispute-button" type="button" data-action="dispute-detail">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(value)} <em>View details</em> &rsaquo;</span>
      </button>
      <footer class="card-foot">
        <span><small>Open disputes</small><strong>${escapeHtml(openCount)}</strong></span>
        <button type="button" data-action="view-disputes">View &rsaquo;</button>
      </footer>
    </article>
  `;
}

export function renderCreditCard(state) {
  return `
    <article class="mercury-card credit-card">
      <div class="module-head">
        ${renderModuleTitle("Credit Card", "view-credit")}
        <div>
          <button class="round-icon" type="button" data-action="issue-card" data-tooltip="Issue card" aria-label="Issue card">${icon("card")}</button>
          <span class="menu-anchor">
            <button class="round-icon is-plain" type="button" data-action="credit-card-menu" data-tooltip="Credit card options" aria-label="Credit card options" aria-expanded="${state.activeMenu === "credit-card-menu"}">${icon("dotMenu")}</button>
            ${renderHomeCardMenu(state, "credit-card-menu", [
              { action: "view-credit", iconName: "card", label: "View credit account" },
              { action: "credit-card-pay", iconName: "dollar", label: "Pay balance" },
              { action: "edit-autopay", iconName: "calendar", label: "Edit autopay" },
              { action: "download-card-statement", iconName: "download", label: "Download statement" },
            ])}
          </span>
        </div>
      </div>
      <strong class="credit-amount">$12,505.87</strong>
      <div class="credit-meter"><span></span></div>
      <div class="legend-row">
        <span><i></i>Balance</span>
        <span><i></i>Pending</span>
        <b>$21,249 available</b>
      </div>
      <footer class="credit-foot">
        <button class="autopay-button" type="button" data-action="edit-autopay">Autopay<br /><strong>May 30</strong></button>
        <button type="button" data-action="credit-card-pay">Pay</button>
      </footer>
    </article>
  `;
}

export function renderBillPayCard(state) {
  return `
    <article class="mercury-card bill-card">
      <div class="module-head">
        ${renderModuleTitle("Bill Pay", "view-bill-pay")}
        <div>
          <button class="round-icon is-plain" type="button" data-action="pay-bill" data-tooltip="Upload bill" aria-label="Upload bill">${icon("plus")}</button>
          <span class="menu-anchor">
            <button class="round-icon is-plain" type="button" data-action="bill-pay-menu" data-tooltip="Bill Pay options" aria-label="Bill Pay options" aria-expanded="${state.activeMenu === "bill-pay-menu"}">${icon("dotMenu")}</button>
            ${renderHomeCardMenu(state, "bill-pay-menu", [
              { action: "view-bill-pay", iconName: "invoice", label: "View Bill Pay" },
              { action: "pay-bill", iconName: "plus", label: "Upload bill" },
              { action: "bill-pay-approvals", iconName: "check", label: "Review approvals" },
              { action: "bill-pay-settings", iconName: "settings", label: "Bill Pay settings" },
            ])}
          </span>
        </div>
      </div>
      <div class="bill-stats">
        <span><small>Outstanding</small><strong>11</strong></span>
        <span><small>Overdue</small><strong>1</strong></span>
        <span><small>Due soon</small><strong>-</strong></span>
      </div>
      <footer class="card-foot">
        <span><small>Inbox</small><strong>3 items &middot; $10K</strong></span>
        <button type="button" data-action="view-bill-pay">View &rsaquo;</button>
      </footer>
    </article>
  `;
}

export function renderInvoicingCard(state) {
  return `
    <article class="mercury-card invoice-card">
      <div class="module-head">
        ${renderModuleTitle("Invoicing", "view-invoicing")}
        <div>
          <button class="round-icon is-plain" type="button" data-action="create-invoice" data-tooltip="Create invoice" aria-label="Create invoice">${icon("plus")}</button>
          <span class="menu-anchor">
            <button class="round-icon is-plain" type="button" data-action="invoice-menu" data-tooltip="Invoicing options" aria-label="Invoicing options" aria-expanded="${state.activeMenu === "invoice-menu"}">${icon("dotMenu")}</button>
            ${renderHomeCardMenu(state, "invoice-menu", [
              { action: "view-invoicing", iconName: "invoice", label: "View invoices" },
              { action: "create-invoice", iconName: "plus", label: "Create invoice" },
              { action: "view-customers", iconName: "users", label: "Customers" },
              { action: "invoice-settings", iconName: "settings", label: "Invoice settings" },
            ])}
          </span>
        </div>
      </div>
      <div class="bill-stats invoice-stats">
        <span><small>Overdue</small><strong>4 &middot; $950</strong></span>
        <span><small>Paid</small><strong>12 &middot; $6K</strong></span>
      </div>
      <footer class="card-foot">
        <span><small>Open</small><strong>12 items &middot; $12.3K</strong></span>
        <button type="button" data-action="view-invoicing">View &rsaquo;</button>
      </footer>
    </article>
  `;
}

export function renderMoneyMovement(state) {
  const inRows = [
    ["Venture Debt Loan", "$1,000,000.00", "mark", "venture-debt"],
    ["GenPro", "$414,983.19", "G", "genpro"],
    ["Google", "$66,196.57", "google", "google-in"],
    ["Milgram Brokerage", "$58,048.22", "MB", "milgram-in"],
  ];
  const outRows = [
    ["Jordi O'Donnell", "-$90,797.16", "JO", "jordi"],
    ["Gusto (Payroll)", "-$90,122.53", "GP", "gusto"],
    ["Google", "-$65,277.72", "google", "google-out"],
    ["Milgram Brokerage", "-$50,628.38", "MB", "milgram-out"],
  ];
  const monthIndex = state.movementMonthIndex ?? monthSummaries.length - 1;
  const summary = monthSummaries[monthIndex] || monthSummaries[monthSummaries.length - 1];

  const renderSource = ([name, value, iconName, id], direction) => `
    <button class="source-row ${state.activeMovementId === id ? "is-selected" : ""}" type="button" data-action="movement-source" data-movement-id="${escapeHtml(id)}" data-route="transactions" data-movement-direction="${escapeHtml(direction)}">
      ${iconName === "mark" ? mercuryMark() : iconName === "google" ? googleMark() : iconName.length <= 2 ? avatar(iconName || name.slice(0, 1), "soft") : icon(iconName)}
      <span>${escapeHtml(name)}</span>
      <strong>${escapeHtml(value)}</strong>
    </button>
  `;

  const renderMovementCard = ({ label, value, rows, footer, out }) => `
    <article class="mercury-card movement-card ${out ? "is-out" : ""}">
      <header>
        <span>${escapeHtml(label)}${out ? ` <i class="info-dot" aria-hidden="true">i</i>` : ""}</span>
        <strong>${value}</strong>
      </header>
      <div class="movement-list">
        <h3>${out ? "Top spend" : "Top sources"}</h3>
        ${rows.map((row) => renderSource(row, out ? "outgoing" : "incoming")).join("")}
        <button class="source-row view-all-source" type="button" data-action="${out ? "view-money-out" : "view-money-in"}" data-route="transactions">
          ${icon("arrowUpRight")}
          <span>View all</span>
        </button>
      </div>
      <footer>
        <span>Last 3 months average</span>
        <strong>${escapeHtml(footer)}</strong>
        <i></i>
      </footer>
    </article>
  `;

  return `
    <section class="movement-section">
      <div class="section-title-row">
        <h2>Money movement</h2>
        <div class="month-nav">
          <button type="button" data-action="movement-month-prev" ${monthIndex === 0 ? "disabled" : ""} aria-label="Previous month">&lsaquo;</button>
          <span>${escapeHtml(summary.label)}</span>
          <button type="button" data-action="movement-month-next" ${monthIndex === monthSummaries.length - 1 ? "disabled" : ""} aria-label="Next month">&rsaquo;</button>
        </div>
      </div>
      <div class="movement-grid">
        ${renderMovementCard({ label: "Money in", value: money(summary.moneyIn.replace(/\.\d+$/, ""), summary.moneyIn.match(/\.\d+$/)?.[0] || ".00"), rows: inRows, footer: summary.inAverage })}
        ${renderMovementCard({ label: "Money out", value: `&minus;${money(summary.moneyOut.replace(/^-/, "").replace(/\.\d+$/, ""), summary.moneyOut.match(/\.\d+$/)?.[0] || ".00")}`, rows: outRows, footer: summary.outAverage, out: true })}
      </div>
    </section>
  `;
}
