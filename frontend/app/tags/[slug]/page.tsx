import { fetchPostsByTagAPI, fetchSiteSettingsAPI } from "@/lib/api";
import ArticleCard from "@/components/post/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrimaryCategorySlug } from "@/lib/utils";
import type { WP_REST_API_Post } from "@/types/wordpress";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  ogImageUrl,
  paginatedPath,
  truncate,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { stripHtml } from "@/lib/format";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function parsePage(value: string | undefined): number {
  return Math.max(1, parseInt(value ?? "1", 10) || 1);
}

export async function generateMetadata({
  params,
  searchParams,
}: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pageNum = parsePage((await searchParams).page);
  const [data, settings] = await Promise.all([
    fetchPostsByTagAPI(resolvedParams.slug, 1, 1),
    fetchSiteSettingsAPI(),
  ]);
  const tag = data.tag;

  if (!tag) {
    return {
      title: "Oznaka nije pronađena",
    };
  }

  const description = truncate(
    stripHtml(tag.description) ||
      `Sve objave označene oznakom ${tag.name}: vijesti, priče i analize iz ženskog sporta.`,
  );
  const tagName = stripHtml(tag.name);
  const pageTitle = pageNum > 1 ? `${tagName} – stranica ${pageNum}` : tagName;
  const canonical = paginatedPath(`/tags/${resolvedParams.slug}`, pageNum);
  const ogImage = ogImageUrl({
    type: "category",
    title: tagName,
    subtitle: description,
    siteName: settings.siteTitle || SITE_NAME,
  });

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

function pluralArticles(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${n} članaka`;
  if (mod10 === 1) return `${n} članak`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} članka`;
  return `${n} članaka`;
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePage(resolvedSearchParams.page);
  const perPage = 10;

  const data = await fetchPostsByTagAPI(
    resolvedParams.slug,
    currentPage,
    perPage,
  );

  const posts = data.posts || [];
  const tag = data.tag;
  const total = data.pagination?.total || 0;
  const totalPages = data.pagination?.totalPages || 0;

  if (!tag) {
    notFound();
  }
  if (totalPages > 0 && currentPage > totalPages) {
    notFound();
  }

  const tagName = stripHtml(tag.name);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: tagName,
        description:
          stripHtml(tag.description) ||
          `Sve objave označene oznakom ${tagName}.`,
        url: absoluteUrl(paginatedPath(`/tags/${resolvedParams.slug}`, currentPage)),
        inLanguage: "hr",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: total,
          itemListElement: posts.map(
            (post: WP_REST_API_Post, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/${getPrimaryCategorySlug(post)}/${post.slug}`),
              name: stripHtml(post.title?.rendered),
            }),
          ),
        },
      },
      breadcrumbJsonLd([
        { name: "Naslovnica", path: "/" },
        { name: tagName, path: `/tags/${resolvedParams.slug}` },
      ]),
    ],
  };

  const description = stripHtml(tag.description);
  const showFeatured = currentPage === 1 && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const gridPosts = showFeatured ? posts.slice(1) : posts;

  return (
    <main className={styles.main}>
      <StructuredData data={structuredData} />
      <header className={styles.header}>
        <nav aria-label="Putanja" className={styles.breadcrumb}>
          <Link href="/">Naslovnica</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{tag.name}</span>
        </nav>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{tag.name}</h1>
          <p className={styles.count}>{pluralArticles(total)}</p>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nema članaka s ovom oznakom.</p>
      ) : (
        <>
          {featured && (
            <ArticleCard
              post={featured}
              variant="featured-wide"
              kicker="Najnovije s ovom oznakom"
              headingLevel="h2"
              showExcerpt
              priority
            />
          )}
          {gridPosts.length > 0 && (
            <section
              aria-label="Članci s oznakom"
              className={`${styles.grid} ${featured ? styles.gridAfterFeatured : ""}`}
            >
              {gridPosts.map((post: WP_REST_API_Post) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  variant="grid"
                  headingLevel="h2"
                  showExcerpt
                  showKicker={false}
                  imageRatio="16/10"
                  mobileList
                />
              ))}
            </section>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/tags/${resolvedParams.slug}`}
          />
        </>
      )}
    </main>
  );
}
