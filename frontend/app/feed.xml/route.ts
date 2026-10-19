import { fetchPosts, fetchSiteInfo } from "@/lib/wordpress";

export async function GET() {
  try {
    // Fetch settings directly from WordPress (avoid self-fetch loop)
    const siteInfo = await fetchSiteInfo();

    // Get RSS settings
    const rssTitle = siteInfo?.name ? `${siteInfo.name} RSS Feed` : "RSS Feed";
    const rssDescription = siteInfo?.description || "Latest posts";
    const itemCount = 20;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Fetch recent posts
    const postsData = await fetchPosts({ perPage: itemCount });
    const posts = postsData.posts || [];

    // Build RSS XML
    const rssItems = posts
      .map((post) => {
        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const postUrl = `${siteUrl}/${categories[0]?.slug || "uncategorized"}/${post.slug}`;
        const author = post._embedded?.author?.[0]?.name || "Unknown";
        const featuredImage =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

        return `
    <item>
      <title><![CDATA[${post.title.rendered}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt.rendered.replace(/<[^>]*>/g, "")}]]></description>
      <content:encoded><![CDATA[${post.content.rendered}]]></content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${author}]]></dc:creator>
      ${categories.map((cat: { name: string }) => `<category><![CDATA[${cat.name}]]></category>`).join("\n      ")}
      ${featuredImage ? `<media:content url="${featuredImage}" medium="image" />` : ""}
    </item>`;
      })
      .join("\n");

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${rssTitle}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${rssDescription}]]></description>
    <language>hr-HR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("RSS Feed Error:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
