# Mercury Home Audit

Source of truth: `https://demo.mercury.com/dashboard`.

Local route: `http://127.0.0.1:5173/legacy-routes/home.html`.

## Visual Targets

- Page rail: 970px content width, centered inside the 199px Mercury nav shell.
- Page title: 28px display type, 36px line-height, weight 380, x aligned to 256px at 1280px viewport.
- Card grid: 2 columns, 472px cards at a 968px rail, 24px column gap, 348px top-card height.
- Dashboard rhythm: top-level rows use a 40px stack gap; the four compact cards sit inside a nested two-column module row with a 24px internal gap.
- Compact cards: 232px fixed height on desktop; Disputes/Decisions use a title row, a 60px status block, and a 44px bottom row, not an extra progress strip.
- Action items and Ideabooks may use compact Mercury queue rows when the workflow needs richer state, but rows must preserve the 232px compact-card height, card menu rhythm, same-size identity marks/logos, status pills, and footer CTAs.
- Book of Work investor logos must use square, crisp identity assets inside Mercury circular marks; Peak Rock uses `public/logos/investors/peak-rock-capital-circle.svg` across dense rows, drawer identity headers, menus, bookmarks, and the workspace header so sponsor identity stays circle-only, colorful, and visually filled.
- AI flow scenario dashboard signals must reuse the existing guide panel, top dashboard signal panel, Book of Work ledger, status pills, identity marks, and investor drawer. Do not build a second dashboard or separate agentic page for the story mode.
- Active relationship signals sit directly under the dashboard action row and before the dashboard grid so the banker sees the judgment item before the card stack.
- Action items and Ideabooks compact rows follow the Mercury account-row rhythm: align to the card's 24px padding, stay one line in dashboard cards, keep status pills right-aligned, and only use the taller stacked row treatment inside review drawers.
- Money movement: section heading sits 40px below the compact module row, cards start 14px below the heading, use a 24px card gap, and hold a 463px desktop card height.
- Transactions / Book of Work: section starts on the next 40px top-level stack gap; do not add an extra section-level top margin.
- Home card set: balance, accounts, disputes, credit card, bill pay, invoicing, money movement, transactions.
- Card surfaces: 12px radius, 1px pale border, low Mercury shadow, white panel.
- Card headings: 15px text, 24px line-height, regular weight, no oversized SaaS-card title treatment.
- Balance verification: 24px soft circular button, shield-check icon, Mercury blue icon color, hover/focus tooltip.
- Balance graph/table toggle: 83px compact segmented control, 43px selected item, white selected segment, subtle border/shadow.
- Balance graph hover: hovering a chart point updates the card value/date/delta, renders one thin vertical guide and one small point marker, and never shows an extra tooltip bubble.
- Balance date menu: compact Mercury popover anchored to the date control; selected row carries the check icon.
- Card menus: compact Mercury popovers anchored to the kebab control, above card content and without trigger tooltips while open.
- Balance date menu: must escape the card surface without clipping; balance card is a popover host.
- Balance date menu: the open balance card receives popover stacking so lower dashboard cards cannot paint above the menu.
- Guide panel: fixed right panel, 464px width, 13px radius, same row treatment and floating close button as Mercury.

## Interaction Targets

- Every visible button on Home must either navigate, open a drawer/panel/popover, change local state, or intentionally show a toast for unavailable demo-only actions.
- Quick actions have hover, active, and drawer-open states: Send, Transfer, Deposit, Request, Upload bill.
- Hovering the verified balance badge reveals a tooltip and does not shift layout.
- Hovering the balance chart updates the card header in place, keeps the chart/card dimensions stable, and clears back to the selected range when the pointer leaves.
- Selecting graph/table re-renders the balance module without changing card dimensions.
- Opening the date range menu hides trigger tooltips and keeps the menu anchored to the date control.
- Card kebab menus use the shared Mercury popover animation and option-row density.
- Quick actions open right-side workflow drawers with the shared drawer animation.
- Accounts rows and `+2 View all accounts` route to account surfaces.
- Dispute previous/next updates the card in place; `View` routes to transactions.
- Credit Card `Pay`, card issue, and autopay open Mercury-style right-side workflow drawers.
- Bill Pay and Invoicing card CTAs route to their owning surfaces or open workflow drawers.
- Action items opens the Mercury review drawer and the updates bell opens a compact Mercury menu for AI/source notifications; AI work stays inside the review queue rather than becoming a decorative card.
- `AI Flow 1: Peak Rock signal` starts a deterministic dashboard state: the guide closes, the Book of Work row receives a selected signal treatment, a compact dashboard signal appears under the dashboard action row, and `Review signal` opens the real investor drawer with extracted criteria and source evidence.
- Relationship signal review uses the Mercury drawer/task pattern as a locked staged workflow: Signal review -> Workplan -> Sponsor context -> Company screen -> Curated ideas. Criteria confirmation is the manual gate; later footer actions inspect agent-run work rather than asking the banker to approve each operational step.
- Step 4 stays impact-first: source excerpt, extracted criteria, needs confirmation, what happens if confirmed, and an expandable `View full agent workplan` control. The 11-step workplan must not dominate the default criteria review state.
- The final Curated Ideas step hands off to `#curated-ideas`, a dedicated Mercury Cards-style workspace. The wider drawer state remains only as a bridge, while durable idea review, source artifacts, package CTAs, and idea/source drawers belong on the routed page.
- Do not show the generic `Human checkpoint` fact grid inside the Curated Ideas review workspace; the candidate review actions and footer are the human checkpoint.
- Confirming Peak Rock criteria changes the dashboard signal and Book of Work status to `Criteria confirmed` while preserving the page scroll position; moving backward in the drawer must not revert the confirmed dashboard state.
- Agent-run stages use subtle Mercury row reveal motion for checklist, warnings, the Insights-style screen funnel with signed movement cues, and candidate rows. Reduced motion remains covered by the global Mercury motion media query.
- Curated idea candidates use the Mercury mini-table, status pills, visible review actions, and fact-grid evidence pattern: selecting a candidate updates evidence cells for sponsor fit, PortCo angle, relationship angle, prior work check, and risk without introducing a separate AI explanation card.
- Money movement month arrows update the monthly summary; source rows and `View all` route to transactions.
- Transaction tabs filter rows and sortable headers toggle visible sort direction.
- The guide panel tabs switch selected state without route changes; rows route via the shared handler.
- Reduced motion remains honored through the shared Mercury motion media query.

## React lending overview translation

The active React `/overview` route translates the live dashboard pattern into a lightweight lending operating view rather than reproducing treasury content.

- Mercury quick actions map to `Open review queue`, `Needs judgment`, and `Evidence requests`.
- Judgment, evidence, and decision actions deep-link to visible, dismissible queue focus states; a specific action must not open an unfiltered queue.
- V2 keeps Mercury's two-module opening but intentionally uses a 3:2 lending command split rather than two equal 472px cards. Portfolio flow needs enough width for six comparable periods; the analyst module needs only enough width for three next actions.
- The portfolio module plots the six-week active-review mix as stacked workflow bars. Hover, focus, or click updates the inspected week, total, comparison, and legend without changing card dimensions. The chart answers whether the active and attention queues are growing; it is not a decorative volume sparkline.
- V3 `Trend flow chart` is preserved as a candidate at `/?design=workspace-overview-v3-trend-flow-chart`. It translates the live balance-chart interaction into a primary active-review area line, a secondary needs-attention line, one inspected guide, and header/legend values that update in place without a tooltip bubble.
- V4 `Momentum + mix` is preserved as the quieter candidate at `/?design=workspace-overview-v4-momentum-mix`. One scaled workload line owns the chart center while a selected-week composition strip carries Attention, In review, and Decision-ready counts. The numeric axis, repeated grid, secondary trend line, and redundant total legend are removed.
- The workload module leads with the analyst's actionable and urgent counts, then exposes the next three review objects with the existing `CompanyLogo` and `companyLogoDomains` mapping. It does not duplicate those counts into a second row of equal KPI cards.
- The lower Mercury transactions ledger maps to one tabbed review-activity ledger. Row-level status pills stay count-free; aggregation counts belong in portfolio, workload, and module summaries.
- The content rail remains `--salt-shell-content-max`, card radius/shadow use Salt panel contracts, and top-level/internal rhythm remains 40px/24px.
- `/overview` and `/` are aliases and must produce the same active Overview navigation state.
- Design Options preserves V1 at `/?design=workspace-overview-v1-balanced-modules`, keeps V2 `workspace-overview-v2-operating-dashboard` current on `/` and `/overview`, and exposes V3 and V4 as chart comparisons without changing the canonical route.

### Sidebar bookmarks

- A saved credit review is a durable case shortcut, not a second primary-navigation item.
- Desktop bookmarks use the Mercury divider, quiet section label, reorder affordance, company identity, compact request/status metadata, and hover-revealed removal control. The persistent help affordance uses a 12px glyph, matching Mercury's compact section utility, inside the local 24px keyboard-focusable target.
- Case headers expose one quiet bookmark icon beside the one contextual primary action.
- Bookmark order persists under `bcgx.credit-review-bookmarks.v1`; header and sidebar state update together.
- The desktop reorder handle supports pointer dragging and Arrow Up/Arrow Down keyboard movement, with order preserved after reload.
- Mobile exposes bookmarks from the utility bar in a compact popover and never compresses full bookmark rows into the bottom navigation.

## Token Ownership

- `src/styles/tokens.css` owns Mercury primitives and Home-specific component tokens.
- Home layout tokens: `--mercury-home-page-width`, `--mercury-home-page-pad-top`, `--mercury-home-action-gap-after`, `--mercury-home-stack-gap`, `--mercury-home-card-gap`, `--mercury-home-card-column-gap`, `--mercury-home-card-row-gap`, `--mercury-home-module-gap`.
- Card tokens: `--mercury-card-pad-x`, `--mercury-card-pad-top`, `--mercury-dashboard-card-height`, `--mercury-dashboard-compact-card-height`, `--mercury-card-heading-weight`, `--mercury-compact-work-*`.
- Money movement tokens: `--mercury-movement-heading-gap`, `--mercury-movement-card-height`, `--mercury-movement-header-height`, `--mercury-movement-list-height`, `--mercury-movement-footer-height`.
- Card menu tokens: `--mercury-card-menu-width`, `--mercury-card-menu-top`, `--mercury-card-menu-pad`, `--mercury-card-menu-radius`, `--mercury-card-row-radius`.
- Balance tokens: `--mercury-balance-chart-height`.
- Tooltip tokens: `--mercury-tooltip-*`.
- Segmented control tokens: `--mercury-segmented-*`.
- Guide tokens: `--mercury-guide-*` for panel geometry, row height, tab height, and launcher placement.
- Dashboard signal tokens: `--mercury-signal-*` owns the AI flow signal panel, row highlight, drawer evidence, and scenario action sizing.
- Scenario workflow tokens: `--mercury-scenario-*` owns the staged drawer progress strip, row rhythm, footer action gap, and task/check list dimensions.
- Candidate evidence tokens: `--mercury-candidate-*` owns the drawer mini-table width and evidence-column clipping; `--mercury-curated-*` owns the dedicated Curated Ideas page stage rail, source artifacts, idea panel, and package-review geometry.
- Motion and state tokens: `--mercury-motion-*`, `--mercury-action-secondary-*`, `--mercury-row-hover*`, `--mercury-focus-ring`.

## Component Ownership

- Legacy Home implementation: `legacy-runtime/features/dashboard/home/components/dashboard.js`.
- Legacy Mercury styling: `legacy-runtime/shared/legacy/mercury/styles.css`.
- Canonical React primitive for future pages: `src/components/Tooltip`.
- Canonical React primitive for future pages: `src/components/SegmentedControl`.
- Existing canonical primitives to keep using: `Button`, `IconButton`, `Popover`, `Drawer`, `Table`, `Tabs`, `Surface`, `Toast`.
- Legacy card menus are the Home-specific runtime version of the canonical `Popover + OptionList` pattern.
- Legacy workflow panels are the Home-specific runtime version of the canonical `Drawer` pattern.
- Legacy graph/table toggles are the Home-specific runtime version of the canonical `SegmentedControl` pattern.

## Drift Rules

- Do not create new graph/table toggle CSS. Use `SegmentedControl` in React surfaces and `.view-toggle` only in legacy Mercury routes.
- Do not create tooltip variants with hardcoded geometry. Use `Tooltip` or `[data-tooltip]` backed by the shared tooltip tokens.
- Do not increase card heading size above the Mercury card-title scale for dashboard modules.
- Do not add dense-card padding by eye. Use the Mercury card tokens and screenshot at 1280px desktop.
- Do not flatten compact dashboard cards into the top-level grid; keep `dashboard-module-row` so Mercury's 40px outer / 24px inner rhythm survives.
- Do not add progress strips to the Disputes/Decisions compact card; Mercury's compact card relies on sparse title/status/footer hierarchy.
- Do not add local top margin to the Transactions / Book of Work section; spacing is owned by `--mercury-home-stack-gap`.
- Do not leave card CTAs as inert visual buttons. Route, open a drawer/popover, or add a deliberate demo-state response.
- Do not let card popovers render inside a clipped card stacking context.
- Do not clip the balance date popover at the balance card bottom edge.
- Do not use generic AI/product gradients, oversized cards, or custom icon treatments on Mercury routes.

## QA Artifacts

- React lending Overview V2 desktop: `output/playwright/overview-page/workspace-overview-v2-desktop-1280x900.png`.
- React lending Overview V2 mobile: `output/playwright/overview-page/workspace-overview-v2-mobile-390x844.png`.
- Preserved React lending Overview V1 desktop: `output/playwright/overview-page/workspace-overview-v1-desktop-1280x900.png`.
- July 27, 2026 interaction pass: 390px chart inspection updated 61/current to 52/Jun 22 with the accessible `Opening week` comparison; Recently updated selected five rows; V1 returned to the query-free V2 route; Design Tools exposed both Workspace overview directions. Mobile viewport, document, and body widths were all exactly 390px, Arcadia Text loaded, image failure count was zero, and the console contained no errors or warnings.
- Reference screenshots: `output/playwright/home-audit/mercury-dashboard-clean.png`, `output/playwright/home-audit/mercury-dashboard-fresh-1280.png`.
- Current local screenshots: `output/playwright/home-audit/local-home-transfer-hover.png`, `output/playwright/home-audit/local-home-account-menu-settled.png`, `output/playwright/home-audit/local-home-interactions-pass.png`, `output/playwright/home-audit/local-home-fresh-1280-before.png`, `output/playwright/home-audit/local-home-fresh-1280-after-token-pass.png`, `output/playwright/home-audit/local-home-date-menu-stacked-after-token-pass-v2.png`, `output/playwright/home-audit/local-home-final-1280.png`, `output/playwright/home-audit/local-home-spacing-parity-20260527.png`, `output/playwright/home-audit/ideagen-home-chart-hover-mid-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-chart-hover-right-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-chart-hover-mobile-390-20260527.png`, `output/playwright/home-audit/local-mercury-home-chart-hover-mid-1241-20260527.png`, `output/playwright/home-audit/mercury-dashboard-chart-hover-reference-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-compact-cards-refined-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-compact-cards-refined-908-20260528.png`, `output/playwright/home-audit/ideagen-home-action-ideabook-rich-1241-20260527.png`, `output/playwright/home-audit/ideagen-home-action-ideabook-rich-908-20260527.png`, `output/playwright/home-audit/ideagen-home-ai-updates-menu-908-20260527.png`, `output/playwright/home-audit/ideagen-home-action-items-drawer-908-20260527.png`.
- Peak Rock AI workflow screenshots: `output/playwright/home-audit/ideagen-home-ai-flow-signal-review-drawer-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-workplan-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-sponsor-context-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-company-screen-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-candidates-1280-20260528.png`.
- Refined Peak Rock workflow screenshots: `output/playwright/home-audit/ideagen-home-ai-flow-top-signal-review-expanded-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-agent-running-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-ai-flow-screen-funnel-actions-1280-20260528.png`, `output/playwright/home-audit/ideagen-home-screen-funnel-visual-cues-v3-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-screen-footer-two-actions-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-screen-footer-menu-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-signal-footer-overflow-right-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-signal-footer-overflow-menu-right-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-candidates-natural-list-v2-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-candidates-evidence-rich-scrolled-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-candidates-action-menu-1544x1150-20260529.png`, `output/playwright/home-audit/ideagen-home-peak-rock-circle-mark-drawer-20260529.png`.
- Wide review workspace screenshot: `output/playwright/home-audit/ideagen-home-ai-flow-wide-review-workspace-1280-20260528.png`.
- Current platform screenshot: `output/playwright/home-audit/local-home-platform-final.png`.
- Current mobile screenshot: `output/playwright/home-audit/local-home-mobile-390-fixed.png`.
- Interaction screenshots should cover: quick action hover/drawer, verified tooltip, balance chart hover, date menu, graph/table toggle, account menu, guide close/open, card menus, transaction sort, money movement month navigation, and routed view-all actions.

## 2026-05-25 Drift Pass

- Fresh Mercury demo at `1280x720` opens with the guide panel expanded; keep `guideOpen` as the default Home state.
- Balance chart shape and balance trend text must follow the fresh demo line direction; the down trend is `-$478K`.
- Transactions seed data must keep the current Mercury ordering: first visible row is `May 26 / Stefanie Katz / -$1,234.56 / AP / Check Payment`, followed by Mercury Working Capital.
- Guide geometry is token-owned so panel width, right offset, row height, and launcher size do not drift by repeated local edits.
