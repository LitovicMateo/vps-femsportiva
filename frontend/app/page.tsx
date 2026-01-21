import {
  fetchPostsAPI,
  fetchSiteSettingsAPI,
  fetchCategoriesAPI,
  fetchPostsByCategoryAPI,
} from "@/lib/api";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import RecentNewsSection from "@/components/home/RecentNewsSection";
import CategorySection from "@/components/home/CategorySection";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettingsAPI();

  return {
    title: settings.siteTitle || "Početna",
    description:
      settings.siteDescription || "Blog o tehnologiji, razvoju i životu",
    keywords: [
      "blog",
      "tehnologija",
      "razvoj",
      ...(settings.siteKeywords || []),
    ],
    openGraph: {
      title: settings.siteTitle || "Moj Veličanstven Blog",
      description:
        settings.siteDescription || "Blog o tehnologiji, razvoju i životu",
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle || "Moj Veličanstven Blog",
      description:
        settings.siteDescription || "Blog o tehnologiji, razvoju i životu",
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

  // Get posts for pagination
  // Only exclude hero if it has a featured image (otherwise it won't be displayed)
  // Only exclude featured if it's sticky (otherwise it's just a duplicate)
  const excludeIds: number[] = [];
  if (hasHeroImage && heroPost?.id) {
    excludeIds.push(heroPost.id);
  }
  if (
    featuredPost?.sticky &&
    featuredPost?.id &&
    featuredPost.id !== heroPost?.id
  ) {
    excludeIds.push(featuredPost.id);
  }

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
    name: settings.siteTitle || "Moj Veličanstven Blog",
    description:
      settings.siteDescription || "Blog o tehnologiji, razvoju i životu",
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
        <RecentNewsSection
          posts={postsForPagination}
          featuredPost={featuredPost}
        />

        {/* Category Sections */}
        {topCategories.map((category: any, index: number) => (
          <CategorySection
            key={category.id}
            category={category}
            posts={categoryPostsResults[index]?.posts || []}
          />
        ))}
      </main>

      <Footer />
    </div>
  );
}
