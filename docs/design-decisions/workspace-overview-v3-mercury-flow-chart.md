# Workspace Overview V3 — Trend flow chart

## Decision

Preserve V2 `Portfolio command view` as the current Overview and add V3 `Trend flow chart` as an inspectable candidate at `/?design=workspace-overview-v3-trend-flow-chart`.

## Why

V2's stacked weekly bars communicate workflow mix accurately, but the chart center reads like a conventional operations dashboard. Mercury's balance-chart pattern is calmer and more contemporary: a thin trend line, restrained area fill, one inspected guide, and values that update in the existing header instead of a floating tooltip.

V3 translates that pattern into lending semantics:

- Active reviews are the primary line and soft area.
- Needs-attention reviews are the secondary decision line.
- Hover, focus, and click inspect one week and update the total, prior-week comparison, date, and exact workflow context without shifting the card.
- A single vertical guide and two point markers replace tooltip bubbles.
- V2 remains available because its stacked bars communicate the three-part workflow mix more directly.

## Ownership

The chart stays feature-owned in `src/features/overview` because its series and interaction language encode lending-portfolio workflow semantics. It consumes shared `Panel`, `Icon`, and Salt tokens. Reusable chart color and geometry roles live in `src/design-system/tokens.css`; no chart library or parallel dashboard styling system is introduced.

## Page composition

No additional illustration or KPI-card row is added. The existing Overview already has the right end-to-end hierarchy: quick actions, one portfolio signal, one personal workload module, and a flat review ledger. Adding decorative cards or artwork would repeat queue state and weaken the decision path.

## QA contract

- Desktop and 390px layouts must not overflow.
- Every week remains keyboard-focusable and has an exact accessible label.
- Hover, focus, and click update the inspected week.
- Pointer exit returns to the current week.
- Reduced-motion behavior retains all information without relying on animation.

## Verification evidence

Verified July 27, 2026:

- At 1280 × 900, the operating summary retains the intended 3:2 card balance, the chart renders at 458 × 131, and the document has no horizontal overflow.
- Selecting Jun 22 updates both total readouts to `52`, changes the comparison to `Opening week`, and exposes `26 in review · 8 decision-ready`.
- At 390 × 844, the document has no horizontal overflow; every week label fits; all six week targets remain approximately 45 × 131; and the exact workflow context wraps to a dedicated legend row.
- The Overview component tests exercise click, pointer hover, keyboard focus, and pointer exit across the V3 chart, while preserving the V2 and V1 directions.
