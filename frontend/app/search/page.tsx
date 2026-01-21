import Pagination from "@/components/ui/Pagination";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import SearchHeader from "@/components/search/SearchHeader";
import SearchResults from "@/components/search/SearchResults";
import Link from "next/link";
import styles from "./page.module.css";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  return {
    title: query ? `Rezultati pretraživanja za "${query}"` : "Pretraživanje",
    description: query
      ? `Rezultati pretraživanja za "${query}" na Mojem Blogu`
      : "Pretraži blog",
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
              ← Povratak na početnu
            </Link>
            <h1 className={styles.title}>Pretraživanje</h1>
            <p className={styles.description}>
              Molimo unesite najmanje 3 znaka za pretraživanje.
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

      <SearchHeader query={query} total={total} error={error} />

      <main className={styles.main}>
        <SearchResults results={results} query={query} error={error} />

        {!error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/search?q=${encodeURIComponent(query)}`}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
