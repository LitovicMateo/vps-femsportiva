import {
  fetchPostsAPI,
  fetchSiteSettingsAPI,
  fetchCategoriesAPI,
  fetchPostsByCategoryAPI,
} from "@/lib/api";
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import PaginatedPosts from "@/components/PaginatedPosts";
import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettingsAPI();

  return {
    title: settings.siteTitle || "Home",
    description:
      settings.siteDescription ||
      "A blog about technology, development, and life",
    keywords: [
      "blog",
      "technology",
      "development",
      ...(settings.siteKeywords || []),
    ],
    openGraph: {
      title: settings.siteTitle || "My Awesome Blog",
      description:
        settings.siteDescription ||
        "A blog about technology, development, and life",
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle || "My Awesome Blog",
      description:
        settings.siteDescription ||
        "A blog about technology, development, and life",
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const settings = await fetchSiteSettingsAPI();

  // Fetch 30 posts total: 1 for hero + 25 for pagination + extras for featured
  const initialData = await fetchPostsAPI({ perPage: 30 });
  const allPosts = initialData.posts || [];

  // Hero post is always the most recent post
  const heroPost = allPosts[0];
  const hasHeroImage =
    heroPost?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  // Featured post is the first sticky post, or the second post if hero has image
  const featuredPost =
    allPosts.find((p: any) => p.sticky) ||
    (hasHeroImage ? allPosts[1] : allPosts[0]);

  // Get posts for pagination (excluding hero and featured)
  const excludeIds = [heroPost?.id, featuredPost?.id].filter(Boolean);
  const postsForPagination = allPosts
    .filter((p: any) => !excludeIds.includes(p.id))
    .slice(0, 25); // Limit to 25 posts for pagination

  // Fetch top 3 categories by post count
  const allCategories = await fetchCategoriesAPI();
  const topCategories = allCategories
    .filter((cat: any) => cat.count > 0)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 3);

  // Fetch 3 posts for each category
  const categoryPostsPromises = topCategories.map((category: any) =>
    fetchPostsByCategoryAPI(category.slug, 1, 3),
  );
  const categoryPostsResults = await Promise.all(categoryPostsPromises);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: settings.siteTitle || "My Awesome Blog",
    description:
      settings.siteDescription ||
      "A blog about technology, development, and life",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    blogPost: postsForPagination.slice(0, 5).map((post: any) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${post.category?.slug || "uncategorized"}/${post.slug}`,
      datePublished: post.date,
      dateModified: post.modified,
      author: {
        "@type": "Person",
        name: post.author?.name || "Unknown",
      },
    })),
  };

  return (
    <div className={styles.container}>
      <StructuredData data={structuredData} />
      <main className={styles.main}>
        {/* Hero Section - Only on homepage with featured image */}
        {hasHeroImage && heroPost && <HeroSection post={heroPost} />}

        {/* Recent News Section - Paginated Posts with Sidebar */}
        {postsForPagination.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No posts found.</p>
            <p className={styles.emptySubtitle}>
              Create your first post in WordPress admin.
            </p>
          </div>
        ) : (
          <>
            <section id="recent-news" className={styles.recentNewsSection}>
              <h2 className={styles.sectionTitle}>Recent News</h2>

              <div className={styles.grid}>
                {/* Main Content - 2/3 width - Client-side paginated posts */}
                <PaginatedPosts posts={postsForPagination} perPage={5} />

                {/* Sidebar - 1/3 width */}
                <aside className={styles.sidebar}>
                  {featuredPost && (
                    <div className={styles.sidebarSection}>
                      <h2>Featured Post</h2>
                      <PostCard post={featuredPost} featured />
                    </div>
                  )}

                  <div className={styles.sidebarSection}>
                    <div className={styles.aboutCard}>
                      <h2>About</h2>
                      <p>
                        Welcome to my blog! Here I share my thoughts, ideas, and
                        experiences on various topics.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </section>
          </>
        )}

        {/* Category Sections */}
        {topCategories.map((category: any, index: number) => {
          const categoryPosts = categoryPostsResults[index]?.posts || [];

          if (categoryPosts.length === 0) return null;

          return (
            <section key={category.id} className={styles.categorySection}>
              <Link
                href={`/${category.slug}`}
                className={styles.categoryTitleLink}
              >
                <h2 className={styles.sectionTitle}>{category.name}</h2>
              </Link>

              <div className={styles.postsGrid}>
                {categoryPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
