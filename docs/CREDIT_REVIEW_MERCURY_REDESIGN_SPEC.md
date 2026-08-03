# Credit Review Mercury Redesign Specification

Status: implementation contract  
Date: July 26, 2026  
Local: `http://127.0.0.1:5182/credit-reviews/meridian-foods`

## Objective

Redesign the Meridian Foods credit-review workspace so it feels like one deliberate Mercury product: a stable case canvas with generous whitespace, a small number of carefully composed surfaces, useful visual artifacts, and focused review interactions. Evidence review may deliberately expand into a wider task workspace when simultaneous source, document, and value comparison requires it. The result must reduce text density and generic AI-dashboard styling without turning the workspace into a collection of decorative cards.

The redesign must preserve the complete evidence → reassessment → recommendation workflow, the analyst/senior-review separation, and the existing Salt component contract.

## Requirement inventory

1. Keep Overview, Findings, finding investigation, Financials, Activity, and Recommendation at one stable desktop content width. Sources is the single deliberate exception: entering evidence review switches to a wide, bounded work mode with persistent source, artifact, and verification panes rather than creating an arbitrary tab-width change.
2. Make the Overview preliminary assessment more distinctive and breathable while remaining recognizably Mercury. It should communicate a decision posture at a glance rather than appearing as an oversized plain text box.
3. Reduce text-on-text-on-text composition with semantically useful icons, small diagrams, document artifacts, compact data visualizations, and whitespace.
4. Do not make every section a card. Choose among raised object cards, flat ledgers, grouped rows, split views, open canvas sections, and compact inset callouts based on information behavior.
5. Replace decorative scenario lines and progress-bar-like treatment in Repayment capacity with clear numeric comparison and spatial hierarchy.
6. Create focused document verification/review experiences informed by Mercury recipient matching and expense editing: one task, one primary artifact, one clear decision path.
7. Keep implementation component-first. Reusable geometry and interaction behavior must be defined in Salt tokens/primitives before screen-specific styling.
8. Replace Design Tools popup previews. Choosing a design option must replace the current production screen in place, preserve the current screen/area, and expose related variants together (for example Overview V1 and Overview V2).
9. Preserve keyboard behavior, reduced motion, mobile recomposition, focus return, semantic state, and the existing end-to-end review progression.

## Non-goals

- Do not copy Mercury’s banking nouns, account objects, card artwork, or illustrations literally.
- Do not add chat bubbles, sparkles, glowing gradients, agent avatars, “AI insight” labels, generated-content badges, or purple/blue AI-product visual language.
- Do not widen ordinary tabs to fit their content. The dedicated Sources mode may use its documented wide-workspace contract because comparison—not decoration—requires the space.
- Do not hide important underwriting rationale behind decorative summaries.
- Do not create a second token system or route-private component library.
- Do not use an illustration merely to fill empty space.

## Design principles

### One canvas, changing composition

The shell owns a 968px maximum case canvas with shell-aware fluid gutters. Ordinary tabs and focused finding views consume that frame. Evidence review is a purposeful mode switch: the case header and tabs disappear and a bounded 1520px source workspace uses the available application canvas. This spatial change must happen only at the route boundary and must never vary source-by-source.

### Cards represent objects

A bordered or raised card is justified only when it represents an object with its own state or action: the preliminary assessment, a document under review, an actionable finding, or a submission record. Headings, explanatory paragraphs, metadata, and ordinary groups should generally live on the open canvas or in flat rows.

### Visuals clarify work

Icons identify repeated row types and make scanning faster. Illustrations explain a single high-level state or domain concept. Charts and diagrams expose relationships. None of them replace labels, status text, or evidence.

### Color communicates state sparingly

Neutral surfaces establish hierarchy. Moss, amber, rose, and indigo are reserved for completed, judgment, evidence-risk, and changed states. Decorative gradients and multi-hue chart palettes are forbidden.

### Progressive detail

Overview answers “What is the posture, why, and what needs attention?” Findings and Financials expose analysis. Sources and focused verification expose evidence. Recommendation exposes the accountable decision record. The same explanation must not be repeated on every tab.

## Surface taxonomy

| Surface | Use when | Credit-review use | Do not use for |
| --- | --- | --- | --- |
| Signature object card | One important object owns a state, summary, and next action | Preliminary assessment | Generic section framing |
| Metric card cluster | Two to four comparable values need rapid scanning | Request, leverage, repayment cushion | Narrative evidence |
| Flat ledger | Repeated records share a stable schema | Sources, activity, findings inventory | One-off summaries |
| Grouped task rows | A short ordered or status-oriented list needs icons and actions | Review priorities, filing-like verification tasks | Long prose |
| Split workspace | User compares an artifact with extracted/decision data | Document verification, financial source review | Overview decoration |
| Open canvas section | Content benefits from breathing room and editorial hierarchy | Recommendation rationale, financial commentary | Dense repeated data |
| Inset callout | A compact exception or uncertainty must stay close to context | Covenant warning, source caveat | Primary content container |
| Tabs/segmented switch | Mutually exclusive views share context | Case tabs, Base/Downside comparison | Sequential workflow steps |

## Mercury route audit matrix

The audit must inspect the default state and every meaningful tab, control, list item, card, or focused workflow that affects hierarchy. Exact measurements and interaction notes are added to the evidence column before implementation decisions are finalized.

| Mercury route | Patterns to inspect | Candidate transfer | Evidence status |
| --- | --- | --- | --- |
| `/cards` | Card illustration, card-status object, empty/issued states, tabs, filters, selected details | A tasteful assessment artifact and restrained iconography | Audited: Manage, Subscriptions, filters, selected detail |
| `/accounts/credit` | Credit overview hierarchy, balances, action grouping, compact facts | Assessment metrics and financial-summary hierarchy | Audited: summary, disclosure, chart, Autopay, ledger |
| `/send-money/pay/recipient-match` | Focused matching task, comparison choices, back/continue behavior | Document/entity verification workflow | Audited through stateful Send flow: start and recipient detail |
| `/accounts/treasury/party-treasury-id-0` | Split composition, left insight/right overview, chart/object balance | Financials composition and evidence/decision split | Audited: Activity and Portfolio |
| `/expenses/draft/expense-draft_37?mode=edit` | Focused edit canvas, step context, review summary, inline warning | Finding investigation and document review | Audited: edit, category menu, receipt rows, Review |
| `/accounts#auto-transfers` | Accounts hierarchy, anchored subsection, rule rows | Condition/task rules and compact recurring records | Audited: four rule types and focused rule setup |
| `/taxes/1099/filing/2026` | Filing updates/tasks, row icons, progress/status, document grid | Review priorities and source-verification tasks | Audited: tasks, W-9 request, recipient ledger, Tax Documents |
| `/settings/vault` | Security object presentation, empty/populated states, disclosure | Sensitive-source and permission states | Audited: status strip, insurance, Treasury, disclosure |
| `/settings/account-security` | Settings sections, status rows, actions, dividers | Case controls and accountable workflow metadata | Audited: suggestions, filters, activity ledger |
| `/settings/company-profile` | Open key/value ledger, real logo object, restrained inline actions | Ordinary case metadata and borrower facts | Audited: company identity and full profile ledger |
| `/settings/referrals` | One credible product object beside concise explanation, then flat ledger | Overview and Sources introductory composition | Audited: bonus object, referral explanation, URL action, status ledger |
| `/settings/*` | Every Company, Team, Security & Controls, API, Personal, and Explore section | Page hierarchy, density, status, action, and empty-state rules | Audited: all visible Settings links and their primary controls/tables |

## Live Mercury audit findings

Audited July 26, 2026 at a 1280 × 720 reference viewport. The recurring Mercury content rail is approximately 968px after the 199px navigation rail and fluid page gutters. The important observation is not the number alone: heading, top objects, underline tabs, and flat ledgers keep the same left and right anchors while their internal composition changes.

### Cards

States exercised: Manage, Subscriptions, Add filter, Type and Status filter panels, and the first issued-card detail.

- Manage opens with one recommendation object, not a dashboard of equal cards. The recommendation is a two-part 968px surface: concise policy copy on the left and a faded product artifact on the right. The visual is contextual evidence, not an abstract illustration.
- The surface uses a very light border, roughly 12px radius, approximately 24px internal padding, and no strong colored fill. A small “Recommended” label creates entry hierarchy.
- Manage then switches to underline tabs, an inline filter builder, and a flat ledger. The selected card does not open a modal; the ledger narrows in place and a substantial right-side object panel appears inside the same content rail.
- That selected panel uses a realistic card object as the visual anchor, followed by status and actions. The object gives the panel style; excess decoration is unnecessary.
- Subscriptions replaces the large recommendation with two compact promotional cards, each using one 16px semantic icon, short copy, text CTA, and dismiss action. Below it is a flat merchant ledger with small merchant marks and circular row actions.
- Transfer: use one meaningful assessment artifact and an in-place split selection for source review. Reject: copying literal payment-card artwork or placing promotional tiles across the underwriting workspace.

### Credit account

States exercised: default balance summary, Show details/Hide details, Autopay settings, linked headline facts, and transaction ledger.

- The page opens on the same 968px rail but its top is an open 2-column composition: approximately 296px of balance/disclosure controls on the left and the remaining width for a quiet line/area chart.
- The balance bar is short and factual. Show details adds a four-row numeric breakdown directly below; it does not wrap the numbers in four cards.
- Autopay and Linked Accounts are two 40px contained action rows rather than feature cards. Autopay opens a focused settings dialog with one explanation and grouped rule rows.
- “This month” is a horizontal fact strip with four linked metrics. The activity below is a flat, date-grouped ledger whose event-type glyphs distinguish spend, fee, card, cashback, and payment records.
- Transfer: Financials should use open split geometry, in-place disclosure, a horizontal fact strip, and icon-led activity rows. Reject: the balance progress meter as a repayment-capacity metaphor because underwriting scenarios are not consumption quotas.

### Send money / recipient matching

States exercised: stateful Send entry, Upload a bill vs Select a recipient, recipient search/recent rows, selected-recipient detail, payment-method control, and the next-step frame. The supplied `recipient-match` deep link redirects when opened without Send-flow state, so the same workflow was audited from `/send-money/pay/start` and `/send-money/pay/recipient-details`.

- The focused workflow removes the regular left navigation while retaining the demo bar and product identity. A narrow 560px task column sits on an open white canvas.
- The start view offers one large upload drop zone, then an explicit “OR”, recipient search, two compact creation actions, and flat recently-paid rows. It does not contain an outer modal card.
- After selection, a quiet vertical step rail sits at the left edge of the content region. The selected recipient is a contained object, while payment-method fields stay on the open canvas.
- Back/Next actions are local and fixed to the task flow. An unobtrusive right utility gutter owns upload/command affordances without widening the form.
- Transfer: focused source verification should temporarily prioritize one task, keep one primary artifact/object, show quiet stage context, and use Back/Confirm actions. Reject: importing the five banking steps or narrow 560px width into every case tab.

### Treasury

States exercised: Activity, Portfolio, auto-transfer entry, portfolio edit entry point, and transfer/menu affordances.

- The top uses two equal-width, low-elevation objects. The left is dominated by one balance and a flat action footer. The right combines a small donut, two labeled allocation rows, then a divided two-metric footer.
- Activity is a flat three-column ledger. Small event glyphs carry direction/type while color is limited to earnings and pending state.
- Portfolio switches the entire lower region in place. Each fund is a broad open-canvas row with four columns: small allocation ring/percentage, narrative identity, metadata link, and a compact right facts ledger. There is no outer card around each fund.
- Transfer: Financials gets one primary visual/fact object and open fund-like driver rows. Repayment scenarios can use a restrained ring or scale only when it expresses a real whole/threshold relationship. Reject: repeated donut charts for unrelated metrics.

### Expense draft/edit

States exercised: Expense details, Expense/Mileage switch, category menu, warning state, three receipt rows, and Review.

- The workflow uses the same focused-shell principle as Send: a quiet left rail, a responsive `clamp(424px, 42vw, 560px)` reading/form column, and an open canvas.
- Form controls are about 40px high with 8px radii. The category warning is a 44px warm inset row with one 16px alert icon; it is not a full warning card.
- Receipt files are stacked 40px rows within one shared attachment boundary. One icon and one trailing action support scanning.
- Review replaces the form with a dominant amount, a simple two-column key/value ledger, the same compact attachment group, and Back/Submit actions. The content becomes calmer as the user approaches commitment.
- Transfer: finding judgment and document verification should simplify into a review record before submission. Reject: rendering every extracted field in its own bordered surface.

### Accounts / auto-transfer rules

States exercised: Mercury accounts, Linked accounts, Auto transfer rules, all four rule-type objects, and the Maintain target balance setup dialog.

- The anchored tab retains the same Accounts heading and underline navigation. The rule-type selection uses four equal cards because these are genuinely four mutually exclusive object types.
- Each card uses one quiet 40px icon tile, a two-line name, and a chevron; description copy is omitted until selection.
- Selection opens a focused rule builder with conversational sentence structure around a small number of controls.
- Transfer: use icon tiles for a short set of finding/task types and sentence-like condition construction. Reject: converting ordinary findings or financial drivers into a four-card chooser.

### 1099 filing and documents

States exercised: 1099 Filing, Filing updates and tasks, Request W-9s, recipient ledger selection, Tax Documents, W-9/W8-BEN, and document selection/download state.

- Filing updates and tasks is one contained group above the main ledger. Each 42–44px row has a distinctive 16px line icon, one sentence, optional secondary entity text, and a right-aligned action. Icons distinguish missing document, invalid document, unassigned transaction, no payments, and ready state.
- The task group has no status pills on every row. Icon, wording, and action together convey type; rose is reserved for the leading missing-document exception.
- Request W-9s becomes a focused page with one explanatory sentence, a flat recipient table, inline email controls, upload actions, optional message, and a local selected-state action bar.
- Tax Documents uses a narrow left subtype rail and an open document list. Checkbox selection summons a floating bulk-action bar; clicking the label selects the row rather than opening a decorative preview.
- Transfer: Overview review priorities get icon-led task rows; Sources gets flat document subtypes and a selected-state action model. Reject: copying tax states or adding icons to rows that already scan clearly without them.

### Mercury Vault

States exercised: status strip, FDIC Insurance object, Treasury object, and disclosure section.

- A top status strip pairs one 40px shield tile and “All set” label on the left with three compact facts on the right. This produces a distinctive opening without a large hero illustration.
- Two broad objects follow. Each is internally split: explanatory title/copy on the left and dominant value/status visualization on the right. The second uses one large allocation ring as its only visual artifact.
- The page maintains generous vertical separation and keeps dense legal disclosure outside the primary objects.
- Transfer: Preliminary assessment should adopt the status-strip-plus-split-object logic: posture and provenance above, concise rationale and one meaningful decision artifact below. Reject: insurance shield semantics and oversized decorative illustration.

### Account Security

States exercised: Suggested actions, View all entry, Run check-in, Activity filters, month selector, and flat event ledger.

- Suggested actions is one group with a title/update/action header and a two-column table. Rows connect observed behavior directly to a suggested action; an overflow control holds secondary actions.
- Activity history is a separate open-canvas section with filter chips and a flat five-column ledger. Event glyphs are used selectively in the event column, not as large leading tiles.
- The month filter is a popover with a compact year/month grid and clear selected/disabled states.
- Transfer: Findings and Activity should separate “what needs action” from chronological history, use direct behavior → action mapping, and keep filtering compact. Reject: a security-check-in metaphor or generic risk score.

### Company Profile, Referrals, and the Settings system

States exercised: every visible Settings navigation destination, with closer visual review of Company Profile, Controls, API Tokens, Webhooks, Profile, Security, and Referrals.

- Company Profile is almost entirely an open two-column key/value ledger. One real logo object supplies identity; descriptions remain left, values and small actions remain right. This confirms that ordinary borrower metadata does not need a card wrapper.
- Referrals uses one believable bonus product object beside a short explanation and primary action. The flat four-column referral ledger begins immediately below. Visual interest comes from the product object and whitespace, not a collection of decorative cards.
- Controls demonstrates that one status label, a short description, and a compact action group can occupy a large open canvas without filler widgets.
- API Tokens and Webhooks use dense flat tables with a single primary page action. Personal Profile and Security use contained objects only where a setting is genuinely interactive.
- Status labels are small, pale, and contextual. Neutral/current/default values are usually plain text; color appears for active, warning, completion, or destructive action only.
- Transfer: Overview and Sources may each use one credible product screenshot/object beside concise task copy, then return to flat metrics or ledgers. Reject: generic generated illustrations, repeated icon tiles, a pill for every metadata value, or a card around every section.

## Audit synthesis

Six Mercury patterns are approved for direct translation:

1. Vault status strip + split object for the Overview preliminary assessment.
2. Credit/Treasury open split composition for Financials and repayment capacity.
3. 1099 icon-led task group for Review priorities.
4. Cards selected-ledger + inline detail split for Sources and focused verification.
5. Expense/Send focused workflow shell for evidence review and final judgment.
6. Referrals/Company Profile object-plus-copy and open-ledger rule for Overview, Sources, and borrower metadata.

The shared craft rules are consistent across the references: approximately 968px outer alignment, 40px controls, 8–12px radii, 16–24px internal spacing, thin neutral borders, flat repeated rows, display-sized values only for dominant facts, and one visual artifact per meaningful object.

## Current-state weaknesses to verify

- The stable outer width exists, but some internal sections still create a perceived size change through inconsistent padding, full-bleed treatment, or narrow columns without clear alignment.
- Overview’s preliminary-assessment card is visually plain and text-led. Its title, status, rationale, and action read as one undifferentiated block.
- Repayment capacity uses multiple horizontal tracks that imply precision while communicating little beyond the numeric labels.
- The screen contains too many similarly bordered rectangles, so primary, supporting, and repeated information share the same visual weight.
- Several supporting explanations repeat facts already present in metrics or findings.
- Evidence and verification interactions are functional but do not yet feel like dedicated review workspaces.
- Design Tools opens isolated popup previews, which prevents direct comparison in real production context.

## Proposed screen architecture

### Overview

1. Open-canvas page heading and case metadata.
2. One signature Preliminary assessment object:
   - a restrained two-part white surface informed by Cards and Referrals;
   - a believable credit-structure object using the actual commitment, term, initial draw, and proposed covenant terms without pretending to be a document;
   - assessment label, recommended structure, concise rationale, and provenance on the explanatory side;
   - one quiet assessment-history link; the page header owns the single case-level next action;
   - no “AI” language or ornamental sparkle treatment.
3. A flat three-fact strip for request, evidence readiness, and relationship. These are useful orientation facts, but not independent actionable objects and therefore do not receive separate cards or pills.
4. Repayment capacity as a compact scenario comparison ledger with one four-column contract shared by the header, every scenario, and the covenant-floor reference row. No decorative horizontal progress rails.
5. Review priorities as flat icon-led task rows with status and destination, inspired by 1099 filing tasks.
6. A short open-canvas “Why this posture” note only if it adds information not already visible in findings.

### Findings

- Use a flat ledger/grouped list for the inventory.
- Each row gets a restrained semantic icon, title, one-line consequence, state, and chevron/action.
- Only the selected/actionable finding may expand into a contained object.
- Keep count and status summaries outside the rows.

### Finding investigation

- Preserve the stable 968px outer canvas.
- Temporarily remove the case header and primary case tabs. The global Credit Reviews sidebar entry remains available; the detail view exposes one local Back to Findings action.
- Keep Assessment, Evidence, and Judgment as the only local navigation inside the focused route.
- Use an open evidence-and-judgment reading flow; a split composition is allowed only when a real artifact must remain visible beside a decision.
- On mobile, artifact precedes judgment controls in one flow.
- Keep Assessment, Evidence, Judgment navigation compact and in place.
- Decision controls remain analyst-owned and explicit; no conversational assistant framing.

### Financials

- Adopt the treasury-style balance of one visual analysis object and one concise fact/interpretation column.
- Scenario selector changes the same visualization in place.
- Drivers become a compact flat grid or ledger; no top-and-bottom rule treatment on every item.
- Covenant floor and downside distance receive the strongest semantic emphasis.

### Sources

- Enter the dedicated evidence-review workspace immediately; do not insert an introductory marketing card or a separate catalog page between the tab and the work.
- Keep a persistent left source queue grouped by live workflow state: Needs review and Ready for decision. Verification and discrepancy actions move sources between groups.
- Keep the selected source URL-addressable through `?source=`. The case header and primary tabs disappear, leaving one local Back action and Previous/Next controls.
- Desktop uses source queue → credible document artifact → extracted values/provenance/actions. The global application shell remains visible for orientation.
- At constrained widths, the artifact and review panel stack; mobile exposes an explicit Browse sources/Hide sources mode and returns to the selected source after selection.

### Activity

- Use an open timeline/ledger with restrained event glyphs and date grouping.
- Avoid a bordered card per event.

### Recommendation

- Use an open-canvas decision document with one contained submission record.
- Conditions may use grouped task/rule rows.
- Senior-review state is visually separate from analyst recommendation, with authorship and time preserved.

## Product artifact and icon rules

### Product artifacts

- Maximum one signature product object per primary screen.
- Product objects must resemble plausible product UI or source evidence: real labels, real values, credible chrome, clipping/fading, and a clear task relationship.
- Do not use generic generated SVG geometry, floating document shapes, decorative dashboards, or fake branded artwork.
- Build artifacts with semantic HTML/CSS and real domain data where possible. Do not copy Mercury's card artwork or copyrighted illustrations.
- Never pair an illustration with gradients, stars, magic wands, neural-network motifs, robots, or abstract AI orbs.

### Icons

- Use the canonical Salt Icon component and one consistent stroke/optical weight.
- Repeated rows should have one small 28–32px icon tile only when it materially improves type recognition.
- Semantic mappings must remain stable: document, calculation, entity/customer, covenant/shield, alert, comment, approval, and history.
- Icons accompany text; they never carry state alone.
- Avoid mixing outline, filled, emoji, and arbitrary third-party icon styles.

## Focused verification workflow

Entry points: Source row, finding evidence row, or a Review priority task.

Desktop anatomy:

1. Keep the demo banner, then replace the normal global sidebar and utility bar with a true focused application-shell mode.
2. Split the remaining viewport into two stable zones: a quiet left task pane and a dominant right document stage.
3. The left identity row carries Meridian Foods context and one context-aware Close action. The task pane owns extracted values, exceptions, provenance, connected findings, and the decision actions.
4. Source browsing is an in-place mode within the left pane, not a third fixed desktop column. Search, state groups, URL selection, and keyboard movement remain available while the selected document stays visible.
5. The right stage owns a large, credible source-specific document with restrained citation highlighting and a working viewer toolbar.
6. At mobile widths, task content and artifact become a single vertical flow without restoring global mobile navigation inside the focused route.

Interaction contract:

- Opening preserves the originating row and route context.
- Escape or Back returns focus to the originating row.
- Decision state updates the source queue, Overview readiness, relevant finding evidence labels, tab counts, Toast feedback, and Activity history.
- A flagged discrepancy blocks completion and removes even a previously current source from decision readiness until the flag is cleared.
- Increasing leverage cannot be completed until the debt-schedule exception has been reviewed; the attempted completion routes directly to that source and preserves `fromFinding` for return.
- Keyboard order follows header → artifact controls → review facts → decision action.
- Mobile renders a single column without a horizontally scrolling page.

## Design Tools in-place architecture

### Required behavior

- The launcher may open a compact control menu, but a design option must never open a preview modal or full-screen dialog.
- Selecting a variant swaps the current route area in place. Shell, route, viewport, realistic data, and surrounding context stay constant.
- Options are grouped by `screenArea`, for example:
  - Overview: Current, Signature assessment
  - Financials: Current, Treasury split
  - Source review: Current, Focused verification
- Switching variants updates a URL query parameter such as `?design=overview-signature` so refresh/back-forward behavior is deterministic.
- A persistent but quiet preview label names non-current variants and offers `Return to current`.
- Production remains Current by default. Archived code remains isolated from product imports except through the internal variant boundary explicitly owned by Design Tools.

### Registry shape

Each option defines: stable id, screen area, label, state (Current/Candidate/Archived), description, compatible route matcher, and in-place render key. The registry must not contain popup-specific preview metadata.

## Component plan

Promote or extend in this order:

1. Tokens: signature surface, icon tile, scenario comparison, split-workspace geometry, preview label.
2. Primitives: `IconTile`, `ScenarioComparison`, `TaskRow`, `SplitReviewWorkspace`, `DesignVariantNotice`.
3. Composites: `AssessmentHero`, `ReviewPriorityList`, `DocumentVerificationWorkspace`.
4. Screens: Overview, Financials, Sources/focused verification, Design Tools.

Every new primitive needs default, hover where interactive, focus-visible, disabled where applicable, compact/mobile, and reduced-motion behavior.

## Responsive contract

- Desktop outer max: 968px.
- Shell-aware gutter remains fluid; child views may not override the outer width.
- Two-column splits collapse before either readable column falls below its minimum.
- At 390px, no page-level horizontal overflow is permitted.
- Dense ledgers may recompose into labeled rows or own an internal scroll region; the page itself must remain fixed.
- Signature illustration becomes a small background/edge artifact or is omitted when it competes with decision content.

## Completion criteria

### Audit

- Every supplied Mercury route has been opened and its meaningful tabs/sections/items exercised.
- The audit matrix contains observed hierarchy, spacing/geometry, surface use, icons/illustrations, and interaction behavior.
- Every transferred pattern has a credit-review rationale; attractive but irrelevant patterns are explicitly rejected.

### Implementation

- All Meridian tabs and nested workflows retain identical outer content anchors.
- Overview uses the new signature assessment, flat fact strip, scenario comparison, and restrained priorities without excess cards.
- Financials, Sources, Activity, and Recommendation use the defined surface taxonomy.
- At least one complete focused document-verification flow is interactive.
- Design Tools variants swap in place, are grouped by screen/area, and are URL-addressable; no preview dialog remains.
- New reusable behavior consumes Salt tokens and shared components.

### QA

- Validate at 1280px, 1000px, and 390px.
- Exercise all case tabs, nested investigation sections, source verification, scenario switching, recommendation progression, and Design Tools variants.
- Verify keyboard navigation, visible focus, Escape/back behavior, focus return, and reduced motion.
- Verify no page-level mobile overflow and no content-width jump between views.
- Verify browser console has no warnings/errors.
- `npm run validate` passes.
- Capture final visual artifacts for Overview, Financials, focused verification, Design Tools variant state, and mobile Overview.

## Decision log

- Stable 968px width is non-negotiable for the case canvas. The documented Sources mode is the only width exception and remains constant across all selected sources.
- The preliminary assessment is the sole signature card on Overview.
- The case header owns exactly one primary action. Its label names the next real task, such as `Review customer concentration`; the assessment does not repeat that action.
- Deep findings and source verification are focused routes: the case header and primary tabs are hidden until the user returns.
- Neutral/current metadata is plain text; pills are reserved for workflow state, warning, completion, or case-level posture.
- Repayment capacity uses comparison geometry, not progress tracks.
- Verification is a focused workspace, not another drawer full of text.
- Design Tools comparison occurs in production context, in place, and is grouped by screen area.

## Implementation and QA record

Completed July 26, 2026.

- Stable case frame: Overview, Financials, and nested Findings retain the 968px case canvas. Sources deliberately switches the application shell into a full-viewport focused workflow; every source uses identical two-zone geometry. Intermediate and mobile source modes recompose without page-level horizontal overflow.
- Overview: the signature assessment, credit-structure object, flat three-fact strip, and restrained priorities are the default. Repeated request and posture copy, vague confidence labels, and the fake facility-document artifact were removed. The former card stack remains isolated as an in-place archived variant.
- Financials: the Treasury workspace and semantic `ScenarioComparison` are the default. Decorative repayment rails were removed. At mobile width, the three metrics recompose into compact 72px ledger rows instead of tall stacked cards.
- Sources: entering the tab immediately opens the full evidence workflow with in-place source browsing, a realistic dominant document artifact, extracted values, Previous/Next, discrepancy blocking, completion/link actions, and context-aware Close behavior.
- Findings and Activity: findings use a responsive selected-ledger/master-detail workspace; each nested investigation keeps the same outer anchors and adds the risk-native visual artifact that explains concentration, margin, or leverage. Activity history uses an open timeline with domain wording and no explanatory audit-standard card.
- Design Tools: options are grouped by Overview, Financials, and Source review; selection routes to the real screen through `?design=<id>`; archived variants show `DesignVariantNotice`; the previous preview modal and design-history imports were removed.
- Interaction QA: chart range and metric changes, source completion, source Back focus return, tab keyboard navigation, Design Tools Escape dismissal/focus restoration, and URL-addressable variants passed.
- Accessibility/responsive QA: semantic table roles, keyboard focus behavior, reduced-motion rules, 1280px/1000px/390px layouts, text fit, and mobile overflow passed.
- Console: a clean fresh-load browser tab reported no warnings or errors.
- Validation: `npm run validate` passed (`check:design-history`, TypeScript, and Vite production build).

### Second craft audit and implementation pass

Completed July 26, 2026 after auditing Referrals, Company Profile, every visible Settings destination, Cards Manage, and the selected-card detail object.

- Overview: removed the generated decision-memo SVG and the later facility-brief simulation. The signature surface now pairs the posture with a real credit-structure object containing commitment, term, initial draw, minimum coverage, and maximum leverage. Proposed covenant language is precise; evidence readiness replaces vague confidence copy.
- Findings: removed colored icon tiles from the inventory and priorities. Type glyphs are restrained; risk is plain text; one workflow-state pill remains where state cannot be inferred from copy alone.
- Focused navigation: nested finding routes and `Sources?source=<id>` now hide the case header and primary tabs. Each deep view exposes one local Back action; source links opened from a finding preserve a `fromFinding` return target.
- Sources: rebuilt the source artifact as a real financial statement, covenant certificate, or executed-agreement page depending on source type. The temporary source-set preview/open-ledger direction from this pass was superseded by the fourth-pass dedicated evidence workspace.
- Token contract: product-object typography, dimensions, and elevation were added to the Salt token layer instead of creating a page-private palette.

### Third product-logic and alignment pass

Completed July 26, 2026 after auditing the Overview, Findings inventory, focused finding route, and repayment comparison at desktop, intermediate, and mobile widths.

- Case action hierarchy: the page header now contains one Meridian-specific next action, `Review customer concentration`, derived from the first unresolved finding. The assessment has no competing primary CTA and exposes only quiet history access.
- Case state: the header uses the count-free accountable workflow label `Needs judgment`; finding counts remain inside the Findings tab and review preview where they are actionable.
- Overview facts: three current-state MetricCards were replaced by one semantic `dl` fact strip. Evidence readiness, relationship, and expected initial draw remain scannable without repeating the $18M request; the evidence value no longer carries an alignment-breaking pill.
- Assessment density: rationale, protections, provenance, and history were compressed into a clearer hierarchy. The believable facility brief remains a supporting product object on desktop and tablet, and is omitted below 460px where it would dominate the task flow.
- Findings states: workflow pills use intrinsic `max-content` width and cannot stretch with the ledger grid.
- Repayment capacity: header, Base, Downside, and Covenant floor now use the same four-column grid. The floor explicitly maps `1.20x`, `Reference`, and `Policy minimum` into the Coverage, Vs. floor, and Outcome columns.
- Focused navigation: the case-level primary action opens the full focused finding workspace; the case header and primary tabs disappear and one local `All findings` Back action remains.

### Fourth evidence-workspace and end-to-end product pass

Completed July 26, 2026 after auditing Mercury Cards selected-row detail behavior and rechecking Sources at 1280px, 1000px, and 390px.

- Sources is now a dedicated master-detail evidence workspace. The left queue persists at desktop; the center is the source document; the right panel owns extracted values, provenance, related evidence, connected findings, exceptions, and actions.
- The default route selects the urgent Customer A agreement. Selection, previous/next navigation, related renewal evidence, and finding-origin return targets remain durable in the URL.
- Review state is product state, not decoration: verification and discrepancy flags update queue groups, unresolved counts, the Sources tab count, Overview readiness, finding evidence labels, Toasts, and attributable Activity events.
- The executed renewal links directly to the concentration finding. Its source metadata and connected-finding context update immediately without duplicating a generic verification event.
- Increasing leverage is gated on the debt schedule. Confirming early opens the exact unresolved source; after verification, Back returns to the leverage finding for completion.
- Wide desktop retains all three panes. Constrained desktop stacks document and review data while exposing the source queue as a mode. Mobile uses one column with an explicit Browse sources toggle. No tested viewport produced page-level horizontal overflow.

### Fifth focused-shell correction

Completed July 26, 2026 after auditing `https://demo.mercury.com/send-money/pay/recipient-match` at the supplied desktop viewport.

- The fourth-pass three-pane direction was superseded. Sources now triggers an app-shell mode in `AppShell`: the demo banner remains, while the global sidebar, utility bar, case header, tabs, and Design Tools launcher are absent.
- Desktop follows Mercury's focused workflow proportion: a white left task canvas and a softly tinted right artifact stage occupy the full remaining viewport. One minimal identity row and context-aware Close action replace stacked navigation layers.
- Source browsing is a deliberate in-place state inside the left pane. Search, grouped readiness states, keyboard movement, related-source navigation, query-string selection, Previous/Next, and finding-origin return behavior remain intact without introducing a third fixed rail.
- The right stage now renders credible agreement, credit, treasury, projection, or financial-report documents from real case values. The bottom viewer toolbar provides working source paging and 90/100/110% zoom controls.
- Verification, renewal linking, discrepancy blocking, Overview readiness, finding evidence, tab counts, Toasts, Activity, and the debt-schedule gate continue to share the same product state.

### Sixth account-view and source-hierarchy correction

Completed July 26, 2026 after rechecking Mercury Accounts, Insights, Cards, and Accounting patterns against the rendered Meridian workspace.

- Overview V4 supersedes the object-led V3. A compact credit-account summary and one fixed-charge coverage chart replace the facility illustration and per-finding micro charts.
- Review priorities use a flat Accounting-style ledger with one key signal, risk, and workflow state per row. V1–V3 remain preserved in Design Tools.
- `/sources` now opens a searchable, filterable source ledger inside the standard 968px case workspace. It no longer selects a document or enters focus mode by default.
- `/sources?source=<id>` remains the full-screen two-zone evidence workflow. Close returns to the source ledger; finding-origin sources retain their return context.
- Overview, Sources index, focused source review, and key route interactions were browser-verified at 1280px without page-level horizontal overflow. TypeScript, design-history validation, and the production build passed.
