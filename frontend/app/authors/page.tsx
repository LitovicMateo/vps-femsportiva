import { fetchAuthorsAPI, fetchPostsAPI } from "@/lib/api";
import AuthorCard from "@/components/author/AuthorCard";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Autori",
  description: "Upoznajte sve autore koji doprinose našem blogu",
  openGraph: {
    title: "Autori",
    description: "Upoznajte sve autore koji doprinose našem blogu",
    type: "website",
    url: "/authors",
  },
  twitter: {
    card: "summary",
    title: "Autori",
    description: "Upoznajte sve autore koji doprinose našem blogu",
  },
};

export default async function AuthorsPage() {
  const authors = await fetchAuthorsAPI();

  // Get post count for each author
  const authorsWithCounts = await Promise.all(
    authors.map(async (author: any) => {
      const data = await fetchPostsAPI({ author: author.id, perPage: 1 });
      return {
        author,
        postCount: data.pagination?.total || 0,
      };
    }),
  );

  // Filter authors with at least one post and sort by last name
  const activeAuthors = authorsWithCounts
    .filter(({ postCount }) => postCount > 0)
    .sort((a, b) => {
      // Extract last name (last word in the name)
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };

      const lastNameA = getLastName(a.author.name);
      const lastNameB = getLastName(b.author.name);

      return lastNameA.localeCompare(lastNameB);
    });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Autori",
    description: "Upoznajte sve autore koji doprinose našem blogu",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/authors`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: activeAuthors.length,
      itemListElement: activeAuthors.map(
        ({ author, postCount }: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: author.name,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${author.slug}`,
            image: author.avatar_urls ? author.avatar_urls["96"] : undefined,
          },
        }),
      ),
    },
  };

  return (
    <div className={styles.container}>
      <StructuredData data={structuredData} />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backLink}>
            ← Povratak na početnu
          </Link>
          <h1 className={styles.title}>Autori</h1>
          <p className={styles.subtitle}>Upoznajte pisce iza priča</p>
        </div>
      </header>

      <main className={styles.main}>
        {activeAuthors.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Nema pronađenih autora.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {activeAuthors.map(({ author, postCount }: any) => (
              <AuthorCard
                key={author.id}
                author={author}
                postCount={postCount}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
