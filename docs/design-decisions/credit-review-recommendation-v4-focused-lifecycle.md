# Credit review recommendation V4 — Focused lifecycle

Date: July 27, 2026

## Decision status

V4 `Focused recommendation lifecycle` is a saved candidate and the direct predecessor to V5. V5 `Full-screen recommendation` is current; V1–V3 and V4 remain available without visual or behavioral changes.

## Problem

The original recommendation screen treats authoring, the submitted record, and senior review as one peer-tab destination. That makes a task look like a document, exposes recommendation UI before the case is ready, and sends an analyst directly into the senior decision surface after submission.

## Lifecycle

1. **Review incomplete:** the recommendation URL remains addressable, but opens a prerequisite gate with exact finding blockers and a direct `Continue review` action.
2. **Ready to draft:** `Draft recommendation` opens a focused task that temporarily removes the ordinary case header and tabs.
3. **Focused authorship:** the V2 Recommendation → Structure → Rationale → Protections sequence owns the primary canvas. A closed-by-default `Case context` rail exposes the three finding outcomes and links to Findings, Sources, and Activity only when requested.
4. **Submitted:** the focused task closes and the Recommendation tab returns as a durable, read-only analyst record with attribution, conditions, finding outcomes, and the next actor.
5. **Senior review:** `Open senior review` enters the separate focused senior-decision route. V3's evidence-to-action hierarchy remains represented by the current senior decision layer rather than competing with analyst authorship.

## Rationale

- A tab is appropriate for a durable case record; it is not the best container for a gated multi-step authoring task.
- An addressable gate is more useful than a disabled control or silent redirect because it explains why the task is unavailable and where to continue.
- V2's progressive sequence reduces drafting load. V3's evidence comparison is more useful after the analyst record exists.
- Closing the context rail by default keeps the writing canvas calm while preserving fast access to evidence outcomes.
- Submission changes ownership and therefore changes the UI from editable workflow to attributable record.

## Boundaries

- V4 is route-scoped through `design=recommendation-decision-v4-focused-lifecycle` and remains preserved after V5 promotion.
- Recommendation-specific composition remains in `src/features/credit-reviews/workspace`.
- Salt `Button`, `CompanyLogo`, `Icon`, `IconTile`, `KeyValueGrid`, `StatusPill`, and existing tokens own controls, identity, hierarchy, and responsive behavior.
- The existing `companyLogoDomains` mapping supplies the Meridian Foods identity. V4 does not introduce initials or invented logo assets.
- Analyst recommendation and senior decision remain separate attributable records. AI cannot submit either record.

## Reproducible states

- Blocked gate: reset to `Meridian · Start`, then open `/credit-reviews/meridian-foods/recommendation?design=recommendation-decision-v4-focused-lifecycle`.
- Focused draft: `/credit-reviews/meridian-foods/recommendation?design=recommendation-decision-v4-focused-lifecycle&preset=meridian-recommendation-ready`.
- Submitted record: submit the focused draft; the route remains on Recommendation.
- Senior review: choose `Open senior review` from the submitted record.

## Validation contract

- V5 remains the only Current option in the Analyst recommendation design family; V4 remains a candidate.
- The blocked route never silently redirects and identifies each unresolved finding.
- The focused draft has an explicit `Back to case` action and keyboard-operable context disclosure.
- Submission returns a read-only record before senior review.
- Desktop, intermediate, and mobile widths have no horizontal overflow, clipped controls, or inaccessible off-canvas context.
