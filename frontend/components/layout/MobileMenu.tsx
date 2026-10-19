"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RSS_URL, SOCIAL_LINKS } from "@/lib/site";
import { useTheme } from "@/lib/ThemeContext";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  categories: { name: string; slug: string; count: number }[];
  pathname: string;
  initialFocus: "search" | "close";
  returnFocusRef: React.RefObject<HTMLElement | null>;
  /** Plays the exit animation; the parent unmounts once it has finished. */
  closing?: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileMenu({
  categories,
  pathname,
  initialFocus,
  returnFocusRef,
  closing = false,
  onClose,
}: MobileMenuProps) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Remember which control opened the menu (search icon focuses the input)
  useEffect(() => {
    (initialFocus === "search" ? inputRef.current : dialogRef.current)?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const returnTarget = returnFocusRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      returnTarget?.focus();
    };
  }, [returnFocusRef, initialFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 3) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setQuery("");
      onClose();
    }
  };

  const isActive = (slug: string) =>
    pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);

  return createPortal(
    <div
      ref={dialogRef}
      className={`${styles.menu} ${closing ? styles.closing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Izbornik"
      tabIndex={-1}
    >
      <div className={styles.body}>
        <form role="search" className={styles.search} onSubmit={submit}>
          <label htmlFor="q-mobile" className={styles.srOnly}>
            Pretraži članke
          </label>
          <input
            id="q-mobile"
            ref={inputRef}
            type="search"
            placeholder="Pretraži članke"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button
            type="submit"
            className={styles.searchSubmit}
            aria-label="Traži"
            disabled={query.trim().length < 3}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </form>

        <nav aria-label="Kategorije">
          <ul className={styles.list}>
            <li>
              <Link
                href="/"
                className={`${styles.row} ${pathname === "/" ? styles.rowActive : ""}`}
                aria-current={pathname === "/" ? "page" : undefined}
                onClick={onClose}
              >
                Naslovnica
              </Link>
            </li>
            {categories.map((c) => {
              const active = isActive(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className={`${styles.row} ${active ? styles.rowActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                  >
                    {c.name}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.bottom}>
          <button type="button" className={styles.themeRow} onClick={toggleTheme}>
            <span className={styles.labelDark}>Tamna tema</span>
            <span className={styles.labelLight}>Svijetla tema</span>
            <svg
              className={styles.iconMoon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <svg
              className={styles.iconSun}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <nav aria-label="Društvene mreže" className={styles.social}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                {s.label}
              </a>
            ))}
            <a href={RSS_URL} className={styles.socialLink}>
              RSS
            </a>
          </nav>
        </div>
      </div>
    </div>,
    document.body,
  );
}
