# Salt Component Contracts

Last updated: July 27, 2026.

Salt follows an atomic composition model. Shared components stay low-domain and token-driven; credit-review workflow composition remains inside the Credit Reviews feature until reuse is proven.

## Composition hierarchy

```text
Foundations
  color · typography · spacing · border · radius · motion

Atoms
  Text · Icon · IconTile · CompanyLogo · StatusPill · DocumentRow

Molecules
  DataCell · SearchField · FileDropzone · FilterChip · Button · KeyValueGrid · MetricCard · ScenarioComparison

Navigation and structure
  Tabs · WorkflowSteps · SectionHeader · ObjectHeader · ActivityLedger · Timeline

Overlay primitives
  Popover · Drawer · DocumentViewer · Toast · Notice

Surface primitives
  Panel

Workflow composition
  ReviewRow · ReviewGroup · CreditReviewDrawer · CreditFindingsWorkspace

Template
  My Reviews grouped queue · All Reviews ledger
```

## Text

Purpose: semantic typography without page-local font declarations.

Variants:

- `pageTitle`: Arcadia Display, 28px / 36px / 380.
- `sectionTitle`: Arcadia Text, 17px / 28px / 400.
- `body`: Arcadia Text, 15px / 24px / 400.
- `bodySecondary`: Arcadia Text, 14px / 20px / 400.
- `metadata`: Arcadia Text, 13px / 20px / 400.

Rules:

- Choose the variant by semantic role, not desired visual size.
- Do not restyle Text variants inside page CSS.
- Page titles use `h1`; grouped queue titles use `h2`.

## Icon

Purpose: one restrained, stroke-based glyph vocabulary for navigation, actions, status reinforcement, and financial-workflow objects.

Sizes:

- `xs`: 10px for subordinate affordances inside an existing labelled control.
- `sm`: 18px for navigation, rows, buttons, and routine icon actions.
- `md`: 20px for standalone or higher-emphasis glyphs.

Rules:

- Product code imports named Icon glyphs; do not embed one-off SVGs for ordinary UI actions.
- Icons that accompany text remain decorative. Icon-only controls require an accessible name on the owning control.
- Use an arrow for directional movement and a chevron for disclosure or hierarchy. Do not add either when the action label already makes movement obvious.
- Feature CSS may change color through semantic tokens but must not redefine the shared stroke, view box, or size scale.

## CompanyLogo

Purpose: a stable, compact identity anchor beside a company name without making the interface depend on a remote brand asset.

Variants: small queue mark, medium object mark, and large case-header mark.

States: initials fallback, remote mark loading, remote mark loaded, and remote mark failed.

Rules:

- Render the initials fallback immediately and keep it visible until the remote image has loaded successfully.
- A loading or failed image must never leave an empty slot or shift the adjacent copy.
- The mark is decorative when the company name is already present, so the shared wrapper remains hidden from assistive technology.
- Size, shape, background, border, fallback type, and transition consume `--salt-company-logo-*`, color, type, and motion tokens.
- Feature pages provide identity data; they do not override loading behavior or create page-owned logo geometry.
- Known credit-review companies always resolve through `companyLogoDomains`; do not replace the mapped API logo with a page-owned letter mark, a guessed domain, or a newly invented asset.
- Product marks and human avatars are separate identity types. They may use BCGX or person initials, but must not stand in for a known company logo.

## DataCell

Purpose: atomic content alignment inside ledgers and queue rows.

Variants:

- Primary only.
- Primary with secondary metadata.
- Custom content, such as StatusPill or owner identity.
- Start or end alignment.

Tokens:

- `--salt-data-cell-gap`
- `--salt-data-cell-primary-*`
- `--salt-data-cell-secondary-*`

Rules:

- The parent row defines columns; DataCell defines content hierarchy within a column.
- All values in one semantic column must use the same grid track.
- DataCell truncates long primary and secondary strings; the row decides responsive stacking.

## SearchField

Purpose: compact search within a known collection.

States: empty, populated, focus-visible, and clearable.

Rules:

- Use a persistent accessible label even when the visible placeholder supplies the compact visual treatment.
- SearchField filters the current collection; it does not replace the shell-level global search.
- The clear action appears only when a value exists.
- Height, padding, gap, radius, border, text, placeholder, and focus treatment consume `--salt-search-field-*` tokens.

## Button

Purpose: one compact, predictable action contract across page headers, toolbars, overlays, and workflow footers.

Variants:

- `primary`: the one visually dominant action in the current decision surface.
- `secondary`: bordered action for a durable alternative.
- `soft`: Mercury-style low-emphasis filled action, such as `Submit expense`.
- `quiet`: text-led or icon-led action without persistent chrome.

Rules:

- Use short verb-led labels and keep one primary action per surface.
- Keep button labels on one line. In constrained workflow footers, shorten the action copy and reduce to the compact type token before allowing controls to collide, wrap, or create horizontal overflow.
- Icon-only actions require an accessible name; icon-and-text actions keep the icon decorative.
- The shared component forwards its native button ref so overlays and popovers can restore focus to their trigger.
- Every variant consumes the shared button height, padding, radius, type, state, and focus tokens.
- Do not create page-owned button colors, gradients, radii, or hover behavior.

## StatusPill

Purpose: compact semantic workflow, verification, decision, or risk state.

Tones: neutral, info, success, warning, danger.

Review status mapping:

- `Needs judgment` → warning: trusted evidence still requires human interpretation.
- `Needs verification` → danger: evidence cannot yet be trusted or reconciled.
- `Analysis ready` → neutral: analysis is complete and unblocked.
- `Analysis updated` → info: new human context caused reassessment.
- `Accepted by analyst` → success: the analyst accepted the current AI conclusion.
- `Revised by analyst` → info: an analyst-authored conclusion is now primary.
- `Escalated to senior` → warning: analyst review is recorded, but senior judgment remains explicit.
- `Review complete` → success: the analyst resolved all findings and can hand off with no escalation.

Use StatusPill for:

- `Needs judgment`
- `Needs verification`
- `Analysis ready`
- `Analysis updated`
- `Review complete`
- `Material risk`

Use a Tag instead for category or classification:

- `Healthcare`
- `Revolving line`
- `Sponsor-backed`

Rules:

- Do not use color alone; the label must state the condition.
- Keep copy concise and action-oriented.
- Keep row, drawer-header, and object-header status pills count-free. Put counts on aggregation surfaces such as group headings, tabs, and task-specific CTAs instead.
- In a detail drawer, the header owns the review-level state. A child row renders a StatusPill only for a semantic exception or a meaningful human/terminal transition; it must not repeat the header state with shorter copy such as `Updated` beneath `Analysis updated`.
- Workflow group and review status are separate dimensions. For example, an analyst may have an `Analysis updated` item in the `In progress` group.
- Badge remains a compatibility alias while existing consumers migrate to StatusPill.

## FilterChip

Purpose: a compact, interactive facet for refining a collection without changing the user's durable page or workflow mode.

States: default, hover, selected, focus-visible, disabled, and optional count.

Rules:

- Use FilterChip for quick facets; use Tabs for durable sections and Button for actions.
- The native button exposes `aria-pressed`; a visible count belongs to the facet result, not to a row-level status label.
- Keep chip text on one line and let the parent toolbar provide internal horizontal scrolling on constrained screens.
- Height, padding, gap, radius, type, border, surface, count geometry, and focus treatment consume `--salt-filter-chip-*` and public Salt focus tokens.

## IconTile

Purpose: a compact semantic container for a leading Icon in driver rows, evidence summaries, and other small financial objects.

Variants: small or medium size; rounded or circular shape; neutral, info, success, warning, and danger tones.

Rules:

- The tile reinforces a nearby text label and remains hidden from assistive technology; it never carries meaning alone.
- Neutral is the default for object type, actor, source category, navigation, chronology, and ordinary analysis content.
- Info is reserved for active/selected analysis states or newly available analysis; success means verified or complete; warning means attention is required; danger means blocked, invalid, or failed.
- Actor or provenance labels such as human, AI, analyst, evidence, and upload are not semantic tones. ActivityLedger keeps `human` and `evidence` only as compatibility inputs and normalizes both to neutral.
- Use one semantic carrier per row. If an adjacent StatusPill already communicates state, keep the leading icon neutral unless the icon is the only immediate state indicator.
- Use semantic pale surfaces and restrained text colors. Do not invent decorative gradients, vendor-like palettes, or independent colors for every glyph.
- Size, border, radius, background, and tone colors consume `--salt-icon-tile-*`, radius, and semantic color tokens. Page CSS must not recreate the tile.

Adoption:

- ActivityLedger uses a circular IconTile so chronology stays connected without introducing a second icon system.
- Finding, financial-driver, evidence, source, and decision-option rows use IconTile instead of page-owned glyph boxes.
- Decision-option icons remain neutral until selected; selection uses the info/action tone. Outcome color belongs to the recorded StatusPill after submission.

## DocumentRow

Purpose: compact, low-emphasis trigger for an evidence or attachment document.

Anatomy:

- Evidence-category icon, defaulting to the document glyph.
- One-line document name.
- Secondary file type/review metadata.
- External/open affordance.

States: default, hover, selected, focus-visible.

Tokens:

- `--salt-document-row-*`
- `--salt-color-focus` / `--shadow-focus`

Rules:

- The row is low-domain and owns presentation only; the parent owns preview or navigation behavior.
- File format never controls the glyph. Credit Reviews may pass a stable domain icon for the evidence category—financials, bank data, forecasts, contracts, or credit documents—while other consumers keep the default `document` glyph.
- Use a real button when the document opens an in-context preview. Use a link only when a stable destination exists.
- Keep the row flat inside drawers and source lists; do not wrap each document in a nested card.
- Truncate names and metadata rather than changing the row height.

## DocumentViewer

Purpose: focused inspection of an evidence attachment without replacing the current queue, drawer, or workflow page.

Anatomy:

- Dimmed full-viewport backdrop.
- Compact filename, metadata, and icon header.
- Centered paper-like preview surface.
- Icon-only close action.

States and interactions:

- Closed and open.
- Clicking a DocumentRow opens the viewer.
- Escape, the backdrop, and `Close document preview` dismiss it.
- Focus stays inside the viewer and returns to the originating DocumentRow.
- The document stage scrolls independently; page scrolling is locked while open.
- Mobile uses the full viewport and removes the floating radius.

Rules:

- Use DocumentViewer for read-only attachment inspection; do not open a second Drawer.
- Render it through a portal so Drawer overflow and transforms cannot clip the viewer.
- The parent supplies document content and provenance; DocumentViewer must not own credit-review semantics.
- Do not place workflow submission actions inside the viewer.

## Popover

Purpose: compact floating surface for a menu, picker, or contextual disclosure anchored to one control.

Variants: semantic role is supplied by the consumer (`menu`, `listbox`, or a labelled contextual region); Salt owns one visual surface rather than route-specific variants.

States and interactions:

- Closed and open.
- Open enters with the shared fast transform/opacity motion.
- The owning feature controls focus, dismissal, keyboard navigation, selected state, and anchor placement.
- Content scrolls inside the bounded max height instead of expanding the page.
- Width is capped to the viewport at mobile sizes.

Tokens:

- `--salt-popover-width`
- `--salt-popover-max-height`
- `--salt-popover-padding`
- `--salt-popover-radius`
- `--salt-popover-border`
- `--salt-popover-background`
- `--salt-popover-text`
- `--salt-popover-shadow`
- `--salt-popover-enter-offset`
- `--salt-popover-z-index`

Rules:

- Use for compact option sets and contextual controls, not for a chat response, full form, or long explanatory panel.
- The trigger owns `aria-expanded` and `aria-controls` when a durable relationship is available; the consumer owns the correct role and accessible label for the content.
- Keep product semantics, option filtering, selection logic, and grouping in the owning feature.
- Do not mint page-local floating-surface borders, shadows, radii, or motion.

## ObjectHeader

Purpose: consistent entry hierarchy for a company, account, or review workspace.

Anatomy:

- Shared quiet back Button with a 14px context label, an 18px leading arrow, and an explicit `Back to …` accessible name.
- A tokenized 12px separation between the back-navigation row and the object identity row.
- Object logo and one page-title heading.
- A compact, middle-dot-separated metadata line.
- Optional StatusPill placed with the object context, below metadata.
- Optional quiet utility action, such as a bookmark toggle.
- At most one compact primary workflow action at the opposite edge.

Rules:

- Status and action are separate regions; never place the workflow pill inside the action cluster.
- Utility actions remain icon-only, accessible by name, and visually subordinate to the primary workflow action.
- Use the optional header status only for a durable case-level state. Keep routine evidence or verification state beside the affected analysis so the header does not repeat it.
- Keep the action label short and specific, such as `Continue review` or `Request forecast`.
- Suppress the case-level action when the active tab already owns the next task. A selected finding preview, evidence requirement, recommendation form, or final-decision panel is the action owner for that surface.
- Completed states are labels, not disabled buttons. Remove the CTA once no action remains.
- Do not add a decorative chevron when the label already communicates movement.
- The shared component owns hierarchy and responsive stacking; the feature owns status logic, action behavior, and metadata copy.
- Keep page-level top padding separate from the internal header rhythm; routes must not override the back-to-identity gap.
- At the narrow container breakpoint, the action moves below the identity and becomes full-width on mobile.

## Review bookmarks

Owner: Credit Reviews feature, composed into `AppShell` and `ObjectHeader`.

Anatomy:

- Case-header icon toggle with `aria-pressed` and add/remove accessible names.
- Desktop sidebar section with divider, help disclosure, reorder handle, `CompanyLogo`, compact request/status metadata, and hover-revealed remove control.
- Mobile utility-bar trigger and compact saved-review popover; full bookmark rows never become bottom-navigation items.

Rules:

- Persist ordered review slugs, not duplicated company records; resolve current copy and status from `reviewData`.
- The header toggle and sidebar list must share one provider so updates are immediate in both places.
- Keep row-level status labels count-free and truncate metadata instead of increasing sidebar width.
- Keep the section help glyph at the shell-owned compact size while preserving its 24px focusable target; it must remain subordinate to 18px primary-navigation icons.
- Reordering must preserve the saved set and removal must never delete or mutate the underlying credit review.
- The reorder handle must be a named button: pointer users drag it, while keyboard users move the item with Arrow Up or Arrow Down.

## ReviewRow

Owner: Credit Reviews feature.

Composition:

- Company DataCell: company name.
- Request DataCell: facility request.
- Status DataCell: one StatusPill.
- Owner DataCell: avatar initials and owner name.
- Due DataCell: end-aligned date plus disclosure icon.

Measured Mercury contract:

- Desktop row height: 67px.
- Cell vertical padding: 8px.
- Column gap/right padding rhythm: 16px.
- Status pill height: 24px.
- One shared status-column start across every row.

Responsive behavior:

- Desktop: five aligned columns matching Company, Request, Review status, Owner, and Due headers.
- Mobile: company and due date share the first row; request, status, and owner stack below.
- No document-level horizontal overflow.

## ReviewGroup

Owner: Credit Reviews feature.

Composition: Text section title, count badge, repeated five-column header, and ReviewRow list.

Rules:

- Groups communicate the analyst's next action, not generic portfolio status.
- Place each column header beneath its group title rather than using one detached global header.
- Use a 16px title-to-header gap and 48px whitespace between groups.
- Keep internal row dividers, omit the closing divider after the last row, and do not use card containers.
- Group spacing uses Salt spacing tokens; do not introduce one-off margins.

## Drawer

Purpose: preserve queue context while previewing enough entity detail to decide whether to enter the full workflow.

Current Credit Review content version: `Outcome-led preview V3`. Product code imports `Drawer` with `layout="responsive"`, never a versioned component. V3 retains the V2 shell contract and changes only the feature-owned preview hierarchy.

Previous design versions: `Overlay preview V1` and `Responsive detail rail V2`, preserved through Credit review queue Design Tools options.

Variant:

- Compact side preview, calibrated to Mercury Invoicing and Reimbursements and rechecked against Subscriptions detail (`https://demo.mercury.com/subscriptions/subscription/subscription-10-2`), Bill Pay detail (`https://demo.mercury.com/payments?bill=d1f7a0c2-0001-4001-8001-000000000001`), and Scheduled payment detail (`https://demo.mercury.com/payments/scheduled?payment=recurringPayment3`).

Measured contract:

- Width: 392px on desktop.
- Radius: 12px.
- Header: 56px minimum with `20px 24px 12px` padding.
- Body sections: 24px padding with subtle one-pixel separators.
- Shadow: Mercury's light two-layer panel shadow, not a large floating-card elevation.

States and interactions:

- Closed and open.
- Row-origin open with the selected row retained.
- Opening focuses the drawer region without painting a pointer-origin focus ring; keyboard Tab moves to the close control and preserves visible focus.
- Icon-only close action with `Close detail panel` accessible name.
- Escape closes and focus returns to the originating row.
- Body scrolling stays inside the drawer.
- Mobile occupies the viewport without a rounded floating shell.
- A workflow handoff may use one sticky footer CTA when its destination is real.

Current V2 measured contract:

- Full finance lane: 968px composed from a 544px ledger, 32px gap, and 392px drawer rail.
- The rail participates in layout and enters from the right with 400ms transform/opacity motion after a 100ms delay.
- The panel is sticky within the ledger context and is capped to the remaining viewport height with equal 16px top and bottom insets.
- Header remains stable; body overflow scrolls internally.
- Narrow layouts fall back to the V1 overlay/full-viewport mobile contract rather than forcing document-level horizontal overflow.
- Credit Reviews preserves its existing feature-owned header and domain hierarchy while the shared shell owns responsive position, motion, height, scrolling, Escape, and focus return.

Current V3 content contract:

- Lead with `CompanyLogo`, company name, facility type, and current workflow status.
- Separate a missing evidence prerequisite from a credit finding; verified zero-findings states must remain explicit.
- Choose the body composition from workflow semantics: flat focus ledger for judgment/ready states, prerequisite object for one external evidence task, shallow from-to change record for updated analysis, and flat recommendation/decision record for completion.
- Keep ordinary findings and multi-item verification states in a flat ledger. A shallow inset object is justified only for a discrete evidence task or a real before-and-after change; never place it above duplicate rows.
- Project Meridian rows and task count from the persisted analyst workflow state.
- Use native buttons for rows with real finding destinations and keep one footer action for the overall workflow handoff.
- Use concise state-owned headings such as `Review focus`, `Required evidence`, `What changed`, `Recommendation`, or `Decision`; do not repeat generic AI framing in primary preview copy.

Rules:

- Use flat sections, compact key-value content, and at most one primary next action.
- The header owns the review-level StatusPill. Render a row pill only for a semantic exception or a meaningful analyst/terminal transition; single-row drawers never repeat the header state.
- Repeated rows draw dividers only between siblings, never below the heading or after a single or final row. The Credit Review outcome module uses whitespace—not a closing divider—before Sources.
- Use two or three `DocumentRow` instances as evidence grounding, with a same-drawer disclosure for the remaining sources when needed.
- Put contextual evidence access beside the finding or source it explains; reserve the footer for the overall next workflow step.
- State-dependent Credit Review CTA labels are `Review findings`, `Verify information`, `Review analysis`, `Review changes`, and `View recommendation`; drawer action labels remain count-free.
- A My Reviews preview has one footer action. Do not add a competing `Open overview` button; individual finding rows may deep-link when a real route exists.
- Do not place floating cards, charts, long AI explanations, editing forms, or a full document browser in a preview drawer.
- Use the 424px Transactions drawer only for metadata-heavy editing workflows; it is not the default detail pattern.
- Credit Review drawer composition stays feature-owned while the shell lives in shared Salt UI.
- Replaced versions move into the quarantined Design history lane only after a new Current version is approved.

## Tabs

Purpose: durable section navigation within a routed product object.

Contract:

- Mercury underline treatment with optional compact counts.
- Controlled selection with Arrow Left/Right, Home, and End keyboard behavior.
- Only the selected tab participates in sequential focus; inactive tabs use roving `tabIndex` and remain reachable with the arrow keys.
- Tabs answer distinct recurring questions; facets and transient filters do not belong here.
- The active tab is communicated through text and indicator, never color alone.

## WorkflowSteps

Purpose: compact process navigation inside a focused edit, review, or confirmation flow.

Contract:

- Desktop uses a 152px vertical rail with a two-pixel active indicator and 48px minimum step rhythm.
- At 860px and below, the rail becomes a horizontal three-step strip without changing the page width.
- Labels name the durable stages; optional descriptions explain the task in one short phrase.
- The current stage uses `aria-current="step"`; the parent owns navigation or scrolling behavior.
- Hover, focus-visible, active, and prior-stage treatments consume `--salt-workflow-step-*` tokens.

Rules:

- Use for an ordered task such as Assessment → Evidence → Judgment, not as a substitute for durable page tabs.
- Keep stage count small and stable. Do not add completion badges, percentages, AI animation, or decorative progress graphics.
- WorkflowSteps supplies sequence and geometry only; domain state and submission logic stay feature-owned.

## SectionHeader

Purpose: a consistent title, optional eyebrow and description, and one restrained action cluster.

Rules:

- Use one per meaningful section, not for every row or nested fragment.
- Keep the primary workflow action in the page header; section actions are secondary or quiet.
- Descriptions explain the task or evidence context rather than repeating the title.
- Let the heading open directly into its content. Do not add a leading divider beneath a SectionHeader; begin dividers at column-to-row or repeated-row boundaries.
- Keep structural rules on tab rails, ledger column headers, repeated rows, and card, drawer, or focused-workflow chrome. The rule belongs to that structure, never to the title itself.

## KeyValueGrid

Purpose: flat request, facility, evidence, and decision metadata without decorative card wrappers.

Rules:

- Supports two, three, and four desktop columns with responsive collapse.
- Labels remain concise; detail is optional and visually subordinate.
- Values may contain semantic components such as StatusPill but not editing workflows.

## MetricCard

Purpose: a raised dashboard surface for one decision-relevant value, supporting context, and optional status.

Variants:

- Static summary card.
- Interactive selection card with `aria-pressed` and a restrained selected indicator.
- Default or compact density.
- Raised or flat elevation; use flat when the card is nested inside a larger decision panel.
- Neutral, positive, or negative detail tone for a stated comparison. Tone never replaces the comparison text.

Tokens:

- `--salt-metric-card-min-height`
- `--salt-metric-card-min-height-compact`
- `--salt-metric-card-padding`
- `--salt-metric-card-padding-compact`
- `--salt-metric-card-value-size`
- `--salt-metric-card-value-line`
- Shared Panel border, radius, background, and raised shadow tokens.

Rules:

- Use one value per card; do not turn a paragraph or workflow form into a MetricCard.
- Detail explains the value or comparison and remains visually subordinate.
- Compact cards reserve a consistent two-line detail measure so adjacent financial values stay aligned.
- Interactive cards control a nearby view and must expose selected state to assistive technology.
- Feature pages compose MetricCards; they do not recreate their border, radius, shadow, or value hierarchy locally.

## Panel

Purpose: a low-domain surface primitive for grouping related finding, evidence, or review content when a boundary is materially useful.

Rules:

- Panel owns only border, radius, surface, padding, and optional elevation. The feature owns headings, semantic state, and actions.
- Prefer flat ledgers and open page sections when a containing surface does not improve comprehension.
- Do not nest Panels to manufacture card hierarchy or override the shared radius and shadow in page CSS.
- Consume `--salt-panel-*` and public Salt shadow tokens.

## ScenarioComparison

Purpose: compare forecast cases against one explicit policy or covenant threshold in a scan-first, table-like composition.

Anatomy: scenario label and tone glyph, primary value, variance from the floor, outcome, and a quiet threshold reference row.

Rules:

- The parent supplies calculated values and policy language; the component owns accessible row/column semantics and alignment.
- Positive and negative color reinforces explicit variance and outcome text; it never substitutes for those labels.
- Desktop column geometry, row height, gap, type, and responsive two-column recomposition consume `--salt-scenario-*` and shared table tokens.
- Do not split scenarios into individual cards or add decorative progress bars.

## Focused workflow shell

Purpose: temporarily replace normal product navigation when one review task and one primary artifact must share the full application viewport.

Ownership:

- `AppShell` owns route-level removal of the global sidebar, utility bar, and developer chrome.
- The workflow feature owns its identity, context-aware Close action, task content, artifact semantics, and product state.
- This is a shell composition contract, not a new shared visual primitive.

Rules:

- Keep the demo banner for environment context.
- Desktop uses two stable zones: a quiet task pane and a dominant artifact stage. Do not add a third persistent rail.
- Browse/select modes replace content within the task pane while the selected artifact remains visible.
- Consume the `--salt-focused-workflow-*` geometry and elevation tokens; do not reproduce viewport calculations with route-private negative margins.
- Close returns to the originating finding when route context exists and otherwise returns to the case overview.
- Mobile becomes one vertical flow with no page-level horizontal overflow and no restored global bottom navigation.

QA:

- Verify shell chrome absence, context-aware Close, source browsing, keyboard movement, viewer controls, task actions, and desktop/mobile recomposition.

## Analyst judgment authoring

Purpose: give a human analyst enough room to revise an AI-supported credit conclusion while keeping authorship and accountability unambiguous.

Ownership:

- Credit Reviews owns the decision language, risk options, AI baseline, analyst conclusion, and submission state.
- Salt owns the focused-workflow geometry, visible radio affordance, semantic colors, focus treatment, footer clearance, and responsive measure.

Rules:

- The AI assessment is a quiet, locked baseline. It remains visible for provenance but is never presented as the editable destination.
- The analyst handoff explicitly states whether the risk is retained or changed.
- Two mutually exclusive risk choices use native radio semantics, visible dots, labels, and one-line descriptions. Color reinforces the text and never carries meaning alone.
- The selected analyst view is the value that enters Recommendation; the analyst conclusion remains a separate required field below it.
- Use `--salt-judgment-workflow-content-width` for the wider authoring measure and `--salt-judgment-risk-toggle-min-height` for descriptive option targets. Do not replace these with route-private dimensions.
- The judgment content scrolls independently above the stable focused-workflow footer. Narrow widths preserve both options, allow description wrapping, and must not create document overflow.
- Hover, selected, focus-visible, disabled submission, and reduced-motion states are required.

QA:

- Verify retained and changed states, keyboard radio movement, selection announcement, footer clearance, internal scrolling, and 390px recomposition.

## Timeline

Purpose: reconstruct attributable automated, human, evidence, and decision changes.

Rules:

- Titles name the actor and action; metadata carries the time.
- Details remain collapsed until requested.
- Marker tone reinforces actor class but never replaces explicit text attribution.
- Event content is workflow-owned; the shared component owns chronology and disclosure geometry.

Timeline remains available for preserved design-history comparisons. New credit-review Activity surfaces use ActivityLedger; its connected `timeline` layout is the current chronology treatment, while the flat ledger remains available for comparison.

## ActivityLedger

Purpose: provide one scan-first, attributable record of evidence, analyst, analysis, and decision changes.

Anatomy:

- Quiet column header for event and time.
- One restrained event glyph, title, optional one-line context, and right-aligned timestamp.
- Optional whole-row disclosure for supporting detail.
- Flat border-separated rows without an enclosing activity card. The connected timeline layout adds a restrained rail behind round event icons when chronology is the primary reading task.

States and interactions:

- Static rows when no detail is available.
- Hover, focus-visible, collapsed, and expanded states for disclosed rows.
- Mobile stacks the timestamp beneath the event copy and preserves the disclosure target.
- Reduced motion removes disclosure and hover transitions.

Rules:

- The event title names the action; the description names its immediate consequence; the timestamp carries chronology.
- Glyph and tone reinforce event type but never replace explicit attribution.
- Credit Reviews resolves finding, source-category, and activity-event glyphs from one feature-owned semantic map. Overview, Findings, Sources, drawers, and Activity must not create page-local icon mappings.
- Filters remain feature-owned and appear only when event volume makes them useful.
- Use the same ledger geometry across cases; case state changes event content, not the component family.
- Use `layout="timeline"` for the connected chronology treatment; leave the default ledger layout available for Design Tools comparisons and low-density audit surfaces.
- Do not draw a leading rule above the column header. The first divider belongs between the column header and the event rows.

## Toast

Purpose: confirm a completed nonblocking workflow action.

Rules:

- Use concise title and optional one-line detail.
- Keep destructive confirmation and required decisions in the originating workflow surface.
- Toasts are dismissible, keyboard reachable, and exposed through a polite status region.
- Center desktop toasts in the application content area rather than the full viewport; center them in the viewport on mobile.
- Preserve a 32px close target with a restrained glyph and explicit focus-visible treatment.

## FileDropzone

Purpose: collect one evidence file through the native file picker or drag and drop without assigning domain meaning to the file.

States: idle, drag-hover, uploading, ready for review, verified, and failed.

Rules:

- The shared component validates PDF, XLSX, CSV, and DOCX files up to 25 MB; the owning feature maps an accepted file to its requirement and fixture.
- Click and keyboard activation open a native file input. Drag and drop uses the same validation path.
- `Ready for review` is not `Verified`. Verification is an explicit domain action owned by the evidence workflow.
- Keep the surface flat, border-led, and restrained. Do not turn evidence intake into a colorful upload card or a separate product metaphor.
- Replacement and failure recovery preserve the original requirement; they do not create a second workflow.
- Consume `--salt-file-dropzone-*` tokens and remove animation under reduced-motion preferences.

## Notice

Purpose: preserve important workflow context beside the decision it affects without creating a competing card or blocking modal.

Tones: info, success, warning.

Anatomy:

- One restrained semantic icon.
- Optional short title and one concise explanation.
- Optional quiet action aligned to the same workflow context.

Rules:

- Use pale indigo for neutral workflow context, moss for completed evidence changes, and amber only when the message truly requires caution.
- State the operational condition; do not personify AI or use sparkles, gradients, or decorative illustration.
- Keep the primary page or footer action outside the Notice. Its optional action is secondary or quiet.
- Info and success notices use polite status semantics; warning notices use alert semantics.
- Consume `--salt-notice-*` tokens for spacing, radius, type, icon, and tone surfaces.

## CreditFindingsWorkspace

Purpose: provide one credit-domain scan-and-review composition across case owners without turning findings into a generic shared Salt primitive.

Variants:

- Selected ledger: grouped finding rows on the left and an owner-supplied evidence/judgment preview on the right.
- Prerequisite state: zero findings plus the evidence requirement that prevents analysis.
- Zero-results state: zero findings plus the verified conclusion proving why no judgment is needed.

Rules:

- Keep ownership under `src/features/credit-reviews/findings`; product features supply data and actions, while Salt supplies the primitive controls.
- Every populated row uses the canonical 32px `IconTile` and the central credit-review glyph map.
- Show risk severity and workflow status as separate text values. Never infer one from the other in the component.
- Group counts and tab counts represent open work. Addressed work moves to its own group without losing selection.
- The owner-supplied preview contains cited evidence and one accountable action; the composition does not mutate workflow state itself.
- Missing evidence is a requirement, not a finding. A prerequisite state must report zero findings and name the dependency.
- Native button rows own hover, selected, focus-visible, and keyboard activation. At constrained widths, the preview follows the ledger and the page remains viewport-width.
- Consume `--salt-workspace-findings-*` and `--salt-workspace-finding-master-*` component tokens; do not repeat the geometry in route CSS.

## QA contract

- Inspect all shared components in `/design-system` Preview and Inspect modes.
- Verify keyboard focus, semantic headings, tab/tabpanel relationships, and status text.
- Check Credit Reviews at desktop and 390px mobile widths.
- Run `npm run build` after token or shared-component changes.
