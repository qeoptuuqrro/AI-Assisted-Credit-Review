# Mercury IdeaGen Lock

IdeaGen must use Mercury as the product design system for every page and feature.

This is not a homepage-only rule. Every future IdeaGen feature starts from a Mercury source pattern, then translates banker workflow content into that pattern.

## Required Flow

```txt
IdeaGen feature request
-> choose closest Mercury source page/pattern
-> check docs/MERCURY_COMPONENT_ATLAS.md for anatomy, tokens, interactions, canonical targets, and forbidden drift
-> document the translation map
-> use existing Mercury/canonical component
-> if missing, promote the Mercury pattern into src/components
-> build the feature
-> validate and browser-check against the Mercury reference
```

No IdeaGen feature starts from a blank canvas.

## Required Page README Fields

Every implemented folder under `src/pages/ideagen/<feature>` must include a `README.md` with:

- `Closest Mercury reference:`
- `Mercury source routes:`
- `Mercury layout pattern:`
- `Mercury KPI/card pattern -> IdeaGen use:`
- `Mercury table/list pattern -> IdeaGen use:`
- `Mercury drawer/panel pattern -> IdeaGen use:`
- `Mercury tabs/filter pattern -> IdeaGen use:`
- `Mercury components used:`
- `Canonical components to use/promote:`
- `Allowed content changes:`
- `Forbidden visual changes:`
- `Required interactions:`
- `Screenshot artifacts:`

The README must also include this exact lock sentence:

`No custom shell, sidebar, topbar, card, table, drawer, popover, modal, tabs, toolbar, command palette, status tags, metrics, or charts.`

## Mercury Pattern Mapping

Use these defaults unless a closer Mercury route is documented:

| IdeaGen feature | Mercury source |
| --- | --- |
| Home / command center | Mercury dashboard |
| Company screener / many-column grids | Mercury transactions |
| AI-generated cell review | Mercury popover, table cell editor, drawer |
| Data extraction validation | Mercury transaction drawer, invoice detail, tasks |
| Investor ideabooks | Mercury transactions ledger, invoicing, cards |
| Scenario email intake / source artifacts | Mercury cards, dashboard signal panel |
| Action items / approvals | Mercury tasks |
| Analytics | Mercury insights |
| Watchlists / consensus | Mercury cards, reimbursements, tasks |
| Creation / upload flows | Mercury action panel, create-card flow, upload bill flow |

## Component Promotion Rule

```txt
Mercury reference pattern
-> document in docs/MERCURY_PATTERN_REGISTRY.md
-> tokenize reusable values in src/styles/tokens.css
-> promote reusable UI into src/components
-> compose IdeaGen workflow UI from canonical components
```

Do not create page-owned visual primitives when a Mercury pattern exists.

## Validation

The lock is enforced through:

- `npm run check:mercury-translation`
- `npm run check:arch`
- `npm run check:design`
- `npm run check:components`
- `npm run check:visual`
- `npm run validate`

Passing validation does not replace visual QA. Before handoff, browser-check the changed route against the closest Mercury reference route and inspect hover, selected, focus, drawer, popover, table density, and responsive states.
