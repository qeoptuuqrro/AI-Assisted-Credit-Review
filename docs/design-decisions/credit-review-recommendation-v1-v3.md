# Credit review recommendation V1–V3 and senior decision V1–V2

Date: July 26, 2026

## Context

The original Meridian recommendation screen places a complete analyst form beside a complete decision record. It preserves accountability, but the two dense raised surfaces compete for attention and make the analyst’s next action harder to understand.

## Preserved baseline

V1 `Credit memo handoff` remains the current product baseline and is unchanged. It is retained so reviewers can compare the same case, state, fields, and handoff behavior against both candidates.

## V2 candidate: Guided recommendation

Closest Mercury patterns: Expense draft/review and focused Transfer tasks.

- Opens with review, evidence, and handoff readiness rather than another summary card.
- Uses a clickable Recommendation → Structure → Rationale → Protections section rail.
- Shows one section at a time with local Back and Continue actions.
- Keeps the rationale explicitly human-authored and submits one attributable analyst record.
- Omits conditions from the submitted record when the selected posture does not require them.

Hypothesis: progressive task focus will reduce scanning cost and make the analyst’s ownership clearer than the simultaneous credit-memo layout.

## V3 candidate: Review-led handoff

Closest Mercury pattern: Payments approval ledger and contained detail/action panel.

- Keeps the recommendation posture, request facts, and three decision-driving signals open on the left.
- Uses one sticky action composer for posture, amount, rationale, conditions, and submission.
- Links back to Findings, Sources, and Activity without duplicating their full content.
- Uses semantic icons only to reinforce concentration, margin, leverage, and recommendation choices.

Hypothesis: keeping evidence and action visible together will improve senior-handoff confidence without reproducing the dense V1 report card.

## Senior decision architecture

The senior experience is a separate routed task, not another state compressed into the analyst Recommendation canvas.

- Route: `/credit-reviews/meridian-foods/senior-decision`.
- Design Tools Screen: `Senior decision`; reproducible State: `Meridian · Senior decision ready`.
- V1 `Dense decision brief` is archived for comparison.
- V2 `Focused decision layer` is current and temporarily removes the ordinary case header and tabs.
- The main canvas leads with the submitted analyst recommendation, then a flat finding-outcome ledger and compact links to the supporting case record.
- Supporting AI assessment is collapsed and read-only; Morgan Lee alone owns the final decision.
- One sticky composer owns approve, approve with conditions, return, and decline. Return and decline require rationale.
- `Final approval conditions` are covenants and reporting requirements written into a conditional approval. They disappear for all other outcomes.

Hypothesis: separating actor, record, and task will let a senior reviewer understand what Alex recommends, what still needs judgment, and what Morgan must decide without scanning a second dense dashboard.

## Shared boundaries

- The analyst recommendation and senior decision remain separate records and actors.
- AI may summarize evidence but cannot submit either decision.
- Existing Salt components own controls, status, icons, surfaces, focus, and responsive behavior.
- Recommendation-specific composition remains inside Credit Reviews until a second workflow proves reusable semantics.
- Analyst V1, V2, and V3 and Senior V1 and V2 remain URL-addressable through separate Design Tools Screens; no candidate silently replaces another workflow.
- The `Meridian · Recommendation ready` State resolves all findings without submitting a recommendation. `Meridian · Senior decision ready` creates Alex's submitted record and opens Morgan's focused task.
