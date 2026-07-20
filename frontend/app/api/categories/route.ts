import { NextRequest, NextResponse } from "next/server";
import { fetchCategories } from "@/lib/wordpress";

// GET /api/categories - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional parameters
    const perPage = parseInt(searchParams.get("per_page") || "100");
    const hideEmpty = searchParams.get("hide_empty") !== "false"; // default true

    // Fetch categories from WordPress
    const categories = await fetchCategories();

    // Filter out empty categories if requested
    const filteredCategories = hideEmpty
      ? categories.filter((cat) => cat.count > 0)
      : categories;

    return NextResponse.json(
      {
        success: true,
        categories: filteredCategories.slice(0, perPage),
        total: filteredCategories.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
