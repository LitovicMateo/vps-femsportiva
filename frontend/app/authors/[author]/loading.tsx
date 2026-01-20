import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={`${styles.backLinkSkeleton} ${styles.shimmer}`}></div>

          {/* Author Card Skeleton */}
          <div className={styles.authorCard}>
            <div className={`${styles.authorAvatar} ${styles.shimmer}`}></div>
            <div className={styles.authorDetails}>
              <div className={`${styles.authorName} ${styles.shimmer}`}></div>
              <div className={`${styles.authorBio} ${styles.shimmer}`}></div>
              <div
                className={`${styles.authorBio} ${styles.authorBioShort} ${styles.shimmer}`}
              ></div>
            </div>
          </div>

          <div
            className={`${styles.postCountSkeleton} ${styles.shimmer}`}
          ></div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Posts Grid Skeleton */}
        <div className={styles.postsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.postCard}>
              {/* Featured Image */}
              <div className={`${styles.postImage} ${styles.shimmer}`}></div>

              {/* Content */}
              <div className={styles.postContent}>
                {/* Category Badge */}
                <div
                  className={`${styles.categoryBadge} ${styles.shimmer}`}
                ></div>

                {/* Title */}
                <div className={styles.postTitle}>
                  <div
                    className={`${styles.titleLine} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.titleLine} ${styles.titleLineShort} ${styles.shimmer}`}
                  ></div>
                </div>

                {/* Excerpt */}
                <div className={styles.excerpt}>
                  <div
                    className={`${styles.excerptLine} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.excerptLine} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.excerptLine} ${styles.excerptLineShort} ${styles.shimmer}`}
                  ></div>
                </div>

                {/* Meta */}
                <div className={styles.postMeta}>
                  <div className={`${styles.date} ${styles.shimmer}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className={styles.pagination}>
          <div className={`${styles.paginationButton} ${styles.shimmer}`}></div>
          <div className={`${styles.paginationButton} ${styles.shimmer}`}></div>
          <div className={`${styles.paginationButton} ${styles.shimmer}`}></div>
        </div>
      </main>
    </div>
  );
}
