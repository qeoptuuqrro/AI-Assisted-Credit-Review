# Credit review senior decision V6 - Aligned decision workflow

Date: August 1, 2026

## Decision status

V6 `Aligned decision workflow` is current. V1-V5 remain available through Design Tools. The current layout is shared by Meridian Foods, Northstar Health, and standard credit-review cases, including Apex Manufacturing.

## Product decision

Keep two accountable stages: `Review` and `Decision`. Review is the senior approver's reading task; Decision is the durable human action. Sparse facts are consolidated inside Review rather than promoted to additional workflow stages.

The screen is a focused lending task, not a dashboard. Visual emphasis is reserved for the analyst posture, the decision question, policy position, and the final outcome control.

## Layout contract

- The shared Meridian editorial shell retains the environment banner and uses its open 128px identity header, 48px outer gutter, compact company identity, and right-side utilities.
- The identity divider and desktop workflow rail use the same token expression. The rail uses the platform's stronger neutral rule and compact 36px step height.
- Review content and footer actions share Meridian's responsive editorial task measure, `clamp(424px, 42vw, 560px)`. The workflow rail remains peripheral and does not shift the reading column away from the viewport center.
- Below 900px, the shared `WorkflowSteps` component becomes a horizontal two-step strip.
- The focused shell remains viewport-bounded at every width, matching Meridian's fixed overlay contract instead of falling back to document-level scrolling on mobile.
- The footer uses Meridian's open-canvas spacing: 32px above the actions, 48px outer gutters, and 48px below. It has no fixed border or shadow and contains only the secondary and primary actions; decision ownership is stated in the Decision stage instead of becoming a third footer object.

## Review information architecture

- Analyst posture, rationale, author, and submission time form one open typographic lead.
- The explicit credit question sits in a flat ruled band.
- One decision snapshot gives the facility/request context full width, followed by up to three case-owned decision signals. Evidence volume is intentionally left to Sources and the audit trail; a count does not establish evidence quality.
- Numeric policy comparisons use meaningful position rails derived from typed case data. Text labels carry the policy meaning, so color is not the only signal.
- Conditions and material factors use matching full-width, rule-separated sections. Material-factor status and risk share one secondary line, and the decision-relevant title may wrap instead of truncating. Detail remains progressive disclosure.
- `Open case overview` is a quiet handoff at the end of the Review stage only. The Decision composer has no competing case-navigation row; the recorded outcome places the same handoff in its action area.

## Decision information architecture

- A compact reference row preserves the analyst posture and facility amount.
- Four native-radio outcomes render as stacked decision rows using Meridian's editorial judgment grammar: a `Decision / Required` header, left-aligned radio affordances, and one plain dynamic explanation below the choices. Senior-specific labels remain `Approve`, `Approve with conditions`, `Return to analyst`, and `Decline`. A new decision starts with no outcome selected, so the senior must make an explicit choice; a saved draft resumes its selected outcome.
- Approval conditions appear only when relevant. Return and decline continue to require a senior-authored note.
- Submission behavior, draft persistence, keyboard movement, and the durable recorded state remain attributable. A recorded outcome includes the facility facts, senior owner/time, explicit senior-note state, the analyst recommendation considered, and final conditions when applicable. A return is presented as `Revision requested`, with the analyst as the next owner.

## Component ownership

- Shared Salt: `Button`, `CompanyLogo`, `Icon`, `IconTile`, `WorkflowSteps`, semantic color, spacing, focus, motion, and layout tokens.
- Credit Reviews senior domain: V6 composition, policy-position rail, consolidated review snapshot, stacked decision choices, and footer orchestration.
- No Apex-specific component or route fork was introduced.
- V5 remains an explicit Design Tools rendering and does not inherit V6 presentation changes.

## Validation contract

- Desktop: divider/rail alignment, at least 24px between navigation and content, centered review width, and footer alignment at 1024px and wider.
- Tablet: horizontal workflow strip with no rail/content overlap at and below 900px.
- Mobile: 16px shell gutters, stacked snapshot and signals, one-column outcome rows that allow the conditional-approval label to wrap, single-column detail sections, no horizontal overflow, and two equal footer action tracks on Meridian's reserved second action row.
- Interaction: visible hover, selected, focus-visible, disabled, and reduced-motion states.
- Behavior: stage focus management, scroller reset, condition guards, required rationale, draft persistence, submission, recorded state, and case-overview handoff remain covered.
