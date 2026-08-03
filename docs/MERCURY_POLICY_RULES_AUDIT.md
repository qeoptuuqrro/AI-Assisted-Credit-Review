# Mercury Policy Rules Capture Contract

Source of truth: `https://demo.mercury.com/accounts#auto-transfers`

Local target: `/policy-rules`

Capture date: `2026-08-02`

Owner: `BCGX Policy Rules`

## Intent

- Product workflow: a calm overview of four bank-defined assessment policies, consistent read-only inspection, optional governed Leverage detail, and a focused builder for new or linked draft revisions that never transfers decision ownership to AI.
- IdeaGen transfer target: make lending policy logic as easy to scan as Mercury's auto-transfer templates while preserving structured thresholds, evidence gates, inherited policy context, human actions, source versions, authorization, and auditability through overview, inspection-dialog, builder, and direct-link disclosure levels.
- Closest Mercury patterns: compact page header, four equal icon-first overview cards, compact wrapping template chips in a bounded form-like popup, a visible sparkle-labeled custom prompt, large aligned fields, deliberate review confirmation, focused detail, and success/error feedback. Mercury's template library informs both overview geometry and the separate builder.
- Canonical components to consume: Salt `Button`, `CompanyLogo`, `Icon`, `IconTile`, `StatusPill`, `Notice`, `Toast`, `ObjectHeader`, and the shared `Dialog` shell.
- Canonical components to promote: a low-domain `Dialog` only if the implementation proves a reusable modal contract. Rule records, conditions, preview logic, and governance state remain feature-owned.

## Source Artifacts

| Artifact | Path or URL | Notes |
| --- | --- | --- |
| Live reference | `https://demo.mercury.com/accounts#auto-transfers` | Audited through every visible template and the custom/generation entry point. |
| Mercury review screenshot | `output/playwright/mercury-policy-rule-review.png` | Final sentence review, optional nickname, authorization copy, Back/Create actions. |
| Mercury library screenshot | `output/playwright/mercury-policy-rule-library.png` | Compact created-rule row and creation success state. |
| Mercury detail screenshot | `output/playwright/mercury-policy-rule-detail.png` | Right-side rule detail with Transactions, Edit, and Delete actions. |
| Mercury create screenshot | `output/playwright/mercury-policy-rule-create.png` | Five starting templates plus the plain-language entry point. |
| Mercury generation screenshot | `output/playwright/mercury-policy-rule-generating.png` | Prompt retained while the disabled action changes to `Loading...`. |
| Mercury mismatch screenshot | `output/playwright/mercury-policy-rule-generated-mismatch.png` | The transfer prompt became the wrong target-balance template and must remain reviewable. |
| Earlier overview artifacts | `output/playwright/policy-rules/assessment-policies-overview-desktop.png`, `assessment-policies-overview-mobile.png`, `assessment-policies-overview-mobile-scrolled.png` | Historical proof of the denser summary-card direction; these do not prove the current icon-first card strip. |
| Pre-disclosure detail artifacts | `output/playwright/policy-rules/assessment-policies-leverage-detail-desktop.png`, `assessment-policies-leverage-example-desktop.png`, `assessment-policies-leverage-detail-mobile.png`, `assessment-policies-leverage-example-mobile.png` | Preserve the full-detail baseline before assessment bands moved behind native progressive disclosure. |
| Current overview/dialog QA | `output/playwright/policy-rules/current-overview-cards-{desktop,tablet,mobile}.png`, `current-dialog-leverage-desktop.png`, `current-dialog-leverage-limit-expanded-desktop.png`, `current-dialog-leverage-outcomes-desktop.png`, and `current-dialog-leverage-outcome-expanded-mobile.png` | Proves the four-card strip, intentional two-line titles, two-step inspection, aligned 48px disclosures, expanded limit/outcome states, visible mobile footer, and no overflow. |
| Direct-link detail QA target | `/policy-rules/leverage-ceiling` at 1280 x 900 and 390 x 844 | Must preserve the governed fallback, canonical Meridian logo, lifecycle action, and collapsed/open assessment bands without making it the normal card interaction. |
| Earlier builder desktop | `output/playwright/policy-rules/assessment-policies-builder-desktop.png`, `assessment-policies-builder-config-desktop.png` | Historical proof of the earlier large-card chooser; it does not validate the compact-chip or linked-revision contract. |
| Earlier builder mobile | `output/playwright/policy-rules/assessment-policies-builder-mobile.png`, `assessment-policies-builder-config-mobile.png`, `assessment-policies-builder-config-mobile-scrolled.png` | Historical full-width builder proof; it does not validate the new rail alignment, prompt treatment, or revision handoff. |
| Current builder desktop QA | `output/playwright/policy-rules/current-builder-v2-choose-desktop.png`, `current-builder-v2-configure-desktop.png`, and `current-builder-v2-review-desktop.png` | Proves the canonical 720px builder, compact wrapping chips, aligned three-step rail, visible sparkle prompt, structured condition editor, review state, and reachable actions at 1280 x 900. |
| Current builder mobile QA | `output/playwright/policy-rules/current-builder-v2-choose-mobile.png`, `current-builder-v2-configure-mobile.png`, `current-builder-v2-configure-mobile-scrolled.png`, and `current-builder-v2-review-mobile.png` | Proves the full-width 390 x 844 sheet, 44px chips, 356px aligned controls, internal body scrolling, a visible footer, and no horizontal overflow. |
| Current SelectMenu QA | `output/playwright/policy-rules/current-builder-v3-select-menu-desktop.png`, `current-builder-v3-select-menu-mobile.png`, and `current-builder-v3-select-menu-mobile-up.png` | Proves trigger-width option surfaces, restrained selected/open states, Escape containment, 356px mobile geometry, downward Metric placement, upward Required evidence placement, and no footer collision or horizontal overflow. |
| Linked revision QA | `output/playwright/policy-rules/current-dialog-v2-edit-entry-mobile.png`, `current-builder-v2-revision-desktop.png`, and `current-builder-v2-revision-mobile.png` | Proves the authorized read-only-inspection handoff, inherited policy context, visible `MER-2026.07` base version, condition-only editing, and reachable revision actions on desktop and mobile. |
| Current overview handoff | `output/playwright/policy-rules/current-builder-v2-overview-desktop.png` | Fresh 1280px overview capture with no dialog open; the same fresh tab produced no console warnings or errors. |
| Prior local artifacts | `output/playwright/policy-rules/policy-rules-library-*.png`, `policy-rules-leverage-*.png`, and earlier `policy-rules-builder-*.png` | Preserve evidence for the earlier template-plus-ledger direction; they are historical and do not prove the current overview contract. |
| Reduced-motion verification | `src/shared/ui/Dialog/Dialog.module.css`, feature CSS, and focused Policy Rules tests | Dialog motion is removed and generation remains understandable through static steps and `aria-live` status. |

## Layout

- Shell and navigation: Mercury keeps its normal account shell. BCGX adds `Policy rules` to the existing app navigation and uses the normal Salt product shell.
- Content rail: Mercury uses a wide page canvas with a compact header and one flat content section. BCGX uses the existing centered product rail, a quiet title/description pair, and a visually secondary `Create policy` action rather than an admin-console toolbar.
- Overview rhythm: four canonical policies appear as equal 132px cards in one desktop row. The grid becomes two columns in constrained/tablet layouts and one column only below a 300px content container. Every card uses the same 40px icon tile, two-word title, and chevron; there is no description, status, outcome, template section, ledger heading, search, filter rail, or draft inventory.
- Card density: each policy exposes only enough information for recognition. Status, scope, metric, limit, evidence, and actions move into the inspection dialog. Version, owner, and effective date remain behind `Policy record`; lifecycle controls and verified case detail remain on governed detail surfaces.
- Progressive disclosure: all four cards are interactive. Activation keeps `/policy-rules` visible and opens the same centered read-only dialog with typed policy content. `/policy-rules/leverage-ceiling` remains the direct/deep-link full route, and its assessment bands stay behind native disclosure.
- Inspection dialog: centered and bounded to the shared 720px large width. It shows one concise description, status plus real policy scope, optional record metadata, and a two-segment progress rail. `Rule logic` contains three equal 48px disclosure controls for metric, limit, and evidence. `Outcomes` contains three equal controls for within-limit, outside-limit, and missing-evidence paths. Only one inline explanation opens at a time. Chevrons mean reveal, not edit; the dialog exposes no select, combobox, listbox, or mutation affordance.
- Builder dialog: new policies and authorized linked revisions use one canonical 720px builder. Its edge-anchored `Choose`, `Configure`, and `Review` progress rail spans the same content measure as the template chips, custom prompt, editor, review, and footer actions. The first and last progress markers align to the content edges; stage content must not use negative margins or a second inner rail.
- Builder chooser: compact icon-and-label template chips wrap naturally above a divider. The custom-policy entry below it uses a visible sparkle icon and concise label, a bounded textarea, and an always-present `Generate draft` action that is disabled until trimmed prompt text exists.
- Sticky/fixed layers: dialog and builder footers remain available without covering content; pause/activate stays on the direct-link full-detail route and never appears inline on the overview or inspection dialog.
- Mobile behavior: the overview keeps two compact columns at 390px, the page action becomes full width, disclosure labels stack above equal-width controls without wrapping, expanded explanations scroll inside the dialog body, and full-detail sections recompose without horizontal overflow. The builder becomes a full-width sheet, keeps the three-step rail aligned to its content edges, wraps chips without clipping, and keeps the prompt, disabled/enabled Generate action, editor controls, and footer actions reachable without horizontal overflow.

## Text Inventory

| Surface | Exact Mercury text | BCGX translation | Owner |
| --- | --- | --- | --- |
| Page title | `Accounts` / `Auto transfer rules` | `Assessment policies` | App / feature |
| Page description | `Create rules that move money between your bank accounts.` | `Bank-defined thresholds, evidence requirements, and review actions.` | Feature |
| Primary CTA | `Create rule` | `Create policy` | Feature |
| Overview records | Created auto-transfer records | `Coverage floor`; `Leverage ceiling`; `Customer concentration`; `Forecast completeness` | Feature |
| Overview card content | Icon-first template title | Two-word policy title plus chevron | Feature |
| Builder templates | `Distribute funds across accounts`; `Maintain a target account balance`; `Schedule recurring transfers`; `Redirect incoming funds` | `Leverage ceiling`; `Coverage floor`; `Concentration monitoring`; `Evidence requirement` | Feature |
| Custom entry | `Create custom rule` | `Custom policy` | Feature |
| Generated entry | `Describe your rule to generate it` with a 1000-character limit | Sparkle + `Describe the policy in your own words`; `Generate draft` remains visible and disabled until text exists | Feature |
| Revision action | Mercury `Edit` reopens a populated form | `Edit as draft` for authorized users; active inspection remains read-only | Feature |
| Review heading | `Review auto transfer rule` | `Review policy rule` | Feature |
| Review action | `Create rule` | `Save draft` | Feature |
| Success | `Auto transfer rule created` | `Policy draft saved`; status changes report `Rule activated` or `Rule paused` | Feature |
| Error | `Enter a target balance` | Field-specific validation; generation failures preserve the prompt and editable draft | Feature |
| Quick inspection | Mercury centered template form | Policy name, concise summary, status/scope, optional `Policy record`, and two read-only steps | Feature |
| Inspection fields | Large aligned transfer-rule fields | Rule logic: `Metric`, `Limit`, `Evidence`; outcomes: `Within limit`, `Outside limit`, `Evidence missing` | Feature |
| Inspection actions | Mercury modal footer progression | `Close` / `Next`, then `Back` / `Done` | Feature |
| Full-detail actions | Governed direct-link fallback | `Pause rule` / `Activate rule`, with confirmation and attribution | Feature |

### Inspection content contract

| Policy | Metric | Limit |
| --- | --- | --- |
| Coverage floor | `Downside fixed-charge coverage` | `At least` / `1.20x` |
| Leverage ceiling | `Verified total debt / EBITDA` | `At most` / `4.25x` |
| Customer concentration | `Top-two customer revenue` | `At most` / `50%` |
| Forecast completeness | `Complete forward forecast horizon` | `At least` / `12 months` |

## Mercury Interaction Findings

### Template forms

- `Distribute funds across accounts` asks for transfer type, starting account, one or more destinations, an allocation visualization, and frequency.
- `Maintain a target account balance` asks for account, boundary operator, target amount, supporting account, and frequency.
- `Schedule recurring transfers` asks for transfer type, starting account, amount/destination rows, and frequency.
- `Redirect incoming funds` scopes eligible incoming transfers, then asks for starting account and percentage destinations with allocation feedback.
- Each form uses sentence-like connective copy around structured controls and only exposes fields relevant to the selected template.

### Generated rules

- The create dialog offers template chips above a divider and a natural-language textarea below it.
- Generate remains disabled until prompt text exists and the prompt shows a 1000-character counter.
- Prompt tested: `Every Friday, transfer $100 from Ops / Payroll to Savings.`
- Mercury generated the wrong template and a `$10,000` target-balance condition. This is decisive evidence that generated output must be shown as an editable, reviewable draft and must never activate silently.

### Review and lifecycle

- The structured form advances to a compact review dialog with one natural-language rule sentence, optional nickname, first-run timing, settlement text, and explicit authorization.
- Creation returns to the library, announces `Auto transfer rule created`, and renders one flat row with name, cadence, next run, icon, and trailing menu.
- Selecting the row opens a right-side detail panel with the rule sentence, next/last transfer, modification attribution, and Transactions/Edit/Delete actions.
- Edit reopens the same populated structured form.
- In the public demo, Delete removes the rule immediately and reports `Auto transfer rule removed`; no confirmation was presented.
- No pause/resume control was exposed in the audited demo state.

## Component Inventory

| Mercury surface | React target | Variant or slot | States required | Notes |
| --- | --- | --- | --- | --- |
| Policy overview | `AssessmentPoliciesOverview.tsx` | feature-owned page composition | desktop, mobile | Owns the exact title, subtitle, secondary create action, and four-policy ordering. |
| Policy summary | `AssessmentPolicyCard.tsx` | feature-owned icon-first card | default, hover, active, focus-visible | Equal 132px button with one icon tile, two-word title, and chevron. Every card opens quick inspection; no inline lifecycle action. |
| Quick inspection | `PolicyRuleInspectionDialog.tsx` composed from `src/shared/ui/Dialog` | feature-owned read-only disclosure flow | definition, outcomes, disclosure open/closed, active, paused, desktop, mobile | Keeps overview context while exposing the same typed definition and outcome paths for every rule without implying editability. |
| Company identity | `src/shared/ui/CompanyLogo/CompanyLogo.tsx` plus `companyLogoDomains` | Meridian Foods | loading, loaded, fallback | Reuse the canonical credit-review mapping on the full-route example. |
| Builder template choice | `RuleBuilderDialog.tsx` | feature-owned compact wrapping chip group | default, hover, focus-visible, selected, wrapped | Icon-and-label templates live inside authoring, not on the overview. |
| Create/review modal | `src/shared/ui/Dialog/Dialog.tsx` plus feature content | canonical 720px shell with aligned content rail | choose, configure, review, linked revision, dirty, validating, generating, error, success, desktop, mobile | Only the shell is shared; the three-step rail and all stage content use one content measure. |
| Status | `src/shared/ui/StatusPill/StatusPill.tsx` | policy status tone | active, draft, paused, superseded | Text remains explicit. |
| Feedback | `src/shared/ui/Toast/Toast.tsx` and `Notice` | operation feedback | loading, error, success | Focus is not moved to transient success. |
| Leverage detail | `PolicyRuleDetail.tsx` | routed feature view | active, paused, permitted, read-only, bands collapsed/open | Stable direct-link route; assessment bands use native progressive disclosure. |
| Case example | `MeridianPolicyPreview.tsx` | verified metrics/evidence composition | active, preview-only | Calculation and policy evaluation remain separate typed objects; Meridian identity uses the canonical logo mapping. |

## Token Inventory

| Token family | Mercury behavior | Product token target | Notes |
| --- | --- | --- | --- |
| Color | white canvas, quiet gray boundaries, sparse violet action emphasis | `src/design-system/tokens.css` | Use existing Salt semantic roles; no policy-specific palette. |
| Spacing | compact header, 16-24px control groups, generous section separation | existing `--salt-space-*` | Use feature geometry only for the case-preview composition. |
| Radius/border | restrained small-radius cards, dialog, and 48px field surfaces | existing control/panel/dialog tokens | No oversized rounded cards. |
| Shadow/elevation | canonical Dialog elevation and border-led card grouping | existing Salt overlay/elevation tokens | Keep the main page flat beneath overlays. |
| Typography | sentence-like 15px controls, 13px metadata, 28px page title | existing Mercury-aligned Salt type roles | Normal letter spacing. |
| Dimensions | 132px overview cards, 40px icon tiles, bounded 720px inspection/builder Dialog, compact wrapping chips, and one aligned builder content rail | existing app rail, spacing, icon, and dialog tokens | Never scale type with viewport width. |
| Motion | short overlay entrance and discrete generation feedback | existing Salt motion tokens | Reduced motion uses opacity/status replacement. |

## Interaction Contract

- Default: show `Assessment policies`, the exact supporting sentence, the secondary `Create policy` action, and four equal icon-first cards. Do not render descriptions, statuses, outcomes, authoring templates, search, filters, ledger columns, inline status actions, or saved drafts.
- Hover: every card receives the same quiet background, border, elevation, and press response because every card opens a real inspection dialog.
- Selected: card activation opens its centered inspection dialog without changing `/policy-rules`. The inspector starts on collapsed `Rule logic`; a disclosure opens one immutable explanation, `Next` replaces logic with outcomes, and `Back` returns to a reset logic step. Direct `/policy-rules/leverage-ceiling` entry opens governed full detail. The overview itself has no persistent selection mode.
- Authoring: `Create policy` opens `Choose`. Compact template chips select an approved starting type; the custom prompt can generate a proposal only after non-whitespace text exists. Template and generated paths converge on `Configure`, where the user edits structured metric, comparator, and threshold fields before `Review` and `Save draft`.
- Revision: active inspection never becomes editable. For an authorized user, `Edit as draft` closes inspection and opens the same builder as a linked, prepopulated condition-only revision. Scope, calculation method, evidence requirement, and outcome actions remain inherited and read-only; saving leaves the active rule and version unchanged.
- Focus-visible: the create action, all four card triggers, dialog close controls, full-detail controls, disclosure summary, template choices, selects, and fields have an explicit keyboard focus treatment only after keyboard navigation.
- Disabled: `Generate draft` remains rendered but disabled until trimmed prompt text exists; review/save actions communicate invalid structured fields or insufficient permission. Disabled activation never relies only on tooltip copy.
- Loading: generation shows a short staged explanation (`Reading policy language`, `Structuring conditions`, `Preparing review`) and preserves the prompt.
- Error: invalid fields are announced next to the field; generation can be retried without losing the prompt or partial draft.
- Success: draft save closes authoring and uses a centered, dismissible toast; the persisted draft does not become a fifth overview record. Status feedback appears after a confirmed full-detail action.
- Open/close: Escape, backdrop, the icon button, `Close`, or `Done` closes the inspection Dialog and returns focus to the exact card trigger. Reopening any policy resets to collapsed `Rule logic`. Dirty authoring requires discard confirmation and returns focus to `Create policy`.
- Keyboard: Tab order follows visual order, inspector stage changes focus the first disclosure in the new step, Enter/Space operate disclosures, and template choices behave as a selection group without triggering unrelated page actions.
- Reduced motion: remove translating/scaling overlay motion and replace generation animation with static progress text plus `aria-live` state.

## Logic Contract

- Calculations: approved calculation services produce typed metric snapshots. Policy Rules never derive leverage from visible dollar figures in the browser.
- Policy: a versioned, bank-owned rule compares a calculation snapshot to an explicit condition and returns required actions.
- AI: parses plain-language input into an editable draft and explains a result. It cannot activate, pause, approve, or mutate a calculation.
- Formula boundary: Policy Rules stores an approved metric identifier, comparator, and unit-validated threshold. It does not accept, persist, or execute arbitrary free-text formulas; natural-language generation only proposes values for the structured fields.
- Human ownership: analysts own recommendations; senior credit owns final decisions; authorized policy administrators own rule activation.
- Leverage semantics: the current Meridian `4.25x` is a proposed facility maximum in a draft credit agreement. The prototype must label its scope honestly or explicitly establish it as an approved version; it must not silently present it as enterprise policy.
- Overview projection: the four canonical policy definitions project into icon, two-word title, and chevron only. Persisted drafts remain authoring records and do not join that projection.
- Inspection projection: every policy maps the same typed definition into summary, status/scope, metric, operator, threshold, required evidence, and all three action paths. Owner, version, and effective date remain available as secondary record metadata. The dialog does not calculate, mutate, or imply editability.
- Leverage full detail: the verified example retains `3.9x`, `4.25x max`, `Moderate`, `0.35x cushion`, and the included `$2.1M equipment obligation`. The direct route provides stable governed explanation without making every overview visit carry that density.
- Assessment bands: below `3.5x` is `Lower concern`, `3.5x-4.25x` is `Moderate`, and above `4.25x` is `Policy exception`. The proposed maximum is inclusive, and these ranges remain collapsed until requested on full detail.
- Boundary: `4.25x` is within policy for an inclusive `<=` ceiling. Values above the unrounded threshold take the exception branch. Invalid or stale snapshots do not produce a risk label.
- Versioning: editing an active rule creates a condition-only draft version. The draft uses `source: "existing_policy"` and records `baseRuleId` plus `baseVersion`; scope, calculation method, evidence requirement, and outcomes are inherited from that immutable base. Saving never mutates or supersedes the active version. Only a separate authorized activation may supersede it.
- Audit linkage: the draft-created audit record links the new draft id to its source, base rule id, base version, actor, and time. Review and activation append attributable events rather than rewriting that lineage.
- Persistence: drafts, status overrides, and audit entries persist. Drafts are intentionally absent from the overview; dialog, toast, loading, and generation animation state do not persist.
- Authorization: prototype policy admins may create/edit/activate/pause. View-only users may inspect and test but cannot change policy state.

## Drift Risks

- Copying Mercury's immediate Delete behavior into a governed policy surface.
- Treating generated copy as an active policy instead of an editable draft.
- Turning plain-language input into executable policy code or exposing an unrestricted formula editor.
- Editing an active record in place, dropping base-rule/version linkage, or letting a condition-only revision alter inherited scope, calculation method, evidence, or outcomes.
- Reintroducing a template gallery, search/filter toolbar, dense ledger metadata, or inline lifecycle actions on the assessment overview.
- Rendering saved drafts beside the four canonical policies or turning the cards into dense policy summaries.
- Reintroducing a Drawer or route navigation as the normal card interaction, or removing the stable Leverage detail route needed for direct links.
- Recreating Meridian initials or a feature-owned mark instead of using `CompanyLogo` with the canonical domain mapping.
- Expanding assessment bands by default and making reference detail compete with the rule, evidence gate, and case result.
- Hand-calculating `3.7x` or `3.9x` from incomplete visible source values.
- Calling the proposed Meridian `4.25x` covenant a bank-wide active policy.
- Allowing policy evaluation to write directly into Meridian credit-review workflow state.
- Changing the approved assessment bands or outcome wording without product evidence.
- Building a node canvas, code editor, generic chatbot, or nested-card configuration console.
- Creating page-local buttons, inputs, status pills, palette, typography, shadows, or radius values.

## Open Gaps

- Back-end calculation snapshot, policy version, authorization, and audit services are represented by typed prototype fixtures.
- Current draft, status, and audit-entry persistence uses versioned, validated browser `localStorage`. This is prototype continuity only, not compliance-grade storage: production requires authenticated server persistence, immutable audit records, authorization enforcement, concurrency handling, retention, and cross-device synchronization.
- Product approval is still needed for above-ceiling assessment mapping; the prototype can show an exception and required review without inventing a new risk label.
- Enterprise versus facility-scoped ownership of the Meridian maximum needs an explicit product decision before production use.
- Downside coverage, customer concentration, and forecast completeness intentionally have no detail route in this prototype; their typed inspection dialogs provide useful rule logic without placeholder navigation.
- Production draft review and activation require server-enforced permissions, immutable base-version checks, conflict handling, and an attributable supersession record.

## Local QA Gate

- Overview: assert the exact title, subtitle, four two-word names, four buttons, icon tiles, and chevrons. Assert that descriptions, outcomes, and statuses are absent from cards.
- Progressive disclosure: assert that every card opens the same inspection-dialog structure and that templates, `Rule library`, search, filters, inline lifecycle controls, and persisted drafts are absent.
- Dialog: verify primary scope, hidden-until-requested record metadata, single-open disclosure behavior, metric/limit/evidence explanations, all three outcome paths, `Next`/`Back`/`Done`, reset on reopen, Escape/backdrop/footer close, exact trigger focus return, and absence of combobox/listbox semantics.
- Full detail: verify direct deep linking, rule explanation, evidence gate, required human action, verified Meridian example, and assessment bands in both collapsed and open states.
- Desktop at 1280 x 900 or wider: require one row of four equal cards, a centered bounded Dialog, aligned 48px disclosure controls, readable expanded panels, and Design Tools launcher clearance.
- Tablet and mobile at 768px and 390 x 844: require two equal card columns, one-line labels, equal-width controls, contained expanded panels, both footer actions reachable, and no horizontal overflow. Below a 300px content container only, cards stack one per row.
- Builder: verify the canonical 720px measure; compact wrapping icon chips; edge-anchored `Choose` / `Configure` / `Review` rail aligned with every stage; visible sparkle prompt label; always-present Generate action disabled until trimmed text; structured metric/comparator/threshold editing; validation; review; and draft save. Custom single-select fields use trigger-width option surfaces, complete keyboard navigation and typeahead, outside-pointer dismissal, and upward placement near the footer. Tab and Shift+Tab remain in the dialog, menu Escape stays inside the builder, cancel/discard return focus to the originating trigger, body scroll locking clears on close, and dirty Escape preserves the draft.
- Linked revision: verify authorized `Edit as draft`, prepopulated condition values, inherited read-only scope/calculation/evidence/outcomes, `source: "existing_policy"`, base rule/version audit linkage, view-only absence or disabled state, and no mutation of the active policy after save.
- Lifecycle and persistence: a confirmed status from full detail survives reload, authoring drafts survive reload without appearing on the overview, and view-only access cannot mutate status.
- Reduced motion and console: Dialog/generation fallbacks remain understandable, and overview/dialog/detail/builder flows produce no warnings or errors.

## Validation

The V2 builder and linked-revision artifact set validates this change at 1280 x 900 and 390 x 844. At 390px, the viewport and document widths both measure 390px, the dialog client and scroll widths both measure 388px, all editor controls measure 356px, and the fixed footer ends at 843px in the 844px viewport. The form body scrolls internally without horizontal overflow or covering the footer.

The V3 SelectMenu pass replaces operating-system selects with one shared Mercury-aligned combobox. Desktop trigger and menu widths both measured 478px. At 390 x 844, the Metric trigger and menu both measured 356px; Required evidence opened upward with a 52px separation from its trigger, ended 137px above the fixed footer, and preserved a 390px document width. Escape closed only the active menu and retained both builder state and trigger focus. A fresh local tab produced no console warnings or errors.

- [x] Generated canonical builder desktop artifacts for Choose, Configure, and Review.
- [x] Generated canonical builder mobile artifacts for chip wrapping, prompt/action fit, structured controls, internal scrolling, and reachable footer actions.
- [x] Generated linked `Edit as draft` desktop and mobile artifacts from active-policy inspection.
- [x] Verified the active policy remains read-only and unchanged after a linked draft is saved.
- [x] Verified source/base-version lineage, authorization, focus return, dirty-close protection, keyboard order, and reduced-motion behavior through focused tests and browser QA.
- [x] Verified a fresh local tab produces no console warnings or errors.
- [x] Passed the prototype-copy, design-history, and design-system drift checks; all 231 tests with the thread pool; TypeScript; and the production build.
