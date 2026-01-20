import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://wordpress/wp-json";

// GET /api/search - Global search across posts, pages, and custom post types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || searchParams.get("search") || "";
    const type = searchParams.get("type") || "post"; // post, page, any
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "10"),
      100,
    );

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
          message:
            "Please provide a search term using ?q= or ?search= parameter",
        },
        { status: 400 },
      );
    }

    // Build WordPress search endpoint
    const queryParams = new URLSearchParams({
      search: query,
      per_page: perPage.toString(),
      page: page.toString(),
    });

    // WordPress search endpoint uses 'subtype' not 'type' for filtering
    if (type !== "any") {
      queryParams.append("subtype", type);
    }

    // Construct the full search URL
    const searchUrl = `${API_BASE}/wp/v2/search?${queryParams.toString()}`;

    let results = null;
    let total = 0;
    let totalPages = 1;

    try {
      const res = await fetch(searchUrl, { cache: "no-store" });

      if (!res.ok) {
        console.error("WordPress search failed with status:", res.status);
        throw new Error(`WordPress API returned status ${res.status}`);
      }

      results = await res.json();
      total = parseInt(res.headers.get("X-WP-Total") || "0");
      totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    } catch (error) {
      console.error("Error fetching search results:", error);
      // Return empty results instead of throwing
      results = [];
    }

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: page,
          perPage: perPage,
        },
      });
    }

    // Fetch full post details for each search result to get embedded data (author, categories, etc.)
    const detailedResults = await Promise.all(
      results.map(async (item: any) => {
        try {
          // Fetch full post data with embedded resources
          const postUrl = `${API_BASE}/wp/v2/posts/${item.id}?_embed`;
          const postRes = await fetch(postUrl, { cache: "no-store" });

          if (postRes.ok) {
            const postData = await postRes.json();
            return postData;
          }
        } catch (error) {
          console.error(`Error fetching post ${item.id}:`, error);
        }

        // Fallback to basic search result if full post fetch fails
        return {
          id: item.id,
          title: { rendered: item.title },
          excerpt: { rendered: item.excerpt || "" },
          url: item.url,
          date: new Date().toISOString(),
          _embedded: {},
        };
      }),
    );

    return NextResponse.json({
      success: true,
      query: query,
      results: detailedResults,
      total: total,
      pagination: {
        total: total,
        totalPages: totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
