# Credit review senior decision V4 — Decision command center

Date: July 27, 2026

## Decision status

V4 `Decision command center` is current. V3 `Full-screen senior review` remains a preserved archived direction and can still be selected from Design Tools.

## Senior reviewer job

The page supports one accountable sequence:

1. Understand Alex Kim’s recommendation and the requested facility.
2. Scan the few findings, protections, and risks that can change the decision.
3. Open supporting evidence only when a conclusion needs verification.
4. Record Morgan Lee’s attributable final outcome.

The page is not a second case workspace, a generic dashboard, or an AI report. Findings, Sources, and Activity remain the durable case record.

## Mercury pattern transfer

- Mercury Home establishes one financial protagonist before secondary modules.
- Mercury Payments approvals uses a flat queue, compact statuses, requester attribution, and one contained approval action.
- Mercury detail surfaces reserve elevation for the selected financial object or the immediate human action; supporting rows stay flat and border-led.
- Secondary records are progressively disclosed instead of copied into another drawer or nested page.

The transfer is structural. Lending language, record ownership, protections, and decision authorization remain credit-review domain concerns.

## Information architecture

- **Immersive task bar:** Exit and save, facility identity, save state, and decision-required status.
- **Decision header:** the final-decision task plus `$18M` as the primary financial value.
- **Analyst recommendation:** one raised protagonist with outcome, rationale, author, timestamp, and proposed-protection count.
- **Finding outcomes:** one open, flat ledger. Risk severity and workflow status remain separate.
- **Supporting record:** compact routes to Findings, Sources, and Activity. Leaving the task preserves the senior draft.
- **AI context:** collapsed and read-only by default.
- **Senior composer:** one 340px contained action surface with short radio labels, conditional protections, one decision note, attribution, and one primary CTA.

## Interaction contract

- Approve may be submitted without a note.
- Approve with conditions requires at least one selected final protection.
- Return and decline require a senior-authored note.
- Return is not classified as a completed decision. It creates a durable revision request, moves the senior queue to `Waiting on analyst`, preserves the prior submission and rationale, and lets the analyst reopen a prefilled recommendation draft.
- The CTA label changes with the selected outcome and remains one line.
- AI cannot select or submit any outcome.
- Draft decision, note, conditions, and update time continue to autosave independently from the analyst recommendation.
- Desktop keeps the brief and composer side by side. At constrained widths the composer follows the analyst recommendation before the finding ledger, so the immediate decision stays near its source context.
- Native radio, checkbox, fieldset, legend, textarea, focus ring, and disabled-button semantics remain intact.

## Version boundary

`senior-decision-v3-full-screen-review` retains its original implementation and render key. V4 uses `senior-decision-command-center` and becomes the route’s current design option. The route, reducer, draft schema, completion behavior, and durable record do not fork by version.

## Validation contract

- Verify approve, conditional approval, return, and decline.
- Verify a returned case changes bookmarks and the main queue immediately, then remains visible as `Revision in progress` after the analyst reopens it.
- Verify exit/resume and supporting-record navigation preserve the senior draft.
- Verify no horizontal overflow at desktop, intermediate, and mobile widths.
- Verify keyboard focus, radio and checkbox operation, conditional validation, and one-line CTA labels.
- Verify zero browser console warnings or errors and run `npm run validate`.

Return-loop artifacts: `output/playwright/credit-review-return-loop/returned-record-desktop.png`, `revision-in-progress-senior-queue-desktop.png`, and `returned-record-mobile.png`.
