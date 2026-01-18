import { NextRequest, NextResponse } from "next/server";
import { fetchTags } from "@/lib/wordpress";

// GET /api/tags - Fetch all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional parameters
    const perPage = parseInt(searchParams.get("per_page") || "100");
    const search = searchParams.get("search") || "";

    // Fetch tags from WordPress
    const tags = await fetchTags();

    // Filter by search if provided
    const filteredTags = search
      ? tags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(search.toLowerCase()) ||
            tag.slug.toLowerCase().includes(search.toLowerCase()),
        )
      : tags;

    return NextResponse.json({
      success: true,
      tags: filteredTags.slice(0, perPage),
      total: filteredTags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tags",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
