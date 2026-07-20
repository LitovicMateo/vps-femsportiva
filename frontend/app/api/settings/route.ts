import { NextResponse } from "next/server";
import { fetchSiteInfo } from "@/lib/wordpress";

// GET /api/settings - Fetch public site settings and metadata
export async function GET() {
  try {
    // Fetch site info from WordPress
    const siteInfo = await fetchSiteInfo();

    if (!siteInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch site information",
        },
        { status: 500 },
      );
    }

    // Return public site metadata
    return NextResponse.json(
      {
        success: true,
        site: {
          name: siteInfo.name || "Blog",
          description: siteInfo.description || "",
          url: siteInfo.url || siteInfo.home || "",
          home: siteInfo.home || "",
          timezone: siteInfo.timezone_string || "UTC",
          gmtOffset: siteInfo.gmt_offset || 0,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site settings" },
      { status: 500 },
    );
  }
}
