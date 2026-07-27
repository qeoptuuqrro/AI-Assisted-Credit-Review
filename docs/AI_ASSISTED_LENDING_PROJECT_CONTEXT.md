# AI-Assisted Commercial Lending — Project Context

> Living project brief. Update this document whenever product assumptions, case facts, workflow decisions, or open questions change.

**Status:** Initial baseline  
**Last updated:** July 25, 2026  
**Source:** Initial project context supplied by the project owner

## Product goal

Design a high-fidelity concept for an AI-assisted commercial lending workflow. The product helps commercial credit analysts synthesize financial information, identify material risks, inspect supporting evidence, challenge weak assumptions, and write a defensible recommendation.

The AI does not approve or decline loans. The analyst owns the recommendation, and the senior credit officer owns the final decision.

> **AI handles synthesis. Humans handle judgment.**

Presentation alternative: **AI builds the case. Humans make the decision.**

The concept should demonstrate strong visual design, realistic lending logic, responsible AI behavior, human control, source transparency, recovery when AI is wrong, and a complete workflow rather than a chatbot or summary screen.

## Problem

Assume the bank already has a commercial lending platform containing applications, borrower data, financial statements, credit documents, collateral, relationship history, policies, comparable deals, and workflow status.

Basic extraction is not the main problem. Analysts still need to navigate sources, reconcile conflicts, understand performance, evaluate assumptions, identify what matters, and form a defensible judgment.

> **The information is available. The judgment is still manual.**

The AI is an intelligence layer within the existing lending workflow, not a replacement for the loan-origination system.

## Responsibility model

### AI

- Synthesize approved sources
- Detect patterns and inconsistencies
- Surface risks and positive signals
- Explain reasoning, assumptions, and uncertainty
- Connect conclusions to evidence
- Draft a preliminary assessment
- Reassess when an analyst adds evidence
- Explain what changed and what remained unchanged

### Credit analyst

- Verify material evidence
- Challenge weak or incorrect assumptions
- Add relationship and industry context
- Decide whether risks are acceptable
- Author and own the recommendation

### Senior credit officer

- Review the request, recommendation, material risks, and conditions
- Understand analyst disagreements with the AI
- Approve with conditions, return to the analyst, or decline
- Own the final decision

## Credit decision model

Organize every case around four questions:

1. **Request:** What is the borrower asking the bank to provide?
2. **Repayment:** Can the borrower repay what it borrows?
3. **Risk:** What could prevent repayment or create losses?
4. **Protection:** What protects the bank if performance weakens?

Financial statements, cash flow, debt, customer concentration, contracts, collateral, covenants, relationship history, comparable deals, and bank policy are evidence—not separate top-level decision categories.

## Fictional case: Meridian Foods

All case information is fictional and exists only for this design exercise.

| Attribute | Current fact |
| --- | --- |
| Borrower | Meridian Foods |
| Industry | Packaged food manufacturing |
| Request | $18M working-capital line |
| Technical structure | 3-year revolving credit facility |
| Situation | Growth with declining margins and increasing debt |
| Concentration | Two customers represent 61% of revenue |
| Protection | Receivables, inventory, covenants, reporting, and borrowing-base controls |
| Core decision | Whether to provide the $18M line and under what conditions |

Prefer the user-facing phrase **$18M working-capital line** over unexplained banking terminology.

### Preliminary AI assessment

**Proceed with conditions.** Meridian appears capable of supporting the requested facility, but customer concentration, declining margins, and increasing leverage require analyst judgment. This is an assessment, not an approval decision.

### Primary risks

1. Customer concentration
2. Declining margins
3. Increasing leverage

## Hero interaction: correcting the AI

This is the concept's most important interaction.

1. The AI labels customer concentration a **Material risk** because two customers represent 61% of revenue and it believes Customer A's contract expires within 12 months.
2. The analyst inspects the reasoning and discovers that the expiration assumption is outdated.
3. The analyst links evidence showing that Customer A renewed for three years.
4. The analyst requests reassessment.
5. The AI changes the finding from **Material risk → Moderate risk**.
6. The system explains that immediate contract-expiration risk decreased, while concentration remains high.
7. Original reasoning, the analyst challenge, new evidence, and revised reasoning remain in decision history.

The updated state must distinguish:

- **What changed:** Customer A's contract is renewed for three years; immediate revenue-loss risk decreased.
- **What did not change:** Customer A remains 36% of revenue; the top two customers remain 61%; long-term concentration risk remains.

Example analyst recommendation:

> Proceed with the $18M facility, subject to quarterly customer-concentration reporting and limits on additional debt.

## Critical product flow

**Credit Reviews → Meridian Foods → AI Credit Review → Customer Concentration → Challenge AI Assumption → Updated Analysis → Human Recommendation → Senior Decision Review**

Required prototype interactions:

1. Select **Needs attention**.
2. Open **Meridian Foods**.
3. Review the full **AI Credit Review**.
4. Open **Customer concentration**.
5. Inspect reasoning, assumptions, and evidence.
6. Challenge the outdated contract assumption.
7. Link or add the renewed contract.
8. Trigger reassessment.
9. Show **Material → Moderate**.
10. Show what changed and what remained.
11. Add analyst rationale.
12. Submit for senior review.

The experience should be a professional decision workspace with embedded AI, not chatbot-first.

## Screen model

### 1. Credit Reviews

Answers: **What application should I work on next?**

- Contained operational queue with fixed left navigation
- Tabs: All, Needs attention, In review, Ready for decision, Completed
- Search and practical filters
- Five primary columns: Company, Request, AI review, Owner, Due
- The AI review column communicates actionable status, not a generic risk score
- No KPI cards; a compact row preview drawer provides progressive disclosure without replacing the full review
- Selecting Meridian Foods first opens the concise preview; the full review remains the next workflow destination

### 2. AI Credit Review

Answers: **What is requested, what does the AI believe, and what needs my judgment?**

- Full page using the standard layout
- Request, Repayment, Risk, and Protection structure
- Preliminary AI assessment clearly labeled as non-final
- Purposeful financial and risk visuals
- Findings show severity, explanation, evidence count, and need for judgment

### 3. Finding Investigation

Answers: **Why did the AI reach this conclusion, and is it correct?**

- Wide layout for reasoning-versus-evidence comparison
- AI conclusion, reasoning steps, assumptions, uncertainty, impact, and evidence that could change the conclusion
- Source links, dates, passages, and conflicting evidence
- Analyst actions: agree, challenge, add context, link evidence, add note
- Progressive disclosure instead of permanently visible card overload

### 4. Updated Analysis and Recommendation

Answers: **What changed, what remains, and what do I recommend?**

- Clear risk transition and before/after reasoning
- Separate AI analysis from analyst-authored judgment
- Analyst can accept or modify the assessment, add rationale and conditions, and submit for review

### 5. Senior Decision State

Use the same case record in a **Ready for decision** state rather than creating a separate product. Show the request, AI assessment, human recommendation, risks, conditions, challenges, changes, evidence, and decision history.

## Layout and visual direction

Use two stable templates:

- **Standard:** Queue, case review, updated analysis, recommendation, and senior review
- **Wide:** Finding investigation, statements, source comparison, reasoning-versus-evidence, and change history

Keep navigation width, page-header alignment, outer padding, typography, buttons, radii, tables, breadcrumbs, and status pills consistent across both.

The interface should feel modern, restrained, calm, professional, and trustworthy. Use strong typography, whitespace, light borders, minimal shadows, clear hierarchy, restrained pills, useful charts, thoughtful evidence treatments, and progressive disclosure.

Avoid generic banking dashboards, KPI-card overload, card soup, purple AI gradients, sparkles, large AI branding, decorative charts, excessive risk colors, heavy shadows, permanent side panels, and unexplained numeric AI scores.

## Mercury reference strategy

Mercury is a design and interaction reference, not an exact product specification.

- **All Expenses:** Operational lists, tabs, filters, restrained tables, status pills
- **Invoicing:** Page hierarchy and contained operational layout; do not inherit its KPI cards automatically
- **Transactions:** Dense tables and wide investigation layouts
- **Accounting:** Human review and correction of system-generated suggestions

### Living component gallery

The product includes an internal **Design system** route as the visual contract for shared UI. It uses a Figma-style visual workspace with separate Foundations, Components, Patterns, and Templates tabs. Live component sets are arranged in broad specimen frames so variants and states can be compared directly instead of being hidden in an inventory table or narrow drawer. The shared application shell follows Mercury's measured proportions so the reference surface does not introduce shell drift.

Components will be reviewed and refined one at a time after the initial catalog is established. Reusable variants, states, usage guidance, and ownership remain visible in the catalog as the system evolves.

The Components workspace includes Preview and Inspect modes. Inspect mode lets designers hover live specimens for rendered dimensions and select a component to review its computed layout, typography, appearance, and associated design tokens. This inspection layer is intentionally hidden during normal previewing and remains owned by the Design system feature until broader reuse is proven.

The design system is named **Salt**. Salt uses three layers: Mercury-calibrated primitive scales, semantic roles that describe intent, and component contracts consumed by shared UI. Typography, color, spacing, borders, radii, control heights, and stable component states receive Salt tokens. Content-driven widths and content-led heights remain untokenized unless they represent a durable layout contract such as a sidebar, drawer, row, or control size. The component inspector shows each Salt token beside its rendered browser value.

### AI review status logic

AI review status describes the condition of the AI analysis, independently from the analyst's queue group.

| Status | Meaning | Product purpose |
| --- | --- | --- |
| **Needs judgment** | The evidence is trusted, but an important issue requires human interpretation. | Preserves human accountability. |
| **Needs verification** | The AI cannot trust or reconcile part of the evidence. | Makes uncertainty explicit and prevents guessing. |
| **Analysis ready** | The AI completed its analysis with nothing blocking analyst review. | Represents the normal unblocked path. |
| **Analysis updated** | The AI reassessed after receiving new human context or evidence. | Makes adaptation and reassessment visible. |
| **Review complete** | The analyst addressed every AI finding. | Enables handoff to a human decision-maker. |

Decision flow:

```text
AI reviews available information
  -> evidence cannot be trusted: Needs verification
  -> evidence is trusted but requires interpretation: Needs judgment
  -> otherwise: Analysis ready
Analyst reviews and adds context
  -> analysis changes: Analysis updated
  -> all findings resolved: Review complete
```

Queue rows, drawer headers, and object headers use the semantic label without a quantity: `Needs judgment` and `Needs verification`. Counts belong on aggregation surfaces such as group headings, tabs, and task-specific CTAs; do not invert the state into prose (`3 issues need judgment`) because it weakens scanning and creates inconsistent labels.

## Current locked decisions

- The product is for AI-assisted commercial credit review.
- The first page is **Credit Reviews**, a contained operational work queue.
- **My reviews** is a prioritized personal queue grouped by action state; **All reviews** is the portfolio-wide filtered ledger. The two tabs intentionally use different information structures while sharing the same Salt components and tokens.
- The queue has tabs, filters, and a company table, but no KPI cards.
- Meridian Foods opens a compact Mercury-style preview drawer before the full-page AI Credit Review.
- The drawer is a restrained summary, not a permanent side panel or substitute for the review workspace.
- Finding Investigation uses the wide layout.
- Charts appear only where they explain the credit decision.
- AI reasoning, evidence, assumptions, and uncertainty are inspectable.
- Analysts can challenge the AI and add evidence.
- Reassessment shows what changed and what did not.
- Human recommendation and final decision remain human-owned.
- Senior review is a workflow state, not a separate dashboard.
- The internal Design system catalog is the entry point for auditing shared components and preventing visual drift.
- Intelligence is a context-grounded analysis utility for case briefing and decision visualization; it links analysts back into the owning credit-review workflow and never approves, declines, or changes review state.
- The shared BCGX shell follows the Mercury reference; component-level fidelity is refined incrementally.
- The Credit Reviews route uses the Mercury Reimbursements hierarchy: title, scope tabs, workflow facets, compact filters, and a flat five-column review ledger.

## Open questions

- Exact financial figures for Meridian Foods
- Exact number and names of reviewed sources
- Exact chart types for the AI Credit Review
- Whether a finding opens inline, in a panel, or on a dedicated route
- Final analyst recommendation language

## Suggested build sequence

1. Lock case facts and financial figures.
2. Define low-fidelity screens by user question, main action, and result.
3. Write realistic product content and evidence.
4. Establish the shared visual system.
5. Polish AI Credit Review first, then queue, investigation, and updated decision.
6. Connect only the critical prototype path.
7. Create the presentation after product logic and screens stabilize.

## Success criteria

The concept succeeds when an audience can explain the analyst's problem, the AI's contribution, the human's control, the evidence behind conclusions, how incorrect AI reasoning is challenged and updated, how accountability is preserved, and why this is better than a generic chatbot.

## Maintenance notes

When updating this document:

1. Change **Last updated**.
2. Edit the relevant section rather than appending contradictory notes.
3. Move resolved open questions into the appropriate section and, when material, into **Current locked decisions**.
4. Record meaningful direction changes in the log below.

## Change log

| Date | Change |
| --- | --- |
| July 25, 2026 | Created the initial living project context from the supplied standalone brief. |
| July 25, 2026 | Added the Mercury-aligned Design system catalog and incremental component-refinement workflow. |
| July 25, 2026 | Added measured Mercury typography roles for page titles, action/filter labels, section tabs, and tab counts to the living design system. |
| July 25, 2026 | Replaced the administrative component ledger with a responsive visual workspace for foundations, component sets, lending patterns, and page templates. |
| July 25, 2026 | Added a Figma-inspired component inspection mode with hover measurements and pinned computed-style and token details. |
| July 25, 2026 | Named the product design system Salt and introduced primitive, semantic, and component token layers with direct inspector mappings. |
| July 25, 2026 | Added the first Credit Reviews operational queue using the Mercury Reimbursements structure and Salt tokens. |
| July 25, 2026 | Calibrated Credit Reviews table, tab, and filter-chip typography to live Mercury measurements and promoted FilterChip into Salt shared UI. |
| July 25, 2026 | Matched Mercury's 2px inset active-tab indicator and simplified review facets to an active All chip plus count-free status chips. |
| July 25, 2026 | Removed the queue-local search field and replaced compact selects with a Mercury Transactions-style structured filter toolbar and category popover. |
| July 25, 2026 | Simplified the Credit Reviews filter entry to Mercury Cards' single “Add filter” action with plain-language applied-filter feedback, removing redundant quick-filter buttons. |
| July 25, 2026 | Differentiated My reviews into a Mercury My Expenses-style grouped personal queue and retained All reviews as the portfolio ledger, with no page-local search. |
| July 25, 2026 | Rebuilt Credit Reviews from atomic Salt components: semantic Text, aligned DataCell, and StatusPill, with measured Mercury row spacing and documented component contracts. |
| July 25, 2026 | Refined My Reviews to Mercury's section-first queue pattern: repeated five-column headers, an Owner cell, 16px title-to-header spacing, and 48px divider-free group separation. |
| July 25, 2026 | Defined the five-state AI review language in Salt and adopted it across Credit Reviews: Needs judgment, Needs verification, Analysis ready, Analysis updated, and Review complete. |
| July 25, 2026 | Added the shared Salt compact Drawer and a Credit Reviews row preview based on Mercury Invoicing/Reimbursements proportions; the wider Transactions editor remains reserved for metadata-heavy workflows. |
| July 25, 2026 | Added the internal Design Tools launcher and typed Current/Candidate/Archived version architecture. Salt remains the only production source of truth, while replaced implementations are quarantined in Design history with automated import checks. |
| July 25, 2026 | Unified My reviews into one searchable four-column queue with shared Company, Request, AI review, and Due headers across all workflow groups. |
| July 26, 2026 | Added the Mercury Command-inspired Intelligence route with explicit `@` grounding, inspectable high-level work steps, source-backed briefing, a covenant chart follow-up, and links back to human-owned review workflows. |
