import Link from "next/link";
import Image from "next/image";
import { stripHtml } from "@/lib/format";
import styles from "./AuthorBox.module.css";

interface AuthorBoxProps {
  author: {
    name: string;
    slug: string;
    description?: string | null;
    avatar?: string | null;
  };
  /** "O autoru" (home) or "Autor" (article). */
  label?: string;
  variant?: "home" | "article";
  /** Heading id (home variant); override if rendered more than once. */
  id?: string;
}

export default function AuthorBox({
  author,
  label,
  variant = "home",
  id = "author-box-title",
}: AuthorBoxProps) {
  const text = label ?? (variant === "home" ? "O autoru" : "Autor");
  const href = `/authors/${author.slug}`;
  const bio = stripHtml(author.description);

  const avatar = (
    <div className={styles.avatar} aria-hidden="true">
      {author.avatar && (
        <Image
          src={author.avatar}
          alt=""
          fill
          sizes="96px"
          unoptimized
          className={styles.avatarImg}
        />
      )}
    </div>
  );

  if (variant === "article") {
    return (
      <aside
        className={`${styles.box} ${styles.article}`}
        aria-label="O autoru"
      >
        <div className={styles.head}>
          {avatar}
          <div className={styles.titles}>
            <span className={styles.label}>{text}</span>
            <Link href={href} className={styles.nameLink}>
              {author.name}
            </Link>
          </div>
        </div>
        {bio && <p className={styles.bio}>{bio}</p>}
      </aside>
    );
  }

  return (
    <section className={`${styles.box} ${styles.home}`} aria-labelledby={id}>
      <div className={styles.head}>
        {avatar}
        <div className={styles.titles}>
          <h2 id={id} className={styles.label}>
            {text}
          </h2>
          <p className={styles.name}>{author.name}</p>
        </div>
      </div>
      {bio && <p className={styles.bio}>{bio}</p>}
      <Link href={href} className={styles.button}>
        Svi autorovi članci
      </Link>
    </section>
  );
}
