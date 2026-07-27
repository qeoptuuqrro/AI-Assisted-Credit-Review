import { renderDashboardActionPanel, renderDemoBanner, renderSidebar, renderUtilityBar } from "./components/shell.js";
import { renderBreakdownTable, renderChart, renderControls, renderMetrics, renderPageHeader, renderTimeline, renderTrendNotes } from "./components/overview.js";
import { renderGuideLauncher } from "./components/guide.js";
import { renderTransactionDrawer, renderTransactionsPage } from "./components/transactions.js";

function activeRange(data, state) {
  return data.rangeWindows[state.rangeIndex] || data.rangeWindows[data.rangeWindows.length - 1];
}

function metricsForTab(data, state) {
  const range = activeRange(data, state);
  if (state.activeTab === "money-in") {
    return [
      { label: "Money in", value: range.summary.moneyIn, featured: true },
      { label: "Top source", value: range.summary.topSource },
      { label: "Customer receipts", value: range.summary.customerReceipts },
    ];
  }
  if (state.activeTab === "money-out") {
    return [
      { label: "Money out", value: range.summary.moneyOut, featured: true },
      { label: "Top recipient", value: range.summary.topRecipient },
      { label: "Card spend", value: range.summary.cardSpend },
    ];
  }
  return [
    { label: "Net cashflow", value: range.summary.net, featured: true },
    { label: "Money in", value: range.summary.moneyIn },
    { label: "Money out", value: range.summary.moneyOut },
  ];
}

function notesForTab(data, activeTab) {
  if (activeTab === "money-in") return data.trendNotes.filter((note) => note.title.includes("Money in"));
  if (activeTab === "money-out") return data.trendNotes.filter((note) => note.title.includes("Money out"));
  return data.trendNotes;
}

function renderBreakdownsForTab(data, state) {
  const range = activeRange(data, state);
  const moneyIn = { ...data.moneyIn, total: range.summary.moneyIn };
  const moneyOut = { ...data.moneyOut, total: range.summary.moneyOut };
  if (state.activeTab === "money-in") {
    return `<section class="breakdown-grid is-focused">${renderBreakdownTable(moneyIn, state.moneyInGroup, "in")}</section>`;
  }
  if (state.activeTab === "money-out") {
    return `<section class="breakdown-grid is-focused">${renderBreakdownTable(moneyOut, state.moneyOutGroup, "out")}</section>`;
  }
  return `
    <section class="breakdown-grid">
      ${renderBreakdownTable(moneyIn, state.moneyInGroup, "in")}
      ${renderBreakdownTable(moneyOut, state.moneyOutGroup, "out")}
    </section>
  `;
}

export function renderInsightsApp(data, state) {
  const range = activeRange(data, state);
  return `
    <main class="mercury-study-shell insights-study-shell ${state.privateMode ? "is-private" : ""} ${state.isScrubbing ? "is-scrubbing" : ""}">
      ${renderDemoBanner(state)}
      <div class="mercury-app">
        ${renderSidebar(state.activeRoute)}
        <section class="mercury-main insights-main">
          ${renderUtilityBar(state)}
          ${state.activeRoute === "transactions" ? renderTransactionsPage(state) : `
            <div class="insights-page">
              ${renderPageHeader()}
              ${renderControls(data, state)}
              ${renderTimeline(data.months, data.rangeWindows, state.rangeIndex)}
              ${renderMetrics(metricsForTab(data, state))}
              ${renderChart(range)}
              ${renderTrendNotes(notesForTab(data, state.activeTab))}
              ${renderBreakdownsForTab(data, state)}
            </div>
          `}
        </section>
      </div>
      ${renderGuideLauncher()}
      ${renderDashboardActionPanel(state)}
      ${renderTransactionDrawer(state)}
    </main>
  `;
}
