# Intelligence

Closest Mercury reference: Mercury Command.

Mercury source routes: `https://demo.mercury.com/command`, with the completed chart treatment informed by Mercury Insights.

Mercury layout pattern: existing Salt/Mercury shell, vertically centered empty state, one bounded 660px conversation rail, right-aligned user messages, unboxed assistant answers, a compact conversation header, and a sticky bottom composer.

Mercury KPI/card pattern -> IdeaGen use: no KPI strip. The only contained data surface is the decision-relevant fixed-charge coverage chart returned in response to a follow-up.

Mercury table/list pattern -> IdeaGen use: Mercury's quiet work disclosure becomes a four-step, source-aware activity list while an answer is being prepared.

Mercury drawer/panel pattern -> IdeaGen use: source evidence expands inline beside the claim it supports; the feature routes the analyst into the existing credit-review workflow instead of introducing a second detail drawer.

Mercury tabs/filter pattern -> IdeaGen use: no tabs. The `@` picker uses the shared Salt `Popover` and groups available context into Reviews, Findings, Sources, and Portfolio.

Mercury components used: shell, sidebar navigation, conversation header, prompt chips, bounded composer, user-message surface, work disclosure, answer actions, chart framing, and sticky composer behavior.

Canonical components to use/promote: `Button`, `Icon`, `StatusPill`, `Toast`, and the promoted `Popover` primitive.

Allowed content changes: commercial-credit language, approved evidence, review/finding/source context, case synthesis, covenant analysis, human-decision guardrails, and links back into the owning review workflow.

Forbidden visual changes: AI gradients, sparkle/robot identity, oversized hero illustration, a parallel product shell, floating answer cards, generic KPI tiles, decorative charts, hidden source scope, or autonomous approval/decline actions.

Required interactions: type or click `@`, filter and keyboard-navigate context, select and remove context chips, submit by button or Enter, show high-level work progress, stop a run, disclose completed work, inspect cited evidence, copy and rate answers, run a narrative example, ask a chart follow-up, hover/focus chart points, and reset the conversation.

Screenshot artifacts: `output/playwright/intelligence/intelligence-empty-desktop.jpg`, `output/playwright/intelligence/intelligence-context-picker-desktop.jpg`, `output/playwright/intelligence/intelligence-chart-answer-desktop.jpg`, and `output/playwright/intelligence/intelligence-empty-mobile.jpg`.

No custom shell, sidebar, topbar, card, table, drawer, popover, modal, tabs, toolbar, command palette, status tags, metrics, or charts.

The final sentence is the Mercury lock: every surface above is a content translation of the named Mercury pattern or a composition of canonical Salt primitives.
