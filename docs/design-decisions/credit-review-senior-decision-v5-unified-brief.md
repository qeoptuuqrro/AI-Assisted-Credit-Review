# Credit review senior decision V5 — Reference-aligned review flow

Date: July 28, 2026

## Decision status

V5 `Reference-aligned review flow` is archived as the narrow-reading comparison. V1–V5 remain preserved through Design Tools. V6 `Aligned decision workflow` is the shared current direction for Meridian Foods, Northstar Health, and standard credit-review cases.

## Reviewer job

The screen supports one accountable sequence:

1. Read the submitted analyst posture and rationale.
2. Confirm the request, structure, and evidence count.
3. Review the proposed approval conditions and material factors.
4. Open the durable record only when verification is needed.
5. Record one final human outcome.

This is a focused review flow, not a dashboard, a second case workspace, or a generated executive summary.

## Why the crafted composition was removed

The rejected V5 refinement gave every concept its own visual object: an inverse recommendation card, circular protection seal, icon-led fact strip, warm conditions card, colored factor tiles, risk pills, attribution block, saved state, and oversized owner footer. The result looked assembled from unrelated components and repeated information already available in the case record.

The reference-aligned correction uses the supplied finding-flow header/footer and the useful structure from narrow finance review flows. Identity is quiet, the reading measure is narrow, information is primarily expressed as flat rows, and only functional controls receive a bounded surface. The full-width scroller remains the only vertical scroll owner, so the native scrollbar sits at the viewport edge instead of beside the content column.

## Reference transfer

- Focused finding flows contribute the spacious identity header, company mark and divider, close control, centered content measure, and content-aligned Cancel / primary action footer.
- Expense Review contributes a peripheral two-step rail, narrow reading measure, flat key/value rows, restrained document-list geometry, and concise actions.
- Expense Details contributes the compact segmented decision control, lightly bounded check rows, and contextual form fields.
- The transfer is structural. Credit conditions, recommendation ownership, return rationale, and durable decision history remain lending-domain semantics.

## Information architecture

- **Identity header:** company mark, vertical divider, company name, Learning Mode utility icon, and close control. Request metadata, save state, page title, and badges are absent.
- **Workflow rail:** Recommendation and Decision only. Its desktop rule shares the header identity spine, placing the step labels directly beneath the company name; it becomes horizontal below 900px.
- **Analyst recommendation:** open typography for posture, the explicit decision question, a concise senior-review summary, author, and submission date. The submitted rationale remains unchanged in the durable case record. There is no hero card, seal, illustration, or status treatment.
- **Decision snapshot:** one shallow, lightly bounded artifact pairs the facility request and reviewed-record count with up to three case-owned decision signals. Standard cases map their typed metrics; Northstar and Meridian map their own verified financial facts. This replaces the low-value aggregate risk bar, especially for sparse one-finding cases.
- **Approval conditions:** exact conditions remain visible in a flat ruled list because they are decision-critical.
- **Material factors:** one lightly bounded disclosure list. Each collapsed row shows title, analyst status, and risk in text; detail is progressive disclosure. There are no icon tiles or pills.
- **Case record:** one quiet `Open overview` action is always visible in a restrained flat row. The senior task does not recreate the case workspace's Overview, Findings, Sources, and Activity navigation; Overview is the coherent handoff into that existing hierarchy.
- **Decision step:** one recommendation reference ledger, one two-by-two native-radio segment, contextual condition check rows, and an always-visible note. The note is optional for approval and required/relabelled for return or decline.
- **Action footer:** Cancel / Continue or Back / final outcome only. Owner identity, saved state, icons, and explanatory copy are not repeated in the footer.
- **Recorded state:** the decision form is replaced by the attributed outcome, rationale, and final conditions on the same route.

## Apex Overview handoff

- A completed standard-case preview uses `Open case overview`; unresolved `Review findings` actions still deep-link to the actual finding.
- Apex replaces three disconnected metric cards with one page-owned policy-headroom profile. Typed numeric comparisons place 3.1x leverage against the 3.70x maximum and 1.34x downside DSCR against the 1.20x minimum; $68M contracted backlog remains a supporting fact.
- The profile is a point-in-time decision comparison, not an invented trend chart. Neutral tracks, explicit policy labels, and text variance keep color from carrying meaning alone.
- Once the analyst recommendation is submitted, Overview exposes one `Review decision` action directly into the focused senior task. The dedicated senior inbox may keep its direct expert shortcut because its preview already supplies context.

## State contract

- Approve submits without conditions or a required note.
- Approve with conditions requires at least one selected condition.
- Return and decline require senior-authored rationale.
- Submission stays on the focused route and replaces the form with the durable record.
- Return projects immediately into `Waiting on analyst`; reopening preserves the return rationale in decision history and projects `Revision in progress`.
- A returned standard case preserves the original analyst submission, opens a prefilled editable revision, and requires an explicit revised submission before it can re-enter `Needs review`.
- Completing the analyst finding review alone does not create a senior-ready item; an attributable recommendation must exist first.
- Meridian, Northstar, and standard cases share the same presentation and outcome semantics.
- Draft outcome, conditions, rationale, and update time remain separate from the locked analyst recommendation.

## Component ownership

- Shared Salt: `Button`, `CompanyLogo`, `Icon`, `WorkflowSteps`, focus tokens, native field semantics, and the existing Learning Mode utility.
- Credit Reviews senior domain: `SeniorDecisionWorkspaceV5`, the page-owned decision snapshot, approval-condition list, material-factor disclosure list, case-record navigation, decision segment, and durable record.
- `SeniorReviewPackage` supplies the Learning Mode boundary for Northstar and standard routes; Meridian consumes the same workspace inside its existing learning boundary.
- No new shared primitive was introduced. A semantic `--salt-senior-decision-review-width` token keeps the 512px review and action measures aligned across every case.

## Validation contract

- 1455 × 1155, 894 × 775, and 390 × 844: no document horizontal overflow, no clipped action labels, and content-aligned actions.
- The full-width `.scrollArea` is the only vertical scroll owner; at 390px its right edge is x=390 and the visible scrollbar is at the viewport edge.
- Header is 128px on desktop and 72px on mobile; footer is 72px at every verified width.
- On desktop, the workflow rule aligns to the identity divider and its labels align visually with the company name; the clamped offset prevents rail/content overlap between the desktop and horizontal-rail breakpoints.
- Keyboard: every outcome radio and condition checkbox is reachable, visible on focus, and semantically grouped.
- Moving between Recommendation, Decision, and the recorded outcome resets the review scroller and focuses the new stage heading.
- Approve, conditional approval, return, decline, optional note, required rationale, disabled submission, and recorded state remain covered.
- The case-overview handoff remains available during Recommendation, Decision, and the recorded outcome; route handoff remains covered.
- The decision question and case-owned decision signals remain present in the focused brief; the decision note remains visible for every outcome.
- Return-to-analyst queue projection and analyst reopen remain covered for Meridian, Northstar, and standard state models.
- V1–V4 Design Tools preservation remains required.
- Visual artifacts: `output/playwright/senior-decision-v5-reference/`.
