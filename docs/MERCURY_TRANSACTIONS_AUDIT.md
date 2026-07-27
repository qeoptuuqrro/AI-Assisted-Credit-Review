# Mercury Transactions Audit

Source of truth: `https://demo.mercury.com/transactions`.

Local routes:

- Platform reference route: `http://127.0.0.1:5173/#mercury/transactions`
- Direct legacy proving route: `http://127.0.0.1:5173/legacy-routes/transactions.html`

## Visual Targets

- Shell: public demo banner, 199px sidebar, Mercury top utility bar, active Transactions nav item, nested Insights/Accounting items under Transactions.
- Header: page title, right-aligned soft `Match receipts` CTA, flat filter toolbar, and icon-only Group/Sort/Settings tools before `Export all`.
- Collapsed graph summary: one flat row below the toolbar with net change, money in, money out, and a compact right-side graph toggle.
- Expanded graph strip: left KPI/legend panel, center green/pink line/area chart, right grouped bar chart with `To/From` selector, and a `Hide graphs` icon button.
- Ledger table: flat table without nested card chrome, selectable first column, sortable Date/To/From/Amount/Account headers, compact Method/Category/GL/Attachment columns, and a 50px row rhythm.
- Inline editors: Category and GL Code cells use a visible label, split combobox/clear control, empty state, hover/focus/open states, and a popover listbox.
- Feedback surfaces: dark category coachmark floats above the ledger, the selected-state bottom bulk editor appears for row selection, and the transaction drawer slides in from the right.

## Interaction Targets

- Loading: live route displays a loading skeleton with skeleton table rows before transaction data resolves.
- Match receipts: title CTA opens or reports receipt matching as a deliberate demo action.
- Data views: popover lists My transactions, Monthly money in, Monthly money out, Operating expenses, and Create view.
- Filters: builder supports Date, Keyword, Amount, Method, Category, Merchant Type, GL Code, Account, Team Member, Department, Card, Status, Policy, and Attachment.
- Date, Keyword, Amount: each opens a compact popover and produces chips or filtered totals.
- Group, Sort, Settings: icon tools open compact table-control popovers and keep toolbar geometry stable.
- Export all: text action keeps the Mercury icon/text affordance.
- Graph toggle: collapsed summary expands into the graph strip; expanded state collapses without shifting the table header rhythm.
- Row click: opens `mp-transaction-drawer` with amount, timeline, category, notes, metadata, and icon actions.
- Row selection: selected checkbox opens the bulk editor and updates it to the selected count.
- Category/GL editors: menu selection updates the row or staged bulk action and shows a success toast.
- Coachmark: can be dismissed and must not block row selection, drawer, or editor interaction.
- Reduced motion: graph, drawer, popover, toast, coachmark, and bulk-bar motion must respect the shared reduced-motion query.

## Token Ownership

- Product tokens live in `src/styles/tokens.css`; legacy proving tokens currently live in `legacy-runtime/features/finance/money-workflows/styles.css`.
- Promote repeated `--mp-*` values into reusable `--mercury-*` or `--ds-*` tokens before React migration.
- Chart tokens: `--mp-chart-grid`, `--mp-chart-green`, `--mp-chart-pink`, `--mp-chart-green-fill-strong`, `--mp-chart-green-fill-soft`.
- Editor tokens: `--mp-editor-border`, `--mp-editor-hover`, `--mp-editor-focus`.
- Transaction layout tokens: `--mp-page-rail`, `--mp-side-panel-width`, `--mp-select-column`, row/column width selectors, and table density rules.
- Feedback tokens: `--mp-floating-shadow`, drawer shadows, popover shadows, coachmark colors, toast motion, and bulk-bar animation.

## Component Ownership

- Legacy proving implementation: `legacy-runtime/features/finance/money-workflows/templates.js`, `data.js`, `index.js`, and `styles.css`.
- Future canonical components: Table ledger variant, `InlineCellEditor`, `BulkActionBar`, `Drawer`, `Popover`, `Toast`, `Checkbox`, `SegmentedControl`, and `DiagramCard`.
- Transaction drawer uses `mp-transaction-drawer`; do not collapse it into the generic entity drawer until the React `Drawer` contract supports transaction-specific timeline, amount, metadata, and icon action slots.
- Transactions and Reimbursements bulk editors should become one canonical `BulkActionBar` API with route-owned visibility policy.

## Current Alignment Notes

- Live audit on July 25, 2026 confirms that table-local search is not part of the Transactions toolbar. Search remains a shell-level action; the ledger uses a `Filters` entry plus quick filter entries.
- The expanded Filters surface is a 598px-wide, 12px-radius two-column popover. Its 221px category rail uses 36px rows, while the detail panel owns the selected category controls. Credit Reviews now translates this pattern with Owner, Due date, and Facility type while retaining workflow status facets above the toolbar.
- Live audit on May 26, 2026 confirms first row ordering: `May 26 / Stefanie Katz / -$1,234.56 / AP / Check Payment`, followed by Mercury Working Capital.
- Local seed data and summary totals are pinned to the current live demo values through `npm run check:mercury`.
- Local direct route matches the live structural pattern for collapsed summary, expanded graph strip, data views popover, row drawer, coachmark, and selected-row bulk editor.
- Platform reference route `#mercury/transactions` embeds the same legacy proving route through the shell; direct route remains the cleaner parity surface for screenshot comparison.

## Drift Rules

- Do not add route-local table chrome around Transactions; keep it a flat Mercury ledger.
- Do not replace the split Category/GL editor with a generic select field.
- Do not show bulk actions before a row is selected on IdeaGen product translations; selected-state behavior should follow the current live Mercury Transactions read.
- Do not render chart colors, row density, editor dimensions, or drawer shadows with hardcoded values during React migration.
- Do not let coachmarks or popovers block row selection, row drawers, or inline editor controls.
- Do not migrate the Transactions route into React until the ledger table, inline editor, and bulk bar contracts exist in `src/components`.

## QA Artifacts

- Live collapsed: `output/playwright/live-audit/transactions-live-collapsed-20260526.png`.
- Live expanded: `output/playwright/live-audit/transactions-live-expanded-20260526.png`.
- Local collapsed platform route: `output/playwright/local-audit/transactions-local-collapsed-20260526.png`.
- Local collapsed direct route: `output/playwright/local-audit/transactions-local-direct-collapsed-20260526.png`.
- Local data views popover: `output/playwright/local-audit/transactions-local-data-views-20260526.png`.
- Local expanded graph strip: `output/playwright/local-audit/transactions-local-expanded-20260526.png`.
- Local row drawer: `output/playwright/local-audit/transactions-local-row-drawer-20260526.png`.
- Local selected bulk editor: `output/playwright/local-audit/transactions-local-one-selected-20260526.png`.
- Local inline editor surface: `output/playwright/local-audit/transactions-local-category-menu-20260526.png`.
