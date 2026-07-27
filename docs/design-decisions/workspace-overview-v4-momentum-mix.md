# Workspace Overview V4 — Momentum + mix

## Decision

Preserve V2 as the current Overview, preserve V3 as the first Mercury-style candidate, and add V4 `Momentum + mix` at `/?design=workspace-overview-v4-momentum-mix` for direct comparison.

## Problem with V3

V3 is calmer than the stacked bars, but its center still reads like a generic dashboard chart. Total reviews and needs-attention reviews share one scale even though their magnitudes differ, so the secondary line appears almost flat. Four gridlines, a numeric axis, six equally visible dates, two lines, two selected points, a guide, and a repeated legend create more visual furniture than the decision requires.

## V4 contract

V4 answers two questions in sequence:

1. Is the active review workload rising or falling across six weeks?
2. What is the selected week made of?

One scaled momentum line owns the chart center. The selected-week composition moves to a compact three-part strip for Attention, In review, and Ready (the compact label for decision-ready work). The headline total, selected date, and prior-week change remain in their existing positions. Only the first, selected, and current date labels are visually emphasized; all six weeks remain full-height keyboard and pointer targets.

## Why this is more elegant

- One protagonist line replaces two competing trend lines.
- The numeric axis and repeated grid are removed.
- Workflow composition uses the chart form best suited to part-to-whole comparison.
- The selected-week mix remains exact without repeating the total in another legend.
- The chart uses the same card height and preserves the Overview's action-led hierarchy.

## Ownership and tokens

The chart remains feature-owned in `src/features/overview`. It reuses the canonical Salt `Panel`, the existing overview chart color and motion tokens, semantic attention/review/ready colors, and the shared focus treatment. No chart library, shared chart abstraction, or page-specific color system is introduced.

## QA contract

- V2 and V3 remain addressable and unchanged.
- Hover, focus, and click update the headline, date, comparison, selected guide, point, and workflow strip.
- Pointer exit returns to the current week.
- Every week has an exact accessible label and a full-height hit target.
- Desktop and 390px layouts must not overflow or truncate the visible first, selected, and current dates.
- Reduced motion disables workflow-strip interpolation without removing information.

## Verification evidence

- At 1280×900, the portfolio and workload cards remain balanced at 528px and 352px wide with matching 377px heights.
- The 486×132 chart and 486×45 workflow strip have zero horizontal overflow.
- At 390×844, the page and chart have zero horizontal overflow; all six week targets remain 49×132px.
- The mobile workflow strip becomes three separated mini-metrics so labels and values do not collide or truncate.
- Selecting Jun 22 updates the total to 52 and the mix to 18 / 26 / 8; selecting Jul 27 restores 61 and 21 / 29 / 11.
