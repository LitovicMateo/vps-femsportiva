import { fetchPostsByTagAPI, fetchSiteSettingsAPI } from "@/lib/api";
import { fetchTags } from "@/lib/wordpress";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface TagPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

// Pre-render each tag archive at build time; unknown tags render on-demand.
export async function generateStaticParams() {
  const tags = await fetchTags().catch(() => []);
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
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

  const description =
    tag.description || `Pregledajte sve objave označene sa ${tag.name}`;
  const siteName = settings.siteTitle || "FEM Sportiva";
  const ogImageUrl = `/api/og?type=category&title=${encodeURIComponent(tag.name)}&subtitle=${encodeURIComponent(description)}&siteName=${encodeURIComponent(siteName)}`;

  return {
    title: tag.name,
    description: description,
    openGraph: {
      title: tag.name,
      description: description,
      type: "website",
      url: `/tags/${resolvedParams.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tag.name,
      description: description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `/tags/${resolvedParams.slug}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1");
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tag.name,
    description:
      tag.description || `Pregledajte sve objave označene sa ${tag.name}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tags/${resolvedParams.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: posts.map((post: any, index: number) => {
        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const primaryCategory = categories[0];
        const categorySlug = primaryCategory?.slug || "uncategorized";

        return {
          "@type": "ListItem",
          position: index + 1,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${categorySlug}/${post.slug}`,
          name: post.title?.rendered || "",
        };
      }),
    },
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
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
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

      <Footer />
    </div>
  );
}
