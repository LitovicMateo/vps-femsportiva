import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import ClientProviders from "@/components/seo/ClientProviders";
import StructuredData from "@/components/seo/StructuredData";
import GoogleScripts from "@/components/seo/GoogleScripts";
import ConsentManager from "@/components/seo/ConsentManager";
import { fetchSiteSettingsAPI } from "@/lib/api";
import { ADSENSE_CLIENT, GSC_VERIFICATION } from "@/lib/google";
import {
  DEFAULT_OG_IMAGE,
  getSiteUrl,
  isIndexable,
  siteJsonLd,
} from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME } from "@/lib/site";

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettingsAPI();
  const siteTitle = settings.siteTitle || SITE_NAME;
  const siteDescription = settings.siteDescription || SITE_DESCRIPTION;
  const indexable = isIndexable();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: [...SITE_KEYWORDS, ...(settings.siteKeywords || [])],
    authors: [{ name: siteTitle }],
    creator: siteTitle,
    publisher: siteTitle,
    applicationName: siteTitle,

    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: false },

    openGraph: {
      type: "website",
      locale: "hr_HR",
      url: "/",
      siteName: siteTitle,
      title: siteTitle,
      description: siteDescription,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },

    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [DEFAULT_OG_IMAGE],
    },

    alternates: {
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },

    verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
    other: ADSENSE_CLIENT ? { "google-adsense-account": ADSENSE_CLIENT } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSiteSettingsAPI();

  return (
    <html lang="hr" suppressHydrationWarning>
      <head>
        {/* Set data-theme before paint so dark-mode users don't see a
            light→dark flash (FOUC). ThemeContext syncs React state after mount. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
      </head>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
      >
        <StructuredData
          data={siteJsonLd(
            settings.siteTitle || SITE_NAME,
            settings.siteDescription || SITE_DESCRIPTION,
          )}
        />
        <GoogleScripts />
        <ClientProviders>
          <HeaderWrapper />
          {children}
          <Footer />
          <ConsentManager />
        </ClientProviders>
      </body>
    </html>
  );
}
