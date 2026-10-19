import type { WP_REST_API_Post } from "@/types/wordpress";
import { transformWordPressUrl } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "2026-11-18T10:00:00" -> "18. listopada 2026." */
export function formatDateHr(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const parts = dateFormatter.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  // Build manually so the format is stable across ICU versions.
  return `${get("day")}. ${get("month")} ${get("year")}.`;
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&hellip;": "…",
  "&ndash;": "–",
  "&mdash;": "—",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”",
};

/** Strip HTML tags and decode common entities (single pass, no double-decoding). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (m, hex, dec, name) => {
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      if (dec) return String.fromCodePoint(Number(dec));
      return ENTITIES[`&${String(name).toLowerCase()};`] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export interface FeaturedImage {
  url: string;
  alt: string;
  caption: string;
}

export function getFeaturedImage(post: WP_REST_API_Post): FeaturedImage | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const url = transformWordPressUrl(media?.source_url);
  if (!media || !url) return null;
  return {
    url,
    alt: media.alt_text || stripHtml(post.title?.rendered),
    caption: stripHtml(media.caption?.rendered),
  };
}

export interface TermLink {
  name: string;
  slug: string;
}

export function getPrimaryCategory(post: WP_REST_API_Post): TermLink | null {
  const c = (post._embedded?.["wp:term"] ?? [])
    .flat()
    .find((t) => t.taxonomy === "category");
  return c ? { name: stripHtml(c.name), slug: c.slug } : null;
}

export function getTags(post: WP_REST_API_Post): TermLink[] {
  return (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => ({
      name: stripHtml(t.name),
      slug: t.slug,
    }));
}

export interface PostAuthor {
  name: string;
  slug: string;
  description: string;
  avatar: string | null;
}

export function getAuthor(post: WP_REST_API_Post): PostAuthor | null {
  const a = post._embedded?.author?.[0];
  if (!a?.slug) return null;
  return {
    name: a.name,
    slug: a.slug,
    description: a.description || "",
    avatar: a.avatar_urls?.["96"] || a.avatar_urls?.["48"] || null,
  };
}
