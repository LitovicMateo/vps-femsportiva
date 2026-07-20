import { fetchPostBySlugAPI, fetchPostsAPI, fetchSiteSettingsAPI } from "@/lib/api";
import { fetchPosts } from "@/lib/wordpress";
import PostCard from "@/components/post/PostCard";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import PostContent from "@/components/post/PostContent";
import ShareButtons from "@/components/post/ShareButtons";
import ViewCounter from "@/components/post/ViewCounter";
import {
  calculateReadingTime,
  formatCompactNumber,
  getPrimaryCategorySlug,
  transformWordPressUrl,
} from "@/lib/utils";
import { FaClock, FaEye } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface PostPageProps {
  params: { category: string; slug: string };
}

// Pre-render the most recent posts (bounded to the latest 100) at build time;
// older posts render on-demand via ISR. Category segment matches the embedded
// primary term, same as the sitemap and the runtime route.
export async function generateStaticParams() {
  const { posts } = await fetchPosts({ perPage: 100 }).catch(() => ({
    posts: [],
    total: 0,
    totalPages: 0,
  }));
  return posts.map((post) => ({
    category: getPrimaryCategorySlug(post),
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [post, settings] = await Promise.all([
    fetchPostBySlugAPI(resolvedParams.slug),
    fetchSiteSettingsAPI(),
  ]);

  if (!post) {
    return {
      title: "Objava nije pronađena",
    };
  }

  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const postCategory = categories.find(
    (cat: any) => cat.slug === resolvedParams.category,
  );
  const author = post._embedded?.author?.[0];
  const featuredImage = transformWordPressUrl(
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  );

  // Extract plain text from HTML content for description
  const plainText = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
  const description =
    plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");

  // Generate dynamic OG image URL
  const siteName = settings?.siteTitle || "FEM Sportiva";
  const ogImageUrl = `/api/og?title=${encodeURIComponent(post.title.rendered)}&category=${encodeURIComponent(postCategory?.name || "")}&author=${encodeURIComponent(author?.name || "")}&type=post&siteName=${encodeURIComponent(siteName)}`;

  return {
    title: post.title.rendered,
    description: description,
    keywords: categories.map((cat: any) => cat.name),
    authors: author ? [{ name: author.name }] : undefined,
    openGraph: {
      title: post.title.rendered,
      description: description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: author ? [author.name] : undefined,
      tags: categories.map((cat: any) => cat.name),
      images: featuredImage ? [{ url: featuredImage }] : [{ url: ogImageUrl }],
      url: `/${resolvedParams.category}/${resolvedParams.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
      description: description,
      images: featuredImage ? [featuredImage] : [ogImageUrl],
    },
    alternates: {
      canonical: `/${resolvedParams.category}/${resolvedParams.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await fetchPostBySlugAPI(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Verify the post is in the correct category
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const postCategory = categories.find(
    (cat: any) => cat.slug === resolvedParams.category,
  );

  if (!postCategory) {
    notFound();
  }

  const author = post._embedded?.author?.[0];
  const featuredImage = transformWordPressUrl(
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  );
  const tags = post.tags || [];

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content.rendered);

  // Get view count
  const viewCount = post.view_count || 0;

  // Fetch related posts based on tags
  // For now, just fetch recent posts from same category
  const relatedData = await fetchPostsAPI({
    categories: postCategory.id,
    perPage: 4,
  });
  const relatedPosts = (relatedData.posts || [])
    .filter((p: any) => p.id !== post.id)
    .slice(0, 3);

  const date = new Date(post.date).toLocaleDateString("hr-HR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, "").trim(),
    image: featuredImage || undefined,
    datePublished: post.date,
    dateModified: post.modified,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${author.slug}`,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "FEM Sportiva",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo_light.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/${resolvedParams.category}/${resolvedParams.slug}`,
    },
    keywords: categories.map((cat: any) => cat.name).join(", "),
  };

  // Build full URL for sharing
  const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${resolvedParams.category}/${resolvedParams.slug}`;

  return (
    <div className={styles.container}>
      <StructuredData data={structuredData} />
      <ViewCounter postId={post.id} slug={post.slug} />
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            href={`/${resolvedParams.category}`}
            className={styles.backLink}
          >
            ← Povratak na {postCategory.name}
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {/* Article Header */}
        <article className={styles.article}>
          {featuredImage && (
            <div className={styles.featuredImage}>
              <Image
                src={featuredImage}
                alt={post.title.rendered}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                priority
                unoptimized
              />
            </div>
          )}

          <div className={styles.content}>
            {/* Category Badge */}
            <Link
              href={`/${resolvedParams.category}`}
              className={styles.categoryBadge}
            >
              {postCategory.name}
            </Link>

            {/* Title */}
            <h1
              className={styles.title}
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Meta */}
            <div className={styles.meta}>
              {author && (
                <div className={styles.authorInfo}>
                  {author.avatar_urls && (
                    <Link href={`/authors/${author.slug}`}>
                      <Image
                        src={author.avatar_urls["48"]}
                        alt={author.name}
                        width={48}
                        height={48}
                        className={styles.avatar}
                        unoptimized
                      />
                    </Link>
                  )}
                  <div>
                    <Link
                      href={`/authors/${author.slug}`}
                      className={styles.authorLink}
                    >
                      <p className={styles.authorName}>{author.name}</p>
                    </Link>
                    <div className={styles.postMeta}>
                      <time dateTime={post.date} className={styles.date}>
                        {date}
                      </time>
                      <span>•</span>
                      <span className={styles.readingTime}>
                        <FaClock /> {readingTime} min čitanja
                      </span>
                      {viewCount > 0 && (
                        <>
                          <span>•</span>
                          <span className={styles.viewCount}>
                            <FaEye /> {formatCompactNumber(viewCount)} pregleda
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <PostContent content={post.content.rendered} />

            {/* Share Buttons */}
            <ShareButtons title={post.title.rendered} url={fullUrl} />

            {/* Tags */}
            {post._embedded?.["wp:term"]?.[1] &&
              post._embedded["wp:term"][1].length > 0 && (
                <div className={styles.tags}>
                  <h3 className={styles.tagsTitle}>Oznake</h3>
                  <div className={styles.tagsList}>
                    {post._embedded["wp:term"][1].map((tag: any) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className={styles.tag}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Povezane Objave</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((relatedPost: any) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
