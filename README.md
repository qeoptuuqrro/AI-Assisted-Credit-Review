# BCGX Platform

This repository contains the new BCGX product application and a preserved Mercury reference implementation. Mercury informs the visual language; the React application owns its architecture, tokens, and component contracts.

## Live demo

[Open the AI-assisted credit review workspace](https://qeoptuuqrro.github.io/KCDESIGN/)

The public site is deployed automatically through GitHub Pages whenever `main` is updated.

## Run locally

```bash
npm start
```

Then open `http://127.0.0.1:5182`.

## Folder ownership

- `src/app/`: application shell, routing, providers, and cross-feature orchestration.
- `src/features/`: product-owned pages, workflows, local components, and data, including the React Reimbursements migration.
- `src/shared/ui/`: stable, low-domain UI primitives with explicit contracts.
- `src/design-system/`: BCGX primitive, semantic, and component tokens plus global foundations.
- `legacy-routes/`: preserved Mercury page entry files for visual reference.
- `legacy-runtime/`: preserved Mercury runtime for visual reference.
- `src/styles/tokens.css`: audited Mercury compatibility tokens; do not use in new product code.
- `public/`: Fonts and required static images.
- `docs/`: Mercury audit, pattern, parity, and translation records.

## Architecture rules

- New product code belongs under `src/`.
- Feature-specific components stay with their owning feature.
- Promote a component to `src/shared/ui/` only when it is foundational or reused across domains.
- New UI consumes semantic or component tokens from `src/design-system/tokens.css`.
- Legacy files are reference material and should not receive new product features.

## Excluded on purpose

- `legacy-runtime/features/ideagen/`
- IdeaGen-specific route HTML files
- `src/pages/ideagen/`
- `slides/`
- `ideagen-archive/`
- `output/` and `.playwright-cli/`
- generated `dist/`

The original workspace remains unchanged. This copy can be validated independently before any source files are moved or removed.
