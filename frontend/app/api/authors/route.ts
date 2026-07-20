import { NextRequest, NextResponse } from "next/server";
import { fetchAuthors } from "@/lib/wordpress";

// GET /api/authors - Fetch all authors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get("per_page") || "100");

    // Fetch authors from WordPress
    const authors = await fetchAuthors();

    return NextResponse.json(
      {
        success: true,
        authors: authors.slice(0, perPage),
        total: authors.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch authors" },
      { status: 500 },
    );
  }
}
