import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Stranica nije pronađena</h2>
        <p className={styles.message}>
          Stranica koju tražite ne postoji ili je premještena.
        </p>
        <Link href="/" className={styles.button}>
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
}
