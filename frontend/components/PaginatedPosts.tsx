"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import styles from "@/app/page.module.css";

interface PaginatedPostsProps {
  posts: any[];
  perPage?: number;
  scrollToId?: string;
}

export default function PaginatedPosts({
  posts,
  perPage = 5,
  scrollToId = "recent-news",
}: PaginatedPostsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to the section when page changes
  useEffect(() => {
    if (currentPage > 1) {
      const element = document.getElementById(scrollToId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentPage, scrollToId]);

  const totalPages = Math.ceil(posts.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const rangeStart = Math.max(2, currentPage - 1);
      const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (rangeStart > 2) {
        pages.push("...");
      }

      // Add pages around current page
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (rangeEnd < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={styles.mainContent}>
      {currentPosts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}

      {totalPages > 1 && (
        <nav className={styles.pagination}>
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={styles.paginationButton}
            aria-label="Previous page"
          >
            <span>‹</span>
          </button>

          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => handlePageClick(page)}
                className={`${styles.paginationButton} ${
                  currentPage === page ? styles.paginationButtonActive : ""
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ) : (
              <span key={index} className={styles.paginationEllipsis}>
                {page}
              </span>
            ),
          )}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
            aria-label="Next page"
          >
            <span>›</span>
          </button>
        </nav>
      )}
    </div>
  );
}
