import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorBySlug } from "@/lib/wordpress";

// GET /api/authors/[slug] - Fetch single author by slug
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
          error: "Author slug is required",
        },
        { status: 400 },
      );
    }

    // Fetch author from WordPress
    const author = await fetchAuthorBySlug(slug);

    if (!author) {
      return NextResponse.json(
        {
          success: false,
          error: "Author not found",
          message: `No author found with slug: ${slug}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      author,
    });
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch author",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
