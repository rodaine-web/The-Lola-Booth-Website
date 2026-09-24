# Website release policy

## Versions and repositories

- Production: `rodaine-web/The-Lola-Booth-Website`, `main`, https://thelolabooth.com.
- Production V1 is semantic version **1.0.0**, identified by immutable annotated tag `v1.0.0` and its GitHub Release.
- Staging: `rodaine-web/staging`, `main`, version **1.1.0-dev.0** until release preparation.
- The staging tag `prod-v1.0.0-baseline` marks the corresponding staging snapshot. Its configuration deliberately differs from production.
- `package.json`, the root package entry in `package-lock.json`, and `VERSION` must agree.

## Development boundary

All subsequent website implementation, CMS work, fixes, and experiments happen in staging on `codex/` branches merged through staging pull requests. Never edit production CMS records as a substitute for staging development. Staging currently has a repository and local preview; isolated hosted API/database/storage/worker and protected website hosting still need to be provisioned before CMS integration testing. Keep production data, payment execution, and real customer email delivery out of staging.

Production main is a release-only branch. A pull request is required; force-pushes and branch deletion are disabled. GitHub rules do not capture conversational approval: explicit owner approval remains mandatory before a production promotion, merge, deployment, hotfix, or CMS content change. This applies to agents and humans. Never retag an existing release.

## Promote v1.1.0

1. Complete and verify changes in staging; update its changelog and readiness evidence.
2. Prepare a release branch in the production repository from current production main. Selectively port the approved code/content commits from staging; do not merge the staging repository wholesale.
3. Preserve production runtime configuration, analytics, indexing, domain, API origin, and form settings. Never promote staging banners, noindex directives, disabled forms, or isolated service endpoints. Keep Events/Gallery unpublished unless separately approved.
4. Set VERSION and both package version fields to 1.1.0. Document the exact changes and validation in CHANGELOG.md. Open a production pull request and provide the reviewable diff and staging evidence to the owner.
5. Obtain explicit owner approval for that release. Only then merge; main triggers Vercel production deployment.
6. Verify the deployed commit, live pages, responsive layout, media, relevant form behavior, and any affected CMS lifecycle. Only after passing, create annotated tag v1.1.0 and a GitHub Release with evidence and known limits.
7. Record the production release in staging and advance its development version for the next approved milestone.

## Rollback

With explicit owner approval, use the hosting provider's rollback to a previously verified production deployment, or revert the faulty release through a pull request and publish a new patch version. Retain historical tags and release notes; never rewrite production history. Rolling back website code does not roll back backend/database changes.
