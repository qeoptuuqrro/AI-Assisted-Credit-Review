# Credit review Activity V3 — connected event timeline

Last updated: July 26, 2026.

## Decision

Promote a connected Activity timeline as the current credit-review pattern. It keeps Activity V2's attributable event model and expandable context, then adds the round icon and continuous chronology rail used by the Reimbursements drawer. Preserve V1 and V2 as selectable design-history options in Design Tools.

## Why this direction

- Reuses the shared `ActivityLedger` item contract, glyphs, tones, filters, and disclosure behavior.
- Connects 32px round event icons with a restrained vertical rail so users can follow evidence, analyst actions, reassessments, and decisions as one chronology.
- Keeps timestamps quiet beneath event copy and preserves a single-column mobile composition.
- Promotes one Activity geometry across Meridian, Northstar, and standard review workspaces for platform consistency.

## Preserved options

- V1 remains the original expandable `Timeline` treatment.
- V2 remains the flat `ActivityLedger` treatment with Event and When columns.
- V3 is selected by default and uses `ActivityLedger layout="timeline"`.

## Interaction contract

- Filters remain feature-owned and continue to filter the same event model.
- Whole-row disclosure remains keyboard accessible and keeps supporting context collapsed by default.
- Event tone and glyph reinforce explicit actor and action language; they never replace attribution.
- The connector follows the full event item, including expanded detail, so chronology stays visually continuous.
- At mobile widths, the timestamp stacks beneath the event copy and no horizontal overflow is introduced.

## Validation

- Compare V1, V2, and V3 from Design Tools on `/credit-reviews/meridian-foods/activity`.
- Verify Meridian, Northstar, and standard Activity at desktop and mobile widths.
- Verify filters, disclosure, keyboard focus, durable tab URLs, and reduced motion.
