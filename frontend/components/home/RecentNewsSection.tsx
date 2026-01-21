import PaginatedPosts from "@/components/post/PaginatedPosts";
import FeaturedSidebar from "./FeaturedSidebar";
import styles from "./RecentNewsSection.module.css";

interface RecentNewsSectionProps {
  posts: any[];
  featuredPost?: any;
}

export default function RecentNewsSection({
  posts,
  featuredPost,
}: RecentNewsSectionProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Nema pronađenih objava.</p>
        <p className={styles.emptySubtitle}>
          Napravite svoju prvu objavu u WordPress administraciji.
        </p>
      </div>
    );
  }

  return (
    <section id="recent-news" className={styles.recentNewsSection}>
      <h2 className={styles.sectionTitle}>Najnovije Vijesti</h2>

      <div className={styles.grid}>
        {/* Main Content - 2/3 width - Client-side paginated posts */}
        <PaginatedPosts posts={posts} perPage={5} />

        {/* Sidebar - 1/3 width */}
        <FeaturedSidebar featuredPost={featuredPost} />
      </div>
    </section>
  );
}
