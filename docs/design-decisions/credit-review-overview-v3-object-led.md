# Credit review Overview V3 — Object-led decision

Last updated: July 26, 2026. Superseded by V4 — Credit account view.

## Decision

Preserve **V3 — Object-led decision** as an archived Meridian Overview option. V4 — Credit account view is the current direction; V2 — Signature assessment and V1 — Card stack also remain interactive Design Tools alternatives.

The page keeps the product-wide 968px case frame. Its primary composition is an open, asymmetric pairing:

- A feature-owned facility object makes the $18M commitment, $11.7M initial use, three-year term, current coverage, and current leverage tangible.
- A decision column states `Proceed with conditions` and exposes the three reasons as direct, clickable financial signals.
- Evidence readiness and assessment history remain quiet footer information.
- Review priorities use concentration, margin, and leverage micro-artifacts instead of generic icon tiles.
- The former three-cell fact strip is removed because initial draw and readiness already belong to the primary composition.

## Mercury evidence

The decision follows a July 26, 2026 cross-page audit of:

- Dashboard chart/table replacement inside stable geometry.
- Cards selected-ledger and realistic card-object hierarchy.
- Credit account balance/utilization beside a dominant trajectory.
- Treasury balance and portfolio objects above a flat activity ledger.
- Invoicing and Reimbursements selected-detail lifecycle panels.
- Payment full-screen task mode with reduced navigation.
- Referrals object-plus-explanation asymmetry.
- Company Profile and Plan & Billing open key/value and two-column compositions.
- Insights decision-led chart composition and subdued generated commentary.

The transferable rule is compositional rather than cosmetic: one page gets one financial protagonist, supporting information changes surface type, and alternate states preserve context.

## Component boundary

`OverviewObjectLed` is feature-owned under the credit-review workspace because it represents credit structure and underwriting semantics. It consumes canonical Salt `Button`, `SectionHeader`, `StatusPill`, and `Icon` components and public `--salt-*` tokens. It is intentionally not promoted to shared UI.

The object-led dimensions are reusable within this Overview family and live as component tokens in `src/design-system/tokens.css`. No route-private palette, type scale, radius, or shadow system is introduced.

## Interaction contract

- Each assessment signal opens its corresponding finding.
- Each priority row opens the same finding with its workflow state intact.
- Assessment history opens Activity.
- View all findings opens the Findings workspace.
- V1 and V2 remain addressable through the `design` URL parameter and show the non-current design notice.
- At narrow widths the decision precedes the facility object; below 460px the supplemental facility object is omitted.
- Hover, focus-visible, keyboard activation, and reduced-motion behavior use existing Salt contracts.

## Why V3 was replaced

The facility object and three micro-artifacts made the page feel designed around illustrations rather than underwriting work. They also repeated values already present in the case and made the review ledger feel decorative. V4 keeps the useful open composition while replacing simulated product imagery with one credible coverage chart and a flatter, more disciplined review ledger.

## Why V2 was replaced by this archived direction

V2 improved honesty and spacing but still placed a metadata card beside explanatory prose inside one large outer card. Its three-cell fact strip repeated information and the priority rows relied on generic icon tiles. V3 gives the page a stronger visual argument: **credit structure ↔ decision**.
