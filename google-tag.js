// One Google tag for the public production website. No staff or private-document tracking.
(() => {
  if (!['thelolabooth.com', 'www.thelolabooth.com'].includes(window.location.hostname)) return;
  if (/^\/(?:pay|proposal|proposals|client|sales|finance|system)(?:\/|\.|$)/.test(window.location.pathname)) return;
  if (window.lolaGoogleTagInitialized) return;
  window.lolaGoogleTagInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-CJBCQ9FYL1');
  window.gtag('config', 'AW-18531982704');

  const reported = new Set();
  window.lolaTrackLeadConversion = (result, submissionId) => {
    // The API distinguishes a newly created lead from duplicate/replayed requests.
    if (result?.inquiryStatus !== 'CREATED_LEAD' || !submissionId || reported.has(submissionId)) return;
    try {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18531982704/JcHYCPPztaYdEPC63oRF',
        value: 1.0,
        currency: 'USD',
        transaction_id: submissionId
      });
      reported.add(submissionId);
    } catch { /* Measurement must never block a successful customer submission. */ }
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-CJBCQ9FYL1';
  document.head.appendChild(script);
})();
