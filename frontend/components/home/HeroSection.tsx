import Image from "next/image";
import Link from "next/link";
import { WP_REST_API_Post } from "@/types/wordpress";
import { transformWordPressUrl } from "@/lib/utils";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  post: WP_REST_API_Post;
}

export default function HeroSection({ post }: HeroSectionProps) {
  const featuredImage = transformWordPressUrl(
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  );
  const category = post._embedded?.["wp:term"]?.[0]?.[0];
  const author = post._embedded?.author?.[0];

  if (!featuredImage) {
    return null;
  }

  // Get excerpt or create one from content
  const excerpt = post.excerpt?.rendered
    ? post.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 200)
    : post.content?.rendered
      ? post.content.rendered.replace(/<[^>]*>/g, "").substring(0, 200)
      : "";

  const postUrl = `/${category?.slug || "uncategorized"}/${post.slug}`;

  return (
    <div className={styles.hero}>
      <div className={styles.imageContainer}>
        <Image
          src={featuredImage}
          alt={post.title?.rendered || "Featured post"}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
          unoptimized
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.contentInner}>
          {category && (
            <Link href={`/${category.slug}`} className={styles.category}>
              {category.name}
            </Link>
          )}

          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}
          />

          {excerpt && (
            <p className={styles.excerpt}>
              {excerpt}
              {excerpt.length >= 200 && "..."}
            </p>
          )}

          <div className={styles.meta}>
            {author && (
              <Link href={`/authors/${author.slug}`} className={styles.author}>
                {author.name}
              </Link>
            )}
            <span className={styles.separator}>•</span>
            <time className={styles.date}>
              {new Date(post.date).toLocaleDateString("hr-HR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          <Link href={postUrl} className={styles.readMore}>
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}
