// Admin Settings Types

export interface SiteSettings {
  // General Settings
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;

  // Feature Toggles
  features: {
    authorsPage: boolean;
    comments: boolean;
    search: boolean;
    tags: boolean;
    categories: boolean;
    relatedPosts: boolean;
    newsletter: boolean;
    darkMode: boolean;
  };

  // Layout Settings
  layout: {
    postsPerPage: number;
    showSidebar: boolean;
    sidebarPosition: "left" | "right";
    footerColumns: number;
    headerStyle: "minimal" | "standard" | "expanded";
  };

  // Homepage Settings
  homepage: {
    showHero: boolean;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    showFeaturedPosts: boolean;
    featuredPostsCount: number;
    showTicker: boolean;
    tickerText: string;
    tickerLink: string;
  };

  // Navigation
  navigation: {
    headerLinks: NavigationLink[];
    footerLinks: NavigationLink[];
    socialLinks: SocialLink[];
  };

  // SEO Settings
  seo: {
    // Meta Tags
    siteTitle: string;
    siteTitleTemplate: string; // e.g., "%s | My Blog"
    defaultMetaDescription: string;
    siteKeywords: string[];

    // OpenGraph
    ogImage: string;
    ogType: string;
    ogLocale: string;

    // Twitter
    twitterHandle: string;
    twitterCardType: "summary" | "summary_large_image" | "app" | "player";
    twitterSite: string;
    twitterCreator: string;

    // Search Engine Verification
    googleSiteVerification: string;
    bingSiteVerification: string;
    yandexVerification: string;

    // Robots & Indexing
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
    noindex: boolean;
    nofollow: boolean;

    // RSS Feed
    enableRssFeed: boolean;
    rssTitle: string;
    rssDescription: string;
    rssItemCount: number;

    // Structured Data
    enableStructuredData: boolean;
    organizationName: string;
    organizationLogo: string;

    // Canonical URLs
    enableCanonical: boolean;
    canonicalBaseUrl: string;
  };

  // Advanced
  advanced: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    googleAnalyticsId: string;
    customCSS: string;
    customJS: string;
  };
}

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  external: boolean;
  order: number;
}

export interface SocialLink {
  id: string;
  platform:
    | "twitter"
    | "facebook"
    | "instagram"
    | "linkedin"
    | "github"
    | "youtube";
  url: string;
  enabled: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "My Awesome Blog",
  siteTagline: "Thoughts, stories and ideas",
  siteDescription: "A blog about technology, development, and life",
  siteUrl: "http://localhost:8080",
  contactEmail: "admin@example.com",

  features: {
    authorsPage: true,
    comments: true,
    search: true,
    tags: true,
    categories: true,
    relatedPosts: true,
    newsletter: false,
    darkMode: false,
  },

  layout: {
    postsPerPage: 10,
    showSidebar: true,
    sidebarPosition: "right",
    footerColumns: 3,
    headerStyle: "standard",
  },

  homepage: {
    showHero: true,
    heroTitle: "Welcome to My Blog",
    heroSubtitle: "Discover amazing content",
    heroImage: "",
    showFeaturedPosts: true,
    featuredPostsCount: 6,
    showTicker: false,
    tickerText: "",
    tickerLink: "",
  },

  navigation: {
    headerLinks: [
      { id: "1", label: "Home", href: "/", external: false, order: 1 },
      { id: "2", label: "Blog", href: "/blog", external: false, order: 2 },
      {
        id: "3",
        label: "Authors",
        href: "/authors",
        external: false,
        order: 3,
      },
      { id: "4", label: "About", href: "/about", external: false, order: 4 },
    ],
    footerLinks: [
      {
        id: "1",
        label: "Privacy Policy",
        href: "/privacy",
        external: false,
        order: 1,
      },
      {
        id: "2",
        label: "Terms of Service",
        href: "/terms",
        external: false,
        order: 2,
      },
      {
        id: "3",
        label: "Contact",
        href: "/contact",
        external: false,
        order: 3,
      },
    ],
    socialLinks: [
      { id: "1", platform: "twitter", url: "", enabled: false },
      { id: "2", platform: "facebook", url: "", enabled: false },
      { id: "3", platform: "instagram", url: "", enabled: false },
      { id: "4", platform: "linkedin", url: "", enabled: false },
      { id: "5", platform: "github", url: "", enabled: false },
      { id: "6", platform: "youtube", url: "", enabled: false },
    ],
  },

  seo: {
    // Meta Tags
    siteTitle: "My Awesome Blog",
    siteTitleTemplate: "%s | My Awesome Blog",
    defaultMetaDescription: "A blog about technology, development, and life",
    siteKeywords: ["blog", "technology", "development", "nextjs", "wordpress"],

    // OpenGraph
    ogImage: "",
    ogType: "website",
    ogLocale: "en_US",

    // Twitter
    twitterHandle: "@myblog",
    twitterCardType: "summary_large_image",
    twitterSite: "@myblog",
    twitterCreator: "@myblog",

    // Search Engine Verification
    googleSiteVerification: "",
    bingSiteVerification: "",
    yandexVerification: "",

    // Robots & Indexing
    enableSitemap: true,
    enableRobotsTxt: true,
    noindex: false,
    nofollow: false,

    // RSS Feed
    enableRssFeed: true,
    rssTitle: "My Awesome Blog RSS Feed",
    rssDescription: "Latest posts from My Awesome Blog",
    rssItemCount: 20,

    // Structured Data
    enableStructuredData: true,
    organizationName: "My Awesome Blog",
    organizationLogo: "",

    // Canonical URLs
    enableCanonical: true,
    canonicalBaseUrl: "http://localhost:8080",
  },

  advanced: {
    maintenanceMode: false,
    maintenanceMessage:
      "We are currently performing maintenance. Please check back soon.",
    googleAnalyticsId: "",
    customCSS: "",
    customJS: "",
  },
};
