# V1.1.0 — 11 October 2026

## Agreement-first payment compatibility — 2026-10-20

- Preserve the existing payment-page design while redirecting unsigned bookings to their issued agreement.
- Use API-calculated first-payment, installment, balance-deadline and paid-in-full options.
- Port the exact payment viewer qualified on the isolated staging website with Admin commit a75111104f9913da73dd0b9043e17196938ed867; retain production runtime configuration and all other website pages.
- Validation: all 17 website tests pass, including four new payment-entry behavior tests.


- Release approved one-page multi-experience inquiry, owner photos and illustrative add-ons.
- Load production catalog packages and eligible add-ons.
- Preserve production CMS, API, payment, indexing and domains; initial proposals require Admin review.
- Release with qualified Admin V1.1 lifecycle; no new backend migrations.

# Changelog

## 1.0.0 — 2026-09-24

Approved website V1 baseline, based on production commit 90e5ed3 and corresponding staging commit ced3329.

- Brands & Partners appears directly before testimonials, with fitted, legible partner logos.
- Optimized static image delivery and CMS image route.
- Inquiry data, validation and spam-field fixes.
- Favicon installed; Events and Gallery remain unpublished.
- Live desktop/mobile checks passed for the final section placement. Earlier release verification covered 30 desktop/tablet/mobile page views, image loading, forms and pricing.

This release versions the public website only. It does not certify completion of the Admin portal or full CMS migration. Payments remain deferred. Email rendering fixes were separately deployed in the Admin/API repository at 8b37d49.
