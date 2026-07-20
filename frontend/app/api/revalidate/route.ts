import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

/** Length-safe constant-time string comparison (avoids a timing side-channel). */
function secretsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Purge a cache tag immediately */
function purgeTag(tag: string) {
  // Next 16: the single-argument revalidateTag is deprecated. From a Route
  // Handler, `revalidateTag(tag, "max")` performs the immediate purge
  // (updateTag() is Server-Action-only and throws in route handlers).
  revalidateTag(tag, "max");
}

export async function POST(request: NextRequest) {
  // Validate secret
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!REVALIDATION_SECRET || !token || !secretsMatch(token, REVALIDATION_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    slug?: string;
    categories?: string[];
    tags?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, slug, categories, tags: postTags } = body;

  if (!type) {
    return NextResponse.json(
      { error: "Missing 'type' field" },
      { status: 400 },
    );
  }

  const revalidatedTags: string[] = [];

  switch (type) {
    case "post":
      purgeTag("posts");
      revalidatedTags.push("posts");
      if (slug) {
        purgeTag(`post-${slug}`);
        revalidatedTags.push(`post-${slug}`);
      }
      // Also revalidate related category pages
      if (categories) {
        for (const catSlug of categories) {
          purgeTag(`category-${catSlug}`);
          revalidatedTags.push(`category-${catSlug}`);
        }
      }
      // Also revalidate related tag pages
      if (postTags) {
        for (const tagSlug of postTags) {
          purgeTag(`tag-${tagSlug}`);
          revalidatedTags.push(`tag-${tagSlug}`);
        }
      }
      break;

    case "category":
      purgeTag("categories");
      revalidatedTags.push("categories");
      if (slug) {
        purgeTag(`category-${slug}`);
        revalidatedTags.push(`category-${slug}`);
      }
      break;

    case "tag":
      purgeTag("tags");
      revalidatedTags.push("tags");
      if (slug) {
        purgeTag(`tag-${slug}`);
        revalidatedTags.push(`tag-${slug}`);
      }
      break;

    case "author":
      purgeTag("authors");
      revalidatedTags.push("authors");
      if (slug) {
        purgeTag(`author-${slug}`);
        revalidatedTags.push(`author-${slug}`);
      }
      break;

    case "page":
      purgeTag("pages");
      revalidatedTags.push("pages");
      if (slug) {
        purgeTag(`page-${slug}`);
        revalidatedTags.push(`page-${slug}`);
      }
      break;

    case "settings":
      purgeTag("settings");
      revalidatedTags.push("settings");
      break;

    default:
      return NextResponse.json(
        { error: `Unknown type: ${type}` },
        { status: 400 },
      );
  }

  console.log(
    `[Revalidate] type=${type} slug=${slug || "N/A"} tags=${revalidatedTags.join(", ")}`,
  );

  return NextResponse.json({
    revalidated: true,
    tags: revalidatedTags,
  });
}
