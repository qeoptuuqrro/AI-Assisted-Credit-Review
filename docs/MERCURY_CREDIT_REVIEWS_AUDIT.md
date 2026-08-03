# Mercury Credit Reviews Translation Audit

Reference: `https://demo.mercury.com/expenses/my-expenses` for the differentiated personal queue and attachment lightbox; `https://demo.mercury.com/expenses/all-expenses` for the operational ledger; `https://demo.mercury.com/expenses/draft/expense-draft_43?mode=edit` for focused workflow sequencing, open edit composition, quiet field hierarchy, and confirmation summaries; `https://demo.mercury.com/cards` for selected-row detail, collapsed Add filter, and state-dependent actions; `https://demo.mercury.com/accounts/treasury/party-treasury-id-0` for flat Activity geometry; `https://demo.mercury.com/invoicing` for progressive disclosure; `https://demo.mercury.com/invoicing/edit-invoice/inv-solstice-overdue-web` for the split task-editor and live-artifact composition; and `https://demo.mercury.com/taxes/1099/filing/2026` for compact document rows.

The July 27 drawer-density follow-up additionally compared Subscriptions detail (`https://demo.mercury.com/subscriptions/subscription/subscription-10-2`), Bill Pay detail (`https://demo.mercury.com/payments?bill=d1f7a0c2-0001-4001-8001-000000000001`), and Scheduled payment detail (`https://demo.mercury.com/payments/scheduled?payment=recurringPayment3`). Across all three, the drawer uses one entity header, one dominant amount or object, flat section boundaries, sparse semantic pills, and no closing rule after the final row. A shallow inset surface appears only for the subscription's discrete recommendation; payment metadata remains on the open drawer canvas.

Local: `http://127.0.0.1:5182/credit-reviews`, `http://127.0.0.1:5182/credit-reviews/meridian-foods/*` including the immersive `/recommendation/draft` and `/senior-decision/review` tasks, and `http://127.0.0.1:5182/credit-reviews/northstar-health/*`.

## Overview V4 account-view transfer

A second live audit on July 26, 2026 compared Dashboard, Cards, Credit, Treasury, Financing, Invoicing, Reimbursements, Payments, the focused Send Money flow, Referrals, Company Profile, Plan & Billing, Documents, Integrations, and Insights. The repeated Mercury behavior was not a single card style: every page chooses one financial protagonist, alternates object surfaces with open canvas and flat ledgers, preserves context during progressive disclosure, and reserves full-screen takeover for focused tasks.

Transferred into Overview V4:

- The page remains in the same 968px case frame used by Findings and Financials.
- One Accounts-style summary states the preliminary posture, request, and three credit terms without simulating a document or product illustration.
- One Insights-style fixed-charge coverage chart carries the analytical weight: actual history, base case, downside, and the 1.20x floor share one scale.
- Review priorities use an Accounting-style flat ledger with one key signal, risk, and workflow state per row; decorative mini charts are removed.
- Evidence readiness and history remain secondary, and the redundant three-fact strip is removed.
- V3, V2, and V1 remain interactive Design Tools alternatives; V4 is the current production direction.

Not transferred:

- Mercury branding, product-domain card imagery, decorative marketing artwork, fake document objects, and exact page content.
- Full-screen takeover for Overview. That pattern remains exclusive to the evidence-verification task in Sources.
- Additional summary cards or colored AI provenance treatments.

## Expense-draft pattern transfer

The Mercury expense draft was audited in both Expense details and Review states at a 1280px viewport. The main task column measures 424px, standard controls are 40px high with 8px radii, and inline policy warnings are 44px high with a warm low-contrast surface. The route uses an open white canvas, a quiet two-step rail, compact helper text, and pill actions. Its Review state replaces the form with one dominant value, one policy warning, paired label/value rows, and Back/Submit actions; it does not introduce a confirmation card around every field.

A July 27 follow-up on `expense-draft_37` measured the rail relationship at a 1694px viewport. Mercury's larger negative-space interval and thin vertical spine make the steps read as peripheral orientation rather than a competing column. The July 28 Salt refinement carries that hierarchy without copying Mercury's coordinates: the bounded task column is mathematically centered, while the 152px rail sits peripherally to its left across a 64px tokenized gap. Extra canvas width therefore stays balanced around the decision task. The same audit confirmed that the persistent footer should contain terse controls only: workflow-instruction copy does not belong between the secondary and primary actions, primary labels remain one line, and focused-workflow actions share the 40px `lg` contract.

Transferred into Meridian:

- Ordered workflow context becomes quiet Assessment/Evidence/Judgment section navigation above one evidence dossier.
- The finding title moves to the open canvas while one contained review object owns the factual basis, assumptions, uncertainty, and cited evidence.
- Uncertainty uses a neutral bordered record so risk color is reserved for actual state rather than explanatory decoration.
- The judgment footer preserves Back/Submit-style action clarity while keeping the analyst as the accountable actor.
- The evidence footer uses only `Cancel` and a single-line `Review` action; the redundant “choose or add evidence to continue” instruction is removed.
- The current V9 rail uses `Evidence`, `Review`, and `Result` labels without step descriptions. Selected evidence remains white with a subtle indigo boundary, and Evidence/Review copy is reduced to one concise line per object while provenance, the read-only assessment, `Not calculated yet`, scope, and verification gates remain explicit.
- Financial scenarios use compact shared MetricCards and primary drivers use restrained mini-records rather than decorative progress bars or divider-heavy rows.

Not transferred:

- Receipt upload, currency, category, participant, and close-modal controls are expense-domain objects with no credit-review equivalent.
- Mercury's measured 424px form width establishes the local Evidence/Review/Result starting measure; the product widens that column responsively to `clamp(424px, 42vw, 560px)` on larger desktop canvases while keeping the product-wide 968px case workspace everywhere outside that immersive task.
- Mercury's exact 398px rail gap is not copied as a fixed value. V8 and V9 recreate the hierarchy with a peripheral spine, a tokenized 64px local gap, and a Salt-owned editorial measure that stays mathematically centered.
- Mercury's submit behavior is not reused for the credit decision; the analyst recommendation and the senior decision remain separate states.

## Treasury, notice, and create-invoice transfer

The July 26 follow-up audit added Mercury Statements (`https://demo.mercury.com/settings/documents/statements?accountIds=party-treasury-id-0`), NDA (`https://demo.mercury.com/tools/nda`), Transfer (`https://demo.mercury.com/send-money/transfer`), Treasury account (`https://demo.mercury.com/accounts/treasury/party-treasury-id-0`), Treasury portfolio edit (`https://demo.mercury.com/accounts/treasury/party-treasury-id-0/portfolio/edit`), and Create Invoice (`https://demo.mercury.com/invoicing/create-invoice`) as the closest patterns for consequential AI collaboration. Statements contributes a quiet ledger and focused export confirmation; NDA and Transfer contribute short staged tasks with persistent actions; Treasury edit contributes one task canvas, a pale indigo contextual notice, one meaningful allocation object, and a persistent footer; Treasury account contributes credible financial objects above a flat activity ledger. Create Invoice contributes a real split-screen composition: choice/form work on the left and a believable live business artifact on the right.

Transferred into Meridian V2:

- Preliminary assessment and revenue concentration become two restrained Treasury-style financial objects followed by flat basis and evidence ledgers.
- Pale indigo Notice explains when new evidence can change the conclusion without adding AI decoration.
- Context → Review → Result temporarily replaces the normal shell, scopes the rerun, and ends with explicit Changed and Unchanged reasoning.
- Material becomes Moderate only after the renewal agreement is linked; the 61% concentration remains and the analyst still owns acceptance. After any of the three Meridian reassessments, the focused Result step uses a vertical, rule-separated ledger: risk assessment, what changed, and what stayed the same. A retained band is stated once as `Moderate · Unchanged`, never as a duplicated before/after pair. The finding page carries the same record in its wider comparison composition, where it remains visible after judgment so the change is not silently overwritten.
- The Revise judgment state uses one connected `Decision context` card: the read-only AI assessment is the source node, an arrow is labeled `Retained` or `Revised`, and the analyst-owned risk selector is the destination node. Selecting `Material` or `Moderate` updates that destination in place while preserving the source value, making accountability and change direction visible without a duplicate risk strip.
- The prior long inline dossier remains available as AI Assessment V1 in Design Tools; the V2 focused reassessment remains an archived option, and the V9 capacity-first verification brief is current.

Transferred into Northstar:

- `Needs verification` names missing evidence, not a judgment disagreement.
- The analyst can upload the 2027 Operating Forecast directly or request it from the borrower; both routes converge on one requirement-owned evidence state.
- The shared `FileDropzone` validates PDF, XLSX, CSV, and DOCX evidence, exposes failure and replacement states, and keeps `Ready for review` distinct from verification.
- Requesting the forecast opens a focused three-stage task with the analyst workflow and footer on the left; a realistic borrower portal preview stays live on the right.
- A production borrower request does not simulate receipt. The explicitly labeled prototype-banner control advances a sent presentation state without discarding its recipient, due date, message, or sent timestamp.
- Receipt becomes a durable `Forecast received` record with `2027 Operating Forecast.xlsx`, `Marcus Reed · Secure portal`, the receipt time, extraction readiness, and `Awaiting analyst verification`.
- The verification workspace keeps the original forecast beside the extracted 1.29x downside value. `Verify & update analysis` produces one restrained result object with current coverage 1.36x, downside coverage 1.29x, bank minimum 1.20x, remaining cushion 0.09x, and `Analysis ready`.
- Overview owns the single `Resolve missing evidence` handoff. Sources removes the redundant header action and orders local actions by state: request before upload when missing, request status before upload while waiting, and received-forecast review before request history after receipt.
- Northstar V2 keeps Overview, Findings, Financials, Sources, and Activity in one stable routed shell. Missing evidence changes each section's content instead of removing the section from navigation.
- Sources owns Upload, Request, provenance, processing, and verification. Overview summarizes the blocker and routes one case-level action to Sources; Activity alone may expose a compact state-aware resume action.
- Missing evidence remains Verification rather than creating an empty or misleading finding. Findings stays available at count zero with an explanatory blocked state, then becomes a success empty state when verified analysis produces no exception requiring judgment.
- The replaced Overview-and-Activity-only direction remains selectable as Northstar workspace V1 in Design Tools; the stateful five-tab workspace is V2/current.

Transferred into Activity V2:

- Meridian and Northstar now consume one shared flat ActivityLedger with aligned Event and When columns.
- Meridian retains filters and optional whole-row disclosure; Northstar omits controls when its record is sparse.
- Northstar Overview, Findings, Financials, Sources, and Activity have durable routes instead of tab-local state.
- The replaced Meridian timeline remains fully interactive as Activity V1 in Design Tools.

Not transferred:

- Invoice totals, recipient billing details, payment terms, and Treasury allocation controls remain Mercury-domain content.
- No fake document illustration, sparkle treatment, AI avatar, chat surface, or generic progress card was introduced.

## Edit-invoice source-review follow-up

The July 27, 2026 review compared Mercury's Edit Invoice split at a 1253 × 1155 viewport with Meridian's selected-source route. Mercury's useful lesson is the relationship between zones: a confident open task editor occupies the left half, a quiet tinted stage gives the right artifact visual separation, and the footer action is structurally independent from task scrolling. Invoice content and branding are not part of the transfer.

Transferred into the focused source review:

- The left task begins with a 28px title and one readable helper line; type and review state move into the source object where they are actionable context.
- The source selector remains one compact object field flanked by independent 36px circular Previous/Next controls. Their default surface is nearly invisible, while hover, focus, and accessible destination labels make movement clear.
- Extracted values use a restrained two-column read-only field grid: 15px operational labels, 13px context, and 17px tabular values. The grid introduces meaningful visual rhythm without adding decorative charts or a second dominant card.
- The footer becomes an 88px pane-wide sibling of the scroll region: discrepancy remains quiet on the left, the 40px confirmation action sits on the right, and both edges align to the task measure. A low-elevation footer shadow separates actions from long scrolling content.
- The right artifact sits on the shared `#ededf2` gray-violet stage, within one white 520px paper object using the same 48px / 24px stage spacing observed in Mercury.
- The source page is explicitly bounded by the focused shell. Long contract reviews scroll only their task body, retain a stable scrollbar gutter at the pane edge, and keep the footer reachable.
- The product-wide Learning Mode control is icon-only while idle and expands its existing label on pointer hover or keyboard focus. Its stable `Learning mode` accessible name and `aria-pressed` state remain available on every consumer.
- The selected source route recomposes to the existing vertical mobile flow at 390 × 844 with no horizontal document overflow.

Not transferred:

- Invoice line-item fields, totals, customer editing, destination-account controls, and Mercury branding.
- Right-side tabs without real alternate source views. Document navigation and zoom remain in the existing artifact toolbar.
- Decorative widgets, charts, gradients, or a third persistent navigation rail.

## Recommendation V5 and Senior decision V5 transfer

### Cross-case senior package parity (July 27, 2026)

The focused senior-review composition is shared by Meridian Foods, Northstar Health, and standard credit-review cases. V5 separates the analyst recommendation from the accountable decision using one two-stage peripheral rail and a centered 512px review measure. Recommendation states the decision question, keeps approval conditions visible, and uses one shallow decision snapshot for the facility, reviewed record, and up to three case-owned signals. Material-factor detail remains progressively disclosed, while one quiet `Open overview` action hands off to the complete case workspace. Decision uses a restrained recommendation ledger, one native-radio segment, contextual conditions, and an always-visible note that becomes required for return or decline. The inverse hero, protection seal, colored tiles, pills, owner block, saved state, decorative cards, and sparse-case risk bar were removed after visual review showed that they created generated dashboard scaffolding or weak decision information. Northstar and standard cases no longer terminate in a route-local senior drawer when a recommendation is ready. Standard-case review marks, analyst submissions, senior decisions, and returned-recommendation reopening are session-persistent and projected back into the queue, bookmarks, and senior queue through typed workflow state.

The prior Northstar and standard drawer directions remain preserved in the existing route implementations and Design Tools history; the shared focused package is the current transfer target.

Mercury Expense Review and Payments approvals were rechecked on July 27, 2026. Expense Review confirms that a consequential staged task can temporarily replace ordinary product navigation while retaining a compact identity, exit, peripheral step rail, narrow primary measure, and generous whitespace. Payments approvals confirms that human attribution and the final action should remain contained beside a readable record rather than mixed into AI context.

Transferred into Meridian:

- Recommendation stays a durable case route for the prerequisite gate, start/resume state, submitted analyst record, and final senior record.
- `/recommendation/draft` removes global and case chrome, places Meridian identity at the left edge of the bounded canvas, and uses the shared five-stage `WorkflowSteps` spine beside one focused editor. The previous intro/readiness stack is reduced to one quiet rail summary; recommendation posture is one compact two-by-two native-radio segment with a single dynamic explanation instead of four descriptive cards. A dedicated Review stage replaces the fields with one dominant posture, flat facility facts, rationale, protections, and local edit links before submission. The 88px action footer aligns to the editor measure and uses 40px actions. Exact section and fields still autosave, and explicit exit or accepted submission still returns to Recommendation.
- `/senior-decision/review` removes global and case chrome and reuses the focused finding-flow identity header and 72px action footer. A centered 512px measure holds the Recommendation and Decision stages; the shared rail is peripheral on wide screens and horizontal below 900px. Recommendation is open typography plus the decision question, a concise senior-review summary, a bounded facility/signal snapshot, ruled conditions, a factor disclosure list, and one quiet case-overview handoff. Decision uses text-only segmented outcomes, contextual conditions, and a persistent rationale field. The full-width scroll area owns scrolling at the far-right viewport edge; the content column never creates an inset scrollbar. Senior work autosaves separately, and the decision stage becomes the durable record after submission.
- Case-level actions expose `Resume recommendation` and `Resume senior review` whenever the corresponding draft exists. `Open overview` intentionally leaves the focused task without deleting the draft; the case workspace then owns Findings, Sources, and Activity navigation.
- Recommendation V1–V4 and Senior decision V1–V4 remain addressable through Design Tools. Recommendation V5 and Senior decision V5 are current.

Not transferred:

- Expense-specific receipt, category, and reimbursement semantics.
- Payments recipient or money-movement actions.
- A viewport-width form. Full-screen removes competing chrome; the content measures remain bounded.
- Production persistence. Drafts remain session-backed until the lending workflow service owns cross-device state, permissions, and concurrency.

## Layout

- Shared Credit Reviews page title and underline scope tabs.
- My reviews defaults to a personal work queue with one collection search/filter toolbar and groups for Needs my attention, In progress, and Awaiting decision. Each group owns a repeated Company/Request/Review status/Owner/Due header directly beneath its title.
- All reviews uses workflow facets, one Add filter entry, applied-filter feedback, and a flat five-column ledger.
- My reviews includes a scoped collection search for the analyst's 12 assigned reviews. All reviews retains the Mercury-style structured filter pattern without adding a second portfolio search; global search remains in the shell.
- Selecting a row opens the current responsive credit-review rail with a stable hierarchy: identity and one review-level status, dominant request amount, one state-owned module, and source readiness grounded by visible document rows. `Needs judgment` and multi-item verification use flat ledgers; Northstar may use one prerequisite object; updated analysis may use one shallow from-to change record; completed review uses a flat recommendation or decision record. At the 968px desktop lane, the queue condenses to its Company, Review status, and Due priority fields at 544px, followed by a 32px gap and 392px rail. Narrower layouts fall back to the overlay and mobile uses the full viewport.
- Meridian's preview owns one sticky handoff, `Review findings`, into the Findings workspace; each finding row can deep-link to its focused route. The footer does not add a competing overview action. Overview, Findings, finding investigation, Financials, Sources index, Activity, and Recommendation preserve the standard shell and one 968px content width. Only a selected source opens the focused full-screen evidence workspace.
- Overview uses one open account-and-chart composition: a concise credit summary sits beside a single fixed-charge coverage chart. A flat review-priority ledger follows; fake facility artwork, redundant fact strips, generic icon rows, and cheap per-row mini charts remain only in preserved Design Tools alternatives.
- The current Findings overview keeps the selected-ledger/master-detail structure but uses compact scan summaries in the left ledger and a flatter evidence preview on the right. `Open findings` is the aggregation label; the selected finding separates risk severity from its single semantic workflow StatusPill. The evidence artifact uses quiet border-led framing instead of a nested card, while `View n sources` remains secondary to the one `Review finding` action.
- Finding investigation translates the expense-draft sequence into Assessment, Evidence, and Judgment. Its title remains on the open canvas, one primary review card contains the reasoning and cited evidence, and the analyst-owned decision stays in a contextual action footer.
- Financial scenario comparison uses one quiet grouped surface with explicit distance from the covenant floor. Primary drivers use paired metadata geometry instead of repeated horizontal rules.
- Recommendation is a durable, gated analyst handoff route. Before readiness it explains the source and analyst-review prerequisites; after readiness it launches `/recommendation/draft`, resumes the exact saved section, and returns as a submitted record. `/senior-decision/review` hides all global and case chrome, leads with Alex Kim's submitted recommendation, and gives Morgan Lee one attributable final-decision composer. Accepted decisions return to the durable record; neither surface implies that AI made the decision.

## Source-workspace transfer

Mercury Cards' selected-detail behavior was the closest live reference: the collection persists and narrows while the selected object receives most of the working surface. Meridian translates that behavior into evidence review rather than copying card-domain visuals.

- Entering Sources preserves the case header, primary tabs, and 968px frame and opens a searchable, filterable document ledger.
- Selecting a source adds `?source=<id>` and opens a focused two-zone workflow: review content on the left and one credible source document on the right.
- Closing a source returns to the Sources ledger; a source opened from a finding preserves `fromFinding=<id>` and returns to that finding.
- Queue groups are derived from live decision readiness, not immutable upload freshness. Reviewed exceptions move to Ready for decision; flagged current sources move to Needs review.
- Related original and renewal agreements link directly. Linking the renewal updates its connected-finding context and records one concise evidence event.
- Flag, clear, verify, and link actions update source state, Overview readiness, tab counts, finding evidence labels, Toasts, and Activity.
- Increasing leverage cannot complete while the debt schedule remains unresolved. The attempted completion opens that source and Back returns to the leverage finding.
- Focused review retains in-place source browsing and a single-column artifact-then-values flow at constrained widths.

## Components and ownership

Recommendation candidates were restructured after the original two-column credit memo proved too compact in-context. V1 remains archived; V2 and V3 remain candidates; V4 preserves the bounded focused lifecycle; V5/current makes that lifecycle explicitly routed, resumable, and fully immersive. Senior decision remains a separate Design Tools Screen: archived V1 preserves the dense brief, V2 preserves the focused in-shell layer, archived V3 preserves the first full-screen lifecycle, V4 preserves the command center, and V5/current provides one shared reference-aligned review flow with contextual fields and a durable on-route record. The current senior composition reuses Salt `Button`, `CompanyLogo`, `Icon`, `WorkflowSteps`, focus, form, and semantic tokens while keeping the credit-specific review rows and decision controls feature-owned.

- Shared: Salt tokens, `Text`, `DataCell`, `SearchField`, `FileDropzone`, `StatusPill`, `FilterChip`, `Button`, `Icon`, `DocumentRow`, `DocumentViewer`, `Tabs`, `WorkflowSteps`, `SectionHeader`, `ObjectHeader`, `KeyValueGrid`, `MetricCard`, `ActivityLedger`, `Timeline`, `Notice`, `Toast`, `Panel`, and the compact `Drawer` shell. `Timeline` remains the preserved Activity V1 treatment; `WorkflowSteps` is the current V9 reassessment rail while the selected focused-source direction intentionally omits it. `Badge` remains a compatibility alias for existing consumers.
- Credit Reviews-shared: `BorrowerContactSelector` stays under the borrower-request domain layer and is reused by Meridian and Northstar. Contact names use the 15px / 24px operational role and role/email metadata uses 13px / 20px; the lending-domain selector is not promoted to generic Salt UI.
- Page-owned: personal review group composition, credit-specific Owner/Due date/Facility type filters, Credit Review drawer content, finding investigation and reassessment, financial chart, source ledger, recommendation workflow, and the data-driven standard case composition. Meridian, Northstar, and standard cases supply their domain data and actions to the same shared ObjectHeader.
- Promotion target: the filter popover can become shared after a second React workflow proves the API.

## Interactions

- Scope tabs switch between structurally distinct My reviews and All reviews views.
- All reviews status facets and structured filters update the ledger.
- Filter popover closes on outside click and Escape; keyboard dismissal returns focus to the Filter/Add filter trigger.
- Without an open rail, mobile personal rows keep Company, status, and Due as the priority composition while the All reviews facet rail scrolls internally. Opening the rail at mobile width replaces the viewport and locks background scroll.
- Mouse click, Enter, or Space opens a review preview from either queue. Escape or the icon close button dismisses it and returns focus to the originating row.
- A DocumentRow opens the modal document viewer. Escape, backdrop click, or its close action dismisses it and returns focus to the source row.
- The case-level back control uses the shared quiet Button with a 14px context label and an 18px arrow. A durable case-level status may sit below company metadata, while routine verification state stays beside the affected analysis. The right edge owns at most one compact action. Meridian uses `Continue review` on case-level surfaces and suppresses it on Findings only while unresolved findings remain, where the selected preview owns `Review finding`. Once all finding judgments are recorded, the case header restores `Draft recommendation` on Findings and the other eligible tabs. Northstar's current Overview uses one case-level handoff to Sources, Sources owns Upload/Request, Findings and Financials keep their actions local, and Activity shows only a state-aware resume action. The preserved compact-blocker option keeps its Overview actions beside the evidence requirement. Completed states remove the CTA instead of presenting a disabled primary button.
- The Meridian drawer CTA enters the first actionable finding. Case tabs are addressable routes with keyboard tab navigation. Finding rows enter a wide investigation workspace and return to the Findings list without leaving the case.
- Selecting a finding updates its concise evidence preview in place. `View n sources` opens the first cited source with finding origin preserved for the return path; `Review finding` remains the only primary action and opens the focused review route.
- Every non-Meridian and non-Northstar drawer owns a status-aware handoff into its case workspace: judgment enters Findings, verification enters Sources, updated/ready analysis enters Overview, and completed review uses `Open case overview` before the final decision. Standard cases expose durable Overview, Findings, Sources, Activity, and Recommendation routes from one typed case record so queue, preview, and workspace language cannot drift.
- Standard finding rows deep-link with `?finding=<id>`, retain a visible selected state, open cited evidence in the shared DocumentViewer, and let the analyst add or remove an attributable session review mark without changing the underlying assessment. Activity disclosures, source previews, workspace Back, and Arrow-key tab navigation remain functional at every route.
- Standard cases use an explicit Recommendation checklist. Analysis-updated cases route to the affected finding with action-specific language, return to Recommendation after the analyst review mark, and submit an attributable recommendation. Submitted Overview states use one `Review decision` action into the shared focused senior task; recording an outcome adds it to Activity and leaves the analyst recommendation distinct from the approver's decision.
- Meridian submission first returns to the durable Recommendation record instead of opening a Drawer or automatically entering senior review. That record is the senior review entry point and exposes `Open senior review` or `Resume senior review`; the immersive review can exit back to the same record without losing work. Findings, Sources, and Activity remain available as supporting-record links. `Final approval conditions` are the covenants and reporting requirements incorporated into a conditional approval; they are absent for unconditional approval, return, and decline. Return and decline require a senior-authored rationale. AI is read-only supporting context and cannot submit the outcome.
- Northstar continues after forecast verification: Financials owns `Complete analysis review`; Recommendation owns analyst submission; the shared focused senior task owns approve, conditional approval, return, and decline. A return requires rationale, preserves it in Activity, and reopens the analyst recommendation for revision.
- The Customer concentration finding supports challenge, evidence linking, reassessment, Material-to-Moderate transition, explicit changed/unchanged reasoning, and analyst acceptance.
- V8 evidence intake uses one flat, whole-row selectable matched record. Upload and borrower request remain explicit alternatives; receipt or upload does not bypass analyst verification, and optional context persists with the reassessment record.
- V8 Review shows source, provenance, current read-only assessment, saved context, and affected scope without exposing the updated risk. Real checkbox confirmations gate processing; Result is the first stage that reveals the updated risk.
- V8 judgment starts unselected, omits the redundant `Updated analysis reviewed` banner, and presents descriptive Accept, Revise, and Escalate radio choices. The system assessment remains a read-only baseline; a downward arrow communicates the handoff to an analyst-owned revision.
- Northstar supports a full missing-evidence lifecycle: analyst upload or borrower request, validation, requirement matching, explicit review, verification, and Analysis ready at 1.29x. Its forecast row reopens the correct request, status, or evidence surface at every state.
- Northstar's full-screen evidence and borrower-request tasks lock background scroll, contain keyboard focus, close on Escape, and return focus to the exact action that opened them. A request-to-upload handoff keeps focus in the newly opened task rather than bouncing to the page underneath; if the completed action disappears after a state transition, focus returns to the selected case tab.
- Finding section navigation moves in place to Assessment, Evidence, and Judgment; mobile preserves the same compact sequence without numbered progress decoration.
- Financial metric/range controls, source search and selection, previous/next, related evidence, discrepancy blocking/clearing, source completion, Activity filters/disclosures, recommendation fields, conditions, and senior-review submission are interactive.

## Token contract

- All color, typography, spacing, border, radius, control-height, row-height, focus, hover, and motion values consume `--salt-*` tokens.
- Focused operational instructions, selected-record titles, field values, and decision labels use the 15px / 24px body role. Provenance, dates, counts, and secondary status copy use the 13px / 20px metadata role; this corrects semantic misuse without enlarging the global primitive scale.
- Button icons render at the shared 16px action size; object-header back navigation explicitly overrides that generic rule with a 14px context label and the measured 18px navigation arrow. Redundant arrows are omitted from self-explanatory primary CTAs.
- Every shared ObjectHeader uses a 12px back-navigation-to-identity gap from `--salt-object-header-back-to-identity-gap`; Meridian, Northstar, standard cases, and the design-system specimen inherit it without route-level spacing overrides.
- My Reviews rows use the measured Mercury 67px row rhythm, 8px vertical cell padding, 16px column rhythm, and 24px status-pill height.
- My Reviews groups use Mercury's 16px title-to-header gap and 48px inter-group whitespace, with no closing divider between groups.
- The Review status column uses the count-free `CaseStatusPill` lifecycle based on dominant next action: Needs verification, Analyst review, Ready to recommend, Awaiting decision, Revision requested, and the final Approved or Declined outcome. Analysis updates stay inside contextual preview, case, and Activity content. Counts remain on aggregation surfaces such as group headings, tabs, previews, and task-specific CTAs.
- Inside the preview drawer, the header owns that review-level status. A row pill appears only for a semantic exception or a meaningful analyst/terminal transition: Meridian's baseline judgment rows omit their duplicate pills while its verification exception remains visible; single-row judgment, updated, ready, and complete cases do not repeat the header state.
- Mercury-aligned semantic mapping stays restrained: neutral for analyst interpretation, rose for blocking evidence, indigo for recommendation or decision handoff, amber for requested revision, and moss for final approval.
- Indigo is the workflow-action color; ink remains the neutral/inverse shell color. Pale indigo Notice surfaces carry context without competing with the primary action.
- The shared ObjectHeader does not place StatusPill and primary Button in one action cluster. Primary navigation copy remains short and does not add a decorative chevron when the label already communicates movement.
- Responsive Drawer V2 keeps Mercury's 392px width, 12px radius, 56px header minimum, 24px section padding, and light two-layer panel shadow. Its desktop lane is exactly 544px queue + 32px gap + 392px rail; 400ms motion follows a 100ms entrance delay. Transactions' wider 424px, 24px-radius editor is intentionally not used.
- Document rows use the Mercury attachment pattern as a low-emphasis 52px row: document icon, filename, file/review metadata, and an open affordance. Three rows are visible by default; `View all 12` expands the list in place.
- The verification finding names the affected evidence and places its DocumentRow directly below the explanation. `Verify source` is not rendered as a generic right-column pseudo-action.
- The outcome module hands off to Sources through spacing rather than a closing rule. Flat finding and verification ledgers draw rules only between repeated siblings—never beneath the heading or after a single or final row.
- No route-private palette, type scale, or shadow system is allowed.
- The Sources index and ordinary case workspace share `--salt-layout-page-outer-max` and `--salt-layout-page-gutter-fluid`. Only a selected-source task uses `--salt-source-workspace-*` geometry contracts.
- Senior decision V5/current uses the same focused workflow header/footer grammar across Meridian, Northstar, and standard cases. Recommendation and Decision are separate rail stages rather than a simultaneous brief/composer split. Both stages use the semantic `--salt-senior-decision-review-width` measure; recommendation content is primarily flat rows and Decision uses one compact segment with contextual inputs. At every width the full-width workspace is the vertical scroll owner while the 72px footer remains aligned to the review measure. V4 preserves the command-center composition, V3 preserves the prior full-screen composer, and V2 preserves the focused in-shell geometry through Design Tools.
- Compact repayment cards use the shared MetricCard density, elevation, and semantic detail-tone contract.

## Visual QA

- Whole-product route matrix: all 79 active routes were captured at 1280 × 900, 1000 × 900, and 390 × 844 under `output/playwright/full-matrix-{desktop,laptop,mobile}/`. Every route loaded Arcadia Text and Arcadia Display, stayed within the document viewport, exposed no failed images, and emitted no runtime or console failures.
- Route loading: product workspaces now use route-level `React.lazy` boundaries under the persistent AppShell and provider tree. The production entry chunk fell from 632.52 kB to 248.58 kB, the heavy Design System and credit-review workspaces load independently, and Vite no longer emits the oversized-chunk warning. The matrix auditor waits for each routed `main h1` before collecting geometry so lazy fallbacks cannot produce false passes.
- Fresh-server interaction smoke: Credit Reviews scope/filter/drawer states, drawer and source-viewer Escape dismissal with exact trigger focus return, Reimbursements filters, bulk selection, drawer, tabs, and submit dialog, Intelligence context/loading/chart-answer states, Design System Foundations/Components/Patterns/Templates plus Inspect/Escape, standard-case Arrow-key navigation and source viewing, and Apex senior-decision recording/Activity attribution were rechecked after replacing a stale inherited Vite process. The clean browser console contained no warnings or errors.
- Corrected ObjectHeader geometry: the Meridian back control and primary action are both 32px high; the measured navigation arrow is 18 × 18px; `Continue review` is 146px wide and contains no decorative SVG. Durable status remains in the identity column when present, never in the action cluster.
- Desktop: My reviews and All reviews checked at 1280px.
- Drawer V2: My reviews measured at 1410 × 1177 as a 968px lane composed from a 544px queue, 32px gap, and 392px sticky rail. The 1100 × 900 check used a fixed overlay; 430 × 900 used a full-screen panel with internal body overflow, background scroll lock, no horizontal overflow, Escape dismissal, and exact row focus return. V1 remained a 392px fixed overlay over the full 968px queue.
- Mobile: both views checked at 390px; document width remains 390px and the status rail contains its own overflow.
- Meridian and Northstar workspaces: the shared ObjectHeader was rechecked at 1394px desktop and 390px mobile after replacing both route-owned headers. Back-control geometry, durable-status/action separation, compact labels, arrow sizing, and the Meridian first-finding action remain correct; the mobile document width is exactly 390px with no horizontal overflow.
- Expense-draft transfer: Mercury Expense details, category menu, completed field state, and Review state checked at 1280px. Meridian finding investigation checked at 1280px, 1000px, and 390px with no document overflow. The judgment footer is sticky only where the content container can support it and returns to document flow below the 920px container threshold.
- Workflow progression: stage navigation, challenge, evidence linking, Material-to-Moderate update, source flag/clear/verify/link, queue regrouping, Overview/Activity propagation, leverage evidence gate, finding return context, analyst acceptance, recommendation unlock, senior-review submission, financial metric switching, and keyboard tab navigation reverified after the redesign.
- Recommendation history: V2 and V3 remain browser-verified desktop candidates, while V4 preserves the bounded focused lifecycle and V5/current adds the routed, autosaved, resumable task. Design Tools switching and preservation are covered by focused tests.
- Senior decision history: V1–V4 preservation, V5 shared routing, screen/state separation, conditional-approval behavior, contextual rationale, and durable record replacement are covered by focused component and reducer tests. V5 was browser-verified at desktop and 390 × 844 across conditional and return states, exact viewport width, and durable-record persistence.
- AI collaboration: Meridian focused V2 and archived V1 switch/return verified; Northstar Document, Recipient, Review, sent, received, processing, and ready states, the 1.29x result, and 390px no-overflow composition verified.
- Northstar workspace V2: Overview, Findings, Financials, Sources, and Activity were reverified as durable routes at desktop width. Overview, Findings, and Sources were also checked at 390 × 844 with no document overflow; the tab rail contains its own horizontal overflow and the source ledger recomposes within the viewport. The archived two-tab V1 preserves its design query through Activity and returns to V2 without changing workflow state. Artifacts live under `output/playwright/northstar-workspace-v2/`.
- Activity: Meridian V1 timeline and V2 ledger compared at 1280 × 900; Meridian V2 and Northstar V2 checked at 390px with document width equal to viewport width. Filter chips remain single-line inside their own horizontal rail. Artifacts: `output/playwright/credit-review-activity/meridian-activity-v1-desktop.png`, `meridian-activity-v2-desktop.png`, `meridian-activity-v2-mobile.png`, and `northstar-request-mobile-viewport.png`.
- Keyboard: shared Salt Tabs verified with Arrow Right selection. Opening the drawer focuses its region, Tab reaches the visible close control, Escape dismisses it, and focus returns to the originating review row.
- Escape focus handoff: closing Design Tools with Escape now returns focus to its launcher without leaving a purple keyboard outline behind. The shell records Escape as a managed pointer-style handoff; the next Tab restores the visible keyboard focus ring. This keeps keyboard focus available without making a restored launcher look active after dismissal.
- Senior queue and decision: `/credit-reviews/senior` was rechecked at desktop with the selected-review rail leading with an explicit Decision question before analyst handoff details. `/senior-decision/review` was rechecked as a focused, chrome-free task with the analyst recommendation first, finding outcomes as read-only context, and one attributable Morgan Lee outcome composer.
- Findings hierarchy: Meridian Findings was rechecked at desktop and 390px. The selected preview now owns the single primary `Review finding` / `View judgment` action beside the title; the footer is reserved for the secondary source action. The mobile composition stacks the primary action without clipping or horizontal overflow.
- Standard cases: all 12 formerly preview-only rows were clicked through their drawer CTA and verified against the expected routed workspace. Brightline finding review/source preview, Apex decision recording/Activity disclosure, all Back paths, Enter-open, Escape-close, focus return, and Arrow Right tab routing were checked. Brightline desktop at 1280px and the queue plus Westfield Sources at 390px remain exactly viewport-width. Artifacts: `output/playwright/credit-review-standard/brightline-overview-desktop.png`, `credit-review-queue-mobile.png`, and `westfield-sources-mobile.png`.
- Console: no warnings or errors.

## Open gaps

- Counts are prototype portfolio totals; connect them to backend data when the review service exists.
- Review progression, evidence linking, reassessment, activity events, and recommendation submission are prototype-local state pending workflow service integration.
- Standard case review marks and recorded decisions are prototype-local until the review workflow service is connected; refreshing restores the canonical fixture state.
- Production document assets and rendering are not connected; the semantic document artifacts prove the interaction and visual contract. Page navigation, zoom, field-level correction, discrepancy assignment, and persisted review state remain service-backed follow-up work.
- Senior decision V5 reference-aligned artifacts are stored at 1455 × 1155, 894 × 775, and 390 × 844 under `output/playwright/senior-decision-v5-reference/`. The measured 390px route has `clientWidth = scrollWidth = 390`, one full-width scroll owner, a 72px footer, and fully contained first- and second-step actions.

## Evidence verification workflow update

The current credit-review workflow now treats evidence intake as a requirement-owned pipeline rather than a generic context form. Meridian finding reassessments and Northstar forecast verification share the same provenance and status vocabulary: existing source, analyst upload, borrower upload; uploading; ready for review; verified; failed. Acquisition labels state the actual requirement: `Choose evidence` when a matching case source is available, `Add new evidence` when the analyst must supply a newer source, and `Add required evidence` when verification is blocked.

Mercury alignment is intentionally structural rather than decorative: native file selection and drag/drop live inside restrained border-led surfaces, request and direct-upload branches converge, and the workflow keeps one primary action per stage. Upload never implies verification, reassessment never implies review completion, and optional context persists with the reassessment record but cannot replace required evidence. The earlier inline dossier remains preserved as a selectable design-history option.

## July 27 follow-up: next-step ownership and learning coverage

The queue preview now carries one concise, state-aware `Next step` notice inside the outcome section. Meridian names the analyst action (review open findings and record a judgment, or hand the completed recommendation to senior credit); Northstar names the evidence owner and verification gate (supply the 2027 forecast, then verify it before analysis resumes). The notice is a shared `Notice` composition and uses the same semantic tone mapping as the rest of the workflow. It is intentionally instructional rather than an additional CTA.

Design Tools role detection now follows nested route ownership: Meridian, Northstar, and standard case routes resolve to Analyst workspace, while the senior queue and nested senior-decision routes resolve to Senior credit workspace. This keeps the role switcher truthful when a user opens a deep link instead of only at the top-level queue.

Learning Mode was checked on the current immersive recommendation draft, immersive senior decision, and focused source-review task. Each exposes page-specific explanations, AI evidence steps, provenance, and an explicit human check while preserving the same drawer and keyboard behavior. The route matrix therefore treats these focused states as first-class learning surfaces, not exceptions to the shell.

Validation after this follow-up: `npm run validate` passed (design-history check, design-system drift check, 15 test files / 91 tests, and production build). Browser checks covered Meridian and Northstar queue drawers, recommendation draft, senior decision, focused source review, and the responsive queue composition. The browser was returned to Meridian Findings for handoff.

## July 27 follow-up: finding detail V6 (archived)

The Meridian finding route previously used `reassessment-v6-attributable-insight-brief`. This was a versioned refinement of V5, not a replacement without history. V6 kept V1–V4 archived, preserved V5 as an archived selectable option, and tested one insight-led object as the current direction.

V6's brief led with the verified change, residual exposure, and a read-only `System conclusion`. `Evidence changed` and `Still true` remained sibling ledger rows, while `Assessment basis` stayed progressively disclosed and `Record judgment` remained the only primary action. This removed the repeated risk-card/change-card/evidence-card rhythm that was visually heavier than the focused reference surfaces. Attribution language remained explicit: the product did not label the current conclusion as an AI decision.

Targeted coverage now verifies the attributable labels and preserved evidence distinction. `npm run validate` passes with 15 test files and 90 tests.

## July 27 follow-up: finding detail V7 (archived)

The Meridian finding route previously used `reassessment-v7-attributable-decision-review`. V7 preserved V5 and V6 as archived selectable options and combined their strongest hierarchy decisions instead of editing either historical design in place. V8 subsequently introduced the evidence-first editorial workflow, V9 now owns the current route, and V7 remains selectable for comparison.

One contained decision object now owns the read-only system conclusion, the explicit before-and-after risk transition, and the concise interpretation. `Evidence changed` and `Still true` remain visible as quieter sibling ledger rows, while the finding-specific financial signal explains the residual exposure without repeating the same risk and concentration values across several equally raised cards. `Assessment basis` remains progressively disclosed, evidence remains a flat source ledger, and `Record judgment` remains the only primary action on the analysis-ready finding.

The internal reference lesson is structural: use one dominant decision object, quieter supporting ledgers, and one primary action per durable state. Reference branding, source-product copy, and literal reference-page details do not enter the prototype interface. The preserved V7 option retains Salt tokens and the existing analyst-ownership, evidence-provenance, keyboard, focus, and responsive contracts.

## July 27 follow-up: finding detail V8 (archived)

The Meridian finding route used `reassessment-v8-evidence-first-decision-review` before V9. V8 preserves V7's attributable post-analysis record, but reorganizes the full-screen reassessment around the sequence the analyst actually controls: choose evidence, verify the source and scope, observe the bounded automated update, then record a separate human judgment.

The focused header keeps Meridian Foods identity and the finding context in one compact row. The responsive `clamp(424px, 42vw, 560px)` task column stays centered, a shared 152px `WorkflowSteps` rail remains peripheral to its left across a 64px tokenized gap, and the persistent footer aligns to the same task measure. Evidence leads with one flat, whole-row selectable likely renewal source while upload and borrower request remain explicit alternatives. Optional context is progressively disclosed, persists with the reassessment record, and does not compete with the evidence choice.

Review no longer forecasts a Moderate result before verification. It shows the selected source, provenance, current read-only assessment, and `Not calculated yet`; `Verify the source facts` explains that each native checkbox must be checked against the source document before `Verify & update analysis` becomes available. Automated analysis remains scoped to the affected finding, and Result is the first stage that reveals the updated risk. Result now uses one compact shared Notice and a one-sentence interpretation before the change ledger. The editorial judgment layer begins without a preselected outcome, removes the redundant static review banner, presents descriptive Accept, Revise, and Escalate choices, and retains the system result as a read-only baseline.

V1–V8 remain URL-addressable through Design Tools. V3 remains a candidate, V1, V2, V4, V5, V6, V7, and V8 are archived, and removing a historical design query returns to V9. Desktop and 390px QA must verify the full evidence-to-judgment sequence, footer clearance, focus, reduced motion, historical switching, exact viewport width, and a clean console; completed V8 artifacts belong under `output/playwright/reassessment-v8/`.

## July 27 follow-up: finding detail V9

The current Meridian finding route uses `reassessment-v9-verification-led-brief`. V9 keeps V8's evidence-first verification and accountable judgment contracts, then adds a capacity-first pre-verification composition for Increasing leverage. One object establishes the 3.7x debt / EBITDA position and 0.55x headroom against the 4.25x proposed maximum; a second object names the $2.1M equipment obligation and owns the single evidence action.

This is a domain-specific composition, not a parallel visual system. It reuses the editorial workflow, Salt panels, icon tiles, buttons, typography roles, and focused-workflow tokens. At narrow widths the two objects stack, while the evidence, review, processing, result, and judgment stages remain shared with V8. V8 remains selectable for comparison, and removing a historical design query returns to V9.

### Analyst judgment composition refinement

The shared V8/V9 judgment layer uses the same responsive Salt task measure as the evidence workflow. It replaces the earlier 96px outcome cards and the interim 640px segmented treatment with three compact stacked native-radio rows. Only one explanatory line changes with the selected outcome, so Accept, Revise, and Escalate remain explicit without repeating three paragraphs before the analyst acts.

Revise no longer opens a nested risk card with repeated ownership headings. `Analyst risk` is an open, rule-separated section: the read-only system assessment hands off vertically to a compact Material/Moderate radio selector, followed by one dynamic risk description. `Analyst conclusion` is a separate required section below it. At 390px the same composition narrows without changing its hierarchy, preserving scan speed, native radio behavior, and exact viewport width.

## July 27 follow-up: senior queue responsive cue

Senior queue V1 remains a preserved flat Mercury-style stage rail with horizontal touch and keyboard scrolling. At the true `390 × 844` viewport, the three-stage rail is wider than the available 358px content lane, so V1 adds a quiet right-edge surface fade only while additional stages remain off-screen. The cue is pointer-transparent, tokenized with the Salt surface, and disappears at the rail's end; desktop keeps the unadorned rail because all stages fit. This archived affordance remains available for comparison and does not change stage semantics, tab geometry, or document width.

Targeted V1 coverage verifies the overflow/end-state calculation. Desktop and mobile browser checks confirm no page-level horizontal overflow; the mobile rail remains internally scrollable and the desktop cue remains absent.

## July 27 follow-up: senior review queue V2

The current local senior inbox is `http://127.0.0.1:5182/credit-reviews/senior`. V1 remains selectable at `?design=senior-review-queue-v1-submissions&preset=senior-review-ready`; the preset transition removes only `preset` and preserves the historical `design` query. Design Tools marks V2 `Restrained decision inbox` Current and V1 `Submission queue` Previous.

V2 transfers Mercury Cards' flat ledger, explicit selected-row state, and collection-preserving detail behavior together with Payments approvals' role-owned queue, requester attribution, and single consequential handoff. It removes the redundant needs-review KPI tile and decorative facility object. Stage counts live in `Needs review`, `Waiting on analyst`, and `Decided`; the ledger carries Company, Recommendation, Exposure, Analyst, and Timing, preserving `Due`, `Returned`, and `Decided` meaning. No case is selected by default.

Selecting a row opens the shared responsive Salt Drawer. Its budget is two content sections and one state-aware CTA: ready submissions lead with `Decision to make`, followed by the primary recommendation, waiting state, or recorded decision with at most two facts; then `Review decision`, `View case`, or `View decision`. It does not reproduce findings, conditions, source history, or the decision composer. Desktop preserves ledger context beside the rail, intermediate layouts remove lower-priority columns, and mobile uses the full-viewport Drawer contract.

QA must cover the query-free V2 route, the preserved V1 query, design-plus-preset retention, all three stages, counts, search and empty states, explicit selection, close/Escape/focus return, responsive exit behavior, state-aware CTA destinations, the two-section/one-CTA budget, desktop and 390 × 844 widths, reduced motion, and a clean console. Run `npm run validate` after browser verification; store dedicated artifacts under `output/playwright/senior-review-queue-v2/`.
