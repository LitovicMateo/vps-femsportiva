// Client for fetching data from our Next.js API routes

// Use NEXT_PUBLIC_SITE_URL for absolute URLs, fallback to localhost for development
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser - use relative URLs
    return "";
  }
  // Server - use absolute URL
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

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
