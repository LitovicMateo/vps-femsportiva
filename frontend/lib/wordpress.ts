import { WP_REST_API_Post, WP_REST_API_Category } from "@/types/wordpress";

const API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://wordpress/wp-json";

/**
 * Helper to try multiple WordPress API endpoint variations
 */
async function tryFetch<T>(endpoint: string): Promise<T | null> {
  const urls: string[] = [];
  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  // Try different URL patterns
  urls.push(`${root}/index.php?rest_route=${endpoint}`);
  urls.push(`${root}/wp-json${endpoint}`);
  urls.push(`${API_BASE}${endpoint}`);

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      return data as T;
    } catch (e) {
      // Try next URL
    }
  }

  return null;
}

/**
 * Fetch all posts with optional filters
 */
export async function fetchPosts(params?: {
  perPage?: number;
  page?: number;
  categories?: number;
  tags?: number;
  exclude?: number;
}): Promise<{ posts: WP_REST_API_Post[]; total: number; totalPages: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append("_embed", "true");

  if (params?.perPage)
    queryParams.append("per_page", params.perPage.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.categories)
    queryParams.append("categories", params.categories.toString());
  if (params?.tags) queryParams.append("tags", params.tags.toString());
  if (params?.exclude) queryParams.append("exclude", params.exclude.toString());

  const endpoint = `/wp/v2/posts?${queryParams.toString()}`;
  const urls: string[] = [];
  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  urls.push(
    `${root}/index.php?rest_route=/wp/v2/posts&${queryParams.toString()}`
  );
  urls.push(`${root}/wp-json/wp/v2/posts?${queryParams.toString()}`);
  urls.push(`${API_BASE}/wp/v2/posts?${queryParams.toString()}`);

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const posts = await res.json();
      const total = parseInt(res.headers.get("X-WP-Total") || "0");
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

      if (Array.isArray(posts)) {
        return { posts, total, totalPages };
      }
    } catch (e) {
      // Try next URL
    }
  }

  return { posts: [], total: 0, totalPages: 0 };
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(
  slug: string
): Promise<WP_REST_API_Post | null> {
  const endpoint = `/wp/v2/posts?slug=${slug}&_embed`;
  const data = await tryFetch<WP_REST_API_Post[]>(endpoint);
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch posts by category slug
 */
export async function fetchPostsByCategory(
  categorySlug: string,
  page: number = 1,
  perPage: number = 10
): Promise<{
  posts: WP_REST_API_Post[];
  total: number;
  totalPages: number;
  category: WP_REST_API_Category | null;
}> {
  // First, get the category by slug
  const categoryEndpoint = `/wp/v2/categories?slug=${categorySlug}`;
  const categories = await tryFetch<WP_REST_API_Category[]>(categoryEndpoint);
  const category = categories && categories.length > 0 ? categories[0] : null;

  if (!category) {
    return { posts: [], total: 0, totalPages: 0, category: null };
  }

  // Then fetch posts in that category
  const result = await fetchPosts({
    categories: category.id,
    page,
    perPage,
  });

  return { ...result, category };
}

/**
 * Fetch related posts by tags
 */
export async function fetchRelatedPosts(
  postId: number,
  tags: number[],
  limit: number = 3
): Promise<WP_REST_API_Post[]> {
  if (tags.length === 0) {
    // If no tags, just get recent posts
    const { posts } = await fetchPosts({ perPage: limit, exclude: postId });
    return posts;
  }

  // Fetch posts with same tags
  const { posts } = await fetchPosts({
    tags: tags[0], // WordPress API takes single tag value
    perPage: limit + 1, // Get one extra in case current post is included
    exclude: postId,
  });

  return posts.slice(0, limit);
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<WP_REST_API_Category[]> {
  const endpoint = `/wp/v2/categories?per_page=100`;
  const data = await tryFetch<WP_REST_API_Category[]>(endpoint);
  return data || [];
}
