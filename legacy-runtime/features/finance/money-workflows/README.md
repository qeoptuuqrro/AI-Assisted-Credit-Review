# Money Workflows Legacy Suite

This is a temporary legacy iframe suite for:

- Tasks
- Accounts
- Transactions
- Cards
- Payments
- Invoicing
- Bill Pay
- Reimbursements
- Settings

It remains here so the current Mercury-style reference routes keep working while the platform migrates to React pages.

The suite shares Mercury shell chrome from `legacy-runtime/shared/legacy/mercury` and owns only workflow-specific state: page tabs, filter popovers, tables, bulk bars, right drawers, action panels, comboboxes, and success toasts.

Do not add new product workflows here. When a route needs serious new work, migrate it into a dedicated folder:

```txt
src/pages/finance/<page>/
  components/
  data.ts
  types.ts
  <PageName>Page.tsx
  <PageName>Page.module.css
```
