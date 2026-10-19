import {
  fetchPostsAPI,
  fetchSiteSettingsAPI,
  fetchCategoriesAPI,
  fetchPostsByCategoryAPI,
} from "@/lib/api";
import StructuredData from "@/components/seo/StructuredData";
import ArticleCard from "@/components/post/ArticleCard";
import SectionHeading from "@/components/post/SectionHeading";
import AuthorBox from "@/components/author/AuthorBox";
import { getAuthor, stripHtml } from "@/lib/format";
import { getPrimaryCategorySlug } from "@/lib/utils";
import { DEFAULT_OG_IMAGE, absoluteUrl, getSiteUrl } from "@/lib/seo";
import {
  HIDDEN_CATEGORY_SLUGS,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";
import styles from "./page.module.css";
import type { Metadata } from "next";
import type { WP_REST_API_Post, WP_REST_API_Category } from "@/types/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettingsAPI();
  const siteName = settings.siteTitle || SITE_NAME;
  const description = settings.siteDescription || SITE_DESCRIPTION;
  const title = `${siteName} – vijesti i priče iz ženskog sporta`;
  const image = { url: DEFAULT_OG_IMAGE, width: 1200, height: 630 };

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function Home() {
  const [settings, initialData, allCategories] = await Promise.all([
    fetchSiteSettingsAPI(),
    fetchPostsAPI({ perPage: 30 }),
    fetchCategoriesAPI(),
  ]);
  // Posts in hidden categories stay reachable by URL/search but not on the homepage.
  const allPosts: WP_REST_API_Post[] = (initialData.posts || []).filter(
    (post: WP_REST_API_Post) =>
      !(post._embedded?.["wp:term"]?.[0] || []).some((term) =>
        HIDDEN_CATEGORY_SLUGS.has(term.slug),
      ),
  );

  // Lead = first sticky post, else the newest post.
  const leadPost = allPosts.find((p) => p.sticky) || allPosts[0];
  const rest = allPosts.filter((p) => p.id !== leadPost?.id);
  const featuredPosts = rest.slice(0, 3);
  const latestPosts = rest.slice(3, 11);

  const topCategories = allCategories
    .filter(
      (cat: WP_REST_API_Category) =>
        cat.count > 0 && !HIDDEN_CATEGORY_SLUGS.has(cat.slug),
    )
    .sort(
      (a: WP_REST_API_Category, b: WP_REST_API_Category) => b.count - a.count,
    )
    .slice(0, 3);

  const categoryPostsResults = await Promise.all(
    topCategories.map((category: WP_REST_API_Category) =>
      fetchPostsByCategoryAPI(category.slug, 1, 3),
    ),
  );

  const leadAuthor = leadPost ? getAuthor(leadPost) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: settings.siteTitle || SITE_NAME,
    description: settings.siteDescription || SITE_DESCRIPTION,
    url: getSiteUrl(),
    inLanguage: "hr",
    blogPost: [leadPost, ...featuredPosts, ...latestPosts]
      .filter(Boolean)
      .slice(0, 5)
      .map((post: WP_REST_API_Post) => ({
        "@type": "BlogPosting",
        headline: stripHtml(post.title?.rendered),
        url: absoluteUrl(`/${getPrimaryCategorySlug(post)}/${post.slug}`),
        datePublished: post.date,
        dateModified: post.modified,
        author: post._embedded?.author?.[0]?.name
          ? { "@type": "Person", name: post._embedded.author[0].name }
          : undefined,
      })),
  };

  return (
    <main className={styles.main}>
      <StructuredData data={structuredData} />

      {leadPost && (
        <section
          aria-label="Izdvojeno"
          className={`${styles.hero} ${featuredPosts.length === 0 ? styles.heroSolo : ""}`}
        >
          <ArticleCard
            post={leadPost}
            variant="lead"
            headingLevel="h1"
            priority
          />
          {featuredPosts.length > 0 && (
            <div className={styles.featured}>
              <h2 className={styles.featuredTitle}>Izdvojeno</h2>
              <div className={styles.featuredList}>
                {featuredPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    variant="compact"
                    headingLevel="h3"
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {latestPosts.length > 0 && (
        <section
          aria-labelledby="home-latest"
          className={`${styles.section} ${styles.latest}`}
        >
          <SectionHeading id="home-latest" title="Najnovije" />
          <div className={styles.latestGrid}>
            {latestPosts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                variant="grid"
                imageRatio="4/3"
                mobileList
              />
            ))}
          </div>
        </section>
      )}

      {topCategories.map((category: WP_REST_API_Category, index: number) => {
        const posts: WP_REST_API_Post[] =
          categoryPostsResults[index]?.posts || [];
        if (posts.length === 0) return null;
        const id = `home-cat-${category.slug}`;
        return (
          <section
            key={category.id}
            aria-labelledby={id}
            className={`${styles.section} ${styles.cat}`}
          >
            <SectionHeading
              id={id}
              title={category.name}
              href={`/${category.slug}`}
              linkLabel="Sve iz kategorije →"
              shortLinkLabel="Sve →"
              linkAriaLabel={`Sve iz kategorije ${category.name}`}
            />
            <div
              className={styles.categoryRow}
              role="region"
              aria-label={`${category.name} – članci`}
              tabIndex={0}
            >
              {posts.slice(0, 3).map((post) => (
                <ArticleCard key={post.id} post={post} variant="row" />
              ))}
            </div>
          </section>
        );
      })}

      {leadAuthor && (
        <AuthorBox author={leadAuthor} variant="home" label="O autoru" />
      )}
    </main>
  );
}
