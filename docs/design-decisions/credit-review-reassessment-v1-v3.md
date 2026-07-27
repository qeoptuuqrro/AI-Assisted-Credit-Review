# Credit review reassessment V1–V5

Updated: July 27, 2026.

## Decision status

V5 is the current production direction. V1, V2, and V4 remain archived for comparison, and V3 remains a candidate.

| Version | Registry id | Status | Design intent |
| --- | --- | --- | --- |
| V1 | `reassessment-v1-inline-dossier` | Archived | Keep assessment, evidence, reassessment, and judgment visible in one complete case page. |
| V2 | `reassessment-v2-focused-change` | Archived | Separate risk, changed evidence, unchanged conclusion, supporting analysis, and human judgment into a focused workflow. |
| V3 | `reassessment-v3-insight-brief` | Candidate | Make one revised insight the visual protagonist while keeping evidence and judgment easy to audit. |
| V4 | `reassessment-v4-breathable-judgment` | Archived | Give analyst revision a wider vertical authoring surface with a quiet AI baseline and descriptive two-position risk toggle. |
| V5 | `reassessment-v5-attributable-analysis` | Current | Keep the V4 ownership sequence while presenting the primary workflow as evidence, scoped analysis, and analyst judgment instead of repeated AI branding. |

## Why V3 exists

V2 fixed the long-page density of V1, but the post-reassessment page still gives several bordered regions similar visual weight. Risk, changed evidence, unchanged evidence, and the assessment summary can read as a collection of peers instead of one coherent answer.

V3 tests a stricter hierarchy:

1. One revision brief owns the updated AI conclusion.
2. Three compact signals expose the new evidence, the decision-driving metric, and the remaining policy or concentration constraint.
3. Two flat ledger rows explain what changed and what still matters without creating more cards.
4. One quiet closing sentence states whether the evidence changed the risk conclusion.
5. The analyst judgment remains a separate artifact because its author and accountability differ from the AI reassessment.

## What V4 established

The V2 judgment comparison kept AI and analyst values connected, but compressed the source, directional connector, selector, and explanatory copy into one short horizontal card. That geometry made the analyst-owned decision feel like another compact data comparison.

V4 keeps V2's workflow separation and V3's authorship principle, then gives the revision task a clearer vertical sequence:

1. A locked AI baseline establishes provenance without competing with the decision.
2. An explicit ownership handoff states whether the analyst is retaining or changing the assessed risk.
3. A native two-position radio toggle gives each risk label a visible dot and enough room for its operational meaning.
4. A selection summary confirms the value that will carry into Recommendation.
5. The analyst conclusion follows as the attributable written rationale.

## Why V5 is current

V4 established the right geometry and accountability model, but it still repeated “AI” in the page summary, evidence alert, matched-document explanation, preview label, processing title, progress status, primary action, and judgment handoff. That made the experience read like an AI demonstration rather than a crafted credit workflow.

V5 preserves V4 exactly as a saved design and changes the product language contract:

1. Primary surfaces say Initial assessment, Updated assessment, System assessment, or scoped analysis.
2. Matched evidence explains the match and required verification without anthropomorphic copy.
3. The processing state identifies Automated analysis once, then describes the affected work and scope.
4. The primary action says Verify & run reassessment; the audit trail and learning mode retain explicit model provenance.
5. Analyst judgment remains visually and semantically primary, with the system assessment locked as supporting context.

## Visual rules

- Use the existing Salt surface, border, radius, spacing, typography, focus, and semantic-risk tokens.
- Use one dominant surface; supporting assessment basis and source evidence remain quiet and lower on the page.
- Do not use gradients, decorative AI imagery, oversized status pills, or repeated success banners.
- Preserve the single judgment Notice after Accept, Revise, or Escalate.
- Keep the current evidence and judgment interactions unchanged.
- In the V5 Revise state, stack the read-only system baseline, analyst ownership handoff, descriptive radio toggle, and conclusion in that order.
- Keep V2's connected Decision context card available only through the archived design option.
- Stack the risk, signals, and ledger rows at narrow widths without horizontal overflow.

## Architecture

`AssessmentInsightBrief` and `RiskDecisionCard` are Credit Reviews-owned compositions because their signals and judgment semantics are domain-specific. They reuse shared `Icon`, `StatusPill`, and canonical Salt tokens, but they are not promoted into the shared design system.

The typed Design Tools registry owns all five versions. V3 applies `meridian-margin-reassessment-ready`; V4 and V5 apply `meridian-reassessment-ready`. Preset application removes only the preset query and preserves the design query. Reassessment comparisons work across all three finding detail URLs so concentration, margins, and leverage can be evaluated with realistic data. Historical options display `DesignVariantNotice`, and removing their design query restores current V5.

## Promotion criteria

Any future reassessment direction can replace V5 only after all three findings are reviewed at desktop and mobile widths and the new hierarchy proves faster to understand without hiding the audit trail. Promotion requires changing the typed registry so exactly one reassessment version is current and preserving V5 according to `docs/DESIGN_VERSIONING_ARCHITECTURE.md`.

V4 was verified at 1280 × 900 and 390 × 844. Retained and changed risk states, internal scrolling, stable footer clearance, selection copy, and horizontal-overflow checks passed. Artifacts are stored under `output/playwright/reassessment-v4/`.

V5 was verified at 1280 × 900, 1440 × 1177, and 390 × 844. The default finding page, matched-evidence review, scoped preview, processing state, result, direct result-to-judgment handoff, Revise surface, V4 design-history fallback, and horizontal-overflow checks passed. Artifacts are stored under `output/playwright/reassessment-v5/`.
