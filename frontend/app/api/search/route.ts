import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/wordpress";

// GET /api/search - Search posts by keyword.
//
// Backed by `searchPosts()` (a single `/wp/v2/posts?search=&_embed` request).
// The previous implementation hit `/wp/v2/search` and then fetched each result
// individually to hydrate embedded data — an N+1 (11 uncached WP hits for 10
// results) that also bypassed caching.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || searchParams.get("search") || "";
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

    const { posts, total, totalPages } = await searchPosts(
      query,
      page,
      perPage,
    );

    return NextResponse.json(
      {
        success: true,
        query,
        results: posts,
        total,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
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
