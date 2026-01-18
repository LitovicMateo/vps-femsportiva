import { NextRequest, NextResponse } from "next/server";
import { fetchPostBySlug } from "@/lib/wordpress";

// GET /api/posts/[slug] - Fetch single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug parameter is required",
        },
        { status: 400 },
      );
    }

    // Fetch post from WordPress
    const post = await fetchPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
          message: `No post found with slug: ${slug}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
