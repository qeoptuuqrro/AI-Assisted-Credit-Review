import { expenseRequests } from "./data.js";
import { getVisibleRows, renderReimbursementsApp } from "./renderReimbursementsApp.js";

const expenses = expenseRequests.map((request) => ({ ...request }));

const state = {
  tab: "all",
  filter: "all",
  query: "",
  selected: new Set(),
  detailId: null,
  settingsOpen: false,
  submitOpen: false,
  toast: null,
  toastTimer: null,
};

function render() {
  document.body.innerHTML = renderReimbursementsApp(expenses, state);
  bindEvents();
}

function showToast(title, message) {
  state.toast = { title, message };
  render();
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    state.toast = null;
    render();
  }, 2200);
}

function setStatus(ids, status, title, message) {
  expenses.forEach((expense) => {
    if (ids.has(expense.id)) expense.status = status;
  });
  state.selected.clear();
  state.detailId = null;
  showToast(title, message);
}

function addExpenseFromDialog() {
  const merchant = document.querySelector('[data-submit-field="merchant"]')?.value.trim() || "New merchant";
  const amountValue = document.querySelector('[data-submit-field="amount"]')?.value || "$0";
  const category = document.querySelector('[data-submit-field="category"]')?.value || "Meals";
  const memo = document.querySelector('[data-submit-field="memo"]')?.value.trim() || "Submitted reimbursement";
  const amount = Number(amountValue.replace(/[^0-9.]/g, "")) || 0;
  const id = `exp-${Date.now()}`;

  expenses.unshift({
    id,
    date: "May 25",
    submittedAt: "Just now",
    member: "Jane Smith",
    role: "Analyst",
    initials: "JS",
    status: "pending",
    amount,
    merchant,
    memo,
    category,
    receipt: "attached",
    policy: "inside",
    policyNote: "New submission ready for review",
    source: "Manual upload",
    reviewer: "Jane Smith",
  });

  state.tab = "mine";
  state.filter = "pending";
  state.submitOpen = false;
  state.detailId = id;
  showToast("Expense submitted", `${merchant} was added to your review queue.`);
}

function handleAction(action) {
  if (action === "settings") {
    state.settingsOpen = !state.settingsOpen;
    state.submitOpen = false;
    render();
    return;
  }
  if (action === "settings-item") {
    showToast("Setting selected", "This opens the policy configuration flow.");
    return;
  }
  if (action === "open-submit") {
    state.submitOpen = true;
    state.settingsOpen = false;
    render();
    requestAnimationFrame(() => document.querySelector('[data-submit-field="merchant"]')?.focus());
    return;
  }
  if (action === "close-submit") {
    state.submitOpen = false;
    render();
    return;
  }
  if (action === "submit-expense") {
    addExpenseFromDialog();
    return;
  }
  if (action === "upload-receipt") {
    showToast("Receipt ready", "Receipt upload is staged for the prototype.");
    return;
  }
  if (action === "export") {
    showToast("Export started", "All visible reimbursement requests are being exported.");
    return;
  }
  if (action === "policy-view") {
    state.filter = "policy";
    render();
    return;
  }
  if (action === "select-visible") {
    const visibleRows = getVisibleRows(expenses, state);
    const allSelected = visibleRows.length > 0 && visibleRows.every((row) => state.selected.has(row.id));
    state.detailId = null;
    visibleRows.forEach((row) => {
      if (allSelected) state.selected.delete(row.id);
      else state.selected.add(row.id);
    });
    render();
    return;
  }
  if (action === "bulk-approve") {
    if (!state.selected.size) return;
    setStatus(state.selected, "payment", "Requests approved", "Selected expenses moved to the payment queue.");
    return;
  }
  if (action === "bulk-decline") {
    if (!state.selected.size) return;
    setStatus(state.selected, "declined", "Requests declined", "Selected expenses were marked declined.");
    return;
  }
  if (action === "bulk-request") {
    if (!state.selected.size) return;
    setStatus(state.selected, "details", "Details requested", "Team members will be asked for missing context.");
    return;
  }
  if (action === "close-detail") {
    state.detailId = null;
    render();
    return;
  }
  if (action === "approve-detail") {
    if (!state.detailId) return;
    setStatus(new Set([state.detailId]), "payment", "Request approved", "Expense moved to the next payment run.");
    return;
  }
  if (action === "decline-detail") {
    if (!state.detailId) return;
    setStatus(new Set([state.detailId]), "declined", "Request declined", "The team member will see the decline reason.");
    return;
  }
  if (action === "request-detail") {
    if (!state.detailId) return;
    setStatus(new Set([state.detailId]), "details", "Details requested", "A request for more information was sent.");
    return;
  }
  if (action === "view-receipt") {
    showToast("Receipt preview", "The receipt preview interaction is wired.");
  }
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      handleAction(button.dataset.action);
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      state.selected.clear();
      state.detailId = null;
      render();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.selected.clear();
      render();
    });
  });

  document.querySelector("[data-search]")?.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.selected.clear();
    render();
    requestAnimationFrame(() => {
      const input = document.querySelector("[data-search]");
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    });
  });

  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.select;
      if (state.selected.has(id)) state.selected.delete(id);
      else state.selected.add(id);
      state.detailId = null;
      render();
    });
  });

  document.querySelectorAll("[data-row]").forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.dataset.row;
      state.detailId = state.detailId === id ? null : id;
      state.settingsOpen = false;
      render();
    });
  });

  document.querySelectorAll("[data-rail-action]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Navigation staged", `${button.dataset.railAction} is wired as a workspace destination.`);
    });
  });

  document.querySelector(".modal-scrim")?.addEventListener("click", () => {
    state.submitOpen = false;
    render();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (state.submitOpen || state.settingsOpen || state.detailId) {
    state.submitOpen = false;
    state.settingsOpen = false;
    state.detailId = null;
    render();
  }
});

render();
