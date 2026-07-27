# Mercury Parity Audit

`https://demo.mercury.com/dashboard` is the current source of truth for the local Mercury demo. The local canonical URL is `http://localhost:5173/#mercury/home`; product `#home` is the IdeaGen homepage.

## Route Coverage

- Home: dashboard overview, quick actions, balance graph/table, accounts, disputes, credit card, bill pay, invoicing, money movement, transactions, guide.
- Insights: overview, range timeline, cashflow metrics, chart, generated trend notes, money in/out breakdowns.
- Finance routes: Tasks, Accounts, Transactions, Cards, Payments, Invoicing, Reimbursements, Bill Pay, Settings.
- Hidden/reference aliases: `#mercury/home`, `#mercury/transactions`, `#mercury/invoicing`, `#mercury/cards`, `#mercury/payments`, `#mercury/reimbursements`, `#mercury/insights`, `#mercury/accounts`, `#mercury/tasks`.
- Public compatibility aliases: `#dashboard`, `#bill-pay`, `#expenses/all-expenses`, `#insights/overview`.

## Interaction Coverage

- Quick actions: Send, Transfer, Deposit, Request, Upload bill, Customize.
- Top utilities: Move money menu, Search command palette, Private Mode, Settings, Updates, Profile.
- Data controls: segmented views, date/range controls, filter/data-view popovers, sortable headers, selectable rows.
- Overlays: menus, popovers, command dialog, right-side drawers, toasts.
- Motion: hover, active, focus-visible, menu open, drawer open, toast open, Insights scrub, reduced-motion.

## Finance Route Contracts

- Payments: title-level Feedback badge, right-aligned Send money and Upload bill actions, Bill Pay sub-sections in the sidebar, underline tabs for Inbox/Needs Approval/Scheduled/Paid, forwarding email pill on the tab rail, and a flat ledger table without an extra card header.
- Transactions: toolbar stays flat above a collapsible summary/chart surface; collapsed state is a summary toggle with net change, money in, and money out; expanded state uses a left KPI/legend panel, center line/area chart, right grouped bar chart, and a compact graph-toggle tooltip. Ledger rows use sortable headers, 50px row rhythm, separate Category/GL cell editor labels, split combobox/clear controls, selectable rows, a persistent 0-selected bulk editor, a dark category coachmark, and a right-side transaction drawer with amount, timeline, category, notes, and icon actions.
- Cards: no page subtitle, soft Create card action, full-width recommendation panel with policy toggle and receipt-upload preview, underline Cards/Subscriptions tabs, soft Add filter pill, and a flat card table with card glyphs in the Card column.
- Invoicing: KPI cards remain the only top summary surface, filters stay compact, and invoice detail opens in the side panel without shifting the table header rhythm.
- Reimbursements: count tabs retain the underline treatment, All/Pending Review filters stay compact, selected rows use the reimbursement action bar only when rows are selected.

## Design-System Capture

- Transaction chart tokens live in `legacy-runtime/features/finance/money-workflows/styles.css` as `--mp-chart-*`; use them for data-viz green, pink, gridlines, and chart fills.
- Transaction cell editors are the reference for ledger inline selectors: visible term label, 151px split control, blank empty value, separate disclosure/clear button, selected row focus line, popover listbox, and success toast after assignment.
- The persistent transaction bulk bar is the reference for non-selected batch affordances: `0 selected`, Category and GL Code editors, Add file, Add notes, More actions, and Unselect.
- Transaction drawers should use `mp-transaction-drawer` when the entity is a ledger transaction; generic `mp-detail-drawer` remains for non-transaction entities.

## Current Implementation Lane

- Immediate Mercury parity lives in `legacy-runtime` because those routes are iframe-backed today.
- React/shared component absorption lives in `src/components` and should follow `docs/COMPONENT_ADOPTION.md`.
- New reusable behavior should become a component contract before broad reuse.
- Home-specific measurements, token ownership, and interaction targets live in `docs/MERCURY_HOME_AUDIT.md`.
- Transactions-specific ledger, graph, bulk editor, row drawer, coachmark, and inline editor targets live in `docs/MERCURY_TRANSACTIONS_AUDIT.md`.
- Route-by-route parity, required screenshots, and open gaps live in `docs/MERCURY_PATTERN_REGISTRY.md`.

## Hard Gates

- `npm run check:mercury` must pass before handoff.
- `npm run validate` must include `check:mercury`.
- `npm run validate` must include `check:visual` so route contracts and artifact coverage stay current.
- Visual QA must cover Home, Insights, Transactions, Invoicing, Reimbursements, Payments, Cards, and Bill Pay at minimum after meaningful Mercury changes.
