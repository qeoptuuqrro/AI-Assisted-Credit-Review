import { renderActionBar, renderDemoBanner, renderHomeActionPanel, renderSidebar, renderUtilityBar } from "../../../shared/legacy/mercury/shell.js";
import { renderAccountsCard, renderBalanceCard, renderBillPayCard, renderCreditCard, renderDisputeCard, renderInvoicingCard, renderMoneyMovement } from "./components/dashboard.js";
import { renderHomeTransactionDrawer, renderTransactionsTable } from "./components/transactions.js";
import { renderGuidePanel } from "./components/guide.js";

export function renderHomeApp(data, state) {
  return `
    <main class="mercury-study-shell ${state.privateMode ? "is-private" : ""}">
      ${renderDemoBanner(state)}
      <div class="mercury-app">
        ${renderSidebar({ active: "Home", state })}
        <section class="mercury-main">
          ${renderUtilityBar(state)}
          <div class="dashboard-page">
            <h1>Welcome, Jane</h1>
            ${renderActionBar(state)}
            <section class="dashboard-grid">
              ${renderBalanceCard(state)}
              ${renderAccountsCard(state)}
              <div class="dashboard-module-row">
                ${renderDisputeCard(state)}
                ${renderCreditCard(state)}
                ${renderBillPayCard(state)}
                ${renderInvoicingCard(state)}
              </div>
              ${renderMoneyMovement(state)}
              ${renderTransactionsTable(state)}
            </section>
          </div>
        </section>
      </div>
      ${renderGuidePanel(state)}
      ${renderHomeActionPanel(state)}
      ${renderHomeTransactionDrawer(state)}
    </main>
  `;
}
