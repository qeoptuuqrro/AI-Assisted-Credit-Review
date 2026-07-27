import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml } from "../../../../shared/utils/html.js";
import { avatar, mercuryMark } from "./brand.js";

export function renderDemoBanner(state = {}) {
  return `
    <div class="demo-banner">
      <div class="demo-left">
        ${mercuryMark()}
        <span>Explore the Mercury Demo.</span>
        <button type="button" data-action="customize-experience">Customize your experience</button>
      </div>
      <div class="demo-right">
        <div class="menu-anchor">
          <button class="role-pill" type="button" data-action="role-menu" aria-expanded="${state.activeMenu === "role"}">Viewing as Admin ${icon("arrowDown")}</button>
          ${state.activeMenu === "role" ? `
            <div class="mercury-menu role-menu" role="menu">
              <button type="button" data-action="view-employee" role="menuitem">View as Employee</button>
            </div>
          ` : ""}
        </div>
        <a class="open-account" href="https://app.mercury.com/signup?utm_source=mercury&utm_medium=demo&utm_campaign=publicDemoOnlyBanner" target="_blank" rel="noreferrer">Open account</a>
      </div>
    </div>
  `;
}

export function renderSidebar(activeRoute = "transactions") {
  const primary = [
    ["home", "Home", "", "home"],
    ["tasks", "Tasks", "9", "tasks"],
  ];
  const product = [
    ["account", "Accounts", "", "accounts"],
    ["transfer", "Transactions", "", "transactions"],
    ["card", "Cards", "", "cards"],
    ["send", "Payments", "", "payments"],
    ["invoice", "Invoicing", "", "invoicing"],
    ["layers", "Reimbursements", "", "reimbursements"],
  ];
  const bookmarks = [
    ["Ops / Payroll", "$2,023,267.12", "ops"],
    ["Credit Card", "", "credit"],
    ["Bill Pay", "", "bill-pay"],
    ["Insights", "", "insights"],
  ];

  const renderNavItem = ([iconName, label, count, route]) => {
    const expanded = route === "transactions";
    const active = activeRoute === route;
    return `
      <div class="side-group ${expanded ? "is-expanded" : ""}">
        <button class="side-link ${expanded ? "has-children" : ""} ${active ? "is-active" : ""}" type="button" data-route="${escapeHtml(route)}">
          ${icon(iconName)}
          <span>${escapeHtml(label)}</span>
          ${count ? `<em>${escapeHtml(count)}</em>` : ""}
        </button>
        ${expanded ? `
          <div class="side-subnav" aria-label="Transactions">
            <button class="sub-link ${activeRoute === "insights" ? "is-active" : ""}" type="button" data-route="insights">Insights</button>
            <button class="sub-link ${activeRoute === "accounting" ? "is-active" : ""}" type="button" data-route="accounting">Accounting</button>
          </div>
        ` : ""}
      </div>
    `;
  };

  return `
    <aside class="mercury-sidebar">
      <button class="workspace-switch" type="button" data-action="workspace">
        ${mercuryMark()}
        <span>Mercury Demo</span>
        <b>Pro</b>
      </button>
      <nav class="side-stack insights-side" aria-label="Mercury style navigation">
        <section>${primary.map(renderNavItem).join("")}</section>
        <section>${product.map(renderNavItem).join("")}</section>
        <section class="bookmarks-section">
          <div class="side-section-title">
            <span>Bookmarks</span>
            <button type="button" aria-label="Manage bookmarks">${icon("plus")}</button>
          </div>
          ${bookmarks.map(([label, amountValue, route]) => `
            <button class="bookmark-row ${amountValue ? "has-amount" : ""} ${activeRoute === route ? "is-active" : ""}" type="button" data-route="${escapeHtml(route)}">
              ${icon("bookmark")}
              <span>
                <strong>${escapeHtml(label)}</strong>
                ${amountValue ? `<small>${escapeHtml(amountValue)}</small>` : ""}
              </span>
            </button>
          `).join("")}
        </section>
      </nav>
    </aside>
  `;
}

function renderSearchDialog() {
  const filters = ["All", "Pages", "Transactions", "Accounts", "Cards", "Recipients", "Statements", "Scheduled"];
  const skeletonRows = Array.from({ length: 6 });

  return `
    <div class="search-scrim" data-action="close-search"></div>
    <section class="command-dialog" role="dialog" aria-label="Search command palette">
      <label class="command-input">
        ${icon("search")}
        <input placeholder="Search for anything" aria-label="Search query" />
      </label>
      <div class="command-filters">
        ${filters.map((filter, index) => `<button class="${index === 0 ? "is-active" : ""}" type="button">${escapeHtml(filter)}</button>`).join("")}
        <button type="button" aria-label="More search filters">${icon("arrowUpRight")}</button>
      </div>
      <div class="command-list">
        <span class="example-label">Examples</span>
        ${skeletonRows.map(() => `
          <button class="command-skeleton-row" type="button" data-action="command-option" aria-label="Example result">
            <span></span><i></i>
          </button>
        `).join("")}
      </div>
      <footer class="command-footer">
        <span>&uarr; &darr; Navigate</span>
        <span>Enter Open page</span>
        <span>&#8984; Enter Open in new tab</span>
      </footer>
    </section>
  `;
}

export function renderUtilityBar(state) {
  return `
    <header class="utility-bar">
      <button class="global-search" type="button" data-action="search">
        ${icon("search")}
        <span>Search for anything</span>
      </button>
      <div class="utility-actions">
        <div class="menu-anchor">
          <button type="button" data-action="move-money" aria-expanded="${state.activeMenu === "move"}">${icon("transfer")}<span>Move money</span></button>
          ${state.activeMenu === "move" ? renderMoveMoneyMenu() : ""}
        </div>
        <button class="icon-button ${state.privateMode ? "is-active" : ""}" type="button" data-action="private" aria-label="Toggle Private Mode">${icon("eyeOff")}</button>
        <button class="icon-button" type="button" data-action="settings" aria-label="Settings">${icon("settings")}</button>
        <div class="menu-anchor">
          <button class="icon-button" type="button" data-action="updates" aria-label="Updates" aria-expanded="${state.activeMenu === "updates"}">${icon("bell")}</button>
          ${state.activeMenu === "updates" ? renderUpdatesMenu() : ""}
        </div>
        <div class="menu-anchor">
          ${avatar()}
          ${state.activeMenu === "profile" ? renderProfileMenu() : ""}
        </div>
      </div>
      ${state.searchOpen ? renderSearchDialog() : ""}
    </header>
  `;
}

function renderMoveMoneyMenu() {
  const items = [
    ["send", "Send", "send"],
    ["transfer", "Transfer", "transfer"],
    ["deposit", "Deposit", "deposit"],
    ["request", "Request", "request"],
    ["upload", "Upload bill", "upload bill"],
  ];
  return `
    <div class="mercury-menu move-money-menu" role="menu" aria-label="Move money">
      ${items.map(([iconName, label, action]) => `
        <button type="button" data-action="${escapeHtml(action)}" role="menuitem">${icon(iconName)}<span>${escapeHtml(label)}</span></button>
      `).join("")}
    </div>
  `;
}

function renderUpdatesMenu() {
  return `
    <div class="mercury-menu updates-menu" role="menu" aria-label="Updates">
      <strong>Updates</strong>
      <button type="button" data-action="update-item"><span>Category automation completed</span><em>Just now</em></button>
      <button type="button" data-action="update-item"><span>Incoming wire posted</span><em>Today</em></button>
      <button type="button" data-action="update-item"><span>New card transaction</span><em>Yesterday</em></button>
    </div>
  `;
}

function renderProfileMenu() {
  return `
    <div class="mercury-menu profile-menu" role="menu" aria-label="Profile">
      <div><strong>Jane Smith</strong><span>jane@mercury.demo</span></div>
      <button type="button" data-action="profile-settings">Account settings</button>
      <button type="button" data-action="team">Team management</button>
      <button type="button" data-action="sign-out">Sign out</button>
    </div>
  `;
}

export function renderDashboardActionPanel(state) {
  if (!state.activeAction) return "";
  const labels = {
    send: ["Send money", "Choose a recipient and payment method."],
    transfer: ["Transfer", "Move money between Mercury accounts."],
    deposit: ["Deposit", "Add funds by check, wire, or ACH."],
    request: ["Request", "Create an invoice or payment request."],
    "upload bill": ["Upload bill", "Upload an invoice for bill pay."],
    "match receipts": ["Match receipts", "Review suggested receipt matches."],
  };
  const [title, body] = labels[state.activeAction] || ["Mercury action", "This workflow is ready."];
  return `
    <div class="drawer-scrim" data-action="close-action"></div>
    <aside class="action-panel" aria-label="${escapeHtml(title)}">
      <header>
        <div>
          <span>Mercury workflow</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <button type="button" data-action="close-action" aria-label="Close">${icon("close")}</button>
      </header>
      <div class="action-panel-body">
        <p>${escapeHtml(body)}</p>
        <label><span>From</span><button type="button">Ops / Payroll ${icon("arrowDown")}</button></label>
        <label><span>Recipient</span><input value="Contractor" /></label>
        <label><span>Amount</span><input value="$213.11" /></label>
        <label><span>Memo</span><input value="Remote design retainer" /></label>
      </div>
      <footer>
        <button type="button" data-action="close-action">Cancel</button>
        <button class="is-primary" type="button" data-action="confirm-action">Continue</button>
      </footer>
    </aside>
  `;
}
