import Link from "next/link";
import ArticleCard from "@/components/post/ArticleCard";
import type { WP_REST_API_Post } from "@/types/wordpress";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  results: WP_REST_API_Post[];
  query: string;
  error?: boolean;
}

export default function SearchResults({
  results,
  query,
  error,
}: SearchResultsProps) {
  if (error) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          Došlo je do pogreške prilikom pretraživanja. Molimo pokušajte ponovno.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Nema objava za &quot;{query}&quot;.</p>
        <p className={styles.emptySubtext}>
          Pokušajte s drugim ključnim riječima ili pregledajte naše kategorije.
        </p>
        <Link href="/" className={styles.homeButton}>
          Idi na početnu
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.resultsGrid}>
      {results.map((post) => (
        <ArticleCard
          key={post.id}
          post={post}
          variant="grid"
          showExcerpt
          showKicker
          mobileList
        />
      ))}
    </div>
  );
}
