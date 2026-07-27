import { renderMercuryPage } from "./templates.js?v=feature-money-workflows-22";
import { accounts, billRows, cardRows, invoiceRows, reimbursementRows, tasks, transactions } from "./data.js?v=feature-money-workflows-22";

const route = resolveRoute();
const defaultTabByRoute = {
  tasks: "Incomplete",
  accounts: "Mercury accounts",
  cards: "Manage",
  payments: "Inbox",
  invoicing: "Invoicing",
  billPay: "Inbox",
  reimbursements: "All expenses",
  settings: "Company Profile",
  transactions: "All transactions",
};

const defaultSectionByRoute = {
  payments: "Bill Pay",
};

const state = {
  route,
  activeTab: defaultTabByRoute[route] || "All transactions",
  activeSection: defaultSectionByRoute[route] || "",
  expenseView: "All expenses",
  expenseFilter: "All",
  activeMenu: null,
  activePopover: null,
  popoverLeft: 223,
  popoverTop: 218,
  popoverWidth: 228,
  activeCombo: null,
  activeDrawer: null,
  activeAction: null,
  activeDataView: "All transactions",
  activeKeyword: "",
  activeAmount: "",
  activeStatus: "",
  activeType: "",
  activeSort: "",
  searchOpen: false,
  searchFilter: "All",
  activeFilterField: "Date",
  privateMode: false,
  selected: new Set(),
  coachmarkOpen: true,
  showGraphs: false,
  receiptPolicy: false,
  cardRecommendationDismissed: false,
  toastTimer: null,
};

const app = document.getElementById("mercuryApp");
const toast = document.getElementById("mercuryToast");

function resolveRoute() {
  const file = window.location.pathname.split("/").pop() || "";
  if (file === "tasks.html") return "tasks";
  if (file === "accounts.html") return "accounts";
  if (file === "cards.html") return "cards";
  if (file === "payments.html") return "payments";
  if (file === "invoicing.html") return "invoicing";
  if (file === "bill-pay.html") return "billPay";
  if (file === "settings.html") return "settings";
  if (file === "reimbursements.html") return "reimbursements";
  return "transactions";
}

function showToast(title, message) {
  if (!toast) return;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function routeFile(nextRoute) {
  const map = {
    tasks: "tasks.html",
    accounts: "accounts.html",
    cards: "cards.html",
    payments: "payments.html",
    invoicing: "invoicing.html",
    billPay: "bill-pay.html",
    reimbursements: "reimbursements.html",
    settings: "settings.html",
    transactions: "transactions.html",
    home: "home.html",
    insights: "insights.html",
    accounting: "accounting.html",
  };
  return map[nextRoute] || "transactions.html";
}

function drawerFor(kind, index) {
  if (kind === "transaction") {
    const row = transactions[index];
    return {
      kind: "transaction",
      title: row[5],
      merchant: row[1],
      kicker: "Transaction details",
      amount: row[3],
      status: row[8] === "Failed" ? "Failed" : "Posted",
      rows: [
        ["Account", row[4]],
        ["Method", row[5]],
        ["Category", row[6] || "Category"],
        ["GL code", row[7] || "GL Code"],
        ["Receipt", row[8] === "None" ? "No receipt" : row[8]],
      ],
      timeline: [
        `${row[4]} - sent by Alice C.`,
        `${row[1]} - May 25 at 8:00PM`,
      ],
      primary: "Mark reviewed",
      secondary: "Delete",
    };
  }

  if (kind === "account") {
    const row = accounts[index];
    return {
      title: row[0],
      kicker: "Account details",
      amount: row[2],
      rows: [
        ["Account type", row[1] || "Mercury account"],
        ["Auto transfer rule", row[3]],
        ["Rule detail", row[4] || "None"],
        ["Status", "Open"],
      ],
      primary: "Create rule",
      secondary: "Close",
    };
  }

  if (kind === "card") {
    const row = cardRows[index];
    return {
      kind: "card",
      index,
      row,
      title: row[2],
      kicker: row[0],
      amount: row[3],
      rows: [
        ["Cardholder", row[0]],
        ["Type", row[4]],
        ["Account", row[5]],
        ["Status", row[6]],
      ],
      primary: "Freeze card",
      secondary: "View transactions",
    };
  }

  if (kind === "task") {
    const row = tasks[index];
    return {
      title: row[0],
      kicker: "Task details",
      rows: [
        ["Due by", row[1]],
        ["Received", row[1]],
        ["Type", row[2]],
        ["Status", row[3]],
      ],
      primary: "Approve",
      secondary: "Dismiss",
    };
  }

  if (kind === "bill") {
    const row = billRows[index];
    return {
      title: row[2],
      kicker: "Bill details",
      amount: row[3],
      rows: [
        ["Due date", row[0]],
        ["Status", row[1]],
        ["Invoice no.", row[4]],
        ["Last updated", row[5]],
      ],
      primary: "Review",
      secondary: "Delete",
    };
  }

  if (kind === "invoice") {
    const row = invoiceRows[index];
    return {
      kind: "invoice",
      index,
      row,
      title: row[0],
      kicker: "Invoice details",
      amount: row[2],
      rows: [
        ["Email", row[1]],
        ["Invoice no.", row[3]],
        ["Invoice date", row[4]],
        ["Type", row[5]],
        ["Due date", row[6]],
        ["Status", row[7]],
      ],
      primary: "View email",
      secondary: "Upload attachment",
    };
  }

  if (kind === "reimbursement") {
    const row = reimbursementRows[index];
    return {
      kind: "reimbursement",
      index,
      row,
      title: row[1],
      kicker: "Expense details",
      amount: row[3],
      rows: [
        ["Date", row[0]],
        ["Status", row[2]],
        ["Category", row[4]],
        ["Receipt", row[5]],
        ["Policy", row[6]],
      ],
      primary: "Approve",
      secondary: "Decline",
    };
  }

  return {
    title: "Details",
    kicker: route,
    rows: [["Status", "Ready"]],
    primary: "Save",
    secondary: "Close",
  };
}

function openDrawer(kind, index) {
  state.activeDrawer = drawerFor(kind, index);
  state.activeAction = null;
  state.activePopover = null;
  state.activeCombo = null;
  state.coachmarkOpen = false;
  render();
}

function render() {
  app.innerHTML = renderMercuryPage(state);
  bindEvents();
}

function clearOverlays() {
  state.activePopover = null;
  state.activeCombo = null;
}

function setPopoverFromTrigger(button) {
  const rect = button.getBoundingClientRect();
  const name = button.dataset.popover || button.dataset.action;
  const widths = {
    filters: 600,
    keyword: 378,
    date: 236,
    amount: 236,
    status: 236,
    type: 236,
    group: 230,
    sort: 230,
    "table-settings": 250,
    "data-views": 228,
  };
  const width = widths[name] || 228;
  if (route === "cards" && name === "filters") state.activeFilterField = "Type";
  state.popoverWidth = width;
  state.popoverLeft = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  state.popoverTop = Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - 360));
}

function toggleSelected(id) {
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
}

function bulkPrefix() {
  if (route === "cards") return "card";
  if (route === "payments" || route === "billPay") return "bill";
  if (route === "invoicing") return "invoice";
  if (route === "reimbursements") return "reimbursement";
  if (route === "accounts") return "account";
  if (route === "tasks") return "task";
  return "tx";
}

function selectableIds() {
  if (route === "invoicing") {
    const active = state.activeTab || "Invoicing";
    return invoiceRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        if (active === "Recurring Series" && row[5] !== "Monthly") return false;
        if (state.activeStatus && row[7] !== state.activeStatus) return false;
        if (state.activeType && row[5] !== state.activeType) return false;
        return true;
      })
      .map(({ index }) => `invoice-${index}`);
  }

  if (route === "reimbursements") {
    const activeView = state.expenseView || "All expenses";
    const activeFilter = state.expenseFilter || "All";
    return reimbursementRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => activeView !== "My expenses" || row[1] === "Jane Black")
      .filter(({ row }) => activeFilter !== "Pending Review" || row[2] === "Pending Review" || row[6].toLowerCase().includes("needs"))
      .map(({ index }) => `reimbursement-${index}`);
  }

  const prefix = bulkPrefix();
  const limit = route === "cards" ? cardRows.length : route === "accounts" ? accounts.length : route === "tasks" ? tasks.length : route === "billPay" || route === "payments" ? billRows.length : transactions.length;
  return Array.from({ length: limit }, (_, index) => `${prefix}-${index}`);
}

function openAction(action) {
  state.activeAction = action;
  state.activeDrawer = null;
  state.activePopover = null;
  state.activeCombo = null;
  render();
}

function actionTitle(action) {
  return action
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueFromTrigger(trigger, fallback = "") {
  return trigger?.dataset?.filterValue || trigger?.textContent?.replace(/\s+/g, " ").trim() || fallback;
}

function handleAction(action, trigger = null) {
  if (!action) return;
  if (action === "search") {
    state.searchOpen = true;
    state.searchFilter = "All";
    state.activePopover = null;
    state.activeCombo = null;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
    return;
  }
  if (action === "close-search") {
    state.searchOpen = false;
    clearOverlays();
    render();
    return;
  }
  if (action === "command-option") {
    state.searchOpen = false;
    clearOverlays();
    render();
    showToast("Command opened", "The selected command is ready in the demo.");
    return;
  }
  if (action === "customize" || action === "customize-experience") {
    state.activeDrawer = {
      title: "Customize demo",
      kicker: "Mercury Demo",
      rows: [
        ["Dashboard modules", "Disputes, Credit Card, Bill Pay, Invoicing"],
        ["Role", "Admin"],
        ["Request", "Request feature"],
      ],
      primary: "Save preference",
      secondary: "Cancel",
    };
    render();
    return;
  }
  if (action === "role-menu" || action === "workspace" || action === "updates" || action === "profile") {
    state.activeMenu = state.activeMenu === action ? null : action;
    state.activePopover = null;
    render();
    return;
  }
  if (action === "private") {
    state.privateMode = !state.privateMode;
    render();
    return;
  }
  if (action === "move-money") {
    state.activeMenu = state.activeMenu === "move" ? null : "move";
    state.activePopover = null;
    render();
    return;
  }
  if (action === "send" || action === "transfer" || action === "deposit" || action === "request" || action === "upload bill") {
    openAction(action);
    return;
  }
  if (action === "send-money") {
    openAction("send");
    return;
  }
  if (action === "upload bill") {
    openAction("upload bill");
    return;
  }
  if (action === "create-card") {
    state.activeAction = "create-card";
    state.activeDrawer = null;
    state.activePopover = null;
    state.activeCombo = null;
    render();
    return;
  }
  if (action === "add-account") {
    state.activeDrawer = { title: "Add account", kicker: "Accounts", rows: [["Type", "Mercury checking"], ["Routing", "Available instantly"], ["Status", "Open"]], primary: "Add account", secondary: "Cancel" };
    render();
    return;
  }
  if (action === "transfer-funds") {
    openAction("transfer");
    return;
  }
  if (action === "create-account") {
    state.activeDrawer = { title: "Create account", kicker: "Accounts", rows: [["Type", "Operating"], ["Visibility", "All users"], ["Status", "Ready"]], primary: "Create account", secondary: "Cancel" };
    render();
    return;
  }
  if (action === "submit-expense") {
    state.activeDrawer = {
      title: "Submit expense",
      kicker: "Reimbursements",
      amount: "$375.87",
      rows: [
        ["Merchant", "The Bayside Bistro"],
        ["Category", "Business Client Meals"],
        ["Receipt", "Ready to upload"],
        ["Policy", "Needs review"],
      ],
      primary: "Submit",
      secondary: "Cancel",
    };
    render();
    return;
  }
  if (action === "expense-settings") {
    state.activeDrawer = {
      title: "Expense settings",
      kicker: "Reimbursements",
      rows: [
        ["Receipt policy", "Required over $75"],
        ["Approval rule", "Admin review"],
        ["Default account", "Ops / Payroll"],
      ],
      primary: "Save",
      secondary: "Cancel",
    };
    render();
    return;
  }
  if (action === "clear-invoice-summary") {
    state.activeStatus = "";
    state.activeType = "";
    state.activePopover = null;
    render();
    showToast("Invoice summary", "Showing all open invoices.");
    return;
  }
  if (action === "edit-invoice" || action === "remind-invoice" || action === "more-invoice" || action === "copy-payment-link" || action === "upload-attachment" || action === "view-invoice") {
    const messages = {
      "edit-invoice": "Invoice editor opened.",
      "remind-invoice": "Reminder email is ready to send.",
      "more-invoice": "More invoice actions opened.",
      "copy-payment-link": "Payment link copied.",
      "upload-attachment": "Attachment uploader opened.",
      "view-invoice": "Invoice preview opened.",
    };
    showToast("Invoicing", messages[action] || "Invoice action opened.");
    return;
  }
  if (action === "approve-expenses") {
    const count = [...state.selected].filter((id) => id.startsWith("reimbursement-")).length;
    showToast(count ? "Requests approved" : "Approve", count ? `${count} reimbursement ${count === 1 ? "request" : "requests"} approved.` : "Select reimbursement requests to approve.");
    state.selected.clear();
    render();
    return;
  }
  if (action === "cancel-reimbursement-payment") {
    showToast("Payment canceled", "The reimbursement payment was canceled in the demo.");
    state.activeDrawer = null;
    render();
    return;
  }
  if (action === "toggle-card-policy") {
    state.receiptPolicy = !state.receiptPolicy;
    render();
    showToast("Receipt policy", state.receiptPolicy ? "Receipts are required over $75." : "Receipt policy recommendation is off.");
    return;
  }
  if (action === "dismiss-card-recommendation") {
    state.cardRecommendationDismissed = true;
    render();
    showToast("Recommendation dismissed", "Receipt policy recommendation hidden for this demo session.");
    return;
  }
  if (action === "manage-policy") {
    state.activeDrawer = {
      title: "Receipt policy",
      kicker: "Cards",
      rows: [
        ["Requirement", "Receipts over $75"],
        ["Applies to", "All physical and virtual cards"],
        ["Tax support", "IRS deduction evidence"],
      ],
      primary: "Save policy",
      secondary: "Cancel",
    };
    render();
    return;
  }
  if (action === "card-filter-option") {
    const value = valueFromTrigger(trigger, "Card filter");
    showToast("Filter updated", value);
    return;
  }
  if (action === "create-merchant-card") {
    showToast("Merchant card", "Create Merchant Card flow opened.");
    return;
  }
  if (action === "build-software-stack") {
    showToast("Software stack", "Curated software stack opened.");
    return;
  }
  if (action === "subscription-open" || action === "subscription-block") {
    showToast("Subscription action", action === "subscription-open" ? "Merchant subscription opened." : "Merchant subscription muted.");
    return;
  }
  if (action === "settings-nav" || action === "invoice-settings" || action === "request-money" || action === "review-bill" || action === "edit-setting") {
    state.activeDrawer = { title: actionTitle(action), kicker: routeMetaLabel(), rows: [["Status", "Ready"], ["Updated", "Today"]], primary: "Save", secondary: "Cancel" };
    render();
    return;
  }
  if (action === "confirm-action" || action === "drawer-primary") {
    const current = state.activeDrawer || state.activeAction;
    state.activeDrawer = null;
    state.activeAction = null;
    render();
    showToast("Success", `${typeof current === "string" ? current : current?.title || "Action"} completed successfully.`);
    return;
  }
  if (action === "drawer-secondary" || action === "close-action" || action === "close-drawer") {
    state.activeDrawer = null;
    state.activeAction = null;
    render();
    return;
  }
  if (action === "match-receipts") {
    state.activeDrawer = {
      title: "Match receipts",
      kicker: "Transactions",
      rows: [
        ["Suggested matches", "24"],
        ["Missing receipts", "6"],
        ["Ready to review", "18"],
      ],
      primary: "Review matches",
      secondary: "Cancel",
    };
    render();
    return;
  }
  if (action === "export-all" || action === "bulk-export") {
    showToast("Export started", "CSV export is being prepared.");
    return;
  }
  if (action === "bulk-category") {
    state.activeCombo = state.activeCombo === "bulk-category" ? null : "bulk-category";
    state.activePopover = null;
    render();
    return;
  }
  if (action === "bulk-gl") {
    state.activeCombo = state.activeCombo === "bulk-gl" ? null : "bulk-gl";
    state.activePopover = null;
    render();
    return;
  }
  if (action === "bulk-note") {
    showToast("Notes", "Note composer opened for selected transactions.");
    return;
  }
  if (action === "bulk-file") {
    showToast("Files", "Attachment uploader opened for selected transactions.");
    return;
  }
  if (action === "bulk-more") {
    showToast("Bulk actions", "More transaction actions opened.");
    return;
  }
  if (action === "clear-selection") {
    state.selected.clear();
    render();
    return;
  }
  if (action === "toggle-graphs") {
    state.showGraphs = !state.showGraphs;
    render();
    return;
  }
  if (action === "dismiss-coachmark") {
    state.coachmarkOpen = false;
    render();
    return;
  }
  if (action === "view-categories") {
    showToast("Categories", "Filtered to uncategorized transactions.");
    return;
  }
  if (action === "view-employee") {
    state.activeMenu = null;
    render();
    showToast("Role switched", "Viewing as employee.");
    return;
  }
  if (action === "workspace-settings" || action === "workspace-users" || action === "workspace-documents" || action === "workspace-billing" || action === "workspace-referral" || action === "sign-out") {
    showToast("Workspace", `${action.replaceAll("-", " ")} opened.`);
    return;
  }
  if (action === "feedback") {
    showToast("Feedback", "Thanks for checking the demo.");
    return;
  }
  if (action === "view-my" || action === "view-money-in" || action === "view-money-out" || action === "view-expenses") {
    const viewMap = {
      "view-my": "My transactions",
      "view-money-in": "Monthly money in",
      "view-money-out": "Monthly money out",
      "view-expenses": "Operating expenses",
    };
    state.activeDataView = viewMap[action] || "All transactions";
    state.activePopover = null;
    render();
    showToast("Data view updated", state.activeDataView);
    return;
  }
  if (action === "keyword-item") {
    state.activeKeyword = valueFromTrigger(trigger, "Contractor");
    state.activePopover = null;
    render();
    showToast("Keyword filter applied", state.activeKeyword);
    return;
  }
  if (action === "apply-amount") {
    state.activeAmount = "$0 - $5,000";
    state.activePopover = null;
    render();
    showToast("Amount filter applied", state.activeAmount);
    return;
  }
  if (action === "sort-old-new" || action === "sort-new-old" || action === "sort-amount-high" || action === "sort-amount-low") {
    const sortMap = {
      "sort-old-new": "Old to new",
      "sort-new-old": "New to old",
      "sort-amount-high": "Amount high to low",
      "sort-amount-low": "Amount low to high",
    };
    state.activeSort = sortMap[action] || "";
    state.activePopover = null;
    render();
    showToast("Sort updated", state.activeSort);
    return;
  }
  if (action === "sort-party" || action === "sort-account") {
    const sortMap = {
      "sort-party": "To/From A to Z",
      "sort-account": "Account A to Z",
    };
    state.activeSort = sortMap[action] || "";
    state.activePopover = null;
    render();
    showToast("Sort updated", state.activeSort);
    return;
  }
  if (action === "clear-sort") {
    state.activeSort = "";
    state.activePopover = null;
    render();
    showToast("Sort cleared", "Transactions returned to the default order.");
    return;
  }
  if (action === "status-filter") {
    state.activeStatus = valueFromTrigger(trigger, "Needs review");
    state.activePopover = null;
    render();
    showToast("Status filter applied", state.activeStatus);
    return;
  }
  if (action === "type-filter") {
    state.activeType = valueFromTrigger(trigger, "One time");
    state.activePopover = null;
    render();
    showToast("Type filter applied", state.activeType);
    return;
  }
  if (action === "create-category") {
    showToast("Categories", "New category form opened.");
    return;
  }
  if (action === "rule" || action === "expand-card" || action === "create-view" || action === "table-control") {
    showToast("Selection updated", `${action.replaceAll("-", " ")} is now active.`);
    return;
  }
  if (action === "tabs" || action === "table-settings" || action === "group" || action === "sort") {
    if (trigger) setPopoverFromTrigger(trigger);
    state.activePopover = state.activePopover === action ? null : action;
    state.activeCombo = null;
    render();
    return;
  }
  if (action === "attachment") {
    showToast("Attachment", "Add attachment dialog opened.");
    return;
  }
  if (action === "settings") {
    window.location.href = routeFile("settings");
    return;
  }
  if (action === "close-search") {
    clearOverlays();
    render();
    return;
  }
  showToast("Interaction", `${action.replaceAll("-", " ")} is wired for this Mercury study.`);
}

function routeMetaLabel() {
  if (route === "billPay") return "Bill Pay";
  if (route === "payments") return "Payments";
  if (route === "reimbursements") return "Reimbursements";
  return route;
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      if (element.dataset.action === "close-search" && event.target !== element) return;
      handleAction(element.dataset.action, element);
    });
  });

  app.querySelectorAll("[data-tab]").forEach((element) => {
    element.addEventListener("click", () => {
      state.activeTab = element.dataset.tab;
      state.selected.clear();
      if (route === "tasks" && element.dataset.tab === "Completed") {
        showToast("Tasks", "Completed tasks view opened.");
      }
      render();
    });
  });

  app.querySelectorAll("[data-section-tab]").forEach((element) => {
    element.addEventListener("click", () => {
      state.activeSection = element.dataset.sectionTab || "Bill Pay";
      state.activeTab = "Inbox";
      state.selected.clear();
      render();
    });
  });

  app.querySelectorAll("[data-expense-view]").forEach((element) => {
    element.addEventListener("click", () => {
      state.expenseView = element.dataset.expenseView || "All expenses";
      state.selected.clear();
      render();
    });
  });

  app.querySelectorAll("[data-expense-filter]").forEach((element) => {
    element.addEventListener("click", () => {
      state.expenseFilter = element.dataset.expenseFilter || "All";
      state.selected.clear();
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

  app.querySelectorAll("[data-filter-field]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.activeFilterField = button.dataset.filterField || "Date";
      render();
    });
  });

  app.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => {
      const next = element.dataset.route;
      if (!next) return;
      if (window.parent && window.parent !== window) {
        window.parent.location.hash = next === "billPay" ? "billPay" : next;
        return;
      }
      window.location.href = routeFile(next);
    });
  });

  app.querySelectorAll("[data-nav]").forEach((element) => {
    element.addEventListener("click", () => {
      const routeMap = {
        Home: "home",
        Tasks: "tasks",
        Accounts: "accounts",
        Transactions: "transactions",
        Insights: "insights",
        Accounting: "accounting",
        Cards: "cards",
        Payments: "payments",
        Invoicing: "invoicing",
        Reimbursements: "reimbursements",
        "Bill Pay": "billPay",
        settings: "settings",
      };
      const next = routeMap[element.dataset.nav];
      if (!next) {
        showToast("Navigation", `${element.dataset.nav} opened.`);
        return;
      }
      if (window.parent && window.parent !== window) {
        window.parent.location.hash = next;
        return;
      }
      window.location.href = routeFile(next);
    });
  });

  app.querySelectorAll("[data-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("[data-action]") || event.target.closest("[data-select]") || event.target.closest("[data-combobox]") || event.target.closest("[data-combo-clear]")) return;
      openDrawer(row.dataset.kind, Number(row.dataset.row));
    });
  });

  app.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (button.dataset.select === "all") {
        const ids = selectableIds();
        const allVisibleSelected = ids.every((id) => state.selected.has(id));
        ids.forEach((id) => {
          if (allVisibleSelected) state.selected.delete(id);
          else state.selected.add(id);
        });
        render();
        return;
      }
      toggleSelected(button.dataset.select);
      render();
    });
  });

  app.querySelectorAll("[data-combobox]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.activeCombo = state.activeCombo === button.dataset.combobox ? null : button.dataset.combobox;
      state.activePopover = null;
      render();
    });
  });

  app.querySelectorAll("[data-combo-clear]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const [kind, indexValue] = button.dataset.comboClear ? button.dataset.comboClear.split("-") : [];
      const row = transactions[Number(indexValue)];
      if (kind === "category" && row) {
        row[6] = "";
        showToast("Category cleared", "Transaction category was removed.");
      }
      if (kind === "gl" && row) {
        row[7] = "";
        showToast("GL code cleared", "Transaction GL code was removed.");
      }
      state.activeCombo = null;
      render();
    });
  });

  app.querySelectorAll("[data-combo-option]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const [kind, indexValue] = state.activeCombo ? state.activeCombo.split("-") : [];
      if (kind === "category" && transactions[Number(indexValue)]) {
        transactions[Number(indexValue)][6] = button.dataset.comboOption;
        showToast("Category updated", `${button.dataset.comboOption} assigned.`);
      }
      if (kind === "gl" && transactions[Number(indexValue)]) {
        transactions[Number(indexValue)][7] = button.dataset.comboOption;
        showToast("GL code updated", `${button.dataset.comboOption} assigned.`);
      }
      if (kind === "bulk") {
        const selectedIndexes = [...state.selected]
          .filter((id) => id.startsWith("tx-"))
          .map((id) => Number(id.replace("tx-", "")))
          .filter((index) => transactions[index]);
        if (indexValue === "category") {
          selectedIndexes.forEach((index) => {
            transactions[index][6] = button.dataset.comboOption;
          });
          showToast("Bulk category", selectedIndexes.length ? `${button.dataset.comboOption} assigned to ${selectedIndexes.length} selected.` : `${button.dataset.comboOption} ready. Select transactions to apply it.`);
        }
        if (indexValue === "gl") {
          selectedIndexes.forEach((index) => {
            transactions[index][7] = button.dataset.comboOption;
          });
          showToast("Bulk GL code", selectedIndexes.length ? `${button.dataset.comboOption} assigned to ${selectedIndexes.length} selected.` : `${button.dataset.comboOption} ready. Select transactions to apply it.`);
        }
      }
      state.activeCombo = null;
      render();
    });
  });

  app.querySelectorAll("[data-popover]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setPopoverFromTrigger(button);
      state.activePopover = state.activePopover === button.dataset.popover ? null : button.dataset.popover;
      state.activeCombo = null;
      render();
    });
  });

  app.querySelectorAll("[data-filter-clear]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const filter = button.dataset.filterClear;
      if (filter === "data-view") state.activeDataView = "All transactions";
      if (filter === "keyword") state.activeKeyword = "";
      if (filter === "amount") state.activeAmount = "";
      if (filter === "status") state.activeStatus = "";
      if (filter === "type") state.activeType = "";
      if (filter === "sort") state.activeSort = "";
      render();
    });
  });

  app.addEventListener("click", (event) => {
    if (!event.target.closest("[data-popover-panel]") && !event.target.closest("[data-popover]") && !event.target.closest("[data-combobox]") && !event.target.closest("[data-action]")) {
      if (state.activePopover || state.activeCombo) {
        state.activePopover = null;
        state.activeCombo = null;
        render();
      }
    }
  }, { once: true });
}

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    state.searchOpen = true;
    state.searchFilter = "All";
    state.activePopover = null;
    state.activeCombo = null;
    render();
    requestAnimationFrame(() => app.querySelector(".command-input input")?.focus());
  }
  if (event.key === "Escape") {
    state.searchOpen = false;
    state.activePopover = null;
    state.activeCombo = null;
    state.activeDrawer = null;
    state.activeAction = null;
    render();
  }
});

render();
