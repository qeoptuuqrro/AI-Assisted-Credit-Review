# Credit review senior queue V2 — restrained decision inbox

Date: July 27, 2026

## Decision status

V2 `Restrained decision inbox` is current. V1 `Submission queue` is preserved as an archived, URL-addressable comparison in Design Tools.

## Senior reviewer job

The senior queue is a role-owned decision inbox, not another case dashboard. It supports one short sequence:

1. See which submitted recommendations need senior action.
2. Scan the queue by decision stage.
3. Select a case only when a preview is useful.
4. Enter the focused senior-decision task through one state-aware action.

The queue does not duplicate Findings, Financials, Sources, Activity, or the final decision composer. Those remain in the durable case record and focused senior-decision route.

## Mercury pattern transfer

- Mercury Cards provides the flat grouped ledger, restrained selected-row state, and in-layout detail behavior that preserves collection context while inspecting one object.
- Mercury Payments approvals provides the role-owned action queue, clear requester attribution, compact status treatment, and one contained handoff into a consequential human review.
- The transfer is structural. Physical-card artwork, payment-domain controls, approval counts, and Mercury-specific copy are not reproduced.

## Information architecture

- **Page header:** `Senior reviews` and one short purpose line. The prior KPI tile is removed because the active `Needs review` tab already owns the count.
- **Stage navigation:** `Needs review`, `Waiting on analyst`, and `Decided`, each with a compact count.
- **Collection search:** one bounded `Search reviews` field.
- **Flat ledger:** Company, Recommendation, Exposure, Analyst, and Timing. Company is a single-line identity; facility type is not repeated below it but remains searchable and available through request/exposure context. Recommendation uses one compact, one-word posture pill while the full authored label remains available to assistive and hover inspection. Tone communicates the kind of senior attention without replacing the label: Standard is success, Monitoring is info, and Conditional is warning. Recorded approvals remain success even when the approved package contains conditions. The recommendation track stays deliberately narrower than Exposure so short tags do not create a false padding gap. Timing retains meaningful `Due`, `Returned`, and `Decided` context instead of presenting every date as an update. Rows retain clear hover, focus, selected, and compact responsive states.
- **Selection:** no case is selected by default. A preview appears only after explicit pointer or keyboard activation, so the first view remains a calm, full-width inbox.
- **Preview:** company identity and one semantic status lead a concise responsive drawer.

## Preview budget

The preview may contain no more than two content sections and one footer CTA:

1. **Decision to make:** shown first only when a submitted recommendation is ready for senior review.
2. **Primary record:** analyst recommendation, waiting status, or recorded decision; short rationale; at most two supporting facts.
3. **One action:** `Review decision`, `View case`, or `View decision`, according to stage.

The preview does not contain a decorative facility card, a second status summary, a conditions checklist, a long evidence recap, or a second navigation action. More context belongs in the focused senior-decision task.

## Interaction and responsive contract

- The current shared Salt `Tabs`, `SearchField`, `DataCell`, `CompanyLogo`, `StatusPill`, `Button`, and responsive `Drawer` own primitive behavior and visual tokens.
- Row selection is explicit and does not navigate immediately. Closing the drawer clears the selection after its exit transition.
- The responsive Drawer owns Escape dismissal, focus return, mobile background-scroll locking, internal body overflow, and reduced-motion behavior. Its desktop height is derived from the visible viewport and sticky inset, never the scrolling parent's moving bottom edge, so scrolling cannot collapse the preview.
- Desktop keeps the ledger and selected preview visible together when the content lane can sustain both. Intermediate layouts collapse lower-priority columns. Mobile uses the Drawer contract's viewport treatment without document-level horizontal overflow.
- The queue remains read-only. Recording approve, approve with conditions, return, or decline happens only in the focused senior-decision workspace.

## Design history and URLs

- Current V2: `/credit-reviews/senior` or `/credit-reviews/senior?design=senior-review-queue-v2-decision-inbox&preset=senior-review-ready`.
- Preserved V1: `/credit-reviews/senior?design=senior-review-queue-v1-submissions&preset=senior-review-ready`.
- Applying the reproducible preset removes only `preset`; it preserves the `design` query so historical comparisons do not silently return to current.
- Design Tools marks V2 Current and V1 Previous. Returning from the V1 notice removes the historical design query and restores V2.

## QA contract

- Verify the query-free route renders V2 with no default row selection or drawer.
- Verify V1 remains interactive and clearly labelled as a non-current preview.
- Verify the combined V1/V2 `design` plus `preset` links retain the selected design after state replacement.
- Verify all three stage tabs, counts, search, empty states, row activation, selected state, close, Escape, focus return, exit transition, and state-aware CTA destinations.
- Verify the preview never exceeds two content sections and one CTA across Ready, Waiting, and Decided states.
- Verify desktop ledger-plus-drawer composition, stable drawer height before and after document scrolling, intermediate column reduction, and 390 × 844 full-viewport Drawer behavior with no page-level horizontal overflow.
- Verify keyboard tab operation, focus-visible treatment, reduced motion, Arcadia fonts, no failed images, and no console errors or warnings.
- Run `npm run validate` after the visual and interaction checks.
