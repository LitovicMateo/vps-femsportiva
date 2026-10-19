import { MetadataRoute } from "next";
import { getSiteUrl, isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  // Local/staging builds: block everything.
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        // Longest match wins: the allow entries re-open the OG image endpoint
        // and WordPress media (images) that the broader disallows would hide.
        allow: ["/", "/api/og", "/wp/wp-content/uploads/"],
        disallow: ["/api/", "/wp/", "/wp-json/", "/search"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
