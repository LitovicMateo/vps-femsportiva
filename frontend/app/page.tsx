import { fetchPosts } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export default async function Home() {
  const { posts } = await fetchPosts({ perPage: 10 });

  // Featured post is the first sticky post, or the most recent post
  const featuredPost = posts.find((p) => p.sticky) || posts[0];
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">My Blog</h1>
          <p className="mt-2 text-gray-600">Stories, ideas, and insights</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found.</p>
            <p className="text-gray-400 mt-2">
              Create your first post in WordPress admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Sidebar - 1/3 width */}
            <aside className="space-y-8">
              {featuredPost && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">
                    Featured Post
                  </h2>
                  <PostCard post={featuredPost} featured />
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">About</h2>
                <p className="text-gray-600 text-sm">
                  Welcome to my blog! Here I share my thoughts, ideas, and
                  experiences on various topics.
                </p>
              </div>
            </aside>
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
