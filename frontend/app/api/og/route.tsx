import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BRAND = "#ff0099";
const INK = "#15171a";

// Limits keep arbitrary query strings from producing oversized/odd cards.
const LIMITS = { title: 120, subtitle: 160, category: 40, author: 60, siteName: 40 };
const TYPES = ["default", "post", "category", "author"] as const;

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

function param(
  searchParams: URLSearchParams,
  key: keyof typeof LIMITS,
  fallback = "",
): string {
  const value = decodeEntities(searchParams.get(key) || fallback).trim();
  const max = LIMITS[key];
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/** Load the white wordmark as a data URI; null (text fallback) if unreachable. */
async function loadLogo(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/logo-wordmark-dark.svg`);
    if (!res.ok) return null;
    const svg = await res.text();
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);

    const title = param(searchParams, "title", "Femsportiva");
    const subtitle = param(searchParams, "subtitle");
    const category = param(searchParams, "category");
    const author = param(searchParams, "author");
    const siteName = param(searchParams, "siteName", "Femsportiva");
    const rawType = searchParams.get("type") || "default";
    const type = (TYPES as readonly string[]).includes(rawType)
      ? rawType
      : "default";

    const logo = await loadLogo(origin);
    // Smaller title for long headlines so they stay inside the card.
    const titleSize = title.length > 80 ? 56 : title.length > 50 ? 64 : 76;
    const label = category || (type === "category" ? "Kategorija" : "");

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "64px 72px",
          borderBottom: `14px solid ${BRAND}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={110} height={74} />
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 800,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: 4,
              }}
            >
              {siteName}
            </div>
          )}
          {label && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: INK,
                background: BRAND,
                padding: "8px 20px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {label}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {subtitle && type !== "post" && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#a9adb1",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#a9adb1",
          }}
        >
          <div style={{ display: "flex" }}>{author}</div>
          <div style={{ display: "flex", color: BRAND, fontWeight: 700 }}>
            {siteName}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        },
      },
    );
  } catch (error) {
    console.error("OG Image Error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
