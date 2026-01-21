import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "My Awesome Blog",
    template: "%s | My Awesome Blog",
  },
  description: "A blog about technology, development, and life",
  keywords: ["blog", "technology", "development", "nextjs", "wordpress"],
  authors: [{ name: "Blog Author" }],
  creator: "My Awesome Blog",
  publisher: "My Awesome Blog",

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
    locale: "en_US",
    url: "/",
    siteName: "My Awesome Blog",
    title: "My Awesome Blog",
    description: "A blog about technology, development, and life",
  },

  twitter: {
    card: "summary_large_image",
    title: "My Awesome Blog",
    description: "A blog about technology, development, and life",
  },

  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
