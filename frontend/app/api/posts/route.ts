import { NextRequest, NextResponse } from "next/server";
import { fetchPosts } from "@/lib/wordpress";

// GET /api/posts - Fetch paginated list of posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "10"),
      100,
    );
    const categoryId = searchParams.get("categories")
      ? parseInt(searchParams.get("categories")!)
      : undefined;
    const tagId = searchParams.get("tags")
      ? parseInt(searchParams.get("tags")!)
      : undefined;
    const authorId = searchParams.get("author")
      ? parseInt(searchParams.get("author")!)
      : undefined;

    // Fetch posts from WordPress
    const result = await fetchPosts({
      page,
      perPage,
      categories: categoryId,
      tags: tagId,
      author: authorId,
    });

    // Return formatted response
    return NextResponse.json(
      {
        success: true,
        posts: result.posts,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          perPage: perPage,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    // Log the detail server-side; don't leak error.message to the client.
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
