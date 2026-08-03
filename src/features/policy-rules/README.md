# Policy Rules

Closest Mercury reference: Accounts / Auto transfer rules.

Mercury source route: `https://demo.mercury.com/accounts#auto-transfers`.

Local behavior: `/policy-rules` owns the assessment-policy overview and a shared read-only inspection dialog for all four policies. `/policy-rules/leverage-ceiling` remains a governed full-detail fallback for direct links.

Overview contract: use the existing Salt/Mercury shell, a compact `Assessment policies` header, a visually secondary `Create policy` action, and four equal icon-first cards in one desktop row. Each 132px card contains only a 40px icon tile, a two-word policy name, and a trailing chevron. The grid becomes two columns at constrained widths and one column only below a 300px content container.

Canonical overview labels: Coverage floor, Leverage ceiling, Customer concentration, and Forecast completeness. These four records remain visible regardless of persisted authoring drafts.

Progressive disclosure: the overview is for recognition and comparison, not policy administration. It has no template section, ledger heading, search, status filters, inline pause/activate controls, owner/version metadata, descriptions, outcomes, or draft rows. Every card opens the same centered inspection dialog without changing the route.

Inspection dialog contract: use the shared `Dialog` at its 720px large width. Show one concise summary, explicit status, applicable facility or portfolio scope, and an optional `Policy record` disclosure for owner, version, and effective date. Step 1, `Rule logic`, uses three equal 48px disclosure controls for `Metric`, `Limit`, and `Evidence`; only one explanation opens at a time. `Next` advances to `Outcomes`, where the same geometry explains `Within limit`, `Outside limit`, and `Evidence missing`. The footer changes from `Close` / `Next` to `Back` / `Done`. Chevrons reveal immutable policy detail; they are not selects, comboboxes, or editable values. Active-policy inspection remains read-only for every user.

Full-detail contract: `/policy-rules/leverage-ceiling` explains the rule, evidence gate, required human action, and verified Meridian Foods example on a stable direct-link route. Assessment bands are secondary reference material and remain behind a native progressive-disclosure control until requested. Pause/activate remains governed, confirmed, attributable, and available from full detail only.

Authoring contract: `Create policy` opens one canonical 720px builder. Its `Choose`, `Configure`, and `Review` progress rail is edge-anchored and shares the same left and right content edges as every stage. `Choose` presents compact wrapping icon template chips, followed by a divider and a visible sparkle-labeled custom-policy prompt. `Generate draft` stays visible beside that prompt and is disabled until trimmed prompt text exists. Template and generated entry both resolve to the same structured condition editor: an approved metric, comparator, and validated threshold. Plain-language input may propose those fields, but it is never stored or executed as a free-text formula. Review and save always create an inactive draft.

Revision contract: an authorized `Edit as draft` action may hand off from read-only inspection into the same builder. The revision is condition-only: it may change the structured metric, comparator, and threshold, while inheriting the active policy's scope, calculation method, evidence requirement, and outcome actions. Saving never mutates or supersedes the active policy. The draft records `source: "existing_policy"`, its base rule id, and base version; the audit entry preserves that lineage with actor and time. A separate authorized review and activation is required before the draft can replace an active version.

Mercury components used: compact page header, four equal icon-first cards, 40px icon treatment, bounded centered dialog, large aligned disclosure surfaces, short step progression, sentence-like authoring, compact status pills, contextual notices, and nonblocking toast feedback.

Canonical components to use/promote: `Button`, `CompanyLogo`, `Dialog`, `Icon`, `IconTile`, `Notice`, `ObjectHeader`, `StatusPill`, `Text`, and `Toast`. Search, filter, and drawer primitives are intentionally not part of the normal overview interaction.

Allowed content changes: bank-owned calculations, thresholds, evidence gates, facility or portfolio scope, policy actions, attributable draft explanations, analyst recommendation ownership, and senior-credit decision ownership.

Forbidden changes: text-heavy overview cards, more than one desktop card row, a template gallery or searchable rule ledger on the overview, inline overview lifecycle controls, rendered authoring drafts, inline editing of an active policy, unlinked revisions, executable free-text formulas, changing inherited scope/calculation/evidence/outcomes in a condition-only revision, returning to a drawer or routed page for normal card inspection, duplicating or inventing company marks, autonomous AI policy edits, AI-generated active rules, enterprise-wide framing for Meridian's proposed 4.25x facility covenant, hidden evidence requirements, approval claims based only on a passing threshold, a second product shell, decorative KPI cards, gradients, or editable-looking controls without behavior.

Required interactions: scan all four policies; open each card's inspection dialog; disclose metric, limit, evidence, record, and outcome explanations one at a time; move through `Next`, `Back`, and `Done`; close by button, close icon, backdrop, or Escape with exact trigger focus return; deep-link directly to Leverage full detail; pause or activate there through governed confirmation; disclose assessment bands on demand; open the builder from `Create policy`; choose a compact template or generate a structured draft; edit only supported condition fields; protect dirty close; allow authorized users to start a linked `Edit as draft` revision without mutating the active policy; announce feedback; and respect reduced motion.

The Mercury lock: this surface translates the clarity and restraint of Accounts / Auto transfer rules into commercial-credit policy. Domain complexity is revealed only when the user asks for detail or authoring.
