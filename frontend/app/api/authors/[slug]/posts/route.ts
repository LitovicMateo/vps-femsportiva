import { NextRequest, NextResponse } from "next/server";
import { fetchAuthorBySlug, fetchPostsByAuthor } from "@/lib/wordpress";

// GET /api/authors/[slug]/posts - Fetch posts by author
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
          error: "Author slug is required",
        },
        { status: 400 },
      );
    }

    // First, get the author by slug
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

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "10"),
      100,
    );

    // Fetch posts by author
    const result = await fetchPostsByAuthor(author.id, page, perPage);

    return NextResponse.json({
      success: true,
      author: {
        id: author.id,
        name: author.name,
        slug: author.slug,
        description: author.description,
        avatar_urls: author.avatar_urls,
        url: author.url,
      },
      posts: result.posts,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching posts by author:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts by author",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
