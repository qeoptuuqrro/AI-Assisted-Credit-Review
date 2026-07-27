import { renderAccountingApp } from "./renderAccountingApp.js";

const state = {
  activeStatus: "needs",
  activeFilter: "Date",
  openMenu: null,
  openCombo: null,
  selectedRows: [],
  edits: {},
  searchOpen: false,
  customizeOpen: false,
  warningDismissed: false,
  columnCoachOpen: true,
  columnPanelOpen: false,
  settingsOpen: false,
  exportOpen: false,
  toastTimer: null,
};

const app = document.getElementById("accountingApp");
const toast = document.getElementById("accountingToast");

function showToast(title, message) {
  if (!toast) return;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function closeFloating() {
  state.openMenu = null;
  state.openCombo = null;
  state.settingsOpen = false;
  state.exportOpen = false;
  state.columnPanelOpen = false;
}

function routeTo(route) {
  if (window.parent && window.parent !== window) {
    window.parent.location.hash = route;
    return;
  }
  window.location.href = `${route}.html`;
}

function setEdit(rowId, field, value) {
  state.edits[rowId] = {
    ...(state.edits[rowId] || {}),
    [field]: value,
  };
}

function handleAction(element, event) {
  const { action } = element.dataset;
  if (action === "search") {
    closeFloating();
    state.searchOpen = true;
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
    closeFloating();
    state.customizeOpen = !state.customizeOpen;
    render();
    return;
  }
  if (action === "status-tab") {
    state.activeStatus = element.dataset.status;
    state.selectedRows = [];
    closeFloating();
    render();
    return;
  }
  if (action === "toggle-filters") {
    state.openMenu = state.openMenu === "filters" ? null : "filters";
    state.openCombo = null;
    state.settingsOpen = false;
    state.exportOpen = false;
    state.columnPanelOpen = false;
    render();
    return;
  }
  if (action === "toggle-date") {
    state.openMenu = state.openMenu === "date" ? null : "date";
    state.openCombo = null;
    state.settingsOpen = false;
    state.exportOpen = false;
    state.columnPanelOpen = false;
    render();
    return;
  }
  if (action === "filter-tab") {
    state.activeFilter = element.dataset.filter;
    render();
    return;
  }
  if (action === "review-sync-errors") {
    state.activeStatus = "sync";
    state.openMenu = null;
    render();
    showToast("Sync errors", "Showing accounting rows that need attention before export.");
    return;
  }
  if (action === "dismiss-warning") {
    state.warningDismissed = true;
    render();
    return;
  }
  if (action === "close-column-coach") {
    state.columnCoachOpen = false;
    render();
    return;
  }
  if (action === "toggle-columns") {
    state.columnCoachOpen = false;
    state.columnPanelOpen = !state.columnPanelOpen;
    state.openMenu = null;
    state.openCombo = null;
    render();
    return;
  }
  if (action === "toggle-density" || action === "download-view" || action === "column-toggle") {
    showToast("Table preference", `${action.replaceAll("-", " ")} is wired for the accounting view.`);
    return;
  }
  if (action === "toggle-settings") {
    state.columnCoachOpen = false;
    state.settingsOpen = !state.settingsOpen;
    state.exportOpen = false;
    state.openMenu = null;
    state.openCombo = null;
    state.columnPanelOpen = false;
    render();
    return;
  }
  if (action === "toggle-export") {
    state.columnCoachOpen = false;
    state.exportOpen = !state.exportOpen;
    state.settingsOpen = false;
    state.openMenu = null;
    state.openCombo = null;
    state.columnPanelOpen = false;
    render();
    return;
  }
  if (action === "settings-item" || action === "export-item") {
    closeFloating();
    render();
    showToast("Action staged", element.textContent.trim());
    return;
  }
  if (action === "toggle-row") {
    const rowId = element.dataset.row;
    state.selectedRows = state.selectedRows.includes(rowId)
      ? state.selectedRows.filter((id) => id !== rowId)
      : [...state.selectedRows, rowId];
    render();
    return;
  }
  if (action === "toggle-all") {
    const rowIds = [...app.querySelectorAll("[data-row]")].map((node) => node.dataset.row).filter(Boolean);
    const uniqueIds = [...new Set(rowIds)];
    const allSelected = uniqueIds.every((id) => state.selectedRows.includes(id));
    state.selectedRows = allSelected ? [] : uniqueIds;
    render();
    return;
  }
  if (action === "open-combo") {
    const next = { rowId: element.dataset.row, field: element.dataset.field };
    const isSame = state.openCombo?.rowId === next.rowId && state.openCombo?.field === next.field;
    state.openCombo = isSame ? null : next;
    state.openMenu = null;
    state.settingsOpen = false;
    state.exportOpen = false;
    render();
    return;
  }
  if (action === "clear-field") {
    setEdit(element.dataset.row, element.dataset.field, "");
    state.openCombo = null;
    render();
    return;
  }
  if (action === "select-combo") {
    setEdit(element.dataset.row, element.dataset.field, element.dataset.value);
    state.openCombo = null;
    render();
    showToast("Accounting field updated", `${element.dataset.field === "glCode" ? "GL code" : "Category"} set to ${element.dataset.value}.`);
    return;
  }
  if (action === "row-attachment" || action === "row-note") {
    showToast(action === "row-attachment" ? "Attachment action" : "Note action", "The row-level accounting action is wired.");
    return;
  }
  if (action === "bookmark-view") {
    showToast("Bookmarked", "Accounting has been added to your Mercury-style bookmarks.");
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
      if (route && route !== "accounting") routeTo(route);
    });
  });
}

function render() {
  app.innerHTML = renderAccountingApp(state);
  bindEvents();
}

window.addEventListener("click", () => {
  if (state.openMenu || state.openCombo || state.settingsOpen || state.exportOpen || state.columnPanelOpen) {
    closeFloating();
    render();
  }
});

window.addEventListener("keydown", (event) => {
  const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (isCommandSearch) {
    event.preventDefault();
    closeFloating();
    state.searchOpen = true;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
  }
  if (event.key === "Escape") {
    state.searchOpen = false;
    closeFloating();
    render();
  }
});

render();
