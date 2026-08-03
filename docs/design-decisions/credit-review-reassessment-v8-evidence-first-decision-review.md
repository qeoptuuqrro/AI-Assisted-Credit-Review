# Credit review reassessment V8 — evidence-first decision review

Status: archived

Updated: July 27, 2026.

Mercury reference: `https://demo.mercury.com/expenses/draft/expense-draft_37?mode=edit`, reviewed in both Expense details and Review states.

## Decision

V8 was the current reassessment direction before V9. Preserve it as a URL-addressable Design Tools option, with V3 remaining a candidate and V1, V2, V4, V5, V6, V7, and V8 archived.

V8 keeps V7's attributable finding record after analysis, but replaces the focused reassessment and judgment layers with an evidence-first editorial workflow:

1. A compact company-identity header establishes Meridian Foods and the selected finding without restoring the ordinary case shell.
2. A 152px peripheral `WorkflowSteps` rail provides Evidence → Review → Result orientation across a tokenized 168px gap from the responsive `clamp(424px, 42vw, 560px)` reading column that owns the task.
3. Evidence starts with one flat, whole-row selectable likely match and keeps upload and borrower request as explicit alternatives rather than stacking every acquisition path at equal weight.
4. Review shows the selected document, provenance, current read-only assessment, and analysis scope before any updated result exists.
5. The analyst must confirm every evidence check before `Verify & update analysis` becomes available.
6. Automated analysis remains a visible, scoped intermediate state; it cannot record analyst judgment or change the final credit decision.
7. The judgment layer starts without a preselected outcome and gives the analyst the accountable Accept, Revise, or Escalate decision.

## Why V8 replaces V7

V7 established the right durable finding hierarchy: one attributable decision object, quieter supporting evidence, and one human action. Its focused evidence path still inherited a compressed rail-to-content relationship, repeated bordered modules, and a review preview that exposed the likely risk result before the analyst had verified the source. That made the task feel more like an AI demonstration than a disciplined credit-control workflow.

The Mercury expense review demonstrates a calmer relationship between identity, peripheral process navigation, a narrow primary measure, and terse footer actions. V8 transfers that hierarchy without copying expense-domain content and uses Mercury's measured 424px task width as the starting point for a responsive shared Salt editorial measure (`clamp(424px, 42vw, 560px)`); the local 168px rail gap remains distinct from Mercury's measured separation.

## End-to-end interaction contract

- `Evidence` offers the existing matched source first when one is available. Selecting it records the source choice; it does not verify the document.
- Upload and borrower request remain distinct acquisition paths. A request may be tracked, but receipt still returns through analyst verification.
- Optional analyst context is progressively disclosed, persists with the reassessment record, and cannot substitute for required evidence.
- Verification checkboxes and analyst context save as a draft while Review is open. Closing and reopening restores that draft; ready evidence resumes at Review, and returning from source inspection restores the appropriate Evidence or Review stage without losing the selected historical design.
- `Review` names the selected evidence, provenance, current assessment, and affected scope. The updated result remains `Not calculated yet` until verification is complete.
- Every verification checkbox is analyst-owned. The primary action stays disabled until all checks are confirmed.
- `Processing` identifies automated analysis once, shows the affected work, and keeps unrelated findings and the final credit decision explicitly out of scope.
- `Result` explains what changed and what remained true, then hands off to a separate human judgment task.
- Judgment has no default decision in V8. Accept, Revise, and Escalate use stacked native-radio rows in the same responsive task measure with one dynamic explanation; the redundant `Updated analysis reviewed` banner is absent. Revise retains the system result as a read-only baseline, then separates the vertically composed analyst-risk handoff and conclusion into two open, rule-divided sections instead of nesting them inside another decision card.
- Closing the focused task returns to the finding without silently recording a judgment.

## Visual contract

- Keep the full-screen task beneath the environment banner, with one compact identity header and one close action.
- Align the peripheral step rail, main reading column, and persistent footer as one composition. The rail provides orientation and must not compete with the task.
- Use a bounded editorial measure rather than a viewport-width form. The footer contains terse controls only and aligns to the same content measure.
- Use open canvas, spacing, type hierarchy, and rules before adding containment. Reserve bordered surfaces for the selected evidence record, scoped-analysis record, and accountable decision controls.
- Map operational instructions, record titles, field values, and decision labels to the Salt 15px / 24px body role. Map provenance, dates, counts, and supporting status copy to the 13px / 20px metadata role; do not compress decision-critical copy into metadata sizing.
- Keep automated-analysis language attributable and restrained. Do not add decorative AI imagery, gradients, avatars, or repeated status banners.
- Use canonical Salt spacing, type, surface, border, radius, focus, semantic state, focused-workflow, and `WorkflowSteps` tokens. Do not introduce a route-private visual system.

## Ownership and history

The typed Design Tools registry owns the version metadata through `reassessment-v8-evidence-first-decision-review`, the `evidence-first-decision-review` render key, and the reproducible `meridian-start` preset. Starting from the clean evidence state makes the evidence-first shell inspectable; the `meridian-reassessment-ready` preset remains available for the post-analysis result state. Removing a historical `design` query now returns to V9.

The focused evidence, review, processing, result, and judgment compositions remain Credit Reviews-owned because they encode lending workflow semantics. They reuse shared `CompanyLogo`, `WorkflowSteps`, `FileDropzone`, `Button`, `StatusPill`, `Notice`, `Icon`, and `IconTile` components. Version labels remain Design Tools metadata; production code does not create an `AssessmentFlowV8` component API.

V7 remains available as `reassessment-v7-attributable-decision-review`. Its original rationale is preserved, while this decision document records that V9 superseded V8.

## Responsive and accessibility contract

- At the shared 900px `WorkflowSteps` breakpoint, the rail and task stack into one column and the rail becomes a horizontal step strip above the bounded task.
- At 390px, evidence records, verification rows, decision choices, and footer actions recompose without document-level horizontal overflow.
- Native checkbox and radio semantics, visible focus, accessible status text, Escape dismissal, and reduced-motion behavior remain required.
- Risk and workflow meaning use explicit text in addition to semantic color.

## Validation gate

Promotion requires the same realistic reassessed state across customer concentration, declining margins, and increasing leverage. Browser QA must cover evidence selection, upload and request alternatives, verification gating, processing, result, judgment entry, V7 switching and return to current, desktop and 390px layout, footer clearance, focus behavior, reduced motion, and a clean console. V8 artifacts should be stored under `output/playwright/reassessment-v8/` when the visual pass is captured.
