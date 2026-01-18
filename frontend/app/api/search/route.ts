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
    const root = /\/wp-json\/?$/.test(API_BASE)
      ? API_BASE.replace(/\/wp-json\/?$/, "")
      : API_BASE.replace(/\/$/, "");

    const queryParams = new URLSearchParams({
      search: query,
      per_page: perPage.toString(),
      page: page.toString(),
      _embed: "true",
    });

    if (type !== "any") {
      queryParams.append("type", type);
    }

    // Try multiple URL patterns for WordPress search
    const urls = [
      `${root}/index.php?rest_route=/wp/v2/search&${queryParams.toString()}`,
      `${root}/wp-json/wp/v2/search?${queryParams.toString()}`,
      `${API_BASE}/wp/v2/search?${queryParams.toString()}`,
    ];

    let results = null;
    let total = 0;
    let totalPages = 1;

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;

        results = await res.json();
        total = parseInt(res.headers.get("X-WP-Total") || "0");
        totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

        if (Array.isArray(results)) {
          break;
        }
      } catch (e) {
        // Try next URL
        continue;
      }
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

    // Format search results
    const formattedResults = results.map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type || item.subtype,
      url: item.url,
      excerpt: item.excerpt || "",
    }));

    return NextResponse.json({
      success: true,
      query: query,
      results: formattedResults,
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
