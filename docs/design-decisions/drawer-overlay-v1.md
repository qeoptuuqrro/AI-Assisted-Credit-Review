# Drawer — Overlay preview V1

Status: **Archived; preserved as a selectable option**  
Version ID: `drawer-overlay-v1`  
Approved: July 25, 2026

## Decision

Preserve the compact right-side overlay as Credit Review Drawer V1. Product pages consume the canonical Salt `Drawer`; V1 is selected through Design Tools rather than a versioned production import.

## Source and measurements

- Mercury Invoicing and Reimbursements supply the compact detail-panel family.
- Desktop width: 392px.
- Radius: 12px.
- Header minimum: 56px with `20px 24px 12px` padding.
- Body sections: 24px padding with subtle separators.
- Shadow: light two-layer Mercury panel shadow.
- Mobile: full-viewport panel.

## Interaction

- Opens above the queue without changing the page layout.
- Keeps the originating review row selected.
- Supports mouse, Enter, and Space activation.
- Escape and the icon close button dismiss the panel and return focus to the originating row.
- The body scrolls within the drawer.

## Content hierarchy

1. Review identity and AI state.
2. Dominant request amount and facility.
3. Due date and owner.
4. Compact AI recommendation.
5. No more than three semantic finding blocks.
6. Source readiness.
7. Two or three key evidence rows using the shared `DocumentRow` primitive. `View all 12` expands the remaining documents in the same drawer.
8. One sticky, state-dependent workflow CTA when a real destination exists.

Finding blocks use a title, concise explanation, semantic status, and an affected DocumentRow when verification is required. A document opens the shared modal `DocumentViewer`; it does not open another drawer or append a summary card inside the preview.

Credit Review CTA language follows state:

- Needs judgment: `Review issues`
- Needs verification: `Verify information`
- Analysis ready: `Review analysis`
- Analysis updated: `Review changes`
- Review complete: `View recommendation`

## Why this version exists

The overlay preserves queue context and creates progressive disclosure without turning the list into a dashboard or the drawer into a full credit workspace. It intentionally avoids the wider, form-heavy Mercury Transactions editor.

## Known limitations

- The overlay covers part of the underlying ledger rather than reflowing it.
- It does not provide a side-by-side responsive workspace treatment.
- A complete routed workspace currently exists only for Meridian Foods. Other prototype reviews continue to omit the footer CTA rather than present an inert action.
- Prototype document previews communicate hierarchy and interaction but are not yet backed by production PDF assets.

## Replacement

Responsive Drawer V2 replaced this behavior on the live Credit Reviews queue after desktop, intermediate, mobile, overflow, motion, and focus-return verification. V1 remains available at `http://127.0.0.1:5182/credit-reviews?design=credit-review-queue-v1-overlay-drawer` for direct comparison.
