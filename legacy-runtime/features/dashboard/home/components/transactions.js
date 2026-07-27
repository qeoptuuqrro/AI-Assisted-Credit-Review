import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml, monoAmount } from "../../../../shared/utils/html.js";
import { avatar, mercuryMark } from "../../../../shared/legacy/mercury/brand.js";

const rows = [
  ["stefanie", "May 26", "Stefanie Katz", "-$1,234.56", "AP", "Check Payment", "SK", ""],
  ["capital", "May 25", "Mercury Working Capital", "-$2,200.00", "Ops / Payroll", "Working Capital Loan Payment", "mark", ""],
  ["nasa", "May 25", "Payment from NASA", "$419.00", "AR", "Request or Invoice Payment", "P", "Failed"],
  ["acme", "May 25", "Payment from Acme Corp", "$200.00", "AR", "Request or Invoice Payment", "P", ""],
  ["to-ops", "May 25", "To Ops / Payroll", "-$55,810.16", "AR", "Transfer", "transfer", ""],
  ["from-ar", "May 25", "From AR", "$55,810.16", "Ops / Payroll", "Transfer", "transfer", ""],
  ["lilys", "May 25", "Lily's Eatery", "$0.93", "Ops / Payroll", "Alice C. **1234", "LE", ""],
  ["deli", "May 25", "Deli 77", "$63.53", "Credit account", "Mary M. **0332", "D7", ""],
  ["deli-ops", "May 25", "Deli 77", "$214.06", "Ops / Payroll", "Jane B. **6112", "D7", ""],
  ["office", "May 25", "Office Stop Co.", "-$287.89", "Ops / Payroll", "Jessica A. **9914", "OS", ""],
];

export function renderTransactionsTable(state) {
  const active = state.homeTransactionTab || "Recent";
  const visibleRows = active === "Monthly money in" ? rows.filter((row) => row[3].startsWith("$")) : active === "Monthly money out" || active === "Operating expenses" ? rows.filter((row) => row[3].startsWith("-")) : rows;
  const sortKey = state.transactionSort || "date";
  const sortDirection = state.transactionSortDirection || "desc";
  const sortedRows = [...visibleRows].sort((a, b) => {
    const map = { date: 1, name: 2, amount: 3, account: 4 };
    const index = map[sortKey] ?? 1;
    const normalize = (row) => {
      if (sortKey === "amount") return Number(row[index].replace(/[$,]/g, ""));
      return row[index].toLowerCase();
    };
    const aValue = normalize(a);
    const bValue = normalize(b);
    const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return sortDirection === "asc" ? result : -result;
  });

  const tabs = ["Recent", "My transactions", "Monthly money in", "Monthly money out", "Operating expenses"];
  const sortLabel = (key) => state.transactionSort === key ? (sortDirection === "asc" ? "&uarr;" : "&darr;") : "";

  return `
    <section class="transactions-section">
      <div class="section-title-row">
        <h2>Transactions</h2>
        <button class="view-link" type="button" data-nav="Transactions">View all &rsaquo;</button>
      </div>
      <div class="transaction-tabs">
        ${tabs.map((tab) => `<button class="${active === tab ? "is-active" : ""}" type="button" data-transaction-tab="${escapeHtml(tab)}">${escapeHtml(tab)}</button>`).join("")}
      </div>
      <table class="transactions-table">
        <thead>
          <tr>
            <th><button type="button" data-action="sort-transactions" data-sort-key="date">Date ${sortLabel("date")}</button></th>
            <th><button type="button" data-action="sort-transactions" data-sort-key="name">To/From ${sortLabel("name")}</button></th>
            <th><button type="button" data-action="sort-transactions" data-sort-key="amount">Amount ${sortLabel("amount")}</button></th>
            <th><button type="button" data-action="sort-transactions" data-sort-key="account">Account ${sortLabel("account")}</button></th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          ${sortedRows.map(([id, date, name, amount, account, method, mark, status]) => `
            <tr data-home-transaction="${escapeHtml(id)}" class="${state.activeHomeTransaction === id ? "is-selected" : ""}">
              <td>${escapeHtml(date)}</td>
              <td>
                <span class="payee">
                  ${mark === "mark" ? mercuryMark() : mark === "transfer" ? icon("transfer") : avatar(mark, "soft")}
                  <span>${escapeHtml(name)}</span>
                  ${status ? `<em>${escapeHtml(status)}</em>` : ""}
                </span>
              </td>
              <td>${monoAmount(amount, !amount.startsWith("-"))}</td>
              <td>${escapeHtml(account)}</td>
              <td><span class="method-cell">${method.includes("Card") || method.includes("Alice") || method.includes("Mary") || method.includes("Jessica") ? icon("card") : icon("transfer")}${escapeHtml(method)}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

export function renderHomeTransactionDrawer(state) {
  if (!state.activeHomeTransaction) return "";
  const row = rows.find((item) => item[0] === state.activeHomeTransaction);
  if (!row) return "";
  const [, date, name, amount, account, method, mark, status] = row;
  return `
    <div class="drawer-scrim" data-action="close-transaction"></div>
    <aside class="transaction-drawer" aria-label="Transaction detail">
      <header>
        <span>Transaction details</span>
        <button type="button" data-action="close-transaction" aria-label="Close">${icon("close")}</button>
      </header>
      <div class="transaction-drawer-main">
        <div class="drawer-payee">
          ${mark === "mark" ? mercuryMark() : mark === "transfer" ? icon("transfer") : avatar(mark, "soft")}
          <div>
            <h2>${escapeHtml(name)}</h2>
            <p>${escapeHtml(method)}</p>
          </div>
        </div>
        <strong class="drawer-amount">${monoAmount(amount, !amount.startsWith("-"))}</strong>
        <dl>
          <div><dt>Date</dt><dd>${escapeHtml(date)}</dd></div>
          <div><dt>Account</dt><dd>${escapeHtml(account)}</dd></div>
          <div><dt>Status</dt><dd>${status ? escapeHtml(status) : "Posted"}</dd></div>
          <div><dt>Category</dt><dd>Business expense</dd></div>
        </dl>
      </div>
      <footer>
        <button type="button" data-action="receipt">Match receipt</button>
        <button class="is-primary" type="button" data-action="close-transaction">Done</button>
      </footer>
    </aside>
  `;
}
