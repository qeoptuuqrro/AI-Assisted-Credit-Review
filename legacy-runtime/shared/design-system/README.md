# Legacy Shared Notes

The active design-system implementation now lives in:

- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/components`

This `legacy-runtime/shared` tree remains only as a compatibility lane for older iframe/static routes while they migrate into `src/pages`.

Do not add new React components here. New shared UI belongs in `src/components`.
