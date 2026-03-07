# Landing Page Non-Functional Acceptance Criteria

## Scope

These criteria define launch readiness for the first production landing page iteration.

## Usability Criteria

- Clear value proposition is visible above the fold on desktop and mobile.
- Primary CTA remains visible without confusion across all standard breakpoints.
- Content hierarchy supports scan-first behavior (headline -> proof -> action).
- Footer includes required legal/support links.

Acceptance checks:

- 5-second comprehension test with internal reviewers passes (at least 80% can describe value and next action).
- No critical UX navigation dead-ends in main CTA paths.

## Accessibility Criteria (WCAG 2.2 AA Baseline)

- Keyboard access for all links/buttons and interactive controls.
- Visible focus indicators for all actionable elements.
- Color contrast meets AA minimum for text and UI controls.
- Semantic heading and landmark structure is valid.
- Images/icons include meaningful alt text where applicable.

Acceptance checks:

- Automated scan (axe/Lighthouse equivalent) with no critical accessibility violations.
- Manual keyboard walkthrough completed for hero-to-footer journey.

## Performance Criteria

- LCP <= 2.5s on representative mobile profile.
- CLS <= 0.1.
- INP <= 200ms for key interactions.
- Initial payload optimized with minimal blocking resources.

Acceptance checks:

- Lighthouse mobile performance score >= 85.
- Repeat-run variance remains within acceptable range (no severe regressions).

## SEO and Discoverability Criteria

- Unique page title and meta description aligned to value proposition.
- Canonical URL present.
- Open Graph and Twitter metadata present.
- Valid indexability configuration (robots, no unintended noindex).

Acceptance checks:

- Structured metadata validated in page source.
- Search preview quality reviewed for clarity and relevance.

## Analytics and Observability Criteria

- CTA click events fire with route and intent context.
- Section exposure events fire for key landing modules.
- Server-side request logging supports traceability for landing and auth handoff routes.
- `/healthz` remains operational and unchanged for ops checks.

Acceptance checks:

- Event payloads observed in dev telemetry.
- Health checks pass through direct app and Nginx-routed endpoints.

## Security and Reliability Criteria

- No sensitive user data captured on landing events.
- Headers and HTTPS behavior remain intact behind Nginx.
- Error states present user-safe messaging without stack exposure.

Acceptance checks:

- Security header spot-check against Nginx config.
- Smoke checks for `/`, CTA routes, and `/healthz` after deployment.
