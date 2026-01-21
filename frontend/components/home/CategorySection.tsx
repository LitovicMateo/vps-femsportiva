import Link from "next/link";
import PostCard from "@/components/post/PostCard";
import styles from "./CategorySection.module.css";

interface CategorySectionProps {
  category: any;
  posts: any[];
}

export default function CategorySection({
  category,
  posts,
}: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.categorySection}>
      <Link href={`/${category.slug}`} className={styles.categoryTitleLink}>
        <h2 className={styles.sectionTitle}>{category.name}</h2>
      </Link>

      <div className={styles.postsGrid}>
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
