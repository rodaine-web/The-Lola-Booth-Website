> Historical pre-release notes. These fixes were deployed before production v1.0.0. See CHANGELOG.md and RELEASING.md for current release status.

# Website readiness fixes — pending production approval

## Completed in staging code

- Moved Brands & Partners below Experiences and before the camera-roll feature.
- Preserved all selected experiences and the budget in the API-supported inquiry notes; guest count now uses `guestCount` and each form sends `form_id`.
- Preserved filled honeypots for API rejection; handled validation responses using HTTP 400 or 422.
- Reduced the message input limit to 2,500 characters to reserve room for inquiry details within the API's 3,000-character limit.
- Added WebP delivery copies while retaining originals. 360: 2,211,889 → 169,806 bytes; Vogue: 1,936,175 → 127,042 bytes. Header logo: 363,762 → 31,798 bytes; footer logo: 363,408 → 29,138 bytes.
- Added a bounded image-delivery function for the current CMS media ID, so CMS replacements continue to choose the image. Missing images do not switch to unrelated hardcoded content.
- Improved Male Studios contrast and limited smaller logo display sizes to avoid unnecessary enlargement.
- Removed CMS implementation text from inquiry forms and added a main heading to Connect.

## Verification

- 13 unit tests passed (inquiry serialization, preservation, media resizing, isolation and failure handling).
- 30 browser page views passed (10 pages at 1440, 820 and 390px); no broken images or horizontal overflow in the local staging fixtures.
- Six browser inquiry tests (two forms at three widths) passed the actual API validation schema, retaining guest count, all selections, budget, and form identity.
- Optimized CMS images decoded successfully through the real transformation function with local source fixtures.
- No production network requests or real messages were sent by those browser tests.

## Still required

The repository does not yet have a hosted staging CMS/API/database. Default staging config continues to disable API access and submissions. Tests used local fixtures, not a deployed staging backend.

Configure and verify the hosted image route and its isolated origin before promoting it. Production promotion requires explicit owner approval, production-only runtime/server environment configuration, fresh live image-transfer checks, and a controlled real inquiry/acknowledgement test. No claim of full production certification is made by this checkpoint.
