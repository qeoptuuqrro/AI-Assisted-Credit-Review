# Legacy Mercury Reference Shell

This folder holds the shared shell chrome for the legacy Mercury-style reference routes.

It exists so legacy iframe pages do not import shell helpers or base CSS from the Home feature. New React work should use `src/components`, `src/pages`, and CSS Modules instead.

Allowed here:

- Legacy shell helpers used by multiple iframe routes.
- Legacy brand/avatar helpers used by multiple iframe routes.
- Legacy base CSS needed by the Mercury-style reference pages.

Do not add new product-specific workflow logic here. New workflow logic belongs in `src/pages/<area>/<page>`.

Current shared shell responsibilities:

- `shell.js` renders the demo banner, workspace switcher, left rail, utility bar, command search, move-money panel, workspace menu, role menu, updates menu, and profile menu.
- `brand.js` renders the Mercury orbital mark used in the banner, sidebar, account rows, and transaction avatars.
- `styles.css` owns only Mercury base chrome, command palette, shell menus, action panels, private-mode behavior, and toasts.

Feature pages such as Transactions, Cards, Payments, Bill Pay, Invoicing, Reimbursements, and Settings import this shell but keep route-specific tables, drawers, filters, and workflow state in `legacy-runtime/features/finance/money-workflows`.
