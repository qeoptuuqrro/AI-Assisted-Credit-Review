# Credit review collaboration flows V2

Decided: July 26, 2026.

## Product model

Status and reassessment are separate concepts:

- `Needs verification`: reliable evidence is missing or unresolved.
- `Needs judgment`: analysis is complete enough to expose an important question, but a human must decide what it means.
- `Analysis ready`: no verification issue or escalated judgment blocks the analyst's review.
- `Review complete`: the analyst has finished the required review.
- Reassessment is the mechanism that reruns affected analysis when evidence or context changes; it is not a fifth case status.

## Meridian — human challenges the analysis

Meridian remains the deep `Needs judgment` scenario.

1. The assessment explains why customer concentration is Material.
2. Alex adds the Customer A renewal agreement and concise context.
3. The system scopes reassessment to customer concentration.
4. The result shows `Material → Moderate`, what changed, and what did not.
5. The 61% concentration remains, so Alex must accept the updated analysis and own the resulting judgment.

The old long inline dossier is preserved as `reassessment-v1-inline-dossier`, and the original focused flow remains preserved as `reassessment-v2-focused-change`. The insight-led post-reassessment composition remains an evaluation-only candidate at `reassessment-v3-insight-brief`. V8 remains the historical evidence-first direction, while the current direction is `reassessment-v9-verification-led-brief`, which keeps the same evidence selection, analyst verification, scoped analysis, and human judgment sequence and adds a capacity-first entry for the leverage finding.

## Northstar — missing evidence is resolved

Northstar is the canonical `Needs verification` scenario.

1. The 2027 Operating Forecast is missing and downside coverage is unavailable.
2. Alex requests the document from Marcus Reed with a due date, optional message, and reminders.
3. The right-hand live preview shows the exact secure borrower experience.
4. Marcus uploads the forecast through the secure document portal; supplier and receipt time remain attached to the file.
5. The received forecast is matched to the open requirement and extracted automatically.
6. Alex compares the extracted values with the original document and explicitly verifies the evidence.
7. Only the affected analysis reruns. Downside fixed-charge coverage becomes 1.29x and the case becomes `Analysis ready`.

## Mercury transfer

- Statements (`/settings/documents/statements?accountIds=party-treasury-id-0`) supplies the quiet collection-to-focused-confirmation rhythm.
- NDA (`/tools/nda`) and Transfer (`/send-money/transfer`) supply short staged tasks with persistent actions and limited disclosure.
- Treasury portfolio edit supplies the restrained financial-object hierarchy, pale contextual Notice, and sticky action rhythm.
- Treasury account (`/accounts/treasury/party-treasury-id-0`) supplies the object-above-ledger balance used in the ordinary case canvas.
- Create Invoice supplies the split screen: working controls on the left and a credible live business artifact on the right.
- Mercury's invoice, transfer, and Treasury domain content is not copied.

## Visual and component decisions

- Indigo is the primary workflow-action color and updated-state accent.
- Ink remains the inverse shell/neutral object color.
- `Notice` is a shared token-driven component with info, success, and warning tones.
- Borrower request preview, coverage visualization, and reassessment change record remain Credit Reviews-owned compositions.
- No sparkle icon, AI persona, chat-first surface, generic gradient, fake document illustration, or decorative AI card is allowed.

## Verified interactions

- Meridian Context → Review → Processing → Result → Accept updated analysis.
- Explicit Changed/Unchanged result and Material-to-Moderate transition.
- Historical Design Tools selections and return to the current route were verified in this pass. Design Tools now preserves V1–V8 and returns to current V9.
- Northstar Document → Recipient → Review → Send request.
- Waiting for borrower → Received → Ready for verification → Analyst verification → Analysis ready at 1.29x.
- Northstar split screen at desktop and single-pane 390px flow without horizontal overflow.
