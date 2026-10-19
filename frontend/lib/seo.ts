import { SITE_NAME } from "@/lib/site";

const DEFAULT_SITE_URL = "http://localhost:3000";

/** Public site origin without a trailing slash. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(
    /\/+$/,
    "",
  );
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Only the real production host should be indexed. Local and staging builds
 * (localhost / "staging" in the URL) get `noindex` metadata and a disallow-all
 * robots.txt so they can never end up in a search index.
 */
export function isIndexable(): boolean {
  return !/localhost|127\.0\.0\.1|staging/i.test(getSiteUrl());
}

/** Static brand assets in /public (see scripts/generate-brand-assets.mjs). */
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const PUBLISHER_LOGO = "/logo-square.png";

/** Path with `?page=N` appended for pages after the first. */
export function paginatedPath(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}

/** Trim to `max` characters on a word boundary, adding an ellipsis when cut. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

interface OgImageOptions {
  title: string;
  type?: "default" | "post" | "category" | "author";
  subtitle?: string;
  category?: string;
  author?: string;
  siteName?: string;
}

/** Relative URL of the dynamic OG image route. */
export function ogImageUrl({
  title,
  type = "default",
  subtitle,
  category,
  author,
  siteName = SITE_NAME,
}: OgImageOptions): string {
  const params = new URLSearchParams({ title, type, siteName });
  if (subtitle) params.set("subtitle", subtitle);
  if (category) params.set("category", category);
  if (author) params.set("author", author);
  return `/api/og?${params.toString()}`;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Site-wide Organization + WebSite graph (rendered once in the root layout). */
export function siteJsonLd(name: string, description: string) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name,
        url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(PUBLISHER_LOGO),
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name,
        description,
        inLanguage: "hr",
        publisher: { "@id": `${url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
