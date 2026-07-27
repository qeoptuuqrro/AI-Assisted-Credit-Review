import { dashboardData } from "./data.js";
import { renderHomeApp } from "./renderHomeApp.js";

const state = {
  activeScope: "This week",
  activeTab: "signals",
  selectedWorkId: "sig-peak-rock",
  balanceMode: "graph",
  balanceRange: "Last 30 days",
  activeBalancePoint: null,
  searchOpen: false,
  searchFilter: "All",
  customizeOpen: false,
  activeMenu: null,
  activeAction: null,
  activeHomeTransaction: null,
  homeTransactionTab: "Recent",
  transactionSort: "date",
  transactionSortDirection: "desc",
  disputeIndex: 0,
  movementMonthIndex: 2,
  activeMovementId: null,
  guideOpen: true,
  privateMode: false,
  activeJourney: "startup",
  toastTimer: null,
};

const app = document.getElementById("homeApp");
const toast = document.getElementById("homeToast");

function showToast(title, message) {
  if (!toast) return;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function render() {
  app.innerHTML = renderHomeApp(dashboardData, state);
  bindEvents();
}

function navigateTo(route) {
  if (!route) return false;
  if (window.parent && window.parent !== window) {
    window.parent.location.hash = route;
    return true;
  }
  window.location.href = `${route}.html`;
  return true;
}

function closeOverlays() {
  state.searchOpen = false;
  state.customizeOpen = false;
  state.activeMenu = null;
}

function setActiveBalancePoint(nextIndex) {
  const next = Number.isInteger(nextIndex) ? nextIndex : null;
  if (state.activeBalancePoint === next) return;
  state.activeBalancePoint = next;
  if (next !== null) state.activeMenu = null;
  render();
}

function handleAction(action, element) {
  const cardMenus = ["account-menu", "dispute-menu", "credit-card-menu", "bill-pay-menu", "invoice-menu"];
  if (cardMenus.includes(action)) {
    state.activeMenu = state.activeMenu === action ? null : action;
    state.searchOpen = false;
    state.customizeOpen = false;
    render();
    return;
  }
  const routeActions = {
    "view-accounts": "accounts",
    "view-credit": "cards",
    "view-disputes": "transactions",
    "view-bill-pay": "billPay",
    "view-invoicing": "invoicing",
    "view-money-in": "transactions",
    "view-money-out": "transactions",
    "view-customers": "invoicing",
    "bill-pay-approvals": "payments",
    "bill-pay-settings": "payments",
    "invoice-settings": "invoicing",
    "download-statements": "accounts",
    "download-disputes": "transactions",
    "download-card-statement": "cards",
    "manage-bookmarks": "home",
  };
  if (action === "account-row" || action === "movement-source") {
    state.activeMovementId = element?.dataset.movementId || null;
    navigateTo(element?.dataset.route || routeActions[action]);
    return;
  }
  if (routeActions[action]) {
    navigateTo(routeActions[action]);
    return;
  }
  if (action === "search") {
    state.searchOpen = true;
    state.customizeOpen = false;
    state.activeMenu = null;
    state.searchFilter = "All";
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
    return;
  }
  if (action === "close-search") {
    state.searchOpen = false;
    render();
    return;
  }
  if (action === "customize-experience") {
    state.guideOpen = true;
    closeOverlays();
    render();
    return;
  }
  if (action === "customize") {
    state.customizeOpen = !state.customizeOpen;
    state.searchOpen = false;
    state.activeMenu = null;
    render();
    return;
  }
  if (action === "role-menu") {
    state.activeMenu = state.activeMenu === "role" ? null : "role";
    state.searchOpen = false;
    render();
    return;
  }
  if (action === "workspace") {
    state.activeMenu = state.activeMenu === "workspace" ? null : "workspace";
    state.searchOpen = false;
    state.customizeOpen = false;
    render();
    return;
  }
  if (action === "move-money") {
    state.activeMenu = state.activeMenu === "move" ? null : "move";
    state.searchOpen = false;
    render();
    return;
  }
  if (action === "updates" || action === "profile") {
    state.activeMenu = state.activeMenu === action ? null : action;
    state.searchOpen = false;
    render();
    return;
  }
  if (["send", "transfer", "deposit", "request", "upload bill"].includes(action)) {
    state.activeAction = action;
    closeOverlays();
    render();
    return;
  }
  if (["add-account", "issue-card", "credit-card-pay", "edit-autopay", "pay-bill", "create-invoice", "dispute-detail"].includes(action)) {
    state.activeAction = action;
    closeOverlays();
    render();
    return;
  }
  if (action === "close-action") {
    state.activeAction = null;
    render();
    return;
  }
  if (action === "confirm-action") {
    const completed = state.activeAction;
    state.activeAction = null;
    render();
    showToast("Workflow started", `${completed.replaceAll("-", " ")} is ready to continue.`);
    return;
  }
  if (action === "private") {
    state.privateMode = !state.privateMode;
    render();
    return;
  }
  if (action === "settings") {
    if (window.parent && window.parent !== window) {
      window.parent.location.hash = "settings";
      return;
    }
    showToast("Settings opened", "Settings is available in the platform shell.");
    return;
  }
  if (action === "close-transaction") {
    state.activeHomeTransaction = null;
    render();
    return;
  }
  if (action === "date-range") {
    state.activeBalancePoint = null;
    state.activeMenu = state.activeMenu === "balance-date" ? null : "balance-date";
    state.searchOpen = false;
    state.customizeOpen = false;
    render();
    return;
  }
  if (action === "range-option") {
    state.balanceRange = element?.dataset.rangeLabel || "Last 30 days";
    state.activeMenu = null;
    state.activeBalancePoint = null;
    render();
    return;
  }
  if (action === "balance-table") {
    state.balanceMode = "table";
    state.activeMenu = null;
    state.activeBalancePoint = null;
    render();
    return;
  }
  if (action === "balance-graph") {
    state.balanceMode = "graph";
    state.activeMenu = null;
    state.activeBalancePoint = null;
    render();
    return;
  }
  if (action === "dispute-prev" || action === "dispute-next") {
    const delta = action === "dispute-next" ? 1 : -1;
    state.disputeIndex = Math.max(0, Math.min(8, (state.disputeIndex || 0) + delta));
    state.activeMenu = null;
    render();
    return;
  }
  if (action === "movement-month-prev" || action === "movement-month-next") {
    const delta = action === "movement-month-next" ? 1 : -1;
    state.movementMonthIndex = Math.max(0, Math.min(2, (state.movementMonthIndex ?? 2) + delta));
    state.activeMovementId = null;
    render();
    return;
  }
  if (action === "sort-transactions") {
    const sortKey = element?.dataset.sortKey || "date";
    if (state.transactionSort === sortKey) {
      state.transactionSortDirection = state.transactionSortDirection === "asc" ? "desc" : "asc";
    } else {
      state.transactionSort = sortKey;
      state.transactionSortDirection = sortKey === "amount" ? "desc" : "asc";
    }
    render();
    return;
  }
  if (action === "open-guide") {
    state.guideOpen = true;
    render();
    return;
  }
  if (action === "close-guide") {
    state.guideOpen = false;
    render();
    return;
  }
  if (action === "transaction-row") {
    showToast("Transaction selected", "Open the row drawer to review details.");
    return;
  }
  if (action === "command-option") {
    closeOverlays();
    render();
    showToast("Command opened", "Mercury-style command navigation is wired for the prototype.");
    return;
  }
  if (action === "guide-item") {
    navigateTo(element?.dataset.route || "home");
    return;
  }
  if (action === "customize-item") {
    showToast("Dashboard preference", "This control mirrors Mercury's compact customization menu.");
    return;
  }
  if (action === "view-employee") {
    state.activeMenu = null;
    render();
    showToast("Role switched", "Viewing the demo as Employee.");
    return;
  }
  if (action) {
    showToast("Interaction staged", `${action.replaceAll("-", " ")} is wired for the UI study.`);
  }
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const action = element.dataset.action;
      if (action === "close-search" && event.target !== element) return;
      handleAction(action, element);
    });
  });

  app.querySelectorAll("[data-balance-point-index]").forEach((zone) => {
    zone.addEventListener("pointerenter", () => {
      setActiveBalancePoint(Number(zone.dataset.balancePointIndex));
    });
  });

  app.querySelectorAll("[data-balance-chart]").forEach((chart) => {
    chart.addEventListener("pointerleave", () => {
      setActiveBalancePoint(null);
    });
  });

  app.querySelectorAll("[data-journey]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeJourney = button.dataset.journey;
      render();
    });
  });

  app.querySelectorAll("[data-transaction-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.homeTransactionTab = button.dataset.transactionTab;
      state.activeHomeTransaction = null;
      render();
    });
  });

  app.querySelectorAll("[data-search-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.searchFilter = button.dataset.searchFilter || "All";
      render();
      requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
    });
  });

  app.querySelectorAll("[data-home-transaction]").forEach((row) => {
    row.addEventListener("click", () => {
      state.activeHomeTransaction = row.dataset.homeTransaction;
      render();
    });
  });

  app.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const routeMap = {
        Home: "home",
        Tasks: "tasks",
        Accounts: "accounts",
        Insights: "insights",
        Accounting: "accounting",
        Cards: "cards",
        Payments: "payments",
        Invoicing: "invoicing",
        "Bill Pay": "billPay",
        Financing: "capital",
        Transactions: "transactions",
        Reimbursements: "reimbursements",
        settings: "settings",
      };
      const route = routeMap[button.dataset.nav];
      if (route) {
        if (window.parent && window.parent !== window) {
          window.parent.location.hash = route;
          return;
        }
        window.location.href = `${route}.html`;
        return;
      }
      handleAction(`nav-${button.dataset.nav.toLowerCase().replaceAll(" ", "-")}`);
    });
  });

  app.querySelectorAll("tr[data-action]").forEach((row) => {
    row.addEventListener("click", () => handleAction(row.dataset.action));
  });
}

window.addEventListener("keydown", (event) => {
  const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (isCommandSearch) {
    event.preventDefault();
    state.searchOpen = true;
    state.customizeOpen = false;
    state.searchFilter = "All";
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
  }
  if (event.key === "Escape" && (state.searchOpen || state.customizeOpen || state.activeMenu || state.activeAction || state.activeHomeTransaction)) {
    closeOverlays();
    state.activeAction = null;
    state.activeHomeTransaction = null;
    render();
  }
});

render();
