# LOLA External Website — Admin Integrated

This package preserves the existing HTML/CSS/JS website design and connects it to the LOLA Admin public API.

## Local use
1. Use the production LOLA API origin configured in `config.js`. It is temporarily set to the working Railway origin until `https://api.thelolabooth.com` is live.
2. Ensure the static site origin is listed in `PUBLIC_INQUIRY_ALLOWED_ORIGINS`.
3. Serve this folder through a local HTTP server (do not open only as `file://` for form testing).
4. `config.js` exposes only the public API origin through `window.LOLA_API_BASE` and `window.LOLA_CONFIG.apiBase`.

## Production
Current API base: `https://the-lola-booth-admin-production.up.railway.app`.
After the Railway custom API domain is configured, update `config.js` to `https://api.thelolabooth.com`.
Also set the website origin in backend `PUBLIC_INQUIRY_ALLOWED_ORIGINS`.

## Dynamic CMS integration
The site reads `/api/public/site` and updates hero copy/slides (when real published slides exist), packages, experiences, event types, gallery, testimonials, FAQs, contact settings and form selections. Static content remains as fallback whenever the CMS section has no published data or the API is unavailable.

## Inquiry forms
`availability.html` and `contact.html` POST to `/api/public/inquiries`. They capture UTM parameters, landing page and referrer, use the honeypot field required by the backend, and map package/experience selection to real backend UUIDs.

## Logo
The public header uses the approved vertical `LOLA_Primary_Dark_Transparent.png`. The dark footer uses `LOLA_Primary_Light_Transparent.png`.
