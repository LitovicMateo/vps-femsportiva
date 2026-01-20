import { MetadataRoute } from "next";
import {
  fetchPosts,
  fetchCategories,
  fetchAuthors,
  fetchPages,
} from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Fetch all data in parallel
  const [postsData, categories, authors, pagesData] = await Promise.all([
    fetchPosts({ perPage: 100 }).catch(() => ({
      posts: [],
      total: 0,
      totalPages: 0,
    })),
    fetchCategories().catch(() => []),
    fetchAuthors().catch(() => []),
    fetchPages().catch(() => ({ pages: [], total: 0, totalPages: 0 })),
  ]);

  const posts = postsData.posts || [];
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

  // Posts
  const postUrls: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/${post.category?.slug || "uncategorized"}/${post.slug}`,
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
