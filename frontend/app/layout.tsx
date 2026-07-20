import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import ClientProviders from "@/components/seo/ClientProviders";
import { fetchSiteSettingsAPI } from "@/lib/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettingsAPI();
  const siteTitle = settings.siteTitle || "FEM Sportiva";
  const siteDescription =
    settings.siteDescription || "Blog o sportu i životnom stilu";

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: [
      "blog",
      "sport",
      "femsportiva",
      ...(settings.siteKeywords || []),
    ],
    authors: [{ name: siteTitle }],
    creator: siteTitle,
    publisher: siteTitle,

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "hr_HR",
      url: "/",
      siteName: siteTitle,
      title: siteTitle,
      description: siteDescription,
    },

    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
    },

    alternates: {
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <HeaderWrapper />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
