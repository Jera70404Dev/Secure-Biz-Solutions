/* Public configuration only. Never put account passwords or API secrets here.
 * Paths are relative to the site root. Re-export after changing shared content. */
(function (g) {
  'use strict';
  g.SBS_CONFIG = {
    origin: 'https://securebizsolutions.com',
    production: false,
    clientApprovedStaticDelivery: false,
    phone: { display: '[PHONE]', number: '' },
    logos: { color: '', white: '' },
    calendars: { advisor: '', freshStart: '' },
    forms: { funding: '263016439712051', merchant: '263016995963066', contact: '263016974141051', upload: '263017177786062' },
    analytics: { enabled: false, ga4: '', metaPixel: '' },
    videos: {
      home: { src: '', poster: '', captions: '', title: 'See how Secure Biz works in 90 seconds' },
      owner: { src: '', poster: '', captions: '', title: 'Hear it from our founder' },
      funding: { src: '', poster: '', captions: '', title: 'Which funding option fits you?' }
    },
    /* Insert only approved assets. Each entry: { src, small, alt, approved: true }.
     * See docs/image-candidates.html for the separate approval catalog. */
    images: {},
    storyLogos: {},
    legal: { privacy: { updated: '', sections: [] }, terms: { updated: '', sections: [] }, smsApproved: false },
    heloc: { credit: 620, dti: 43, cltv: 85, retainedEquity: 15, maximum: 400000, days: 5 },
    amounts: ['Under $50K', '$50K–$250K', '$250K–$1M', '$1M+']
  };
})(globalThis);

Object.assign(globalThis.SBS_CONFIG,{"origin":"https://jera70404dev.github.io/Secure-Biz-Solutions","basePath":"/Secure-Biz-Solutions"});
