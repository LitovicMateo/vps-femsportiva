import styles from "./loading.module.css";
import Link from "next/link";

export default function Loading() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.backLinkSkeleton}></div>
        </div>
      </header>

      <main className={styles.main}>
        <article className={styles.article}>
          {/* Featured Image Skeleton */}
          <div className={styles.featuredImageSkeleton}>
            <div className={styles.shimmer}></div>
          </div>

          <div className={styles.content}>
            {/* Category Badge Skeleton */}
            <div className={styles.categoryBadgeSkeleton}>
              <div className={styles.shimmer}></div>
            </div>

            {/* Title Skeleton */}
            <div className={styles.titleSkeleton}>
              <div className={`${styles.titleLine} ${styles.shimmer}`}></div>
              <div
                className={`${styles.titleLine} ${styles.titleLineShort} ${styles.shimmer}`}
              ></div>
            </div>

            {/* Meta Skeleton */}
            <div className={styles.metaSkeleton}>
              <div className={styles.authorInfoSkeleton}>
                <div
                  className={`${styles.avatarSkeleton} ${styles.shimmer}`}
                ></div>
                <div className={styles.authorDetailsSkeleton}>
                  <div
                    className={`${styles.authorNameSkeleton} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.dateSkeleton} ${styles.shimmer}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className={styles.contentSkeleton}>
              {/* Simulate paragraphs */}
              <div className={styles.paragraphSkeleton}>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div
                  className={`${styles.line} ${styles.lineShort} ${styles.shimmer}`}
                ></div>
              </div>

              <div className={styles.paragraphSkeleton}>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
              </div>

              <div className={styles.paragraphSkeleton}>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div
                  className={`${styles.line} ${styles.lineShort} ${styles.shimmer}`}
                ></div>
              </div>

              <div className={styles.paragraphSkeleton}>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div className={`${styles.line} ${styles.shimmer}`}></div>
                <div
                  className={`${styles.line} ${styles.lineShort} ${styles.shimmer}`}
                ></div>
              </div>
            </div>

            {/* Share Buttons Skeleton */}
            <div className={styles.shareButtonsSkeleton}>
              <div className={`${styles.shareButton} ${styles.shimmer}`}></div>
              <div className={`${styles.shareButton} ${styles.shimmer}`}></div>
              <div className={`${styles.shareButton} ${styles.shimmer}`}></div>
              <div className={`${styles.shareButton} ${styles.shimmer}`}></div>
            </div>
          </div>
        </article>

        {/* Related Posts Skeleton */}
        <section className={styles.relatedSkeleton}>
          <div
            className={`${styles.relatedTitleSkeleton} ${styles.shimmer}`}
          ></div>
          <div className={styles.relatedGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.relatedCard}>
                <div
                  className={`${styles.relatedImage} ${styles.shimmer}`}
                ></div>
                <div className={styles.relatedCardContent}>
                  <div
                    className={`${styles.relatedCategory} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.relatedCardTitle} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.relatedCardTitle} ${styles.relatedCardTitleShort} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.relatedMeta} ${styles.shimmer}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
