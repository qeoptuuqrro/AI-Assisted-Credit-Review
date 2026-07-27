# Mercury Command → BCGX Intelligence Audit

Audited July 26, 2026 from `https://demo.mercury.com/command` at the user's 1394×1177 reference viewport and the live in-app browser's 1442×1177 viewport. Local target: `http://127.0.0.1:5182/intelligence`.

## Product translation

Mercury Command is a broad money assistant. BCGX Intelligence narrows that pattern to two analyst jobs where a language model materially improves the existing credit workflow without owning the decision:

1. **Case briefing:** synthesize one review, its material findings, and approved evidence into what changed, what remains uncertain, and what requires judgment.
2. **Decision visualization:** answer a follow-up by comparing actual, base, and downside coverage against the covenant and identifying the breach point.

The `@` context model is the primary product adaptation. It makes retrieval scope explicit before work begins and supports four object families: Reviews, Findings, Sources, and Portfolio views.

## Capture contract

### Source

- Live route: `https://demo.mercury.com/command`.
- Empty-state reference supplied by the user at 1394×1177.
- Live states inspected: empty, typed input, sample prompt, working, stopped/disabled composer, completed text answer, expanded thought process, follow-up composer, and completed chart answer.
- Local artifacts: `output/playwright/intelligence/`.

### Layout

- Preserve the existing Salt shell and compact left navigation; Intelligence is a first-class destination with a restrained `New` badge.
- Empty state centers one display title, helper, bounded composer, and two prompt pills in the available canvas.
- Active conversation uses a 660px rail, right-aligned user message, unboxed assistant response, and sticky composer.
- Completed charts sit inside the answer rail, never in a dashboard grid or secondary right rail.
- Mobile keeps one content column, composer above the global bottom navigation, and no document-level horizontal overflow.

### Text

- Navigation: `Intelligence`.
- Empty title: `Ask about your credit portfolio`.
- Placeholder: `Ask a question or give an instruction`.
- Grounding helper: `Use @ to ground the answer in a review, finding, source, or portfolio view.`
- Examples: `Brief me on Meridian Foods` and `Compare downside coverage`.
- Guardrail: approved-source synthesis; analyst owns recommendation and decision.

### Components and ownership

- Shared Salt: `Button`, `Icon`, `Popover`, `StatusPill`, and `Toast`.
- Platform-owned: route, navigation entry, and existing application shell.
- Feature-owned: `IntelligencePage`, context option data, work state machine, response compositions, source disclosure, and `CoverageChart`.
- `Popover` was promoted because floating picker geometry and states are low-domain and reusable. The chart stays local because its lending semantics are not yet reused.

### Tokens

- Reuse Salt canvas, surface, text, border, action, focus, status, spacing, radius, typography, control, motion, and z-index tokens.
- New reusable `--salt-popover-*` tokens own floating surface width, height, padding, border, radius, background, shadow, motion, and stacking.
- New `--salt-intelligence-*` component tokens own composer, context chips, message width, activity rows, sticky composer, and chart palette/geometry.
- No route-local color palette or typography scale.

### Interactions

- `@` typed or clicked opens the context picker.
- Arrow Up/Down changes the active option, Enter selects, and Escape closes.
- Selecting an option converts the mention to a removable context chip.
- Enter sends; Shift+Enter remains available for a line break.
- Work exposes four high-level activity steps without presenting private chain-of-thought.
- The composer is unavailable during work and exposes a stop control.
- Completed work collapses into a Mercury-style disclosure.
- Source chips reveal exact provenance and excerpts.
- Answer actions copy and collect helpful/unhelpful feedback with compact toast confirmation.
- Narrative output offers the relevant chart follow-up and routes back into the owning credit-review finding.
- Chart points support hover and keyboard focus with a live period/value readout.
- New analysis resets the local conversation.

### Animation

- Popover enters with Salt's 140ms transform/opacity motion.
- Activity uses a restrained rotating border and deterministic step progression.
- Source excerpts use the same short transform/opacity entrance.
- Reduced-motion is inherited from the global Salt baseline.

### Logic

- Demo responses are deterministic and selected by prompt intent: briefing language returns the narrative scenario; comparison/coverage/downside language returns the chart scenario.
- Selected context is carried into the user message so the answer scope remains inspectable.
- The chart states the covenant decision directly and exposes exact values alongside the graphic.
- Intelligence never changes a review status, recommendation, or decision; it links the analyst to the existing workflow for action.

## Visual QA

- Desktop empty state: pass at 1442×1177.
- Desktop `@` picker: pass at 1442×1177.
- Desktop narrative and chart conversation: pass at 1442×1177.
- Mobile empty state and existing chart thread: pass at 390×844.
- Mobile document overflow: 390px client width and 390px scroll width.
- Browser console warnings/errors: none.

## Open gaps

- Replace deterministic demo routing with a permission-aware retrieval and model service when backend scope is defined.
- Add persisted conversation history only after its retention, access-control, and audit requirements are approved.
- Promote the chart frame only after a second product workflow proves the same contract.
