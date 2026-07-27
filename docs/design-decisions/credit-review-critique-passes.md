# Credit review critique-and-fix passes

## Pass 1 — Product and UX

### Findings

1. The application shell reduced the usable width by 200px, but the workspace responded only to viewport breakpoints. At common app widths the case identity collapsed while the content abruptly widened at the next breakpoint.
2. Finding-local `challenging`, `activeStage`, and note state survived navigation to the next finding, placing the analyst inside the wrong interaction with stale context.
3. After accepting a reassessment, the case status continued to say `Analysis updated`, the change record continued to say acceptance was pending, and the Findings tab showed a distracting zero badge.
4. The reassessed dossier still labeled its preserved original conclusion as the current preliminary assessment.
5. Source and finding ledgers required horizontal scrolling on mobile.

### Fixes

- Introduced a shared fluid outer-canvas token, retained the 968px content measure, and changed the queue and case workspace to container-aware composition.
- Keyed the investigation by finding id so local review state resets when the analyst changes findings.
- Derived the top status from the actual `analysis-updated` state, changed accepted copy after human confirmation, and omitted a zero tab count.
- Relabeled the original conclusion after reassessment as `Original assessment · preserved`.
- Reflowed finding and source rows into compact multi-line mobile records.

## Pass 2 — Visual design director

### Findings

1. The finding experience used a vertical stepper, numbered rationale bubbles, tinted uncertainty callout, and nested cards. The result felt assembled rather than authored.
2. Repayment capacity used an awkward horizontal scenario strip and a separate covenant row; values did not read as a composed widget family.
3. The chart active value collided with the first axis label.
4. The recommendation rail was three independent cards, which weakened the memo and created card soup.
5. At 1000px the case header squeezed the title and metadata; the recommendation textarea clipped the authored rationale; a broad selector restyled the status pill in the decision record.

### Fixes

- Replaced the stepper and nested rationale treatments with quiet section navigation and one evidence dossier containing a factual basis ledger, assumptions, uncertainty, evidence rows, and one human judgment bar.
- Added compact, flat, and detail-tone variants to the shared Metric Card and rebuilt repayment capacity as Base case, Downside case, and Covenant floor cards.
- Moved the chart value away from the axis, aligned compact-card detail measures, and retained the meaningful actual/forecast distinction.
- Consolidated the recommendation rail into one decision-record artifact.
- Reflowed the case header and assessment body at usable-container widths, increased the rationale field height, and narrowed the selector to preserve standard Status Pill styling.

## Pass 3 — BCG X interview critique

### Findings

1. The baseline correctly exposed findings and evidence, but the automated analysis still appeared to be the protagonist.
2. Reassessment emphasized a risk transition more than the human intervention and the unchanged structural risk.
3. The senior handoff required reconstructing authorship, sources, findings, and changes from several surfaces.
4. Presentation alternatives needed to show real tradeoffs rather than exist only as prose.

### Fixes

- Selected a decision-first narrative: preliminary synthesis at the top, unresolved judgments next, and explicit human ownership at confirmation and submission.
- Rebuilt reassessment as an attributable change record with original rating, revised rating, new evidence, changed conclusion, unchanged exposure, and acceptance state.
- Created one credit memo handoff with a separate read-only decision record, named author, next accountable reviewer, source count, completed findings, and material outcome history.
- Preserved two rendered alternatives for each high-leverage area in Design Tools, with goal, hypothesis, advantage, weakness, and reason for the next option.

## Final craft pass

- Verified the queue and workspace use the same outer geometry.
- Rendered Overview at 1280px, 1000px, and 390px.
- Rendered finding, financial, and source routes at 390px, including lower chart and repayment content.
- Manually completed the full analyst flow through evidence linking, reassessment, acceptance, two additional findings, recommendation submission, decision history, source filtering, and source drawer inspection.
- Confirmed browser consoles contain no application warnings or errors.
- Confirmed production CSS uses design tokens rather than local colors, gradients, shadows, or geometry values.
