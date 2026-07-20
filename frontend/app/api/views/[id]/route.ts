import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://wordpress/wp-json";

// Shared secret proving the write comes from this server-side proxy, not a
// direct hit against WordPress. Must match VIEWS_SECRET on the WordPress side.
const VIEWS_SECRET = process.env.VIEWS_SECRET;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    // Trust only proxy-controlled values. `x-real-ip` is set by Nginx to the
    // real edge client; the last `x-forwarded-for` entry is the Nginx-appended
    // value. Never trust the first XFF entry — it is client-supplied.
    const clientIp =
      request.headers.get("x-real-ip")?.trim() ||
      request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
      "unknown";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Real-IP": clientIp,
    };
    if (VIEWS_SECRET) {
      headers["Authorization"] = `Bearer ${VIEWS_SECRET}`;
    }

    const response = await fetch(`${API_BASE}/custom/v1/post-view/${postId}`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "View tracking unavailable" },
      { status: 502 },
    );
  }
}
