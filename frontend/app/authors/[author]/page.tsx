import { fetchPostsByAuthorAPI } from "@/lib/api";
import { fetchAuthors } from "@/lib/wordpress";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface AuthorPageProps {
  params: { author: string };
  searchParams: { page?: string };
}

// Pre-render each author archive at build time; unknown authors render on-demand.
export async function generateStaticParams() {
  const authors = await fetchAuthors().catch(() => []);
  return authors.map((author) => ({ author: author.slug }));
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await fetchPostsByAuthorAPI(resolvedParams.author, 1, 1);
  const author = data.author;

  if (!author) {
    return {
      title: "Autor nije pronađen",
    };
  }

  const description = author.description || `Objave autora ${author.name}`;

  return {
    title: `Objave autora ${author.name}`,
    description: description,
    openGraph: {
      title: `Objave autora ${author.name}`,
      description: description,
      type: "profile",
      url: `/authors/${resolvedParams.author}`,
      images: author.avatar_urls
        ? [{ url: author.avatar_urls["96"] }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `Objave autora ${author.name}`,
      description: description,
      images: author.avatar_urls ? [author.avatar_urls["96"]] : undefined,
    },
    alternates: {
      canonical: `/authors/${resolvedParams.author}`,
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
          name: "Autori",
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
            ← Povratak na Autore
          </Link>
          <div className={styles.authorInfo}>
            {author.avatar_urls && (
              <Image
                src={author.avatar_urls["96"]}
                alt={author.name}
                width={96}
                height={96}
                className={styles.avatar}
                unoptimized
              />
            )}
            <div className={styles.authorDetails}>
              <h1 className={styles.name}>{author.name}</h1>
              {author.description && (
                <p className={styles.description}>{author.description}</p>
              )}
              <p className={styles.postCount}>
                {total} {total === 1 ? "objava" : "objava"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Nema objava ovog autora.</p>
          </div>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>Objave autora {author.name}</h2>
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
