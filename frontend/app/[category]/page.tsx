import type { WP_REST_API_Post } from "@/types/wordpress";
import { fetchPostsByCategoryAPI, fetchSiteSettingsAPI } from "@/lib/api";
import ArticleCard from "@/components/post/ArticleCard";
import { stripHtml } from "@/lib/format";
import Pagination from "@/components/ui/Pagination";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  ogImageUrl,
  paginatedPath,
  truncate,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const pageNum = Math.max(
    1,
    parseInt(resolvedSearchParams.page ?? "1", 10) || 1,
  );
  const [data, settings] = await Promise.all([
    fetchPostsByCategoryAPI(resolvedParams.category, 1, 1),
    fetchSiteSettingsAPI(),
  ]);
  const category = data.category;

  if (!category) {
    return {
      title: "Kategorija nije pronađena",
    };
  }

  const description = truncate(
    stripHtml(category.description) ||
      `Najnovije vijesti, izvještaji i priče iz kategorije ${category.name}: sve što trebate znati o ženskom sportu na jednom mjestu.`,
  );
  const pageTitle =
    pageNum > 1 ? `${category.name} – stranica ${pageNum}` : category.name;
  const canonical = paginatedPath(`/${resolvedParams.category}`, pageNum);
  const ogImage = ogImageUrl({
    type: "category",
    title: stripHtml(category.name),
    subtitle: description,
    siteName: settings.siteTitle || SITE_NAME,
  });

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      type: "website",
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description,
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(
    1,
    parseInt(resolvedSearchParams.page ?? "1", 10) || 1,
  );
  const perPage = 10;

  const data = await fetchPostsByCategoryAPI(
    resolvedParams.category,
    currentPage,
    perPage,
  );

  const posts = data.posts || [];
  const category = data.category;
  const total = data.pagination?.total || 0;
  const totalPages = data.pagination?.totalPages || 0;

  if (!category) {
    notFound();
  }
  if (totalPages > 0 && currentPage > totalPages) {
    notFound();
  }

  const categoryName = stripHtml(category.name);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: categoryName,
        description:
          stripHtml(category.description) ||
          `Najnovije vijesti, izvještaji i priče iz kategorije ${categoryName}.`,
        url: absoluteUrl(paginatedPath(`/${resolvedParams.category}`, currentPage)),
        inLanguage: "hr",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: total,
          itemListElement: posts.map(
            (post: WP_REST_API_Post, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/${resolvedParams.category}/${post.slug}`),
              name: stripHtml(post.title?.rendered),
            }),
          ),
        },
      },
      breadcrumbJsonLd([
        { name: "Naslovnica", path: "/" },
        { name: categoryName, path: `/${resolvedParams.category}` },
      ]),
    ],
  };

  const description = stripHtml(category.description);
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
          <span aria-current="page">{category.name}</span>
        </nav>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{category.name}</h1>
          <p className={styles.count}>{pluralArticles(total)}</p>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nema članaka u ovoj kategoriji.</p>
      ) : (
        <>
          {featured && (
            <ArticleCard
              post={featured}
              variant="featured-wide"
              kicker="Najnovije u kategoriji"
              headingLevel="h2"
              showExcerpt
              priority
            />
          )}
          {gridPosts.length > 0 && (
            <section
              aria-label="Članci iz kategorije"
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
            basePath={`/${resolvedParams.category}`}
          />
        </>
      )}
    </main>
  );
}
