import {
  WP_REST_API_Post,
  WP_REST_API_Category,
  WP_REST_API_User,
  WP_REST_API_Tag,
  WP_REST_API_Page,
} from "@/types/wordpress";

const API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://wordpress/wp-json";

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
}

/**
 * Helper to try multiple WordPress API endpoint variations
 */
async function tryFetch<T>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T | null> {
  const urls: string[] = [];
  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  // Split endpoint into path and query string
  const [path, queryString] = endpoint.split("?");

  // Try different URL patterns
  if (queryString) {
    // With query string - need to properly encode for rest_route
    urls.push(`${root}/index.php?rest_route=${path}&${queryString}`);
    urls.push(`${root}/wp-json${path}?${queryString}`);
    urls.push(`${API_BASE}${path}?${queryString}`);
  } else {
    // Without query string
    urls.push(`${root}/index.php?rest_route=${endpoint}`);
    urls.push(`${root}/wp-json${endpoint}`);
    urls.push(`${API_BASE}${endpoint}`);
  }

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  } = {};
  if (options?.revalidate !== undefined || options?.tags) {
    fetchOptions.next = {};
    if (options.revalidate !== undefined)
      fetchOptions.next.revalidate = options.revalidate;
    if (options.tags) fetchOptions.next.tags = options.tags;
  } else {
    fetchOptions.next = { revalidate: 60 };
  }

  let lastError: string | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        lastError = `HTTP ${res.status} (${url})`;
        continue;
      }
      const data = await res.json();
      return data as T;
    } catch (e) {
      lastError = `${(e as Error).message} (${url})`;
    }
  }

  // Only reached when every URL variant failed — a real outage, not an empty
  // result set (a 200 with `[]` returns above). Log it so downstream "no
  // content" renders can be told apart from WordPress being unreachable.
  console.error(
    `[wordpress] All fetch attempts failed for "${endpoint}": ${lastError ?? "unknown error"}`,
  );
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
  author?: number;
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
  if (params?.author) queryParams.append("author", params.author.toString());

  const urls: string[] = [];
  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  urls.push(
    `${root}/index.php?rest_route=/wp/v2/posts&${queryParams.toString()}`,
  );
  urls.push(`${root}/wp-json/wp/v2/posts?${queryParams.toString()}`);
  urls.push(`${API_BASE}/wp/v2/posts?${queryParams.toString()}`);

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  } = {
    next: { revalidate: 60, tags: ["posts"] },
  };

  let lastError: string | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        lastError = `HTTP ${res.status} (${url})`;
        continue;
      }

      const posts = await res.json();
      const total = parseInt(res.headers.get("X-WP-Total") || "0");
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

      if (Array.isArray(posts)) {
        return { posts, total, totalPages };
      }
    } catch (e) {
      lastError = `${(e as Error).message} (${url})`;
    }
  }
  console.error(
    `[wordpress] fetchPosts failed for all URL variants: ${lastError ?? "unknown error"}`,
  );
  return { posts: [], total: 0, totalPages: 0 };
}

/**
 * Search posts by keyword.
 *
 * Uses the `/wp/v2/posts` collection with `search=`, which returns full post
 * objects (with `_embed` author/media/terms) in a single request. The
 * `/wp/v2/search` endpoint only returns id/title/url stubs and would force an
 * N+1 (one hydration fetch per result) — avoid it here.
 */
export async function searchPosts(
  query: string,
  page: number = 1,
  perPage: number = 10,
): Promise<{ posts: WP_REST_API_Post[]; total: number; totalPages: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append("_embed", "true");
  queryParams.append("search", query);
  queryParams.append("per_page", perPage.toString());
  queryParams.append("page", page.toString());

  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  const urls = [
    `${root}/index.php?rest_route=/wp/v2/posts&${queryParams.toString()}`,
    `${root}/wp-json/wp/v2/posts?${queryParams.toString()}`,
    `${API_BASE}/wp/v2/posts?${queryParams.toString()}`,
  ];

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  } = {
    next: { revalidate: 60, tags: ["posts"] },
  };

  let lastError: string | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        lastError = `HTTP ${res.status} (${url})`;
        continue;
      }

      const posts = await res.json();
      const total = parseInt(res.headers.get("X-WP-Total") || "0");
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

      if (Array.isArray(posts)) {
        return { posts, total, totalPages };
      }
    } catch (e) {
      lastError = `${(e as Error).message} (${url})`;
    }
  }
  console.error(
    `[wordpress] searchPosts failed for all URL variants: ${lastError ?? "unknown error"}`,
  );
  return { posts: [], total: 0, totalPages: 0 };
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(
  slug: string,
): Promise<WP_REST_API_Post | null> {
  const endpoint = `/wp/v2/posts?slug=${slug}&_embed=true`;
  const data = await tryFetch<WP_REST_API_Post[]>(endpoint, {
    revalidate: 60,
    tags: ["posts", `post-${slug}`],
  });
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch posts by category slug
 */
export async function fetchPostsByCategory(
  categorySlug: string,
  page: number = 1,
  perPage: number = 10,
): Promise<{
  posts: WP_REST_API_Post[];
  total: number;
  totalPages: number;
  category: WP_REST_API_Category | null;
}> {
  // First, get the category by slug
  const categoryEndpoint = `/wp/v2/categories?slug=${categorySlug}`;
  const categories = await tryFetch<WP_REST_API_Category[]>(categoryEndpoint, {
    revalidate: 3600,
    tags: ["categories", `category-${categorySlug}`],
  });
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
  limit: number = 3,
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
/**
 * Fetch every item from a paginated collection using length-based paging (no
 * response headers needed): keep requesting pages of 100 until a page returns
 * fewer than 100 items (or WP 400s on an out-of-range page → tryFetch null).
 * A hard page cap guards against a misbehaving API looping forever.
 */
async function fetchAllPaginated<T>(
  path: string,
  options: FetchOptions,
  extraQuery = "",
): Promise<T[]> {
  const perPage = 100;
  const maxPages = 50; // safety cap: 5000 items
  const all: T[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const endpoint = `${path}?per_page=${perPage}&page=${page}${extraQuery}`;
    const batch = await tryFetch<T[]>(endpoint, options);
    if (!batch || !Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < perPage) break;
  }

  return all;
}

export async function fetchCategories(): Promise<WP_REST_API_Category[]> {
  return fetchAllPaginated<WP_REST_API_Category>("/wp/v2/categories", {
    revalidate: 3600,
    tags: ["categories"],
  });
}

/**
 * Fetch all authors who have published posts
 */
export async function fetchAuthors(): Promise<WP_REST_API_User[]> {
  return fetchAllPaginated<WP_REST_API_User>(
    "/wp/v2/users",
    { revalidate: 3600, tags: ["authors"] },
    "&who=authors",
  );
}

/**
 * Fetch author by slug
 */
export async function fetchAuthorBySlug(
  slug: string,
): Promise<WP_REST_API_User | null> {
  const endpoint = `/wp/v2/users?slug=${slug}`;
  const data = await tryFetch<WP_REST_API_User[]>(endpoint, {
    revalidate: 3600,
    tags: ["authors", `author-${slug}`],
  });
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch posts by author
 */
export async function fetchPostsByAuthor(
  authorId: number,
  page: number = 1,
  perPage: number = 10,
): Promise<{
  posts: WP_REST_API_Post[];
  total: number;
  totalPages: number;
}> {
  const result = await fetchPosts({
    author: authorId,
    page,
    perPage,
  });

  return result;
}

/**
 * Fetch all tags
 */
export async function fetchTags(): Promise<WP_REST_API_Tag[]> {
  return fetchAllPaginated<WP_REST_API_Tag>("/wp/v2/tags", {
    revalidate: 3600,
    tags: ["tags"],
  });
}

/**
 * Fetch tag by slug
 */
export async function fetchTagBySlug(
  slug: string,
): Promise<WP_REST_API_Tag | null> {
  const endpoint = `/wp/v2/tags?slug=${slug}`;
  const data = await tryFetch<WP_REST_API_Tag[]>(endpoint, {
    revalidate: 3600,
    tags: ["tags", `tag-${slug}`],
  });
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch posts by tag slug
 */
export async function fetchPostsByTag(
  tagSlug: string,
  page: number = 1,
  perPage: number = 10,
): Promise<{
  posts: WP_REST_API_Post[];
  total: number;
  totalPages: number;
  tag: WP_REST_API_Tag | null;
}> {
  // First, get the tag by slug
  const tagEndpoint = `/wp/v2/tags?slug=${tagSlug}`;
  const tags = await tryFetch<WP_REST_API_Tag[]>(tagEndpoint, {
    revalidate: 3600,
    tags: ["tags", `tag-${tagSlug}`],
  });
  const tag = tags && tags.length > 0 ? tags[0] : null;

  if (!tag) {
    return { posts: [], total: 0, totalPages: 0, tag: null };
  }

  // Then fetch posts with that tag
  const result = await fetchPosts({
    tags: tag.id,
    page,
    perPage,
  });

  return { ...result, tag };
}

/**
 * Fetch all pages
 */
export async function fetchPages(params?: {
  perPage?: number;
  page?: number;
}): Promise<{ pages: WP_REST_API_Page[]; total: number; totalPages: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append("_embed", "true");

  if (params?.perPage)
    queryParams.append("per_page", params.perPage.toString());
  if (params?.page) queryParams.append("page", params.page.toString());

  const urls: string[] = [];
  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  urls.push(
    `${root}/index.php?rest_route=/wp/v2/pages&${queryParams.toString()}`,
  );
  urls.push(`${root}/wp-json/wp/v2/pages?${queryParams.toString()}`);
  urls.push(`${API_BASE}/wp/v2/pages?${queryParams.toString()}`);

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600, tags: ["pages"] },
      });
      if (!res.ok) continue;

      const pages = await res.json();
      const total = parseInt(res.headers.get("X-WP-Total") || "0");
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

      if (Array.isArray(pages)) {
        return { pages, total, totalPages };
      }
    } catch {
      // Try next URL
    }
  }

  return { pages: [], total: 0, totalPages: 0 };
}

/**
 * Fetch a single page by slug
 */
export async function fetchPageBySlug(
  slug: string,
): Promise<WP_REST_API_Page | null> {
  const endpoint = `/wp/v2/pages?slug=${slug}&_embed`;
  const data = await tryFetch<WP_REST_API_Page[]>(endpoint, {
    revalidate: 3600,
    tags: ["pages", `page-${slug}`],
  });
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch site settings and metadata
 */
interface SiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
}

export async function fetchSiteInfo(): Promise<SiteInfo | null> {
  const endpoint = `/`;
  const data = await tryFetch<SiteInfo>(endpoint, {
    revalidate: 3600,
    tags: ["settings"],
  });
  return data || null;
}
