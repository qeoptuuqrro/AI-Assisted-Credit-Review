# Mercury Component Atlas

This atlas is the component-level source map for translating Mercury into IdeaGen. Use it with `docs/MERCURY_PATTERN_REGISTRY.md`, `docs/MERCURY_IDEAGEN_LOCK.md`, and `src/components/README.md` before adding or changing any IdeaGen page.

Mercury remains the visual source of truth. IdeaGen changes the content, domain objects, and workflow logic; it does not change the shell, table, drawer, card, chart, popover, tab, or motion language unless a new Mercury pattern has first been captured and promoted.

## How To Use This Atlas

1. Choose the closest Mercury source route or pattern.
2. Confirm the canonical component target in `src/components`.
3. If the canonical component is missing or visually weak, promote the Mercury pattern first.
4. Keep IdeaGen page-owned components limited to workflow semantics and data composition.
5. Add or update Playwright artifacts under `output/playwright/` for any new meaningful state.
6. Run `npm run validate` before handoff.

## Pattern Capture Fields

Every new Mercury pattern capture should document:

- Source route and local reference route.
- Anatomy: slots, hierarchy, density, borders, radius, shadows, and alignment.
- Tokens: color, type, spacing, radius, shadow, dimensions, z-index, chart, and motion values.
- States: default, hover, selected, active, focus-visible, disabled, loading, empty, error, success, open, closed, and reduced-motion.
- IdeaGen use cases.
- Canonical component target.
- Forbidden drift.
- QA artifacts.

## Shell And Navigation

Mercury sources: `https://demo.mercury.com/dashboard`, `https://demo.mercury.com/transactions`, `https://demo.mercury.com/cards`, local `#mercury/home`, `#mercury/transactions`, and `#mercury/cards`.

Anatomy: top demo banner, fixed 199px sidebar, workspace switch, primary nav groups, bookmark rows, utility bar, global search, compact icon actions, profile menu, and a single scrollable main content rail.

Tokens: `--ds-platform-*`, `--mercury-type-nav-*`, `--mercury-type-ui-*`, `--mercury-nav-item-gap`, `--mercury-nav-section-gap`, `--mercury-nav-link-*`, sidebar row height, sidebar active background, utility-bar height, divider color, icon size, avatar size, menu radius, and menu shadow.

Interactions: nav hover and active state, workspace menu, utility menus, global search dialog, notification/profile menus, keyboard Escape close, and no layout shift when menus open.

IdeaGen use cases: all product routes, including Home, Analytics, Ideabooks, Company Screener, Data Extraction, Watchlists, and future agentic workflow pages.

Canonical targets: platform shell, `SearchField`, `Popover`, `OptionList`, `IconButton`, `Tooltip`, `Toast`.

Forbidden drift: a second IdeaGen shell, custom left nav, custom utility bar, colorful AI header, oversized hero area, route-specific global chrome, or wrapped sidebar rows that collapse Mercury's 6px nav rhythm.

QA artifacts: `output/playwright/ideagen-home/ideagen-mercury-home-1280.png`, `output/playwright/home-audit/local-home-platform-final.png`, `output/playwright/sidebar-audit/local-ideagen-sidebar-mercury-parity-20260528.png`, `output/playwright/sidebar-audit/local-ideagen-workspace-menu-mercury-parity-20260528.png`, `output/playwright/sidebar-audit/local-mercury-cards-sidebar-subnav-20260528.png`, and route-specific shell screenshots.

## Dashboard Cards

Mercury sources: `https://demo.mercury.com/dashboard`, local `#mercury/home`, and IdeaGen `#home`.

Anatomy: two-column grid, equal-height same-row cards, white card surface, 12px radius, subtle border/shadow, compact card header, icon action cluster, fixed balance chart card, compact account/list card, progress card, credit meter card, bill/invoice stat cards, compact one-line queue rows with identity marks/status pills aligned to card padding, and full-width lower sections.

Tokens: `--mercury-home-card-gap`, `--mercury-dashboard-card-height`, `--mercury-dashboard-compact-card-height`, `--mercury-card-pad-x`, `--mercury-card-pad-top`, `--mercury-card-heading-*`, `--mercury-compact-work-*`, `--shadow`, `--panel`, `--line`, and Mercury type tokens.

Interactions: card action menus, graph/table toggle, balance chart hover value/date/delta update with guide line and point marker, date-range menu, compact queue row hover/open, AI/source updates menu, action review drawer, progress pager, primary action pills, customization popover, and guide-panel launch buttons.

IdeaGen use cases: homepage book-of-work summary, staffed work, decisions, coverage readiness, action items, ideabooks, and work movement.

Canonical targets: `Surface`, `MetricCard`, `SegmentedControl`, `Popover`, `OptionList`, `ProgressBar`, `SegmentedMeter`, `Sparkline`, `DiagramCard`.

Forbidden drift: uneven same-row card heights, page-owned card padding, generic KPI tiles, gradients, decorative AI cards, custom card menus, or one-off chart wrappers.

QA artifacts: `output/playwright/home-audit/ideagen-home-chart-mercury-parity-20260526.png`, `output/playwright/home-audit/ideagen-home-chart-hover-mid-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-chart-hover-right-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-chart-hover-mobile-390-20260527.png`, `output/playwright/home-audit/ideagen-home-compact-cards-mercury-parity-20260526.png`, `output/playwright/home-audit/ideagen-home-compact-cards-refined-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-compact-cards-refined-908-20260528.png`, `output/playwright/home-audit/ideagen-home-three-card-row-mercury-parity-20260528.png`, `output/playwright/home-audit/ideagen-home-three-card-row-aligned-20260528.png`, `output/playwright/home-audit/ideagen-home-three-card-grid-context-20260528.png`, `output/playwright/home-audit/ideagen-home-equal-row-heights-20260526.png`, `output/playwright/home-audit/ideagen-home-current-card-height-20260527.png`, `output/playwright/home-audit/ideagen-home-action-ideabook-rich-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-ai-updates-menu-908-20260527.png`, `output/playwright/home-audit/ideagen-home-action-items-drawer-908-20260527.png`.

## Ledger Tables

Mercury sources: `https://demo.mercury.com/transactions`, `https://demo.mercury.com/invoicing`, `https://demo.mercury.com/payments`, `https://demo.mercury.com/cards`, local `#mercury/transactions`, `#mercury/invoicing`, `#mercury/payments`, `#mercury/cards`.

Anatomy: flat ledger surface, compact toolbar, filter chips, sticky table header, dense 50px rows, row checkbox, entity cell with small mark, muted secondary metadata, right-aligned numeric/status cells, inline editors, row hover, selected row, and selected-state bottom action bar.

Tokens: `--mercury-table-*`, `--mercury-ledger-*`, `--ds-control-*`, `--line`, row hover tokens, Mercury table header typography, Mercury table cell typography, checkbox size, and bulk bar dimensions.

Interactions: loading skeleton, sort header, data-view menu, filter menu, search/keyword menu, row drawer open, checkbox selection, selected bulk actions, inline category/status editor, success toast, and Escape close.

IdeaGen use cases: Ideabooks, Curated Ideas review, Company Screener, industry screens, many-column AI enrichment grids, watchlist consensus, and engagement queues.

Canonical targets: `Table`, `Checkbox`, `InlineCellEditor`, `BulkActionBar`, `Toolbar`, `Tabs`, `Popover`, `OptionList`, `Drawer`, `Toast`, `StatusPill`, `StatusDot`.

Forbidden drift: card-stacked rows, custom table border systems, non-Mercury tag pills, row height expansion from cell editors, bottom selection bar visible when Mercury route should hide it, or popovers that hide their trigger cell.

QA artifacts: `output/playwright/local-audit/transactions-local-expanded-20260526.png`, `output/playwright/local-audit/transactions-local-one-selected-20260526.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-1280.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-status-editor-success-20260527.png`, `output/playwright/ideagen-home/ideagen-screener-table-mercury-components.png`.

## Inline Editors And Cell Review

Mercury sources: Transactions category/GL cells, transaction filters, and local `#mercury/transactions`.

Anatomy: compact split cell control, stable row height, label/value pair, optional clear affordance, selected/open state, anchored popover, dense option list, and footer actions only when Mercury uses them.

Tokens: `--ds-control-*`, inline editor width/height, option-list row height, menu radius/shadow, focus ring, row hover, and Mercury table typography.

Interactions: open on click, keep trigger visible, keyboard Escape close, select option, clear option, toast on saved selection, and no scroll jump.

IdeaGen use cases: deal stage, status, AI-generated cell review, source confidence, extraction field value, reviewer decision, and watchlist vote state.

Canonical targets: `InlineCellEditor`, `Popover`, `OptionList`, `Checkbox`, `Button`, `Toast`, `StatusDot`.

Forbidden drift: modal-sized cell review overlays for routine cells, blue divider columns, custom chips inside table cells, popovers covering the clicked cell, or page-owned select/dropdown chrome.

QA artifacts: `output/playwright/local-audit/transactions-local-category-menu-20260526.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-status-editor.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-status-editor-visible-20260527.png`, `output/playwright/ideagen-home/ideagen-screener-cell-review.png`.

## Drawers And Detail Panels

Mercury sources: Invoicing drawer, Transactions drawer, Cards drawer, Accounts detail, Reimbursements expense3/expense9/expense10, and local `#mercury/invoicing`, `#mercury/transactions`, `#mercury/cards`, `#mercury/accounts`.

Anatomy: right-side panel that may float or participate in the ledger lane, icon close button, compact eyebrow/title/meta header, optional entity mark only when the source hierarchy uses one, scroll-contained body, section rows, key-value grids, tabs when needed, timeline/list sections, and restrained action rhythm.

Tokens: `--ds-drawer-*`, `--mercury-detail-drawer-*`, drawer width, inset, radius, border, shadow, header padding, section gap, footer min-height, `--mercury-tab-*`, and Mercury title/body typography.

Interactions: row-origin open, close button, Escape close, tab switch, edit/save, confirm/dismiss, toast feedback, body scroll containment, and no background layout jump.

IdeaGen use cases: investor profile, company profile, relationship signal review, curated idea/source artifact detail, AI cell evidence, extraction validation field detail, ideabook detail, card-like sponsor detail, and engagement detail.

Canonical targets: `Drawer`, `Tabs`, `SectionHeader`, `KeyValueGrid`, `Timeline`, `StatusPill`, `Tag`, `Table`, `Button`, `Toast`.

Forbidden drift: custom drawer chrome, text close buttons in the header, floating cards inside drawer sections, oversized AI explanation panels, custom tab bars, or mixed modal/drawer behavior.

QA artifacts: `output/playwright/ideagen-home/ideagen-investor-drawer-overview.png`, `output/playwright/ideagen-home/ideagen-investor-drawer-portfolio.png`, `output/playwright/cards-audit/local-cards-drawer-final.png`, `output/playwright/local-audit/transactions-local-row-drawer-20260526.png`.

## Popovers, Menus, And Command Surfaces

Mercury sources: dashboard card menus, date menu, workspace menu, transactions data views/filter menus, cards filter popover, payments status popover.

Anatomy: compact floating surface, tight padding, 8-10px radius, subtle border/shadow, rows with icon/text/shortcut or check mark, optional header/footer, anchored to trigger, and high z-index only when required.

Tokens: menu width, menu padding, menu radius, menu shadow, row height, icon size, `--motion-fast`, focus ring, and Mercury small typography.

Interactions: click open, outside click close, Escape close, row hover, selected check, disabled state, no trigger occlusion unless the pattern is intentionally modal, and stable position near viewport edges.

IdeaGen use cases: new work menu, search command, data views, filters, column settings, source list, review mode picker, status picker, and card/work item menus.

Canonical targets: `Popover`, `OptionList`, `SearchField`, `IconButton`, `Tooltip`, `Toast`.

Forbidden drift: large bespoke dropdown cards, logos in source rows unless real and crisp, multi-card source lists, custom shadows, or popovers that look like AI chat panels.

QA artifacts: `output/playwright/home-audit/local-home-date-menu-unclipped-after-token-pass.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-data-view.png`, `output/playwright/cards-audit/local-cards-filter-final.png`.

## Tabs, Filters, And Segmented Controls

Mercury sources: dashboard graph/table toggle, cards tabs, reimbursements tabs, payments tabs, insights tabs/date controls.

Anatomy: underline tabs for route sections, count tabs for status filters, compact segmented control for local mode switches, filter chips in toolbar, and date/range controls paired with charts.

Tokens: `--mercury-tab-*`, `--mercury-segmented-*`, tab height, selected border/underline, filter chip radius, control height, and Mercury UI typography.

Interactions: selected state, hover state, keyboard focus, tab switch without layout jump, active count updates, and range drag where the Insights pattern is used.

IdeaGen use cases: object filters, drawer sections, analytics overview/sponsor/velocity tabs, screener views, ideabook views, and data extraction review sections.

Canonical targets: `Tabs`, `SegmentedControl`, `Toolbar`, `Popover`, `Button`.

Forbidden drift: pill nav for route navigation when Mercury uses underline tabs, custom segmented geometry, over-transparent completed states, or new color systems for filters.

QA artifacts: `output/playwright/cards-audit/local-cards-subscriptions-final.png`, `output/playwright/analytics-insights-audit/local-analytics-sponsor-tab.png`, `output/playwright/local-verify/local-insights-range-dragged-final.png`.

## Charts And Insight Panels

Mercury sources: dashboard balance chart, transactions graph strip, insights overview, cards recommendation panel, and local `#mercury/home`, `#mercury/transactions`, `#mercury/insights`.

Anatomy: chart inside a restrained panel, small title/meta labels, Mercury axis typography, subtle area fill, thin line stroke, compact legends, optional left generated-insights rail, right chart rail, and date controls close to the chart.

Tokens: `--ds-data-visualization-*`, `--mercury-balance-*`, `--mercury-insights-*`, chart height, chart padding, axis font, legend swatch, and chart motion tokens.

Interactions: graph/table toggle, expand/collapse, Mercury balance hover updates the card value/date/delta with one guide line and point marker, range drag, tab switch, generated trend notes, and reduced-motion mode.

IdeaGen use cases: homepage work balance, ideabook sponsor mix, analytics trends, workflow velocity, screen funnel, extraction confidence distribution, and source mix.

Canonical targets: `DiagramCard`, `DataLegend`, `Sparkline`, `ProgressBar`, `SegmentedMeter`, `SegmentedControl`.

Forbidden drift: decorative charts, arbitrary chart colors, labels disconnected from chart geometry, chart cards with extra padding, or data visualization that does not answer a banker decision.

QA artifacts: `output/playwright/home-audit/ideagen-home-chart-mercury-parity-20260526.png`, `output/playwright/home-audit/ideagen-home-chart-hover-mid-1241-20260527.png`, `output/playwright/home-audit/local-mercury-home-chart-hover-mid-1241-20260527.png`, `output/playwright/analytics-insights-audit/local-analytics-1280.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-chart-position.png`, `output/playwright/ideabooks-transactions-audit/local-ideabooks-chart-mercury-geometry-20260527.png`.

## Guided Workflows And Task States

Mercury sources: Tasks, taxes `1099` filing flow, reimbursements approvals, bill pay, cards create-card flow, and payments recipient flow.

Anatomy: step/task list, compact guidance copy, status rows, clear current step, right-side or full-screen task panel when Mercury uses one, footer actions, and restrained completion feedback.

Tokens: task row height, panel width, section spacing, footer action height, status pill tokens, progress tokens, and Mercury body/label typography.

Interactions: step navigation, review/approve, confirm/dismiss, upload/select, success toast, empty/completed state, and disabled next action until required data is complete.

IdeaGen use cases: data extraction flow, human-in-the-loop validation, Scenario 1 realistic coverage-email source intake and Home processing-to-signal handoff, sponsor criteria confirmation, watchlist consensus, staffing reminders, coverage feedback confirmation, and agent-prepared work review.

Canonical targets: `Timeline`, `Table`, `Drawer`, `Modal`, `Button`, `StatusPill`, `StatusDot`, `ProgressBar`, `EmptyState`, `Toast`.

Forbidden drift: custom wizard chrome, mobile-sized controls on desktop, AI chatbot-first workflow, big explanatory hero copy, or non-Mercury progress visuals.

QA artifacts: `output/playwright/local-verify/local-tasks-completed.png`, `output/playwright/local-verify/reference-bill-pay.png`, `output/playwright/cards-audit/local-cards-create-final.png`, `output/playwright/scenario-one-audit/local-scenario-one-email-1280.png`, `output/playwright/scenario-one-audit/local-scenario-one-home-processing-1280.png`, `output/playwright/scenario-one-audit/local-scenario-one-home-signal-1280.png`.

## Upload And Creation Flows

Mercury sources: upload bill, create card, send money, request payment, and invoicing creation patterns.

Anatomy: compact trigger button/menu, guided form or panel, clear fields, quiet helper text, footer actions, success toast, and return to the originating table/detail surface.

Tokens: form control height, field gap, modal/drawer dimensions, button height, border, radius, focus ring, and Mercury form typography.

Interactions: open from CTA, fill fields, validate required inputs, submit, show toast, reset or keep context, Escape close, and no route drift unless Mercury source route changes pages.

IdeaGen use cases: create ideabook, run screen, upload coverage note, upload credit agreement, request coverage feedback, create watchlist item, and prepare curated idea.

Canonical targets: `Button`, `Modal`, `Drawer`, `Field`, `SearchField`, `OptionList`, `Toast`, `EmptyState`.

Forbidden drift: generic SaaS onboarding modals, colorful upload cards, free-floating form systems, or route-specific form styling.

QA artifacts: `output/playwright/cards-audit/local-cards-create-final.png`, `output/playwright/full-audit/local-payments-final.png`, `output/playwright/local-verify/local-invoicing-customers.png`.

## Status, Tags, And Entity Marks

Mercury sources: Transactions statuses, invoices statuses, cards labels, payments statuses, dashboard account marks, and local translated routes.

Anatomy: Mercury status pill geometry, small circular entity mark, muted metadata tags, status dot only with nearby label, and no decorative status palettes.

Tokens: `--mercury-status-*`, `--ds-radius-circle`, avatar size, tag height, semantic status colors, icon size, and Mercury tiny/UI-small typography.

Interactions: hover where clickable, selected state only when acting as a filter, focus-visible for interactive pills, and stable row height.

IdeaGen use cases: workflow states, investor/company marks, AI confidence, human-reviewed confirmation, data extraction state, watchlist vote state, and feedback state.

Canonical targets: `StatusPill`, `Tag`, `StatusDot`, `Tooltip`, `OptionList`.

Forbidden drift: custom blue dividers, low-opacity completed tags, high-saturation badges, fake logos, emoji flags, or unlabelled color-only states.

QA artifacts: `output/playwright/ideabooks-transactions-audit/local-ideabooks-status-editor.png`, `output/playwright/ideagen-home/ideagen-work-movement-logos-visible.png`, `output/playwright/cards-audit/local-cards-main-final.png`.

## Empty, Loading, Success, And Error States

Mercury sources: Transactions skeleton, Tasks empty/completed, payments flow success, card creation success, and table filtered-empty states.

Anatomy: quiet inline state, reserved layout height, minimal iconography, concise copy, one clear action, and toast for temporary feedback.

Tokens: empty-state min height, icon size, toast dimensions, semantic dot colors, row skeleton color, and Mercury UI typography.

Interactions: loading to loaded without jump, filtered-empty reset action, success toast, warning/error copy near the affected control, and no blocking banner unless Mercury uses one.

IdeaGen use cases: no screens, no ideabooks, extraction running, enrichment running, confirmed AI cell, rerun complete, upload failed, and stale source warning.

Canonical targets: `EmptyState`, `Toast`, `StatusDot`, `Button`, `ProgressBar`, `Table`.

Forbidden drift: oversized illustrations, persistent generic banners, playful AI states, or success states that change table density.

QA artifacts: `output/playwright/local-audit/transactions-local-coachmark-dismissed-20260526.png`, `output/playwright/local-verify/local-tasks-completed.png`, `output/playwright/ideagen-home/ideagen-screener-drawer-toast.png`.

## IdeaGen Translation Defaults

| IdeaGen need | Mercury pattern | Canonical target |
| --- | --- | --- |
| Homepage command center | Dashboard cards and money movement | `Surface`, `MetricCard`, `Popover`, `DiagramCard` |
| Book of Work queue | Transactions ledger | `Table`, `Toolbar`, `Tabs`, `Drawer` |
| Ideabooks | Transactions ledger plus invoicing statuses | `Table`, `InlineCellEditor`, `BulkActionBar`, `Drawer` |
| Curated Ideas | Cards recommendation, card table, source panel, and detail drawers | `Tabs`, `Table`, `StatusPill`, `Drawer`, `Popover`, `Toast` |
| Company Screener | Transactions many-column ledger | `Table`, `InlineCellEditor`, `Popover`, `Drawer` |
| Analytics | Insights overview | `DiagramCard`, `DataLegend`, `Tabs`, `SegmentedControl` |
| Data extraction | Tasks plus invoice/transaction drawer | `Drawer`, `Table`, `Timeline`, `KeyValueGrid` |
| AI cell review | Inline editor plus compact popover | `InlineCellEditor`, `Popover`, `OptionList`, `Toast` |
| Sponsor/company profile | Cards/transaction/invoice drawer | `Drawer`, `Tabs`, `KeyValueGrid`, `Timeline` |
| Create/upload workflow | Cards create-card and upload bill | `Modal`, `Drawer`, `Field`, `Button`, `Toast` |
| Human review checkpoint | Tasks approval and drawer footer | `StatusPill`, `Button`, `Toast`, `Timeline` |

## Promotion Checklist

Before promoting or creating a component:

- The Mercury source route is named in this atlas or in a route audit.
- The route contract in `docs/MERCURY_PATTERN_REGISTRY.md` includes layout, components, interactions, QA, and open gaps.
- Active React tokens are promoted to `src/design-system/tokens.css`; only preserved legacy proving-route compatibility values remain in `src/styles/tokens.css`.
- The component contract is added to `src/components/README.md`.
- The adoption target is added to `docs/COMPONENT_ADOPTION.md`.
- IdeaGen pages consume the canonical component instead of page-owned visual primitives.
- Visual QA artifacts exist for default, hover/selected, open, and success states where applicable.
