# Design tools launcher V2 — Compact navigator

Last updated: July 27, 2026.

Status: current

## Decision

Replace the stacked inventory with a fixed-height master-detail navigator organized into Screens, States, and References. Each mode owns one searchable collection; selecting a production area replaces the list with its saved versions rather than expanding a nested accordion.

## Rationale

- Mercury utility drawers establish context quickly, contain their own scrolling, and keep navigation separate from item detail.
- A dedicated mode switch makes the user's current job explicit and reduces vertical travel.
- Search scales better than repeated scrolling as the saved-direction inventory grows.
- Master-detail drill-in preserves the full design hypothesis without making every row permanently tall.
- Route-aware `Here` feedback, direct live previews, and copyable design links turn the panel into a working navigation tool rather than a static catalog.

## Interaction contract

- Screens, States, and References use keyboard-operable tabs with stable counts.
- Opening the launcher from a route with multiple saved directions enters that screen's version detail immediately; `All screens` or `All references` returns to the complete index.
- Route families are resolved centrally. Related routes that share one design surface—such as all Meridian finding-detail pages or all Northstar workspace tabs—open the same saved-direction family.
- The direction rendered in the product is marked `Here` and receives the selected-row treatment. An explicit `?design=` choice takes precedence over the area's current direction.
- Search filters the active collection by label, version, and design hypothesis.
- Screen/reference rows open version detail in place; Back returns to the prior collection.
- Selecting a version or workflow state closes the panel and navigates to the live route.
- The body is the only scrolling region; the title, mode tabs, search, and footer remain stable.
- Escape and outside click close the panel, while the launcher remains the focus-return target.
- At mobile widths, the launcher remains available as an icon-only control in a tokenized, reserved slot inside the fixed product-navigation band. It never floats over finding copy, charts, or status content; opening it produces a bounded sheet above that navigation band.

## Responsive geometry

- `--salt-design-tools-mobile-nav-slot-width` reserves the launcher lane in the app shell so primary-navigation links and the launcher cannot collide.
- `--salt-design-tools-mobile-nav-inset` aligns the launcher inside the 64px mobile-navigation band.
- `--salt-design-tools-mobile-panel-bottom` keeps the open sheet one spacing step above navigation while preserving the existing banner offset.
- The desktop launcher remains a bottom-right floating utility; this docking behavior follows the app shell's existing 720px mobile-navigation breakpoint so intermediate tablet widths cannot regress to an overlapping hybrid state.

## Design-history contract

V1 remains selectable as `design-tools-v1-stacked-accordion`. V2 is current as `design-tools-v2-navigator`. Both are registered in Design Options and the component-version registry.
