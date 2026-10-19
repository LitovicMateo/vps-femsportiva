import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function hrefFor(basePath: string, page: number): string {
  if (page === 1) return basePath;
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}page=${page}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "gap")[] = [];
  const add = (p: number | "gap") => {
    if (p === "gap" && pages[pages.length - 1] === "gap") return;
    if (p !== "gap" && pages.includes(p)) return;
    pages.push(p);
  };

  add(1);
  if (currentPage - 1 > 2) add("gap");
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    add(i);
  }
  if (currentPage + 1 < totalPages - 1) add("gap");
  add(totalPages);

  return (
    <nav className={styles.pagination} aria-label="Stranice">
      {currentPage > 1 && (
        <Link
          href={hrefFor(basePath, currentPage - 1)}
          className={`${styles.pill} ${styles.step}`}
          rel="prev"
        >
          ← Prethodna
        </Link>
      )}

      <div className={styles.pages}>
        {pages.map((page, index) => {
          if (page === "gap") {
            return (
              <span
                key={`gap-${index}`}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={hrefFor(basePath, page)}
              className={`${styles.pageButton} ${
                isActive ? styles.active : styles.inactive
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Stranica ${page}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages && (
        <>
          <Link
            href={hrefFor(basePath, currentPage + 1)}
            className={`${styles.pill} ${styles.step}`}
            rel="next"
          >
            Sljedeća →
          </Link>
          <Link
            href={hrefFor(basePath, currentPage + 1)}
            className={styles.loadMore}
          >
            Učitaj još članaka
          </Link>
        </>
      )}
    </nav>
  );
}
