# SEO Strategy & Implementation Plan

## Overview

Comprehensive SEO strategy for Next.js + WordPress headless blog to maximize search engine visibility, social media sharing, and discoverability.

---

## Table of Contents

1. [Next.js Metadata API](#nextjs-metadata-api)
2. [Page-by-Page SEO Strategy](#page-by-page-seo-strategy)
3. [OpenGraph & Social Media](#opengraph--social-media)
4. [Structured Data (Schema.org)](#structured-data-schemaorg)
5. [Technical SEO](#technical-seo)
6. [Admin Settings Integration](#admin-settings-integration)
7. [Performance Optimization](#performance-optimization)
8. [Implementation Checklist](#implementation-checklist)

---

## Next.js Metadata API

Next.js 13+ App Router provides powerful metadata generation through:

- `metadata` object (static)
- `generateMetadata` function (dynamic)
- `opengraph-image.tsx` and `twitter-image.tsx` for social cards

### Global Metadata Template

Location: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: "Site Name - Tagline",
    template: "%s | Site Name", // Page Title | Site Name
  },
  description: "Default site description",
  keywords: ["keyword1", "keyword2", "keyword3"],
  authors: [{ name: "Author Name", url: "https://yourdomain.com" }],
  creator: "Your Name",
  publisher: "Site Name",

  // Robots
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

  // Verification
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    bing: "bing-verification-code",
  },

  // Alternate languages (if multilingual)
  alternates: {
    canonical: "https://yourdomain.com",
  },
};
```

---

## Page-by-Page SEO Strategy

### 1. Homepage (`app/page.tsx`)

**Purpose:** Main landing page, latest posts, site introduction

**Metadata Strategy:**

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchSiteSettingsAPI();
  const adminSettings = await fetchAdminSettings(); // Custom settings

  return {
    title: adminSettings.homepage.seoTitle || siteSettings.name,
    description:
      adminSettings.homepage.seoDescription || siteSettings.description,
    keywords: adminSettings.homepage.seoKeywords || [],

    openGraph: {
      title: adminSettings.homepage.ogTitle || siteSettings.name,
      description:
        adminSettings.homepage.ogDescription || siteSettings.description,
      url: "https://yourdomain.com",
      siteName: siteSettings.name,
      images: [
        {
          url: adminSettings.homepage.ogImage || "/og-default.jpg",
          width: 1200,
          height: 630,
          alt: siteSettings.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: adminSettings.homepage.twitterTitle || siteSettings.name,
      description:
        adminSettings.homepage.twitterDescription || siteSettings.description,
      images: [adminSettings.homepage.twitterImage || "/twitter-default.jpg"],
      creator: adminSettings.seo.twitterHandle || "@yourusername",
    },

    alternates: {
      canonical: "https://yourdomain.com",
      types: {
        "application/rss+xml": [{ url: "/feed.xml", title: "RSS Feed" }],
      },
    },
  };
}
```

**Structured Data (JSON-LD):**

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: siteSettings.name,
  description: siteSettings.description,
  url: "https://yourdomain.com",
  publisher: {
    "@type": "Organization",
    name: siteSettings.name,
    logo: {
      "@type": "ImageObject",
      url: "https://yourdomain.com/logo.png",
    },
  },
};
```

**SEO Elements:**

- ✅ Dynamic title from admin settings
- ✅ Meta description (155-160 characters)
- ✅ Keywords (5-10 relevant keywords)
- ✅ OpenGraph tags for social sharing
- ✅ Twitter Card metadata
- ✅ Canonical URL
- ✅ RSS feed link
- ✅ Blog structured data

---

### 2. Blog Post Detail (`app/[category]/[slug]/page.tsx`)

**Purpose:** Individual blog post content

**Metadata Strategy:**

```typescript
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await fetchPostBySlugAPI(params.slug);

  if (!post) return {};

  const author = post._embedded?.author?.[0];
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const tags = post._embedded?.["wp:term"]?.[1] || [];

  // Extract plain text from WordPress excerpt
  const plainExcerpt = post.excerpt.rendered
    .replace(/<[^>]*>/g, "")
    .trim()
    .substring(0, 160);

  // Extract keywords from tags and categories
  const keywords = [
    ...categories.map((cat) => cat.name),
    ...tags.map((tag) => tag.name),
  ];

  return {
    title: post.title.rendered,
    description: post.yoast_head_json?.og_description || plainExcerpt,
    keywords: keywords,

    authors: author ? [{ name: author.name, url: author.url }] : [],

    openGraph: {
      title: post.yoast_head_json?.og_title || post.title.rendered,
      description: post.yoast_head_json?.og_description || plainExcerpt,
      url: `https://yourdomain.com/${params.category}/${params.slug}`,
      siteName: "Site Name",
      images: featuredImage
        ? [
            {
              url: featuredImage.source_url,
              width: featuredImage.media_details?.width || 1200,
              height: featuredImage.media_details?.height || 630,
              alt: featuredImage.alt_text || post.title.rendered,
            },
          ]
        : [],
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: author ? [author.name] : [],
      tags: tags.map((tag) => tag.name),
    },

    twitter: {
      card: "summary_large_image",
      title: post.yoast_head_json?.twitter_title || post.title.rendered,
      description: post.yoast_head_json?.twitter_description || plainExcerpt,
      images: featuredImage ? [featuredImage.source_url] : [],
    },

    alternates: {
      canonical: `https://yourdomain.com/${params.category}/${params.slug}`,
    },
  };
}
```

**Structured Data (Article):**

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title.rendered,
  description: plainExcerpt,
  image: featuredImage?.source_url,
  datePublished: post.date,
  dateModified: post.modified,
  author: {
    "@type": "Person",
    name: author?.name,
    url: author?.url,
  },
  publisher: {
    "@type": "Organization",
    name: "Site Name",
    logo: {
      "@type": "ImageObject",
      url: "https://yourdomain.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://yourdomain.com/${params.category}/${params.slug}`,
  },
  keywords: keywords.join(", "),
};
```

**SEO Elements:**

- ✅ Post title as page title
- ✅ Excerpt or Yoast description
- ✅ Featured image for OG/Twitter
- ✅ Author information
- ✅ Published/modified dates
- ✅ Category and tag keywords
- ✅ Article structured data
- ✅ Breadcrumb navigation
- ✅ Read time estimate
- ✅ Word count

---

### 3. Category Pages (`app/[category]/page.tsx`)

**Metadata Strategy:**

```typescript
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const data = await fetchPostsByCategoryAPI(params.category);
  const category = data.category;

  if (!category) return {};

  const title = `${category.name} Articles`;
  const description =
    category.description ||
    `Browse all articles in ${category.name}. ${data.pagination?.total} posts available.`;

  return {
    title: title,
    description: description,
    keywords: [category.name, "articles", "blog", "posts"],

    openGraph: {
      title: title,
      description: description,
      url: `https://yourdomain.com/${params.category}`,
      type: "website",
    },

    twitter: {
      card: "summary",
      title: title,
      description: description,
    },

    alternates: {
      canonical: `https://yourdomain.com/${params.category}`,
    },
  };
}
```

**Structured Data (CollectionPage):**

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${category.name} Articles`,
  description: category.description,
  url: `https://yourdomain.com/${params.category}`,
  numberOfItems: data.pagination?.total,
};
```

**SEO Elements:**

- ✅ Category name in title
- ✅ Category description
- ✅ Post count
- ✅ Pagination with rel="prev" and rel="next"
- ✅ Canonical URL for page 1
- ✅ CollectionPage structured data

---

### 4. Author Pages (`app/authors/[author]/page.tsx`)

**Metadata Strategy:**

```typescript
export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const data = await fetchPostsByAuthorAPI(params.author);
  const author = data.author;

  if (!author) return {};

  const title = `${author.name} - Author`;
  const description =
    author.description ||
    `Read articles by ${author.name}. ${data.pagination?.total} posts published.`;

  return {
    title: title,
    description: description,
    keywords: [author.name, "author", "writer", "articles"],

    openGraph: {
      title: title,
      description: description,
      url: `https://yourdomain.com/authors/${params.author}`,
      images: author.avatar_urls?.["96"]
        ? [
            {
              url: author.avatar_urls["96"],
              width: 96,
              height: 96,
              alt: author.name,
            },
          ]
        : [],
      type: "profile",
    },

    twitter: {
      card: "summary",
      title: title,
      description: description,
    },

    alternates: {
      canonical: `https://yourdomain.com/authors/${params.author}`,
    },
  };
}
```

**Structured Data (ProfilePage):**

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: author.name,
    description: author.description,
    url: author.url,
    image: author.avatar_urls?.["96"],
  },
};
```

---

### 5. Authors List Page (`app/authors/page.tsx`)

**SEO Elements:**

- ✅ List of all authors
- ✅ "Meet Our Writers" title
- ✅ ItemList structured data
- ✅ Author cards with links

---

### 6. Search Results (`app/search/page.tsx` - to be created)

**Metadata:**

```typescript
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const query = searchParams.q || "";

  return {
    title: `Search Results for "${query}"`,
    description: `Search results for ${query} on Site Name`,
    robots: {
      index: false, // Don't index search results
      follow: true,
    },
  };
}
```

---

## OpenGraph & Social Media

### Default OG Image Generation

Create: `app/opengraph-image.tsx`

```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Site Name';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <h1 style={{ fontSize: 72, fontWeight: 'bold' }}>Site Name</h1>
        <p style={{ fontSize: 36 }}>Your Blog Tagline</p>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### Dynamic Post OG Images

Create: `app/[category]/[slug]/opengraph-image.tsx`

```typescript
import { ImageResponse } from 'next/og';
import { fetchPostBySlugAPI } from '@/lib/api';

export const runtime = 'edge';
export const alt = 'Blog Post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlugAPI(params.slug);

  if (!post) {
    return new ImageResponse(<div>Not Found</div>);
  }

  const title = post.title.rendered.replace(/<[^>]*>/g, '');
  const author = post._embedded?.author?.[0]?.name || 'Author';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
          {title}
        </h1>
        <p style={{ fontSize: 28 }}>By {author}</p>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## Structured Data (Schema.org)

### Implementation

Create: `components/StructuredData.tsx`

```typescript
export default function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Usage in Pages

```typescript
import StructuredData from '@/components/StructuredData';

// In page component:
<StructuredData data={jsonLd} />
```

### Schema Types by Page

| Page Type    | Schema.org Type            |
| ------------ | -------------------------- |
| Homepage     | `Blog` or `WebSite`        |
| Blog Post    | `BlogPosting` or `Article` |
| Category     | `CollectionPage`           |
| Author       | `ProfilePage` + `Person`   |
| Authors List | `ItemList`                 |
| Search       | `SearchResultsPage`        |

---

## Technical SEO

### 1. Sitemap.xml

Create: `app/sitemap.ts`

```typescript
import { MetadataRoute } from "next";
import { fetchPostsAPI, fetchCategoriesAPI, fetchAuthorsAPI } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://yourdomain.com";

  // Fetch all posts
  const postsData = await fetchPostsAPI({ perPage: 100 });
  const posts = postsData.posts || [];

  // Fetch all categories
  const categories = await fetchCategoriesAPI();

  // Fetch all authors
  const authors = await fetchAuthorsAPI();

  // Homepage
  const homepage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  };

  // Posts
  const postUrls = posts.map((post) => {
    const category = post._embedded?.["wp:term"]?.[0]?.[0];
    return {
      url: `${baseUrl}/${category?.slug || "uncategorized"}/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // Categories
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Authors
  const authorUrls = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [homepage, ...postUrls, ...categoryUrls, authorUrls];
}
```

### 2. robots.txt

Create: `app/robots.ts`

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://yourdomain.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/wp-admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### 3. RSS Feed

Create: `app/feed.xml/route.ts`

```typescript
import { fetchPostsAPI } from "@/lib/api";

export async function GET() {
  const postsData = await fetchPostsAPI({ perPage: 20 });
  const posts = postsData.posts || [];

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Site Name</title>
    <link>https://yourdomain.com</link>
    <description>Site Description</description>
    <language>en-us</language>
    <atom:link href="https://yourdomain.com/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post) => {
        const category = post._embedded?.["wp:term"]?.[0]?.[0];
        const url = `https://yourdomain.com/${category?.slug || "uncategorized"}/${post.slug}`;

        return `
    <item>
      <title>${post.title.rendered}</title>
      <link>${url}</link>
      <description>${post.excerpt.rendered}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${url}</guid>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
```

### 4. Canonical URLs

Every page should have a canonical URL to prevent duplicate content issues:

```typescript
alternates: {
  canonical: 'https://yourdomain.com/canonical-path',
}
```

### 5. Pagination SEO

For paginated pages (categories, authors):

```typescript
// Page 2+
alternates: {
  canonical: `https://yourdomain.com/category?page=${currentPage}`,
}

// Add prev/next links
const prevPage = currentPage > 1 ? currentPage - 1 : null;
const nextPage = currentPage < totalPages ? currentPage + 1 : null;

// These should be in <head> via Next.js metadata API
```

---

## Admin Settings Integration

### Expand Site Settings Types

Add to `types/settings.ts`:

```typescript
export interface SiteSettings {
  // ... existing settings ...

  seo: {
    // Global SEO
    defaultMetaDescription: string;
    defaultKeywords: string[];
    ogImage: string;
    twitterImage: string;
    twitterHandle: string;
    googleSiteVerification: string;
    bingSiteVerification: string;
    googleAnalyticsId: string;

    // Homepage SEO
    homepage: {
      seoTitle: string;
      seoDescription: string;
      seoKeywords: string[];
      ogTitle: string;
      ogDescription: string;
      ogImage: string;
      twitterTitle: string;
      twitterDescription: string;
      twitterImage: string;
    };

    // Sitemap Settings
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
    sitemapUpdateFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly";

    // RSS Settings
    enableRssFeed: boolean;
    rssFeedLimit: number;

    // Social Profiles
    socialProfiles: {
      facebook: string;
      twitter: string;
      instagram: string;
      linkedin: string;
      github: string;
      youtube: string;
    };
  };
}
```

### Admin SEO Settings Page

Create: `app/admin/seo/page.tsx`

Sections:

1. **Global SEO** - Default title, description, keywords
2. **Homepage SEO** - Custom homepage metadata
3. **Social Media** - OG images, Twitter cards
4. **Verification** - Google, Bing verification codes
5. **Analytics** - Google Analytics, other tracking
6. **Sitemap & RSS** - Enable/disable, update frequency
7. **Social Profiles** - All social media URLs

---

## Performance Optimization

### 1. Image Optimization

Use Next.js Image component everywhere:

```typescript
import Image from 'next/image';

<Image
  src={featuredImage}
  alt={post.title.rendered}
  width={1200}
  height={630}
  priority={isFeatured}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 2. Web Vitals Tracking

Create: `app/web-vitals.ts`

```typescript
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    if (window.gtag) {
      window.gtag("event", metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

### 3. Font Optimization

Use Next.js font optimization in `layout.tsx`:

```typescript
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
```

---

## Implementation Checklist

### Phase 1: Metadata & OG Images

- [ ] Add `generateMetadata` to all pages
- [ ] Create default `opengraph-image.tsx`
- [ ] Create dynamic post `opengraph-image.tsx`
- [ ] Add Twitter card metadata
- [ ] Set up canonical URLs

### Phase 2: Structured Data

- [ ] Create `StructuredData` component
- [ ] Add Blog schema to homepage
- [ ] Add Article schema to posts
- [ ] Add ProfilePage schema to authors
- [ ] Add CollectionPage schema to categories

### Phase 3: Technical SEO

- [ ] Implement `sitemap.ts`
- [ ] Implement `robots.ts`
- [ ] Create RSS feed route
- [ ] Add breadcrumbs to all pages
- [ ] Implement pagination SEO

### Phase 4: Admin Integration

- [ ] Expand settings types with SEO fields
- [ ] Create `/admin/seo` page
- [ ] Connect settings to page metadata
- [ ] Add OG image upload functionality
- [ ] Add verification codes management

### Phase 5: Performance

- [ ] Convert all images to Next.js Image
- [ ] Optimize font loading
- [ ] Set up Web Vitals tracking
- [ ] Add loading states
- [ ] Optimize bundle size

### Phase 6: Analytics & Monitoring

- [ ] Google Analytics integration
- [ ] Google Search Console setup
- [ ] Bing Webmaster Tools
- [ ] Set up error tracking (Sentry)
- [ ] Monitor Core Web Vitals

---

## SEO Best Practices Summary

### Content

- ✅ Unique title tags (50-60 characters)
- ✅ Compelling meta descriptions (150-160 characters)
- ✅ H1 tag on every page (one per page)
- ✅ Proper heading hierarchy (H1 → H2 → H3)
- ✅ Alt text for all images
- ✅ Internal linking strategy
- ✅ Readable URLs (slug-based)

### Technical

- ✅ Mobile-responsive design
- ✅ Fast loading times (< 3s)
- ✅ HTTPS enabled
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Structured data markup
- ✅ Clean URL structure

### Social

- ✅ OpenGraph tags
- ✅ Twitter Card tags
- ✅ Custom OG images (1200x630)
- ✅ Social media profiles linked

### Monitoring

- ✅ Google Analytics
- ✅ Google Search Console
- ✅ Core Web Vitals tracking
- ✅ Regular SEO audits

---

**Last Updated:** January 18, 2026
