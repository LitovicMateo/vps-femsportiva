// Google integrations (Search Console, Analytics, AdSense). Everything is
// opt-in via env vars; with none set the site loads no Google code at all.
// NEXT_PUBLIC_* values are inlined at build time (see Dockerfile build args).

/** Search Console HTML-tag verification token (content of the meta tag). */
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";

/** GA4 measurement ID, e.g. "G-XXXXXXXXXX". */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** AdSense publisher ID, e.g. "ca-pub-1234567890123456". */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

export const CONSENT_KEY = "femsportiva-consent";
export const CONSENT_EVENT = "femsportiva:open-consent";
export const hasConsentFeatures = Boolean(GA_ID || ADSENSE_CLIENT);
