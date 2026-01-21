// Client for fetching data - uses WordPress API directly on server, Next.js API routes on client
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

interface PaginatedResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  error?: string;
  message?: string;
}

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
    return result;
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
    return await wordpressClient.fetchPostsByCategory(categorySlug, page, perPage);
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
  const queryParams = new URLSearchParams({
    q: query,
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/search?${queryParams.toString()}`;

  const res = await fetch(url, {
    cache: "no-store", // Don't cache search results
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch site settings from API
 */
export async function fetchSiteSettingsAPI() {
  // On server, return default settings or read from file
  if (isServer) {
    // In production, return default site settings
    // These can be customized via WordPress settings later
    return {
      siteTitle: "My Blog",
      siteDescription: "A blog about technology and development",
      siteKeywords: ["blog", "technology", "development"],
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
  return data.success ? data.site : null;
}
