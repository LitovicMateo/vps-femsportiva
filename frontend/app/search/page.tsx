import Link from "next/link";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import styles from "./page.module.css";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  return {
    title: query ? `Search Results for "${query}"` : "Search",
    description: query
      ? `Search results for "${query}" on My Blog`
      : "Search the blog",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const perPage = 10;

  // Validate query
  if (!query || query.trim().length < 3) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.backLink}>
              ← Back to Home
            </Link>
            <h1 className={styles.title}>Search</h1>
            <p className={styles.description}>
              Please enter at least 3 characters to search.
            </p>
          </div>
        </header>
        <Footer />
      </div>
    );
  }

  // Fetch search results from API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(query)}&type=post&page=${currentPage}&per_page=${perPage}`;

  let results: any[] = [];
  let total = 0;
  let totalPages = 0;
  let error = false;

  try {
    const response = await fetch(searchUrl, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      results = data.results || [];
      total = data.pagination?.total || 0;
      totalPages = data.pagination?.totalPages || 0;
    } else {
      error = true;
    }
  } catch (err) {
    console.error("Search error:", err);
    error = true;
  }

  // Structured data for search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `Search Results for "${query}"`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q=${encodeURIComponent(query)}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: results.map((result: any, index: number) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * perPage + index + 1,
        url: result.url,
        name: result.title,
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
            ← Back to Home
          </Link>
          <h1 className={styles.title}>
            Search Results for &quot;{query}&quot;
          </h1>
          {!error && (
            <p className={styles.resultCount}>
              {total} {total === 1 ? "result" : "results"} found
            </p>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {error ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              An error occurred while searching. Please try again.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              No posts found for &quot;{query}&quot;.
            </p>
            <p className={styles.emptySubtext}>
              Try different keywords or browse our categories.
            </p>
            <Link href="/" className={styles.homeButton}>
              Go to Home
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.resultsGrid}>
              {results.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/search?q=${encodeURIComponent(query)}`}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
