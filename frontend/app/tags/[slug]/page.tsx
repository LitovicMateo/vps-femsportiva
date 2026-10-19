import { fetchPostsByTagAPI, fetchSiteSettingsAPI } from "@/lib/api";
import { fetchTags } from "@/lib/wordpress";
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

// Pre-render each tag archive at build time; unknown tags render on-demand.
export async function generateStaticParams() {
  const tags = await fetchTags().catch(() => []);
  return tags.map((tag) => ({ slug: tag.slug }));
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

  return (
    <div className={styles.container}>
      <StructuredData data={structuredData} />
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backLink}>
            ← Povratak na početnu
          </Link>
          <h1 className={styles.title}>{tag.name}</h1>
          {tag.description && (
            <p className={styles.description}>{tag.description}</p>
          )}
          <p className={styles.postCount}>
            {total} {total === 1 ? "objava" : "objava"}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Nema objava s ovom oznakom.</p>
          </div>
        ) : (
          <>
            <div className={styles.postsGrid}>
              {posts.map((post: WP_REST_API_Post) => (
                <ArticleCard key={post.id} post={post} variant="grid" showExcerpt showKicker mobileList />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/tags/${resolvedParams.slug}`}
            />
          </>
        )}
      </main>

    </div>
  );
}
