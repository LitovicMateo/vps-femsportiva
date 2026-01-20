import Link from "next/link";
import { WP_REST_API_Post } from "@/types/wordpress";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: WP_REST_API_Post;
  featured?: boolean;
}

function slugifyAuthorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const authorData = post._embedded?.author?.[0];
  const author = authorData?.name || "Unknown";
  const authorSlug = authorData?.slug || slugifyAuthorName(author);
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const title = post.title?.rendered || `Post ${post.id}`;
  const excerpt = post.excerpt?.rendered || "";
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const primaryCategory = categories[0];

  // Get category slug for URL
  const categorySlug = primaryCategory?.slug || "uncategorized";

  // Get top 3 tags sorted by post count
  const allTags = post._embedded?.["wp:term"]?.[1] || [];
  const topTags = allTags
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 3);

  if (featured) {
    return (
      <article className={`${styles.postCard} ${styles.featured}`}>
        {featuredImage && (
          <div className={styles.featuredImage}>
            <img src={featuredImage} alt={title} />
          </div>
        )}
        <div className={styles.featuredContent}>
          {primaryCategory && (
            <Link href={`/${categorySlug}`} className={styles.category}>
              {primaryCategory.name}
            </Link>
          )}
          <Link href={`/${categorySlug}/${post.slug}`}>
            <h2
              className={styles.featuredTitle}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>
          <div
            className={`${styles.excerpt} line-clamp-3`}
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
          <div className={styles.meta}>
            {authorData ? (
              <Link
                href={`/authors/${authorSlug}`}
                className={styles.authorLink}
              >
                {author}
              </Link>
            ) : (
              <span>{author}</span>
            )}
            <span>•</span>
            <time dateTime={post.date}>{date}</time>
          </div>
          {topTags.length > 0 && (
            <div className={styles.tags}>
              {topTags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className={styles.tag}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.postCard} ${styles.regular}`}>
      <div className={styles.regularContent}>
        {featuredImage && (
          <Link
            href={`/${categorySlug}/${post.slug}`}
            className={styles.thumbnail}
          >
            <img src={featuredImage} alt={title} />
          </Link>
        )}
        <div className={styles.regularBody}>
          {primaryCategory && (
            <Link href={`/${categorySlug}`} className={styles.categorySmall}>
              {primaryCategory.name}
            </Link>
          )}
          <Link href={`/${categorySlug}/${post.slug}`}>
            <h3
              className={styles.regularTitle}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>
          <div className={styles.meta}>
            {authorData ? (
              <Link
                href={`/authors/${authorSlug}`}
                className={styles.authorLink}
              >
                {author}
              </Link>
            ) : (
              <span>{author}</span>
            )}
            <span>•</span>
            <time dateTime={post.date}>{date}</time>
          </div>
          {topTags.length > 0 && (
            <div className={styles.tags}>
              {topTags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className={styles.tag}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
