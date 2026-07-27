# Credit Review Workspace V1 — Summary dashboard baseline

Preserved: July 26, 2026, before the principal-designer quality pass.

## User goal

Understand the case, investigate AI findings, verify evidence, exercise professional judgment, and prepare a defensible recommendation.

## Design hypothesis

A stable 968px routed workspace with summary cards and explicit finding states can make a complex commercial credit review feel approachable and organized.

## Advantage

- One consistent workspace width across Overview, Findings, Financials, Sources, Activity, and Recommendation.
- A complete analyst challenge loop with evidence linking and reassessment.
- Clear lifecycle semantics and human-owned recommendation.
- A restrained Salt/Mercury visual language with inspectable sources.

## Weakness

- The experience still reads as a sequence of tabs and cards more than one continuous credit decision narrative.
- The Overview communicates status well but does not yet provide a strong visual answer to Request, Repayment, Risk, and Protection.
- The finding investigation explains reasoning but relies heavily on prose instead of using the underlying credit data as visual material.
- The recommendation handoff is functional but does not yet give a senior reviewer a concise, decision-ready comparison of the original assessment, human changes, protections, and residual risk.

## Why the next option is being attempted

Explore a more decisive workspace that keeps the successful geometry and human-control model while improving visual evidence, decision framing, and the analyst-to-senior narrative.

## Preserved states

The interactive Design Options preview preserves representative versions of:

- Overview summary/dashboard composition.
- Finding investigation with Assessment, Evidence, and Judgment stages.
- Material-to-Moderate reassessment.
- Analyst recommendation and senior handoff.

The archive is read-only and isolated under `src/design-history`; production routes never import it.
