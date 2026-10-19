import { fetchPostsByAuthorAPI } from "@/lib/api";
import ArticleCard from "@/components/post/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { WP_REST_API_Post } from "@/types/wordpress";
import {
  absoluteUrl,
  paginatedPath,
  truncate,
} from "@/lib/seo";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface AuthorPageProps {
  params: Promise<{ author: string }>;
  searchParams: Promise<{ page?: string }>;
}

function parsePage(value: string | undefined): number {
  return Math.max(1, parseInt(value ?? "1", 10) || 1);
}

export async function generateMetadata({
  params,
  searchParams,
}: AuthorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pageNum = parsePage((await searchParams).page);
  const data = await fetchPostsByAuthorAPI(resolvedParams.author, 1, 1);
  const author = data.author;

  if (!author) {
    return {
      title: "Autor nije pronađen",
    };
  }

  const description = truncate(
    author.description ||
      `Svi članci autora ${author.name} na Femsportivi: vijesti, priče i analize iz ženskog sporta.`,
  );
  const title =
    pageNum > 1
      ? `Objave autora ${author.name} – stranica ${pageNum}`
      : `Objave autora ${author.name}`;
  const canonical = paginatedPath(`/authors/${resolvedParams.author}`, pageNum);

  return {
    title,
    description: description,
    openGraph: {
      title,
      description: description,
      type: "profile",
      url: canonical,
      images: author.avatar_urls
        ? [{ url: author.avatar_urls["96"] }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description: description,
      images: author.avatar_urls ? [author.avatar_urls["96"]] : undefined,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: AuthorPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePage(resolvedSearchParams.page);
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
      url: absoluteUrl(`/authors/${resolvedParams.author}`),
      image: author.avatar_urls ? author.avatar_urls["96"] : undefined,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Autori",
          item: absoluteUrl("/authors"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: author.name,
          item: absoluteUrl(`/authors/${resolvedParams.author}`),
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
              {posts.map((post: WP_REST_API_Post) => (
                <ArticleCard key={post.id} post={post} variant="grid" showExcerpt showKicker mobileList />
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

    </div>
  );
}
