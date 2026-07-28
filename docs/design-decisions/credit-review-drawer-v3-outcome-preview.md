# Credit review drawer V3 — Outcome-led preview

Status: Current. V1 Overlay preview and V2 Responsive detail rail remain URL-addressable in Design Tools.

## Decision

Keep V2's proven responsive 392px rail, internal scrolling, mobile full-screen fallback, Escape behavior, and focus return. Replace the feature-owned drawer content with an outcome-led preview that helps an analyst decide whether to enter the full workflow.

The July 27, 2026 refinement uses three live Mercury drawer references: Subscriptions detail (`https://demo.mercury.com/subscriptions/subscription/subscription-10-2`), Bill Pay detail (`https://demo.mercury.com/payments?bill=d1f7a0c2-0001-4001-8001-000000000001`), and Scheduled payment detail (`https://demo.mercury.com/payments/scheduled?payment=recurringPayment3`). They establish the same hierarchy: one entity header, one financial protagonist, flat rule-separated details, restrained status color, and a bounded action area. The subscription recommendation also proves that a shallow inset object is useful only when it represents a distinct suggestion or task—not as generic decoration around ordinary metadata.

The current hierarchy is:

1. Company identity, facility type, and current workflow status.
2. Request amount, purpose, due date, and owner.
3. One state-owned module: review focus, evidence prerequisite, changed analysis, or recorded outcome.
4. A flat finding or evidence ledger only when multiple actionable objects remain.
5. A short evidence disclosure.
6. One contextual footer action.

## Workflow semantics

- `Needs judgment` and `Analysis ready` use a flat focus ledger. Meridian findings project from persisted workflow state; Brightline and Cedar use the same geometry as a single row without inventing a card.
- `Needs verification` uses a flat verification ledger when several affected items exist. Northstar's missing 2027 operating forecast is instead one shallow evidence-prerequisite object because it is a distinct external task, not a finding. After verification, the preview reports zero findings and the 1.29x result against the 1.20x policy floor.
- `Analysis updated` may use one shallow `What changed` record when a real before-and-after value and source provenance exist. This record replaces the ordinary finding row; it never sits above a duplicate row or becomes a generic AI summary.
- `Review complete` uses a flat Recommendation or Decision record instead of a completed finding list. A recorded decision includes its accountable actor and date.
- Generic AI briefs, sparkle treatments, long model explanations, and decorative cards do not belong in the preview. Model attribution remains in source provenance, supporting records, and activity.

## Status and divider ownership

- The drawer header owns the review-level `StatusPill`. A row renders a pill only when its semantic state differs from the dominant state of the module or when it records a meaningful analyst transition such as Accepted, Revised, or Escalated.
- Meridian therefore omits `Needs judgment` from its baseline finding rows and retains `Needs verification` only on the exceptional row. Brightline and Cedar never repeat `Needs judgment` on their single row. Verification ledgers omit repeated `Needs verification`; updated and complete records omit their duplicate row pills.
- Status comparison is semantic rather than literal: `Updated` duplicates `Analysis updated`, and `Complete` duplicates `Review complete`.
- A repeated-row ledger draws dividers only between siblings: never below its heading and never after a single or final row. The outcome module hands off to Sources through whitespace rather than a visible closing divider.

## Ownership

- Shared `Drawer` continues to own positioning, height, scrolling, motion, Escape, focus return, and mobile behavior.
- Feature-owned `CreditReviewDrawer` owns credit-review semantics and live workflow projection.
- Shared `CompanyLogo`, `IconTile`, `Icon`, `StatusPill`, `DocumentRow`, `DocumentViewer`, and `Button` provide canonical geometry and behavior.
- `creditReviewPresentation.ts` remains the single semantic icon map for findings and sources.

## Preservation

- V1: `/credit-reviews?design=credit-review-queue-v1-overlay-drawer`
- V2: `/credit-reviews?design=credit-review-queue-v2-responsive-rail`
- V3/current: `/credit-reviews`

Historical variants retain their original content and receive the shared non-current design notice. Selecting or returning from them does not mutate review workflow state.

## Verification contract

- Meridian open count and row status must track persisted analyst state.
- Northstar prerequisite and verified zero-finding states must never appear under `Key findings` in V3.
- Finding rows are native buttons when a destination exists.
- Exactly one footer action is present.
- Desktop, intermediate, and 390px layouts have no document-level horizontal overflow.
- Escape closes the drawer and returns focus to its originating queue row.

## Visual QA

Browser-verified on July 27, 2026 at 1280 × 900 and 390 × 844. Meridian live status/risk projection, Northstar prerequisite and verified zero-finding states, a standard case, archived V2, source disclosure, finding navigation, Escape focus return, and exact viewport-width mobile behavior passed. Artifacts live under `output/playwright/credit-review-drawer-v3/`.
