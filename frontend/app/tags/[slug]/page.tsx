import { fetchPostsByTagAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface TagPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await fetchPostsByTagAPI(resolvedParams.slug, 1, 1);
  const tag = data.tag;

  if (!tag) {
    return {
      title: "Tag Not Found",
    };
  }

  const description =
    tag.description || `Browse all posts tagged with ${tag.name}`;

  return {
    title: tag.name,
    description: description,
    openGraph: {
      title: tag.name,
      description: description,
      type: "website",
      url: `/tags/${resolvedParams.slug}`,
    },
    twitter: {
      card: "summary",
      title: tag.name,
      description: description,
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
    description: tag.description || `Browse all posts tagged with ${tag.name}`,
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
          name: post.title,
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
            ← Back to Home
          </Link>
          <h1 className={styles.title}>{tag.name}</h1>
          {tag.description && (
            <p className={styles.description}>{tag.description}</p>
          )}
          <p className={styles.postCount}>
            {total} {total === 1 ? "post" : "posts"}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No posts found with this tag.</p>
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
