# Company identity consistency V1

Date: July 26, 2026  
Status: Current platform contract

## Decision

Every active React surface that visually identifies a known credit-review company uses the existing Salt `CompanyLogo` component and `companyLogoDomains` API mapping. The mapping values and logo artwork remain unchanged.

BCGX product marks and human avatars are intentionally separate identity types and may continue to use product or person initials. Archived design-history and legacy proving routes remain unchanged.

## Audited adoption

- Review queue, portfolio overview, sidebar and mobile bookmarks.
- Meridian, Northstar, and standard case headers.
- Focused evidence and reassessment workflow headers.
- Borrower and forecast previews.
- Meridian facility summary and source-document masthead.
- Design-system object-header specimen.

## Replaced drift

- Meridian reassessment header letter mark.
- Meridian source-document wordmark letter.
- Meridian facility-summary letter mark.
- Northstar focused workflow and preview letter marks.
- Design-system specimen domain that bypassed the shared mapping.

## Guardrail

`npm run check:design-system` rejects known-company single-letter marks and statically named `CompanyLogo` usages that bypass `companyLogoDomains`.
