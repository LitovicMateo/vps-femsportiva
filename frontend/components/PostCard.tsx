import Link from "next/link";
import { WP_REST_API_Post } from "@/types/wordpress";

interface PostCardProps {
  post: WP_REST_API_Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const author = post._embedded?.author?.[0]?.name || "Unknown";
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const title = post.title?.rendered || `Post ${post.id}`;
  const excerpt = post.excerpt?.rendered || "";
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const primaryCategory = categories[0];

  // Get category slug for URL
  const categorySlug = primaryCategory?.slug || "uncategorized";

  if (featured) {
    return (
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {featuredImage && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          {primaryCategory && (
            <Link
              href={`/${categorySlug}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
            >
              {primaryCategory.name}
            </Link>
          )}
          <Link href={`/${categorySlug}/${post.slug}`}>
            <h2
              className="text-2xl font-bold mt-2 mb-3 hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>
          <div
            className="text-gray-600 mb-4 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
          <div className="flex items-center text-sm text-gray-500">
            <span>{author}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.date}>{date}</time>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex gap-4">
        {featuredImage && (
          <Link
            href={`/${categorySlug}/${post.slug}`}
            className="flex-shrink-0"
          >
            <img
              src={featuredImage}
              alt={title}
              className="w-32 h-24 object-cover rounded"
            />
          </Link>
        )}
        <div className="flex-1">
          {primaryCategory && (
            <Link
              href={`/${categorySlug}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
            >
              {primaryCategory.name}
            </Link>
          )}
          <Link href={`/${categorySlug}/${post.slug}`}>
            <h3
              className="text-lg font-semibold mt-1 mb-2 hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Link>
          <div className="flex items-center text-sm text-gray-500">
            <span>{author}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.date}>{date}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
