# Salt design versioning architecture

Last updated: July 25, 2026.

## One source of truth

Salt shared UI always represents the current approved product design. Product pages import canonical components such as `src/shared/ui/Drawer/Drawer.tsx`; they never select `DrawerV1` or `DrawerV2` directly.

Visual iteration does not create permanent parallel production APIs. Version labels belong to the internal design workflow, not product imports.

## Version states

| State | Meaning | Product usage |
| --- | --- | --- |
| Current | Approved Salt implementation | Used by product pages and shown by default in `/design-system` |
| Candidate | Interactive proposal under evaluation | Available only inside Design Tools or a scoped comparison surface |
| Archived | Replaced implementation preserved for learning | Read-only and isolated under `src/design-history` |

Each component family must have exactly one Current version. Candidate and Archived versions may be absent.

## Ownership

```text
src/shared/ui/<Component>/
  Current canonical implementation

src/features/design-tools/
  Typed version registry and internal floating launcher

src/features/design-system/
  Current Salt library and controlled comparison entry point

src/design-history/<component>/<version>/
  Frozen interactive archive; never imported by product features

docs/design-decisions/
  Decision, evidence, tradeoffs, and promotion history
```

The version registry contains metadata, not production component selection logic. It tells internal tools what exists and which state it is in.

## Promotion workflow

Example: replacing Overlay Drawer V1 with Responsive Drawer V2.

1. Build V2 as a Candidate inside a scoped design-lab boundary.
2. Compare V1 and V2 with the same realistic content and interaction states.
3. Record the decision and approve V2.
4. Freeze the replaced V1 implementation and its scoped styles under `src/design-history/drawer/v1-overlay/`.
5. Promote V2 into `src/shared/ui/Drawer/` without renaming the production import to `DrawerV2`.
6. Mark V2 Current and V1 Archived in the typed registry.
7. Update `/design-system` so its default Drawer specimen renders V2.
8. Run `npm run validate` to block archive leakage and confirm the production build.

## Interaction model

The bottom-right Design Tools launcher is internal-only. It explains the active Salt version and provides access to history. It does not silently mutate the production interface.

When archived or candidate previews exist, selecting one should open a clearly labelled, scoped comparison view. If an application-wide preview mode is ever added, it must show a persistent “Previewing non-current design” notice and encode the selection in the URL. Non-current modes must never become the default.

## Preservation contract

An archived version keeps:

- Interactive behavior needed to understand the design.
- Its own scoped visual variables and styles.
- Realistic representative content.
- Keyboard and reduced-motion behavior where it existed.
- A decision document explaining why it was created and replaced.

It does not keep:

- Production imports.
- Root-level tokens.
- Shared aliases that could redirect product usage.
- Ongoing feature development.
- A second copy of the full application shell.

## Enforcement

`npm run check:design-history` fails when:

- Product or shared UI imports the design-history lane.
- Archived CSS defines root tokens.
- Archived drawer snapshots import the current shared Drawer.
- A registered component family has more or fewer than one Current version.
