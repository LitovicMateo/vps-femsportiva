import { fetchPostBySlug, fetchRelatedPosts } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: { category: string; slug: string };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await fetchPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Verify the post is in the correct category
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const postCategory = categories.find(
    (cat) => cat.slug === resolvedParams.category
  );

  if (!postCategory) {
    notFound();
  }

  const author = post._embedded?.author?.[0];
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
  const tags = post.tags || [];

  // Fetch related posts based on tags
  const relatedPosts = await fetchRelatedPosts(post.id, tags, 3);

  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/${resolvedParams.category}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
          >
            ← Back to {postCategory.name}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {featuredImage && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={featuredImage}
                alt={post.title.rendered}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 lg:p-12">
            {/* Category Badge */}
            <Link
              href={`/${resolvedParams.category}`}
              className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wide mb-4"
            >
              {postCategory.name}
            </Link>

            {/* Title */}
            <h1
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Meta */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              {author && (
                <div className="flex items-center gap-3">
                  {author.avatar_urls && (
                    <img
                      src={author.avatar_urls["48"]}
                      alt={author.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{author.name}</p>
                    <time
                      dateTime={post.date}
                      className="text-sm text-gray-500"
                    >
                      {date}
                    </time>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Tags */}
            {post._embedded?.["wp:term"]?.[1] &&
              post._embedded["wp:term"][1].length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post._embedded["wp:term"][1].map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} My Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
