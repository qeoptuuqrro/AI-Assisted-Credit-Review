import { icon } from "../../../shared/ui/icons.js";
import { escapeHtml } from "../../../shared/utils/html.js";
import { renderDemoBanner, renderHomeActionPanel, renderSidebar, renderUtilityBar } from "../../../shared/legacy/mercury/shell.js";
import { avatar, mercuryMark } from "../../../shared/legacy/mercury/brand.js";
import { capitalTabs, optionRows, repaymentRows, safeRows, upcomingPayments, ventureActivity, workingActivity } from "./data.js";

function isPositive(value) {
  return value.startsWith("$");
}

function renderFinancingTabs(state) {
  return `
    <nav class="capital-tabs" aria-label="Financing sections">
      ${capitalTabs.map((tab) => `
        <button class="${state.activeTab === tab.id ? "is-active" : ""}" type="button" data-action="capital-tab" data-tab="${tab.id}">
          ${escapeHtml(tab.label)}
        </button>
      `).join("")}
    </nav>
  `;
}

function renderActivityTable(rows) {
  return `
    <section class="capital-activity">
      <h2>Activity</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Description</th><th>Account</th><th>Amount</th></tr>
        </thead>
        <tbody>
          ${rows.map(([date, description, account, amount]) => `
            <tr>
              <td>${escapeHtml(date)}</td>
              <td>${escapeHtml(description)}</td>
              <td>${escapeHtml(account)}</td>
              <td><span class="${isPositive(amount) ? "is-positive" : ""}">${escapeHtml(amount.replace("-", "−"))}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderHomeTab() {
  return `
    <section class="capital-product-grid">
      <button class="capital-product-card safe-hero" type="button" data-action="start-safe">
        <strong>SAFE</strong>
        <span>A simple tool for early-stage fundraising.</span>
        <em>Start now ${icon("arrowUpRight")}</em>
        <i aria-hidden="true"></i>
      </button>
      <button class="capital-product-card" type="button" data-action="go-working">
        <strong>Working Capital</strong>
        <span>Grow your ecom business with a working capital loan.</span>
        <em>Apply for more capital ${icon("arrowUpRight")}</em>
      </button>
      <button class="capital-product-card" type="button" data-action="go-venture">
        <strong>Venture Debt</strong>
        <span>Runway extension for VC-backed companies.</span>
        <em>See if you qualify ${icon("arrowUpRight")}</em>
      </button>
    </section>
    <section class="capital-options">
      <h2>Explore Options</h2>
      <table>
        <thead>
          <tr><th>Category</th><th>Typically spent on</th><th>Funding based on</th></tr>
        </thead>
        <tbody>
          ${optionRows.map((row) => `
            <tr>
              <td><strong>${escapeHtml(row.category)}</strong><span>${escapeHtml(row.sub)}</span></td>
              <td>${row.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}</td>
              <td>${escapeHtml(row.funding)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderWorkingTab() {
  return `
    <section class="capital-working-grid">
      <article class="capital-card loan-card">
        <header>
          <span>Outstanding balance <i class="info-dot">i</i></span>
          <em>13 payments left</em>
        </header>
        <strong>$30,800.00</strong>
        <div class="loan-progress">
          <span>Repayment progress</span>
          <i><b style="width: 13%"></b></i>
          <p><em>Repaid</em><em>Outstanding</em></p>
        </div>
        <footer>
          <button type="button" data-action="edit-autopay">${icon("customize")} Edit autopay</button>
          <button type="button" data-action="download-agreement">${icon("download")} Download loan agreement</button>
        </footer>
      </article>
      <article class="capital-card schedule-card">
        <header>
          <h3>Upcoming payments</h3>
          <button type="button" data-action="view-schedule">View full schedule ${icon("arrowUpRight")}</button>
        </header>
        <table>
          <thead><tr><th>Date</th><th>Payment</th><th>Ending Balance</th></tr></thead>
          <tbody>
            ${upcomingPayments.map(([date, payment, balance]) => `<tr><td>${date}</td><td>${payment}</td><td>${balance}</td></tr>`).join("")}
          </tbody>
        </table>
      </article>
    </section>
    ${renderActivityTable(workingActivity)}
  `;
}

function renderVentureTab() {
  return `
    <section class="venture-layout">
      <article class="capital-card venture-main-card">
        <header>
          <div>
            <span>Outstanding balance</span>
            <strong>$5,000,000.00</strong>
          </div>
          <button type="button" data-action="request-funds">Request funds</button>
        </header>
        <p>Interest only ends Jun 4, 2026</p>
        <div class="venture-meter">
          <i style="width: 40%"></i><i style="width: 10%"></i><i style="width: 20%"></i><i style="width: 30%"></i>
        </div>
        <div class="venture-legend">
          <span>$5M outstanding</span>
          <span>$1M available today</span>
          <span>$2M unavailable</span>
          <span>$2M expired</span>
        </div>
        <footer>
          <button type="button" data-action="monthly-reporting">Monthly Reporting <em>Up to date</em></button>
          <strong>You're up to date!</strong>
        </footer>
      </article>
      <aside class="venture-side">
        <button class="next-payment-card" type="button" data-action="view-more">${icon("send")} <span>Next payment May 31</span><em>View more ${icon("arrowUpRight")}</em></button>
        <button class="download-strip" type="button" data-action="download-agreement">${icon("download")} Download loan agreement</button>
        <section class="advisor-card">
          <h3>Questions?</h3>
          <p>Contact your capital advisor</p>
          <div>${avatar("JC", "soft")}<span><strong>Jake Cooper</strong><small>jacobc@mercury.com</small></span></div>
        </section>
      </aside>
    </section>
    ${renderActivityTable(ventureActivity)}
  `;
}

function renderSafesTab() {
  return `
    <section class="safe-summary-card">
      <dl>
        <div><dt>Total</dt><dd>$10,011,000</dd></div>
        <div><dt>Received</dt><dd class="is-positive">$1,000</dd></div>
        <div><dt>Outstanding</dt><dd>$10,010,000</dd></div>
        <div><dt>SAFEs</dt><dd>3</dd></div>
      </dl>
      <button type="button" data-action="start-safe">Create new SAFE +</button>
    </section>
    <section class="safe-table-section">
      <table>
        <thead><tr><th>Name</th><th>Amount</th><th>Progress</th><th>Valuation</th></tr></thead>
        <tbody>
          ${safeRows.map((row) => `
            <tr data-action="safe-row">
              <td><span class="safe-investor">${avatar(row.initials, "soft")}<span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.email)}</small></span></span></td>
              <td>${escapeHtml(row.amount)}</td>
              <td>${row.progress.map((item, index) => `<span class="${index === 0 && item !== "Not signed" ? "is-complete" : ""}">${index === 0 && item !== "Not signed" ? "✓" : "—"} ${escapeHtml(item)}</span>`).join("")}</td>
              <td>${row.valuation.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderContent(state) {
  if (state.activeTab === "working") return renderWorkingTab();
  if (state.activeTab === "venture") return renderVentureTab();
  if (state.activeTab === "safes") return renderSafesTab();
  return renderHomeTab();
}

function renderAutopayModal() {
  return `
    <div class="capital-modal-backdrop" data-action="close-modal"></div>
    <section class="capital-dialog autopay-dialog" role="dialog" aria-label="Autopay settings">
      <h2>Autopay settings</h2>
      <p>Select or change your current autopay settings by choosing which accounts you would like payments to be made from.</p>
      <label>Primary autopay account</label>
      <button class="account-select" type="button" data-action="account-select">${mercuryMark()}<span><strong>Ops / Payroll</strong><small>$2,023,267.12 / Checking ••1038</small></span>${icon("arrowDown")}</button>
      <label>Back up autopay account</label>
      <button class="account-select" type="button" data-action="account-select">${mercuryMark()}<span><strong>AP</strong><small>$226,767.82 / Checking ••1794</small></span>${icon("arrowDown")}</button>
      <footer><button type="button" data-action="close-modal">Cancel</button><button class="is-primary" type="button" data-action="confirm-autopay">Confirm</button></footer>
    </section>
  `;
}

function renderScheduleModal() {
  return `
    <div class="capital-modal-backdrop" data-action="close-modal"></div>
    <section class="capital-dialog schedule-dialog" role="dialog" aria-label="Estimated repayment schedule">
      <h2>Estimated repayment schedule</h2>
      <p>Your subsequent auto-deposit and payments dates are estimates based on an initial deposit date of Jun 24.</p>
      <table>
        <thead><tr><th>Week</th><th>Date</th><th>Status</th><th>Principal</th><th>Fee</th><th>Total due</th><th>Paid</th><th>Ending balance</th></tr></thead>
        <tbody>
          ${repaymentRows.map(([week, date, status, principal, fee, due, paid, balance]) => `
            <tr><td>${week}</td><td>${date}</td><td><em class="status-${status.toLowerCase()}">${status}</em></td><td>${principal}</td><td>${fee}</td><td>${due}</td><td>${paid}</td><td>${balance}</td></tr>
          `).join("")}
        </tbody>
        <tfoot><tr><td>Total</td><td colspan="5"></td><td>$4,399.98</td><td></td></tr></tfoot>
      </table>
      <footer><button type="button" data-action="export-schedule">Export</button><button class="is-primary" type="button" data-action="close-modal">Close</button></footer>
    </section>
  `;
}

function renderPaymentModal() {
  return `
    <div class="capital-modal-backdrop" data-action="close-modal"></div>
    <section class="capital-dialog payment-dialog" role="dialog" aria-label="Next payment">
      <h2>Next payment</h2>
      <p>May 31 payment estimate for your venture debt facility.</p>
      <dl>
        <div><dt>Principal</dt><dd>$833.33</dd></div>
        <div><dt>Interest</dt><dd>$166.67</dd></div>
        <div><dt>Total</dt><dd>$1,000.00</dd></div>
      </dl>
      <footer><button type="button" data-action="close-modal">Close</button><button class="is-primary" type="button" data-action="download-agreement">Download details</button></footer>
    </section>
  `;
}

function renderRequestFlow(state) {
  const step = state.requestStep || "amount";
  return `
    <main class="capital-flow">
      ${renderDemoBanner()}
      <button class="flow-close" type="button" data-action="close-flow">${icon("close")}</button>
      <aside>
        <div>${mercuryMark()}<span>Mercury Demo</span></div>
        <nav>
          <span class="${step === "amount" ? "is-active" : ""}">Request Calculator</span>
          <span class="${step === "destination" ? "is-active" : ""}">Destination of Funds</span>
          <span class="${step === "review" ? "is-active" : ""}">Review</span>
        </nav>
      </aside>
      <section class="request-step">
        ${step === "amount" ? `
          <h1>How much do you want to borrow?</h1>
          <label class="money-input"><span>$</span><input value="${escapeHtml(state.requestAmount)}" placeholder="0.00" data-action="amount-input" /></label>
          <p>Request up to $1,000,000 USD today.</p>
          <article>
            <h2>Current monthly payments</h2>
            <small>Based on today's prime rate of 5.00% <i class="info-dot">i</i></small>
            <ul>
              <li><b>9 interest-only payments</b><span>$10,000.00</span></li>
              <li><b>17 principal + interest payments</b><span>Ranging from $70,000.00 - $100,000.00</span></li>
            </ul>
          </article>
          <button class="flow-next ${state.requestAmount ? "is-ready" : ""}" type="button" data-action="request-next">Next ${icon("arrowUpRight")}</button>
        ` : step === "destination" ? `
          <h1>Where should we send the funds?</h1>
          <button class="account-select wide" type="button">${mercuryMark()}<span><strong>Ops / Payroll</strong><small>$2,023,267.12 / Checking ••1038</small></span>${icon("arrowDown")}</button>
          <footer><button type="button" data-action="request-back">Go back</button><button class="flow-next is-ready" type="button" data-action="request-next">Next ${icon("arrowUpRight")}</button></footer>
        ` : `
          <h1>Review request</h1>
          <article class="review-card"><dl><div><dt>Amount</dt><dd>$${escapeHtml(state.requestAmount || "0.00")}</dd></div><div><dt>Destination</dt><dd>Ops / Payroll ••1038</dd></div><div><dt>Estimated monthly payment</dt><dd>$10,000.00</dd></div></dl></article>
          <footer><button type="button" data-action="request-back">Go back</button><button class="flow-next is-ready" type="button" data-action="submit-request">Submit request</button></footer>
        `}
      </section>
    </main>
  `;
}

function renderSafeFlow(state) {
  const step = state.safeStep || "details";
  return `
    <main class="capital-flow safe-flow">
      ${renderDemoBanner()}
      <button class="flow-close" type="button" data-action="close-flow">${icon("close")}</button>
      <aside>
        <div>${mercuryMark()}<span>Mercury Demo</span></div>
        <nav>
          <span class="${step === "details" ? "is-active" : ""}">SAFE details</span>
          <span class="${step === "company" ? "is-active" : ""}">Company details</span>
          <span class="${step === "investor" ? "is-active" : ""}">Investor details</span>
          <span class="${step === "review" ? "is-active" : ""}">Review</span>
        </nav>
      </aside>
      <section class="safe-step">
        ${step === "details" ? `
          <h1>Create a new SAFE</h1>
          <p>SAFEs are the industry standard for early fundraising in exchange for future equity in your company. Mercury connects and tracks each investment back to each SAFE.</p>
          <h2>Details</h2>
          <div class="safe-form-grid">
            <label><span>Investment amount</span><input value="${escapeHtml(state.safeAmount)}" placeholder="$" data-action="safe-amount-input" /></label>
            <label><span>Investment date</span><input value="May 25, 2026" /></label>
          </div>
          <label><span>Destination account</span><button class="account-select wide" type="button">${mercuryMark()}<span><strong>Ops / Payroll</strong><small>$2,023,267.12 / Checking ••1038</small></span>${icon("arrowDown")}</button></label>
          <label><span>SAFE type <em>Learn More About SAFE Types</em></span><button class="account-select wide" type="button" data-action="safe-type">Post-Money SAFE ${icon("arrowDown")}</button></label>
          <footer><button type="button" data-action="close-flow">Go back</button><button class="flow-next is-ready" type="button" data-action="safe-next">Next ${icon("arrowUpRight")}</button></footer>
          <small class="legal-note">We know you're busy building something great; we've provided this SAFE feature to simplify the process of raising funds.</small>
        ` : step === "company" ? `
          <h1>Company details</h1>
          <label><span>Company legal name</span><input value="Mercury Demo Inc." /></label>
          <label><span>Company address</span><input value="1099 Mission St, San Francisco, CA" /></label>
          <footer><button type="button" data-action="safe-back">Go back</button><button class="flow-next is-ready" type="button" data-action="safe-next">Next ${icon("arrowUpRight")}</button></footer>
        ` : step === "investor" ? `
          <h1>Investor details</h1>
          <label><span>Investor name</span><input value="Logan Roy" /></label>
          <label><span>Investor email</span><input value="logan@roy.co" /></label>
          <footer><button type="button" data-action="safe-back">Go back</button><button class="flow-next is-ready" type="button" data-action="safe-next">Next ${icon("arrowUpRight")}</button></footer>
        ` : `
          <h1>Review SAFE</h1>
          <article class="review-card"><dl><div><dt>Investment</dt><dd>${escapeHtml(state.safeAmount || "$1,000.00")}</dd></div><div><dt>Investor</dt><dd>Logan Roy</dd></div><div><dt>SAFE type</dt><dd>Post-Money SAFE</dd></div></dl></article>
          <footer><button type="button" data-action="safe-back">Go back</button><button class="flow-next is-ready" type="button" data-action="submit-safe">Create SAFE</button></footer>
        `}
      </section>
    </main>
  `;
}

function renderModal(state) {
  if (state.modal === "autopay") return renderAutopayModal();
  if (state.modal === "schedule") return renderScheduleModal();
  if (state.modal === "payment") return renderPaymentModal();
  return "";
}

export function renderCapitalApp(state) {
  if (state.flow === "request") return renderRequestFlow(state);
  if (state.flow === "safe") return renderSafeFlow(state);

  return `
    <main class="mercury-study-shell capital-study-shell">
      ${renderDemoBanner()}
      <div class="mercury-app">
        ${renderSidebar({ active: "Financing", mercuryCapitalNav: true })}
        <section class="mercury-main">
          ${renderUtilityBar(state)}
          <div class="capital-page">
            <header class="capital-title-row">
              <h1>Financing</h1>
              <button class="title-bookmark" type="button" data-action="bookmark-view" aria-label="Bookmark Financing">${icon("bookmark")}</button>
            </header>
            ${renderFinancingTabs(state)}
            ${renderContent(state)}
          </div>
        </section>
      </div>
      ${renderModal(state)}
      ${renderHomeActionPanel(state)}
    </main>
  `;
}
