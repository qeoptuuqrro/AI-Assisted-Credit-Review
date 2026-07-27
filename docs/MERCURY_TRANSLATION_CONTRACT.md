# Mercury Translation Contract

Mercury is the absolute visual source of truth for product UI in this prototype.

IdeaGen work is a content and workflow translation into the Mercury system, not a new visual design system. The default question before implementation is:

> Which Mercury pattern already solves this?

If the answer is unclear, stop and map the use case to Mercury first.

This applies to every IdeaGen feature, route, workflow, drawer, table, popover, and creation flow. It is not limited to the homepage. See `docs/MERCURY_IDEAGEN_LOCK.md` for the required page README fields and validation contract.

Use `docs/MERCURY_COMPONENT_ATLAS.md` as the component-level companion to this contract. The atlas maps Mercury source routes to reusable pattern anatomy, token families, interactions, canonical components, IdeaGen use cases, forbidden drift, and QA artifacts.

## Non-Negotiable Rules

- Mercury is the host design system.
- IdeaGen pages must not invent a custom shell, sidebar, header, card system, table system, drawer system, tab system, or interaction language.
- New components may be created only by extracting or rebuilding a Mercury pattern into canonical `src/components`.
- Page-owned IdeaGen components may encode banker workflow meaning, but their structure and styling must compose canonical Mercury-aligned components.
- IdeaGen drawers and workspaces must be primitive composition, not custom visual systems: use canonical `Drawer`, `Tabs`, `Surface`, `SectionHeader`, `KeyValueGrid`, `Timeline`, `Table`, `MetricCard`, `PageHeader`, `StatusPill`, and `Button` before adding page CSS.
- Page CSS for IdeaGen may define layout only. It must not create custom drawer sections, summary panels, metric bands, review columns, table chrome, card systems, or visual treatments that duplicate Mercury primitives.
- Tokens are constraints, not permission to invent a new look.
- Use Mercury font tokens for product screens: `--mercury-font-text` and `--mercury-font-display`.
- Use Mercury color, border, shadow, radius, table, drawer, tab, and motion tokens where product UI is meant to match Mercury.
- Do not use generic AI dashboard motifs: sparkle icons, robots, colorful gradients, oversized hero panels, chat-first layouts, or decorative SaaS cards.

## Icon and semantic-color language

Mercury restraint applies to icons as strongly as it applies to cards and typography:

- Icons are monochrome stroke glyphs from the shared `Icon` set. Do not introduce per-page SVG styles or decorative multicolor sets.
- A leading glyph uses shared `IconTile`; neutral is the default.
- Color communicates workflow state, never actor, AI provenance, object category, file format, or visual variety.
- Info/indigo means selected or newly available analysis. Success/moss means verified or complete. Warning/amber means attention is required. Danger/red means blocked, invalid, or failed.
- Use one semantic carrier per row. A semantic StatusPill normally leaves the adjacent icon neutral.
- Source documents always use the shared document glyph. PDF/XLSX/CSV/DOCX may appear as low-emphasis metadata in detail views, not as the visible icon.
- Decision choices remain neutral until selected; the selected option uses the action/info treatment. Apply outcome color only after the decision becomes a recorded state.
- Circular icon tiles are reserved for chronological timeline nodes; ordinary object rows use the rounded tile.

Coverage: `Icon`, `IconTile`, `ActivityLedger`, `DocumentRow`, credit-review source ledgers, finding basis/evidence rows, financial drivers, and judgment/recommendation choices.

No custom shell, sidebar, topbar, card, table, drawer, popover, modal, tabs, toolbar, command palette, status tags, metrics, or charts.

Do not create a custom IdeaGen shell, sidebar, header, table, drawer, card system, or AI-dashboard visual language.

## Required Translation Map

Before building an IdeaGen screen, write a local mapping in the page README or task notes:

```txt
Mercury invoicing KPI cards -> IdeaGen work summary
Mercury invoice table -> IdeaGen My Book of Work table
Mercury count tabs -> IdeaGen object filters
Mercury invoice side panel -> IdeaGen signal/review drawer
Mercury filter toolbar -> IdeaGen filters/sort/search
Mercury status pills -> IdeaGen workflow states
Mercury toast/action feedback -> IdeaGen human-in-the-loop confirmation feedback
```

This mapping should drive implementation order and visual QA.

Every implemented IdeaGen page README must also document:

```txt
Closest Mercury reference:
Mercury source routes:
Mercury layout pattern:
Mercury components used:
Allowed content changes:
Forbidden visual changes:
Required interactions:
Screenshot artifacts:
```

## Component Creation Rule

When Mercury has the pattern:

```txt
legacy-runtime Mercury reference -> rebuild/promote in src/components -> consume from IdeaGen page
```

When Mercury does not have the exact domain workflow:

```txt
src/components Mercury primitive composition -> page-owned IdeaGen workflow component
```

Examples:

- Relationship review drawers are allowed only if they compose the canonical Mercury-aligned `Drawer`, `Button`, `StatusPill`, `KeyValueGrid`, and table/list primitives, or if the `#home` route is deliberately using the copied Mercury dashboard drawer pattern.
- `BookOfWorkTable` should not own a new table look. It should compose the canonical Mercury-aligned `Table` once that table supports the needed density and column behavior.
- IdeaGen must not create its own `Sidebar`, `AppShell`, `Header`, `MetricCard`, `Tabs`, `Table`, `Drawer`, or `Popover` visual system.

## Implementation Sequence

1. Inspect the closest Mercury reference page, usually Invoicing for dense work queues and side panels.
2. Check `docs/MERCURY_PATTERN_REGISTRY.md` for the route contract, component targets, interaction states, and visual artifacts.
3. Check `docs/MERCURY_COMPONENT_ATLAS.md` for the exact reusable component pattern, token family, interactions, canonical targets, and forbidden drift.
4. Create the translation map.
5. If canonical components do not match Mercury, update canonical `src/components` first.
6. Build only the first visual slice: shell/header, KPI strip, tabs, and table.
7. Browser screenshot against Mercury before adding drawers or right rails.
8. Add the drawer only after the table slice visually matches.
9. Run `npm run validate`.

Use `docs/FRONTEND_OPERATING_RHYTHM.md` as the companion checklist for ownership boundaries, adjacent CSS Modules, route migration order, and browser QA.

## Gold Standard Enforcement

The system enforces this contract through validation:

- `npm run check:arch` protects folder ownership and blocks custom IdeaGen chrome component names.
- `npm run check:design` blocks hardcoded visual values and custom IdeaGen shell/table/drawer selectors.
- `npm run check:components` makes every shared component documented and adopted.
- `npm run check:mercury-translation` enforces this contract, required IdeaGen page translation maps, Mercury component fidelity mapping, and blocks IdeaGen/product token drift.
- `npm run check:mercury` protects the Mercury reference lane.
- `npm run check:visual` protects the Mercury Pattern Registry and required Playwright artifacts.
- `npm run validate` runs all of the above before handoff.

Passing validation is required, but visual implementation still must be screenshot-checked against the closest Mercury reference before expanding beyond the first slice.

## Visual QA Checklist

Before handoff, answer yes to each:

- Does the page look like Mercury with IdeaGen content, not a custom IdeaGen UI?
- Does the table density match Mercury?
- Do tabs match Mercury count tabs?
- Do KPI cards match Mercury proportions and restraint?
- Does the drawer match Mercury side-panel hierarchy, spacing, and footer behavior?
- Are fonts using Mercury font tokens?
- Are colors, borders, radius, shadows, and motion Mercury-native?
- Did we avoid custom page shell/sidebar/header/table/drawer styling?
- Is AI represented operationally as prepared, extracted, flagged, stale, confirmed, or needs review?

If any answer is no, do not hand off the screen.
