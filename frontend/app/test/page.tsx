import { fetchPosts } from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TestPage() {
  console.log("[Test Page] Starting fetch...");
  
  const result = await fetchPosts({ perPage: 10 });
  
  console.log("[Test Page] Result:", result);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>WordPress Connection Test</h1>
      <p>Total posts: {result.total}</p>
      <p>Posts array length: {result.posts.length}</p>
      
      {result.posts.length > 0 ? (
        <div>
          <h2>Posts:</h2>
          <ul>
            {result.posts.map((post: any) => (
              <li key={post.id}>{post.title?.rendered || "No title"}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: "red" }}>No posts found!</p>
      )}
      
      <details style={{ marginTop: "2rem" }}>
        <summary>Raw Data</summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  );
}
