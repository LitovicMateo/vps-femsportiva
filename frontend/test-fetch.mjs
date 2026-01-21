// Quick test script to debug fetching
const API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://wordpress/wp-json";

async function testFetch() {
  const queryParams = new URLSearchParams();
  queryParams.append("_embed", "true");
  queryParams.append("per_page", "30");

  const root = /\/wp-json\/?$/.test(API_BASE)
    ? API_BASE.replace(/\/wp-json\/?$/, "")
    : API_BASE.replace(/\/$/, "");

  const urls = [];
  urls.push(
    `${root}/index.php?rest_route=/wp/v2/posts&${queryParams.toString()}`,
  );
  urls.push(`${root}/wp-json/wp/v2/posts?${queryParams.toString()}`);
  urls.push(`${API_BASE}/wp/v2/posts?${queryParams.toString()}`);

  console.log("Testing URLs:");
  console.log("API_BASE:", API_BASE);
  console.log("root:", root);
  console.log("URLs to try:", urls);

  for (const url of urls) {
    try {
      console.log(`\nTrying: ${url}`);
      const res = await fetch(url, { cache: "no-store" });
      console.log(`Status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) continue;

      const posts = await res.json();
      const total = parseInt(res.headers.get("X-WP-Total") || "0");
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");

      console.log(`Success! Got ${posts.length} posts, total: ${total}, pages: ${totalPages}`);
      if (Array.isArray(posts)) {
        console.log("First post:", posts[0]?.title?.rendered || "No title");
        return { posts, total, totalPages };
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }

  console.log("\nAll URLs failed, returning empty");
  return { posts: [], total: 0, totalPages: 0 };
}

testFetch().then(result => {
  console.log("\nFinal result:", result.posts.length, "posts");
}).catch(console.error);
