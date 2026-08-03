# Credit review case status V1: dominant next action

## Decision

Every case-level surface shows one lifecycle status based on the dominant accountable next action.

Case status does not attempt to summarize every finding, evidence requirement, or system event. Those details remain inside the preview and case workspace.

## Lifecycle

| Status | Owner and meaning | Tone |
| --- | --- | --- |
| Needs verification | Required evidence is missing, conflicting, or untrusted and blocks meaningful analysis. | Danger |
| Needs judgment | Trusted evidence leaves an explicit, material analyst choice that can change risk, structure, or recommendation. | Warning |
| Analyst review | Analysis is usable and needs routine analyst confirmation, without an unresolved material choice. | Neutral |
| Ready to recommend | Required findings are addressed; the analyst can author or submit the recommendation. | Info |
| Awaiting decision | The recommendation is submitted; senior credit owns the next action. | Info |
| Revision requested | Senior credit returned the case; the analyst must revise it. | Warning |
| Approved | The final approval is recorded. | Success |
| Declined | The final decline is recorded. | Danger |

`Analysis updated` is an event, not a lifecycle stage. Changed evidence and analysis remain visible inside the preview, case workspace, and Activity record rather than beside the lifecycle status.

## Dominance rule

Use `Needs verification` when evidence is the dominant blocker. Use `Needs judgment` when trusted evidence leaves a material analyst choice. Use `Analyst review` when the analysis needs routine confirmation without either condition.

- Meridian Foods: `Needs judgment`. Two findings require material analyst choices; one localized verification item does not block that work.
- Northstar Health: `Needs verification`. The missing 2027 forecast blocks the downside analysis.
- Lakeview Medical: `Analyst review`. Verified reimbursement evidence changed the analysis, which now needs confirmation.
- Atlas Logistics: `Ready to recommend`. Alex completed the final finding review, so recommendation authoring is now the next accountable action.

Meridian transitions dynamically: `Needs judgment` while a material choice is open, `Needs verification` when evidence is the only remainder, back to `Needs judgment` after reassessment makes that material choice actionable, and `Ready to recommend` after Alex records the final disposition.

## Information hierarchy

1. Queue, bookmark, overview row, drawer header, and case header: one `CaseStatusPill`.
2. Drawer and case: finding-level workflow, evidence requirements, update context, and counts.
3. Activity: system events and attributable human actions.

This keeps the portfolio scan calm while preserving detail where it becomes actionable.

## Component contract

`CaseStatusPill` is a typed shared composition over `StatusPill`.

- Variants: eight fixed lifecycle statuses.
- Secondary state: none; event context belongs to the owning detail surface.
- Accessibility: every meaning is expressed in text; color is reinforcement only.
- Forbidden: custom labels, appended finding counts, system-event labels used as case stages, page-owned tones.
- Responsive: the status remains single-line; constrained tables hide lower-priority columns before truncating status meaning.

## Adoption

The shared component is consumed by the Credit Reviews queue, Overview queue, bookmarks, preview drawer, Meridian header, Northstar header, standard-case header, and the Design System specimen.

Learning Mode includes a case-status topic that defines all eight states and explains the Meridian/Northstar/Lakeview distinction.
