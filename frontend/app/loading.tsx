import styles from "./loading.module.css";

const sh = `${styles.block} ${styles.shimmer}`;

export default function Loading() {
  return (
    <div className={styles.container} aria-busy="true">
      <main className={styles.main}>
        <div className={styles.hero}>
          <div>
            <div className={`${styles.leadImage} ${sh}`} />
            <div className={`${styles.line} ${styles.lineTitle} ${sh}`} />
            <div className={`${styles.line} ${styles.lineTitle} ${styles.short} ${sh}`} />
            <div className={`${styles.line} ${sh}`} />
          </div>
          <div className={styles.side}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.sideItem}>
                <div className={`${styles.thumb} ${sh}`} />
                <div className={styles.sideText}>
                  <div className={`${styles.line} ${sh}`} />
                  <div className={`${styles.line} ${styles.short} ${sh}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
