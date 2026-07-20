import Link from "next/link";
import Image from "next/image";
import { WP_REST_API_User } from "@/types/wordpress";
import styles from "./AuthorCard.module.css";

interface AuthorCardProps {
  author: WP_REST_API_User;
  postCount?: number;
}

function slugifyAuthorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export default function AuthorCard({ author, postCount }: AuthorCardProps) {
  const authorSlug = author.slug || slugifyAuthorName(author.name);

  return (
    <Link href={`/authors/${authorSlug}`} className={styles.card}>
      <div className={styles.content}>
        {author.avatar_urls && (
          <Image
            src={author.avatar_urls["96"]}
            alt={author.name}
            width={64}
            height={64}
            className={styles.avatar}
            unoptimized
          />
        )}
        <div className={styles.info}>
          <h3 className={styles.name}>{author.name}</h3>
          {postCount !== undefined && (
            <p className={styles.meta}>
              {postCount} {postCount === 1 ? "objava" : "objava"}
            </p>
          )}
          {author.description && (
            <p className={styles.description}>{author.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export { slugifyAuthorName };
