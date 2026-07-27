# Credit review Activity V2 — attributable ledger

Last updated: July 26, 2026.

## Decision

Promote a Mercury Treasury-style flat Activity ledger as the current credit-review pattern. Preserve the replaced expandable vertical chronology as Activity V1 in Design Tools.

## Options

### V1 — Decision timeline · archived

- Preserves the original Meridian chronology, filters, event markers, vertical rail, and expandable context.
- Makes causality explicit and works well for a short authored change record.
- Gives routine system and evidence events too much visual weight and diverges from Northstar and Mercury's scan-first ledgers.

### V2 — Attributable ledger · current

- Uses one shared border-separated row contract across Meridian and Northstar.
- Keeps a restrained event glyph, event/consequence copy, right-aligned time, and optional whole-row disclosure.
- Retains filters for Meridian's denser record and omits them when Northstar has too few events to justify controls.
- Matches Mercury Treasury and Account Security activity patterns without importing transaction-specific columns or banking semantics.

## Workflow rules

- Activity records changes to verification requirements, sources, findings, analysis, and decisions; it does not replace those objects.
- A missing source remains a verification requirement. A Finding exists only after evidence supports a credit conclusion requiring judgment.
- Event tone and glyph reinforce explicit language; they never act as the only status signal.
- Case state changes event content, not layout geometry.

## Verification workflow consequence

Northstar's 2027 Operating Forecast row is the single contextual entry point across Missing, Awaiting response, Received, Analyzing, and Complete states. The header may keep one primary request action while the Notice remains informational. Routine verification status is not repeated beneath company metadata.

## Validation contract

- Compare V1 and V2 from Design Tools on `/credit-reviews/meridian-foods/activity`.
- Verify Meridian and Northstar Activity at desktop and mobile widths.
- Verify row hover, keyboard focus, disclosure, filters, durable tab URLs, and reduced motion.
- Complete the Northstar request flow and confirm the row reopens status/source detail through sent, received, processing, and ready states.
