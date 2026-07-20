import { MetadataRoute } from "next";
import {
  fetchPosts,
  fetchCategories,
  fetchAuthors,
  fetchPages,
} from "@/lib/wordpress";
import { getPrimaryCategorySlug } from "@/lib/utils";
import type { WP_REST_API_Post } from "@/types/wordpress";

/**
 * Fetch every published post across all pages (WP caps per_page at 100), so the
 * sitemap is not silently truncated to the first 100 posts.
 */
async function fetchAllPosts(): Promise<WP_REST_API_Post[]> {
  const perPage = 100;
  const first = await fetchPosts({ perPage, page: 1 }).catch(() => ({
    posts: [] as WP_REST_API_Post[],
    total: 0,
    totalPages: 0,
  }));

  const all: WP_REST_API_Post[] = [...(first.posts || [])];
  const totalPages = first.totalPages || 1;

  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPosts({ perPage, page }).catch(() => ({
      posts: [] as WP_REST_API_Post[],
      total: 0,
      totalPages: 0,
    }));
    all.push(...(next.posts || []));
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Fetch all data in parallel
  const [posts, categories, authors, pagesData] = await Promise.all([
    fetchAllPosts(),
    fetchCategories().catch(() => []),
    fetchAuthors().catch(() => []),
    fetchPages().catch(() => ({ pages: [], total: 0, totalPages: 0 })),
  ]);

  const pages = pagesData.pages || [];

  // Homepage
  const home: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Posts — use the real primary category slug (embedded term), matching the
  // /[category]/[slug] route. Previously every URL was /uncategorized/<slug>,
  // which 404s because the category segment must match an embedded term.
  const postUrls: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/${getPrimaryCategorySlug(post)}/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Categories
  const categoryUrls: MetadataRoute.Sitemap = categories.map(
    (category: any) => ({
      url: `${baseUrl}/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  // Authors
  const authorUrls: MetadataRoute.Sitemap = authors.map((author: any) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Authors index
  const authorsIndex: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/authors`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ];

  // Static pages (if any)
  const pageUrls: MetadataRoute.Sitemap = pages.map((page: any) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.modified || page.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...home,
    ...postUrls,
    ...categoryUrls,
    ...authorUrls,
    ...authorsIndex,
    ...pageUrls,
  ];
}
