import Link from "next/link";
import styles from "./SearchHeader.module.css";

interface SearchHeaderProps {
  query: string;
  total?: number;
  error?: boolean;
}

export default function SearchHeader({
  query,
  total,
  error,
}: SearchHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.backLink}>
          ← Povratak na početnu
        </Link>
        <h1 className={styles.title}>
          Rezultati pretraživanja za &quot;{query}&quot;
        </h1>
        {!error && total !== undefined && (
          <p className={styles.resultCount}>
            {total} {total === 1 ? "rezultat" : "rezultata"} pronađeno
          </p>
        )}
      </div>
    </header>
  );
}
