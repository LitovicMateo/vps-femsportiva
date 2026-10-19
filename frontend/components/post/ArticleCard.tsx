import Link from "next/link";
import Image from "next/image";
import type { WP_REST_API_Post } from "@/types/wordpress";
import { calculateReadingTime, getPrimaryCategorySlug } from "@/lib/utils";
import {
  formatDateHr,
  getAuthor,
  getFeaturedImage,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/format";
import styles from "./ArticleCard.module.css";

export type ArticleCardVariant =
  "lead" | "compact" | "grid" | "list" | "row" | "featured-wide";

export interface ArticleCardProps {
  post: WP_REST_API_Post;
  variant: ArticleCardVariant;
  /** Show the excerpt (lead / featured-wide always do; grid on request). */
  showExcerpt?: boolean;
  /** Image ratio for the grid variant. Default '16/10'. */
  imageRatio?: "4/3" | "16/10";
  headingLevel?: "h1" | "h2" | "h3";
  /** Mark the image as LCP candidate. */
  priority?: boolean;
  /** Replaces the category name in the kicker (e.g. "Najnovije u kategoriji"). */
  kicker?: string;
  /**
   * Force kicker on/off. Defaults: on for lead, compact, list, featured-wide;
   * grid shows it unless the excerpt is shown (category-archive look); row off.
   */
  showKicker?: boolean;
  /** Grid variant only: render as a list row (text left, square thumb right) below 768px. */
  mobileList?: boolean;
  /** Row variant only: 'lg' = 180px thumbnail on tablet (article related). */
  thumb?: "md" | "lg";
}

const SIZES: Record<ArticleCardVariant, string> = {
  lead: "(min-width: 1024px) 800px, 100vw",
  compact: "(min-width: 1024px) 120px, (min-width: 768px) 33vw, 96px",
  grid: "(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw",
  list: "100px",
  row: "(min-width: 1024px) 132px, (min-width: 768px) 160px, 240px",
  "featured-wide": "(min-width: 1024px) 700px, 100vw",
};

export default function ArticleCard({
  post,
  variant,
  showExcerpt,
  imageRatio = "16/10",
  headingLevel = "h3",
  priority = false,
  kicker,
  showKicker,
  mobileList = false,
  thumb = "md",
}: ArticleCardProps) {
  const Heading = headingLevel;
  const title = stripHtml(post.title?.rendered) || `Članak ${post.id}`;
  const href = `/${getPrimaryCategorySlug(post)}/${post.slug}`;
  const image = getFeaturedImage(post);
  const category = getPrimaryCategory(post);
  const author = getAuthor(post);
  const date = formatDateHr(post.date);
  const readMin = calculateReadingTime(post.content?.rendered || "");
  const excerpt = stripHtml(post.excerpt?.rendered)
    .replace(/\s*\[(?:…|&hellip;|\.\.\.)\]\s*$/, "…")
    .trim();

  const withExcerpt =
    variant === "lead" || variant === "featured-wide" || !!showExcerpt;
  const kickerDefault = variant === "grid" ? !showExcerpt : variant !== "row";
  const kickerText = kicker ?? category?.name;
  const renderKicker = (showKicker ?? kickerDefault) && !!kickerText;

  const rootClass = [
    styles.card,
    styles[variant.replace("-", "")],
    variant === "grid" && imageRatio === "4/3" ? styles.r43 : "",
    variant === "grid" && withExcerpt ? styles.hasExcerpt : "",
    variant === "grid" && mobileList ? styles.mobileList : "",
    variant === "row" && thumb === "lg" ? styles.thumbLg : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isLeadish = variant === "lead" || variant === "featured-wide";

  return (
    <article className={rootClass}>
      <Link
        href={href}
        className={styles.media}
        aria-hidden="true"
        tabIndex={-1}
      >
        {image && (
          <Image
            src={image.url}
            alt=""
            fill
            sizes={
              variant === "row" && thumb === "lg"
                ? "(min-width: 1024px) 132px, (min-width: 768px) 180px, 240px"
                : SIZES[variant]
            }
            priority={priority}
            unoptimized
            className={styles.img}
          />
        )}
      </Link>
      <div className={styles.body}>
        {renderKicker && <span className={styles.kicker}>{kickerText}</span>}
        <Heading className={styles.title}>
          <Link href={href}>{title}</Link>
        </Heading>
        {withExcerpt && excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        <p className={styles.meta}>
          {isLeadish && author && (
            <span
              className={
                variant === "featured-wide" ? styles.authorPart : undefined
              }
            >
              Piše {author.name} ·{" "}
            </span>
          )}
          <time dateTime={post.date}>{date}</time>
          {isLeadish && (
            <span className={variant === "lead" ? styles.readPart : undefined}>
              {" "}
              · {readMin} min čitanja
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
