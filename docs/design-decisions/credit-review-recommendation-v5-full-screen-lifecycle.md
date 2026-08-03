# Credit review recommendation V5 — Full-screen lifecycle

Date: July 27, 2026

## Decision status

Recommendation V5 `Full-screen recommendation` and Senior decision V6 `Aligned decision workflow` are current. Analyst V1–V4 and Senior decision V1–V5 remain saved in Design Tools with their route-scoped implementations.

## Source patterns

- Mercury Expense Review at `https://demo.mercury.com/expenses/draft/expense-draft_37?mode=edit`, rechecked July 27, 2026: a focused white task canvas, compact identity/close row, quiet section rail, narrow reading measure, generous negative space, and local Back/Submit actions.
- Mercury Payments approvals at `https://demo.mercury.com/payments/approvals`, rechecked July 27, 2026: a stable source queue, compact selected record, requester attribution, explicit approval count, and one contained human action group for Review, Approve, and Decline.

The transfer is structural. Credit-review content, actors, records, and authorization boundaries remain domain-owned.

## Product decision

Full-screen is appropriate for the two moments when a named person owns a consequential, multi-step decision. It means removing ordinary global and case chrome, not stretching a form across the viewport. Both tasks retain the bounded 968px workflow canvas, peripheral navigation, and a 424–560px reading or editing measure.

The ordinary Recommendation tab remains the durable home for readiness, resume, submitted recommendation, and final decision records.

## July 28 lifecycle refinement

The lifecycle remains V5. Mercury Expense Details, Mileage, Review, and Edit Invoice were rechecked on July 28, 2026. Their useful pattern is not a decorative card language: identity begins at the left edge, process navigation is peripheral, one bounded editor owns the active task, confirmation replaces editing before submission, and a comfortable footer remains independent from scrolling content.

The current `/recommendation/draft` therefore:

- aligns Meridian Foods and the facility to the left edge of the same 968px canvas as the process spine;
- uses shared `WorkflowSteps` for five durable sections—Recommendation, Structure, Rationale, Protections, and Review—and lets the shared component size its horizontal responsive strip from the actual stage count;
- removes the separate `Final analyst step` hero and the four-part readiness strip;
- keeps readiness as one quiet, flat `Review complete` rail row linking to Findings;
- presents the four recommendation postures as one compact two-by-two native-radio segment with one dynamic explanation, rather than four descriptive cards;
- submits only from a dedicated Review screen with one dominant posture, flat facility facts, concise rationale, selected protections, and local edit links;
- uses one 424–560px task measure and an aligned 88px footer with 40px actions;
- preserves the exact existing draft, autosave, context, exit, and submission contracts;
- leaves Recommendation V2 and V4 visually unchanged in Design Tools.

The current `/senior-decision/review` uses the same identity, rail, content, motion, and footer grammar. `Recommendation` is a reading stage with the analyst posture, facility facts, rationale, material-factor ledger, and collapsed supporting record. `Decision` is a separate accountable stage with a compact recommendation reference, one segmented outcome control, and only the conditions or rationale required by that outcome. The scroll region resets when stages change, while state transitions retain restrained opacity/translate motion and honor reduced-motion preferences.

This is intentionally not a split artifact editor. Recommendation authorship has no credible live document preview until submission, so an empty right stage would add decoration without improving the decision.

## End-to-end lifecycle

1. **Prerequisite gate:** `/credit-reviews/meridian-foods/recommendation` remains addressable before readiness and explains every unresolved finding instead of redirecting.
2. **Entry:** the case-level `Draft recommendation` action or Recommendation launch panel enters `/credit-reviews/meridian-foods/recommendation/draft`.
3. **Analyst autosave:** decision, amount, rationale, selected protections, exact active section, and update time persist in the existing session-backed Meridian workflow state.
4. **Analyst exit:** `Exit and save`, a supporting-record link, or ordinary browser navigation preserves the draft. Explicit exit returns to the Recommendation record, which changes its primary action to `Resume recommendation` and names the saved section.
5. **Analyst review and submission:** Protections continues to a dedicated Review stage. Submission is available only there; accepted submission clears only the analyst draft, adds an attributable activity event, and returns to a read-only Recommendation record. Navigation waits for the reducer to accept the record.
6. **Senior entry:** `Open senior review` enters `/credit-reviews/meridian-foods/senior-decision/review`. If work already exists, every case-level and record-level entry changes to `Resume senior review`.
7. **Senior review and autosave:** Recommendation is reviewed before Decision. The submitted analyst record, finding outcomes, and supporting links remain available without competing with the outcome controls. Decision, rationale, final conditions, and update time persist independently from the analyst record.
8. **Senior exit:** `Exit and save` returns to Recommendation without discarding work. Findings, Sources, and Activity intentionally leave the focused task while preserving the senior draft.
9. **Final decision:** approve, conditional approve, and decline clear only the senior draft, add an attributable activity event, and return to the durable final-decision record. Activity remains the chronological audit destination.
10. **Return and revision:** Return to analyst preserves the submitted recommendation, senior rationale, and both histories. The Recommendation record presents the revision request as a non-final outcome. `Revise recommendation` creates a prefilled analyst draft, moves the main queue and bookmark to `Revision in progress`, and moves the senior queue to `Waiting on analyst` until a new attributable recommendation is submitted.

## Interaction contract

- Global demo banner, sidebar, utility bar, case header, case tabs, and Design Tools launcher are absent only on the two immersive routes.
- Each immersive task keeps a compact exit action, Meridian identity, facility context, and visible save state.
- Analyst and senior section navigation is keyboard-operable. Analyst resume restores the exact saved section.
- Case context is closed by default and read-only. It cannot mutate findings or submit either record.
- Approval conditions mean covenants and reporting requirements incorporated into a conditional approval. They are hidden for approve, return, and decline.
- Return and decline require senior-authored rationale. AI is supporting context and cannot submit.
- Desktop uses bounded reading widths. At constrained widths both rails become internally scrolling horizontal strips, task content remains single-column, and footer actions stay aligned to the active content measure.

## State and service boundary

`usePersistentReviewState` continues to own prototype persistence through `sessionStorage`. `AnalystRecommendationDraft` and `SeniorDecisionDraft` are separate typed records. Submission reducers clear the corresponding draft only after all workflow guards pass.

The persistence hook emits one feature-owned same-tab workflow event after every accepted state write. Queue and bookmark projections subscribe to that event so analyst and senior actions update surrounding surfaces immediately instead of waiting for route navigation or a browser `storage` event.

This is intentionally not production persistence. A workflow service must eventually own cross-device drafts, optimistic concurrency, permissions, immutable record IDs, and notification delivery while preserving the route and component contracts above.

## Design history

- Analyst V1 `Credit memo handoff`: archived.
- Analyst V2 `Guided recommendation`: candidate.
- Analyst V3 `Review-led handoff`: candidate.
- Analyst V4 `Focused recommendation lifecycle`: candidate and direct predecessor.
- Analyst V5 `Full-screen recommendation`: current.
- Senior V1 `Dense decision brief`: archived.
- Senior V2 `Focused decision layer`: candidate and direct predecessor.
- Senior V3 `Full-screen senior review`: archived lifecycle predecessor.
- Senior V4 `Decision command center`: preserved candidate; see `credit-review-senior-decision-v4-command-center.md`.
- Senior V5 `Reference-aligned review flow`: current.

## Validation contract

- Direct access to an unready draft returns to the explicit prerequisite gate.
- Analyst exit/resume restores the exact section and latest values.
- Analyst submission produces a durable read-only record before senior entry.
- Senior exit/resume restores decision, rationale, and conditions.
- Final submission produces the durable decision record and Activity event.
- Return preserves the senior rationale, reopens a prefilled analyst draft, and synchronizes Recommendation, queue, bookmarks, and senior stage without navigation refresh.
- The two immersive routes contain no global application chrome, horizontal document overflow, clipped action, or console error at desktop and 390 × 844 mobile widths.

## Return-loop visual QA

Browser-verified on July 27, 2026 at 1280 × 900 and 390 × 844. Senior Return to analyst validation, durable revision-request record, prefilled analyst reopen, live bookmark and main-queue projection, `Waiting on analyst` senior-stage projection, preserved prior conditions, and exact mobile viewport width passed. Artifacts live under `output/playwright/credit-review-return-loop/`.

The July 28 lifecycle refinement was reverified through analyst Review and senior Recommendation/Decision at 390 × 844. The active horizontal step remains visible on resume, each stage owns its scroll region with a stable scrollbar gutter, the aligned footer remains visible over long content, and both document and body widths remain exactly 390px. Artifacts live under `output/playwright/recommendation-lifecycle-v5/`.
