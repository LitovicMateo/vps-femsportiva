import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Main Content Skeleton */}
          <div className={styles.mainContent}>
            {[1, 2, 3, 4, 5].map((i) => (
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
                    <div className={styles.authorMeta}>
                      <div
                        className={`${styles.avatar} ${styles.shimmer}`}
                      ></div>
                      <div className={styles.authorInfo}>
                        <div
                          className={`${styles.authorName} ${styles.shimmer}`}
                        ></div>
                        <div
                          className={`${styles.date} ${styles.shimmer}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Skeleton */}
          <aside className={styles.sidebar}>
            {/* Featured Post Section */}
            <div className={styles.sidebarSection}>
              <div className={`${styles.sidebarTitle} ${styles.shimmer}`}></div>

              <div className={styles.featuredCard}>
                <div
                  className={`${styles.featuredImage} ${styles.shimmer}`}
                ></div>
                <div className={styles.featuredContent}>
                  <div
                    className={`${styles.featuredBadge} ${styles.shimmer}`}
                  ></div>
                  <div className={styles.featuredTitle}>
                    <div
                      className={`${styles.featuredTitleLine} ${styles.shimmer}`}
                    ></div>
                    <div
                      className={`${styles.featuredTitleLine} ${styles.featuredTitleLineShort} ${styles.shimmer}`}
                    ></div>
                  </div>
                  <div className={styles.featuredMeta}>
                    <div
                      className={`${styles.featuredAvatar} ${styles.shimmer}`}
                    ></div>
                    <div className={styles.featuredAuthorInfo}>
                      <div
                        className={`${styles.featuredAuthorName} ${styles.shimmer}`}
                      ></div>
                      <div
                        className={`${styles.featuredDate} ${styles.shimmer}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
