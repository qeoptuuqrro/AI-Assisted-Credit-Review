# Credit review Overview V4 — Credit account view

Last updated: July 26, 2026.

## Decision

Promote **V4 — Credit account view** to the current Meridian Overview. Preserve V3, V2, and V1 as interactive Design Tools alternatives.

The page keeps the product-wide 968px case frame and uses two restrained layers:

- An Accounts-style summary states the preliminary posture, $18M request, term, initial use, leverage, and evidence readiness.
- One Insights-style fixed-charge coverage chart shows actual history, base case, downside, and the 1.20x covenant floor on a common scale.
- An Accounting-style review ledger exposes one key signal, risk, and workflow state per issue.
- Decorative facility imagery, generated document simulations, icon tiles, and priority-row mini charts are excluded from the current direction.

## Mercury evidence

Accounts demonstrates quiet financial hierarchy and open key/value geometry. Insights demonstrates that one large, interpretable chart can carry a page without surrounding dashboard cards. Accounting demonstrates flat repeated-record scanning with restrained state treatment. Cards reinforces that visual objects must be believable product surfaces; where no authentic product object helps the underwriting task, data should be the protagonist instead.

## Component boundary

`OverviewAccountView` is feature-owned under the credit-review workspace because its chart and labels encode underwriting semantics. It consumes canonical Salt `Button`, `SectionHeader`, and `StatusPill` components and public `--salt-*` tokens. Shared layout, color, typography, interaction, and responsive contracts remain in the design-system layer.

## Interaction contract

- Financials and History controls navigate to their durable case routes.
- Each priority row opens its corresponding focused finding.
- View all opens Findings.
- V1–V3 remain URL-addressable through Design Tools and display the non-current design notice.
- The chart is semantic SVG with an accessible description; table rows remain keyboard-activatable buttons.
- The 968px frame does not change between Overview and ordinary case tabs.

## Source hierarchy companion decision

`/sources` is an ordinary case tab and opens the source ledger first. Only `/sources?source=<id>` enters the full-screen evidence workflow. Close returns to the source ledger, except when `fromFinding=<id>` supplies an originating finding. This keeps collection browsing and focused verification as distinct navigation levels.
