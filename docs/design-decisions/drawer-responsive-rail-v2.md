# Drawer responsive rail V2

Status: Archived for Credit Reviews. V1 and V2 remain preserved; V3 Outcome-led preview is current.

## Decision

Responsive Drawer V2 established the current shell behavior. At the full 968px content width, a selected review condenses the queue to 544px and opens its existing 392px detail rail after a 32px gutter. The panel is sticky within the queue context, capped to the remaining viewport height, and scrolls its body independently.

Below the 968px content threshold, V2 falls back to the preserved overlay contract. At 520px and below it becomes a full-viewport panel and locks background scrolling. V3 retains this proven shell and replaces only the feature-owned content hierarchy.

## Evidence

The measurements, interaction states, responsive findings, and reference artifacts are recorded in `docs/MERCURY_REIMBURSEMENTS_DRAWER_AUDIT.md`.

## Component ownership

- Shared `Drawer` owns overlay/responsive positioning, viewport-height measurement, motion, scroll containment, Escape behavior, and focus return.
- Credit Reviews owns priority-column condensation, selected-review state, domain content, and the Design Tools route choice.
- Reimbursements remains the measured product-reference comparison that proved the shared responsive shell.
- Shared tokens own the repeated dimensions and motion values.

## Promotion evidence

Credit Reviews V2 was verified at 1410 × 1177, 1100 × 900, and 430 × 900. The desktop lane measured 544 + 32 + 392px; intermediate used the fixed overlay; mobile matched the viewport with no document overflow. Long content scrolled inside the body, Escape restored focus to the selected review row, and V1 remained directly selectable at `?design=credit-review-queue-v1-overlay-drawer`.
