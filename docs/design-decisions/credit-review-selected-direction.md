# Credit review selected direction

## Decision

Select one coherent document-led direction for production:

- Case workspace: **Decision brief**
- Finding investigation: **Evidence dossier**
- Reassessment: **Change record**
- Recommendation and senior handoff: **Credit memo handoff**

The common visual grammar is a stable 968px reading canvas, one dominant artifact per task, compact ledgers for supporting detail, restrained status treatment, and explicit human ownership at every consequential action.

Focused task exception: when the analyst must change evidence or request it from another party, the workflow may replace the ordinary case shell. Meridian uses a compact Treasury-style Context → Review → Result canvas. Northstar uses Create Invoice's two-zone composition with analyst work on the left and a realistic borrower-facing artifact on the right.

## Why this direction

The alternative portfolio cockpit increased information throughput but recreated the visual density and generic AI-dashboard quality the product needs to avoid. The decision brief gives the analyst a clear starting conclusion and makes unresolved judgments the next action.

The split source reader was strong for line-by-line verification but reduced the finding narrative to a cramped column at ordinary laptop widths. The evidence dossier keeps the analyst oriented and opens source detail only when it is needed.

The side-by-side scenario comparison made the automated output the protagonist. The change record instead preserves the evidence, the human intervention, the changed conclusion, and the structural risk that remains.

The collaborative decision room is useful later in the senior-review lifecycle, but it adds commentary mechanics before the analyst has authored a clear recommendation. The credit memo handoff produces the stronger first artifact and keeps the preliminary assessment read-only.

## System consequences

- Responsive behavior must be based on the usable content container, not only viewport width, because the 200px application rail changes the real layout width.
- Shared panels, metric cards, section headers, document rows, buttons, tabs, status pills, and tokens remain authoritative. Production screens must not introduce one-off gradients, decorative AI marks, or local spacing/color values.
- "Automated" is used only as provenance in activity and reassessment records. The interface does not present AI as a persona.
- The analyst must be able to challenge evidence, preserve added context, accept or reject a reassessment, and author the recommendation.
- Indigo is reserved for consequential workflow actions and updated state. Dark ink remains the shell/inverse neutral; it is not the default primary action.
- Shared `Notice` carries low-contrast workflow context. It must describe the operating condition and must not use a sparkle, AI persona, gradient, or decorative illustration.
- Meridian is the `Needs judgment` story: enough evidence exists, but the human must interpret what it means. Northstar is the `Needs verification` story: missing evidence must be requested and matched before analysis can finish.
- Activity uses one Mercury Treasury-style flat ledger across both cases. Meridian keeps filters and row disclosure because its history is denser; Northstar keeps the same geometry without unnecessary controls. The replaced Meridian timeline remains Activity V1 in Design Tools.
- Missing evidence is not promoted into a Finding. The clickable verification row owns request creation, delivery status, received source review, and analysis progress; a Finding appears only if verified evidence produces a conclusion requiring human judgment.

## Alternatives preserved

Both candidates for each high-leverage area remain available in Design Tools with their goal, hypothesis, advantage, weakness, and reason for the next option. The preserved baseline remains a separate V1 journey preview.
