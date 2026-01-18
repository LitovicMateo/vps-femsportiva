import { fetchPostsAPI, fetchSiteSettingsAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

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

export default async function Home() {
  const data = await fetchPostsAPI({ perPage: 10 });
  const posts = data.posts || [];
  const settings = await fetchSiteSettingsAPI();

  // Featured post is the first sticky post, or the most recent post
  const featuredPost = posts.find((p: any) => p.sticky) || posts[0];
  const regularPosts = posts.filter((p: any) => p.id !== featuredPost?.id);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: settings.siteTitle || "My Awesome Blog",
    description:
      settings.siteDescription ||
      "A blog about technology, development, and life",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    blogPost: posts.slice(0, 5).map((post: any) => ({
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
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No posts found.</p>
            <p className={styles.emptySubtitle}>
              Create your first post in WordPress admin.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Main Content - 2/3 width */}
            <div className={styles.mainContent}>
              {regularPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

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
        )}
      </main>

      <Footer />
    </div>
  );
}
