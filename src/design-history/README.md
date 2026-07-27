# Design history boundary

This directory preserves replaced visual implementations as interactive, read-only references. It is not a second component library.

Rules:

- Production features and `src/shared/ui` must never import from `src/design-history`.
- The Design Tools and Design System features are the only live consumers allowed to render archived versions.
- A component moves here only after a newer version is approved and promoted into canonical Salt shared UI.
- Archived components must own frozen, locally scoped styles and variables. They must not define `:root` tokens or consume the current canonical component they are preserving.
- Archived versions do not receive product features, accessibility regressions, or visual updates. If an archive must change to remain runnable, record the compatibility change in its decision document.
- Folder names include the component and version, for example `drawer/v1-overlay/`.

Current components do not belong here. Drawer V1 remains in `src/shared/ui/Drawer` until a later version becomes current.
