import Link from "next/link";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  title: string;
  /** Optional right-hand link. */
  href?: string;
  linkLabel?: string;
  /** Shown instead of linkLabel below 768px. */
  shortLinkLabel?: string;
  linkAriaLabel?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}

export default function SectionHeading({
  title,
  href,
  linkLabel = "Svi članci →",
  shortLinkLabel,
  linkAriaLabel,
  as: Heading = "h2",
  id,
}: SectionHeadingProps) {
  return (
    <div className={styles.wrap}>
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {href && (
        <Link href={href} className={styles.link} aria-label={linkAriaLabel}>
          {shortLinkLabel ? (
            <>
              <span className={styles.full}>{linkLabel}</span>
              <span className={styles.short}>{shortLinkLabel}</span>
            </>
          ) : (
            linkLabel
          )}
        </Link>
      )}
    </div>
  );
}
