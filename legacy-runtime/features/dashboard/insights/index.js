import { insightsData } from "./data.js";
import { renderInsightsApp } from "./renderInsightsApp.js";

const state = {
  activeRoute: "insights",
  activeTab: "overview",
  rangeIndex: 2,
  moneyInGroup: "Source",
  moneyOutGroup: "Recipient",
  searchOpen: false,
  activeMenu: null,
  activeAction: null,
  privateMode: false,
  coachmarkOpen: true,
  categoryTarget: null,
  categoryLeft: 0,
  categoryTop: 0,
  categoryWidth: 184,
  transactionFilterMenu: null,
  filterLeft: 0,
  filterTop: 0,
  activeDataView: "All transactions",
  activeTransactionId: null,
  transactionCategories: {},
  transactionQuery: "",
  selectedTransactions: new Set(),
  isScrubbing: false,
  scrubChanged: false,
  scrubTimer: null,
  rangeFrame: null,
  pendingRangeIndex: null,
  toastTimer: null,
};

const app = document.getElementById("insightsApp");
const toast = document.getElementById("insightsToast");

function showToast(title, message) {
  if (!toast) return;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function navigate(route) {
  const routeFiles = {
    home: "home.html",
    tasks: "tasks.html",
    accounts: "accounts.html",
    cards: "cards.html",
    payments: "payments.html",
    invoicing: "invoicing.html",
    reimbursements: "reimbursements.html",
    "bill-pay": "bill-pay.html",
    settings: "settings.html",
  };
  if (route in routeFiles) {
    if (window.parent && window.parent !== window) {
      window.parent.location.hash = route === "bill-pay" ? "billPay" : route;
      return;
    }
    window.location.href = routeFiles[route];
    return;
  }
  if (route === "transactions" || route === "insights" || route === "accounting") {
    state.activeRoute = route;
    state.categoryTarget = null;
    render();
    if (route === "accounting") showToast("Accounting preview", "The Mercury-style accounting route is staged in this shell.");
    return;
  }
  showToast("Navigation preview", `${route.replaceAll("-", " ")} is present in the Mercury-style shell.`);
}

function render() {
  app.innerHTML = renderInsightsApp(insightsData, state);
  bindEvents();
}

function closeMenus() {
  state.searchOpen = false;
  state.activeMenu = null;
  state.transactionFilterMenu = null;
  state.categoryTarget = null;
}

function setRangeIndex(nextIndex, options = {}) {
  const { toast: shouldToast = true } = options;
  const maxIndex = insightsData.rangeWindows.length - 1;
  const clamped = Math.max(0, Math.min(maxIndex, Math.round(nextIndex)));
  if (!Number.isFinite(clamped) || clamped === state.rangeIndex) return false;
  state.rangeIndex = clamped;
  const range = insightsData.rangeWindows[state.rangeIndex] || insightsData.rangeWindows[maxIndex];
  render();
  if (shouldToast) showToast("Date range updated", range.label);
  state.scrubChanged = true;
  return true;
}

function scheduleRangeIndex(nextIndex) {
  state.pendingRangeIndex = nextIndex;
  state.isScrubbing = true;
  if (state.rangeFrame) return;
  state.rangeFrame = window.requestAnimationFrame(() => {
    state.rangeFrame = null;
    setRangeIndex(state.pendingRangeIndex, { toast: false });
  });
}

function finishScrub() {
  window.clearTimeout(state.scrubTimer);
  state.scrubTimer = window.setTimeout(() => {
    if (!state.isScrubbing) return;
    state.isScrubbing = false;
    render();
    if (state.scrubChanged) {
      const maxIndex = insightsData.rangeWindows.length - 1;
      const range = insightsData.rangeWindows[state.rangeIndex] || insightsData.rangeWindows[maxIndex];
      showToast("Date range updated", range.label);
    }
    state.scrubChanged = false;
  }, 180);
}

function rangeIndexFromPointer(event, track) {
  const rect = track.getBoundingClientRect();
  const maxIndex = insightsData.rangeWindows.length - 1;
  const ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
  return Math.max(0, Math.min(maxIndex, Math.round(ratio * maxIndex)));
}

function handleAction(action) {
  if (action === "search") {
    state.searchOpen = true;
    state.activeMenu = null;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
    return;
  }
  if (action === "customize-experience" || action === "guide") {
    state.coachmarkOpen = true;
    closeMenus();
    render();
    return;
  }
  if (action === "close-search") {
    state.searchOpen = false;
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
  if (["send", "transfer", "deposit", "request", "upload bill", "match receipts"].includes(action)) {
    state.activeAction = action;
    closeMenus();
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
  if (action === "view-employee") {
    state.activeMenu = null;
    render();
    showToast("Role switched", "Viewing the demo as Employee.");
    return;
  }
  if (action === "command-option") {
    state.searchOpen = false;
    render();
    showToast("Command opened", "The Insights command result is ready for the prototype.");
    return;
  }
  if (action === "compare") {
    showToast("Compare unavailable", "Mercury disables comparison for the current demo range.");
    return;
  }
  if (action === "tx-close-coachmark") {
    state.coachmarkOpen = false;
    render();
    return;
  }
  if (action === "tx-close-detail") {
    state.activeTransactionId = null;
    render();
    return;
  }
  if (action === "tx-select-all") {
    const ids = Array.from(app.querySelectorAll("[data-tx-row]")).map((row) => row.dataset.txRow);
    const allSelected = ids.length > 0 && ids.every((id) => state.selectedTransactions.has(id));
    ids.forEach((id) => {
      if (allSelected) state.selectedTransactions.delete(id);
      else state.selectedTransactions.add(id);
    });
    render();
    return;
  }
  if (action === "tx-clear-selection") {
    state.selectedTransactions.clear();
    render();
    return;
  }
  if (action === "tx-mark-reviewed") {
    const count = state.selectedTransactions.size;
    state.selectedTransactions.clear();
    render();
    showToast("Transactions reviewed", `${count} selected transaction${count === 1 ? "" : "s"} marked reviewed.`);
    return;
  }
  if (action === "tx-keyword") {
    // Falls through to the filter menu behavior below.
  }
  if (action === "tx-match-receipts") {
    state.activeAction = "match receipts";
    closeMenus();
    render();
    return;
  }
  if (action?.startsWith("tx-")) {
    const trigger = app.querySelector(`[data-action="${action}"]`);
    if (trigger && !["tx-close-coachmark", "tx-select-all", "tx-clear-selection", "tx-mark-reviewed", "tx-view-categories", "tx-map"].includes(action)) {
      const rect = trigger.getBoundingClientRect();
      state.transactionFilterMenu = state.transactionFilterMenu === action ? null : action;
      state.filterLeft = Math.max(12, Math.min(rect.left, window.innerWidth - 270));
      state.filterTop = Math.max(12, rect.bottom + 6);
      state.categoryTarget = null;
      render();
      return;
    }
      const messages = {
      "tx-export": ["Export started", "All transactions are being exported."],
      "tx-data-views": ["Data views", "Saved transaction views are available in this prototype."],
      "tx-filters": ["Filters", "Transaction filters are ready for the Mercury-style flow."],
      "tx-date": ["Date filter", "Date range control opened."],
      "tx-amount": ["Amount filter", "Amount filter opened."],
      "tx-columns": ["Columns", "Column preferences opened."],
      "tx-sort": ["Sort", "Sort options opened."],
      "tx-display": ["Display settings", "Display controls opened."],
      "tx-view-categories": ["Categories", "Category automation guidance opened."],
      "tx-map": ["Guide opened", "Mercury help guide opened."],
    };
    const [title, message] = messages[action] || ["Interaction staged", `${action.replaceAll("-", " ")} is wired.`];
    showToast(title, message);
    return;
  }
  if (action === "copy-section") {
    showToast("Section copied", "The generated trend note has been staged for sharing.");
    return;
  }
  if (action === "helpful" || action === "not-helpful") {
    showToast("Feedback captured", "This mirrors the generated-insight feedback control.");
    return;
  }
  if (action === "table-row") {
    showToast("Transactions filtered", "This row would drill into the matching transaction set.");
    return;
  }
  if (action) {
    showToast("Interaction staged", `${action.replaceAll("-", " ")} is wired for the Insights study.`);
  }
}

function bindEvents() {
  const txSearch = app.querySelector(".tx-search-input");
  if (txSearch) {
    txSearch.addEventListener("input", (event) => {
      state.transactionQuery = event.target.value;
      render();
      requestAnimationFrame(() => {
        const nextInput = app.querySelector(".tx-search-input");
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
    });
  }

  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.tagName === "A") event.preventDefault();
      if (element.dataset.action === "close-search" && event.target !== element) return;
      handleAction(element.dataset.action);
    });
  });

  app.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => navigate(element.dataset.route));
  });

  app.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      render();
      showToast("View switched", `${button.textContent.trim()} is selected.`);
    });
  });

  app.querySelectorAll("[data-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const [section, value] = button.dataset.group.split(":");
      if (section === "in") state.moneyInGroup = value;
      if (section === "out") state.moneyOutGroup = value;
      render();
    });
  });

  const rangeSlider = app.querySelector("[data-range-slider]");
  rangeSlider?.addEventListener("input", (event) => {
    scheduleRangeIndex(Number(event.target.value));
    finishScrub();
  });
  rangeSlider?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setRangeIndex(state.rangeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  const rangeTrack = app.querySelector("[data-range-track]");
  if (rangeTrack) {
    const updateFromPointer = (event) => {
      if (event.buttons === 0 && event.type === "pointermove") return;
      scheduleRangeIndex(rangeIndexFromPointer(event, rangeTrack));
    };
    rangeTrack.addEventListener("pointerdown", (event) => {
      rangeTrack.setPointerCapture?.(event.pointerId);
      updateFromPointer(event);
    });
    rangeTrack.addEventListener("pointermove", updateFromPointer);
    rangeTrack.addEventListener("pointerup", finishScrub);
    rangeTrack.addEventListener("pointercancel", finishScrub);
    rangeTrack.addEventListener("lostpointercapture", finishScrub);
  }

  app.querySelectorAll("[data-tx-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.txSelect;
      state.selectedTransactions.has(id) ? state.selectedTransactions.delete(id) : state.selectedTransactions.add(id);
      render();
    });
  });

  app.querySelectorAll("[data-tx-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const rect = button.getBoundingClientRect();
      const menuHeight = 282;
      const placeAbove = window.innerHeight - rect.bottom < menuHeight;
      state.categoryTarget = button.dataset.txCategory;
      state.categoryLeft = rect.left;
      state.categoryTop = placeAbove ? rect.top - menuHeight - 4 : rect.bottom - 1;
      state.categoryWidth = rect.width;
      state.coachmarkOpen = false;
      state.transactionFilterMenu = null;
      render();
    });
  });

  app.querySelectorAll("[data-tx-category-option]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.categoryTarget) return;
      state.transactionCategories[state.categoryTarget] = button.dataset.txCategoryOption;
      const label = button.dataset.txCategoryOption;
      state.categoryTarget = null;
      render();
      showToast("Category updated", `${label} has been applied.`);
    });
  });

  app.querySelectorAll("[data-tx-filter-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const label = button.dataset.txFilterOption;
      if (state.transactionFilterMenu === "tx-data-views") {
        state.activeDataView = label.replace("+ ", "");
      }
      state.transactionFilterMenu = null;
      render();
      showToast("Filter applied", label);
    });
  });

  app.querySelectorAll("[data-tx-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.activeTransactionId = row.dataset.txRow;
      render();
    });
  });
}

window.addEventListener("keydown", (event) => {
  const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (isCommandSearch) {
    event.preventDefault();
    state.searchOpen = true;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
  }
  if (event.key === "Escape" && (state.searchOpen || state.activeMenu || state.activeAction || state.transactionFilterMenu || state.categoryTarget || state.activeTransactionId)) {
    state.searchOpen = false;
    state.activeMenu = null;
    state.activeAction = null;
    state.transactionFilterMenu = null;
    state.categoryTarget = null;
    state.activeTransactionId = null;
    render();
  }
});

window.addEventListener("pointerup", () => {
  if (state.isScrubbing) finishScrub();
});

window.addEventListener("pointercancel", () => {
  if (state.isScrubbing) finishScrub();
});

render();
