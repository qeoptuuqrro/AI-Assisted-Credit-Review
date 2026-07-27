# Northstar credit-review workspace V2

Last updated: July 26, 2026.

Status: archived; superseded by Northstar workspace V3 on July 27, 2026.

## Decision

Promote a stable five-tab credit-review shell for Northstar Health: Overview, Findings, Financials, Sources, and Activity. Preserve the replaced two-tab evidence-blocker workspace as `Northstar workspace V1 — Compact evidence blocker` in Design Tools.

The workspace distinguishes object state from navigation state. Missing evidence changes the content and next action inside each section; it does not remove the section's durable location.

## Rationale

Mercury account pages keep identity, primary actions, and flat financial records stable while the data changes. Mercury document and task patterns use progressive disclosure inside the owning surface rather than changing the application's information architecture for each lifecycle state.

Northstar therefore follows these rules:

- Overview summarizes the credit request, the affected downside analysis, and the single review priority.
- Sources owns upload, borrower request, provenance, processing, verification, and the requirement row.
- Financials preserves known current coverage and the policy floor while showing the missing downside value honestly.
- Findings remains available at count zero and explains why a verification requirement is not a finding.
- Activity keeps the shared attributable ledger and omits filters while the record is sparse.
- Recommendation remains absent until evidence produces findings and those findings complete human review.

No placeholder finding, estimated 2027 downside value, synthetic source, or fabricated activity event is introduced.

## Options

### V1 — Compact evidence blocker · archived

- Overview and Activity only.
- Upload and Request actions live directly on Overview.
- Strong for a narrow evidence-intake prototype.
- Weak for cross-case orientation and later lifecycle continuity.

### V2 — Stateful review workspace · archived

- Stable five-tab case shell with durable URLs.
- Sources owns evidence operations; other sections route to that owner.
- Blocked and zero states remain informative and actionable.
- The verified state updates Financials and Findings without changing navigation geometry.

## Component and ownership decision

- Shared primitives remain `ObjectHeader`, `Tabs`, `SectionHeader`, `Notice`, `StatusPill`, `Button`, `ActivityLedger`, `FileDropzone`, `Toast`, and `Icon`.
- Northstar section composition remains feature-owned in `src/features/credit-reviews/northstar`.
- The evidence state machine and focused request/upload workflow are unchanged.
- All Northstar workspace directions are registered in `src/features/design-tools/designOptions.ts`; archived options are URL-addressable and carry a persistent non-current notice.

V3 keeps this information architecture unchanged. It replaces only the isolated Findings row with the feature-owned findings state contract documented in `credit-review-findings-v2-consistency.md`.

## Validation contract

- Direct-load all five Northstar routes.
- Verify Arrow Left/Right/Home/End tab navigation.
- Verify missing, requested, received, processing, ready-for-review, failed, and verified evidence states.
- Verify the V1 design option, Activity navigation within V1, and Return to current.
- Check desktop and 390px mobile layouts for overflow, clipped tab labels, and ledger recomposition.
- Run `npm run validate`.
