import styles from "./loading.module.css";

const sh = `${styles.block} ${styles.shimmer}`;

export default function Loading() {
  return (
    <div className={styles.container} aria-busy="true">
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={`${styles.title} ${sh}`} />
          <div className={`${styles.desc} ${sh}`} />
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className={`${styles.image} ${sh}`} />
              <div className={`${styles.line} ${styles.lineTitle} ${sh}`} />
              <div className={`${styles.line} ${styles.short} ${sh}`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
