import Link from "next/link";
import PostCard from "@/components/post/PostCard";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  results: any[];
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
      {results.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
