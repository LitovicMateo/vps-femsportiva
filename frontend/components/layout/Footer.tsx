import Image from "next/image";
import Link from "next/link";
import { fetchCategories } from "@/lib/wordpress";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/site";
import { FOOTER_PAGES, RSS_URL, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/site";
import ConsentSettingsButton from "@/components/seo/ConsentSettingsButton";
import styles from "./Footer.module.css";

const EXCLUDED_SLUGS = new Set(["uncategorized", "nekategorizirano"]);
const MAX_CATEGORIES = 6;

export default async function Footer() {
  const categories = (await fetchCategories())
    .filter(
      (cat) =>
        !EXCLUDED_SLUGS.has(cat.slug) && !HIDDEN_CATEGORY_SLUGS.has(cat.slug),
    )
    .slice(0, MAX_CATEGORIES);

  const hasPages = FOOTER_PAGES.length > 0;
  const columns = hasPages ? 3 : 2;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div
          className={styles.grid}
          style={{ "--footer-cols": columns } as React.CSSProperties}
        >
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo-wordmark-dark.svg"
                alt="Femsportiva"
                width={650}
                height={440}
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>{SITE_TAGLINE}</p>
          </div>

          {categories.length > 0 && (
            <nav
              aria-label="Kategorije u podnožju"
              className={`${styles.nav} ${hasPages ? "" : styles.catsWide}`}
            >
              <h2 className={styles.heading}>Kategorije</h2>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className={styles.link}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}

          {hasPages && (
            <nav aria-label="Informacije" className={styles.nav}>
              <h2 className={styles.heading}>Stranice</h2>
              {FOOTER_PAGES.map((page) => (
                <Link key={page.href} href={page.href} className={styles.link}>
                  {page.label}
                </Link>
              ))}
            </nav>
          )}

          <nav
            aria-label="Društvene mreže"
            className={`${styles.nav} ${styles.social}`}
          >
            <h2 className={`${styles.heading} ${styles.socialHeading}`}>
              Pratite nas
            </h2>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.pill}`}
              >
                {s.label}
              </a>
            ))}
            <a href={RSS_URL} className={`${styles.link} ${styles.pill}`}>
              RSS
            </a>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} Femsportiva. Sva prava pridržana.
          </span>
          <span className={styles.bottomLinks}>
            <ConsentSettingsButton className={styles.topLink} />
            <a href="#" className={styles.topLink}>
              Natrag na vrh ↑
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
