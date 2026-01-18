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
    const search = searchParams.get("search") || undefined;
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
    return NextResponse.json({
      success: true,
      posts: result.posts,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
