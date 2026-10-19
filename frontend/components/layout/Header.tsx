"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import MobileMenu from "./MobileMenu";
import styles from "./Header.module.css";

export interface HeaderCategory {
  name: string;
  slug: string;
  count: number;
}

interface HeaderProps {
  categories?: HeaderCategory[];
}

const DESKTOP_VISIBLE = 6;
const MENU_ANIM_MS = 150; // keep in sync with MobileMenu.module.css

const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const Logo = ({ className }: { className?: string }) => (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/logo-wordmark.svg"
      alt="Femsportiva – naslovnica"
      className={`${styles.logo} ${styles.logoLight} ${className ?? ""}`}
    />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/logo-wordmark-dark.svg"
      alt="Femsportiva – naslovnica"
      className={`${styles.logo} ${styles.logoDark} ${className ?? ""}`}
    />
  </>
);

const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState<false | "search" | "close">(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tabletSearchOpen, setTabletSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hidden, setHidden] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close everything on route change (adjust state during render)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setDropdownOpen(false);
    setTabletSearchOpen(false);
  }

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobSearchRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const tabSearchBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const visible = sorted.slice(0, DESKTOP_VISIBLE);
  const more = sorted.slice(DESKTOP_VISIBLE);

  const isCategoryActive = (slug: string) =>
    pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  const homeActive = pathname === "/";
  const moreActive = more.some((c) => isCategoryActive(c.slug));

  // Keep the header visible while any overlay is open
  const locked = menuOpen || dropdownOpen || tabletSearchOpen;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (locked || y < 100 || y < lastScrollY.current) {
        setHidden(false);
      } else if (y > lastScrollY.current) {
        setHidden(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [locked]);

  // Dropdown: outside click + Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        moreBtnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen]);

  // Menu is mobile-only: close if viewport grows past the mobile breakpoint
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [menuOpen]);

  useEffect(() => {
    if (tabletSearchOpen) tabletInputRef.current?.focus();
  }, [tabletSearchOpen]);

  useEffect(() => {
    if (!tabletSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTabletSearchOpen(false);
        tabSearchBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tabletSearchOpen]);

  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Play the exit animation, then unmount
  const closeMenu = useCallback(() => {
    setMenuClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, MENU_ANIM_MS);
  }, []);

  const openMenu = (mode: "search" | "close") => {
    clearTimeout(closeTimer.current);
    setMenuClosing(false);
    setMenuOpen(mode);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q.length >= 3) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchTerm("");
      setTabletSearchOpen(false);
    }
  };

  const searchDisabled = searchTerm.trim().length < 3;

  const searchForm = (id: string, className: string) => (
    <form role="search" onSubmit={submitSearch} className={className}>
      <label htmlFor={id} className={styles.srOnly}>
        Pretraži članke
      </label>
      <input
        id={id}
        ref={id === "q-tablet" ? tabletInputRef : undefined}
        type="search"
        placeholder="Pretraži članke"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <button
        type="submit"
        className={styles.searchSubmit}
        aria-label="Traži"
        disabled={searchDisabled}
      >
        <SearchIcon size={16} />
      </button>
    </form>
  );

  return (
    <header className={`${styles.header} ${hidden ? styles.hidden : ""}`}>
      <div className={styles.bar}>
        <button
          ref={hamburgerRef}
          type="button"
          className={styles.hamburger}
          aria-label={menuOpen && !menuClosing ? "Zatvori izbornik" : "Otvori izbornik"}
          aria-haspopup="dialog"
          aria-expanded={menuOpen !== false}
          onClick={() => (menuOpen && !menuClosing ? closeMenu() : openMenu("close"))}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d={menuOpen && !menuClosing ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>

        <Link href="/" className={styles.brand}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Kategorije" className={styles.deskNav}>
          <ul className={styles.deskList}>
            <li>
              <Link
                href="/"
                className={`${styles.navLink} ${homeActive ? styles.active : ""}`}
                aria-current={homeActive ? "page" : undefined}
              >
                Naslovnica
              </Link>
            </li>
            {visible.map((c) => {
              const active = isCategoryActive(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className={`${styles.navLink} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
            {more.length > 0 && (
              <li
                className={styles.dropdown}
                ref={dropdownRef}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setDropdownOpen(false);
                  }
                }}
              >
                <button
                  ref={moreBtnRef}
                  type="button"
                  className={`${styles.navLink} ${styles.moreBtn} ${moreActive ? styles.active : ""}`}
                  aria-expanded={dropdownOpen}
                  aria-controls="nav-more"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  Više
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <ul id="nav-more" className={styles.dropdownMenu}>
                    {more.map((c) => {
                      const active = isCategoryActive(c.slug);
                      return (
                        <li key={c.slug}>
                          <Link
                            href={`/${c.slug}`}
                            className={`${styles.dropdownItem} ${active ? styles.dropdownActive : ""}`}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setDropdownOpen(false)}
                          >
                            {c.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {searchForm("q-desktop", styles.deskSearch)}

        {/* Tablet search toggle */}
        <button
          ref={tabSearchBtnRef}
          type="button"
          className={styles.tabSearchBtn}
          aria-label="Pretraži"
          aria-expanded={tabletSearchOpen}
          onClick={() => setTabletSearchOpen((o) => !o)}
        >
          <SearchIcon />
        </button>

        {/* Mobile search: opens menu with search focused */}
        <button
          ref={mobSearchRef}
          type="button"
          className={styles.mobSearchBtn}
          aria-label="Pretraži"
          aria-haspopup="dialog"
          onClick={() => openMenu("search")}
        >
          <SearchIcon size={20} />
        </button>

        <button
          type="button"
          className={styles.themeBtn}
          aria-label="Promijeni temu"
          onClick={toggleTheme}
        >
          <svg
            className={styles.iconMoon}
            width="18"
            height="18"
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
            width="18"
            height="18"
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
      </div>

      {/* Tablet inline search row */}
      {tabletSearchOpen && (
        <div className={styles.tabSearchRow}>
          {searchForm("q-tablet", styles.tabSearch)}
        </div>
      )}

      {/* Tablet category nav */}
      <nav aria-label="Kategorije" className={styles.tabNav}>
        <ul className={styles.tabList}>
          <li>
            <Link
              href="/"
              className={`${styles.tabLink} ${homeActive ? styles.tabActive : ""}`}
              aria-current={homeActive ? "page" : undefined}
            >
              Naslovnica
            </Link>
          </li>
          {sorted.map((c) => {
            const active = isCategoryActive(c.slug);
            return (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className={`${styles.tabLink} ${active ? styles.tabActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {menuOpen && (
        <MobileMenu
          categories={sorted}
          pathname={pathname}
          initialFocus={menuOpen}
          returnFocusRef={menuOpen === "search" ? mobSearchRef : hamburgerRef}
          closing={menuClosing}
          onClose={closeMenu}
        />
      )}
    </header>
  );
};

export default Header;
