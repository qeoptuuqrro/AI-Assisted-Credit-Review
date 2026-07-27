# Credit review drawer V3 — Outcome-led preview

Status: Current. V1 Overlay preview and V2 Responsive detail rail remain URL-addressable in Design Tools.

## Decision

Keep V2's proven responsive 392px rail, internal scrolling, mobile full-screen fallback, Escape behavior, and focus return. Replace the feature-owned drawer content with an outcome-led preview that helps an analyst decide whether to enter the full workflow.

The current hierarchy is:

1. Company identity, facility type, and current workflow status.
2. Request amount, purpose, due date, and owner.
3. One neutral review outcome or evidence prerequisite.
4. A flat, icon-led finding ledger with risk severity separate from workflow status.
5. A short evidence disclosure.
6. One contextual footer action.

## Workflow semantics

- Meridian findings are projected from persisted workflow state. Reassessment, analyst judgment, escalation, and completion therefore change the queue preview and action count without a second source of truth.
- Standard cases reuse the same finding-row geometry, semantic icons, risk labels, and native button interaction.
- Northstar's missing 2027 operating forecast is an evidence prerequisite, not a finding. The unresolved preview reports the requirement explicitly. After verification, the preview reports zero findings and the 1.29x result against the 1.20x policy floor.
- Primary headings use `Review outcome` and `Evidence prerequisite`. Model attribution stays in supporting records and activity rather than repeating generic AI framing in the preview.

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
