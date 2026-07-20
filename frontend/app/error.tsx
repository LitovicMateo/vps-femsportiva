"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

/**
 * Route-segment error boundary. Catches render/data errors so a WordPress
 * outage (which the data layer surfaces as thrown errors / empty content)
 * shows a real error page with a retry, instead of a blank or broken render.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] Route error:", error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Ups!</h1>
        <h2 className={styles.subtitle}>Nešto je pošlo po zlu</h2>
        <p className={styles.message}>
          Došlo je do pogreške pri učitavanju sadržaja. Pokušajte ponovno.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className={styles.button} onClick={() => reset()}>
            Pokušaj ponovno
          </button>
          <Link href="/" className={styles.button}>
            Povratak na početnu
          </Link>
        </div>
      </div>
    </div>
  );
}
