import { NextRequest, NextResponse } from "next/server";
import { fetchPages } from "@/lib/wordpress";

// GET /api/pages - Fetch all pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "100"),
      100,
    );

    // Fetch pages from WordPress
    const result = await fetchPages({
      page,
      perPage,
    });

    return NextResponse.json({
      success: true,
      pages: result.pages,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pages",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
