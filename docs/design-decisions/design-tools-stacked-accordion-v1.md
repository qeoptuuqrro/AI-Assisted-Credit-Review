# Design tools launcher V1 — Stacked accordion

Last updated: July 26, 2026.

Status: archived

## Decision

Preserve the original Design Tools launcher as a selectable design-history option. V1 places workflow states, production screens, references, and every expanded version into one vertically stacked accordion.

## What it proved

- A live product can expose complete screen directions without leaving the current workflow.
- Route-addressable design options can preserve current, candidate, and archived UI directions.
- Demo presets can jump directly to meaningful workflow states.

## Why it was replaced

- The inventory becomes a long document as areas and versions accumulate.
- Expanding one group pushes unrelated navigation away from the current context.
- The original shrinking grid could clip expanded rows rather than expose useful scrolling.
- Production screens, workflow states, and references are different jobs but were presented with the same hierarchy.

The archived view remains functional: its middle region now uses explicit max-content rows and contained scrolling so all five demo-state actions remain reachable.
