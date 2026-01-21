import PostCard from "@/components/post/PostCard";
import styles from "./FeaturedSidebar.module.css";

interface FeaturedSidebarProps {
  featuredPost?: any;
}

export default function FeaturedSidebar({
  featuredPost,
}: FeaturedSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {featuredPost && (
        <div className={styles.sidebarSection}>
          <h2>Istaknut Članak</h2>
          <PostCard post={featuredPost} featured />
        </div>
      )}

      <div className={styles.sidebarSection}>
        <div className={styles.aboutCard}>
          <h2>O nama</h2>
          <p>
            Dobrodošli na moj blog! Ovdje dijelim svoje misli, ideje i iskustva
            o raznim temama.
          </p>
        </div>
      </div>
    </aside>
  );
}
