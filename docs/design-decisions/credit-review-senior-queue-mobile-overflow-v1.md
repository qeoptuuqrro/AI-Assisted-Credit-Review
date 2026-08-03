# Senior queue mobile overflow cue — V1

Status: archived with Senior review queue V1; preserved for comparison

## Decision

Keep the senior-review stage tabs as a horizontally scrollable Mercury-style underline rail. At narrow widths, add a quiet right-edge surface fade only while more stages remain off-screen. The cue disappears when the rail reaches its end.

This remains the frozen responsive contract for V1 `Submission queue`. V2 `Restrained decision inbox` is current and uses the shared Salt `Tabs` and responsive `Drawer` contracts instead of extending this page-owned cue.

## Why

The queue already recomposes correctly at 390px, but the last stage can appear visually clipped without an affordance. A low-contrast edge fade communicates continuation without adding a second control, changing the tab geometry, or competing with the review queue.

## Contract

- The tab rail remains keyboard and touch scrollable.
- The fade is pointer-transparent and uses Salt surface tokens.
- No page-level horizontal overflow is introduced.
- No extra icon, label, or persistent instruction is added.
- Reduced-motion behavior is unchanged because the cue is static.

## Verification

Checked at the true `390 × 844` viewport and at desktop width. The desktop rail has no cue when it fits; the mobile cue is present while the rail can scroll and is removed at the end.
