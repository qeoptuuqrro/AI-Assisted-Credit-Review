# Mercury Typography Audit

Source: `https://demo.mercury.com/dashboard`

Audit date: 2026-05-27

Viewport: 1280 x 720 desktop

Artifact: `output/playwright/typography-audit/mercury-dashboard-typography-20260527.png`

## Font Files

| Family | Observed usage | Loaded weights |
| --- | --- | --- |
| `Arcadia Text` | Body, navigation, buttons, tables, controls, labels | `400 500` |
| `Arcadia Display` | Primary page title and large display money | `380 500` |

## Type Roles

| Role | Family | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| Root/body containers | Arcadia Text | `16px` | `360` | `16px` | `normal` |
| Sidebar nav/table body | Arcadia Text | `16px` | `360` | `16px` | `normal` |
| Page title | Arcadia Display | `28px` | `380` | `36px` | `normal` |
| Large balance | Arcadia Display | `28px` | `380` | `36px` | `-0.84px` |
| Large balance cents | Arcadia Display | `20.44px` | `380` | `36px` | `0.01022px` |
| Section title | Arcadia Text | `19px` | `400` | `28px` | `normal` |
| Medium money | Arcadia Text | `19px` | `400` | `28px` | `-0.57px` |
| Guide/body prompt | Arcadia Text | `17px` | `400` | `28px` | `normal` |
| Default UI/action label | Arcadia Text | `15px` | `400` | `24px` | `normal` |
| Small money | Arcadia Text | `15px` | `400` | `24px` | `-0.45px` |
| Secondary UI | Arcadia Text | `14px` | `400` | `20px` | `normal` |
| Metadata/table outer header | Arcadia Text | `13px` | `400` | `20px` | `0.1px` |
| Bookmark money | Arcadia Text | `13px` | `400` | `20px` | `-0.39px` |
| Native small button wrapper | Arcadia Text | `13.3333px` | `360` | `normal` | `normal` |
| Badge/count label | Arcadia Text | `12px` | `480` | `20px` | `0.2px` |
| Tiny regular metadata | Arcadia Text | `12px` | `400` | `20px` | `0.2px` |
| Sortable table header button | Arcadia Text | `12px` | `400` | `normal` | `normal` |
| Chart axis label | Arcadia Text | `12px` | `360` | `24px` | `normal` |
| Small money cents | Arcadia Text | `10.95px` | `400` | `24px` | `0.005475px` |
| Avatar initials | Arcadia Text | `10px` | `480` | `24px` | `normal` |
| Micro badge | Arcadia Text | `10px` | `400` | `20px` | `0.2px` |

## 2026-05-27 Transactions Ledger Refresh

Source: `https://demo.mercury.com/transactions`

Artifact: `output/playwright/typography-audit/live-transactions-typography-20260527.json`

The live Transactions ledger uses a darker table ink and the metadata/table-header role for ledger headers:

- Ledger body cells: `Arcadia Text`, `16px / 16px / 360`, `normal` tracking, `rgb(30, 30, 42)`.
- Ledger headers: `Arcadia Text`, `13px / 20px / 400`, `0.1px` tracking, `rgb(112, 112, 125)`.
- Chart labels: `Arcadia Text`, `14px / 20px / 400`, `normal` tracking.

Local Screener verification: `output/playwright/typography-audit/local-screener-typography-after-20260527.json`, `output/playwright/typography-audit/local-screener-typography-after-20260527.png`.

## Token Mapping

The active React product implementation lives in `src/design-system/tokens.css` and `src/design-system/base.css`. The preserved legacy proving routes continue to consume the compatibility implementation in `src/styles/tokens.css`; new React work must not import that file.

| Mercury role | Token family |
| --- | --- |
| Body/nav/table body | `--mercury-type-body-*`, `--mercury-type-nav-*`, `--mercury-type-table-cell-*` |
| Page and section titles | `--mercury-type-title-main-*`, `--mercury-type-title-secondary-*`, `--mercury-type-title-tertiary-*` |
| UI labels and controls | `--mercury-type-ui-*`, `--mercury-type-ui-secondary-*`, `--mercury-type-label-*`, `--mercury-type-control-native-*` |
| Table headers | `--mercury-type-table-header-*` |
| Money | `--mercury-type-money-xl-*`, `--mercury-type-money-md-*`, `--mercury-type-money-sm-*`, `--mercury-type-money-bookmark-*` |
| Badges, avatars, and micro labels | `--mercury-type-tiny-*`, `--mercury-type-avatar-*`, `--mercury-type-micro-*` |
| Insights-only chart metrics | `--mercury-insights-*` |

## 2026-07-25 Reimbursements Annotation Study

Source: `https://demo.mercury.com/expenses/all-expenses`  
Viewport: `1357 × 1177`

Four user-annotated elements were measured from their visible text nodes rather than relying on the native button wrapper's inherited browser typography.

| Annotated element | Product role | Family | Size / line | Weight | Tracking | Control geometry |
| --- | --- | --- | --- | --- | --- | --- |
| Reimbursements | Page title | Arcadia Display | `28px / 36px` | `380` | normal | H1 box `198.42 × 36px` |
| Submit expense | Action label | Arcadia Text | `15px / 24px` | `400` | normal | `32px` high, `16px` radius, `4px 16px 4px 12px` padding |
| Pending Review | Filter-chip label | Arcadia Text | `15px / 24px` | `400` | normal | `32px` high, `0 12px` padding |
| All expenses | Section tab | Arcadia Text | `14px / 20px` | `400` | normal | `10px 0` padding, `41px` total height |
| 5 | Tab count | Arcadia Text | `12px / 20px` | `400` | `0.2px` | `20px` high, `4px` radius, `0 8px` padding |

The action and filter labels share the same visible typography role even though their wrapper components have different padding and background contracts. The tab count in this specific Reimbursements tab uses the tiny regular `400` role; it should not be conflated with heavier status-badge variants elsewhere in Mercury.

The active BCGX implementation maps these observations to semantic `--type-page-title-*`, `--type-action-*`, `--type-section-tab-*`, and `--type-count-*` tokens in `src/design-system/tokens.css`. The live mapping is displayed in the Design system → Foundations specimen.

## Enforcement

`npm run check:design` fails if strict product CSS reintroduces:

- Raw `font-size`, `font-weight`, `line-height`, `letter-spacing`, or non-Mercury `font-family`.
- Generic `--ds-font-size-*`, `--ds-line-height-*`, or `--ds-letter-*` typography aliases in strict CSS.
- Rogue heavy weights such as `520`, `650`, `700`, or `760`.

Strict coverage currently includes:

- `src/components`
- `src/pages`
- `src/platform`
- `src/styles/base.css`
- `legacy-runtime/shared/legacy/mercury/styles.css`
- `legacy-runtime/shared/styles/components.css`
- all active `legacy-runtime/features/**/styles.css` route styles
- `legacy-runtime/frameCleanup.js` iframe typography overrides

## 2026-05-27 Platform-Wide Tokenization Pass

The platform now has a zero-raw-typography rule for active React CSS, active legacy/proving route CSS, and the iframe cleanup layer. React typography resolves through Salt roles in `src/design-system/tokens.css`; legacy route-specific exact values remain represented in `src/styles/tokens.css` so proving routes can preserve their geometry without becoming a second product token source.

Browser QA artifacts:

- Live Mercury source: `output/playwright/typography-audit/mercury-dashboard-typography-20260527-refresh.png`
- Local IdeaGen home: `output/playwright/typography-audit/local-home-typography-20260527.png`
