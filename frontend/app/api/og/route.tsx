import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Decode HTML entities that WordPress emits in titles/excerpts (e.g. `&#8217;`,
 * `&amp;`). Without this they render literally in the OG image. Edge runtime has
 * no DOM parser, so decode the common named + numeric entities directly.
 */
function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&(apos|#039);/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = decodeEntities(searchParams.get("title") || "FEM Sportiva");
    const subtitle = decodeEntities(searchParams.get("subtitle") || "");
    const category = decodeEntities(searchParams.get("category") || "");
    const author = decodeEntities(searchParams.get("author") || "");
    const date = searchParams.get("date") || "";
    const type = searchParams.get("type") || "default"; // default, post, category, author
    const siteName = searchParams.get("siteName") || "FEM Sportiva";

    // Define colors based on type
    const bgGradients = {
      default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      post: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      category: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      author: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    };

    const gradient =
      bgGradients[type as keyof typeof bgGradients] || bgGradients.default;

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: gradient,
          padding: "80px",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "white",
          }}
        >
          <div
            style={{
              background: "white",
              width: 50,
              height: 50,
              borderRadius: 10,
              marginRight: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            📝
          </div>
          {siteName}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: "85%",
          }}
        >
          {category && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.2,
              textShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          {author && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  background: "white",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✍️
              </div>
              {author}
            </div>
          )}
          {date && <div style={{ display: "flex" }}>📅 {date}</div>}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("OG Image Error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
