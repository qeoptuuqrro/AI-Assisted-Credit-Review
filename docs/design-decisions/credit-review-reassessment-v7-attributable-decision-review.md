# Credit review reassessment V7 — attributable decision review

Status: archived

Updated: July 27, 2026.

Superseded by: V8 `reassessment-v8-evidence-first-decision-review`. V7 remains a historical, URL-addressable Design Tools option.

## Decision

Use one contained decision object to explain the verified risk change, then place the changed evidence, residual exposure, and assessment basis in quieter supporting rows. Preserve the analyst as the accountable actor and keep `Record judgment` as the only primary action on an analysis-ready finding.

V7 combines the strongest parts of the two prior directions:

- V5's explicit before-and-after risk transition and credible finding-specific financial signal.
- V6's reduced repetition, progressive evidence disclosure, and lower-emphasis supporting ledger.

V5 and V6 remain preserved as selectable design-history options. V7 was promoted without overwriting either prior implementation, then archived when V8 made the evidence-selection, verification, analysis, and judgment sequence more explicit.

## Why

V5 made the credit reasoning easy to follow, but its risk comparison, changed/unchanged cards, assessment card, and financial-signal card created too many similarly weighted raised surfaces. It also repeated the current risk and concentration value across several regions.

V6 removed that repetition and shortened the page, but the fully open brief flattened the hierarchy too far. The risk transition, evidence change, residual exposure, and financial signal read as a sequence of similar rows, making the decision harder to scan and removing too much of the analytical character that helped the finding feel credible.

V7 keeps the explicit decision path while reducing the card wall. The result should answer, in order:

1. What did the system conclude before and after verification?
2. Which evidence changed that conclusion?
3. What exposure still remains?
4. What does the analyst need to do next?

## Information hierarchy

1. The finding header retains the durable risk and workflow status.
2. One dominant decision object owns the read-only system conclusion, the directional risk change, and the concise interpretation.
3. `Evidence changed` and `Still true` appear as sibling ledger rows with supporting detail, not separate competing cards or actions.
4. The finding-specific financial signal remains visible as supporting analysis. For customer concentration, the portfolio composition and monitoring threshold explain why the risk remains Moderate.
5. `Assessment basis` stays closed by default and preserves provenance when expanded.
6. Evidence reviewed remains a flat source ledger below the decision.
7. The sticky analyst footer exposes one primary action: `Record judgment`.

## Interaction contract

- The system conclusion is read-only and remains attributable supporting analysis.
- Verification may update the scoped assessment; it never records analyst judgment automatically.
- The analyst can accept, revise, or escalate through the existing breathable judgment workflow.
- A revised analyst conclusion becomes primary without deleting the preserved system assessment.
- The analysis-ready finding exposes only one primary action. Secondary evidence actions remain available only where the workflow state requires them.
- Assessment-basis and evidence disclosures retain their existing keyboard, focus, and source-return behavior.

## Visual contract

- Use Salt surface, border, typography, spacing, radius, shadow, focus, semantic-risk, and chart tokens.
- Reserve containment and elevation for the dominant decision object and meaningful financial signal.
- Use rules, spacing, and type hierarchy for supporting rows instead of surrounding every statement with another card.
- Display the current risk prominently once inside the decision object; avoid repeating an oversized risk value in supporting analysis.
- Keep the concentration chart decision-oriented: composition, monitoring threshold, and distance above threshold must remain legible without decorative treatment.
- Do not introduce reference-brand names, copied reference text, decorative AI imagery, or a second product visual language into the user interface.

## Internal reference lessons

The reference review informs structure only. The transferable lessons are one dominant decision object, quieter supporting ledgers, disciplined negative space, and one primary action per durable state. Reference branding, product-domain copy, and literal source-page details remain internal and must not appear in prototype UI.

## Responsive and accessibility contract

- At narrow widths, the decision transition, supporting ledger rows, and financial signal stack in document order without horizontal page overflow.
- Risk meaning must use text in addition to semantic color.
- The financial signal keeps an accessible label that communicates the same values as the visual.
- The sticky footer returns to document flow where the viewport cannot sustain it.
- Existing focus-visible, reduced-motion, dialog, and keyboard contracts remain unchanged.

## History and validation

The typed Design Tools registry owns all nine reassessment directions. V1, V2, V4, V5, V6, V7, and V8 are archived; V3 remains a candidate; V9 is current. V7 remains reproducible through `reassessment-v7-attributable-decision-review` and the `meridian-reassessment-ready` state. Removing its historical design query now returns to V9.

V7's promotion required the same realistic reassessed state across customer concentration, declining margins, and increasing leverage at desktop and mobile widths. Its preserved option must retain hierarchy, content fit, judgment entry, source return, sticky-footer clearance, and no horizontal overflow while V9 owns the production default.
