// Client for fetching data - uses WordPress API directly on server, Next.js API routes on client
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME } from "@/lib/site";
import * as wordpressClient from "./wordpress";

// Use NEXT_PUBLIC_SITE_URL for absolute URLs, fallback to localhost for development
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser - use relative URLs
    return "";
  }
  // Server - use absolute URL
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

const isServer = typeof window === "undefined";

/**
 * Fetch posts from API
 */
export async function fetchPostsAPI(params?: {
  page?: number;
  perPage?: number;
  categories?: number;
  tags?: number;
  author?: number;
}) {
  // On server, call WordPress directly to avoid HTTP requests to ourselves
  if (isServer) {
    const result = await wordpressClient.fetchPosts({
      page: params?.page,
      perPage: params?.perPage,
      categories: params?.categories,
      tags: params?.tags,
      author: params?.author,
    });
    // Include the same `pagination` envelope the client branch (/api/posts)
    // returns, so consumers (e.g. authors index) read data.pagination.* on both
    // paths. Keeps posts/total/totalPages too for any flat-shape callers.
    return {
      ...result,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: params?.page ?? 1,
        perPage: params?.perPage ?? result.posts.length,
      },
    };
  }

  // On client, use Next.js API routes
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.perPage)
    queryParams.append("per_page", params.perPage.toString());
  if (params?.categories)
    queryParams.append("categories", params.categories.toString());
  if (params?.tags) queryParams.append("tags", params.tags.toString());
  if (params?.author) queryParams.append("author", params.author.toString());

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/posts${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch single post by slug from API
 */
export async function fetchPostBySlugAPI(slug: string) {
  // On server, call WordPress directly
  if (isServer) {
    return await wordpressClient.fetchPostBySlug(slug);
  }

  // On client, use Next.js API routes
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/posts/${slug}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch post: ${res.statusText}`);
  }

  const data = await res.json();
  return data.success ? data.post : null;
}

/**
 * Fetch posts by category slug from API
 */
export async function fetchPostsByCategoryAPI(
  categorySlug: string,
  page: number = 1,
  perPage: number = 10,
) {
  // On server, call WordPress directly
  if (isServer) {
    const result = await wordpressClient.fetchPostsByCategory(
      categorySlug,
      page,
      perPage,
    );
    // Wrap in the same `pagination` envelope the client branch (and the
    // /api/categories/[slug]/posts route) returns, so consumers like
    // app/[category]/page.tsx can read data.pagination.* on both paths.
    return {
      ...result,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage,
      },
    };
  }

  // On client, use Next.js API routes
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/categories/${categorySlug}/posts?${queryParams.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return { posts: [], total: 0, totalPages: 0, category: null };
    }
    throw new Error(`Failed to fetch category posts: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch posts by tag slug from API
 */
export async function fetchPostsByTagAPI(
  tagSlug: string,
  page: number = 1,
  perPage: number = 10,
) {
  // On server, call WordPress directly
  if (isServer) {
    const result = await wordpressClient.fetchPostsByTag(
      tagSlug,
      page,
      perPage,
    );
    return {
      ...result,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage,
      },
    };
  }

  // On client, use Next.js API routes
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/tags/${tagSlug}/posts?${queryParams.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return { posts: [], total: 0, totalPages: 0, tag: null };
    }
    throw new Error(`Failed to fetch tag posts: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch posts by author slug from API
 */
export async function fetchPostsByAuthorAPI(
  authorSlug: string,
  page: number = 1,
  perPage: number = 10,
) {
  // On server, call WordPress directly
  if (isServer) {
    const author = await wordpressClient.fetchAuthorBySlug(authorSlug);
    if (!author) {
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        author: null,
        pagination: { total: 0, totalPages: 0, currentPage: page, perPage },
      };
    }
    const result = await wordpressClient.fetchPostsByAuthor(
      author.id,
      page,
      perPage,
    );
    return {
      ...result,
      author,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage,
      },
    };
  }

  // On client, use Next.js API routes
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/authors/${authorSlug}/posts?${queryParams.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return { posts: [], total: 0, totalPages: 0, author: null };
    }
    throw new Error(`Failed to fetch author posts: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all categories from API
 */
export async function fetchCategoriesAPI() {
  // On server, call WordPress directly
  if (isServer) {
    return await wordpressClient.fetchCategories();
  }

  // On client, use Next.js API routes
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/categories`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }

  const data = await res.json();
  return data.success ? data.categories : [];
}

/**
 * Fetch all authors from API
 */
export async function fetchAuthorsAPI() {
  // On server, call WordPress directly to avoid HTTP requests to ourselves
  if (isServer) {
    return await wordpressClient.fetchAuthors();
  }

  // On client, use Next.js API routes
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/authors`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authors: ${res.statusText}`);
  }

  const data = await res.json();
  return data.success ? data.authors : [];
}

/**
 * Fetch author by slug from API
 */
export async function fetchAuthorBySlugAPI(slug: string) {
  // On server, call WordPress directly
  if (isServer) {
    return await wordpressClient.fetchAuthorBySlug(slug);
  }

  // On client, use Next.js API routes
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/authors/${slug}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch author: ${res.statusText}`);
  }

  const data = await res.json();
  return data.success ? data.author : null;
}

/**
 * Search posts from API
 */
export async function searchPostsAPI(
  query: string,
  page: number = 1,
  perPage: number = 10,
) {
  // On server, call WordPress directly (avoids a self-HTTP hop to /api/search).
  if (isServer) {
    const result = await wordpressClient.searchPosts(query, page, perPage);
    return {
      success: true,
      query,
      results: result.posts,
      total: result.total,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage,
      },
    };
  }

  // On client, use the Next.js API route.
  const queryParams = new URLSearchParams({
    q: query,
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/search?${queryParams.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch site settings from API
 */
const DEFAULT_SITE_TITLE = SITE_NAME;
const DEFAULT_SITE_DESCRIPTION = SITE_DESCRIPTION;
const DEFAULT_SITE_KEYWORDS = SITE_KEYWORDS;

// Taglines WordPress ships with; treat them as "not set" so they never reach
// meta tags.
const WP_DEFAULT_TAGLINES = new Set(["just another wordpress site", ""]);

function resolveTagline(tagline: string | undefined): string {
  const clean = (tagline || "").trim();
  return WP_DEFAULT_TAGLINES.has(clean.toLowerCase())
    ? DEFAULT_SITE_DESCRIPTION
    : clean;
}

export async function fetchSiteSettingsAPI() {
  // On server, fetch site info directly from WordPress
  if (isServer) {
    const siteInfo = await wordpressClient.fetchSiteInfo();
    return {
      siteTitle: siteInfo?.name || DEFAULT_SITE_TITLE,
      siteDescription: resolveTagline(siteInfo?.description),
      siteKeywords: DEFAULT_SITE_KEYWORDS,
    };
  }

  // On client, use Next.js API routes
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/settings`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch site settings: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.success) {
    // Fall back to defaults rather than null, so callers (layout, home, archives)
    // can always read settings.* without null guards. Keeps this branch's shape
    // identical to the server branch above.
    return {
      siteTitle: DEFAULT_SITE_TITLE,
      siteDescription: DEFAULT_SITE_DESCRIPTION,
      siteKeywords: DEFAULT_SITE_KEYWORDS,
    };
  }

  return {
    siteTitle: data.site.name || DEFAULT_SITE_TITLE,
    siteDescription: resolveTagline(data.site.description),
    siteKeywords: DEFAULT_SITE_KEYWORDS,
  };
}
