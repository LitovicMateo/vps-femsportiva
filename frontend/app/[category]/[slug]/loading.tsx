import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.main} aria-busy="true">
      <article className={styles.article}>
        <header className={styles.header}>
          <div className={`${styles.bar} ${styles.kicker}`} />
          <div className={`${styles.bar} ${styles.titleLine}`} />
          <div
            className={`${styles.bar} ${styles.titleLine} ${styles.short}`}
          />
          <div className={styles.byline}>
            <div className={`${styles.bar} ${styles.avatar}`} />
            <div className={`${styles.bar} ${styles.meta}`} />
          </div>
        </header>
        <div className={styles.figure}>
          <div className={`${styles.bar} ${styles.image}`} />
        </div>
        <div className={styles.body}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`${styles.bar} ${styles.line} ${i % 3 === 2 ? styles.short : ""}`}
            />
          ))}
        </div>
      </article>
    </main>
  );
}
