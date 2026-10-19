import { MetadataRoute } from "next";
import { fetchPosts, fetchCategories, fetchTags } from "@/lib/wordpress";
import { getPrimaryCategorySlug } from "@/lib/utils";
import { getSiteUrl } from "@/lib/seo";
import type { WP_REST_API_Post } from "@/types/wordpress";

export const revalidate = 3600;

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
  const baseUrl = getSiteUrl();

  const [posts, categories, tags] = await Promise.all([
    fetchAllPosts(),
    fetchCategories().catch(() => []),
    fetchTags().catch(() => []),
  ]);

  // Archive `lastModified` = most recent post change in that archive, so the
  // value only moves when content does (a fresh `new Date()` per request makes
  // search engines distrust the field).
  const latest = new Map<string, Date>();
  const touch = (key: string, date: Date) => {
    const current = latest.get(key);
    if (!current || date > current) latest.set(key, date);
  };

  for (const post of posts) {
    const modified = new Date(post.modified || post.date);
    touch("home", modified);
    for (const term of (post._embedded?.["wp:term"] ?? []).flat()) {
      touch(`${term.taxonomy}:${term.slug}`, modified);
    }
    const author = post._embedded?.author?.[0];
    if (author?.slug) touch(`author:${author.slug}`, modified);
    touch("authors", modified);
  }

  const home: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: latest.get("home") },
  ];

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${getPrimaryCategorySlug(post)}/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
  }));

  // Archives: only those that actually contain posts (skip empty/thin pages).
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => latest.has(`category:${c.slug}`))
    .map((c) => ({
      url: `${baseUrl}/${c.slug}`,
      lastModified: latest.get(`category:${c.slug}`),
    }));

  const tagUrls: MetadataRoute.Sitemap = tags
    .filter((t) => latest.has(`post_tag:${t.slug}`))
    .map((t) => ({
      url: `${baseUrl}/tags/${t.slug}`,
      lastModified: latest.get(`post_tag:${t.slug}`),
    }));

  const authorSlugs = [...latest.keys()]
    .filter((k) => k.startsWith("author:"))
    .map((k) => k.slice("author:".length));
  const authorUrls: MetadataRoute.Sitemap = authorSlugs.map((slug) => ({
    url: `${baseUrl}/authors/${slug}`,
    lastModified: latest.get(`author:${slug}`),
  }));

  // WordPress pages are intentionally omitted: there is no frontend route that
  // renders them yet (/<page-slug> would hit the [category] route and 404).
  return [
    ...home,
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
    { url: `${baseUrl}/authors`, lastModified: latest.get("authors") },
    ...authorUrls,
  ];
}
