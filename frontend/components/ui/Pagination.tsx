import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    if (i === 2 && currentPage > 3) {
      pages.push("...");
    }
    pages.push(i);
    if (i === totalPages - 1 && currentPage < totalPages - 2) {
      pages.push("...");
    }
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  // Remove duplicates and ellipsis next to each other
  const uniquePages = pages.filter((page, index) => {
    if (page === "...") {
      return pages[index - 1] !== "..." && pages[index + 1] !== "...";
    }
    return pages.indexOf(page) === index;
  });

  return (
    <nav className={styles.pagination}>
      {currentPage > 1 && (
        <Link
          href={`${basePath}${
            currentPage === 2 ? "" : `?page=${currentPage - 1}`
          }`}
          className={styles.button}
        >
          Prethodna
        </Link>
      )}

      <div className={styles.pages}>
        {uniquePages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={`${basePath}${pageNum === 1 ? "" : `?page=${pageNum}`}`}
              className={`${styles.pageButton} ${
                isActive ? styles.active : styles.inactive
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className={styles.button}
        >
          Sljedeća
        </Link>
      )}
    </nav>
  );
}
