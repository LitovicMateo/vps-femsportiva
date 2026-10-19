import {
  fetchPostBySlugAPI,
  fetchPostsAPI,
  fetchSiteSettingsAPI,
} from "@/lib/api";
import { fetchPosts } from "@/lib/wordpress";
import ArticleCard from "@/components/post/ArticleCard";
import SectionHeading from "@/components/post/SectionHeading";
import AuthorBox from "@/components/author/AuthorBox";
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
import {
  formatDateHr,
  getAuthor,
  getFeaturedImage,
  getTags,
  stripHtml,
} from "@/lib/format";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  DEFAULT_OG_IMAGE,
  PUBLISHER_LOGO,
  absoluteUrl,
  breadcrumbJsonLd,
  ogImageUrl,
  truncate,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";
import type { Metadata } from "next";
import type { WP_REST_API_Post } from "@/types/wordpress";

function excerptText(html: string | undefined): string {
  return stripHtml(html)
    .replace(/\s*\[(?:…|&hellip;|\.\.\.)\]\s*$/, "")
    .trim();
}

interface PostPageProps {
  params: Promise<{ category: string; slug: string }>;
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
  const [post, settings]: [
    WP_REST_API_Post | null,
    Awaited<ReturnType<typeof fetchSiteSettingsAPI>>,
  ] = await Promise.all([
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
    (cat) => cat.slug === resolvedParams.category,
  );
  const author = post._embedded?.author?.[0];
  const featuredImage = transformWordPressUrl(
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  );

  const description = truncate(excerptText(post.excerpt?.rendered), 160);
  const cleanTitle = stripHtml(post.title.rendered);

  // Featured image when present, otherwise a branded generated card
  const siteName = settings?.siteTitle || SITE_NAME;
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const fallbackImage = ogImageUrl({
    title: cleanTitle,
    type: "post",
    category: postCategory?.name ? stripHtml(postCategory.name) : undefined,
    author: author?.name,
    siteName,
  });
  const ogImage = featuredImage
    ? {
        url: featuredImage,
        width: media?.media_details?.width,
        height: media?.media_details?.height,
        alt: media?.alt_text || cleanTitle,
      }
    : { url: fallbackImage, width: 1200, height: 630, alt: cleanTitle };

  return {
    title: cleanTitle,
    description: description,
    keywords: categories.map((cat) => cat.name),
    authors: author ? [{ name: author.name }] : undefined,
    openGraph: {
      title: cleanTitle,
      description: description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: author ? [author.name] : undefined,
      tags: categories.map((cat) => cat.name),
      images: [ogImage],
      url: `/${resolvedParams.category}/${resolvedParams.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: `/${resolvedParams.category}/${resolvedParams.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post: WP_REST_API_Post | null = await fetchPostBySlugAPI(
    resolvedParams.slug,
  );

  if (!post) {
    notFound();
  }

  // Verify the post is in the correct category
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const postCategory = categories.find(
    (cat) => cat.slug === resolvedParams.category,
  );

  if (!postCategory) {
    notFound();
  }

  const author = getAuthor(post);
  const image = getFeaturedImage(post);
  const featuredImage = image?.url;
  const tags = getTags(post);
  const readingTime = calculateReadingTime(post.content.rendered);
  const viewCount = post.view_count || 0;
  const date = formatDateHr(post.date);
  const categoryName = stripHtml(postCategory.name);
  const categoryHref = `/${resolvedParams.category}`;

  // Standfirst: the excerpt without the trailing "[…]"
  const standfirst = excerptText(post.excerpt?.rendered);

  // Related: recent posts from the same category
  const relatedData = await fetchPostsAPI({
    categories: postCategory.id,
    perPage: 4,
  });
  const relatedPosts = ((relatedData.posts || []) as WP_REST_API_Post[])
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const postPath = `/${resolvedParams.category}/${resolvedParams.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: stripHtml(post.title.rendered),
        description: standfirst || undefined,
        image: [featuredImage || absoluteUrl(DEFAULT_OG_IMAGE)],
        datePublished: post.date,
        dateModified: post.modified,
        inLanguage: "hr",
        articleSection: categoryName,
        author: author
          ? {
              "@type": "Person",
              name: author.name,
              url: absoluteUrl(`/authors/${author.slug}`),
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl(PUBLISHER_LOGO),
            width: 512,
            height: 512,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": absoluteUrl(postPath),
        },
        keywords: tags.length
          ? tags.map((t) => t.name).join(", ")
          : categoryName,
      },
      breadcrumbJsonLd([
        { name: "Naslovnica", path: "/" },
        { name: categoryName, path: categoryHref },
        { name: stripHtml(post.title.rendered), path: postPath },
      ]),
    ],
  };

  // Build full URL for sharing
  const fullUrl = absoluteUrl(postPath);
  const shareTitle = stripHtml(post.title.rendered);

  return (
    <main className={styles.main}>
      <StructuredData data={structuredData} />
      <ViewCounter key={post.id} postId={post.id} slug={post.slug} />

      <article className={styles.article}>
        <header className={styles.header}>
          <nav aria-label="Putanja" className={styles.breadcrumb}>
            <Link href="/" className={styles.crumbHome}>
              Naslovnica
            </Link>
            <span aria-hidden="true" className={styles.crumbSep}>
              {" "}
              /{" "}
            </span>
            <Link href={categoryHref} className={styles.crumbCategory}>
              {categoryName}
            </Link>
          </nav>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          {author && (
            <div className={styles.byline}>
              <Link
                href={`/authors/${author.slug}`}
                className={styles.avatar}
                aria-hidden="true"
                tabIndex={-1}
              >
                {author.avatar && (
                  <Image
                    src={author.avatar}
                    alt=""
                    fill
                    sizes="44px"
                    unoptimized
                    className={styles.avatarImg}
                  />
                )}
              </Link>
              <div className={styles.bylineText}>
                <Link
                  href={`/authors/${author.slug}`}
                  className={styles.authorName}
                >
                  {author.name}
                </Link>
                <span className={styles.meta}>
                  <time dateTime={post.date}>{date}</time> · {readingTime} min
                  čitanja
                  {viewCount > 0 && (
                    <span className={styles.views}>
                      {" "}
                      · {formatCompactNumber(viewCount)} pregleda
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </header>

        {image && (
          <figure className={styles.figure}>
            <div className={styles.imageWrap}>
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1264px) 1200px, 100vw"
                priority
                unoptimized
                className={styles.image}
              />
            </div>
            {image.caption && (
              <figcaption className={styles.caption}>
                {image.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className={styles.body}>
          <ShareButtons title={shareTitle} url={fullUrl} variant="inline" />

          <PostContent key={post.id} content={post.content.rendered} />

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className={styles.tag}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <ShareButtons title={shareTitle} url={fullUrl} variant="grid" />

          {author && (
            <AuthorBox
              variant="article"
              author={{
                name: author.name,
                slug: author.slug,
                description: author.description,
                avatar: author.avatar,
              }}
            />
          )}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <SectionHeading title="Povezani članci" id="related-title" />
          {/* One set per breakpoint; the others are display:none */}
          <div className={styles.relatedGrid}>
            {relatedPosts.map((p) => (
              <ArticleCard key={p.id} post={p} variant="grid" />
            ))}
          </div>
          <div className={styles.relatedList}>
            {relatedPosts.map((p) => (
              <ArticleCard key={p.id} post={p} variant="list" />
            ))}
          </div>
          {/* Tablet rows */}
          <div className={styles.relatedRows}>
            {relatedPosts.map((p) => (
              <ArticleCard
                key={p.id}
                post={p}
                variant="row"
                thumb="lg"
                showKicker
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
