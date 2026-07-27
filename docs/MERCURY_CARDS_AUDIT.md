# Mercury Cards Audit

Reference: `https://demo.mercury.com/cards`.

Local: `http://127.0.0.1:5173/#mercury/cards` and direct route `legacy-routes/cards.html`.

IdeaGen transfer target: `http://127.0.0.1:5173/#curated-ideas`, using the Cards recommendation panel, underline tabs, filter popover, flat table, card glyphs, detail panel, subscription promo artifacts, and drawer pattern for sponsor-fit idea review.

## Captured Patterns

- Centered 968px finance rail inside the Mercury shell; no page subtitle.
- `Manage` / `Subscriptions` underline tabs, with `Manage` as the default state.
- Receipt recommendation surface above tabs, including pill label, policy toggle, preview document field, dismiss action, and policy drawer.
- Compact card filter popover anchored below `Add filter`, with Mercury field icons, right-chevron active row, compact radio rows, nested account checkboxes, and Type/Accounts controls.
- Collapsed filter bar uses one 32px soft `Add filter` action followed by non-interactive `No filters applied` feedback; it does not expose a second row of equally weighted quick-filter buttons. Credit Reviews now adopts this hierarchy while translating the filter categories to Owner, Due date, and Facility type.
- Flat ledger card table with grouped cardholder labels, inline `You` badge, 58px rows, card-glyph variants, status pills for Suspended, Frozen, Pending, and Printing.
- In-table card detail panel with selected-row state, row caret, card art, activation CTA, and footer actions.
- Subscriptions view with two recommendation cards, merchant avatars, payment method card glyphs, and compact row action buttons.
- Create-card full-screen flow with two-column layout, form sections, radio-card controls, live card preview, and fixed footer CTA.
- IdeaGen Curated Ideas transfer: criteria/package artifact recommendation panel, Review/Approved/Needs support/Sources/Package tabs, source artifact clicks, in-table idea detail panel, idea/source/package drawers, and subtle row/stage motion.

## Visual QA

- Reference: `output/playwright/cards-audit/demo-cards-start.png`
- Reference drawer: `output/playwright/cards-audit/demo-cards-row-drawer.png`
- Reference filter: `output/playwright/cards-audit/demo-cards-filter-open.png`
- Reference subscriptions: `output/playwright/cards-audit/demo-cards-subscriptions.png`
- Local main: `output/playwright/cards-audit/local-cards-main-final.png`
- Local row hover: `output/playwright/cards-audit/local-cards-row-hover-final.png`
- Local drawer: `output/playwright/cards-audit/local-cards-drawer-final.png`
- Local filter: `output/playwright/cards-audit/local-cards-filter-final.png`
- Local subscriptions: `output/playwright/cards-audit/local-cards-subscriptions-final.png`
- Local create-card flow: `output/playwright/cards-audit/local-cards-create-final.png`

## Component Capture

- Promote `RecommendationSurface`, `LineTabs`, `FilterPopover`, `LedgerTable`, `CardGlyph`, `EntitySidePanel`, `PromoCard`, and `CreateCardFlow` only after another React route needs the same behavior.
- Keep current implementation page-owned in the money-workflows proving lane while tokens and contracts settle.

## Hard Gates

- `check:mercury` must detect the Cards route labels, panel, popover, create flow, and token names.
- `check:visual` must require the Cards audit screenshots above.
- Future Cards edits must browser-check main, drawer, filter, subscriptions, create-card, mobile, and reduced-motion behavior.
