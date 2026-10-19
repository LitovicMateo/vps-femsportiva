import Script from "next/script";
import { CONSENT_KEY, GA_ID } from "@/lib/google";

/**
 * Google Analytics 4 with Consent Mode v2. Consent defaults to "denied" (or the
 * stored choice) before gtag.js loads, so no analytics cookies are set until
 * the visitor accepts in the ConsentManager banner.
 */
export default function GoogleScripts() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Plain inline script (like the theme script in the layout) so the
          consent default is set before gtag.js, which loads afterInteractive. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var c='denied';try{if(localStorage.getItem('${CONSENT_KEY}')==='granted')c='granted';}catch(e){}gtag('consent','default',{ad_storage:c,ad_user_data:c,ad_personalization:c,analytics_storage:c,wait_for_update:500});`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
