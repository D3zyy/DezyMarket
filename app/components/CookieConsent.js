'use client';

import { useEffect } from 'react';
import Script from 'next/script';
<Script src="//www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js" strategy="lazyOnload" />
const CookieConsent = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.cookieconsent) {
      window.cookieconsent.run({
        notice_banner_type: 'simple',
        consent_type: 'express',
        palette: 'dark',
        language: 'en',
        page_load_consent_levels: ['strictly-necessary'],
        notice_banner_reject_button_hide: false,
        preferences_center_close_button_hide: false,
        page_refresh_confirmation_buttons: false,
      });
    }
  }, []);

  return (
    <>
      <Script
        src="//www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
        strategy="lazyOnload"
      />
      <noscript>
        Free cookie consent management tool by{' '}
        <a href="https://www.termsfeed.com/">TermsFeed</a>
      </noscript>
    </>
  );
};

export default CookieConsent;