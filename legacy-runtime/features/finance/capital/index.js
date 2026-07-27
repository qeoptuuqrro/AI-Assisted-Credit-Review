import { renderCapitalApp } from "./renderCapitalApp.js";

const state = {
  activeTab: "home",
  flow: null,
  modal: null,
  searchOpen: false,
  customizeOpen: false,
  activeMenu: null,
  activeAction: null,
  privateMode: false,
  requestStep: "amount",
  requestAmount: "",
  safeStep: "details",
  safeAmount: "",
  toastTimer: null,
};

const app = document.getElementById("capitalApp");
const toast = document.getElementById("capitalToast");

function showToast(title, message) {
  if (!toast) return;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function routeTo(route) {
  if (window.parent && window.parent !== window) {
    window.parent.location.hash = route;
    return;
  }
  window.location.href = `${route}.html`;
}

function closeOverlays() {
  state.searchOpen = false;
  state.customizeOpen = false;
  state.activeMenu = null;
  state.activeAction = null;
  state.modal = null;
}

function stepForward(sequence, current) {
  const index = sequence.indexOf(current);
  return sequence[Math.min(sequence.length - 1, index + 1)];
}

function stepBack(sequence, current) {
  const index = sequence.indexOf(current);
  return sequence[Math.max(0, index - 1)];
}

function handleAction(element, event) {
  const { action } = element.dataset;
  if (action === "search") {
    state.searchOpen = true;
    state.customizeOpen = false;
    state.activeMenu = null;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
    return;
  }
  if (action === "close-search") {
    if (event.target !== element) return;
    state.searchOpen = false;
    render();
    return;
  }
  if (action === "customize" || action === "customize-experience") {
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
    state.activeAction = action;
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
  if (action === "command-option") {
    closeOverlays();
    render();
    showToast("Command opened", "Mercury-style command navigation is wired for Financing.");
    return;
  }
  if (action === "view-employee") {
    state.activeMenu = null;
    render();
    showToast("Role switched", "Viewing the demo as Employee.");
    return;
  }
  if (action === "customize-item") {
    showToast("Dashboard preference", "This control mirrors Mercury's compact customization menu.");
    return;
  }
  if (action === "capital-tab") {
    state.activeTab = element.dataset.tab;
    state.modal = null;
    render();
    return;
  }
  if (action === "go-working") {
    state.activeTab = "working";
    render();
    return;
  }
  if (action === "go-venture") {
    state.activeTab = "venture";
    render();
    return;
  }
  if (action === "start-safe") {
    state.flow = "safe";
    state.safeStep = "details";
    render();
    return;
  }
  if (action === "request-funds") {
    state.flow = "request";
    state.requestStep = "amount";
    render();
    requestAnimationFrame(() => app.querySelector(".money-input input")?.focus());
    return;
  }
  if (action === "close-flow") {
    state.flow = null;
    render();
    return;
  }
  if (action === "request-next") {
    state.requestStep = stepForward(["amount", "destination", "review"], state.requestStep);
    render();
    return;
  }
  if (action === "request-back") {
    state.requestStep = stepBack(["amount", "destination", "review"], state.requestStep);
    render();
    return;
  }
  if (action === "submit-request") {
    state.flow = null;
    state.activeTab = "venture";
    render();
    showToast("Request submitted", "Your Mercury-style venture debt request is ready for review.");
    return;
  }
  if (action === "safe-next") {
    state.safeStep = stepForward(["details", "company", "investor", "review"], state.safeStep);
    render();
    return;
  }
  if (action === "safe-back") {
    state.safeStep = stepBack(["details", "company", "investor", "review"], state.safeStep);
    render();
    return;
  }
  if (action === "submit-safe") {
    state.flow = null;
    state.activeTab = "safes";
    render();
    showToast("SAFE created", "The new SAFE draft has been added to the financing table.");
    return;
  }
  if (action === "edit-autopay") {
    state.modal = "autopay";
    render();
    return;
  }
  if (action === "view-schedule") {
    state.modal = "schedule";
    render();
    return;
  }
  if (action === "view-more") {
    state.modal = "payment";
    render();
    return;
  }
  if (action === "close-modal") {
    state.modal = null;
    render();
    return;
  }
  if (action === "confirm-autopay") {
    state.modal = null;
    render();
    showToast("Autopay updated", "Primary and backup accounts are saved for the prototype.");
    return;
  }
  if (action === "download-agreement" || action === "export-schedule") {
    showToast("Download prepared", action === "export-schedule" ? "Repayment schedule export is staged." : "Loan agreement download is staged.");
    return;
  }
  if (action === "monthly-reporting") {
    showToast("Monthly reporting", "Your reporting package is up to date.");
    return;
  }
  if (action === "safe-row") {
    showToast("SAFE selected", "Investor detail drawer pattern is ready.");
    return;
  }
  if (action === "bookmark-view") {
    showToast("Bookmarked", "Financing has been added to your Mercury-style bookmarks.");
    return;
  }
  if (action) {
    showToast("Interaction staged", `${action.replaceAll("-", " ")} is wired.`);
  }
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      handleAction(element, event);
    });
  });

  app.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const routeMap = {
        Home: "home",
        Insights: "insights",
        Accounting: "accounting",
        Financing: "capital",
        Transactions: "transactions",
        Reimbursements: "reimbursements",
      };
      const route = routeMap[button.dataset.nav];
      if (route && route !== "capital") routeTo(route);
    });
  });

  const amountInput = app.querySelector("[data-action='amount-input']");
  amountInput?.addEventListener("input", (event) => {
    state.requestAmount = event.target.value;
    app.querySelector(".flow-next")?.classList.toggle("is-ready", Boolean(state.requestAmount));
  });

  const safeAmountInput = app.querySelector("[data-action='safe-amount-input']");
  safeAmountInput?.addEventListener("input", (event) => {
    state.safeAmount = event.target.value;
  });
}

function render() {
  app.innerHTML = renderCapitalApp(state);
  bindEvents();
}

window.addEventListener("keydown", (event) => {
  const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (isCommandSearch && !state.flow) {
    event.preventDefault();
    state.searchOpen = true;
    state.customizeOpen = false;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
  }
  if (event.key === "Escape") {
    if (state.flow) {
      state.flow = null;
    }
    closeOverlays();
    render();
  }
});

window.addEventListener("click", () => {
  if (state.activeMenu || state.customizeOpen) {
    state.activeMenu = null;
    state.customizeOpen = false;
    render();
  }
});

render();
