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

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-CJBCQ9FYL1';
  document.head.appendChild(script);
})();
