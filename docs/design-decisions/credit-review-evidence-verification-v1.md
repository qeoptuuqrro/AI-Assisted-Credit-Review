# Credit review evidence verification v1

Status: current

## Decision

Credit-review evidence now follows one requirement-owned pipeline across Meridian Foods and Northstar Health:

`Requirement → existing source, analyst upload, or borrower upload → ready for review → analyst verification → scoped reassessment → changed/unchanged result → human judgment`

An upload is an intake event, not a verification event. Analyst context may inform judgment but cannot satisfy a missing evidence requirement. A reassessment is an AI analysis artifact, not a decision; it replaces the affected metrics and basis while preserving the prior analysis in history. Human judgment remains a separate attributable action.

## Decision-aware finding lifecycle

The analyst chooses one of three outcomes after reviewing the current AI assessment:

- `Accept conclusion` records `Accepted by analyst`; the current AI conclusion remains primary and read-only.
- `Revise conclusion` requires both a revised risk band and an analyst-authored conclusion. The analyst conclusion becomes primary while the AI assessment remains preserved as context.
- `Escalate` records `Escalated to senior review`. It is an addressed analyst task for recommendation readiness, but it remains visibly flagged throughout the overview, findings, recommendation handoff, and senior decision brief.

Recommendation handoff is available when every finding is either resolved by the analyst or explicitly escalated. New evidence supersedes the current judgment, marks any current reassessment potentially stale, and reopens only the affected finding at `Needs verification`; prior judgments remain in history.

## Finding-specific requirements

- Customer concentration requires a renewal agreement or current customer contract. Verification updates the contract term from March 2027 to March 2030 while preserving 61% concentration.
- Declining margins requires latest operating results or pricing/cost evidence. Reassessment preserves the meaningful 14.2% to 9.1% margin trend and compares 1.12x downside coverage with the 1.20x floor.
- Increasing leverage requires the equipment agreement or classification evidence. Verification includes the $2.1M obligation in funded debt, updates leverage from 3.7x to 3.9x, and shows 0.35x covenant headroom.
- Northstar downside capacity requires the 2027 Operating Forecast. Direct analyst upload and borrower upload converge on the same verification checks and 1.29x downside result.

## Interaction contract

- The native file input supports click, keyboard focus, and OS file selection; the surrounding surface supports drag and drop.
- PDF, XLSX, CSV, and DOCX files up to 25 MB are accepted.
- An accepted prototype upload maps deterministically to the requirement fixture so the downstream experience remains testable.
- Failed validation stays inside the same requirement and supports recovery or replacement.
- Sending a borrower request does not simulate receipt in the production workflow. The borrower preview exposes the same real upload control, and received evidence still stops at `Ready for review`. For presentations, the dark prototype banner may expose an explicitly labeled `Preview received response` jump; it preserves the actual sent request and advances only the demo state.

## Visual and versioning decision

The focused reassessment workspace remains the current design. The earlier inline dossier remains available through the existing reassessment design option and was not overwritten. New intake surfaces use the Salt `FileDropzone` contract: flat border-led geometry, one primary action per stage, restrained status color, and mobile recomposition without horizontal overflow.

## Verification

- `npm run validate`
- Browser walkthrough of all three Meridian requirement definitions
- Existing-source selection, valid and invalid analyst upload, replacement, explicit verification, and changed/unchanged result
- Accept, revise, and escalate propagation through Overview, Findings, Recommendation, and senior review
- New evidence reopening an accepted, revised, or escalated finding without deleting its prior judgment
- Northstar direct and borrower-request branches, including the explicitly labeled prototype receipt bridge and confirmation that the production request state does not auto-advance
- Desktop and 390px mobile layout checks with no document-level horizontal overflow
