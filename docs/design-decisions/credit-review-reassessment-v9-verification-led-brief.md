# Credit review reassessment V9 — capacity-first verification brief

Status: current

Updated: August 1, 2026.

Supersedes: V8 `reassessment-v8-evidence-first-decision-review` as the default presentation. V8 remains a historical, URL-addressable Design Tools option.

## Decision

Keep V8's evidence-first workflow and use a finding-specific pre-verification brief when the unresolved question is capacity or covenant headroom. Increasing leverage now opens with two balanced objects:

1. `Current leverage position` keeps the professional 3.7x debt / EBITDA reading primary, translates it as $3.70 of debt for every $1 of EBITDA, and states that the ratio is 0.55x below the proposed 4.25x maximum.
2. `Required evidence` names the $2.1M equipment obligation, states that it is not yet included in the debt calculation, and owns the single `Add verification evidence` action for confirming whether it should count as debt.

The brief replaces the repeated notice, sticky judgment prompt, and duplicated blocker copy before evidence is available. It does not bypass the shared Evidence → Review → Result workflow: the document still has to be selected, provenance and material terms still have to be verified, and analyst judgment remains separate.

## Why V9 replaces V8 as the default

V8 is the right general pattern for a matched source, especially the Customer A renewal. Increasing leverage starts from a different state: the key question is not whether a likely document exists, but whether the open obligation changes capacity. The V9 brief puts that decision context in the reading path before asking the analyst to acquire evidence. This makes the current capacity, the proposed ceiling, and the unresolved gate scannable in one pass without repeating the same warning in several surfaces.

V9 is intentionally a composition variant, not a second design system. It reuses Salt `Panel`, `IconTile`, `Button`, `Icon`, `WorkflowSteps`, and the V8 editorial tokens. The CSS capacity gauge is a semantic analytical object exposed as a single labeled image; the visible values remain available in surrounding text. It is not decorative dashboard chrome.

## Interaction contract

- The leverage brief is shown only for the unresolved Increasing leverage finding while the finding still needs verification.
- `Add verification evidence` opens the same editorial evidence flow used by V8.
- A matched source records source selection, not verification. Upload and borrower request remain explicit alternatives.
- Review shows the current read-only assessment and `Not calculated yet`; every required verification check gates `Verify & update analysis`.
- Every stage transition returns both the overlay and its inner workflow surface to the top, so a short viewport never inherits the previous stage's scroll position.
- Processing, Result, and Judgment retain V8's scoped analysis, attributable language, no-default decision, and analyst-owned revision controls.
- Once evidence is verified or judgment is recorded, the brief yields to the durable finding result and decision record.

## Visual and accessibility contract

- Use one two-column object pair at desktop widths and stack the objects below 760px.
- The shared focused evidence task mathematically centers the responsive `clamp(424px, 42vw, 560px)` Evidence/Review/Result reading measure. Its 152px rail remains peripheral to the left across the shared 64px gap, keeping the task centered as the viewport expands instead of centering the combined rail-and-task mass.
- V9 shows only the durable `Evidence`, `Review`, and `Result` labels in the rail. The V8 descriptions remain preserved with that archived direction; V9 keeps instructions in the task content and uses one concise line at a time.
- A selected evidence record stays white, adds a quiet indigo boundary and explicit success state, and moves document inspection onto a subtle secondary-action surface. Selection must remain clear without making the full record dark or heavy.
- Evidence and Review favor visible objects, labels, and state over explanatory paragraphs. Preserve provenance, the read-only current assessment, `Not calculated yet`, the scoped-update explanation, and every required native-checkbox verification check; shorten surrounding copy rather than removing those safeguards.
- Keep the capacity metric in the display role, supporting labels in the UI role, and gate explanation in the body role; do not use metadata sizing for decision-critical copy.
- Preserve the ratio as the primary credit metric. Put its plain-language dollar translation directly beneath it; do not replace the ratio with a dollar amount.
- Use indigo for the measured capacity bar, warm semantic treatment for the evidence gate, and explicit text alongside every color signal.
- Keep the CSS capacity gauge exposed as one `role="img"` with a complete `aria-label`; keep its visual track and duplicate labels out of the accessibility tree, while retaining the values in surrounding text for non-visual users.
- Preserve native button semantics, visible focus, keyboard dismissal, reduced-motion behavior, and the existing no-horizontal-overflow contract.

## Ownership and history

The typed Design Tools registry owns `reassessment-v9-verification-led-brief` and the `verification-led-decision-review` render key. V1–V8 remain selectable; V3 remains a candidate and V1, V2, V4, V5, V6, V7, and V8 are archived. Removing a historical design query returns to V9.

The leverage brief remains Credit Reviews-owned because its copy and metric relationship encode lending semantics. Shared primitives and tokens remain the source of truth; no route-private shell or typography system is introduced.

## Validation

Browser QA passed at 1253 × 1155, 1280 × 720, 1000 × 900, 1470 × 657, 1440 × 1100, 820 × 1000, 430 × 900, and 390 × 844. The object pair, centered desktop and tablet task measure, stacked mobile layout, evidence-flow entry, stage-start scroll restoration, V9 label-only rail, light selected-evidence state, explicit source-fact checklist, compact result Notice, shared 40px footer actions, Escape dismissal, trigger-focus restoration, V8 historical switching, return to current V9, and a clean warning/error console were verified. The shared evidence, result, and judgment contracts remain covered by the workflow tests.
