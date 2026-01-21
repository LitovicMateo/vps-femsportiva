import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.content}>
          © {new Date().getFullYear()} Moj Blog. Sva prava pridržana.
        </p>
      </div>
    </footer>
  );
}
