import { fetchPostsByAuthorAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface AuthorPageProps {
  params: { author: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await fetchPostsByAuthorAPI(resolvedParams.author, 1, 1);
  const author = data.author;

  if (!author) {
    return {
      title: "Author Not Found",
    };
  }

  const description = author.description || `Posts by ${author.name}`;

  return {
    title: `Posts by ${author.name}`,
    description: description,
    openGraph: {
      title: `Posts by ${author.name}`,
      description: description,
      type: "profile",
      url: `/authors/${resolvedParams.author}`,
      images: author.avatar_urls
        ? [{ url: author.avatar_urls["96"] }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `Posts by ${author.name}`,
      description: description,
      images: author.avatar_urls ? [author.avatar_urls["96"]] : undefined,
    },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: AuthorPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const perPage = 10;

  const data = await fetchPostsByAuthorAPI(
    resolvedParams.author,
    currentPage,
    perPage,
  );

  const author = data.author;
  const posts = data.posts || [];
  const total = data.pagination?.total || 0;
  const totalPages = data.pagination?.totalPages || 0;

  if (!author) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: author.name,
      description: author.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${resolvedParams.author}`,
      image: author.avatar_urls ? author.avatar_urls["96"] : undefined,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Authors",
          item: `${process.env.NEXT_PUBLIC_SITE_URL}/authors`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: author.name,
          item: `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${resolvedParams.author}`,
        },
      ],
    },
  };

  return (
    <div className={styles.container}>
      <StructuredData data={structuredData} />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/authors" className={styles.backLink}>
            ← Back to Authors
          </Link>
          <div className={styles.authorInfo}>
            {author.avatar_urls && (
              <img
                src={author.avatar_urls["96"]}
                alt={author.name}
                className={styles.avatar}
              />
            )}
            <div className={styles.authorDetails}>
              <h1 className={styles.name}>{author.name}</h1>
              {author.description && (
                <p className={styles.description}>{author.description}</p>
              )}
              <p className={styles.postCount}>
                {total} {total === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No posts found by this author.</p>
          </div>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>Posts by {author.name}</h2>
            <div className={styles.postsGrid}>
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/authors/${resolvedParams.author}`}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
