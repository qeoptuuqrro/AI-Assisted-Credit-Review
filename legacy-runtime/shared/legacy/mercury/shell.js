import { icon } from "../../ui/icons.js";
import { escapeHtml } from "../../utils/html.js";
import { mercuryMark } from "./brand.js";

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

export function renderSidebar(options = {}) {
  const activeLabel = options.active || "Home";
  const state = options.state || {};
  const primary = [
    ["home", "Home", ""],
    ["tasks", "Tasks", "9"],
  ];
  const mercuryProduct = [
    ["account", "Accounts", ""],
    ["", "Treasury", "", "sub"],
    ["", "Financing", "", "sub"],
    ["transfer", "Transactions", ""],
    ["card", "Cards", ""],
    ["send", "Payments", ""],
    ["invoice", "Invoicing", ""],
    ["layers", "Reimbursements", ""],
  ];
  const standardProduct = [
    ["account", "Accounts", ""],
    ["transfer", "Transactions", ""],
    ["card", "Cards", ""],
    ["send", "Payments", ""],
    ["invoice", "Invoicing", ""],
    ["layers", "Reimbursements", ""],
  ];
  const workflowProduct = [
    ["account", "Accounts", ""],
    ["transfer", "Transactions", ""],
    ["", "Insights", "", "sub"],
    ["", "Accounting", "", "sub"],
    ["card", "Cards", ""],
    ["send", "Payments", ""],
    ["invoice", "Invoicing", ""],
    ["layers", "Reimbursements", ""],
  ];
  const product = options.mercuryCapitalNav ? mercuryProduct : options.showWorkflowRoutes ? workflowProduct : standardProduct;
  const bookmarks = [
    ["Ops / Payroll", "$2,023,267.12"],
    ["Credit Card", ""],
    ["Bill Pay", ""],
    ["Insights", ""],
  ];

  const renderInvoiceSubnav = () => {
    if (activeLabel !== "Invoicing") return "";
    const activeSub = state.activeTab || "Invoicing";
    return ["Recurring Series", "Customers", "Catalog"].map((label) => `
      <button class="side-link is-sub ${activeSub === label ? "is-active" : ""}" type="button" data-tab="${escapeHtml(label)}">
        <span class="side-spacer" aria-hidden="true"></span>
        <span>${escapeHtml(label)}</span>
      </button>
    `).join("");
  };

  const renderPaymentsSubnav = () => {
    if (activeLabel !== "Payments") return "";
    const activeSub = state.activeSection || "Bill Pay";
    return ["Bill Pay", "Recipients", "Taxes", "Wire Drawdowns", "ACH Authorizations"].map((label) => `
      <button class="side-link is-sub ${activeSub === label ? "is-active" : ""}" type="button" data-section-tab="${escapeHtml(label)}">
        <span class="side-spacer" aria-hidden="true"></span>
        <span>${escapeHtml(label)}</span>
      </button>
    `).join("");
  };

  const renderCardsSubnav = () => {
    if (activeLabel !== "Cards") return "";
    return `
      <button class="side-link is-sub" type="button" data-nav="Credit Card">
        <span class="side-spacer" aria-hidden="true"></span>
        <span>Credit Card</span>
      </button>
    `;
  };

  const renderNavItem = ([iconName, label, count, variant]) => `
    <button class="side-link ${variant === "sub" ? "is-sub" : ""} ${label === activeLabel ? "is-active" : ""}" type="button" data-nav="${escapeHtml(label)}">
      ${iconName ? icon(iconName) : `<span class="side-spacer" aria-hidden="true"></span>`}
      <span>${escapeHtml(label)}</span>
      ${count ? `<em>${escapeHtml(count)}</em>` : ""}
    </button>
    ${label === "Invoicing" ? renderInvoiceSubnav() : ""}
    ${label === "Payments" ? renderPaymentsSubnav() : ""}
    ${label === "Cards" ? renderCardsSubnav() : ""}
  `;

  return `
    <aside class="mercury-sidebar">
      <div class="workspace-anchor">
        <button class="workspace-switch" type="button" data-action="workspace" aria-expanded="${state.activeMenu === "workspace"}">
          ${mercuryMark()}
          <span>Mercury Demo</span>
          <b>Pro</b>
        </button>
        ${state.activeMenu === "workspace" ? renderWorkspaceMenu() : ""}
      </div>
      <nav class="side-stack" aria-label="Mercury style navigation">
        <section>${primary.map(renderNavItem).join("")}</section>
        <hr class="side-divider" aria-hidden="true">
        <section>${product.map(renderNavItem).join("")}</section>
        <hr class="side-divider" aria-hidden="true">
        <section class="bookmarks-section">
          <div class="side-section-title">
            <span>Bookmarks</span>
            <button type="button" aria-label="Manage bookmarks">${icon("customize")}</button>
          </div>
          ${bookmarks.map(([label, amountValue]) => `
            <button class="bookmark-row ${amountValue ? "has-amount" : ""} ${label === activeLabel ? "is-active" : ""}" type="button" data-nav="${escapeHtml(label)}">
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
        <button class="icon-button" type="button" data-action="settings" aria-label="Navigate to Settings">${icon("settings")}</button>
        <div class="menu-anchor">
          <button class="icon-button" type="button" data-action="updates" aria-label="updates" aria-expanded="${state.activeMenu === "updates"}">${icon("bell")}</button>
          ${state.activeMenu === "updates" ? renderUpdatesMenu() : ""}
        </div>
        <div class="menu-anchor">
          <button class="profile-button" type="button" data-action="profile" aria-label="Jane profile" aria-expanded="${state.activeMenu === "profile"}"></button>
          ${state.activeMenu === "profile" ? renderProfileMenu() : ""}
        </div>
      </div>
      ${state.searchOpen ? renderSearchDialog(state) : ""}
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
      <div class="updates-empty">
        <span>No updates</span>
      </div>
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

function renderSearchDialog(state = {}) {
  const filters = ["All", "Pages", "Transactions", "Accounts", "Cards", "Recipients", "Statements", "Scheduled", "Approvals", "Users"];
  const activeFilter = state.searchFilter || "All";
  const examples = [
    ["transfer", "Recent transactions", "View all"],
    ["calendar", "Scheduled payments", ""],
    ["check", "Payment approvals", ""],
    ["card", "Cards", ""],
    ["doc", "View statements for Ops / Payroll", ""],
    ["account", "Ops / Payroll", ""],
  ];

  return `
    <div class="search-scrim" data-action="close-search"></div>
    <section class="command-dialog" role="dialog" aria-label="Search command palette">
      <label class="command-input">
        ${icon("search")}
        <input placeholder="Payments over 1.5k" aria-label="Search query" />
      </label>
      <div class="command-filters">
        ${filters.map((filter) => `<button class="${filter === activeFilter ? "is-active" : ""}" type="button" data-search-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("")}
        <button class="command-more" type="button" aria-label="More search filters">&rarr;</button>
      </div>
      <div class="command-list">
        <span class="example-label">Examples</span>
        ${examples.map(([iconName, label, meta], index) => `
          <button class="command-option ${index === 0 ? "is-selected" : ""}" type="button" data-action="command-option">
            <span class="command-option-icon">${icon(iconName)}</span>
            <span>${escapeHtml(label)}</span>
            ${meta ? `<em>${escapeHtml(meta)}</em>` : ""}
          </button>
        `).join("")}
      </div>
      <footer class="command-footer">
        <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> Navigate</span>
        <span><kbd>&crarr;</kbd> Open page</span>
        <span><kbd>&#8984;</kbd><kbd>&crarr;</kbd> Open in new tab</span>
      </footer>
    </section>
  `;
}

export function renderActionBar(state) {
  const actions = [
    ["send", "Send", "primary"],
    ["transfer", "Transfer", ""],
    ["plus", "Deposit", ""],
    ["request", "Request", ""],
    ["upload", "Upload bill", ""],
  ];

  return `
    <div class="action-row">
      <div class="quick-actions">
        ${actions.map(([iconName, label, tone]) => `
          <button class="action-pill ${tone ? `is-${tone}` : ""}" type="button" data-action="${escapeHtml(label.toLowerCase())}">
            ${icon(iconName)}
            <span>${escapeHtml(label)}</span>
          </button>
        `).join("")}
      </div>
      <div class="customize-wrap">
        <button class="customize-button ${state.customizeOpen ? "is-open" : ""}" type="button" data-action="customize">
          ${icon("dotMenu")}
          <span>Customize</span>
        </button>
        ${state.customizeOpen ? renderCustomizeMenu() : ""}
      </div>
    </div>
  `;
}

function renderCustomizeMenu() {
  const items = ["Hide Dispute Status", "Hide Credit Card", "Hide Bill Pay", "Hide Invoicing", "Request feature"];
  return `
    <div class="customize-menu">
      ${items.map((item) => `
        <button type="button" data-action="customize-item">${icon("eyeOff")}<span>${escapeHtml(item)}</span></button>
      `).join("")}
    </div>
  `;
}

function renderWorkspaceMenu() {
  const accounts = [
    ["Mercury Demo", "Currently selected Mercury account"],
    ["Debug, LLC", ""],
    ["Pico Accountants", "Advisor Portal"],
    ["TypeCode", ""],
  ];

  return `
    <div class="mercury-menu workspace-menu" role="menu" aria-label="Workspace">
      <header>
        <div>${mercuryMark()}<span><strong>Mercury Demo</strong><em>Business Banking</em></span></div>
        <b>Pro</b>
      </header>
      <section>
        <button type="button" data-nav="settings"><span>All Settings</span></button>
        <button type="button" data-action="workspace-users"><span>Users</span></button>
        <button type="button" data-action="workspace-documents"><span>Documents & Data</span></button>
        <button type="button" data-action="workspace-billing"><span>Plan & Billing</span></button>
        <button type="button" data-action="workspace-referral"><span>Referrals</span><em>Earn $250</em></button>
      </section>
      <section>
        <button type="button" data-nav="accounts"><span>All Accounts</span></button>
        ${accounts.map(([label, value]) => `
          <button class="workspace-account-row" type="button" data-nav="${escapeHtml(label)}">${mercuryMark()}<span>${escapeHtml(label)}</span>${value ? `<em>${escapeHtml(value)}</em>` : ""}</button>
        `).join("")}
      </section>
      <footer>
        <button type="button" data-action="apply-account"><span>Apply for a new account</span></button>
        <button type="button" data-action="link-account"><span>Link an existing account</span></button>
        <hr class="workspace-divider" aria-hidden="true">
        <button type="button" data-action="sign-out">Log out</button>
      </footer>
    </div>
  `;
}

export function renderHomeActionPanel(state) {
  if (!state.activeAction) return "";
  const labels = {
    send: ["Send money", "Choose a recipient and payment method."],
    transfer: ["Transfer", "Move money between Mercury accounts."],
    deposit: ["Deposit", "Add funds by check, wire, or ACH."],
    request: ["Request", "Create an invoice or payment request."],
    "upload bill": ["Upload bill", "Upload an invoice for bill pay."],
    "add-account": ["Add account", "Choose an account type and funding source."],
    "issue-card": ["Issue card", "Create a physical or virtual team card."],
    "credit-card-pay": ["Pay credit card", "Schedule a payment toward the current balance."],
    "edit-autopay": ["Edit autopay", "Update payment timing and funding account."],
    "pay-bill": ["Upload bill", "Add a vendor bill to the approval queue."],
    "create-invoice": ["Create invoice", "Send a payment request to a customer."],
    "dispute-detail": ["Dispute details", "Review evidence, timeline, and next steps."],
  };
  const [title, body] = labels[state.activeAction] || ["Mercury action", "This workflow is ready."];
  return `
    <div class="drawer-scrim" data-action="close-action"></div>
    <aside class="action-panel" aria-label="${escapeHtml(title)}">
      <header>
        <div>
          <span>Move money</span>
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
