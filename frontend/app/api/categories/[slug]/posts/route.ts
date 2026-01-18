import { NextRequest, NextResponse } from "next/server";
import { fetchPostsByCategory } from "@/lib/wordpress";

// GET /api/categories/[slug]/posts - Fetch posts by category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Category slug is required",
        },
        { status: 400 },
      );
    }

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "10"),
      100,
    );

    // Fetch posts by category
    const result = await fetchPostsByCategory(slug, page, perPage);

    if (!result.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
          message: `No category found with slug: ${slug}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      category: result.category,
      posts: result.posts,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts by category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
