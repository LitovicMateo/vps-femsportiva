import { MetadataRoute } from "next";
import {
  fetchAuthors,
  fetchCategories,
  fetchSitemapPosts,
  fetchTags,
} from "@/lib/wordpress";
import { getSiteUrl } from "@/lib/seo";

// Rendered per request (not at build, when WordPress is unreachable and the
// sitemap would be frozen with no posts); fetches are cached for 1h in wordpress.ts.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const [posts, categories, tags, authors] = await Promise.all([
    fetchSitemapPosts().catch(() => []),
    fetchCategories().catch(() => []),
    fetchTags().catch(() => []),
    fetchAuthors().catch(() => []),
  ]);

  const categorySlug = new Map(categories.map((c) => [c.id, c.slug]));
  const tagSlug = new Map(tags.map((t) => [t.id, t.slug]));
  const authorSlug = new Map(authors.map((a) => [a.id, a.slug]));

  // Archive `lastModified` = most recent post change in that archive, so the
  // value only moves when content does (a fresh `new Date()` per request makes
  // search engines distrust the field).
  const latest = new Map<string, Date>();
  const touch = (key: string, date: Date) => {
    const current = latest.get(key);
    if (!current || date > current) latest.set(key, date);
  };

  const postUrls: MetadataRoute.Sitemap = [];
  for (const post of posts) {
    const modified = new Date(post.modified || post.date);
    // Same rule as getPrimaryCategorySlug: first assigned category.
    const primary = categorySlug.get(post.categories?.[0]) || "uncategorized";
    postUrls.push({
      url: `${baseUrl}/${primary}/${post.slug}`,
      lastModified: modified,
    });

    touch("home", modified);
    touch("authors", modified);
    for (const id of post.categories ?? []) {
      const slug = categorySlug.get(id);
      if (slug) touch(`category:${slug}`, modified);
    }
    for (const id of post.tags ?? []) {
      const slug = tagSlug.get(id);
      if (slug) touch(`tag:${slug}`, modified);
    }
    const author = authorSlug.get(post.author);
    if (author) touch(`author:${author}`, modified);
  }

  // Archives: only those that actually contain posts (skip empty/thin pages).
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => latest.has(`category:${c.slug}`))
    .map((c) => ({
      url: `${baseUrl}/${c.slug}`,
      lastModified: latest.get(`category:${c.slug}`),
    }));

  const tagUrls: MetadataRoute.Sitemap = tags
    .filter((t) => latest.has(`tag:${t.slug}`))
    .map((t) => ({
      url: `${baseUrl}/tags/${t.slug}`,
      lastModified: latest.get(`tag:${t.slug}`),
    }));

  const authorUrls: MetadataRoute.Sitemap = authors
    .filter((a) => latest.has(`author:${a.slug}`))
    .map((a) => ({
      url: `${baseUrl}/authors/${a.slug}`,
      lastModified: latest.get(`author:${a.slug}`),
    }));

  // WordPress pages are intentionally omitted: there is no frontend route that
  // renders them yet (/<page-slug> would hit the [category] route and 404).
  return [
    { url: baseUrl, lastModified: latest.get("home") },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
    { url: `${baseUrl}/authors`, lastModified: latest.get("authors") },
    ...authorUrls,
  ];
}
