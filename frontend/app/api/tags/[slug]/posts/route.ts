import { NextRequest, NextResponse } from "next/server";
import { fetchPostsByTag } from "@/lib/wordpress";

// GET /api/tags/[slug]/posts - Fetch posts by tag
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
          error: "Tag slug is required",
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

    // Fetch posts by tag
    const result = await fetchPostsByTag(slug, page, perPage);

    if (!result.tag) {
      return NextResponse.json(
        {
          success: false,
          error: "Tag not found",
          message: `No tag found with slug: ${slug}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      tag: result.tag,
      posts: result.posts,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts by tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
