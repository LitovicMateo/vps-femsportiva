import { fetchPostsByCategoryAPI } from "@/lib/api";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await fetchPostsByCategoryAPI(resolvedParams.category, 1, 1);
  const category = data.category;

  if (!category) {
    return {
      title: "Kategorija nije pronađena",
    };
  }

  const description =
    category.description ||
    `Pregledajte sve objave u kategoriji ${category.name}`;

  return {
    title: category.name,
    description: description,
    openGraph: {
      title: category.name,
      description: description,
      type: "website",
      url: `/${resolvedParams.category}`,
    },
    twitter: {
      card: "summary",
      title: category.name,
      description: description,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1");
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description:
      category.description ||
      `Pregledajte sve objave u kategoriji ${category.name}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${resolvedParams.category}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: posts.map((post: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/${resolvedParams.category}/${post.slug}`,
        name: post.title,
      })),
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
          <h1 className={styles.title}>{category.name}</h1>
          {category.description && (
            <p className={styles.description}>{category.description}</p>
          )}
          <p className={styles.postCount}>
            {total} {total === 1 ? "objava" : "objava"}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Nema objava u ovoj kategoriji.</p>
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
              basePath={`/${resolvedParams.category}`}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
