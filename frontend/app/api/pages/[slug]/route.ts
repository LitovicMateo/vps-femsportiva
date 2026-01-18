import { NextRequest, NextResponse } from "next/server";
import { fetchPageBySlug } from "@/lib/wordpress";

// GET /api/pages/[slug] - Fetch single page by slug
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
          error: "Page slug is required",
        },
        { status: 400 },
      );
    }

    // Fetch page from WordPress
    const page = await fetchPageBySlug(slug);

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: "Page not found",
          message: `No page found with slug: ${slug}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch page",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
