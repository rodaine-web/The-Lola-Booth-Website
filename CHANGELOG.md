## 1.4.3 — 2026-11-23

- Add requested Google Ads destination AW-18449498922 using the existing single shared tag loader.
- Retain existing Analytics/Ads destinations, conversion labels, production-only guards and private-page exclusions.
- Qualification: staging and production website regression suites.

## 1.4.2 — Google Ads attribution for existing website forms

- Preserve Google click IDs across page navigation and include them in contact and quote-form submissions.
- Keep UTM and click identifiers from one tagged visit together; replace stale attribution on a later tagged visit.
- Store landing and referrer paths without query strings; keep forms usable when browser storage is blocked.
- Preserve the existing Google Analytics/Ads destinations, inquiry behavior, runtime configuration and unpublished Events/Gallery.

## 1.4.1 — Analytics inquiry and experience reporting

- Record GA4 generate_lead only for newly created successful inquiries; retain existing Google Ads conversion behavior and destinations.
- Record allowlisted experience selections without guest contact details or form contents.
- Preserve production-only tracking; staff, staging, previews and private proposal/payment routes remain excluded.
- Qualification: staged implementation, tracking privacy/deduplication tests, and website regression suite.

## 1.4.0 — 2026-11-20

Owner-approved business experience builder: five independently selectable experiences, compatible optional add-ons, Virtual Booth durations and existing quote workflow. Guest benefit panels align within responsive card rows. Internal prices remain private; Celebration booking, production API/configuration, analytics, indexing, and unpublished Events/Gallery are preserved.

Qualified on staging and local desktop/tablet/mobile with real API and CRM fixtures; production smoke checks use read-only requests.

## 1.3.0 — 2026-11-10

Approved redesign from staging: CMS-driven experiences, packages and home sections; prominent Celebrations/Business category; corporate request-a-quote preferences; natural event imagery. Production API, analytics, payment entry, indexing, Events/Gallery publication and existing legal pages preserved.

# V1.2.1 — 8 November 2026

- Restore the staging-qualified experience tab script omitted from the previous website release, so Individual customers can view Glam, 360, Vogue and Audio pricing and matching add-ons.
- Add regression checks for shipped page scripts, all four tab selections and experience deep links.

# V1.2.0 — 6 November 2026

- Separate Individual bookings from Business quote requests. Businesses select corporate event details, experiences and optional add-ons without package tiers or public prices.
- Restore the original Individual package layout, Custom options and Most Popular badge. Business packages page shows experiences/add-ons with Request a Quote links.
- Restore Home on the packages page and keep audience-specific navigation CTAs in order.
- Supply add-on images and improve 360/Vogue image framing in the booking form.
- Selectively promote the staging website qualified with Admin revision 26fde5894263a5f6e44371f1f055895eeed3fd67. Production configuration, analytics, SEO, Events/Gallery publication and unrelated pages are preserved.
- Companion Admin release calculates proposal prices automatically, removes included add-ons, supports optional price edits and manual travel, and discloses applicable tax on taxable products such as prints.

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
