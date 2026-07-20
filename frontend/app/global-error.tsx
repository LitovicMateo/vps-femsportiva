"use client";

import { useEffect } from "react";

/**
 * Root error boundary — only fires when the root layout itself throws, so it
 * must render its own <html>/<body>. Kept dependency-free and inline-styled
 * because no layout (and therefore no global CSS) is guaranteed here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] Root error:", error);
  }, [error]);

  return (
    <html lang="hr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Ups!</h1>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>
            Došlo je do neočekivane pogreške.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.6rem 1.25rem",
              border: "none",
              borderRadius: "6px",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Pokušaj ponovno
          </button>
        </div>
      </body>
    </html>
  );
}
