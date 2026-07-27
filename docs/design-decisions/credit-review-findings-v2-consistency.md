# Credit-review findings V2 consistency

Last updated: July 27, 2026.

Status: current

## Decision

Use one feature-owned selected-ledger contract for Meridian and standard-case Findings, and one related prerequisite/zero-results object for Northstar. Preserve the standard layout lab as V1 and Northstar's stateful workspace as V2 in Design Tools.

The shared contract separates two concepts that must never be collapsed:

- Risk severity describes the credit consequence: Material, Moderate, or Low.
- Workflow status describes the accountable work: Needs verification, Needs judgment, Updated, Reviewed, or Complete.

Every populated finding row uses the canonical credit-review glyph map inside the shared 32px `IconTile`, a short scan summary, severity, workflow status, selected state, hover state, focus-visible state, and chevron. The selected preview keeps the cited evidence and one analyst-owned action in the same bounded workspace.

## Northstar rule

Northstar's missing 2027 Operating Forecast remains a requirement, not a finding. V3 therefore has two honest Findings states:

- Before verification: 0 open findings, one required forecast, analysis paused, and one `Resolve source` action.
- After verification: 0 open findings, 1.29x downside coverage, 1.20x policy floor, +0.09x headroom, and one `Review financials` action.

The case-header CTA is suppressed on current Northstar Findings so the state object owns the only primary task. V2 keeps its original horizontal state row and remains URL-addressable.

## Ownership

- `src/features/credit-reviews/findings/CreditFindingsWorkspace.tsx` owns credit-domain composition, not Salt primitives.
- Salt `IconTile`, `Icon`, `StatusPill`, `Button`, and tokens remain canonical shared inputs.
- Meridian keeps its evidence artifact and focused reassessment inside the workspace owner.
- Standard cases keep their policy/evidence detail and review mark inside the workspace owner.
- Northstar keeps its evidence state machine and intake flows unchanged.

## Version history

- Standard Findings V1 `Flexible layout lab` is archived and retains Split, Cards, and Queue comparisons.
- Standard Findings V2 `Decision workspace` is current and removes the production layout control.
- Northstar workspace V1 `Compact evidence blocker` and V2 `Stateful review workspace` are archived.
- Northstar workspace V3 `Coherent finding states` is current.

## Validation contract

- Verify Meridian and standard selection without route loss.
- Verify Northstar missing and verified zero-findings states.
- Verify that Northstar V2 persists its design query while moving between tabs.
- Verify exactly one task action on current Northstar Findings.
- Verify 1280 × 900 and 390 × 844 with no horizontal document overflow.
- Verify Tab focus, Enter/Space activation, hover, selected state, and reduced motion.
- Run `npm run validate`.
