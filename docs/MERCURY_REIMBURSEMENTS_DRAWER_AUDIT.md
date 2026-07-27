# Mercury Reimbursements Drawer Audit

Last audited: July 26, 2026.

## Sources

- `https://demo.mercury.com/expenses/all-expenses?expenseId=expense3`
- `https://demo.mercury.com/expenses/all-expenses?expenseId=expense9`
- `https://demo.mercury.com/expenses/all-expenses?expenseId=expense10`
- Primary measurement viewport: 1280 × 720 at device pixel ratio 1.
- Local V1: `http://127.0.0.1:5182/reimbursements?design=product-reference-v1-reimbursements`.
- Local V2: `http://127.0.0.1:5182/reimbursements?design=product-reference-v2-responsive-drawer`.

## Measured layout contract

At 1280 × 720, the Mercury finance content lane is 968px wide and starts at x=256. With no expense open, the ledger uses the full 968px. Opening an expense changes the layout immediately to:

| Region | x | width | y | height |
| --- | ---: | ---: | ---: | ---: |
| Condensed ledger | 256px | 544px | 297px | 767px |
| Ledger-to-drawer gutter | 800px | 32px | 297px | — |
| Drawer rail | 832px | 392px | 297px | 767px |

The rail participates in the table wrapper rather than covering the ledger. The ledger retains Checkbox, Date, Team Member, Status, and Amount; Category, Receipt, and Policy are removed in the condensed state. The selected row keeps a quiet filled background.

The rail is table-height and position-relative. Its visible panel is `position: sticky` with an 8px sticky inset inside the scrolling dashboard layout. There is no backdrop.

## Panel height and scrolling

The visible panel begins at the table header and has a 56px header. At the initial 1280 × 720 position, the body receives an inline 351px maximum height, leaving a 16px viewport-bottom inset. The resulting panel height is 407px.

Mercury measures the remaining viewport height rather than letting the panel grow with its content:

| Expense | Body content height | Body viewport | Overflow |
| --- | ---: | ---: | --- |
| expense3 | 585px | 351px | Internal scroll |
| expense9 | 678px | 351px | Internal scroll |
| expense10 | 553px | 351px | Internal scroll |

Scrolling expense9 moved the drawer body from 0 to 327 while the dashboard scroller remained at 0. The body uses `overflow-y: auto` and `overscroll-behavior` remains contained by the panel. Header content remains stable while amount, timeline, actions, metadata, and attachments scroll inside the body.

## Motion and state

- Open state: the ledger condenses immediately and the rail transitions opacity and horizontal transform for 400ms after a 100ms delay.
- Close state: the rail transitions for 400ms, becomes hidden and non-interactive, and the ledger recovers the full lane.
- Row state: the active expense row receives the selected-row surface.
- URL state: `expenseId` identifies the open row and is removed when the close action completes.
- Focus: direct detail URLs place focus on the close action. The observed Mercury demo did not dismiss from Escape while the close action was focused; Salt V2 intentionally retains the existing shared Drawer Escape dismissal and focus-return contract.
- Reduced motion: the local candidate removes the visible travel and delay while preserving the state change.

## Responsive findings

Mercury preserves the 544px ledger, 32px gutter, and 392px rail at smaller desktop widths. At 1100px the combined content extends to x=1200; at 960px and below the navigation collapses but the 984px ledger-plus-rail minimum remains, producing horizontal overflow. The local V2 uses the measured in-layout treatment only when the page can sustain the full 968px lane. Below that threshold it falls back to the existing right-side overlay, preserving table usability and avoiding page-level horizontal overflow. Mobile retains the current full-viewport Drawer contract.

## Header identity and icon decision

Mercury does not repeat a merchant, company, or team-member mark in these reimbursement drawer headers. The header contains `Reimbursement`, the status pill, and the close action. Identity remains available through the selected row and the Submitted timeline; merchant information appears as body metadata when present.

V2 therefore omits a duplicate company icon. Adding one would create a second identity hierarchy unsupported by the reference and would compete with the amount and workflow status.

## Local transfer contract

- Preserve the fixed overlay as V1 and keep it directly selectable in Design Tools.
- Register V2 as a candidate, not the default production Drawer.
- Use shared Salt `Drawer`, `Button`, `StatusPill`, and existing reimbursement content.
- Keep ledger composition and the V1/V2 route switch feature-owned.
- Tokenize the 392px rail, 32px gap, 544px ledger target, 16px bottom inset, 400ms motion, and 100ms delay.
- Keep the Reimbursements route absent from product navigation.
- Validate row click and keyboard activation, Escape, close-button focus return, selected-row continuity, body-only scrolling, responsive overlay fallback, no page horizontal overflow, and reduced motion.

## Artifacts

- `output/playwright/reimbursements-drawer-v2/mercury-expense3-1280x720.png`
- `output/playwright/reimbursements-drawer-v2/mercury-expense9-1280x720.png`
- `output/playwright/reimbursements-drawer-v2/mercury-expense10-1280x720.png`
- `output/playwright/reimbursements-drawer-v2/local-v2-desktop-open-1280x720.png`
- `output/playwright/reimbursements-drawer-v2/local-v2-intermediate-open-900x720.png`
- `output/playwright/reimbursements-drawer-v2/local-v2-mobile-open-430x800.png`
