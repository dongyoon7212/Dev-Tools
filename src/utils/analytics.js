/**
 * Google Analytics 4 utility
 * - Development: console.log only (no data sent)
 * - Production: sends events to GA4
 */

const isDev = import.meta.env.DEV;
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initGA() {
  if (!GA_ID) return;

  if (isDev) {
    console.log('[Analytics] Initialized (dev mode)', GA_ID);
    return;
  }

  if (window.gtag) {
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
      send_page_view: false, // We'll send page views manually
    });
  }
}

export function trackEvent(eventName, params = {}) {
  if (!GA_ID) return;

  if (isDev) {
    console.log(`[Analytics] Event: ${eventName}`, params);
    return;
  }

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(toolId, toolName) {
  trackEvent('page_view', {
    page_path: `/${toolId}`,
    page_title: toolName,
  });
}
